import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEB_ROOT = path.join(__dirname, '..');
const ENV_PATH = path.join(WEB_ROOT, '.env.local');
const TEMPLATE_PATH = path.join(WEB_ROOT, 'ENV_TEMPLATE.md');

console.log('🚀 Tanjai POS - Environment Validator\n');

if (!fs.existsSync(ENV_PATH)) {
    console.error('❌ Error: .env.local not found!');
    console.log('💡 Tip: Copy ENV_TEMPLATE.md to .env.local and fill in the values.\n');
    process.exit(1);
}

const envContent = fs.readFileSync(ENV_PATH, 'utf8');
const templateContent = fs.readFileSync(TEMPLATE_PATH, 'utf8');

// Extract keys from template (looking for lines starting with NEXT_PUBLIC_ or other caps)
const requiredKeys = templateContent.match(/^[A-Z_0-9]+/gm) || [];
const envLines = envContent.split('\n');
const envVars = {};

envLines.forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        envVars[match[1].trim()] = match[2].trim();
    }
});

let missingCount = 0;
let mockCount = 0;

console.log('Checking required variables...');

requiredKeys.forEach(key => {
    const value = envVars[key];

    if (!value) {
        console.log(`❌ Missing: ${key}`);
        missingCount++;
    } else if (value.includes('your-') || value.includes('[') || value.includes('mock-')) {
        console.log(`⚠️ Mock Value: ${key} = ${value}`);
        mockCount++;
    } else {
        // Basic validation
        if (key.includes('URL') && !value.startsWith('http')) {
            console.log(`⚠️ Invalid Format: ${key} should be a URL (starts with http)`);
        } else {
            console.log(`✅ Valid: ${key}`);
        }
    }
});

console.log('\n--- Results ---');
if (missingCount === 0 && mockCount === 0) {
    console.log('🎉 All variables are present and looks like production values!');
} else {
    console.log(`Found ${missingCount} missing and ${mockCount} mock variables.`);
    if (mockCount > 0) {
        console.log('💡 Note: Application will use Mock Supabase Client because some production credentials are missing or mocked.');
    }
}

console.log('\nDone.');
