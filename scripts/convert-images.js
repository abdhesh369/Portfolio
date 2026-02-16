const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceDirs = [
  path.join(__dirname, '../Resources/images'),
  path.join(__dirname, '../public/images')
];

for (const dir of sourceDirs) {
  if (!fs.existsSync(dir)) continue;
  fs.readdirSync(dir).forEach(file => {
    if (file.match(/\.(jpg|jpeg|png)$/i)) {
      const inputPath = path.join(dir, file);
      const outputPath = path.join(path.dirname(inputPath), file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
      sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath)
        .then(() => console.log(`✓ Converted ${file} → ${path.basename(outputPath)}`))
        .catch(err => console.error(`✗ Failed to convert ${file}:`, err));
    }
  });
}
