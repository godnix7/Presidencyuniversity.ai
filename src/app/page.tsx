import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  Database,
  FileText,
  Globe,
  GraduationCap,
  Home,
  Library,
  MessageSquareText,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

const TOPICS: { label: string; icon: LucideIcon; blurb: string; question: string }[] = [
  { label: "Academics", icon: GraduationCap, blurb: "Who to approach for academic help", question: "Whom should I contact for academic problems?" },
  { label: "Attendance", icon: CalendarCheck, blurb: "What the attendance rule says", question: "What is the attendance requirement?" },
  { label: "Examinations", icon: ClipboardList, blurb: "Timetables, results and notices", question: "Where can I find the examination timetable?" },
  { label: "Placements", icon: Briefcase, blurb: "Training and placement support", question: "Whom should I contact for placement training?" },
  { label: "Library", icon: Library, blurb: "Timings, borrowing and e-resources", question: "When is the library open?" },
  { label: "Hostel", icon: Home, blurb: "Facilities and raising complaints", question: "How can I raise a hostel complaint?" },
  { label: "Administration", icon: FileText, blurb: "Certificates and student records", question: "I need a certificate. Whom should I contact?" },
  { label: "Events", icon: CalendarDays, blurb: "Where announcements are shared", question: "Where are university event announcements shared?" },
];

export default function HomePage() {
  return (
    <div className="home">
      <header className="home-nav">
        <Link href="/" className="home-brand" aria-label="CampusDesk AI home">
          <img src="/pu-footer-logo.png" alt="Presidency University" width={350} height={88} />
          <span>CampusDesk AI</span>
        </Link>
        <nav aria-label="Main">
          <a href="#topics">Help topics</a>
          <a href="#about">About</a>
          <Link href="/helpdesk" className="home-nav-cta">
            Open helpdesk
          </Link>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-inner">
            <p className="hero-eyebrow">Your university. One intelligent helpdesk.</p>
            <h1>Welcome to Presidency University CampusDesk AI</h1>
            <p className="hero-lead">
              Your intelligent assistant for university information, academic guidance, campus services and student support.
            </p>
            <div className="hero-actions">
              <Link href="/helpdesk" className="hbtn hbtn-gold">
                <MessageSquareText size={18} aria-hidden="true" />
                Ask CampusDesk AI
              </Link>
              <a href="#topics" className="hbtn hbtn-line">
                Explore help topics
              </a>
            </div>
          </div>
        </section>

        <section id="topics" className="home-section">
          <h2>What do you need help with?</h2>
          <p className="home-sub">Pick a topic to start a conversation, or ask anything in your own words.</p>
          <div className="topic-grid">
            {TOPICS.map(({ label, icon: Icon, blurb, question }) => (
              <Link key={label} href={`/helpdesk?q=${encodeURIComponent(question)}`} className="topic-card">
                <span className="topic-card-icon" aria-hidden="true">
                  <Icon size={22} strokeWidth={1.9} />
                </span>
                <span className="topic-card-label">{label}</span>
                <span className="topic-card-blurb">{blurb}</span>
                <span className="topic-card-go">
                  Ask about this <ArrowRight size={14} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section id="about" className="home-section home-about">
          <h2>Answers you can trace</h2>
          <p className="home-sub">
            CampusDesk AI answers only from the information it holds, shows what each answer is based on, and says so when
            something is not available.
          </p>
          <div className="about-grid">
            <article>
              <Database size={22} aria-hidden="true" />
              <h3>Competition sample data</h3>
              <p>The eight facts supplied for TECHNOPIA 2.0 are the primary source for every answer.</p>
            </article>
            <article>
              <Globe size={22} aria-hidden="true" />
              <h3>Public university pages</h3>
              <p>
                Supplementary details come from a snapshot of presidencyuniversity.in taken on 11 Nov 2026. It is not a live
                feed.
              </p>
            </article>
            <article>
              <ShieldCheck size={22} aria-hidden="true" />
              <h3>No made-up facts</h3>
              <p>Dates, percentages, fees and contacts that are not in the sources are reported as unavailable.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div>
          <strong>CampusDesk AI</strong>
          <p>A student-built competition prototype for Presidency University, Bengaluru.</p>
        </div>
        <nav aria-label="Footer">
          <Link href="/helpdesk">Helpdesk</Link>
          <a href="#topics">Help topics</a>
          <a href="#about">About</a>
        </nav>
        <p className="home-footer-note">
          This is not an official university regulations portal. For confirmed information, use official university channels.
        </p>
      </footer>
    </div>
  );
}
