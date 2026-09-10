import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        telegram: {
          blue: "#2AABEE",
          darkblue: "#229ED9",
          button: "var(--tg-theme-button-color, #2481cc)",
          buttonText: "var(--tg-theme-button-text-color, #ffffff)",
          bg: "var(--tg-theme-bg-color, #17212b)",
          secondaryBg: "var(--tg-theme-secondary-bg-color, #232e3c)",
          text: "var(--tg-theme-text-color, #f5f5f5)",
          hint: "var(--tg-theme-hint-color, #708499)",
          link: "var(--tg-theme-link-color, #6ab2f2)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
