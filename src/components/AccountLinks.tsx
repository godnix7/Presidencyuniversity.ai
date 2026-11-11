"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { getSupabase, useUser } from "@/lib/supabase";

/** Header links that depend on whether a student is signed in. */
export default function AccountLinks({ cta = false }: { cta?: boolean }) {
  const { user, loading } = useUser();
  if (loading) return null;

  if (user) {
    return (
      <>
        <Link href="/dashboard" className={cta ? "home-nav-cta" : "account-link"}>
          Dashboard
        </Link>
        <LogoutButton />
      </>
    );
  }
  return (
    <>
      <Link href="/login" className="account-link">
        Log in
      </Link>
      {cta && (
        <Link href="/register" className="home-nav-cta">
          Get started
        </Link>
      )}
    </>
  );
}

/** Signs the student out and returns to the homepage. */
export function LogoutButton() {
  async function logOut() {
    await getSupabase()?.auth.signOut();
    window.location.assign("/");
  }
  return (
    <button type="button" className="logout-btn" onClick={logOut}>
      <LogOut size={16} aria-hidden="true" />
      Log out
    </button>
  );
}
