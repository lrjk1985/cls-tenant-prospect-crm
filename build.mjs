import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { build } from "esbuild";

const outputDir = "dist";
const source = await readFile("app.js", "utf8");
const encodedMatch = source.match(/const encodedApp = "([^"]+)";/);

if (!encodedMatch) {
  throw new Error("Could not find the compressed CRM app source.");
}

const appSource = gunzipSync(Buffer.from(encodedMatch[1], "base64")).toString("utf8");
const bundledSource = appSource.replace(
  "const cloudClient = globalThis.supabase?.createClient(supabaseUrl, supabasePublishableKey);",
  'import { createClient } from "@supabase/supabase-js";\nconst cloudClient = createClient(supabaseUrl, supabasePublishableKey);',
);

await mkdir(outputDir, { recursive: true });
await writeFile(`${outputDir}/app.source.js`, bundledSource);

await build({
  bundle: true,
  entryPoints: [`${outputDir}/app.source.js`],
  format: "iife",
  outfile: `${outputDir}/app.js`,
  target: "es2020",
});

let html = await readFile("index.html", "utf8");
html = html.replace(' method="post" onsubmit="return false"', ' method="post"');
html = html.replace(/\s*<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2"><\/script>/, "");
html = html.replace(
  /\s*<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/pako@2\.1\.0\/dist\/pako\.min\.js"><\/script>\s*<script>[\s\S]*?globalThis\.DecompressionStream[\s\S]*?<\/script>/,
  "",
);

await writeFile(`${outputDir}/index.html`, html);

for (const file of [
  "styles.css",
  "artifacts.html",
  "tenant-prospect-import-template.csv",
  "unit-import-template.csv",
  "agent-import-template.csv",
]) {
  await copyFile(file, `${outputDir}/${file}`);
}
