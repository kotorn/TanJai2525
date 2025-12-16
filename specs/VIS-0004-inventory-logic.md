# VIS-0004: Inventory & BOM Logic

**Owner:** Visionary
**Status:** DRAFT

## Objective
Accurate Cost of Goods Sold (COGS) tracking by cutting inventory at the *ingredient* level, not just the *menu item* level.

## Data Structure: The Recipe (BOM)

### Mapping
**Menu Item**: *Pad Kaprao Moo* (Price: 50 THB)
- **Ingredient 1**: Minced Pork (100g)
- **Ingredient 2**: Holy Basil (10g)
- **Ingredient 3**: Fish Sauce (15ml)
- **Ingredient 4**: Rice (150g)

## The Deduction Lifecycle

### Phase 1: Soft Reserve (Order Placed)
- **Trigger**: Customer clicks "Confirm".
- **Action**: Check if (Current Stock - Reserve) > Required.
- **Result**: If OK, increase `reserve_qty`. If Fail, block order.

### Phase 2: Hard Cut (Order Cooked/Served)
- **Trigger**: KDS status updates to "Done".
- **Action**: 
    1.  Create `inventory_transaction` (Type: 'SALE').
    2.  Decrease `current_stock` by Required.
    3.  Decrease `reserve_qty`.

### Phase 3: Waste/Adjustment
- **Scenario**: Cook burns the food.
- **Action**: Staff logs "Waste".
- **Result**: Create transaction (Type: 'WASTE'). COGS increases without Revenue.

## Handling Negatives
- **Policy**: Allow negative stock? **NO** (Strict Mode) / **YES** (Flexible Mode).
- **Default**: **YES**, but flag as "Data Discrepancy" for manager review. (Prevents blocking sales due to data lag).
