import type { Metadata } from "next";
import { ContactBody } from "@/components/ContactBody";
import { CloseButton } from "@/components/CloseButton";

export const metadata: Metadata = { title: "Contact" };

export default function Contact() {
  return (
    <main className="flex min-h-svh items-center justify-center px-30 py-100 s:px-80">
      <CloseButton />
      <div className="w-full max-w-overlay s:w-overlay-s s:max-w-none">
        <ContactBody />
      </div>
    </main>
  );
}
