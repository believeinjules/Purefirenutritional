#!/usr/bin/env python3
"""One-time seed of shared/product-facts.json (2026-10-14).

Inputs: the current storefront text (products.ts usage/ingredients), the RD dataset
(data/pepita-product-dataset.json) and the catalog audit v2 (/workspace/pf-catalog-audit-v2.csv).
Julia's approvals of 2026-10-14 are encoded in DECISIONS below. After seeding, edit
shared/product-facts.json directly; it is the single source for storefront usage/ingredients
and Pepita's directions. Usage: python3 scripts/seed-product-facts.py /tmp/pf/store.json AUDIT.csv
"""
import csv, json, re, sys

store = {x["id"]: x for x in json.load(open(sys.argv[1]))}
audit = list(csv.DictReader(open(sys.argv[2])))
rd = {r["slug"]: r for r in json.load(open("data/pepita-product-dataset.json"))}

ML = "Adults: 1 capsule once a day with meals. Course duration: 4–6 weeks; the course can be repeated within a year if needed."
SL = "Adults: 5–10 drops under the tongue 2 times a day. Duration of use: 1 month; can be repeated in courses. Shake before use."
PRIME = "Adults: 1 capsule 3 times a day with meals (3 capsules, 2190 mg, per day), swallowed whole with a little liquid."
CYTO_A = "Adults: 1–2 capsules 1–2 times a day with meals."
CYTO_B = "Adults: 1–2 capsules 2 times a day with meals for 1 month; can be repeated after 3–6 months."
CYTO_GROUP = ["bonomarlot", "cartalax", "chelohart", "chonluten", "crystagen", "endoluten", "glandokort", "gotratix",
              "libidon", "ovagen", "pielotax", "pinealon", "taxorest", "testoluten", "thyreogen", "ventfort", "vesugen",
              "visoluten", "vladonix", "zhenoluten", "cerluten", "sigumir", "bonothyrk", "chitomur", "stamakort",
              "suprefort", "svetinorm"]
NANO = "https://www.nanopeptidi.com/ru/peptidnye-preparaty-revilab/"
SCHEME = "https://xn----gtbckc7aib1a6g.xn--p1ai/ekspress-profilaktika-prezhdevremennogo-stareniya"

def src(url, type_, formulation=None, quote=None, translation=None):
    return {"url": url, "type": type_, "formulation": formulation, "quote": quote, "translation": translation}

# ---- audit rows -> product ids -------------------------------------------------------------
NAME_TO_ID = {v["name"].lower(): k for k, v in store.items()}
def row_ids(row):
    n = row["product name"].lower()
    sku = row["exact SKU/formulation"]
    if n.startswith("1–2× vs 2×"):
        return [i for i in CYTO_GROUP if i in store]
    m = re.match(r"maintenance/intensive – (\w+)", n)
    if m: return [m.group(1)]
    first = sku.split(";")[0].strip()
    if first in store: return [first]
    base = n.split(" – ")[0].strip()
    return [NAME_TO_ID[base]] if base in NAME_TO_ID else []

rows_by_id = {}
unmapped = []
for r in audit:
    ids = row_ids(r)
    if not ids: unmapped.append(r["product name"])
    for i in ids: rows_by_id.setdefault(i, []).append(r)

def source_type(t):
    t = t.lower()
    if "course" in t or "dealer" in t or "scheme" in t: return "course"
    if "label" in t: return "official-doc"   # manufacturer pages as printed; physical batch label not yet checked
    if "catalog" in t: return "catalog"
    return "catalog"

def audit_sources(i):
    out = []
    for r in rows_by_id.get(i, []):
        if r["product name"].startswith("1–2× vs 2×"): continue
        for u in [u.strip().split(" ")[0] for u in r["exact source URL"].split(";") if u.strip().startswith("http")]:
            if "nanopeptidi" in u or "xn--" in u: t = "course"
            elif re.match(r"https://(peptideproduct\.com|peptid\.ru)/catalog/.+/.+", u): t = "official-doc"
            else: t = "catalog"
            out.append(src(u, t, r["exact SKU/formulation"], r["original wording"] or None, r["English translation"] or None))
    seen, uniq = set(), []
    for s in out:
        k = (s["url"], s["quote"])
        if k not in seen: seen.add(k); uniq.append(s)
    return uniq

# ---- decisions (Julia, 2026-10-14) ------------------------------------------------------
D = {}
def dec(i, **kw): D.setdefault(i, {}).update(kw)

for n in range(1, 10):
    i = f"revilab-ml-0{n}"
    alt = []
    if n in (7, 8):
        alt.append({"text": "1 capsule once every 48 hours with meals for 8–12 weeks.", "source": NANO, "kind": "dealer course document"})
    alt.append({"text": "Express-prevention scheme: 1 capsule once every 3 days in the morning." if n in (1, 4, 7, 8)
                else "Express-prevention scheme: 1 capsule daily.", "source": SCHEME, "kind": "course scheme"})
    dec(i, usage=ML, basis="manufacturer-label", md="verified", mdText=ML, alt=alt,
        status="conflicting" if n in (7, 8) else "verified",
        note="Label (peptideproduct.com + peptid.ru) agrees; formulation-specific course documents differ and are educational only.")
for n in range(1, 11):
    i = f"revilab-sl-{n:02d}"
    alt = []
    if n in (3, 10):
        alt.append({"text": "5–7 drops once every 72 hours for 1–2 months.", "source": NANO, "kind": "dealer course document"})
    alt.append({"text": "Express-prevention scheme: 1 dose every 3 days." if n == 3 else "Express-prevention scheme: 3–6 drops under the tongue once a day (dose varies by formulation).",
                "source": SCHEME, "kind": "course scheme"})
    dec(i, usage=SL, basis="manufacturer-label", md="verified", mdText=SL, alt=alt,
        status="conflicting" if n in (3, 10) else "verified",
        note="Label (peptideproduct.com) agrees" + ("; peptid.ru page returns 404" if n >= 8 else "; peptid.ru agrees") + ". Course documents are educational only.")
for p in ["brain", "collagen", "joints", "omega", "protect"]:
    dec(f"prime-peptide-{p}", usage=PRIME, basis="manufacturer-label", md="verified", mdText=PRIME, status="verified",
        note="90-capsule SKU and IPH peptide match the manufacturer for this formulation; EN and RU labels agree on 3 capsules a day. No course length is printed.")
dec("revifort", usage="Adults: 1 capsule 2 times a day with meals for 15 days, then a break of at least 10 days, then another 15 days.",
    basis="manufacturer-label", md="verified", status="verified",
    composition=["Shiitake mushroom extract (6:1)", "Reishi mushroom extract (6:1)", "Maitake mushroom extract (6:1)", "Cordyceps extract (6:1)",
                 "Red echinacea top extract", "Zinc citrate", "Laminaria (kelp) extract", "Sodium selenite"])
dec("ensil", usage="Adults: 1 capsule 3 times a day with meals. Course duration: 1 month; the course can be repeated.",
    basis="manufacturer-label", md="verified", status="verified",
    composition=["Coenzyme Q10", "Nicotinamide (Vitamin PP)", "Folic acid", "Echinacea extract", "Succinic acid (amber acid)", "L-carnitine", "Vitamins B1, B5, B6", "Vitamins C and E", "L-cysteine", "Vitamin B2", "Vitamin A", "Vitamin D", "Vitamin B12", "Biotin"])
for i in ["pinalex-tab", "alvenorm-forte", "complex-3r", "cartalax", "revilab-sl-07"]:
    dec(i, basis="manufacturer-label", md="verified", status="verified")
dec("cartalax", note="Verified against peptid.ru (Julia's 2026-10-13 resolution); peptideproduct.com prints 2×/day, 1 month.")
for i in ["revilab-anti-age", "zinsil-t"]:
    dec(i, basis="page-text-matches-label", md="verified", status="verified")
dec("zinsil-t", note="Usage verified; description has disease/pathogenesis wording to soften (needs approval). Tablets vs capsules wording to check.")
dec("revilab-anti-age", note="Usage consistent with label; '100x more effective than vitamin E' astaxanthin claim is unsupported (needs approval).")
for i in ["ovagen", "pinealon", "chonluten", "taxorest", "glandokort", "libidon"]:
    dec(i, usage=None, basis="none", md="conflicting", status="conflicting",
        note="Code verified; peptid.ru 1–2×/day vs peptideproduct.com 2×/day, 1 month. Not picked; no usage line until Julia decides.")
for i in CYTO_GROUP:
    if i in store and i not in D:
        dec(i, basis="held-page-text", md="conflicting", status="conflicting",
            note="Cytomax/Cytogen frequency conflict (peptid.ru 1–2×/day vs peptideproduct.com 2×/day). Page text held.")
for i in ["bonomarlot", "chelohart", "gotratix"]:
    dec(i, note="'Maintenance/Intensive' labels appear in no manufacturer document (needs approval to remove). Frequency conflict as for all Cytomaxes.")
dec("endoluten", basis="held-page-text", md="blocked", status="blocked", note="Blocked: label vs manufacturer discrepancy; both sources recorded in options.",
    hold="Endoluten dosing HOLD: peptid.ru capsule label (1 capsule once every 3 days, 20 days–2 months) vs peptideproduct.com (1–2 capsules 2×/day, 1 month); current page text stays until Julia decides.",
    options=[{"text": "Adults: 1 capsule once every 3 days, in the morning or at midday. Average course: 20 days to 2 months.", "source": "https://peptid.ru/catalog/naturalnye-peptidnye-kompleksy-tsitomaksy/endoluten/"},
             {"text": "Adults: 1–2 capsules 2 times a day with meals; duration 1 month.", "source": "https://peptideproduct.com/catalog/peptide_products/cytomaxes/endoluten/"}])
dec("indosine", basis="held-page-text", md="blocked", status="blocked", note="Blocked: formulation version unknown.",
    hold="Indosine HOLD: formulation version unknown (current label has no iris grass and gives 1 tablet once a day); check the Pure Fire stock label.")
dec("calsil-t", basis="none", md="blocked", status="blocked", hold="Calsil-T HOLD: product identity unconfirmed; no manufacturer source.")
for i in ["anti-age-nb-activity", "anti-age-nb-health"]:
    dec(i, usage=None, basis="none", md="needs-approval", status="needs-approval",
        note="Label directions found but not yet approved for the page.")
dec("anti-age-nb-activity", options=[{"text": "Adults: 25 drops in 100 ml of water once a day.", "source": "https://peptideproduct.com/catalog/treatment_and_prophylactic/activity_anti_age_complex_nb/"}])
dec("anti-age-nb-health", options=[{"text": "Adults: 1 capsule a day; course 4–6 weeks.", "source": "https://peptideproduct.com/catalog/treatment_and_prophylactic/health_anti_age_complex_nb/"}])
for i in ["thyreogen", "vesugen"]:
    dec(i, note="Name/code fix verified (Thyreogen spelling, Vesugen AC-2); usage text matches neither manufacturer source exactly (held, conflicting).")

EVID = {
  "endoluten": ("Researchers have investigated pineal peptide preparations for night-time melatonin in small studies.", "Studies used injectable extracts; Endoluten itself has no published human trials."),
  "pinealon": ("Brain peptides have been studied in cell and animal work for neuroprotection and oxidative stress. Research note: the literature describes the EDR tripeptide (Glu-Asp-Arg); the label does not print a sequence.", "No published human trials of Pinealon as a finished product."),
}
RESEARCH_SEQ = {"pinealon": "Research note (literature, not the label): EDR tripeptide (Glu-Asp-Arg).", "cartalax": "Research note (literature, not the label): AED tripeptide.", "endoluten": "Research note: AEDG (Epitalon's sequence) was detected in the pineal polypeptide complex (mass spectrometry)."}

facts = {}
for i, p in store.items():
    r = rd.get(i, {})
    d = D.get(i, {})
    usage = d["usage"] if "usage" in d else p["usage"]
    basis = d.get("basis") or ("page-text-unaudited" if usage else "none")
    md_status = d.get("md") or "unverified"
    md_text = d.get("mdText") or (usage if md_status == "verified" else None)
    srcs = audit_sources(i)
    if not srcs:
        for u in r.get("source_documents") or []:
            if u.startswith("http") and "purefirenutritional" not in u:
                srcs.append(src(u, "catalog", r.get("pack_size_as_printed"), None, None))
    if d.get("alt"):
        for a in d["alt"]:
            if not any(s["url"] == a["source"] for s in srcs): srcs.append(src(a["source"], "course", i, None, None))
    if i == "endoluten":
        srcs.append(src("https://peptideproduct.com/catalog/peptide_products/cytomaxes/endoluten/", "official-doc", "endoluten 20/60 caps",
                        "1 or 2 capsules 2 times a day… Duration of use is 1 month (as quoted in audit v2)", None))
    for o in d.get("options", []):
        if not any(x["url"] == o["source"] for x in srcs): srcs.append(src(o["source"], "official-doc", i, None, None))
    ev = EVID.get(i)
    facts[i] = {
        "id": i,
        "name": p["name"],
        "composition": d.get("composition", p["ingredients"]),
        "biologicalTarget": r.get("body_system") or None,
        "manufacturerDirections": {"text": md_text, "status": md_status, "options": d.get("options", []), "note": d.get("note")},
        "storefrontUsage": {"text": usage, "basis": basis},
        "alternativeProtocols": d.get("alt", []),
        "context": None,
        "evidence": ev[0] if ev else None,
        "limitations": ev[1] if ev else None,
        "researchNote": RESEARCH_SEQ.get(i),
        "contraindications": r.get("contraindications_warnings_as_printed") or None,
        "sources": srcs,
        "verificationStatus": d.get("status") or ("unaudited" if i not in rows_by_id else "needs-research"),
        "hold": d.get("hold"),
        "auditRows": [x["product name"] for x in rows_by_id.get(i, [])],
    }

out = {"_schema": "shared/product-facts.ts", "_seeded": "2026-10-14 by scripts/seed-product-facts.py; edit this file directly from now on.", "products": facts}
json.dump(out, open("shared/product-facts.json", "w"), indent=1, ensure_ascii=False)
open("shared/product-facts.json", "a").write("\n")
print("products", len(facts), "unmapped audit rows:", unmapped)
