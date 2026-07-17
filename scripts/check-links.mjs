import { loadCatalog } from "./catalog.mjs";

const catalog = await loadCatalog();
const urls = new Set();
const add = (value) => value && urls.add(value);
for (const model of catalog.models) {
  [model.repo, model.model_card, model.code_license.url, model.weights_license.url, model.apple_evidence, ...model.verification.sources].forEach(add);
}
for (const runtime of catalog.runtimes) [runtime.repo, runtime.license.url, ...runtime.verification.sources].forEach(add);
for (const app of catalog.apps) [app.url, app.source, ...app.verification.sources].forEach(add);

const failures = [];
const queue = [...urls];
const workers = Array.from({ length: 6 }, async () => {
  while (queue.length) {
    const url = queue.shift();
    try {
      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { "user-agent": "awesome-local-voice-ai-link-checker/1.0" },
        signal: AbortSignal.timeout(20_000)
      });
      if (response.status >= 400 && ![401, 403, 429].includes(response.status)) failures.push(`${response.status} ${url}`);
      await response.body?.cancel();
    } catch (error) {
      failures.push(`${error.name}: ${url}`);
    }
  }
});

await Promise.all(workers);
if (failures.length) {
  console.error(`Link check failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log(`Checked ${urls.size} unique links.`);
