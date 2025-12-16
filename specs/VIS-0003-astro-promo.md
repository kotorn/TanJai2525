# VIS-0003: Astro-Dynamic Promotion Logic

**Owner:** Visionary
**Status:** DRAFT

## Objective
Drive sales using "Faith Marketing" (Mute-lu) by suggesting meals based on auspicious timing and astrological rules.

## The Engine (`AstroEngine`)

### 1. Inputs
- **Timestamp**: Current server time.
- **Thai Lunar Calendar**: Computed via library (e.g., `thai-solar-calendar`).
- **User Input (Optional)**: "Select your Zodiac" (Button strip in Smart Menu).

### 2. Logic Rules

#### Rule A: The Color of the Day (Daily Fortune)
- **Monday**: Yellow -> Suggest Corn, Egg, Curry.
- **Tuesday**: Pink -> Suggest Strawberry, Salmon.
- **Wednesday (Day)**: Green -> Suggest Veggie, Pesto.
- ...

#### Rule B: The Auspicious Time (Pacing)
- **11:00 - 13:00 (Horse Time)**: "Fire" element high -> Suggest Quick Noodles, Stir-fry (Hot/Fast).
- **17:00 - 19:00 (Rooster Time)**: "Metal" element -> Suggest Premium Cuts, Silver/Gold visuals.

### 3. Implementation (Mockup)
```typescript
interface AstroRule {
  condition: (date: Date) => boolean;
  promoType: 'DISCOUNT' | 'HIGHLIGHT';
  targetTags: string[]; // ['spicy', 'red', 'seafood']
  copy: string; // "Fire element is strong today!"
}
```

### 4. UI Output
- **Banner**: "Today is a Good Day for [Spicy]!"
- **Tag**: "🔥 Lucky Item" badge on specific product cards.
