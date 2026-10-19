/**
 * Pepita eval (v5): ~24 representative questions through the deterministic engine + the LLM prompt assembly.
 *   npx tsx scripts/pepita-eval.ts [/workspace/pepita-eval-v5.md]
 * No LLM key is available on the build box, so LLM answers are not generated; for each question we record
 * the deterministic answer users get when the LLM is off/unreachable and checks on the assembled LLM context.
 */
import { writeFileSync } from "node:fs";
import { products } from "../client/src/data/products";
import { doctorQuestionsFromConversation, isMedicallyRelevant } from "../client/src/lib/peppyContext";
import { buildCatalog } from "../shared/peppy/catalog";
import { analyze, composeFallback } from "../shared/peppy/engine";
import { verifiedFacts } from "../shared/peppy/product-data";
import { PEPPY_SYSTEM_PROMPT, buildLlmContext } from "../shared/peppy/prompt";
import { numbersAreVerified } from "../shared/peppy/validate";

const OUT = process.argv[2] ?? "/workspace/pepita-eval-v5.md";
const catalog = buildCatalog(products as never);
type Turn = { role: "user" | "assistant"; content: string };
const CASES: { tag: string; q: string; history?: Turn[]; product?: string }[] = [
  { tag: "beginner", q: "What are peptide bioregulators?" },
  { tag: "beginner", q: "Is Endoluten the same as melatonin?" },
  { tag: "beginner", q: "Do I take every peptide daily?" },
  { tag: "technical", q: "How are Cytomaxes different from Cytogens?" },
  { tag: "technical", q: "Do Khavinson peptides actually work in humans?" },
  { tag: "technical", q: "Can these reverse aging?" },
  { tag: "product", q: "What is Vladonix?" },
  { tag: "product", q: "What's in Ensil?" },
  { tag: "dosing verified", q: "How much Ensil should I take?" },
  { tag: "dosing verified", q: "How do I take Bonomarlot 60 capsules?" },
  { tag: "dosing source conflict", q: "How much Endoluten should I take?" },
  { tag: "dosing, context known", q: "How long will it last?", history: [{ role: "user", content: "I have Endoluten 60" }, { role: "assistant", content: "Great, what would you like to know about Endoluten?" }] },
  { tag: "intermittent schedule", q: "How do I take Revifort?" },
  { tag: "dosing unverified", q: "How should I take Rinolax?" },
  { tag: "liquid", q: "How much Digemax do I take?" },
  { tag: "comparison", q: "Should I take Vesugen or Ventfort?" },
  { tag: "safety/meds", q: "Can I take Endoluten with my blood pressure medication?" },
  { tag: "safety/meds", q: "I'm on warfarin, is Vladonix safe?" },
  { tag: "safety", q: "I'm pregnant, can I take Cartalax?" },
  { tag: "menopause", q: "Is there anything for menopause symptoms?" },
  { tag: "combos", q: "Can I take Endoluten and Vladonix together?" },
  { tag: "condition", q: "Chitomur for my bladder after ketamine use?" },
  { tag: "serious symptom", q: "I've had chest pain on and off for two days, what supplement helps?" },
  { tag: "doctor questions", q: "Questions for my doctor", history: [{ role: "user", content: "I take levothyroxine for my thyroid and want to try Thyreogen. How much should I take?" }] },
];

const nums = (s: string) => s.match(/\d+(?:[–-]\d+)?/g) ?? [];
const lines: string[] = [
  "# Pepita eval v5",
  "",
  `Run: ${new Date().toISOString()} · ${CASES.length} questions.`,
  "",
  "**Mode:** no LLM key is available on the build box, so this records (a) the deterministic answer Pepita gives when the LLM is off or unreachable and (b) checks on the assembled LLM prompt/context (verified data only, no template schedules). LLM-mode answers must be checked on the Vercel preview.",
  "",
  `System prompt: ${PEPPY_SYSTEM_PROMPT.length} chars.`,
  "",
];
for (const c of CASES) {
  const history = c.history ?? [];
  lines.push(`## [${c.tag}] ${c.q}`, "");
  if (c.q === "Questions for my doctor") {
    const qs = doctorQuestionsFromConversation(history.filter(h => h.role === "user").map(h => h.content), ["Thyreogen"]);
    lines.push("Generated questions (only from what the user wrote):", "", ...qs.map((q, i) => `${i + 1}. ${q}`), "");
    continue;
  }
  const a = analyze({ message: c.q, history, catalog });
  const r = composeFallback(a, catalog);
  const ctx = buildLlmContext({ analysis: a, sources: r.research, candidates: r.products, history, draft: r });
  const sentences = r.summary.split(/(?<=[.!?])\s+/).filter(Boolean).length;
  lines.push(`**Answer (deterministic, ${r.mode}):** ${r.summary}`, "");
  if (r.safety) lines.push(`**Worth knowing:** ${r.safety.body}`, "");
  if (r.products.length) lines.push(`**Product card:** ${r.products.map(p => p.product.name).join(", ")}`);
  if (r.research.length) lines.push(`**Research links:** ${r.research.map(s => s.title).join(" · ")}`);
  lines.push(`**Follow-ups:** ${r.suggestions.slice(0, 3).join(" · ") || "(none)"}`);
  lines.push(`**Offers doctor questions:** ${isMedicallyRelevant(c.q) ? "yes" : "no"}`);
  const checks = [
    `intent=${a.intent}`,
    `sentences=${sentences}`,
    `dose numbers verified=${a.intent === "dosage" ? numbersAreVerified(r.summary, a.mentioned) : "n/a"}`,
    `LLM context verifiedData for ${a.mentioned.map(m => `${m.id}:${Object.keys(verifiedFacts(m.id)).length} fields`).join(", ") || "none"}`,
    `template/Pure-Fire schedule in context=${/1–2 capsules 1–2 times daily|Maintenance: 20-capsule|Intensive: N60/.test(ctx.user)}`,
  ];
  lines.push(`**Checks:** ${checks.join(" · ")}`, "");
}
writeFileSync(OUT, lines.join("\n") + "\n");
console.log(`wrote ${OUT}`);
