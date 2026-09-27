import { createSupabaseServerClient, isSupabaseConfigured } from "../../../lib/supabase-server";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return Response.json({ content: null });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("portfolio_content")
    .select("content")
    .eq("id", "main")
    .maybeSingle();

  if (error) {
    return Response.json({ error: "Portfolio content is temporarily unavailable." }, { status: 503 });
  }

  return Response.json({ content: data?.content ?? null });
}

export async function PUT(request: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: "The portfolio editor is not configured yet." }, { status: 503 });
  }

  const adminEmail = process.env.SUPABASE_ADMIN_EMAIL?.trim().toLowerCase();
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user?.email || user.email.toLowerCase() !== adminEmail) {
    return Response.json({ error: "You are not authorized to edit this portfolio." }, { status: 403 });
  }

  let payload: { content?: unknown };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "The submitted content is not valid JSON." }, { status: 400 });
  }

  if (
    !payload.content ||
    typeof payload.content !== "object" ||
    Array.isArray(payload.content) ||
    JSON.stringify(payload.content).length > 900_000
  ) {
    return Response.json({ error: "Portfolio content is missing or too large." }, { status: 400 });
  }

  const { error } = await supabase.from("portfolio_content").upsert({
    id: "main",
    content: payload.content,
  });

  if (error) {
    return Response.json({ error: "Could not save portfolio content. Check the Supabase setup." }, { status: 503 });
  }

  return Response.json({ saved: true });
}
