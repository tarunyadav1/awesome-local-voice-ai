import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function loadCatalog() {
  return JSON.parse(await readFile(path.join(root, "data/catalog.json"), "utf8"));
}

export function label(value) {
  return String(value)
    .split("-")
    .map((word) => word === "tts" ? "TTS" : word === "ai" ? "AI" : word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function markdownLink(text, url) {
  return url ? `[${text}](${url})` : text;
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
