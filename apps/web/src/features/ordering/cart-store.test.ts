
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

console.log(`\n🎉 Test Complete: ${passed}/${total} Passed`);
