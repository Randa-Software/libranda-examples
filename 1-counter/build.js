import * as esbuild from "esbuild";

// Ensure the build is done from the directory containing this script
const __dirname = new URL(".", import.meta.url).pathname;
process.chdir(__dirname);

// Build configuration
const buildConfig = {
    entryPoints: ["html_src/counter.js"],
    bundle: true,
    outdir: "html_data",
    format: "esm",
    platform: "browser",
    sourcemap: false,
    minify: true,
};

try {
    // Build the project
    await esbuild.build(buildConfig);
    console.log("Build completed successfully!");
} catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
}
