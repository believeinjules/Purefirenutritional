# Help people choose (shop by system, protocols, Peppy hand-off, doctor questions)

## Shop by system — `client/src/data/systems.ts`
- Four systems with Brand-approved names and "Is this for you?" intros.
- Collection page: `/products?system=brain|recovery|longevity|organ` (query param, no new routes,
  so nothing new to prerender). The chips sit under the category tabs.
- Membership is derived from existing site data only:
  - `listed`: the product lists already on the homepage "Guided by System" cards (ids not in the catalog skipped:
    Cerluten, Pinealon, Chondromix, Spermidine, Svetinorm).
  - Longevity also includes everything in the existing `ANTI AGING-LONGEVITY` category.
  - Organ & Foundational also includes every Cytomax/Cytogen (20/60-capsule bioregulators).
- To change membership, edit `listed` (Brand / Regulatory).

## Protocol tabs — `client/src/data/protocols.ts`
- Preventive (maintenance) | Restorative (regenerative), per product.
- **Empty on purpose.** Fill only from manufacturer protocol documents.
- `protocolReviewed: true` (Regulatory Advisor) is required before anything renders.
- Men's/Women's toggle shows only when a goal has distinct `men` and `women` schedules.

## Peppy hand-off
- Product page "Not sure? Ask Peppy" → `/ai-assistant?product=<id>&goal=<preventive|restorative>&sex=<men|women>`
  (goal/sex only once a reviewed protocol tab is chosen).
- Peppy shows "Asking about <product>", pre-selects the goal, pre-fills (does not send) a question, shows the
  reviewed schedule if one exists, and has a "Questions for my doctor" quick action.

## Questions for your doctor — `client/src/data/doctorQuestions.ts`
- The four default questions (exact wording). Card on each product page and behind the "doctor questions" link
  in each system intro. "Print / Save as PDF" prints only the card (`doctor-print.css`, scoped to
  `html.pf-print-doctor`, which is only set during that print job).
