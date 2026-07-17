import { readFile } from "node:fs/promises";
import path from "node:path";
import { root } from "./catalog.mjs";

const files = [
  "README.template.md",
  "CONTRIBUTING.md",
  "docs/METHODOLOGY.md",
  "docs/BENCHMARK.md",
  "docs/LICENSES.md",
  "docs/APPLE-SUPPORT.md",
  "site/index.html"
];
const discouraged = [
  "comprehensive guide",
  "ever-evolving",
  "ever evolving",
  "in today's",
  "it's important to note",
  "delve into",
  "game-changer",
  "revolutionary",
  "unlock the power",
  "seamlessly",
  "robust solution",
  "cutting-edge"
];
const errors = [];

for (const relative of files) {
  const text = await readFile(path.join(root, relative), "utf8");
  if (text.includes("—")) errors.push(`${relative}: contains an em dash`);
  for (const phrase of discouraged) {
    if (text.toLowerCase().includes(phrase)) errors.push(`${relative}: contains discouraged phrase "${phrase}"`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log(`Copy check passed for ${files.length} files.`);
