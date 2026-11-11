"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  History,
  Loader2,
  LogOut,
  MessageSquarePlus,
  MessageSquareText,
  Trash2,
} from "lucide-react";
import { displayName, getSupabase, useUser, type ConversationRow } from "@/lib/supabase";

const QUICK_ACTIONS = [
  { label: "Ask AI Assistant", icon: MessageSquarePlus, href: "/helpdesk" },
  { label: "View previous conversations", icon: History, href: "#recent" },
  { label: "Explore Academics", icon: GraduationCap, href: `/helpdesk?q=${encodeURIComponent("Whom should I contact for academic problems?")}` },
  { label: "Explore Examinations", icon: ClipboardList, href: `/helpdesk?q=${encodeURIComponent("Where can I find the examination timetable?")}` },
  { label: "Explore Placements", icon: Briefcase, href: `/helpdesk?q=${encodeURIComponent("Whom should I contact for placement training?")}` },
];

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [conversations, setConversations] = useState<ConversationRow[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Protected page: students who are not signed in are sent to the login screen.
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const loadConversations = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    setListError(null);
    const { data, error } = await supabase
      .from("conversations")
      .select("id, title, preview, updated_at")
      .order("updated_at", { ascending: false })
      .limit(20);
    if (error) {
      setConversations([]);
      setListError("Could not load your conversations. Check that the database tables from supabase/schema.sql exist.");
      return;
    }
    setConversations(data ?? []);
  }, []);

  useEffect(() => {
    if (!user) return;
    setName(typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "");
    void loadConversations();
  }, [user, loadConversations]);

  async function logOut() {
    await getSupabase()?.auth.signOut();
    router.replace("/");
  }

  async function saveName(e: FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase || savingName) return;
    if (!name.trim()) return setProfileMsg({ ok: false, text: "Enter your full name." });
    setSavingName(true);
    setProfileMsg(null);
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    setSavingName(false);
    setProfileMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Name saved." });
  }

  async function deleteConversation(id: string, title: string) {
    const supabase = getSupabase();
    if (!supabase || deletingId) return;
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    const { error } = await supabase.from("conversations").delete().eq("id", id);
    setDeletingId(null);
    if (error) return setListError("Could not delete that conversation. Please try again.");
    setConversations((prev) => (prev ?? []).filter((c) => c.id !== id));
  }

  if (loading || !user) {
    return (
      <div className="dash-loading" role="status">
        <Loader2 size={22} className="spin" aria-hidden="true" />
        <span>Loading your dashboard</span>
      </div>
    );
  }

  return (
    <div className="dash">
      <header className="home-nav">
        <Link href="/" className="home-brand" aria-label="CampusDesk AI home">
          <img src="/pu-footer-logo.png" alt="Presidency University" width={350} height={88} />
          <span>CampusDesk AI</span>
        </Link>
        <nav aria-label="Account">
          <Link href="/helpdesk">Helpdesk</Link>
          <button type="button" className="btn btn-ghost" onClick={logOut}>
            <LogOut size={16} aria-hidden="true" />
            <span>Log out</span>
          </button>
        </nav>
      </header>

      <main className="dash-main">
        <section className="dash-welcome">
          <p className="eyebrow">Student dashboard</p>
          <h1>Welcome, {displayName(user)}</h1>
          <p className="lead">Ask a new question or return to an earlier conversation.</p>
        </section>

        <section aria-labelledby="quick-title">
          <h2 id="quick-title" className="dash-h2">
            Quick actions
          </h2>
          <div className="quick-grid">
            {QUICK_ACTIONS.map(({ label, icon: Icon, href }) => (
              <Link key={label} href={href} className="quick">
                <Icon size={20} strokeWidth={1.9} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="dash-cols">
          <section id="recent" aria-labelledby="recent-title">
            <h2 id="recent-title" className="dash-h2">
              Recent conversations
            </h2>
            {listError && (
              <p className="auth-msg auth-error" role="alert">
                <AlertCircle size={16} aria-hidden="true" />
                <span>{listError}</span>
              </p>
            )}
            {conversations === null && (
              <p className="dash-muted" role="status">
                Loading conversations
              </p>
            )}
            {conversations !== null && conversations.length === 0 && !listError && (
              <div className="dash-empty">
                <MessageSquareText size={28} aria-hidden="true" />
                <p>You have no saved conversations yet.</p>
                <Link href="/helpdesk" className="btn btn-primary">
                  Start chatting
                </Link>
              </div>
            )}
            {conversations !== null && conversations.length > 0 && (
              <ul className="conv-list">
                {conversations.map((c) => (
                  <li key={c.id} className="conv">
                    <Link href={`/helpdesk?c=${c.id}`} className="conv-open">
                      <span className="conv-title">{c.title}</span>
                      {c.preview && <span className="conv-preview">{c.preview}</span>}
                      <span className="conv-when">Updated {formatWhen(c.updated_at)}</span>
                    </Link>
                    <button
                      type="button"
                      className="conv-delete"
                      onClick={() => deleteConversation(c.id, c.title)}
                      disabled={deletingId === c.id}
                      aria-label={`Delete conversation: ${c.title}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="profile-title" className="profile">
            <h2 id="profile-title" className="dash-h2">
              Profile
            </h2>
            <form className="profile-card" onSubmit={saveName}>
              <div className="field">
                <label htmlFor="profile-name">Full name</label>
                <input id="profile-name" type="text" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <span className="field-label">Email address</span>
                <p className="profile-email">{user.email}</p>
              </div>
              {profileMsg && (
                <p className={`auth-msg ${profileMsg.ok ? "auth-success" : "auth-error"}`} role="status">
                  {profileMsg.ok ? <CheckCircle2 size={16} aria-hidden="true" /> : <AlertCircle size={16} aria-hidden="true" />}
                  <span>{profileMsg.text}</span>
                </p>
              )}
              <button type="submit" className="btn btn-primary" disabled={savingName}>
                {savingName ? "Saving name" : "Save name"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
