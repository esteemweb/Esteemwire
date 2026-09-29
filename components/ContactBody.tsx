import { site } from "@/content/site";
import { ContactForm } from "./ContactForm";

export function ContactBody({ centred = true }: { centred?: boolean }) {
  return (
    <div className={`flex flex-col ${centred ? "items-center text-center" : "items-start"}`}>
      <h1 className="sr-only">Contact {site.name}</h1>
      <p className="max-w-[30rem] text-body s:max-w-[32.5rem]">
        Tell us what you are building and when you need it. We reply within two working days.
      </p>
      <ContactForm />
      <p className="label mt-25 opacity-60">
        or <a href={`mailto:${site.email}`} className="underline underline-offset-4">{site.email}</a>
      </p>
    </div>
  );
}
