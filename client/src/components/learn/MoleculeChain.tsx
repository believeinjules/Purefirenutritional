import { useId } from "react";

/**
 * Conceptual molecular illustrations (inline SVG, no libraries).
 * Not actual chemical structures — every figure says so in its caption.
 */
/** Brand Advisor: flat accent + one tint only; grey links. */
const TINT = "#F2B3AA";
const WARM = ["#E06050", TINT];
const ACCENT = "#E06050";

type Variant = "complex" | "defined" | "chain" | "blend" | "formula";

function bead(x: number, y: number, r: number, fill: string, key: string | number, label?: string) {
  return (
    <g key={key}>
      <circle cx={x} cy={y} r={r} fill={fill} />
      {label ? (
        <text x={x} y={y + 3.5} textAnchor="middle" fontSize={r * 0.95} fill={fill === TINT ? "#7a2e25" : "#fff"} fontFamily="Inter, sans-serif" fontWeight={500}>
          {label}
        </text>
      ) : null}
    </g>
  );
}

/** Several tangled chains of varied length (natural complexes). Deterministic, so SSR == client. */
function ComplexArt() {
  const chains = [
    { n: 9, x0: 18, y0: 30, dx: 13, amp: 10, ph: 0 },
    { n: 6, x0: 40, y0: 62, dx: 14, amp: 8, ph: 1.4 },
    { n: 11, x0: 12, y0: 92, dx: 12, amp: 12, ph: 2.2 },
    { n: 4, x0: 110, y0: 40, dx: 13, amp: 7, ph: 0.6 },
    { n: 7, x0: 84, y0: 110, dx: 12, amp: 9, ph: 3.1 },
  ];
  return (
    <g>
      {chains.map((c, ci) => {
        const pts = Array.from({ length: c.n }, (_, i) => ({
          x: c.x0 + i * c.dx,
          y: c.y0 + Math.round(Math.sin(i * 1.1 + c.ph) * c.amp),
        }));
        return (
          <g key={ci} className="lm-drift" style={{ animationDelay: `${ci * 0.7}s` }}>
            <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#d6d3d1" strokeWidth={2} />
            {pts.map((p, i) => bead(p.x, p.y, 5, WARM[(i + ci * 2) % WARM.length], i))}
          </g>
        );
      })}
    </g>
  );
}

/** Identical short chains (defined synthetic sequence, e.g. A-E-D). */
function DefinedArt({ seq = ["A", "E", "D"] }: { seq?: string[] }) {
  const rows = [26, 58, 90, 122];
  const cols = [22, 102];
  return (
    <g>
      {rows.flatMap((y, ri) =>
        cols.map((x0, ci) => (
          <g key={`${ri}-${ci}`} className="lm-drift" style={{ animationDelay: `${(ri + ci) * 0.4}s` }}>
            <line x1={x0} y1={y} x2={x0 + (seq.length - 1) * 20} y2={y} stroke="#d6d3d1" strokeWidth={2} />
            {seq.map((s, i) => bead(x0 + i * 20, y, 8, i % 2 === 0 ? ACCENT : TINT, i, s))}
          </g>
        )),
      )}
    </g>
  );
}

/** Amino-acid chain explainer: beads joined by peptide bonds, with a protein for scale. */
function ChainArt() {
  const short = ["A", "E", "D", "G"];
  return (
    <g fontFamily="Inter, sans-serif">
      <text x={10} y={18} fontSize={9} fill="#6b7280">Amino acid = one bead</text>
      {bead(22, 38, 9, ACCENT, "one", "A")}
      <text x={10} y={72} fontSize={9} fill="#6b7280">Short peptide = 2–7 beads, joined by peptide bonds</text>
      <line x1={22} y1={92} x2={22 + 3 * 24} y2={92} stroke="#9ca3af" strokeWidth={2} />
      {short.map((s, i) => bead(22 + i * 24, 92, 9, WARM[i], i, s))}
      <text x={10} y={128} fontSize={9} fill="#6b7280">Protein = hundreds of beads, folded</text>
      <path
        d="M14 150 q10 -14 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 M194 150 q8 10 0 20 t-20 0 t-20 0 t-20 0 t-20 0 t-20 0 t-20 0 t-20 0 t-20 0"
        fill="none"
        stroke="#d6d3d1"
        strokeWidth={6}
        strokeLinecap="round"
      />
    </g>
  );
}

/** Several complexes plus nutrient hexagons (multi-component formulas). */
function BlendArt({ nutrients = 3 }: { nutrients?: number }) {
  return (
    <g>
      {[0, 1, 2].map((k) => (
        <g key={k} transform={`translate(${20 + k * 62} ${30 + (k % 2) * 30})`}>
          {Array.from({ length: 5 }, (_, i) => bead(i * 10, Math.round(Math.sin(i + k) * 6), 4.5, WARM[(i + k) % WARM.length], i))}
        </g>
      ))}
      {Array.from({ length: nutrients }, (_, i) => (
        <polygon
          key={`n${i}`}
          transform={`translate(${40 + i * 55} 118)`}
          points="0,-10 9,-5 9,5 0,10 -9,5 -9,-5"
          fill="none"
          stroke="#9ca3af"
          strokeWidth={2}
        />
      ))}
    </g>
  );
}

/** One named peptide chain plus nutrient hexagons. */
function FormulaArt() {
  return (
    <g>
      <line x1={50} y1={50} x2={170} y2={50} stroke="#d6d3d1" strokeWidth={2} />
      {[0, 1, 2, 3, 4].map((i) => bead(50 + i * 30, 50, 9, WARM[i], i))}
      {[0, 1, 2, 3].map((i) => (
        <polygon key={`n${i}`} transform={`translate(${45 + i * 42} 112)`} points="0,-11 10,-5.5 10,5.5 0,11 -10,5.5 -10,-5.5" fill="none" stroke="#9ca3af" strokeWidth={2} />
      ))}
    </g>
  );
}

const TITLES: Record<Variant, string> = {
  complex: "Natural peptide complex: several chains of different lengths and sequences",
  defined: "Synthetic short peptide: many identical copies of one defined sequence",
  chain: "Amino acids link into short peptides; proteins are much longer folded chains",
  blend: "Multi-peptide formula: several peptide complexes plus nutrients",
  formula: "Peptide plus nutrient formula: a named peptide combined with nutrients",
};

export default function MoleculeChain({
  variant,
  caption = true,
  className = "",
}: {
  variant: Variant;
  caption?: boolean;
  className?: string;
}) {
  const id = `mol-${variant}-${useId().replace(/:/g, "")}`;
  return (
    <figure className={`m-0 ${className}`}>
      <svg viewBox="0 0 220 150" role="img" aria-labelledby={`${id}-t`} className="block h-auto w-full">
        <title id={`${id}-t`}>{TITLES[variant]}</title>
        {variant === "complex" && <ComplexArt />}
        {variant === "defined" && <DefinedArt />}
        {variant === "chain" && <ChainArt />}
        {variant === "blend" && <BlendArt nutrients={3} />}
        {variant === "formula" && <FormulaArt />}
      </svg>
      {caption ? (
        <figcaption className="mt-2 text-[11px] italic text-gray-500">
          Conceptual molecular illustration, not an actual chemical structure.
        </figcaption>
      ) : null}
    </figure>
  );
}
