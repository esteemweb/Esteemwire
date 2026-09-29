"use client";

import { useActionState, useEffect, useState } from "react";
import { submitContact, type ContactState } from "@/app/actions";
import { FlowButton } from "@/components/ui/flow-button";

/* The contact form: an email pill, the message box and a full-width send
   button, then a status line with reserved height so the layout never
   jumps (read out politely to screen readers).

   Two hidden fields feed the server's spam checks (app/actions.ts): a
   honeypot ("company") that people never see or reach, and the time the
   form appeared. Browser checks (required, maxLength) are only a courtesy;
   the server validates everything again. The two visible fields are held
   in state so a failed send keeps what the visitor wrote; they are only
   cleared once the enquiry has actually gone. */
const initial: ContactState = { status: "idle", message: "" };

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial);
  const [started, setStarted] = useState(0);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // The clock starts when the form is on screen, and restarts after a send.
  useEffect(() => {
    setStarted(Date.now());
    if (state.status === "ok") {
      setEmail("");
      setMessage("");
    }
  }, [state]);

  return (
    <form action={action} className="mt-25 flex w-full max-w-[26rem] flex-col items-stretch gap-y-8 s:mt-30 s:max-w-[32rem]">
      {/* Spam checks. The honeypot is off-screen and skipped by keyboard and screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-company">Company (leave empty)</label>
        <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input type="hidden" name="started" value={started} readOnly />

      <label className="sr-only" htmlFor="contact-email">
        Email address
      </label>
      <div className="flex items-center">
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="h-40 min-w-0 flex-1 rounded-pill bg-ink px-20 text-body text-black placeholder:text-black/50 s:h-45"
        />
      </div>
      <label className="sr-only" htmlFor="contact-message">
        What are you building?
      </label>
      <textarea
        id="contact-message"
        name="message"
        rows={3}
        required
        minLength={10}
        maxLength={5000}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What are you building, and when do you need it?"
        className="rounded-card resize-none bg-ink px-20 py-12 text-body text-black placeholder:text-black/50"
      />
      <FlowButton text={pending ? "Sending…" : "Send enquiry"} type="submit" disabled={pending} className="contact-send mt-8 w-full" />
      <p
        role={state.status === "error" && !pending ? "alert" : undefined}
        aria-live="polite"
        data-status={pending ? "pending" : state.status}
        className="contact-status label mt-15 min-h-[1.2em] w-full text-center"
      >
        {pending ? "Sending…" : state.message}
      </p>
    </form>
  );
}
