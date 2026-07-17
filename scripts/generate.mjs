import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { label, loadCatalog, markdownLink, root } from "./catalog.mjs";

const checkOnly = process.argv.includes("--check");
const catalog = await loadCatalog();
const templatePath = path.join(root, "README.template.md");
const readmePath = path.join(root, "README.md");
const siteCatalogPath = path.join(root, "site/catalog.json");
const start = "<!-- CATALOG:START -->";
const end = "<!-- CATALOG:END -->";

function status(value) {
  if (value === "yes" || value === "permissive") return "Yes";
  if (value === "no" || value === "restricted") return "No";
  return label(value);
}

function modelTable(models) {
  const header = "| Project | What it does | Languages | Size | Local targets | Clone | Commercial | License |\n|---|---|---|---|---|---:|---:|---|";
  const rows = models
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((model) => {
      const licenses = model.code_license.name === model.weights_license.name
        ? markdownLink(model.code_license.name, model.code_license.url)
        : `Code: ${markdownLink(model.code_license.name, model.code_license.url)}<br>Weights: ${markdownLink(model.weights_license.name, model.weights_license.url)}`;
      return `| **${markdownLink(model.name, model.repo)}**<br><sub>${model.organization}</sub> | ${model.summary} | ${model.languages} | ${model.parameters} | ${model.platforms.join(", ")} | ${status(model.voice_cloning)} | ${status(model.commercial_use)} | ${licenses} |`;
    });
  return [header, ...rows].join("\n");
}

function resourceTable(resources) {
  const header = "| Project | Purpose | Platforms | License |\n|---|---|---|---|";
  const rows = resources
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((item) => `| **${markdownLink(item.name, item.repo)}** | ${item.summary} | ${item.platforms.join(", ")} | ${markdownLink(item.license.name, item.license.url)} |`);
  return [header, ...rows].join("\n");
}

function appTable(apps) {
  const header = "| App | Purpose | Platforms | Price | Source | Disclosure |\n|---|---|---|---|---|---|";
  const rows = apps
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((app) => `| **${markdownLink(app.name, app.url)}** | ${app.summary} | ${app.platforms.join(", ")} | ${app.price} | ${app.source ? markdownLink(app.license, app.source) : app.license} | ${app.maintainer_affiliation ? "Maintainer-affiliated" : "Independent"} |`);
  return [header, ...rows].join("\n");
}

const sections = [
  "## Model catalog",
  "",
  `Last source review: **${catalog.meta.updated}**. Every row links to its project and license evidence.`,
  "",
  modelTable([...catalog.models]),
  "",
  "## Local runtimes",
  "",
  resourceTable([...catalog.runtimes]),
  "",
  "## Local apps",
  "",
  "Commercial and open-source apps may be listed if their local processing claim can be checked. Affiliation is always disclosed.",
  "",
  appTable([...catalog.apps])
].join("\n");

const template = await readFile(templatePath, "utf8");
const startIndex = template.indexOf(start);
const endIndex = template.indexOf(end);
if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) {
  throw new Error("README.template.md must contain valid catalog markers");
}

const readme = `${template.slice(0, startIndex + start.length)}\n\n${sections}\n\n${template.slice(endIndex)}`;
const siteCatalog = `${JSON.stringify(catalog, null, 2)}\n`;

if (checkOnly) {
  const currentReadme = await readFile(readmePath, "utf8").catch(() => "");
  const currentSiteCatalog = await readFile(siteCatalogPath, "utf8").catch(() => "");
  if (currentReadme !== readme || currentSiteCatalog !== siteCatalog) {
    console.error("Generated files are stale. Run npm run generate.");
    process.exit(1);
  }
  console.log("Generated files are current.");
} else {
  await mkdir(path.dirname(siteCatalogPath), { recursive: true });
  await Promise.all([
    writeFile(readmePath, readme),
    writeFile(siteCatalogPath, siteCatalog)
  ]);
  console.log("Generated README.md and site/catalog.json.");
}
