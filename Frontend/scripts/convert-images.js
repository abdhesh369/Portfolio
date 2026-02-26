import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
const imagesDir = path.join(publicDir, 'images');

if (!fs.existsSync(imagesDir)) {
  console.log('Images directory does not exist, skipping conversion.');
  process.exit(0);
}

const files = fs.readdirSync(imagesDir);
console.log(`Found ${files.length} files in images directory.`);

for (const file of files) {
  if (file.match(/\.(jpg|jpeg|png)$/i)) {
    const inputPath = path.join(imagesDir, file);
    const outputPath = path.join(imagesDir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));

    try {
      // Skip if output already exists and is newer
      if (fs.existsSync(outputPath)) {
        const inputStats = fs.statSync(inputPath);
        const outputStats = fs.statSync(outputPath);
        if (outputStats.mtime > inputStats.mtime) {
          console.log(`- ${file} is up to date.`);
          continue;
        }
      }

      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(outputPath);
      console.log(`✓ Converted ${file} to WebP`);
    } catch (err) {
      console.error(`✗ Error converting ${file}:`, err);
    }
  }
}
