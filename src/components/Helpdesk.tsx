"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getSupabase, useUser } from "@/lib/supabase";
import {
  AlertCircle,
  BookOpen,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  ExternalLink,
  FileText,
  GraduationCap,
  Home,
  Info,
  Library,
  RotateCcw,
  SendHorizontal,
  SquarePen,
  Trash2,
  type LucideIcon,
} from "lucide-react";

interface Source {
  id: string;
  category: string;
  origin: "sample" | "website";
  text: string;
  url: string | null;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
  category?: string;
  answerable?: boolean;
  sources?: Source[];
}

const CATEGORIES: { label: string; icon: LucideIcon; question: string }[] = [
  { label: "Academics", icon: GraduationCap, question: "Whom should I contact for academic problems?" },
  { label: "Attendance", icon: CalendarCheck, question: "What is the attendance requirement?" },
  { label: "Examinations", icon: ClipboardList, question: "Where can I find the examination timetable?" },
  { label: "Placements", icon: Briefcase, question: "Whom should I contact for placement training?" },
  { label: "Library", icon: Library, question: "How can I access library resources?" },
  { label: "Hostel", icon: Home, question: "How can I raise a hostel complaint?" },
  { label: "Administration", icon: FileText, question: "I need a certificate. Whom should I contact?" },
  { label: "Events", icon: CalendarDays, question: "Where are university event announcements shared?" },
];

const STARTERS = [
  "My room has a problem. Where do I complain?",
  "What is the exact date of my next examination?",
  "Which companies visit for placements?",
  "When does the library close on Saturdays?",
];

const MAX_LENGTH = 500;

function now(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface Props {
  initialQuestion?: string;
  /** Id of a saved conversation to reopen (signed-in students only). */
  conversationId?: string;
}

export default function Helpdesk({ initialQuestion, conversationId }: Props) {
  const { user, loading: userLoading } = useUser();
  const convId = useRef<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const askedInitial = useRef(false);

  useEffect(() => {
    if (messages.length === 0 && !loading && !error) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, error]);

  /** Saves one message for a signed-in student. Guests are not saved. Failures never block the chat. */
  async function persist(message: Message) {
    const supabase = getSupabase();
    if (!supabase || !user) return;
    try {
      if (!convId.current) {
        const { data, error } = await supabase
          .from("conversations")
          .insert({ title: message.content.slice(0, 70) })
          .select("id")
          .single();
        if (error) throw error;
        convId.current = data.id;
      }
      const { error } = await supabase.from("messages").insert({
        conversation_id: convId.current,
        role: message.role,
        content: message.content,
        category: message.category ?? null,
        answerable: message.answerable ?? null,
        sources: message.sources ?? null,
      });
      if (error) throw error;
      if (message.role === "assistant") {
        await supabase
          .from("conversations")
          .update({ preview: message.content.slice(0, 140), updated_at: new Date().toISOString() })
          .eq("id", convId.current);
      }
      setSaveError(null);
    } catch {
      setSaveError("This conversation could not be saved to your history. You can keep chatting.");
    }
  }

  // Reopen a saved conversation chosen on the dashboard.
  useEffect(() => {
    const supabase = getSupabase();
    if (!conversationId || !supabase || !user || convId.current === conversationId) return;
    convId.current = conversationId;
    supabase
      .from("messages")
      .select("id, role, content, category, answerable, sources, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          convId.current = null;
          setError("That conversation could not be opened.");
          return;
        }
        setMessages(
          data.map((row) => ({
            id: row.id,
            role: row.role,
            content: row.content,
            time: new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            category: row.category ?? undefined,
            answerable: row.answerable ?? undefined,
            sources: row.sources ?? [],
          })),
        );
      });
  }, [conversationId, user]);

  /** Sends the conversation to the server. `history` must end with the student's question. */
  async function requestAnswer(history: Message[]) {
    const question = history[history.length - 1];
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question.content,
          history: history.slice(0, -1).map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.answer) {
        throw new Error(data?.error ?? "The helpdesk could not answer right now. Please try again.");
      }
      const reply: Message = {
        id: newId(),
        role: "assistant",
        content: data.answer,
        time: now(),
        category: data.category,
        answerable: data.answerable,
        sources: data.sources ?? [],
      };
      setMessages((prev) => [...prev, reply]);
      await persist(reply);
      if (typeof data.category === "string") setActiveCategory(data.category);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Could not reach the server. Check your connection and try again."
          : err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function ask(text: string) {
    const question = text.trim();
    if (!question || loading) return;
    const mine: Message = { id: newId(), role: "user", content: question, time: now() };
    const next: Message[] = [...messages, mine];
    setMessages(next);
    setInput("");
    setLoading(true);
    void persist(mine).then(() => requestAnswer(next));
  }

  // A topic chosen on the homepage arrives as ?q=... and is asked once.
  useEffect(() => {
    if (!initialQuestion || askedInitial.current || userLoading) return;
    askedInitial.current = true;
    ask(initialQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion, userLoading]);

  function retry() {
    if (loading || messages.length === 0 || messages[messages.length - 1].role !== "user") return;
    void requestAnswer(messages);
  }

  function clearChat() {
    setMessages([]);
    setError(null);
    setInput("");
    setActiveCategory(null);
    setSaveError(null);
    convId.current = null;
    inputRef.current?.focus();
  }

  const isEmpty = messages.length === 0;
  const canSend = input.trim().length > 0 && !loading;

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="/" title="Back to home">
          <img className="brand-logo" src="/pu-footer-logo.png" alt="Presidency University" width={350} height={88} />
          <div className="brand-text">
            <span className="brand-name">AI Campus Helpdesk</span>
            <span className="brand-sub">Ask, learn, get help</span>
          </div>
        </a>
        <div className="topbar-actions">
          {!userLoading && (
            <Link href={user ? "/dashboard" : "/login"} className="account-link">
              {user ? "Dashboard" : "Log in"}
            </Link>
          )}
          <button
            type="button"
            className="btn btn-ghost"
            aria-label={user ? "New chat" : "Clear chat"}
            onClick={clearChat}
            disabled={isEmpty && !error}
          >
            {user ? <SquarePen size={16} aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}
            <span>{user ? "New chat" : "Clear chat"}</span>
          </button>
        </div>
      </header>

      <div className="shell">
        <nav className="topics" aria-label="Help topics">
          <p className="topics-title">Help topics</p>
          <ul className="topics-list">
            {CATEGORIES.map(({ label, icon: Icon, question }) => (
              <li key={label}>
                <button
                  type="button"
                  className={`topic ${activeCategory === label ? "is-active" : ""}`}
                  onClick={() => ask(question)}
                  disabled={loading}
                  title={`Ask: ${question}`}
                >
                  <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="topics-note">
            <Info size={14} aria-hidden="true" />
            <span>Answers use competition sample data plus public pages of presidencyuniversity.in. Not an official regulations portal.</span>
          </p>
        </nav>

        <main className="chat">
          <div className="thread" role="log" aria-live="polite" aria-label="Conversation">
            {isEmpty && (
              <section className="welcome">
                <p className="eyebrow">Ask, learn, get help</p>
                <h1>What do you need help with on campus?</h1>
                <p className="lead">
                  Ask in your own words. Every answer is grounded in the university information this helpdesk holds, and it will
                  tell you plainly when something is not available.
                </p>
                <div className="cards">
                  {CATEGORIES.map(({ label, icon: Icon, question }) => (
                    <button key={label} type="button" className="card" onClick={() => ask(question)} disabled={loading}>
                      <span className="card-icon" aria-hidden="true">
                        <Icon size={20} strokeWidth={1.9} />
                      </span>
                      <span className="card-label">{label}</span>
                      <span className="card-q">{question}</span>
                    </button>
                  ))}
                </div>
                <p className="try">Or try one of these</p>
                <div className="starters">
                  {STARTERS.map((q) => (
                    <button key={q} type="button" className="starter" onClick={() => ask(q)} disabled={loading}>
                      {q}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {messages.map((m) => (
              <article key={m.id} className={`msg msg-${m.role}`}>
                {m.role === "assistant" && (
                  <span className="avatar" aria-hidden="true">
                    <BookOpen size={16} strokeWidth={2} />
                  </span>
                )}
                <div className="bubble">
                  {m.role === "assistant" && (
                    <div className="meta">
                      {m.category && <span className="badge">{m.category}</span>}
                      {m.answerable === false && (
                        <span className="badge badge-warn">
                          <AlertCircle size={12} aria-hidden="true" />
                          Not in the available information
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text">{m.content}</p>
                  {m.sources && m.sources.length > 0 && (
                    <div className="sources">
                      <span className="sources-label">Based on</span>
                      <ul>
                        {m.sources.map((s) => (
                          <li key={s.id} title={s.text}>
                            {s.url ? (
                              <a href={s.url} target="_blank" rel="noopener noreferrer">
                                University website: {s.category}
                                <ExternalLink size={12} aria-hidden="true" />
                              </a>
                            ) : (
                              <span>Sample data: {s.category}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <span className="time">
                  {m.role === "user" ? "You" : "CampusDesk AI"} · {m.time}
                </span>
              </article>
            ))}

            {loading && (
              <article className="msg msg-assistant" aria-label="CampusDesk AI is preparing an answer">
                <div className="bubble typing">
                  <span />
                  <span />
                  <span />
                  <em>Searching campus information</em>
                </div>
              </article>
            )}

            {error && (
              <div className="alert" role="alert">
                <AlertCircle size={18} aria-hidden="true" />
                <p>{error}</p>
                <button type="button" className="btn btn-outline" onClick={retry} disabled={loading}>
                  <RotateCcw size={14} aria-hidden="true" />
                  Try again
                </button>
              </div>
            )}
            {saveError && (
              <p className="save-note" role="status">
                <AlertCircle size={14} aria-hidden="true" />
                {saveError}
              </p>
            )}
            <div ref={endRef} />
          </div>

          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <label htmlFor="question" className="sr-only">
              Your question
            </label>
            <textarea
              id="question"
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={MAX_LENGTH}
              placeholder="Ask about academics, exams, placements, hostel, library..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(input);
                }
              }}
            />
            <button type="submit" className="btn btn-primary" aria-label="Ask helpdesk" disabled={!canSend}>
              <SendHorizontal size={16} aria-hidden="true" />
              <span>Ask helpdesk</span>
            </button>
          </form>
          <p className="hint">
            <span>Enter to send, Shift + Enter for a new line</span>
            <span className={input.length >= MAX_LENGTH ? "limit" : ""}>
              {input.length}/{MAX_LENGTH}
            </span>
          </p>
        </main>
      </div>
    </div>
  );
}
