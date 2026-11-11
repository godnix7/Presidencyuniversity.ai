"use client";

import Link from "next/link";
import { useUser } from "@/lib/supabase";

/** Header links that depend on whether a student is signed in. */
export default function AccountLinks({ cta = false }: { cta?: boolean }) {
  const { user, loading } = useUser();
  if (loading) return null;
  if (user) {
    return (
      <Link href="/dashboard" className={cta ? "home-nav-cta" : "account-link"}>
        Dashboard
      </Link>
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
