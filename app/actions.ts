"use server";

import { headers } from "next/headers";

/* The contact form's server side. Everything here runs only on the server;
   none of it (the delivery address, the API key) ever reaches a browser.

   A submission goes through, in order:
   1. spam checks: a hidden "honeypot" field people never see but bots fill
      in, a minimum time between the form appearing and being sent, and a
      per-IP rate limit. A spammer is told "sent" (so they learn nothing)
      and the reason is logged here;
   2. validation of every field, with length limits;
   3. delivery through Resend's email API (https://resend.com), sent from
      hello@esteemwire.com to the studio inbox, with the visitor's address
      as reply-to so answering the email answers them.
   The visitor only sees "sent" when Resend has accepted the email. */

export type ContactState = { status: "idle" | "ok" | "error"; message: string };

/** Where enquiries are delivered. Server-only; never shown on the site. */
const DELIVER_TO = "esteemwire@gmail.com";
/** The sender. The esteemwire.com domain must be verified in Resend. */
const SEND_FROM = "Esteemwire website <hello@esteemwire.com>";

const LIMITS = { email: 254, message: 5000, messageMin: 10 };
/** A person needs at least this long to read the form and type something. */
const MIN_FILL_MS = 3000;
/** Per IP: at most this many submissions in this window. */
const RATE = { max: 3, windowMs: 10 * 60 * 1000 };

/* The rate limit's memory. It lives in this server instance only: on Vercel
   each instance keeps its own count and forgets it when it restarts, so it
   stops floods from one visitor rather than being a hard guarantee. */
const recent = new Map<string, number[]>();

const SENT = "Thanks. Your enquiry is on its way and we will reply soon.";
const FAILED = `Sorry, that did not send. Please try again, or email us at hello@esteemwire.com.`;

function rateLimited(ip: string, now: number) {
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < RATE.windowMs);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) recent.clear(); // never let the map grow without bound
  return hits.length > RATE.max;
}

/** Log a rejected submission; the visitor is not told why. */
function reject(reason: string, ip: string): ContactState {
  console.warn(`[contact] rejected (${reason}) from ${ip}`);
  return { status: "ok", message: SENT };
}

export async function submitContact(_prev: ContactState, form: FormData): Promise<ContactState> {
  const now = Date.now();
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";

  // ── 1. Spam checks: answered as if sent, reason logged.
  if (String(form.get("company") ?? "").length > 0) return reject("honeypot filled", ip);
  const started = Number(form.get("started") ?? 0);
  if (!Number.isFinite(started) || started <= 0 || now - started < MIN_FILL_MS) return reject("sent too fast", ip);
  if (rateLimited(ip, now)) return reject("rate limit", ip);

  // ── 2. Validation: these the visitor can fix, so they are told.
  const email = String(form.get("email") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();
  if (email.length === 0 || email.length > LIMITS.email || /[\r\n]/.test(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }
  if (message.length < LIMITS.messageMin) {
    return { status: "error", message: "Please tell us a little about your project." };
  }
  if (message.length > LIMITS.message) {
    return { status: "error", message: `Please keep your message under ${LIMITS.message.toLocaleString("en")} characters.` };
  }

  // ── 3. Delivery. No key means no delivery: say so loudly, never pretend.
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("[contact] RESEND_API_KEY is not set. The enquiry was NOT delivered. Set it in Vercel → Settings → Environment Variables.");
    return { status: "error", message: FAILED };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: SEND_FROM,
        to: [DELIVER_TO],
        reply_to: email,
        subject: `New enquiry from ${email}`,
        // Plain text only, so nothing a visitor types can become HTML.
        text: `From: ${email}\nReceived: ${new Date(now).toISOString()}\n\n${message}\n`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`[contact] Resend refused the email: ${res.status} ${(await res.text()).slice(0, 300)}`);
      return { status: "error", message: FAILED };
    }
  } catch (err) {
    console.error("[contact] could not reach Resend:", err instanceof Error ? err.message : err);
    return { status: "error", message: FAILED };
  }
  return { status: "ok", message: SENT };
}
