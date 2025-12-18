
// Mock Browser Environment for Zustand Persist
if (typeof window === 'undefined') {
    const mockStorage = {
        getItem: () => null,
        setItem: () => null,
        removeItem: () => null,
    };
    (global as any).window = {
        localStorage: mockStorage,
    };
    (global as any).localStorage = mockStorage;
}

import { useCartStore } from './cart-store';

// Tiny test runner
console.log("🧪 Starting Tax Calculation Test...");

const { addItem, getTaxBreakdown, clearCart } = useCartStore.getState();

let passed = 0;
let total = 0;

function assert(condition: boolean, message: string) {
    total++;
    if (condition) {
        console.log(`✅ [PASS] ${message}`);
        passed++;
    } else {
        console.error(`❌ [FAIL] ${message}`);
    }
}

// Test 1: Food Item (8%)
clearCart();
addItem({
    menuItemId: '1', name: 'Onigiri', price: 108, quantity: 1, options: {},
    taxRate: 0.08, isAlcohol: false
});

let breakdown = getTaxBreakdown();
assert(Math.abs(breakdown.total8 - 108) < 0.01, "Total8 should be 108");
assert(Math.abs(breakdown.taxAmount8 - 8) < 0.01, "Tax8 should be 8");
assert(breakdown.total10 === 0, "Total10 should be 0");

// Test 2: Alcohol Item (10%)
addItem({
    menuItemId: '2', name: 'Beer', price: 220, quantity: 1, options: {},
    taxRate: 0.10, isAlcohol: true
});

breakdown = useCartStore.getState().getTaxBreakdown();
assert(Math.abs(breakdown.total8 - 108) < 0.01, "Total8 should remain 108");
assert(Math.abs(breakdown.total10 - 220) < 0.01, "Total10 should be 220");
assert(Math.abs(breakdown.taxAmount10 - 20) < 0.01, "Tax10 should be 20");
assert(Math.abs(breakdown.grandTotal - 328) < 0.01, "Grand Total should be 328");

// Test 3: Mixed Quantities
useCartStore.getState().updateQuantity('1', 1); // Onigiri x2 (216)
breakdown = useCartStore.getState().getTaxBreakdown();
assert(Math.abs(breakdown.total8 - 216) < 0.01, "Total8 should be 216");
assert(Math.abs(breakdown.taxAmount8 - 16) < 0.01, "Tax8 should be 16");

// Test 4: Floor Logic Check (Imperfect Number)
// 100 Yen (8%) -> Net: 100/1.08 = 92.592... -> Tax: 7.407... -> Floor: 7
addItem({
    menuItemId: '3', name: 'Cheap Snack', price: 100, quantity: 1, options: {},
    taxRate: 0.08, isAlcohol: false
});

breakdown = useCartStore.getState().getTaxBreakdown();
// Previous total8 was 216, now + 100 = 316
assert(Math.abs(breakdown.total8 - 316) < 0.01, "Total8 should be 316");

// Total Tax8:
// Previous Tax8 (for 216) = 16 (Exact: 216 - 200 = 16)
// New Item Tax (for 100) = 7 (Floor(100 - 92.59))
// Wait, the logic sums TOTAL first, then calculates tax.
// Total 8% Gross = 316.
// Tax = Floor(316 - 316/1.08) = Floor(316 - 292.5925) = Floor(23.407) = 23.
assert(breakdown.taxAmount8 === 23, `Tax8 should be 23 (Floored from ~23.40, was ${breakdown.taxAmount8})`);

console.log(`\n🎉 Test Complete: ${passed}/${total} Passed`);
