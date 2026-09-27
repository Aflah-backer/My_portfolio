import { Resend } from "resend";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export async function POST(request: Request) {
  const requestOrigin = request.headers.get("origin");
  if (requestOrigin) {
    const originUrl = new URL(requestOrigin);
    const forwardedHost = request.headers.get("x-forwarded-host");
    const expectedHost = forwardedHost || request.headers.get("host");
    const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
    const expectedProtocol = forwardedProtocol || new URL(request.url).protocol.slice(0, -1);
    if (originUrl.host !== expectedHost || originUrl.protocol !== `${expectedProtocol}:`) {
      return Response.json({ error: "Invalid request origin." }, { status: 403 });
    }
  }

  let payload: { name?: unknown; email?: unknown; message?: unknown; website?: unknown };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Please submit a valid message." }, { status: 400 });
  }

  if (typeof payload.website === "string" && payload.website.trim()) {
    return Response.json({ sent: true });
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";

  if (
    name.length < 1 || name.length > 120 ||
    email.length > 254 || !/^\S+@\S+\.\S+$/.test(email) ||
    message.length < 1 || message.length > 6000
  ) {
    return Response.json({ error: "Please check your name, email, and message." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !recipient) {
    return Response.json({ error: "Contact delivery is not configured yet. Please email directly." }, { status: 503 });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL || "Portfolio contact <onboarding@resend.dev>",
      to: recipient,
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    });

    if (error) {
      return Response.json({ error: "Email could not be delivered. Please try again shortly." }, { status: 502 });
    }
  } catch {
    return Response.json({ error: "Email could not be delivered. Please try again shortly." }, { status: 502 });
  }

  return Response.json({ sent: true });
}
