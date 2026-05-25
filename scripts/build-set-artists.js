#!/usr/bin/env node
/**
 * Generates src/data/set-artists.json — a pre-built map of set code → artist names
 * for the homepage set filter. Run this whenever a major new set releases:
 *   npm run build:set-artists
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const MAJOR_SET_TYPES = new Set(['core', 'expansion', 'masters', 'draft_innovation', 'starter']);
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'set-artists.json');
const DELAY_MS = 110;

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'mtgartistconnection/1.0', 'Accept': 'application/json' } }, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error for ${url}: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchArtistsForSet(setCode) {
  const artists = new Set();
  let url = `https://api.scryfall.com/cards/search?q=set:${setCode}&unique=art`;

  while (url) {
    const data = await get(url);
    if (data.object === 'error') break;

    for (const card of data.data ?? []) {
      if (card.artist) {
        for (const name of card.artist.split(' & ')) {
          artists.add(name.trim().toLowerCase().replace(/\s/g, ''));
        }
      }
    }

    url = data.has_more ? data.next_page : null;
    if (url) await delay(DELAY_MS);
  }

  return Array.from(artists);
}

async function main() {
  console.log('Fetching sets from Scryfall...');
  const setsData = await get('https://api.scryfall.com/sets');
  const sets = setsData.data.filter(s => MAJOR_SET_TYPES.has(s.set_type));

  console.log(`Found ${sets.length} major sets. Fetching artists for each set...\n`);

  const result = {};

  for (let i = 0; i < sets.length; i++) {
    const set = sets[i];
    process.stdout.write(`[${String(i + 1).padStart(3)}/${sets.length}] ${set.code.padEnd(6)} ${set.name.substring(0, 40).padEnd(40)}  `);

    try {
      result[set.code] = await fetchArtistsForSet(set.code);
      console.log(`${result[set.code].length} artists`);
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      result[set.code] = [];
    }

    if (i < sets.length - 1) await delay(DELAY_MS);
  }

  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result));
  const sizeKb = (fs.statSync(OUTPUT_PATH).size / 1024).toFixed(1);
  console.log(`\nWrote ${Object.keys(result).length} sets to ${OUTPUT_PATH} (${sizeKb} KB)`);
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
