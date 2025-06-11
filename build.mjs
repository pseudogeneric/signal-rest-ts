import esbuild from "esbuild";
import fs from "fs/promises";

const entryPoint = "src/index.ts";
const outDir = "dist";

await fs.mkdir(outDir, { recursive: true });

// Library Build (ESM and CJS)
const libraryBuildConfig = {
  entryPoints: [entryPoint],
  bundle: true,
  sourcemap: true,
  platform: "node",
  external: [],
};

// ESM Build
await esbuild.build({
  ...libraryBuildConfig,
  format: "esm",
  outfile: `${outDir}/index.mjs`,
});

// CJS Build
await esbuild.build({
  ...libraryBuildConfig,
  format: "cjs",
  outfile: `${outDir}/index.js`,
});

// Web Build (IIFE for browser)
await esbuild.build({
  entryPoints: [entryPoint],
  bundle: true,
  outfile: `${outDir}/signal-web.js`,
  format: "iife",
  globalName: "SignalClientTmp",
  sourcemap: true,
  minify: true,
  platform: "browser",
  footer: {
    js: "window.SignalClient = SignalClientTmp.SignalClient;",
  },
});

console.log("Build complete!");
