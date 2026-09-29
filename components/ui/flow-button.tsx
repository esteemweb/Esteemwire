import Link from "next/link";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

/* The flow button: a pill whose label slides right while a circle of the
   second colour blooms from its centre, one arrow leaves on the right and
   another enters on the left, and the corners tighten. Adapted from the
   shadcn "flow-button": sizes are explicit (this project's Tailwind spacing
   unit is 0.1rem), and the colours come from CSS variables so it takes the
   page's palette:
     --flow-bg / --flow-fg      at rest
     --flow-fill / --flow-on    the hover bloom and the text on it
   It renders an <a> when given `href`, a <button> otherwise. */

type Props = {
  text: string;
  href?: string;
  external?: boolean;
  className?: string;
  style?: React.CSSProperties;
  type?: "button" | "submit";
  disabled?: boolean;
};

export function FlowButton({ text, href, external, className = "", style, type = "button", disabled }: Props) {
  const cls = `flow-button group relative inline-flex h-[5.6rem] items-center overflow-hidden rounded-[100px] border-[1.5px] px-[3.2rem] text-copy font-medium tracking-[-0.01em] transition-[border-radius,color,transform,border-color] duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:rounded-[1.4rem] active:scale-[0.95] ${className}`;
  const inner = (
    <>
      {/* left arrow: enters on hover */}
      <ArrowRight aria-hidden="true" className="flow-arrow absolute left-[-25%] z-[9] size-[1.8rem] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:left-[1.8rem]" />
      {/* label */}
      <span className="relative z-[1] -translate-x-[1.2rem] transition-transform duration-[800ms] ease-out group-hover:translate-x-[1.2rem]">{text}</span>
      {/* the bloom */}
      <span aria-hidden="true" className="flow-bloom absolute left-1/2 top-1/2 aspect-square w-[1.6rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:w-[125%] group-hover:opacity-100" />
      {/* right arrow: leaves on hover */}
      <ArrowRight aria-hidden="true" className="flow-arrow absolute right-[1.8rem] z-[9] size-[1.8rem] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:right-[-25%]" />
    </>
  );
  return href ? (
    <a href={href} className={cls} style={style} {...(external ? { target: "_blank", rel: "noopener" } : {})}>
      {inner}
    </a>
  ) : (
    <button type={type} className={`${cls} disabled:pointer-events-none disabled:opacity-60`} style={style} disabled={disabled}>
      {inner}
    </button>
  );
}

/* The round member of the family, for icon buttons. It sits inside a link
   or button that carries `group`: on hover the second colour blooms from
   the centre while the arrow slides out and a twin slides in from the other
   side (or the cross turns a quarter). Colours: the same four --flow-* vars. */
export function FlowIcon({ icon = "right", className = "" }: { icon?: "right" | "left" | "close"; className?: string }) {
  const Icon = icon === "close" ? X : icon === "left" ? ArrowLeft : ArrowRight;
  const glyph = "size-[45%] stroke-[1.75]";
  return (
    <span className={`flow-round relative inline-flex flex-none items-center justify-center overflow-hidden rounded-full ${className}`} data-icon={icon}>
      <span aria-hidden="true" className="flow-bloom absolute left-1/2 top-1/2 size-0 -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <Icon aria-hidden="true" className={`flow-glyph flow-glyph-out relative z-[1] ${glyph}`} />
      {icon !== "close" && <Icon aria-hidden="true" className={`flow-glyph flow-glyph-in absolute z-[1] ${glyph}`} />}
    </span>
  );
}

/* The text member of the family, for the chrome's small labels. On hover a
   pill blooms out from the centre behind the word while the word rolls up
   and a copy rolls in from below. It paints in currentColor, so inside the
   chrome's difference blend the pill is white on the room and inverts to
   dark over a coloured sheet by itself. Negative margins keep the label on
   the same spot as plain text would sit. */
export function FlowLink({ href, children, current, dim, className = "" }: { href: string; children: string; current?: boolean; dim?: boolean; className?: string }) {
  return (
    <Link href={href} aria-current={current ? "page" : undefined} className={`flow-link group relative -mx-[1.1rem] -my-[0.6rem] inline-flex overflow-hidden rounded-full px-[1.1rem] py-[0.6rem] ${dim ? "flow-link-dim" : ""} ${className}`}>
      <span aria-hidden="true" className="flow-link-bloom absolute inset-0 rounded-full" />
      <span className="relative block overflow-hidden">
        <span className="flow-link-roll block">
          <span className="block">{children}</span>
          <span aria-hidden="true" className="absolute left-0 top-full block">
            {children}
          </span>
        </span>
      </span>
    </Link>
  );
}
