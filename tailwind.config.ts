import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
        extend: {
                colors: {
                        background: 'var(--background)',
                        foreground: 'var(--foreground)',
                        card: {
                                DEFAULT: 'var(--card)',
                                foreground: 'var(--card-foreground)'
                        },
                        popover: {
                                DEFAULT: 'var(--popover)',
                                foreground: 'var(--popover-foreground)'
                        },
                        primary: {
                                DEFAULT: 'var(--primary)',
                                foreground: 'var(--primary-foreground)'
                        },
                        secondary: {
                                DEFAULT: 'var(--secondary)',
                                foreground: 'var(--secondary-foreground)'
                        },
                        muted: {
                                DEFAULT: 'var(--muted)',
                                foreground: 'var(--muted-foreground)'
                        },
                        accent: {
                                DEFAULT: 'var(--accent)',
                                foreground: 'var(--accent-foreground)'
                        },
                        destructive: {
                                DEFAULT: 'var(--destructive)',
                                foreground: 'var(--destructive-foreground)'
                        },
                        success: {
                                DEFAULT: 'var(--success)',
                                foreground: 'var(--success-foreground)'
                        },
                        warning: {
                                DEFAULT: 'var(--warning)',
                                foreground: 'var(--warning-foreground)'
                        },
                        gold: {
                                DEFAULT: 'var(--gold)',
                                foreground: 'var(--gold-foreground)'
                        },
                        border: 'var(--border)',
                        input: 'var(--input)',
                        ring: 'var(--ring)',
                        chart: {
                                '1': 'var(--chart-1)',
                                '2': 'var(--chart-2)',
                                '3': 'var(--chart-3)',
                                '4': 'var(--chart-4)',
                                '5': 'var(--chart-5)'
                        }
                },
                borderRadius: {
                        lg: 'var(--radius)',
                        md: 'calc(var(--radius) - 2px)',
                        sm: 'calc(var(--radius) - 4px)',
                        xl: 'calc(var(--radius) + 4px)',
                        '2xl': 'calc(var(--radius) + 8px)',
                        '3xl': 'calc(var(--radius) + 12px)'
                },
                fontFamily: {
                        sans: ['Inter', 'Cairo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                        display: ['Inter', 'Cairo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                        arabic: ['Cairo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                        mono: ['ui-monospace', 'monospace'],
                },
                boxShadow: {
                        // VRD-V4 (audit §19 — verify-by-grep done 2026-09-23):
                        // the legacy indigo 'glow' and amber 'gold' shadows are
                        // REMOVED. This whole v3-style config is dead-by-
                        // construction under Tailwind v4 CSS-first (no @config
                        // anywhere; components.json points at globals.css) —
                        // the live utilities come from globals.css @utility
                        // recipes over monochrome tokens (--shadow-glow /
                        // --shadow-gold / --shadow-card). Full config-file
                        // removal is deferred to the V5 sweep (C-18).
                        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.03)',
                },
        }
  },
  plugins: [tailwindcssAnimate],
};
export default config;
