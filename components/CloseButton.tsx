import Link from "next/link";
import { FlowIcon } from "./ui/flow-button";

/* The close button for About and Contact: the round flow icon (a white disc
   with the logo's violet blooming in on hover, the cross turning a quarter),
   fixed under the top-right chrome label. It always goes to the home page,
   whether About or Contact was opened as an overlay or loaded as a page;
   the room opens without the boot veil (components/gl/GLRoot `boot`). */
export function CloseButton() {
  return (
    <Link href="/" aria-label="Close" className="group fixed right-40 top-70 z-[45] s:right-80 s:top-85">
      <FlowIcon icon="close" className="page-close size-44 s:size-48" />
    </Link>
  );
}
