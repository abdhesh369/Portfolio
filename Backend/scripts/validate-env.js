import fs from 'fs';
import path from 'path';

const envExamplePath = path.join(process.cwd(), '.env.example');
const envPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(envExamplePath)) {
    console.log('✅ No .env.example found, skipping validation.');
    process.exit(0);
}

if (!fs.existsSync(envPath)) {
    console.error('❌ .env file is missing! Please copy .env.example to .env and fill in the values.');
    process.exit(1);
}

const parseEnv = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const keys = new Set();
    content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const match = trimmed.match(/^([^=]+)=/);
            if (match) {
                keys.add(match[1].trim());
            }
        }
    });
    return keys;
};

const requiredKeys = parseEnv(envExamplePath);
const actualKeys = parseEnv(envPath);

const missingKeys = [...requiredKeys].filter(key => !actualKeys.has(key));

if (missingKeys.length > 0) {
    console.error(`❌ Your .env file is missing the following required keys:\n  - ${missingKeys.join('\n  - ')}`);
    process.exit(1);
}

console.log('✅ .env validation passed.');
