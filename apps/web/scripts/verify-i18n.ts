
import { TRANSLATIONS } from '../src/lib/i18n-config';

console.log('--- Verifying i18n Keys ---');
['th', 'en', 'my', 'shn', 'lo'].forEach(lang => {
    const keys = Object.keys(TRANSLATIONS[lang]);
    const required = ['title', 'currency', 'addToCart', 'items', 'checkout'];
    const missing = required.filter(k => !keys.includes(k));
    
    if (missing.length > 0) {
        console.error(`❌ [${lang}] Missing keys: ${missing.join(', ')}`);
        process.exit(1);
    } else {
        console.log(`✅ [${lang}] All critical keys present.`);
    }
});
console.log('--- Verification Complete ---');
