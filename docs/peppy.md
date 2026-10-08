# Peppy 2.0 — the /ai-assistant research assistant

Peppy answers wellness and product questions research-first: a direct answer, what the
evidence does and doesn't show (linked sources with a one-line finding and limitation each),
safety notes, and — only when relevant and allowed — up to two related products.

## How a question is answered

```
browser (/ai-assistant) ──POST /api/peppy──▶ api/_lib/peppy/handler.ts
                                               │ rate limit · input caps · no PII logging
                                               ▼
                                      shared/peppy/respond.ts  answerPeppy()
   analyze()  ─ red flags → urgent answer (no PubMed, no LLM, no products)
              ─ guards: pregnancy · children · disease-treatment · stopping a medicine
              ─ intent · curated topic · named products · follow-up turns
   live PubMed (api/_lib/peppy/pubmed.ts, optional) ─ esearch → esummary + efetch, 2 s timeouts, 6 h cache
   composeFallback() ─ curated deterministic answer (always built)
   LLM (api/_lib/peppy/llm.ts, optional) ─ JSON answer → validateLlmAnswer()
       · citations must be ids we retrieved · products must be offered candidates
       · claim filter on prose and product copy · safety notices always deterministic
       · any failure → the curated answer
```

If `/api/peppy` is unreachable or rate-limited, the browser runs the same shared engine locally
with the code catalog (`client/src/lib/peppyClient.ts`), so the page never shows an error.

## Environment variables (all optional)

| Variable | Purpose |
|---|---|
| `PEPPY_LLM_PROVIDER` | `openai`, `xai`, `gemini`, or `none`. Default: the first provider whose key is set. |
| `OPENAI_API_KEY` | OpenAI key (platform.openai.com → API keys). Default model `gpt-5-mini`. |
| `XAI_API_KEY` | xAI key (console.x.ai). Default model `grok-4.7`. |
| `GEMINI_API_KEY` | Google AI Studio key (aistudio.google.com/apikey). Default model `gemini-flash-latest`. |
| `PEPPY_MODEL` | Override the model id for the chosen provider. |
| `PEPPY_LLM_TIMEOUT_MS` | LLM timeout, 2000–25000 (default 15000). |
| `NCBI_API_KEY` | NCBI E-utilities key (ncbi.nlm.nih.gov/account → API Key). Raises PubMed's limit from 3 to 10 requests/s. |
| `NCBI_EMAIL` | Contact email NCBI asks API users to send. |

With no LLM key Peppy runs in curated mode: same UI, same safety rules, answers composed from
`shared/peppy/topics.ts` plus live PubMed. Products come from Firestore (Admin SDK credentials
already used by the admin API) merged over `client/src/data/products.ts`.

## Editing the knowledge

- `shared/peppy/research-registry.ts` — curated sources. Titles are verbatim from PubMed; run
  `node scripts/peppy-verify-registry.mjs` after any change (checks every PMID title/year and
  every guidance URL).
- `shared/peppy/topics.ts` — topic answers, product mappings (`why` / `evidenceNote` must pass the
  claim filter), follow-ups and suggestions.
- `shared/peppy/claims.ts` — claim filter, banned terms, red flags and guards.
- `shared/peppy/knowledge.test.ts` fails if a topic cites an unknown source, maps to a missing
  product, or uses non-compliant copy.

## Function budget

Vercel Hobby allows 12 functions. `api/peppy.ts` fits because the identical admin `orders` and
`customers` list routes now share `api/admin/[collection].ts` (same URLs).
`api/_lib/vercel-functions.test.ts` enforces the limit.
