# Pepita product dataset: notes (verified 2026-10-13)

Files: `pepita-product-dataset.json` (72 objects) and `pepita-product-dataset.csv` (72 rows). Raw captures are in `/workspace/pepita-live/` (live page renders `*.html`, `live-text.json`, manufacturer pages `mfr/pages/*.html`, `mfr/mfr-sections.json`, `mfr/bulk.json`). The builder script is `/workspace/pepita-live/build.py`.

## Confidence scale
- **verified**: two independent sources agree (the Pure Fire page and the manufacturer label), or a PubMed record was checked.
- **manufacturer-claim**: printed only on the manufacturer or dealer product page (background source).
- **unverified**: no source found. The field is left empty.

`overall_status = full` means ingredients, label directions and pack size all come from a manufacturer document. It does NOT mean contraindications or human studies are filled in, because those are empty for almost every product (see the gaps below).

## Product list (72 visible; hidden ones excluded: femalin, temero-genero, trezvon, olecap, previn, regenart, gelmigon)

The visible set was taken from the live sitemap (72 /products/ URLs). It matches repo `products.ts` (79 entries) minus the 7 hidden ones exactly.

| slug | line | formulation | status | # conflicts |
|---|---|---|---|---|
| alvenorm-forte | other (Peptides nutraceutical / treatment-and-prophylactic line) | oral liquid | full | 1 |
| anti-age-nb-activity | other (Anti-Age Complex NB) | liquid concentrate (drops in water) | full | 1 |
| anti-age-nb-health | other (Anti-Age Complex NB) | capsule | full | 1 |
| anti-wrinkle-serum-7 | other (topical cosmetic) | topical serum | unverified | 0 |
| bonomarlot | Cytomax natural complex | capsule | full | 3 |
| calsil-t | other (Peptides nutraceutical / treatment-and-prophylactic line) | tablet (per Pure Fire description only) | unverified | 1 |
| cartalax | Cytogen synthetic | capsule | full | 2 |
| chelohart | Cytomax natural complex | capsule | full | 2 |
| complex-3d | other (Peptides nutraceutical / treatment-and-prophylactic line) | capsule | full | 0 |
| complex-3r | other (Peptides nutraceutical / treatment-and-prophylactic line) | tablet | full | 1 |
| crystagen | Cytogen synthetic | capsule | full | 1 |
| digemax | other (Peptides nutraceutical / treatment-and-prophylactic line) | oral liquid | full | 1 |
| endoluten | Cytomax natural complex | capsule | full | 3 |
| ensil | other (Peptides nutraceutical / treatment-and-prophylactic line) | capsule | full | 1 |
| felicita | other (Peptides nutraceutical / treatment-and-prophylactic line) | tablet | full | 1 |
| getrufline | other (Peptides nutraceutical / treatment-and-prophylactic line) | chewable truffle | full | 1 |
| gotratix | Cytomax natural complex | capsule | full | 2 |
| gpl-femme | other (Cytomax complex – GPL) | capsule | full | 2 |
| gpl-man | other (Cytomax complex – GPL) | capsule | full | 2 |
| imusil | other (Peptides nutraceutical / treatment-and-prophylactic line) | capsule | full | 1 |
| indosine | other (Peptides nutraceutical / treatment-and-prophylactic line) | tablet | full | 1 |
| levain | other (Peptides nutraceutical / treatment-and-prophylactic line) | tablet | full | 1 |
| likam | other (Peptides nutraceutical / treatment-and-prophylactic line) | tablet | full | 1 |
| mamiton | other (Peptides nutraceutical / treatment-and-prophylactic line) | capsule | full | 1 |
| mesotel | other (Peptides nutraceutical / treatment-and-prophylactic line) | oral liquid | full | 1 |
| mesotel-beauty | other (Peptides nutraceutical / treatment-and-prophylactic line) | oral liquid | full | 1 |
| mesotel-neo | other (Peptides nutraceutical / treatment-and-prophylactic line) | oral liquid | full | 1 |
| panaxod | other (Peptides nutraceutical / treatment-and-prophylactic line) | capsule | full | 1 |
| pangluin | other (Peptides nutraceutical / treatment-and-prophylactic line) | oral liquid | full | 1 |
| pielotax | Cytomax natural complex | capsule | full | 1 |
| pinalex-tab | other (Peptides nutraceutical / treatment-and-prophylactic line) | tablet | full | 1 |
| prime-peptide-brain | Prime Peptide | capsule | full | 1 |
| prime-peptide-collagen | Prime Peptide | capsule | full | 2 |
| prime-peptide-joints | Prime Peptide | capsule | full | 1 |
| prime-peptide-omega | Prime Peptide | capsule | full | 1 |
| prime-peptide-protect | Prime Peptide | capsule | full | 1 |
| renefort | other (Peptides nutraceutical / treatment-and-prophylactic line) | capsule | full | 1 |
| retisil | other (Peptides nutraceutical / treatment-and-prophylactic line) | oral liquid | full | 1 |
| reviform-cocktail | other (Peptides nutraceutical / treatment-and-prophylactic line) | powder | full | 1 |
| revifort | other (Peptides nutraceutical / treatment-and-prophylactic line) | capsule | full | 2 |
| revilab-anti-age | Revilab (Revilab Pro preparations) | capsule | full | 1 |
| revilab-ml-01 | Revilab (ML capsules) | capsule | full | 1 |
| revilab-ml-02 | Revilab (ML capsules) | capsule | full | 1 |
| revilab-ml-03 | Revilab (ML capsules) | capsule | full | 1 |
| revilab-ml-04 | Revilab (ML capsules) | capsule | full | 1 |
| revilab-ml-05 | Revilab (ML capsules) | capsule | full | 1 |
| revilab-ml-06 | Revilab (ML capsules) | capsule | full | 1 |
| revilab-ml-07 | Revilab (ML capsules) | capsule | full | 1 |
| revilab-ml-08 | Revilab (ML capsules) | capsule | full | 1 |
| revilab-ml-09 | Revilab (ML capsules) | capsule | full | 1 |
| revilab-pro-elements | Revilab (Revilab Pro preparations) | tablet (dissolve in mouth) | full | 1 |
| revilab-sl-01 | Revilab (SL sublingual) | sublingual liquid (drops) | full | 1 |
| revilab-sl-02 | Revilab (SL sublingual) | sublingual liquid (drops) | full | 1 |
| revilab-sl-03 | Revilab (SL sublingual) | sublingual liquid (drops) | full | 2 |
| revilab-sl-04 | Revilab (SL sublingual) | sublingual liquid (drops) | full | 1 |
| revilab-sl-05 | Revilab (SL sublingual) | sublingual liquid (drops) | full | 1 |
| revilab-sl-06 | Revilab (SL sublingual) | sublingual liquid (drops) | full | 1 |
| revilab-sl-07 | Revilab (SL sublingual) | sublingual liquid (drops) | full | 3 |
| revilab-sl-08 | Revilab (SL sublingual) | sublingual liquid (drops) | full | 1 |
| revilab-sl-09 | Revilab (SL sublingual) | sublingual liquid (drops) | full | 1 |
| revilab-sl-10 | Revilab (SL sublingual) | sublingual liquid (drops) | full | 2 |
| revimite | other (Peptides nutraceutical / treatment-and-prophylactic line) | oral spread/paste | full | 1 |
| reviplant | other (Peptides nutraceutical / treatment-and-prophylactic line) | oral liquid | full | 1 |
| rinolax | other (Peptides nutraceutical / treatment-and-prophylactic line) | nasal balm spray | partial | 1 |
| testoluten | Cytomax natural complex | capsule | full | 2 |
| thyreogen | Cytomax natural complex | capsule | full | 2 |
| ventfort | Cytomax natural complex | capsule | full | 1 |
| vesugen | Cytogen synthetic | capsule | full | 2 |
| visoluten | Cytomax natural complex | capsule | full | 1 |
| vladonix | Cytomax natural complex | capsule | full | 1 |
| volustom | other (Peptides nutraceutical / treatment-and-prophylactic line) | powder | full | 1 |
| zinsil-t | other (Peptides nutraceutical / treatment-and-prophylactic line) | tablet (chewable) | full | 1 |

## Sources used
1. Live Pure Fire product pages: https://www.purefirenutritional.com/products/<slug>, rendered with headless Chrome on 2026-10-13. Plain fetch returns only the "Loading product..." SPA shell.
2. Repo `/workspace/Purefirenutritional/client/src/data/products.ts` (commit 7fab332, 2026-10-03).
3. Manufacturer catalog (BACKGROUND only): peptideproduct.com (Peptides / SIA NPCRIZ Europe) product pages, one per product URL in `source_documents`.
4. Dealer page (secondary) used only for Rinolax: peptide-products.com. The Zinsil-T per-tablet amounts come from the same dealer.
5. PubMed E-utilities (esearch / esummary / efetch) for product-name human studies.
6. `/workspace/khavinson-product-lines.md` (product-line taxonomy) and `/workspace/purefire-bioregulator-page-verification.md` (prior PMID checks). `/workspace/pepita-product-data-gaps.csv` did not exist.

## Gap summary
- **Contraindications/warnings**: printed on the manufacturer page only for Pangluin Forte. They are unverified for the other 71 products. The EN manufacturer pages do not print a contraindications block. The Russian labels or physical boxes need checking.
- **Human studies**: only Vesugen (PMIDs 25051774, 26390612, 28539017; abstracts do not state dose or duration) and a peptide-level study for Pangluin (pancragen, PMID 22448364; not the product itself). No PubMed hits for Endoluten, Vladonix, Ventfort, Bonomarlot, Gotratix, Pielotax, Testoluten, Visoluten, Revilab, or GPL by product name. Cartalax and Crystagen hits are cell or animal studies only, so they are not recorded.
- **Maintenance/preventive/intensive protocols**: no manufacturer document found for any product. The Cytomax and Cytogen pages state only "1 month, repeat after 3-6 months". Revifort has a 15-days-on / 10-days-off schedule.
- **Quantities**: printed for Cytomax and Cytogen (peptide mg per daily dose), GPL (mg per capsule), Zinsil-T (dealer), Pangluin (glycyrrhizic acid), and Prime Peptide (total 2190 mg/3 caps only). Revilab ML/SL, the Revilab Pro products and most nutraceuticals print ingredients but no per-ingredient amounts.
- **Unverified products**: calsil-t (no manufacturer page under that name; "Calcium Complex" is the likely match but unconfirmed) and anti-wrinkle-serum-7 (no manufacturer page found). Rinolax is partial (secondary dealer page, no pack size).
- **Sex-specific notes**: only where the manufacturer states them (GPL Man/Femme, Testoluten, ML 07/08, SL 09, Mamiton).
- **Body system**: a short label based on the manufacturer "Purpose" tags. The raw tags are kept in `manufacturer_purpose_tags`. Some tags are disease-category words, so do not surface them to customers.

## Conflicts between sources

### Alvenorm Forte (alvenorm-forte)
- Pure Fire page has no directions, but the manufacturer page has them.
### Anti-Age Complex NB Activity (anti-age-nb-activity)
- Pure Fire page has no directions, but the manufacturer page has them.
### Anti-Age Complex NB Health (anti-age-nb-health)
- Pure Fire page has no directions, but the manufacturer page has them.
### Bonomarlot (bonomarlot)
- Directions: Pure Fire "1–2 capsules 1–2 times daily with meals. Maintenance: 20-capsule vial (10 days). Intensive: N60 format (2 caps twice daily for 30 days)." vs manufacturer "adults by 1 or 2 capsules 2 times a day during meals; 1 month; repeat after 3-6 months" (frequency 1–2×/day vs 2×/day).
- Pure Fire maintenance/intensive (20-cap = maintenance, N60 = intensive) protocol not found on the manufacturer page.
- Live price differs from repo products.ts: live "20 Capsules | $77.99 | 60 Capsules | $199.99" vs repo "20 Capsules | $77.99 | 60 Capsules | $204.99" (live is likely the Firestore override).
### Calsil-T (calsil-t)
- No manufacturer page named "Calsil-T" was found. The closest is "Calcium Complex" (peptideproduct.com/.../calcium_complex/: 1 tablet three times a day with meals, 4–6 weeks). The identity is unconfirmed, so it is not used.
### Cartalax (cartalax)
- Directions: Pure Fire "1–2 capsules 1–2 times daily with meals. Course: 30 days. Repeat every 3–6 months." vs manufacturer "adults by 1 or 2 capsules 2 times a day during meals; 1 month; repeat after 3-6 months" (frequency 1–2×/day vs 2×/day).
- Pure Fire live page calls AC-4 "Ala-Glu-Asp (AED, T-31)". Manufacturer lists AC-4 amino acids (alanine, glutamic acid, aspartic acid) but does not print a sequence.
### Chelohart (chelohart)
- Directions: Pure Fire "1–2 capsules 1–2 times daily with meals. Maintenance: 20-capsule vial. Intensive: N60 format." vs manufacturer "adults by 1 or 2 capsules 2 times a day during meals; 1 month; repeat after 3-6 months" (frequency 1–2×/day vs 2×/day).
- Pure Fire maintenance/intensive (20-cap = maintenance, N60 = intensive) protocol not found on the manufacturer page.
### Complex 3R (complex-3r)
- Pure Fire says "Take as directed". Manufacturer: adults and children older than 14, 1 tablet once or twice a day with meal, 4-6 weeks.
### Crystagen (crystagen)
- Directions: Pure Fire "1–2 capsules 1–2 times daily with meals. Course: 30 days. Repeat every 3–6 months." vs manufacturer "adults by 1 or 2 capsules 2 times a day during meals; 1 month; repeat after 3-6 months" (frequency 1–2×/day vs 2×/day).
### Digemax (digemax)
- Pure Fire page has no directions, but the manufacturer page has them.
### Endoluten (endoluten)
- Directions: Pure Fire "1–2 capsules 1–2 times daily with meals. Maintenance: 20-capsule vial (10 days). Intensive: N60 format." vs manufacturer "adults by 1 or 2 capsules 2 times a day during meals; 1 month; repeat after 3-6 months" (frequency 1–2×/day vs 2×/day).
- Pure Fire maintenance/intensive (20-cap = maintenance, N60 = intensive) protocol not found on the manufacturer page.
- Pure Fire page has claims not on the manufacturer page (e.g. "Clinically proven to lengthen telomeres", "extending healthy lifespan by 30–40%"). Unsourced; flag for compliance.
### Ensil (ensil)
- Pure Fire omits several label vitamins (A, B2, B12, D, biotin) and L-cysteine. Directions match.
### Felicita (felicita)
- Pure Fire page has no directions, but the manufacturer page has them.
### Getrufline (getrufline)
- Manufacturer ingredient list (apple juice concentrate, dates, wormwood, clove, honey, cinnamon, corn, curcumin, nettle, chamomile, vitamin A) is not shown on Pure Fire. Directions match.
### Gotratix (gotratix)
- Directions: Pure Fire "1–2 capsules 1–2 times daily with meals. Maintenance: 20-capsule vial. Intensive: N60 (2 caps twice daily for 30 days)." vs manufacturer "adults by 1 or 2 capsules 2 times a day during meals; 1 month; repeat after 3-6 months" (frequency 1–2×/day vs 2×/day).
- Pure Fire maintenance/intensive (20-cap = maintenance, N60 = intensive) protocol not found on the manufacturer page.
### GPL Femme (gpl-femme)
- Pure Fire page has no directions, but the manufacturer page has them.
- Pure Fire per-peptide names match the manufacturer mg table. The label lists complexes by code (A-1/A-2/A-3/A-5/A-7/A-8/A-13/A-15) without mapping codes to organs.
### GPL Man (gpl-man)
- Pure Fire page has no directions, but the manufacturer page has them.
- Pure Fire per-peptide names match the manufacturer mg table. The label lists complexes by code (A-1/A-2/A-3/A-5/A-7/A-8/A-13/A-15) without mapping codes to organs.
### Imusil (imusil)
- Pure Fire page has no directions, but the manufacturer page has them.
### Indosine (indosine)
- Pure Fire "1-2 tablets once daily before meals; prophylactic min 1 month; therapeutic 2 months+" vs manufacturer "1 tablet once a day, with meal; 4-6 weeks". Pure Fire lists "milky white iris grass extract", which is not on the manufacturer ingredient list.
### Levain (levain)
- Pure Fire page has no directions, but the manufacturer page has them.
### Likam (likam)
- Pure Fire page has no directions, but the manufacturer page has them.
### Mamiton (mamiton)
- Pure Fire page has no directions, but the manufacturer page has them.
### Mesotel (mesotel)
- Pure Fire page has no directions, but the manufacturer page has them.
### Mesotel Beauty (mesotel-beauty)
- Pure Fire page has no directions, but the manufacturer page has them.
### Mesotel Neo (mesotel-neo)
- Pure Fire page has no directions, but the manufacturer page has them.
### Panaxod (panaxod)
- Pure Fire page has no directions, but the manufacturer page has them.
### Pangluin (pangluin)
- Pure Fire page has no directions, but the manufacturer page has them.
### Pielotax (pielotax)
- Directions: Pure Fire "1–2 capsules 1–2 times daily with meals. Course: 30 days. Repeat every 3–6 months." vs manufacturer "adults by 1 or 2 capsules 2 times a day during meals; 1 month; repeat after 3-6 months" (frequency 1–2×/day vs 2×/day).
### Pinalex Tab (pinalex-tab)
- Pure Fire page has no directions, but the manufacturer page has them.
### Prime Peptide Brain (prime-peptide-brain)
- Directions: Pure Fire "1–2 capsules daily (with meals); 1–2 months" vs manufacturer "for adults 3 capsules (2190 mg) a day, with a small amount of liquid, without chewing". Pure Fire percentages (e.g. 67%, 41%, 18%, 28%) are manufacturer marketing figures, not verified.
### Prime Peptide Collagen (prime-peptide-collagen)
- Directions: Pure Fire "1–2 capsules daily (with meals); 1–2 months" vs manufacturer "for adults 3 capsules (2190 mg) a day, with a small amount of liquid, without chewing". Pure Fire percentages (e.g. 67%, 41%, 18%, 28%) are manufacturer marketing figures, not verified.
- Pure Fire says "800mg marine collagen". Amount not found in extracted manufacturer ingredient text.
### Prime Peptide Joints (prime-peptide-joints)
- Directions: Pure Fire "1–2 capsules daily (with meals); 1–2 months" vs manufacturer "for adults 3 capsules (2190 mg) a day, with a small amount of liquid, without chewing". Pure Fire percentages (e.g. 67%, 41%, 18%, 28%) are manufacturer marketing figures, not verified.
### Prime Peptide Omega (prime-peptide-omega)
- Directions: Pure Fire "1–2 capsules daily (with meals); 1–2 months" vs manufacturer "for adults 3 capsules (2190 mg) a day, with a small amount of liquid, without chewing". Pure Fire percentages (e.g. 67%, 41%, 18%, 28%) are manufacturer marketing figures, not verified.
### Prime Peptide Protect (prime-peptide-protect)
- Directions: Pure Fire "1–2 capsules daily (with meals); 1–2 months" vs manufacturer "for adults 3 capsules (2190 mg) a day, with a small amount of liquid, without chewing". Pure Fire percentages (e.g. 67%, 41%, 18%, 28%) are manufacturer marketing figures, not verified.
### Renefort (renefort)
- Pure Fire page has no directions, but the manufacturer page has them.
### Retisil (retisil)
- Pure Fire page has no directions, but the manufacturer page has them.
### Reviform Cocktail (reviform-cocktail)
- Pure Fire page has no directions, but the manufacturer page has them.
### Revifort (revifort)
- Pure Fire ingredients omit echinacea, zinc citrate, laminaria, sodium selenite and add "Beta-glucans" (not a listed ingredient). Directions are missing on Pure Fire.
- Pure Fire page has no directions, but the manufacturer page has them.
### Revilab Anti-A.G.E. (revilab-anti-age)
- Pure Fire says "Astaxanthin (100x more effective than vitamin E)". The label lists the microalgae Haematococcus pluvialis extract. The comparative claim is unsourced.
### Revilab ML 01 (revilab-ml-01)
- Directions: Pure Fire "1 capsule daily in the morning on an empty stomach" vs manufacturer "1 capsule once a day, with meal; 4-6 weeks". Pure Fire repeat "1–2 times per year" vs manufacturer "within a year, if needed".
### Revilab ML 02 (revilab-ml-02)
- Directions: Pure Fire "1 capsule daily in the morning on an empty stomach" vs manufacturer "1 capsule once a day, with meal; 4-6 weeks". Pure Fire repeat "1–2 times per year" vs manufacturer "within a year, if needed".
### Revilab ML 03 (revilab-ml-03)
- Directions: Pure Fire "1 capsule daily in the morning on an empty stomach" vs manufacturer "1 capsule once a day, with meal; 4-6 weeks". Pure Fire repeat "1–2 times per year" vs manufacturer "within a year, if needed".
### Revilab ML 04 (revilab-ml-04)
- Directions: Pure Fire "1 capsule daily in the morning on an empty stomach" vs manufacturer "1 capsule once a day, with meal; 4-6 weeks". Pure Fire repeat "1–2 times per year" vs manufacturer "within a year, if needed".
### Revilab ML 05 (revilab-ml-05)
- Directions: Pure Fire "1 capsule daily in the morning on an empty stomach" vs manufacturer "1 capsule once a day, with meal; 4-6 weeks". Pure Fire repeat "1–2 times per year" vs manufacturer "within a year, if needed".
### Revilab ML 06 (revilab-ml-06)
- Directions: Pure Fire "1 capsule daily in the morning on an empty stomach" vs manufacturer "1 capsule once a day, with meal; 4-6 weeks". Pure Fire repeat "1–2 times per year" vs manufacturer "within a year, if needed".
### Revilab ML 07 (revilab-ml-07)
- Directions: Pure Fire "1 capsule daily in the morning on an empty stomach" vs manufacturer "1 capsule once a day, with meal; 4-6 weeks". Pure Fire repeat "1–2 times per year" vs manufacturer "within a year, if needed".
### Revilab ML 08 (revilab-ml-08)
- Directions: Pure Fire "1 capsule daily in the morning on an empty stomach" vs manufacturer "1 capsule once a day, with meal; 4-6 weeks". Pure Fire repeat "1–2 times per year" vs manufacturer "within a year, if needed".
### Revilab ML 09 (revilab-ml-09)
- Directions: Pure Fire "1 capsule daily in the morning on an empty stomach" vs manufacturer "1 capsule once a day, with meal; 4-6 weeks". Pure Fire repeat "1–2 times per year" vs manufacturer "within a year, if needed".
### Revilab Pro Elements (revilab-pro-elements)
- Pure Fire page has no directions, but the manufacturer page has them.
### Revilab SL 01 (revilab-sl-01)
- Directions: Pure Fire "4–6 drops ... in the morning; 4–6 weeks" vs manufacturer "5-10 drops under the tongue 2 times a day; 1 month".
### Revilab SL 02 (revilab-sl-02)
- Directions: Pure Fire "4–6 drops ... in the morning; 4–6 weeks" vs manufacturer "5-10 drops under the tongue 2 times a day; 1 month".
### Revilab SL 03 (revilab-sl-03)
- Directions: Pure Fire "4–6 drops ... in the morning; 4–6 weeks" vs manufacturer "5-10 drops under the tongue 2 times a day; 1 month".
- Manufacturer lists the AA-1 amino acids as alanine, glutamic acid, aspartic acid, lysine. ML products list AA-1 as alanine/glutamic/aspartic/glycine (internal manufacturer inconsistency).
### Revilab SL 04 (revilab-sl-04)
- Directions: Pure Fire "4–6 drops ... in the morning; 4–6 weeks" vs manufacturer "5-10 drops under the tongue 2 times a day; 1 month".
### Revilab SL 05 (revilab-sl-05)
- Directions: Pure Fire "4–6 drops ... in the morning; 4–6 weeks" vs manufacturer "5-10 drops under the tongue 2 times a day; 1 month".
### Revilab SL 06 (revilab-sl-06)
- Directions: Pure Fire "4–6 drops ... in the morning; 4–6 weeks" vs manufacturer "5-10 drops under the tongue 2 times a day; 1 month".
### Revilab SL 07 (revilab-sl-07)
- Directions: Pure Fire "4–6 drops ... in the morning; 4–6 weeks" vs manufacturer "5-10 drops under the tongue 2 times a day; 1 month".
- Ingredients: Pure Fire lists Vitamin B1 (thiamine). Manufacturer lists folic acid + Vitamin B12 and no B1.
- Manufacturer lists AA-3 in SL 07 as (glutamic acid, aspartic acid, proline). Elsewhere AA-3 = lysine + glutamic acid (internal manufacturer inconsistency).
### Revilab SL 08 (revilab-sl-08)
- Directions: Pure Fire "4–6 drops ... in the morning; 4–6 weeks" vs manufacturer "5-10 drops under the tongue 2 times a day; 1 month".
### Revilab SL 09 (revilab-sl-09)
- Directions: Pure Fire "4–6 drops ... in the morning; 4–6 weeks" vs manufacturer "5-10 drops under the tongue 2 times a day; 1 month".
### Revilab SL 10 (revilab-sl-10)
- Directions: Pure Fire "4–6 drops ... in the morning; 4–6 weeks" vs manufacturer "5-10 drops under the tongue 2 times a day; 1 month".
- Manufacturer lists the AA-1 amino acids as alanine, glutamic acid, aspartic acid, lysine. ML products list AA-1 as alanine/glutamic/aspartic/glycine (internal manufacturer inconsistency).
### Revimite (revimite)
- Pure Fire page has no directions, but the manufacturer page has them.
### Reviplant (reviplant)
- Pure Fire page has no directions, but the manufacturer page has them.
### Rinolax (rinolax)
- Pure Fire page has no directions, but the manufacturer page has them.
### Testoluten (testoluten)
- Directions: Pure Fire "Prevention: 1 capsule twice daily with meals for 30 days. Repeat every 4–6 months." vs manufacturer "adults by 1 or 2 capsules 2 times a day during meals; 1 month; repeat after 3-6 months" (frequency 1–2×/day vs 2×/day).
- Pure Fire "1 capsule twice daily ... Repeat every 4–6 months" vs manufacturer "1 or 2 capsules 2 times a day ... repeat after 3-6 months".
### Thyreogen (thyreogen)
- Directions: Pure Fire "1–2 capsules 1–2 times daily with meals. Course: 10–30 days. Repeat in 4–6 months." vs manufacturer "adults by 1 or 2 capsules 2 times a day during meals; 1 month; repeat after 3-6 months" (frequency 1–2×/day vs 2×/day).
- Pure Fire course "10–30 days, repeat in 4–6 months" vs manufacturer "1 month, repeat after 3-6 months". Pure Fire spells it "Tyreogen" in body text.
### Ventfort (ventfort)
- Directions: Pure Fire "1–2 capsules 1–2 times daily with meals. Course: 30 days. Repeat every 3–6 months." vs manufacturer "adults by 1 or 2 capsules 2 times a day during meals; 1 month; repeat after 3-6 months" (frequency 1–2×/day vs 2×/day).
### Vesugen (vesugen)
- Directions: Pure Fire "1–2 capsules 1–2 times daily with meals. Course: 30 days. Repeat every 3–6 months." vs manufacturer "adults by 1 or 2 capsules 2 times a day during meals; 1 month; repeat after 3-6 months" (frequency 1–2×/day vs 2×/day).
- Pure Fire ingredient code "AS-2" vs manufacturer "AC-2".
### Visoluten (visoluten)
- Directions: Pure Fire "1–2 capsules 1–2 times daily with meals. Course: 30 days. Repeat every 3–6 months." vs manufacturer "adults by 1 or 2 capsules 2 times a day during meals; 1 month; repeat after 3-6 months" (frequency 1–2×/day vs 2×/day).
### Vladonix (vladonix)
- Directions: Pure Fire "1–2 capsules 1–2 times daily with meals. Course: 30 days. Repeat every 3–6 months." vs manufacturer "adults by 1 or 2 capsules 2 times a day during meals; 1 month; repeat after 3-6 months" (frequency 1–2×/day vs 2×/day).
### Volustom (volustom)
- Pure Fire page has no directions, but the manufacturer page has them.
### Zinsil-T (zinsil-t)
- Dealer pages say "20 capsules of 1,0 g". The manufacturer page says "20 tablets by 1,0 g". Pure Fire matches the directions.

## Compliance flags (no disease-treatment claims)
Manufacturer pages are full of disease language: oncology, hypertension, anemia, diabetes, helminthiasis, and so on. None of it was copied into the dataset's free-text fields except as raw `ingredients_as_printed` / `label_directions_as_printed` label text and the PubMed population descriptions, which avoid naming diseases. Pure Fire live pages still carry unsourced claims, for example Endoluten "clinically proven to lengthen telomeres" and "30–40% lifespan", Prime Peptide % figures, Crystagen "80% ... did not contract influenza", and Ventfort "40–47% endurance". These are worth a regulatory review.

## Update 2026-10-13 (follow-up)
- New fields: `label_directions` (list of {source, text, language}: EN peptideproduct.com, plus RU peptid.ru for the 13 Cytomax/Cytogen products), `manufacturer_protocols`, `research_study_regimens`, `schedule_type` (+ `schedule_type_detail`), `differs_from_generic_daily_template` with `generic_template_comparison`, and `organ_association` (+ source and confidence). The EN directions text was renamed to `label_directions_en_as_printed`.
- schedule_type counts: daily 66, intermittent 1 (Revifort), other 1 (Endoluten, conflicting sources), unverified 4 (Anti-Wrinkle Serum 7, Calsil-T, Reviform cocktail, Rinolax).
- Contraindications were added from peptid.ru (RU) for the 13 Cytomax/Cytogen products.
- Endoluten details: see `pepita-endoluten-verification.md`.
