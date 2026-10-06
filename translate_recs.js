import fs from 'fs';
import path from 'path';

// Since the file is ESM, we'll read it as a string, parse it, or we can just import it.
// Because it's a module, let's just parse the file text.
const filePath = path.resolve('rasyon-app/src/data/recommendations.js');
let fileContent = fs.readFileSync(filePath, 'utf8');

// A quick and dirty way to get the object out of the JS file
const dataString = fileContent.replace('export const recommendations = ', '').replace(/;\s*$/, '');
// However, the file doesn't have strict JSON (unquoted keys). We can use `eval` or `new Function`.
let recommendations;
try {
  recommendations = new Function('return ' + dataString)();
} catch(e) {
  console.error("Error parsing data:", e);
  process.exit(1);
}

async function translateText(text) {
  if (!text) return text;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=en&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data[0].map(item => item[0]).join('');
  } catch (err) {
    console.error("Error translating:", err);
    return text;
  }
}

const CATEGORY_MAP = {
  "Kuru Dönem / Geçiş": "Dry Period / Transition",
  "Laktasyon Rasyonu": "Lactation Ration",
  "Sağlık / Rumen": "Health / Rumen",
  "Barınak ve Refah": "Housing & Welfare",
  "Su Tüketimi": "Water Intake",
  "Buzağı ve Düve": "Calf & Heifer"
};

async function run() {
  console.log(`Found ${recommendations.length} recommendations to translate.`);
  for (let i = 0; i < recommendations.length; i++) {
    const rec = recommendations[i];
    // Translate category using map
    rec.categoryEn = CATEGORY_MAP[rec.category] || rec.category;
    
    // Check if already translated
    if (rec.titleEn && rec.contentEn) continue;

    console.log(`Translating ${i+1}/${recommendations.length}: ${rec.title}`);
    
    // Translate title
    rec.titleEn = await translateText(rec.title);
    
    // Translate content
    rec.contentEn = await translateText(rec.content);
    
    // Slight delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Convert back to JS string
  const newContent = 'export const recommendations = ' + JSON.stringify(recommendations, null, 2) + ';\n';
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('Successfully translated and updated recommendations.js');
}

run();
