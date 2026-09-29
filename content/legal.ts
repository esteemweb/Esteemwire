// ╔══════════════════════════════════════════════════════════════════════╗
// ║  FILL IN YOUR LEGAL DETAILS HERE — this is the only place.           ║
// ║                                                                      ║
// ║  Everything in square brackets is a placeholder. Both the Impressum  ║
// ║  (/impressum) and the Privacy policy (/privacy) read from this block. ║
// ║  Until every placeholder is replaced, `npm run build` prints a       ║
// ║  warning and the placeholders show on the live pages.                ║
// ║                                                                      ║
// ║  Fields marked OPTIONAL: set them to "" if they do not apply to you, ║
// ║  and that line disappears from the page.                             ║
// ╚══════════════════════════════════════════════════════════════════════╝

export const legal = {
  /** Your full legal name, or the registered company name. */
  name: "[YOUR FULL LEGAL NAME OR COMPANY NAME]",
  /** Legal form, e.g. "Sole trader (Einzelunternehmen)", "GmbH", "UG (haftungsbeschränkt)". */
  legalForm: "[LEGAL FORM]",
  /** OPTIONAL: for a company, the managing director(s) who represent it. "" for a sole trader. */
  representedBy: "[MANAGING DIRECTOR(S), OR \"\" FOR A SOLE TRADER]",
  /** A full postal address where you can be served legal documents (no PO box). */
  street: "[STREET AND HOUSE NUMBER]",
  postcodeCity: "[POSTCODE AND CITY]",
  country: "[COUNTRY]",
  /** Contact email shown in the Impressum (a real mailbox). */
  email: "hello@esteemwire.com",
  /** A phone number: German law expects a second fast way to reach you. */
  phone: "[PHONE NUMBER WITH COUNTRY CODE]",
  /** OPTIONAL: commercial register court and number, if registered. e.g. "Amtsgericht Berlin, HRB 123456". */
  register: "[REGISTER COURT AND NUMBER, OR \"\"]",
  /** OPTIONAL: VAT ID (USt-IdNr.), if you have one. e.g. "DE123456789". */
  vatId: "[VAT ID, OR \"\"]",
  /** Person responsible for the site's editorial content (usually you), with the address above. */
  contentResponsible: "[NAME OF THE PERSON RESPONSIBLE FOR CONTENT]",
  /** How long enquiry emails are kept before deletion, in plain words, e.g. "12 months after our last contact". */
  enquiryRetention: "[HOW LONG YOU KEEP ENQUIRIES, E.G. 12 MONTHS AFTER OUR LAST CONTACT]",
  /** The data-protection authority visitors can complain to (usually the one for your state or country). */
  supervisoryAuthority: "[NAME OF YOUR DATA-PROTECTION SUPERVISORY AUTHORITY]",
  /** The date these legal texts were last updated. */
  updated: "29 September 2026",
} as const;

// ── End of the block to fill in. Nothing below needs editing. ──────────────

/** Placeholders still waiting to be filled in (used by the build warning). */
export const unfilled = () =>
  Object.entries(legal)
    .filter(([, v]) => typeof v === "string" && v.includes("["))
    .map(([k]) => k);
