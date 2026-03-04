import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

const inputFile = path.resolve('public', 'favicon.svg');
const outputDir = path.resolve('public', 'icons');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
    try {
        console.log(`Generating PWA icons from ${inputFile}...`);

        await sharp(inputFile)
            .resize(192, 192)
            .png()
            .toFile(path.join(outputDir, 'pwa-192x192.png'));

        await sharp(inputFile)
            .resize(512, 512)
            .png()
            .toFile(path.join(outputDir, 'pwa-512x512.png'));

        await sharp(inputFile)
            .resize(512, 512)
            .png()
            .toFile(path.join(outputDir, 'pwa-512x512-maskable.png'));

        await sharp(inputFile)
            .resize(180, 180)
            .png()
            .toFile(path.join(outputDir, 'apple-touch-icon.png'));

        console.log('Icons generated successfully.');
    } catch (err) {
        console.error('Error generating icons:', err);
    }
}

generateIcons();
