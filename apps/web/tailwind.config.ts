import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}', // Ensure UI package is scanned
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: {
           DEFAULT: "#f8f6f6",
           background: "#121212", // Deep Night
        },
        foreground: "#E0E0E0", // Main Text
        primary: {
          DEFAULT: "#FFB300", // Accent Gold
          foreground: "#000000",
          500: "#FFB300", 
        },
        secondary: {
          DEFAULT: "#1E1E1E", // Surface
          foreground: "#9E9E9E", // Muted Text
        },
        destructive: {
            DEFAULT: "#FF5722", // Accent Fire
            foreground: "#FFFFFF",
        },
        muted: {
            DEFAULT: "#1E1E1E",
            foreground: "#9E9E9E",
        },
        accent: {
            DEFAULT: "#64FFDA", // Tech Teal
            foreground: "#000000",
        },
        card: {
            DEFAULT: "#1E1E1E",
            foreground: "#E0E0E0",
        },
        popover: {
            DEFAULT: "#1E1E1E",
            foreground: "#E0E0E0",
        },
        surface: {
            dark: "#1E1E1E"
        },
        // Anon E-commerce Design System Colors
        'anon': {
          'salmon-pink': 'hsl(353, 100%, 78%)',
          'spanish-gray': 'hsl(0, 0%, 60%)',
          'sonic-silver': 'hsl(0, 0%, 47%)',
          'eerie-black': 'hsl(0, 0%, 13%)',
          'sandy-brown': 'hsl(29, 90%, 65%)',
          'bittersweet': 'hsl(0, 100%, 70%)',
          'ocean-green': 'hsl(152, 51%, 52%)',
          'davys-gray': 'hsl(0, 0%, 33%)',
          'cultured': 'hsl(0, 0%, 93%)',
          'onyx': 'hsl(0, 0%, 27%)',
          'jet': 'hsl(0, 0%, 21%)',
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Noto Sans", "sans-serif"],
        thai: ["Noto Sans Thai", "sans-serif"],
      },
      boxShadow: {
        "glow": "0 0 20px -5px rgba(238, 108, 43, 0.5)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        // Anon E-commerce shadows
        "anon-card": "0 5px 20px hsla(0, 0%, 0%, 0.15)",
        "anon-hover": "0 5px 10px hsla(0, 0%, 0%, 0.15)",
      },
      fontSize: {
        // Anon Typography Scale
        'anon-1': '1.563rem',   // 25px
        'anon-2': '1.375rem',   // 22px
        'anon-3': '1.25rem',    // 20px
        'anon-4': '1.125rem',   // 18px
        'anon-5': '1rem',       // 16px
        'anon-6': '0.938rem',   // 15px
        'anon-7': '0.875rem',   // 14px
        'anon-8': '0.813rem',   // 13px
        'anon-9': '0.75rem',    // 12px
        'anon-10': '0.688rem',  // 11px
        'anon-11': '0.625rem',  // 10px
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
export default config;
