import AdminAccess from "./AdminAccess";
import AdminEditor from "./AdminEditor";
import Link from "next/link";
import { createSupabaseServerClient, isSupabaseConfigured } from "../../lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0F1216] px-5 text-[#E7EAEE]">
        <div className="max-w-xl border border-[#2A313B] bg-[#161A20] p-8">
          <Link href="/" className="text-sm text-[#9AA3AE]">← Back to portfolio</Link>
          <h1 className="mt-8 text-3xl font-bold">Editor setup needed</h1>
          <p className="mt-4 leading-7 text-[#B7C2CD]">Add the Supabase values from <code>.env.example</code>, then run the setup SQL in <code>supabase/setup.sql</code>. The public portfolio remains available while the editor is unconfigured.</p>
        </div>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const ownerEmail = process.env.SUPABASE_ADMIN_EMAIL?.trim().toLowerCase();

  if (!user) return <AdminAccess />;

  if (!user.email || user.email.toLowerCase() !== ownerEmail) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0F1216] px-5 text-[#E7EAEE]">
        <div className="max-w-md border border-[#2A313B] bg-[#161A20] p-8">
          <h1 className="text-2xl font-bold">This account has no editor access.</h1>
          <p className="mt-3 text-sm text-[#9AA3AE]">Sign out and request a link using the owner email.</p>
          <Link href="/" className="mt-6 inline-block text-sm text-[#5CC98E]">Return to portfolio</Link>
        </div>
      </main>
    );
  }

  return <AdminEditor ownerEmail={user.email} />;
}
