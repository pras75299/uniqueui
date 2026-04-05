/* Isometric cube icon used in BentoGrid feature cards */

type IsoIconColor = "cyan" | "indigo" | "emerald";

const PALETTE: Record<IsoIconColor, { top: string; right: string; left: string }> = {
  cyan:    { top: "#22D3EE", right: "#0E7490", left: "#155E75" },
  indigo:  { top: "#818CF8", right: "#4338CA", left: "#312E81" },
  emerald: { top: "#34D399", right: "#059669", left: "#064E3B" },
};

export default function IsoIcon({ color }: { color: IsoIconColor }) {
  const p = PALETTE[color];
  return (
    <svg viewBox="0 0 60 50" className="w-10 h-10" aria-hidden>
      <polygon points="30,5 55,18 30,31 5,18"  fill={p.top} />
      <polygon points="55,18 30,31 30,47 55,34" fill={p.right} />
      <polygon points="5,18 30,31 30,47 5,34"   fill={p.left} />
    </svg>
  );
}
