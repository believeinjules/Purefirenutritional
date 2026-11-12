/**
 * Sample Pepita questions through the real answer pipeline with no LLM key (the deterministic
 * answer users get whenever the LLM is off or failing), plus the verified data the LLM would see.
 *   npx tsx scripts/pepita-samples.ts [out.md]
 */
import { writeFileSync } from "node:fs";
import { products } from "../client/src/data/products";
import { buildCatalog } from "../shared/peppy/catalog";
import { answerPeppy } from "../shared/peppy/respond";
import { verifiedFacts } from "../shared/peppy/product-data";

const QS = [
  "What's the dosage for Vesugen?",
  "How do I take Cerluten?",
  "How do I take Pinealon?",
  "How much Cartalax should I take?",
  "Tell me about Cortexin",
  "Tell me about Vesugen",
  "What peptides help with sleep?",
  "How do I take Revilab SL 02?",
  "What's the difference between Cerluten and Pinealon?",
  "Vesugen or Ventfort?",
];
const catalog = buildCatalog(products as never);
const out: string[] = [];
for (const q of QS) {
  const { response: r } = await answerPeppy({ message: q, history: [] }, { catalog });
  out.push(`## ${q}`, "", `**summary:** ${r.summary}`);
  if (r.dosingFacts) out.push(`**dosing box:** ${r.dosingFacts.dose} (${r.dosingFacts.source})`);
  for (const s of r.sections ?? []) out.push(`- **${s.heading ?? ""}** ${s.body.replace(/\n+/g, " ")}`);
  out.push(`- cards: ${r.products.map(p => p.product.name + (p.protocol ? ` [${p.protocol}]` : "")).join("; ") || "none"}`, "");
}
out.push("## LLM verifiedData (what the model may state)", "");
for (const id of ["vesugen", "cerluten", "pinealon"]) out.push(`- ${id}: ${JSON.stringify(verifiedFacts(id)).slice(0, 600)}`);
const file = process.argv[2];
if (file) writeFileSync(file, out.join("\n") + "\n");
console.log(out.join("\n"));
