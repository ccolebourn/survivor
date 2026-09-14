/**
 * download-images-s51.mjs
 *
 * Downloads Season 51 profile images for all 21 castaways from the
 * Survivor fandom wiki CDN (static.wikia.nocookie.net).
 * Uses only Node.js built-in modules: https, fs, path, url.
 *
 * Output goes to public/survivors/s51/ rather than flat in public/survivors/,
 * matching image_path in db/007_survivors_51_seed.sql. Seasons are namespaced
 * so a returning castaway cannot collide on filename with an earlier season.
 *
 * The wiki spells three names differently from the seed (Danny vs Daniel
 * Kilby, Jelly vs Angelica Loblack, Mike vs Michael Pinsky); the local
 * filenames below follow the seed, not the wiki.
 *
 * URLs were resolved via the fandom API (action=query&list=allimages), since
 * the CDN path contains an unguessable hash prefix.
 *
 * Usage:  node scripts/download-images-s51.mjs
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT_DIR   = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'survivors', 's51');

// Real Season 51 image URLs from the Survivor fandom wiki CDN.
const CASTAWAYS = [
  { filename: 'aaliyah-puglia.jpg',         url: 'https://static.wikia.nocookie.net/survivor/images/7/7b/S51_Aaliyah_Puglia.jpg' },
  { filename: 'alexis-levine.jpg',          url: 'https://static.wikia.nocookie.net/survivor/images/e/e9/S51_Alexis_Levine.jpg' },
  { filename: 'ana-sani.jpg',               url: 'https://static.wikia.nocookie.net/survivor/images/d/d4/S51_Ana_Sani.jpg' },
  { filename: 'angelica-jelly-loblack.jpg', url: 'https://static.wikia.nocookie.net/survivor/images/1/11/S51_Jelly_Loblack.jpg' },
  { filename: 'brady-booker.jpg',           url: 'https://static.wikia.nocookie.net/survivor/images/7/75/S51_Brady_Booker.jpg' },
  { filename: 'carter-krull.jpg',           url: 'https://static.wikia.nocookie.net/survivor/images/3/3a/S51_Carter_Krull.jpg' },
  { filename: 'cristian-chavez.jpg',        url: 'https://static.wikia.nocookie.net/survivor/images/a/a3/S51_Cristian_Chavez.jpg' },
  { filename: 'daniel-kilby.jpg',           url: 'https://static.wikia.nocookie.net/survivor/images/e/e1/S51_Danny_Kilby.jpg' },
  { filename: 'devin-way.jpg',              url: 'https://static.wikia.nocookie.net/survivor/images/e/e5/S51_Devin_Way.jpg' },
  { filename: 'eric-macksoud.jpg',          url: 'https://static.wikia.nocookie.net/survivor/images/c/c3/S51_Eric_Macksoud.jpg' },
  { filename: 'jenna-doore.jpg',            url: 'https://static.wikia.nocookie.net/survivor/images/d/dc/S51_Jenna_Doore.jpg' },
  { filename: 'kristin-flickinger.jpg',     url: 'https://static.wikia.nocookie.net/survivor/images/1/17/S51_Kristin_Flickinger.jpg' },
  { filename: 'lewis-kelly.jpg',            url: 'https://static.wikia.nocookie.net/survivor/images/2/25/S51_Lewis_Kelly.jpg' },
  { filename: 'linnea-capobianco.jpg',      url: 'https://static.wikia.nocookie.net/survivor/images/c/c4/S51_Linnea_Capobianco.jpg' },
  { filename: 'maggie-nestor.jpg',          url: 'https://static.wikia.nocookie.net/survivor/images/0/0c/S51_Maggie_Nestor.jpg' },
  { filename: 'michael-pinsky.jpg',         url: 'https://static.wikia.nocookie.net/survivor/images/a/a5/S51_Mike_Pinsky.jpg' },
  { filename: 'ori-jean-charles.jpg',       url: 'https://static.wikia.nocookie.net/survivor/images/6/66/S51_Ori_Jean-Charles.jpg' },
  { filename: 'patt-cannaday.jpg',          url: 'https://static.wikia.nocookie.net/survivor/images/a/a8/S51_Patt_Cannaday.jpg' },
  { filename: 'rob-antonson.jpg',           url: 'https://static.wikia.nocookie.net/survivor/images/0/05/S51_Rob_Antonson.jpg' },
  { filename: 'sharonda-cox.jpg',           url: 'https://static.wikia.nocookie.net/survivor/images/c/cb/S51_Sharonda_Cox.jpg' },
  { filename: 'thien-an-nguyen.jpg',        url: 'https://static.wikia.nocookie.net/survivor/images/6/6d/S51_Thien_An_Nguyen.jpg' },
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
  console.log('Survivor Season 51 - castaway image downloader');
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
