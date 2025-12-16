# UX-0002: KDS Wireframe & Logic

**Owner:** Empathy
**Status:** DRAFT

## Objective
Design a Kitchen Display System that reduces cognitive load for chefs using "Station Routing" and "Meal Pacing".

## Screen Layout (Landscape 1080p)

----------------------------------------------------------------
|  HEADER: [Station Name: HOT KITCHEN] | [Conn: ONLINE] | [Time: 12:45] |
----------------------------------------------------------------
|  WAITING (New)      |  COOKING (active)   |  DONE (Ready)     |
|---------------------|---------------------|-------------------|
| [ T-12 ] 02:30      | [ T-05 ] 10:45 ⚠️   | [ T-08 ] 00:10    |
| - Pad Thai (x2)     | - Tom Yum Goong     | - Coke Zero       |
| - DGE (No Spicy)    |                     |                   |
| [Start Button]      | [Done Button]       | [Undo]            |
|---------------------|---------------------|-------------------|
| [ T-15 ] 00:15      |                     |                   |
| ...                 |                     |                   |
----------------------------------------------------------------

## Visual Cues
- **Green Header**: New Order (< 5 mins).
- **Orange Header**: Warning (> 10 mins).
- **Red Flashing**: Critical (> 15 mins).
- **Strikethrough**: Item cancelled or voided.

## Interaction Logic
1.  **Tap Ticket**: Expands details (Modifiers).
2.  **Double Tap**: Move to Next Column.
3.  **Long Press**: Context Menu (OOS / Reprint).

## Station Routing
- **Beverage Station**: Shows only Drink Category.
- **Hot Kitchen**: Shows Mains, Soups.
- **Expo**: Shows ALL, grouped by Table.
