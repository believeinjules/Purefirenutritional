import fs from 'fs';

const filePath = 'client/src/data/products.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Map of product IDs to their best image file
const imageMap = {
  'bonomarlot': '/products/bono3.jpg',
  'cartalax': '/products/cartalax4.jpg',
  'chelohart': '/products/chelohart5.jpg',
  'crystagen': '/products/crystagen7.jpg',
  'endoluten': '/products/endo5.jpg',
  'gotratix': '/products/gotratix1.jpg',
  'pielotax': '/products/pielotax1.jpg',
  'testoluten': '/products/testoluten5.jpg',
  'ventfort': '/products/vent9.jpg',
  'vesugen': '/products/vesugen7.jpg',
  'visoluten': '/products/viso5.jpg',
  'vladonix': '/products/vlad9.jpg',
  'prime-peptide-brain': '/products/PPB1.jpg',
  'prime-peptide-collagen': '/products/PPc4.jpg',
  'prime-peptide-joints': '/products/ppj2.jpg',
  'prime-peptide-omega': '/products/ppo.jpg',
  'prime-peptide-protect': '/products/ppp2.jpg',
  'revilab-ml-01': '/products/rev01.jpg',
  'revilab-ml-02': '/products/rev02.jpg',
  'revilab-ml-03': '/products/rev03.jpg',
  'revilab-ml-04': '/products/rev04.jpg',
  'revilab-ml-05': '/products/RevilabML5.jpg',
  'revilab-ml-06': '/products/rev06.jpg',
  'revilab-ml-07': '/products/rev07.jpg',
  'revilab-ml-08': '/products/Rev08.jpg',
  'revilab-ml-09': '/products/rev09.jpg',
  'revilab-pro-elements': '/products/elements4.jpg',
  'mesotel-neo': '/products/mesneo.jpg',
  'revilab-sl-01': '/products/sl_1-228x228.jpg',
  'revilab-sl-02': '/products/sl_2-228x228.jpg',
  'revilab-sl-03': '/products/sl_3-228x228.jpg',
  'revilab-sl-04': '/products/sl_4-228x228.jpg',
  'revilab-sl-05': '/products/sl_5-228x228.jpg',
  'revilab-sl-06': '/products/sl_6-228x228.jpg',
  'revilab-sl-07': '/products/sl_7-228x228.jpg',
  'revilab-sl-08': '/products/sl_8-228x228.jpg',
  'revilab-sl-09': '/products/sl_9-228x228.jpg',
  'revilab-sl-10': '/products/RevilabSL10.jpg',
  'revilab-anti-age': '/products/antiage2.jpg',
  'thyreogen': '/products/Thyreogen.jpg',
  'bonothyrk': '/products/Bonothyrk.png',
  'glandokort': '/products/gland5.jpg',
  'libidon': '/products/libi1.jpg',
  'svetinorm': '/products/svet5.jpg',
  'sigumir': '/products/sigumir4.jpg',
  'stamakort': '/products/stamakort4.jpg',
  'suprefort': '/products/suprefort1.jpg',
  'taxorest': '/products/taxorest5.jpg',
  'chitomur': '/products/chit9.jpg',
  'zhenoluten': '/products/zhen5.jpg',
  'ovagen': '/products/ova1.jpg',
  'pinealon': '/products/pinealon.jpg',
  'chonluten': '/products/chono1.jpg',
  'gpl-femme': '/products/gplF.jpg',
  'gpl-man': '/products/GPL_M.jpg',
  // Supplements
  'alvenorm-forte': '/products/Alvenorm.jpg',
  'volustom': '/products/Volustom.jpg',
  'getrufline': '/products/getruflineINFO.jpg',
  'gelmigon': '/products/cleantestin.jpg',
  'digemax': '/products/digimax2.jpg',
  'imusil': '/products/imusil.jpg',
  'indosine': '/products/indosine.jpg',
  'calsil-t': '/products/calsilt.jpg',
  'complex-3d': '/products/complex3d.jpg',
  'complex-3r': '/products/complex3r.jpg',
  'levain': '/products/levain.jpg',
  'likam': '/products/likam.png',
  'mamiton': '/products/felicita.jpg',
  'mesotel': '/products/mes.jpg',
  'mesotel-beauty': '/products/mesbeauty.jpg',
  'olecap': '/products/panaxod.jpg',
  'panaxod': '/products/panaxod.jpg',
  'pinalex-tab': '/products/pinalex.jpg',
  'pangluin': '/products/pangluin.jpg',
  'previn': '/products/renefort.jpg',
  'regenart': '/products/renefort.jpg',
  'renefort': '/products/rene1.jpg',
  'retisil': '/products/retisil4.jpg',
  'revifort': '/products/Reviform.jpg',
  'reviform-cocktail': '/products/Reviform_2.jpg',
  'revimite': '/products/revimite.jpg',
  'reviplant': '/products/Reviform_3.jpg',
  'rinolax': '/products/Alvenorm.jpg',
  'temero-genero': '/products/felicita.jpg',
  'trezvon': '/products/felicita.jpg',
  'felicita': '/products/felicita.jpg',
  'femalin': '/products/felicita.jpg',
  'zinsil-t': '/products/zinsil1.jpg',
  'ensil': '/products/ensil2.jpg',
  'anti-age-nb-activity': '/products/energystar3.jpg',
  'anti-age-nb-health': '/products/energystar1.jpg',
};

let updated = 0;
for (const [id, imagePath] of Object.entries(imageMap)) {
  // Find the product block and add/update image field
  const idPattern = new RegExp(`(id: "${id}",\\n)`);
  const match = content.match(idPattern);
  
  if (match) {
    // Check if it already has an image field nearby
    const afterId = content.indexOf(`id: "${id}",`);
    const nextProduct = content.indexOf('\n  {', afterId + 1);
    const block = content.slice(afterId, nextProduct > -1 ? nextProduct : undefined);
    
    if (!block.includes('image:')) {
      // Add image field after the id line
      content = content.replace(
        `id: "${id}",`,
        `id: "${id}",\n    image: "${imagePath}",`
      );
      updated++;
    }
  }
}

fs.writeFileSync(filePath, content);
console.log(`Updated ${updated} products with image paths`);
