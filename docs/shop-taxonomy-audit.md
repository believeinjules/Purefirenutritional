# Shop taxonomy audit (2026-10-19)

Source of truth: `client/src/data/productTags.ts`. A product gets a tag only when its own existing copy names that system or goal (pdp tags, biologicalTarget or meta description in `shared/product-facts.json`).

Existing mappings that were reviewed:
- `bodySystems.ts` (12 unmerged pages).
- `systems.ts` SHOP_SYSTEMS: the four `?system=` filters on /products (brain, recovery, longevity, organ). Left unchanged.
- `similarProducts.ts` GROUPS: regexes over biologicalTarget and tags.
- products.ts `category`: 3 values.
Firestore holds no tag or category mapping beyond `category` / `hidden` / `active`.

| id | name | hidden | category | line | old 12-page system | /products filter | NEW groups | NEW collections/goals | note |
|---|---|---|---|---|---|---|---|---|---|
| bonomarlot | Bonomarlot |  | PEPTIDE BIOREGULATORS | Cytomax® A-20 | blood-bone-marrow | organ | blood-bone-marrow, immune-respiratory | collection:khavinson-cytomaxes | Also in Immune & Respiratory, because its own tags list 'Immune system'. Kept out of Heart & Circulation. |
| cartalax | Cartalax |  | PEPTIDE BIOREGULATORS | Cytogen® AC-4 | joints-bones-cartilage | organ | bones-joints-muscles | collection:khavinson-cytogens | Old system renamed into the consolidated group |
| chelohart | Chelohart |  | PEPTIDE BIOREGULATORS | Cytomax® A-14 | heart-blood-vessels | recovery, organ | heart-circulation | collection:khavinson-cytomaxes, goal:energy-vitality, goal:healthy-aging | Old system renamed into the consolidated group |
| crystagen | Crystagen |  | PEPTIDE BIOREGULATORS | Cytogen® AC-6 | immune-thymus | organ | immune-respiratory | collection:khavinson-cytogens | Old system renamed into the consolidated group |
| endoluten | Endoluten |  | PEPTIDE BIOREGULATORS | Cytomax® A-8 | list: Pineal & Daily Rhythms | longevity, organ | brain-nervous-system, hormonal-reproductive-health | collection:khavinson-cytomaxes, goal:sleep-daily-rhythms, goal:healthy-aging | Pineal page was dropped earlier, so it was list-only. Added to Brain (the pineal gland is brain tissue) and Hormonal (its tags say 'Neuroendocrine system'). |
| gotratix | Gotratix |  | PEPTIDE BIOREGULATORS | Cytomax® A-18 | muscle | recovery, organ | bones-joints-muscles | collection:khavinson-cytomaxes | Old system renamed into the consolidated group |
| pielotax | Pielotax |  | PEPTIDE BIOREGULATORS | Cytomax® A-9 | kidney-bladder | organ | kidney-bladder | collection:khavinson-cytomaxes | Old system renamed into the consolidated group |
| prime-peptide-brain | Prime Peptide Brain |  | PEPTIDE BIOREGULATORS |  | brain-nervous-system | brain | brain-nervous-system | collection:prime-peptide, goal:focus-cognition | Old system renamed into the consolidated group |
| prime-peptide-collagen | Prime Peptide Collagen |  | PEPTIDE BIOREGULATORS |  | list: Skin, Energy & General |  | — | collection:prime-peptide, collection:hair-skin-beauty |  |
| prime-peptide-joints | Prime Peptide Joints |  | PEPTIDE BIOREGULATORS |  | joints-bones-cartilage |  | bones-joints-muscles | collection:prime-peptide | Old system renamed into the consolidated group |
| prime-peptide-omega | Prime Peptide Omega |  | PEPTIDE BIOREGULATORS |  | immune-thymus |  | immune-respiratory, heart-circulation | collection:prime-peptide | Added to Heart & Circulation (meta: 'cardiovascular wellness'). |
| prime-peptide-protect | Prime Peptide Protect |  | PEPTIDE BIOREGULATORS |  | list: Pineal & Daily Rhythms |  | brain-nervous-system | collection:prime-peptide, goal:sleep-daily-rhythms, goal:stress-mood, goal:antioxidant-support | Was list-only. Added to Brain (meta: 'melatonin levels and a calm mood'). |
| revilab-ml-01 | Revilab ML 01 |  | PEPTIDE BIOREGULATORS |  | brain-nervous-system |  | brain-nervous-system, immune-respiratory | collection:revilab | Added to Immune & Respiratory (meta: 'immune function'). |
| revilab-ml-02 | Revilab ML 02 |  | PEPTIDE BIOREGULATORS |  | immune-thymus, blood-bone-marrow |  | blood-bone-marrow, immune-respiratory | collection:revilab | Old system renamed into the consolidated group |
| revilab-ml-03 | Revilab ML 03 |  | PEPTIDE BIOREGULATORS |  | brain-nervous-system | brain | brain-nervous-system | collection:revilab, goal:eyes-vision | Brain, plus the Eyes & Vision goal (meta: 'visual function'). |
| revilab-ml-04 | Revilab ML 04 |  | PEPTIDE BIOREGULATORS |  | heart-blood-vessels | recovery | heart-circulation | collection:revilab | Old system renamed into the consolidated group |
| revilab-ml-05 | Revilab ML 05 |  | PEPTIDE BIOREGULATORS |  | lungs-airways |  | immune-respiratory | collection:revilab | Old system renamed into the consolidated group |
| revilab-ml-06 | Revilab ML 06 |  | PEPTIDE BIOREGULATORS |  | liver-digestive | organ | digestion-metabolism | collection:revilab | Old system renamed into the consolidated group |
| revilab-ml-07 | Revilab ML 07 |  | PEPTIDE BIOREGULATORS |  | mens-health |  | hormonal-reproductive-health, kidney-bladder | collection:revilab | Added to Kidney & Bladder (meta: 'urinary comfort'). |
| revilab-ml-08 | Revilab ML 08 |  | PEPTIDE BIOREGULATORS |  | womens-health |  | hormonal-reproductive-health, bones-joints-muscles | collection:revilab | Added to Bones, Joints & Muscles (meta: 'bone and cartilage health'). |
| revilab-ml-09 | Revilab ML 09 |  | PEPTIDE BIOREGULATORS |  | joints-bones-cartilage |  | bones-joints-muscles | collection:revilab | Old system renamed into the consolidated group |
| revilab-pro-elements | Revilab Pro Elements |  | ANTI AGING-LONGEVITY |  | list: Skin, Energy & General | longevity | — | collection:revilab, goal:energy-vitality |  |
| mesotel-neo | Mesotel Neo |  | ANTI AGING-LONGEVITY |  | brain-nervous-system | longevity | brain-nervous-system, heart-circulation | — | Added to Heart & Circulation (meta: 'healthy blood vessels'). |
| revilab-sl-01 | Revilab SL 01 |  | PEPTIDE BIOREGULATORS |  | heart-blood-vessels |  | heart-circulation | collection:revilab | Old system renamed into the consolidated group |
| revilab-sl-02 | Revilab SL 02 |  | PEPTIDE BIOREGULATORS |  | brain-nervous-system | brain | brain-nervous-system | collection:revilab | Old system renamed into the consolidated group |
| revilab-sl-03 | Revilab SL 03 |  | PEPTIDE BIOREGULATORS |  | list: Pineal & Daily Rhythms |  | immune-respiratory | collection:revilab, goal:sleep-daily-rhythms | Was list-only. Added to Immune & Respiratory (meta: 'immune balance'). |
| revilab-sl-04 | Revilab SL 04 |  | PEPTIDE BIOREGULATORS |  | joints-bones-cartilage, muscle |  | bones-joints-muscles | collection:revilab | Old system renamed into the consolidated group |
| revilab-sl-05 | Revilab SL 05 |  | PEPTIDE BIOREGULATORS |  | liver-digestive |  | digestion-metabolism | collection:revilab | Old system renamed into the consolidated group |
| revilab-sl-06 | Revilab SL 06 |  | PEPTIDE BIOREGULATORS |  | lungs-airways |  | immune-respiratory | collection:revilab | Old system renamed into the consolidated group |
| revilab-sl-07 | Revilab SL 07 |  | PEPTIDE BIOREGULATORS |  | immune-thymus, blood-bone-marrow | recovery | blood-bone-marrow, immune-respiratory | collection:revilab | Old system renamed into the consolidated group |
| revilab-sl-08 | Revilab SL 08 |  | PEPTIDE BIOREGULATORS |  | kidney-bladder |  | kidney-bladder | collection:revilab | Old system renamed into the consolidated group |
| revilab-sl-09 | Revilab SL 09 |  | PEPTIDE BIOREGULATORS |  | mens-health |  | hormonal-reproductive-health | collection:revilab | Old system renamed into the consolidated group |
| testoluten | Testoluten |  | PEPTIDE BIOREGULATORS | Cytomax® A-13 | mens-health | organ | hormonal-reproductive-health | collection:khavinson-cytomaxes | Old system renamed into the consolidated group |
| bonothyrk | Bonothyrk |  | PEPTIDE BIOREGULATORS | Cytomax® A-21 | joints-bones-cartilage, endocrine-glands | organ | bones-joints-muscles, hormonal-reproductive-health | collection:khavinson-cytomaxes | Joints → Bones, Joints & Muscles; Endocrine → Hormonal & Reproductive (parathyroid). |
| cerluten | Cerluten |  | PEPTIDE BIOREGULATORS | Cytomax® A-5 | brain-nervous-system | organ | brain-nervous-system | collection:khavinson-cytomaxes, goal:focus-cognition | Old system renamed into the consolidated group |
| chitomur | Chitomur |  | PEPTIDE BIOREGULATORS | Cytomax® A-12 | kidney-bladder | organ | kidney-bladder | collection:khavinson-cytomaxes | Old system renamed into the consolidated group |
| chonluten | Chonluten |  | PEPTIDE BIOREGULATORS | Cytogen® AC-7 | lungs-airways | organ | immune-respiratory | collection:khavinson-cytogens | Old system renamed into the consolidated group |
| glandokort | Glandokort |  | PEPTIDE BIOREGULATORS | Cytomax® A-17 | endocrine-glands | organ | hormonal-reproductive-health | collection:khavinson-cytomaxes, goal:energy-vitality, goal:stress-mood | Old system renamed into the consolidated group |
| libidon | Libidon |  | PEPTIDE BIOREGULATORS | Cytomax® A-16 | mens-health | organ | hormonal-reproductive-health | collection:khavinson-cytomaxes | Old system renamed into the consolidated group |
| ovagen | Ovagen |  | PEPTIDE BIOREGULATORS | Cytogen® AC-3 | liver-digestive | organ | digestion-metabolism | collection:khavinson-cytogens | Old system renamed into the consolidated group |
| pinealon | Pinealon |  | PEPTIDE BIOREGULATORS | Cytogen® AC-5 | brain-nervous-system | organ | brain-nervous-system | collection:khavinson-cytogens, goal:focus-cognition, goal:stress-mood | Old system renamed into the consolidated group |
| sigumir | Sigumir |  | PEPTIDE BIOREGULATORS | Cytomax® A-4 | joints-bones-cartilage | organ | bones-joints-muscles | collection:khavinson-cytomaxes | Old system renamed into the consolidated group |
| stamakort | Stamakort |  | PEPTIDE BIOREGULATORS | Cytomax® A-10 | liver-digestive | organ | digestion-metabolism | collection:khavinson-cytomaxes | Old system renamed into the consolidated group |
| suprefort | Suprefort |  | PEPTIDE BIOREGULATORS | Cytomax® A-1 | liver-digestive | organ | digestion-metabolism | collection:khavinson-cytomaxes | Old system renamed into the consolidated group |
| svetinorm | Svetinorm |  | PEPTIDE BIOREGULATORS | Cytomax® A-7 | liver-digestive | organ | digestion-metabolism | collection:khavinson-cytomaxes | Old system renamed into the consolidated group |
| taxorest | Taxorest |  | PEPTIDE BIOREGULATORS | Cytomax® A-19 | lungs-airways | organ | immune-respiratory | collection:khavinson-cytomaxes | Old system renamed into the consolidated group |
| zhenoluten | Zhenoluten |  | PEPTIDE BIOREGULATORS | Cytomax® A-15 | womens-health | organ | hormonal-reproductive-health | collection:khavinson-cytomaxes | Old system renamed into the consolidated group |
| ventfort | Ventfort |  | PEPTIDE BIOREGULATORS | Cytomax® A-3 | heart-blood-vessels | organ | heart-circulation | collection:khavinson-cytomaxes | Old system renamed into the consolidated group |
| vesugen | Vesugen |  | PEPTIDE BIOREGULATORS | Cytogen® AC-2 | heart-blood-vessels | organ | heart-circulation | collection:khavinson-cytogens | Old system renamed into the consolidated group |
| visoluten | Visoluten |  | PEPTIDE BIOREGULATORS | Cytomax® A-11 | list: Eyes & Vision | organ | — | collection:khavinson-cytomaxes, goal:eyes-vision | No consolidated group fits the eyes. Listed in the Eyes & Vision goal and the Cytomax collection. |
| vladonix | Vladonix |  | PEPTIDE BIOREGULATORS | Cytomax® A-6 | immune-thymus | organ | immune-respiratory | collection:khavinson-cytomaxes, goal:healthy-aging | Old system renamed into the consolidated group |
| anti-wrinkle-serum-7 | Anti-Wrinkle Serum №7 |  | ANTI AGING-LONGEVITY |  | list: Skin, Energy & General | longevity | — | collection:hair-skin-beauty |  |
| revilab-sl-10 | Revilab SL 10 |  | PEPTIDE BIOREGULATORS |  | womens-health |  | hormonal-reproductive-health | collection:revilab | Old system renamed into the consolidated group |
| revilab-anti-age | Revilab Anti-A.G.E. |  | ANTI AGING-LONGEVITY |  | list: Skin, Energy & General | longevity | — | collection:revilab, collection:hair-skin-beauty, goal:antioxidant-support, goal:healthy-aging |  |
| alvenorm-forte | Alvenorm Forte |  | NUTRITIONAL SUPPLEMENTS |  | lungs-airways |  | immune-respiratory | — | Old system renamed into the consolidated group |
| volustom | Volustom |  | NUTRITIONAL SUPPLEMENTS |  | liver-digestive |  | digestion-metabolism | — | Old system renamed into the consolidated group |
| getrufline | Getrufline |  | NUTRITIONAL SUPPLEMENTS |  | liver-digestive |  | digestion-metabolism | — | Old system renamed into the consolidated group |
| gelmigon | Gelmigon | hidden | NUTRITIONAL SUPPLEMENTS |  | — |  | — | — | Hidden: tags kept for when it returns; never shown |
| digemax | Digemax |  | NUTRITIONAL SUPPLEMENTS |  | liver-digestive |  | digestion-metabolism | — | Old system renamed into the consolidated group |
| imusil | Imusil |  | NUTRITIONAL SUPPLEMENTS |  | immune-thymus |  | immune-respiratory | goal:stress-mood | Old system renamed into the consolidated group |
| indosine | Indosine | hidden | NUTRITIONAL SUPPLEMENTS |  | — |  | — | goal:antioxidant-support | Hidden: tags kept for when it returns; never shown |
| calsil-t | Calsil-T | hidden | NUTRITIONAL SUPPLEMENTS |  | — |  | bones-joints-muscles | — | Hidden: tags kept for when it returns; never shown |
| complex-3d | Complex 3D |  | NUTRITIONAL SUPPLEMENTS |  | list: Skin, Energy & General |  | — | goal:antioxidant-support | No body-system group; listed in the Antioxidant Support goal. |
| complex-3r | Complex 3R |  | NUTRITIONAL SUPPLEMENTS |  | heart-blood-vessels |  | heart-circulation | goal:antioxidant-support | Heart & Circulation kept (meta: 'healthy blood vessels'), plus the Antioxidant goal. |
| levain | Levain |  | NUTRITIONAL SUPPLEMENTS |  | muscle |  | bones-joints-muscles | goal:energy-vitality, goal:stress-mood | Was under Muscle only. Kept in Bones, Joints & Muscles (meta: 'muscle performance'), and added to the Energy and Stress goals. |
| likam | Likam |  | NUTRITIONAL SUPPLEMENTS |  | liver-digestive |  | digestion-metabolism | goal:energy-vitality | Old system renamed into the consolidated group |
| mamiton | Mamiton |  | NUTRITIONAL SUPPLEMENTS |  | womens-health |  | hormonal-reproductive-health | — | Old system renamed into the consolidated group |
| mesotel | Mesotel |  | ANTI AGING-LONGEVITY |  | brain-nervous-system | longevity | brain-nervous-system | goal:healthy-aging | Old system renamed into the consolidated group |
| mesotel-beauty | Mesotel Beauty |  | ANTI AGING-LONGEVITY |  | list: Skin, Energy & General | longevity | — | collection:hair-skin-beauty, goal:antioxidant-support |  |
| olecap | Olecap | hidden | NUTRITIONAL SUPPLEMENTS |  | — |  | — | — | Hidden: tags kept for when it returns; never shown |
| panaxod | Panaxod | hidden | NUTRITIONAL SUPPLEMENTS |  | — |  | — | goal:energy-vitality, goal:stress-mood | Hidden: tags kept for when it returns; never shown |
| pinalex-tab | Pinalex Tab |  | NUTRITIONAL SUPPLEMENTS |  | list: Eyes & Vision |  | — | goal:eyes-vision | No group fits the eyes; listed in the Eyes & Vision goal. |
| pangluin | Pangluin |  | NUTRITIONAL SUPPLEMENTS |  | liver-digestive |  | digestion-metabolism | goal:energy-vitality | Old system renamed into the consolidated group |
| previn | Previn | hidden | NUTRITIONAL SUPPLEMENTS |  | — |  | — | — | Hidden: tags kept for when it returns; never shown |
| revimite | Revimite |  | NUTRITIONAL SUPPLEMENTS |  | blood-bone-marrow |  | blood-bone-marrow | goal:energy-vitality, goal:stress-mood | Blood & Bone Marrow (iron/B vitamins for blood formation). Not put in Circulation. |
| reviplant | Reviplant |  | NUTRITIONAL SUPPLEMENTS |  | immune-thymus |  | immune-respiratory, digestion-metabolism | goal:antioxidant-support | Added to Digestion & Metabolism (its target is 'liver/general'; meta: 'liver function'). |
| reviform-cocktail | Reviform Cocktail |  | NUTRITIONAL SUPPLEMENTS |  | muscle |  | bones-joints-muscles | — | Old system renamed into the consolidated group |
| revifort | Revifort |  | NUTRITIONAL SUPPLEMENTS |  | immune-thymus |  | immune-respiratory, blood-bone-marrow | — | Added to Blood & Bone Marrow (meta: 'blood cell formation'). |
| regenart | Regenart | hidden | NUTRITIONAL SUPPLEMENTS |  | — |  | — | — | Hidden: tags kept for when it returns; never shown |
| renefort | Renefort |  | NUTRITIONAL SUPPLEMENTS |  | kidney-bladder |  | kidney-bladder | — | Old system renamed into the consolidated group |
| retisil | Retisil |  | NUTRITIONAL SUPPLEMENTS |  | list: Eyes & Vision |  | — | goal:eyes-vision | No group fits the eyes; listed in the Eyes & Vision goal. |
| rinolax | Rinolax |  | NUTRITIONAL SUPPLEMENTS |  | lungs-airways |  | immune-respiratory | — | Old system renamed into the consolidated group |
| temero-genero | Temero Genero | hidden | ANTI AGING-LONGEVITY |  | — | longevity | — | — | Hidden: tags kept for when it returns; never shown |
| trezvon | Trezvon | hidden | NUTRITIONAL SUPPLEMENTS |  | — |  | — | — | Hidden: tags kept for when it returns; never shown |
| felicita | Felicita |  | NUTRITIONAL SUPPLEMENTS |  | brain-nervous-system |  | brain-nervous-system | goal:stress-mood, goal:focus-cognition | Old system renamed into the consolidated group |
| femalin | Femalin | hidden | NUTRITIONAL SUPPLEMENTS |  | — |  | — | — | Hidden: tags kept for when it returns; never shown |
| zinsil-t | Zinsil-T |  | NUTRITIONAL SUPPLEMENTS |  | immune-thymus |  | immune-respiratory | goal:sleep-daily-rhythms, goal:stress-mood | Old system renamed into the consolidated group |
| ensil | Ensil |  | NUTRITIONAL SUPPLEMENTS |  | brain-nervous-system |  | brain-nervous-system | goal:energy-vitality | Brain kept, plus the Energy goal. Its meta also names immune function, which I treated as secondary and did not tag; Julia to confirm. |
| anti-age-nb-activity | Anti-Age Complex NB Activity |  | ANTI AGING-LONGEVITY |  | list: Skin, Energy & General | longevity | — | goal:energy-vitality |  |
| anti-age-nb-health | Anti-Age Complex NB Health |  | ANTI AGING-LONGEVITY |  | list: Skin, Energy & General | longevity | — | goal:antioxidant-support, goal:healthy-aging |  |
| thyreogen | Thyreogen |  | PEPTIDE BIOREGULATORS | Cytomax® A-2 | endocrine-glands | organ | hormonal-reproductive-health | collection:khavinson-cytomaxes, goal:energy-vitality | Old system renamed into the consolidated group |
| gpl-femme | GPL Femme |  | PEPTIDE BIOREGULATORS |  | womens-health | longevity | hormonal-reproductive-health | goal:healthy-aging | Old system renamed into the consolidated group |
| gpl-man | GPL Man |  | PEPTIDE BIOREGULATORS |  | mens-health | longevity | hormonal-reproductive-health | goal:energy-vitality, goal:healthy-aging | Old system renamed into the consolidated group |

## Revision (Julia's review of 893babe)

The table above shows the first pass. `client/src/data/productTags.ts` is the current source. Changes:

- **Menu:** Shop > Body System shows the 7 consolidated groups. Blood & Bone Marrow keeps its page and is linked from the /products/system landing page ("All body systems").
- **Goals:** Stress & Mood was renamed Stress & Resilience.
- **Recovery & Mobility (new):** only products whose own copy names recovery, joints, muscle or mobility: Sigumir, Gotratix, Cartalax, Prime Peptide Joints, Revilab ML 09, Revilab SL 04, Levain and Reviform Cocktail.
- **Skin, Hair & Beauty:** replaces the Hair, Skin & Beauty collection. It adds Imusil ("healthy skin barrier") and Zinsil-T ("healthy skin").
- **Dropped:** the Antioxidant Support and Eyes & Vision goals.
- **Collections:** now the brand lines only (Cytomaxes, Cytogens, Revilab, Prime Peptide).
- **Eye products:** Visoluten (Cytomax collection) and Revilab ML 03 (Revilab collection and Brain) keep a browse page. Pinalex Tab and Retisil are listed in the Eyes & Vision section of the Khavinson Peptides List (`list:eyes-vision`).
- **Complex 3D:** now appears only in the list page's "Skin, Energy & General" section (`list:general`).
- **Redirects (301):** the 4 dropped or renamed URLs above.
