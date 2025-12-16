// Midnight Comfort Design System Tokens
// Code ID: UI-0001
// Owner: Pixel Art

export const COLORS = {
  // Primary Accents
  BURNT_ORANGE: '#ee6c2b',
  GOLDEN_YOLK: '#FFB300',

  // Backgrounds
  MIDNIGHT_DEEP: '#121212',
  MIDNIGHT_SURFACE: '#1E1E1E',
  MIDNIGHT_ELEVATED: '#252525',

  // Text
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#A0A0A0',
  TEXT_MUTED: '#606060',

  // Semantic
  SUCCESS: '#4CAF50',
  ERROR: '#EF5350',
  WARNING: '#FFB300', // Reusing Golden Yolk
};

export const FONTS = {
  DISPLAY: 'var(--font-jakarta)', // Plus Jakarta Sans
  BODY: 'var(--font-noto)',       // Noto Sans
};

export const GLASS_EFFECTS = {
  PANEL: 'bg-[#1E1E1E]/60 backdrop-blur-md border border-white/5',
  NAV: 'bg-[#121212]/85 backdrop-blur-2xl border-b border-white/5',
};

// Z-Index Layers
export const Z_INDEX = {
  BASE: 0,
  GLASS_PANEL: 10,
  NAVBAR: 40,
  DRAWER: 50,
  TOAST: 100,
};
