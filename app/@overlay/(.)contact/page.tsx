import { Overlay } from "@/components/Overlay";
import { ContactBody } from "@/components/ContactBody";

/* /contact opened from inside the site: an overlay over whatever is behind. */
export default function ContactOverlay() {
  return (
    <Overlay label="Contact">
      <ContactBody />
    </Overlay>
  );
}
