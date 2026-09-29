import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legal } from "@/content/legal";

// PRE-LAUNCH: noindex until content/legal.ts is filled in. Remove `robots` at launch (see CLAUDE.md).
export const metadata: Metadata = { title: "Impressum", description: "Legal notice for Esteemwire.", robots: { index: false, follow: false } };

/* Impressum (legal notice). Every value comes from content/legal.ts, the
   single block to fill in. Optional lines drop out when left as "". */
export default function Impressum() {
  const L = legal;
  return (
    <LegalPage title="Impressum" eyebrow="Legal notice">
      <p className="legal-lead">Information according to § 5 DDG (German Digital Services Act).</p>

      <section>
        <h2>Provider</h2>
        <p>
          {L.name}
          <br />
          {L.legalForm}
          {L.representedBy && (
            <>
              <br />
              Represented by: {L.representedBy}
            </>
          )}
          <br />
          {L.street}
          <br />
          {L.postcodeCity}
          <br />
          {L.country}
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Email: <a href={`mailto:${L.email}`}>{L.email}</a>
          <br />
          Phone: {L.phone}
        </p>
      </section>

      {L.register && (
        <section>
          <h2>Register entry</h2>
          <p>{L.register}</p>
        </section>
      )}

      {L.vatId && (
        <section>
          <h2>VAT ID</h2>
          <p>VAT identification number according to § 27a of the German VAT Act: {L.vatId}</p>
        </section>
      )}

      <section>
        <h2>Responsible for content</h2>
        <p>
          According to § 18 (2) MStV: {L.contentResponsible}, {L.street}, {L.postcodeCity}, {L.country}.
        </p>
      </section>

      <section>
        <h2>Consumer dispute resolution</h2>
        <p>We are neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board.</p>
      </section>

      <section>
        <h2>Liability for links</h2>
        <p>
          This site links to the live websites of our clients. We have no influence over their content, and the providers of those sites are
          responsible for them. We check linked pages when we link to them; if we become aware of any legal problem, we remove the link.
        </p>
      </section>
    </LegalPage>
  );
}
