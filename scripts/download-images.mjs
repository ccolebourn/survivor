/**
 * download-images.mjs
 *
 * Downloads Season 50 profile images for all 24 castaways from the
 * Survivor fandom wiki CDN (static.wikia.nocookie.net).
 * Uses only Node.js built-in modules: https, fs, path, url.
 *
 * Usage:  node scripts/download-images.mjs
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT_DIR   = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'survivors');

// Real Season 50 image URLs from the Survivor fandom wiki CDN.
const CASTAWAYS = [
  { filename: 'cirie-fields.jpg',                url: 'https://static.wikia.nocookie.net/survivor/images/5/5c/S50_Cirie_Fields.jpg' },
  { filename: 'ozzy-lusth.jpg',                  url: 'https://static.wikia.nocookie.net/survivor/images/f/f6/S50_Ozzy_Lusth.jpg' },
  { filename: 'christian-hubicki.jpg',           url: 'https://static.wikia.nocookie.net/survivor/images/8/89/S50_Christian_Hubicki.jpg' },
  { filename: 'joe-hunter.jpg',                  url: 'https://static.wikia.nocookie.net/survivor/images/3/3e/S50_Joe_Hunter.jpg' },
  { filename: 'rick-devens.jpg',                 url: 'https://static.wikia.nocookie.net/survivor/images/4/47/S50_Rick_Devens.jpg' },
  { filename: 'emily-flippen.jpg',               url: 'https://static.wikia.nocookie.net/survivor/images/3/33/S50_Emily_Flippen.jpg' },
  { filename: 'savannah-louie.jpg',              url: 'https://static.wikia.nocookie.net/survivor/images/9/91/S50_Savannah_Louie.jpg' },
  { filename: 'benjamin-coach-wade.jpg',         url: 'https://static.wikia.nocookie.net/survivor/images/a/a8/S50_Coach_Wade.jpg' },
  { filename: 'jenna-lewis-dougherty.jpg',       url: 'https://static.wikia.nocookie.net/survivor/images/e/e4/S50_Jenna_Lewis-Dougherty.jpg' },
  { filename: 'mike-white.jpg',                  url: 'https://static.wikia.nocookie.net/survivor/images/a/ad/S50_Mike_White.jpg' },
  { filename: 'dee-valladares.jpg',              url: 'https://static.wikia.nocookie.net/survivor/images/2/2b/S50_Dee_Valladares.jpg' },
  { filename: 'kamilla-karthigesu.jpg',          url: 'https://static.wikia.nocookie.net/survivor/images/e/e9/S50_Kamilla_Karthigesu.jpg' },
  { filename: 'charlie-davis.jpg',               url: 'https://static.wikia.nocookie.net/survivor/images/8/84/S50_Charlie_Davis.jpg' },
  { filename: 'tiffany-ervin.jpg',               url: 'https://static.wikia.nocookie.net/survivor/images/e/e0/S50_Tiffany_Nicole_Ervin.jpg' },
  { filename: 'jonathan-young.jpg',              url: 'https://static.wikia.nocookie.net/survivor/images/2/2c/S50_Jonathan_Young.jpg' },
  { filename: 'colby-donaldson.jpg',             url: 'https://static.wikia.nocookie.net/survivor/images/8/82/S50_Colby_Donaldson.jpg' },
  { filename: 'stephenie-lagrossa-kendrick.jpg', url: 'https://static.wikia.nocookie.net/survivor/images/f/f5/S50_Stephenie_LaGrossa_Kendrick.jpg' },
  { filename: 'genevieve-mushaluk.jpg',          url: 'https://static.wikia.nocookie.net/survivor/images/8/82/S50_Genevieve_Mushaluk.jpg' },
  { filename: 'angelina-keeley.jpg',             url: 'https://static.wikia.nocookie.net/survivor/images/0/00/S50_Angelina_Keeley.jpg' },
  { filename: 'q-burdette.jpg',                  url: 'https://static.wikia.nocookie.net/survivor/images/f/f9/S50_Q_Burdette.jpg' },
  { filename: 'kyle-fraser.jpg',                 url: 'https://static.wikia.nocookie.net/survivor/images/d/db/S50_Kyle_Fraser.jpg' },
  { filename: 'rizo-velovic.jpg',                url: 'https://static.wikia.nocookie.net/survivor/images/8/8b/S50_Rizo_Velovic.jpg' },
  { filename: 'aubry-bracco.jpg',                url: 'https://static.wikia.nocookie.net/survivor/images/7/73/S50_Aubry_Bracco.jpg' },
  { filename: 'chrissy-hofbeck.jpg',             url: 'https://static.wikia.nocookie.net/survivor/images/b/b3/S50_Chrissy_Hofbeck.jpg' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveRedirects(urlStr, maxRedirects = 10) {
  return new Promise((resolve, reject) => {
    let redirectsLeft = maxRedirects;
    function request(currentUrl) {
      https.get(currentUrl, { headers: { 'User-Agent': 'Mozilla/5.0 SurvivorImageDownloader/2.0' } }, (res) => {
        const { statusCode, headers } = res;
        if ([301, 302, 307, 308].includes(statusCode) && headers.location) {
          res.resume();
          if (redirectsLeft-- <= 0) return reject(new Error(`Too many redirects for ${currentUrl}`));
          return request(new URL(headers.location, currentUrl).toString());
        }
        resolve({ finalUrl: currentUrl, res, statusCode });
      }).on('error', reject);
    }
    request(urlStr);
  });
}

function downloadUrl(urlStr, destPath) {
  return new Promise((resolve) => {
    resolveRedirects(urlStr)
      .then(({ res, statusCode, finalUrl }) => {
        if (statusCode !== 200) {
          res.resume();
          console.warn(`    [WARN] HTTP ${statusCode} for ${finalUrl}`);
          return resolve(false);
        }
        const contentType = res.headers['content-type'] || '';
        if (!contentType.includes('image/')) {
          res.resume();
          console.warn(`    [WARN] Unexpected content-type "${contentType}" for ${finalUrl}`);
          return resolve(false);
        }
        const file = fs.createWriteStream(destPath);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(true); });
        file.on('error', (err) => {
          fs.unlink(destPath, () => {});
          console.warn(`    [WARN] File write error: ${err.message}`);
          resolve(false);
        });
      })
      .catch((err) => {
        console.warn(`    [WARN] Network error: ${err.message}`);
        resolve(false);
      });
  });
}

async function downloadCastaway({ filename, url }) {
  const destPath = path.join(OUTPUT_DIR, filename);

  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1024) {
    console.log(`  [SKIP] ${filename} already exists`);
    return { filename, success: true, skipped: true };
  }

  console.log(`  [GET]  ${filename}`);
  const ok = await downloadUrl(url, destPath);
  if (ok) {
    console.log(`  [OK]   ${filename} (${fs.statSync(destPath).size} bytes)`);
    return { filename, success: true };
  }

  console.warn(`  [FAIL] ${filename}`);
  return { filename, success: false };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('='.repeat(60));
  console.log('Survivor Season 50 — castaway image downloader');
  console.log('='.repeat(60));
  console.log(`Output: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const results = [];
  for (const castaway of CASTAWAYS) {
    results.push(await downloadCastaway(castaway));
  }

  const succeeded = results.filter((r) => r.success && !r.skipped);
  const skipped   = results.filter((r) => r.skipped);
  const failed    = results.filter((r) => !r.success);

  console.log('\n' + '='.repeat(60));
  console.log(`Downloaded : ${succeeded.length}`);
  console.log(`Skipped    : ${skipped.length}`);
  console.log(`Failed     : ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed:');
    for (const f of failed) console.log(`  - ${f.filename}`);
    process.exit(1);
  } else {
    console.log('\nAll images downloaded successfully.');
  }
}

main().catch((err) => { console.error(err); process.exit(2); });
