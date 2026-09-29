import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { legal } from "@/content/legal";

// PRE-LAUNCH: noindex until content/legal.ts is filled in. Remove `robots` at launch (see CLAUDE.md).
export const metadata: Metadata = { title: "Privacy policy", description: "How Esteemwire handles personal data.", robots: { index: false, follow: false } };

/* Privacy policy. The controller's details come from content/legal.ts.
   Keep this text in step with what the site actually does: the contact
   form (app/actions.ts) is the only thing that collects personal data. */
export default function Privacy() {
  const L = legal;
  return (
    <LegalPage title="Privacy policy" eyebrow="Data protection">
      <p className="legal-lead">
        This policy explains what personal data this website collects, why, where it goes, how long it is kept, and how you can have it
        deleted. Last updated: {L.updated}.
      </p>

      <section>
        <h2>Who is responsible</h2>
        <p>
          The controller under the EU General Data Protection Regulation (GDPR) is {L.name}, {L.street}, {L.postcodeCity}, {L.country}.
          Email: <a href={`mailto:${L.email}`}>{L.email}</a>. Full details are in the <Link href="/impressum">Impressum</Link>.
        </p>
      </section>

      <section>
        <h2>What we collect, and why</h2>
        <p>
          <strong>The contact form.</strong> When you send an enquiry we receive the email address and message you enter, and the time you sent
          it. We use them only to reply to you and to discuss a possible project. The legal basis is Art. 6 (1) (b) GDPR (steps taken at your
          request before a contract) and, for general enquiries, Art. 6 (1) (f) GDPR (our legitimate interest in answering messages sent to us).
        </p>
        <p>
          <strong>Protection against spam.</strong> To stop automated abuse, the form briefly uses your IP address to limit how many messages can
          be sent in a short time, and records when the form was opened. The IP address is held only in the server&apos;s working memory for up to
          ten minutes and is not stored. The legal basis is Art. 6 (1) (f) GDPR (our legitimate interest in keeping the form usable).
        </p>
        <p>
          <strong>Visiting the site.</strong> Like every website, our hosting provider receives technical data when you load a page, such as your
          IP address, browser and the page requested, in order to deliver it and keep it secure (Art. 6 (1) (f) GDPR).
        </p>
      </section>

      <section>
        <h2>What we do not do</h2>
        <p>
          This site sets no cookies, uses no analytics or tracking, and shows no advertising. Its fonts are served from our own site, so your
          browser does not contact any font service. Nothing on the site plays sound.
        </p>
      </section>

      <section>
        <h2>Where your data goes</h2>
        <ul>
          <li>
            <strong>Vercel Inc.</strong> (USA) hosts the website and runs the contact form. It processes the technical data of each visit and
            briefly handles the form submission. Its server logs are kept for a short period set by Vercel.
          </li>
          <li>
            <strong>Resend</strong> (Plus Five Five, Inc., USA) delivers your enquiry to us by email.
          </li>
          <li>
            <strong>Google</strong> (Google Ireland Ltd. / Google LLC) provides the mailbox in which we receive and keep enquiries.
          </li>
        </ul>
        <p>
          These providers process data on our behalf under data processing agreements. Where data is transferred to the USA, the transfer
          relies on the EU–US Data Privacy Framework or the EU standard contractual clauses. We do not sell or share your data with anyone else.
        </p>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <p>
          We keep enquiry emails for {L.enquiryRetention}, unless a project follows, in which case we keep them as long as the law requires for
          business records. The spam-protection data is not stored at all.
        </p>
      </section>

      <section>
        <h2>Your rights, and how to have your data deleted</h2>
        <p>
          You have the right to access the data we hold about you, to have it corrected or deleted, to restrict or object to its processing,
          and to receive it in a portable format (Art. 15–21 GDPR). To use any of these rights, including asking us to delete your enquiry, email{" "}
          <a href={`mailto:${L.email}`}>{L.email}</a>. We will reply within one month.
        </p>
        <p>You also have the right to complain to a data-protection supervisory authority, for example {L.supervisoryAuthority}.</p>
      </section>
    </LegalPage>
  );
}
