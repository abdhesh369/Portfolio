import fs from 'fs';
import path from 'path';

const envExamplePath = path.join(process.cwd(), '.env.example');
const envPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(envExamplePath)) {
    console.log('✅ No .env.example found, skipping validation.');
    process.exit(0);
}

const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true' || process.env.CI === 'true';

// Keys that are absolutely required for the app to start/function correctly
const REQUIRED_KEYS = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'ADMIN_PASSWORD',
    'ADMIN_EMAIL',
    'CONTACT_EMAIL'
];

if (!fs.existsSync(envPath)) {
    console.log('ℹ️ No .env file found. Checking system environment variables.');
    
    const missingKeys = REQUIRED_KEYS.filter(key => !process.env[key]);

    if (missingKeys.length > 0) {
        if (isProduction) {
            console.error(`❌ Missing required environment variables in production:\n  - ${missingKeys.join('\n  - ')}`);
        } else {
            console.error('❌ .env file is missing and required environment variables are not set!');
            console.error(`Missing required keys:\n  - ${missingKeys.join('\n  - ')}`);
            console.error('Please copy .env.example to .env and fill in the values or set them in your environment.');
        }
        process.exit(1);
    }
    
    console.log('✅ All required environment variables are present in the system environment.');
    process.exit(0);
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

const missingKeys = [...requiredKeys].filter(key => {
    // If it's in the .env file, it's not missing
    if (actualKeys.has(key)) return false;
    // If it's in process.env, it's not missing
    if (process.env[key]) return false;
    // If it's NOT a required key, it's not "missing" in the sense of causing a failure
    if (!REQUIRED_KEYS.includes(key)) return false;
    
    return true;
});

if (missingKeys.length > 0) {
    console.error(`❌ Your .env file (or system environment) is missing the following required keys:\n  - ${missingKeys.join('\n  - ')}`);
    process.exit(1);
}

console.log('✅ .env validation passed.');
