import type { Config } from "tailwindcss";
import baseConfig from "../../tailwind.config.base";
import animate from "tailwindcss-animate";

export default {
  ...baseConfig,
  content: [
    ...baseConfig.content,
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [...baseConfig.plugins, animate],
} satisfies Config;
