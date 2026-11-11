"use client";

import { useEffect, useState } from "react";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

// The project URL and anon (publishable) key are designed to be public; row level security protects the data.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

/** Returns the browser Supabase client, or null when the project is not configured. */
export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!client) client = createClient(url, anonKey);
  return client;
}

export const AUTH_NOT_CONFIGURED =
  "Student accounts are not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and restart the server.";

/** Tracks the signed-in student. `loading` is true until the stored session has been read. */
export function useUser(): { user: User | null; loading: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function displayName(user: User): string {
  const name = user.user_metadata?.full_name;
  return typeof name === "string" && name.trim() ? name.trim() : (user.email ?? "Student");
}

export interface ConversationRow {
  id: string;
  title: string;
  preview: string | null;
  updated_at: string;
}
