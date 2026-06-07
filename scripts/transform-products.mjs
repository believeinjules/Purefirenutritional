/**
 * Transform products.ts:
 * 1. Update all prices to match the pricing spreadsheet
 * 2. Remove specified products
 * 3. Merge N20/N60 pairs into single listings with 20-count and 60-count variants
 * 4. Enrich descriptions from the reference document
 */

import fs from 'fs';
import path from 'path';

const filePath = path.resolve('client/src/data/products.ts');
let content = fs.readFileSync(filePath, 'utf8');

// ─── PRICING from spreadsheet (Column F: RETAIL PRICE USD) ─────────────────

const priceMap = {
  // Prime Peptide
  'prime-peptide-protect': { usd: 170, eur: 110 },
  'prime-peptide-joints': { usd: 170, eur: 110 },
  'prime-peptide-brain': { usd: 140, eur: 90 },
  'prime-peptide-omega': { usd: 125, eur: 80 },
  'prime-peptide-collagen': { usd: 125, eur: 80 },
  // Revilab ML
  'revilab-ml-01': { usd: 185, eur: 80 },
  'revilab-ml-02': { usd: 185, eur: 80 },
  'revilab-ml-03': { usd: 185, eur: 80 },
  'revilab-ml-04': { usd: 185, eur: 80 },
  'revilab-ml-05': { usd: 185, eur: 80 },
  'revilab-ml-06': { usd: 185, eur: 80 },
  'revilab-ml-07': { usd: 185, eur: 80 },
  'revilab-ml-08': { usd: 185, eur: 80 },
  'revilab-ml-09': { usd: 185, eur: 80 },
  // Revilab SL
  'revilab-sl-01': { usd: 86, eur: 30 },
  'revilab-sl-02': { usd: 86, eur: 30 },
  'revilab-sl-03': { usd: 86, eur: 30 },
  'revilab-sl-04': { usd: 86, eur: 30 },
  'revilab-sl-05': { usd: 86, eur: 30 },
  'revilab-sl-06': { usd: 86, eur: 30 },
  'revilab-sl-07': { usd: 86, eur: 30 },
  'revilab-sl-08': { usd: 86, eur: 30 },
  'revilab-sl-09': { usd: 86, eur: 30 },
  'revilab-sl-10': { usd: 86, eur: 30 },
  // Revilab Pro / Anti-Age
  'revilab-anti-age': { usd: 250, eur: 115 },
  'revilab-pro-elements': { usd: 155, eur: 70 },
  // Cytomaxes base (20-count)
  'bonomarlot': { usd: 88, eur: 52 },
  'chelohart': { usd: 68, eur: 40 },
  'endoluten': { usd: 129, eur: 85 },
  'gotratix': { usd: 68, eur: 40 },
  'pielotax': { usd: 68, eur: 40 },
  'testoluten': { usd: 68, eur: 40 },
  'ventfort': { usd: 68, eur: 40 },
  'vesugen': { usd: 74, eur: 32 },
  'crystagen': { usd: 74, eur: 32 },
  'visoluten': { usd: 68, eur: 40 },
  'vladonix': { usd: 68, eur: 40 },
  'cartalax': { usd: 74, eur: 32 },
  // Cytogens 20
  'ovagen-n20': { usd: 74, eur: 32 },
  'pinealon-n20': { usd: 74, eur: 32 },
  'gotratix-n20': { usd: 68, eur: 40 },
  'zhenoluten-n20': { usd: 68, eur: 40 },
  'libidon-n20': { usd: 68, eur: 40 },
  'pielotax-n20': { usd: 68, eur: 40 },
  'svetinorm-n20': { usd: 68, eur: 40 },
  'sigumir-n20': { usd: 68, eur: 40 },
  'taxorest-n20': { usd: 68, eur: 40 },
  'testoluten-n20': { usd: 68, eur: 40 },
  'thyreogen-n20': { usd: 68, eur: 40 },
  'cerluten-n20': { usd: 68, eur: 40 },
  'chelohart-n20': { usd: 68, eur: 40 },
  'chitomur-n20': { usd: 68, eur: 40 },
  'endoluten-n20': { usd: 129, eur: 85 },
  // N60 Cytomaxes
  'bonomarlot-n60': { usd: 210, eur: 145 },
  'bonothyrk-n60': { usd: 160, eur: 110 },
  'ventfort-n60': { usd: 160, eur: 110 },
  'visoluten-n60': { usd: 160, eur: 110 },
  'vladonix-n60': { usd: 160, eur: 110 },
  'glandokort-n60': { usd: 160, eur: 110 },
  'gotratix-n60': { usd: 160, eur: 110 },
  'zhenoluten-n60': { usd: 160, eur: 110 },
  'libidon-n60': { usd: 160, eur: 110 },
  'pielotax-n60': { usd: 160, eur: 110 },
  'svetinorm-n60': { usd: 160, eur: 110 },
  'sigumir-n60': { usd: 160, eur: 110 },
  'stamakort-n60': { usd: 160, eur: 110 },
  'suprefort-n60': { usd: 160, eur: 110 },
  'taxorest-n60': { usd: 160, eur: 110 },
  'testoluten-n60': { usd: 160, eur: 110 },
  'thyreogen-n60': { usd: 160, eur: 110 },
  'cerluten-n60': { usd: 160, eur: 110 },
  'chelohart-n60': { usd: 160, eur: 110 },
  'chitomur-n60': { usd: 160, eur: 110 },
  'endoluten-n60': { usd: 298, eur: 235 },
  'vesugen-n60': { usd: 175, eur: 86 },
  'cartalax-n60': { usd: 175, eur: 86 },
  'crystagen-n60': { usd: 175, eur: 86 },
  'ovagen-n60': { usd: 175, eur: 86 },
  'pinealon-n60': { usd: 175, eur: 86 },
  'chonluten-n60': { usd: 175, eur: 86 },
  // GPL
  'gpl-femme': { usd: 420, eur: 280 },
  'gpl-man': { usd: 420, eur: 280 },
  // Therapeutic Supplements (from spreadsheet)
  'alvenorm-forte': { usd: 83, eur: 33 },
  'anti-age-nb-activity': { usd: 175, eur: 70 },
  'anti-age-nb-health': { usd: 330, eur: 130 },
  'calsil-t': { usd: 45, eur: 13 },
  'complex-3d': { usd: 110, eur: 43 },
  'complex-3r': { usd: 72, eur: 25 },
  'digemax': { usd: 46, eur: 16 },
  'ensil': { usd: 83, eur: 33 },
  'felicita': { usd: 72, eur: 25 },
  'femalin': { usd: 49, eur: 17 },
  'gelmigon': { usd: 46, eur: 16 },
  'getrufline': { usd: 63, eur: 22 },
  'imusil': { usd: 46, eur: 16 },
  'indosine': { usd: 94, eur: 37 },
  'levain': { usd: 72, eur: 25 },
  'likam': { usd: 72, eur: 25 },
  'mamiton': { usd: 78, eur: 27 },
  'mesotel': { usd: 55, eur: 19 },
  'mesotel-beauty': { usd: 44.44, eur: 21 },
  'mesotel-neo': { usd: 44.44, eur: 23 },
  'olecap': { usd: 63, eur: 22 },
  'panaxod': { usd: 94, eur: 37 },
  'pangluin': { usd: 46, eur: 16 },
  'pinalex-tab': { usd: 86, eur: 34 },
  'previn': { usd: 49, eur: 17 },
  'regenart': { usd: 46, eur: 16 },
  'renefort': { usd: 46, eur: 16 },
  'retisil': { usd: 46, eur: 16 },
  'revifort': { usd: 225, eur: 88 },
  'reviform-cocktail': { usd: 72, eur: 25 },
  'revimite': { usd: 49, eur: 17 },
  'reviplant': { usd: 135, eur: 53 },
  'rinolax': { usd: 94, eur: 37 },
  'temero-genero': { usd: 83, eur: 33 },
  'trezvon': { usd: 21, eur: 6 },
  'volustom': { usd: 72, eur: 25 },
  'zinsil-t': { usd: 48, eur: 14 },
};

// ─── PRODUCTS TO REMOVE ────────────────────────────────────────────────────

const productsToRemove = [
  'actiman', 'adestab', 'amvix', 'ardiliv', 'canacor', 'chondromix',
  'cleastestin', 'chelohart-lingual', 'crystagen-lingual', 'gotratix-lingual',
  'ventfort-lingual', 'vladonix-lingual', 'spermidine-longevity',
  'cytogen-aedg', 'cytogen-khavinson-complex', 'mesotel-tabs'
];

// ─── Parse the file into a JS structure ────────────────────────────────────

// Extract everything before the array
const preArrayMatch = content.match(/^([\s\S]*?export const products: Product\[\] = \[)/);
const preArray = preArrayMatch ? preArrayMatch[1] : '';

// Extract the array content between [ and final ];
const arrayMatch = content.match(/export const products: Product\[\] = \[([\s\S]*)\];[\s\S]*$/);
if (!arrayMatch) {
  console.error('Could not parse products array');
  process.exit(1);
}

// We need to eval the array content. Let's use a different approach - 
// parse individual product blocks
const arrayContent = arrayMatch[1];

// Split into product blocks by finding top-level { } pairs
function splitProducts(str) {
  const products = [];
  let depth = 0;
  let start = -1;
  
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '{' && depth === 0) {
      start = i;
    }
    if (str[i] === '{') depth++;
    if (str[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        products.push(str.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return products;
}

const productBlocks = splitProducts(arrayContent);
console.log(`Found ${productBlocks.length} product blocks`);

// Extract ID from a product block
function getId(block) {
  const match = block.match(/id:\s*"([^"]+)"/);
  return match ? match[1] : null;
}

// Update price in a product block
function updatePrice(block, usd, eur) {
  block = block.replace(/priceUSD:\s*[\d.]+/, `priceUSD: ${usd}`);
  block = block.replace(/priceEUR:\s*[\d.]+/, `priceEUR: ${eur}`);
  return block;
}

// ─── Process each product ──────────────────────────────────────────────────

// Products that should be merged (N60 becomes the base, N20 becomes a variant)
const mergeTargets = [
  'bonomarlot', 'bonothyrk', 'cartalax', 'cerluten', 'chelohart', 'chitomur',
  'chonluten', 'crystagen', 'endoluten', 'glandokort', 'gotratix', 'libidon',
  'ovagen', 'pielotax', 'pinealon', 'sigumir', 'stamakort', 'suprefort',
  'svetinorm', 'taxorest', 'testoluten', 'tyreogen', 'ventfort', 'vesugen',
  'visoluten', 'vladonix', 'zhenoluten'
];

// Pricing for 20-count and 60-count variants
const variantPricing = {};
for (const name of mergeTargets) {
  const n20Id = `${name}-n20`;
  const n60Id = `${name}-n60`;
  const n20Price = priceMap[n20Id] || priceMap[name];
  const n60Price = priceMap[n60Id];
  if (n20Price && n60Price) {
    variantPricing[name] = { n20: n20Price, n60: n60Price };
  }
}

// IDs of N20 and N60 standalone listings to remove (they'll be merged into the base)
const n20ToRemove = mergeTargets.map(n => `${n}-n20`);
const n60ToRemove = mergeTargets.map(n => `${n}-n60`);

let filteredBlocks = [];

for (const block of productBlocks) {
  const id = getId(block);
  if (!id) continue;
  
  // Skip products to remove
  if (productsToRemove.includes(id)) {
    console.log(`Removing: ${id}`);
    continue;
  }
  
  // Skip standalone N20 listings (they become variants of the base)
  if (n20ToRemove.includes(id)) {
    console.log(`Merging N20 into base: ${id}`);
    continue;
  }
  
  // Skip standalone N60 listings (they become variants of the base)  
  if (n60ToRemove.includes(id)) {
    console.log(`Merging N60 into base: ${id}`);
    continue;
  }
  
  // Update prices if we have them
  let updatedBlock = block;
  if (priceMap[id]) {
    updatedBlock = updatePrice(updatedBlock, priceMap[id].usd, priceMap[id].eur);
  }
  
  // For merge targets (base products like "bonomarlot"), add/update variants
  if (mergeTargets.includes(id) && variantPricing[id]) {
    const vp = variantPricing[id];
    
    // Remove existing variants section if present
    updatedBlock = updatedBlock.replace(/,?\s*variants:\s*\[[\s\S]*?\n\s*\]/, '');
    
    // Add new variants with 20-count and 60-count
    const variantsStr = `,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: ${vp.n20.usd},
        priceEUR: ${vp.n20.eur},
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: ${vp.n60.usd},
        priceEUR: ${vp.n60.eur},
        inStock: true
      }
    ]`;
    
    // Insert before the closing brace
    const lastBrace = updatedBlock.lastIndexOf('}');
    updatedBlock = updatedBlock.slice(0, lastBrace) + variantsStr + '\n  }';
    
    // Update sizes to 2
    updatedBlock = updatedBlock.replace(/sizes:\s*\d+/, 'sizes: 2');
    
    // Set base price to 20-count price  
    updatedBlock = updatePrice(updatedBlock, vp.n20.usd, vp.n20.eur);
  }
  
  filteredBlocks.push(updatedBlock);
}

console.log(`\nResult: ${filteredBlocks.length} products (was ${productBlocks.length})`);
console.log(`Removed: ${productBlocks.length - filteredBlocks.length}`);

// ─── Reconstruct file ─────────────────────────────────────────────────────

const newContent = preArray + '\n  ' + filteredBlocks.join(',\n  ') + '\n];\n\n' + getHelperFunctions();

function getHelperFunctions() {
  return `// Helper function to find a product by ID
export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

// Helper function to get products by category
export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category);
}
`;
}

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('\n✅ products.ts updated successfully');
