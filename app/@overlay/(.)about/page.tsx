import { Overlay } from "@/components/Overlay";
import { AboutBody } from "@/components/AboutBody";
import { ShaderBackground } from "@/components/ui/blue-halftone";

/* /about opened from inside the site: an overlay over whatever is behind. */
export default function AboutOverlay() {
  return (
    <Overlay label="About" background={<ShaderBackground className="pointer-events-none absolute inset-0" />}>
      <AboutBody />
    </Overlay>
  );
}
