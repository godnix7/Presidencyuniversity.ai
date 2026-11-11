"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { AUTH_NOT_CONFIGURED, getSupabase } from "@/lib/supabase";

type Mode = "login" | "register" | "forgot" | "reset";

const COPY: Record<Mode, { title: string; lead: string; action: string; busy: string }> = {
  login: { title: "Log in to CampusDesk AI", lead: "Pick up your conversations where you left them.", action: "Log in", busy: "Logging in" },
  register: { title: "Create your student account", lead: "Save your conversations and return to them any time.", action: "Create account", busy: "Creating account" },
  forgot: { title: "Reset your password", lead: "Enter your email and we will send you a reset link.", action: "Send reset link", busy: "Sending link" },
  reset: { title: "Choose a new password", lead: "Enter a new password for your account.", action: "Update password", busy: "Updating password" },
};

const MIN_PASSWORD = 8;

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const copy = COPY[mode];
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [recoveryReady, setRecoveryReady] = useState(mode !== "reset");

  const supabase = getSupabase();
  const needsPassword = mode !== "forgot";
  const needsConfirm = mode === "register" || mode === "reset";

  // The reset link signs the student in with a recovery session; wait for it before allowing an update.
  useEffect(() => {
    if (mode !== "reset" || !supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setRecoveryReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setRecoveryReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, [mode, supabase]);

  function validate(): string | null {
    if (mode === "register" && !fullName.trim()) return "Enter your full name.";
    if (mode !== "reset" && !/^\S+@\S+\.\S+$/.test(email.trim())) return "Enter a valid email address.";
    if (needsPassword && mode !== "login" && password.length < MIN_PASSWORD) {
      return `Password must be at least ${MIN_PASSWORD} characters.`;
    }
    if (mode === "login" && !password) return "Enter your password.";
    if (needsConfirm && password !== confirm) return "The two passwords do not match.";
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setNotice(null);
    if (!supabase) return setError(AUTH_NOT_CONFIGURED);
    const problem = validate();
    if (problem) return setError(problem);

    setBusy(true);
    try {
      const origin = window.location.origin;
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        router.push("/dashboard");
      } else if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim() }, emailRedirectTo: `${origin}/login` },
        });
        if (error) throw error;
        if (data.session) router.push("/dashboard");
        else setNotice("Account created. Check your email for a verification link, then log in.");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${origin}/reset-password` });
        if (error) throw error;
        setNotice("If an account exists for that email, a reset link has been sent. Check your inbox.");
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setNotice("Password updated. Taking you to your dashboard.");
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <aside className="auth-side">
        <Link href="/" aria-label="CampusDesk AI home">
          <img src="/pu-footer-logo.png" alt="Presidency University" width={350} height={88} />
        </Link>
        <div>
          <p className="auth-side-title">CampusDesk AI</p>
          <p className="auth-side-tag">Your university. One intelligent helpdesk.</p>
        </div>
        <p className="auth-side-note">A student-built competition prototype. Not an official university portal.</p>
      </aside>

      <main className="auth-main">
        <form className="auth-card" onSubmit={onSubmit} noValidate>
          <h1>{copy.title}</h1>
          <p className="auth-lead">{copy.lead}</p>

          {!supabase && (
            <p className="auth-msg auth-error" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{AUTH_NOT_CONFIGURED}</span>
            </p>
          )}
          {mode === "reset" && supabase && !recoveryReady && (
            <p className="auth-msg auth-info">
              <AlertCircle size={16} aria-hidden="true" />
              <span>Open this page from the reset link in your email. If you came from the link, wait a moment.</span>
            </p>
          )}

          {mode === "register" && (
            <div className="field">
              <label htmlFor="fullName">Full name</label>
              <input id="fullName" type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={80} />
            </div>
          )}

          {mode !== "reset" && (
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          )}

          {needsPassword && (
            <div className="field">
              <div className="field-row">
                <label htmlFor="password">{mode === "reset" ? "New password" : "Password"}</label>
                {mode === "login" && (
                  <Link href="/forgot-password" className="auth-link">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="password-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby={mode !== "login" ? "password-hint" : undefined}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
              {mode !== "login" && (
                <p id="password-hint" className="field-hint">
                  At least {MIN_PASSWORD} characters.
                </p>
              )}
            </div>
          )}

          {needsConfirm && (
            <div className="field">
              <label htmlFor="confirm">Confirm password</label>
              <input
                id="confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          )}

          {error && (
            <p className="auth-msg auth-error" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}
          {notice && (
            <p className="auth-msg auth-success" role="status">
              <CheckCircle2 size={16} aria-hidden="true" />
              <span>{notice}</span>
            </p>
          )}

          <button type="submit" className="btn btn-primary auth-submit" disabled={busy || !supabase || !recoveryReady}>
            {busy && <Loader2 size={16} className="spin" aria-hidden="true" />}
            {busy ? copy.busy : copy.action}
          </button>

          <p className="auth-switch">
            {mode === "login" && (
              <>
                New here? <Link href="/register">Create an account</Link>
              </>
            )}
            {mode === "register" && (
              <>
                Already registered? <Link href="/login">Log in</Link>
              </>
            )}
            {(mode === "forgot" || mode === "reset") && <Link href="/login">Back to log in</Link>}
          </p>
          <p className="auth-switch">
            <Link href="/helpdesk">Continue as a guest</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
