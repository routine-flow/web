import type { Config } from "tailwindcss";
import baseConfig from "../../tailwind.config.base";
import animate from "tailwindcss-animate";

export default {
  ...baseConfig,
  content: [...baseConfig.content],
  plugins: [...baseConfig.plugins, animate],
} satisfies Config;
