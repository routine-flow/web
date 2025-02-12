import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./index.ts", "./index.css"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom", "next"],
});
