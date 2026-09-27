"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

export default function AdminAccess() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  async function requestSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setStatus("Supabase public URL and anon key are required.");
      return;
    }

    setPending(true);
    setStatus("");
    const supabase = createBrowserClient(url, key);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
      },
    });
    setPending(false);
    setStatus(error ? "Sign-in link could not be sent. Check your Supabase Auth settings." : "Check your email for the secure sign-in link.");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#0F1216] px-5 text-[#E7EAEE]">
      <form onSubmit={requestSignIn} className="w-full max-w-md border border-[#2A313B] bg-[#161A20] p-7 sm:p-9">
        <Link href="/" className="text-sm text-[#9AA3AE] hover:text-white">← Back to portfolio</Link>
        <p className="mt-10 font-mono text-xs uppercase tracking-[0.18em] text-[#5CC98E]">Private workspace</p>
        <h1 className="mt-3 text-3xl font-bold">Owner sign in</h1>
        <p className="mt-3 text-sm leading-6 text-[#9AA3AE]">A one-time sign-in link will be sent to the portfolio owner email.</p>
        <label htmlFor="admin-email" className="mt-7 block text-sm">Email address</label>
        <input
          id="admin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full border border-[#39424E] bg-[#0F1216] px-3 py-3 text-[#E7EAEE] outline-none focus:border-[#5CC98E]"
          placeholder="you@example.com"
        />
        <button disabled={pending} type="submit" className="mt-4 w-full bg-[#28734E] px-4 py-3 font-semibold text-white hover:bg-[#32865D] disabled:cursor-wait disabled:opacity-60">
          {pending ? "Sending link…" : "Email me a sign-in link"}
        </button>
        <p aria-live="polite" className="mt-4 min-h-5 text-sm text-[#B7C2CD]">{status}</p>
      </form>
    </main>
  );
}
