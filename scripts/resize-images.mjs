/**
 * resize-images.mjs
 *
 * Converts all survivor images in public/survivors/ to proper JPEG,
 * resized to 400px wide (maintaining aspect ratio) at 80% quality.
 * Fixes files that were downloaded as WebP but saved with a .jpg extension.
 *
 * Usage: node scripts/resize-images.mjs
 */

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGE_DIR = path.resolve(__dirname, '..', 'public', 'survivors');

async function main() {
  const files = fs.readdirSync(IMAGE_DIR).filter((f) => /\.(jpg|jpeg|webp|png)$/i.test(f));
  console.log(`Found ${files.length} images in ${IMAGE_DIR}\n`);

  let ok = 0, failed = 0;

  for (const file of files) {
    const filePath = path.join(IMAGE_DIR, file);
    const tmpPath  = filePath + '.tmp';
    try {
      const buffer = await sharp(filePath)
        .resize({ width: 400, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      fs.writeFileSync(filePath, buffer);
      const size = fs.statSync(filePath).size;
      console.log(`  [OK]  ${file}  →  ${(size / 1024).toFixed(0)} KB`);
      ok++;
    } catch (err) {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      console.warn(`  [FAIL] ${file}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. ${ok} resized, ${failed} failed.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
