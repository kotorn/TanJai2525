# VIS-0002: 3-Click Ordering Flow (Zero-Friction)

**Owner:** Visionary
**Status:** DRAFT

## Objective
Reduce the customer journey from "Hungry" to "Order Confirmed" to just 3 primary interactions.

## The Logic

### Click 1: Selection (Smart Menu)
- **Context**: User lands on `/r/[id]/t/[table]` via QR.
- **Smart Logic**: The `HeroCard` is pre-selected by AI (Best Seller / Chef's Special).
- **Action**: User taps the "Get Your Warmth" (Add) button on the Hero item or any item in the list.
- **Feedback**: A subtle haptic/visual animation confirms addition. The "View Order" bar appears.

### Click 2: Review (Instant Drawer)
- **Action**: User taps the "View Order" bar (BottomNav).
- **Result**: The `CartDrawer` slides up instantly (no page load).
- **Content**: Summary of items + Total Price.
- **Upsell**: (Optional) "Add an Egg?" pill button.

### Click 3: Confirm (Guest Checkout)
- **Action**: User taps "Confirm Order".
- **Backend**: 
    1.  Create anonymous `session_id`.
    2.  Fingerprint device.
    3.  Submit order to `orders` table.
- **Result**: Success animation -> Redirect to "Tracking" state.

## Constraints
- **No Login**: Explicitly forbid forcing login/signup before ordering.
- **Permissions**: Ask for "Name" (optional) only AFTER the order is sent (for calling queue).
