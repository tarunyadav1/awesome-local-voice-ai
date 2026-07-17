import { loadCatalog } from "./catalog.mjs";

const catalog = await loadCatalog();
const errors = [];
const allowed = {
  tasks: new Set(["tts", "voice-cloning", "voice-design", "dialogue", "voice-conversion", "speech-to-speech"]),
  commercial: new Set(["permissive", "conditional", "restricted", "varies"]),
  triState: new Set(["yes", "no", "limited", "not-applicable"]),
  streaming: new Set(["yes", "no", "partial", "unknown"]),
  apple: new Set(["upstream", "verified-runtime", "community-port", "unverified", "not-supported"]),
  verification: new Set(["source-reviewed", "runtime-reproduced", "benchmark-reproduced"]),
  hardware: new Set(["edge", "cpu", "consumer-gpu", "high-memory", "varies"]),
  status: new Set(["active", "mature", "maintenance", "legacy"])
};

function fail(path, message) {
  errors.push(`${path}: ${message}`);
}

function isHttps(value) {
  if (value === null) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function checkUrl(path, value) {
  if (!isHttps(value)) fail(path, "must be an HTTPS URL or null");
}

function checkDate(path, value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    fail(path, "must be a real YYYY-MM-DD date");
  }
}

function checkVerification(path, verification) {
  if (!verification || !allowed.verification.has(verification.level)) fail(`${path}.level`, "unknown level");
  checkDate(`${path}.checked`, verification?.checked ?? "");
  if (!Array.isArray(verification?.sources) || verification.sources.length === 0) {
    fail(`${path}.sources`, "must include at least one first-party source");
  } else {
    verification.sources.forEach((source, index) => checkUrl(`${path}.sources[${index}]`, source));
  }
}

function checkLicense(path, license) {
  if (!license || typeof license.name !== "string" || license.name.length < 2) fail(`${path}.name`, "missing license name");
  checkUrl(`${path}.url`, license?.url);
}

checkDate("meta.updated", catalog.meta?.updated ?? "");

if (!Array.isArray(catalog.models) || catalog.models.length < 20) fail("models", "catalog must contain at least 20 entries");
if (!Array.isArray(catalog.runtimes) || catalog.runtimes.length < 3) fail("runtimes", "catalog must contain at least 3 entries");
if (!Array.isArray(catalog.apps) || catalog.apps.length < 3) fail("apps", "catalog must contain at least 3 entries");

const ids = new Set();
for (const [index, model] of (catalog.models ?? []).entries()) {
  const path = `models[${index}]`;
  if (!/^[a-z0-9-]+$/.test(model.id ?? "")) fail(`${path}.id`, "must be a lowercase slug");
  if (ids.has(model.id)) fail(`${path}.id`, `duplicate id ${model.id}`);
  ids.add(model.id);
  if (!model.name || !model.organization || !model.summary) fail(path, "name, organization, and summary are required");
  if (model.summary?.length > 220) fail(`${path}.summary`, "must be 220 characters or fewer");
  if (!Array.isArray(model.tasks) || model.tasks.length === 0 || model.tasks.some((task) => !allowed.tasks.has(task))) fail(`${path}.tasks`, "contains an unknown task");
  if (new Set(model.tasks).size !== model.tasks.length) fail(`${path}.tasks`, "must not contain duplicates");
  checkUrl(`${path}.repo`, model.repo);
  checkUrl(`${path}.model_card`, model.model_card);
  checkUrl(`${path}.apple_evidence`, model.apple_evidence);
  checkLicense(`${path}.code_license`, model.code_license);
  checkLicense(`${path}.weights_license`, model.weights_license);
  if (!allowed.commercial.has(model.commercial_use)) fail(`${path}.commercial_use`, "unknown value");
  if (!allowed.streaming.has(model.streaming)) fail(`${path}.streaming`, "unknown value");
  if (!allowed.triState.has(model.voice_cloning)) fail(`${path}.voice_cloning`, "unknown value");
  if (!allowed.triState.has(model.voice_design)) fail(`${path}.voice_design`, "unknown value");
  if (!allowed.apple.has(model.apple_support)) fail(`${path}.apple_support`, "unknown value");
  if (!allowed.hardware.has(model.hardware_class)) fail(`${path}.hardware_class`, "unknown value");
  if (!allowed.status.has(model.status)) fail(`${path}.status`, "unknown value");
  if (!Array.isArray(model.platforms) || model.platforms.length === 0) fail(`${path}.platforms`, "must include at least one platform");
  checkVerification(`${path}.verification`, model.verification);
}

for (const [index, runtime] of (catalog.runtimes ?? []).entries()) {
  const path = `runtimes[${index}]`;
  if (!runtime.id || !runtime.name || !runtime.summary) fail(path, "id, name, and summary are required");
  checkUrl(`${path}.repo`, runtime.repo);
  checkLicense(`${path}.license`, runtime.license);
  checkVerification(`${path}.verification`, runtime.verification);
}

for (const [index, app] of (catalog.apps ?? []).entries()) {
  const path = `apps[${index}]`;
  if (!app.id || !app.name || !app.summary) fail(path, "id, name, and summary are required");
  checkUrl(`${path}.url`, app.url);
  checkUrl(`${path}.source`, app.source);
  if (typeof app.maintainer_affiliation !== "boolean") fail(`${path}.maintainer_affiliation`, "must be a boolean");
  checkVerification(`${path}.verification`, app.verification);
}

const affiliations = (catalog.apps ?? []).filter((app) => app.maintainer_affiliation);
if (affiliations.length !== 1 || affiliations[0]?.id !== "murmur") {
  fail("apps", "Murmur must be the only explicitly disclosed maintainer-affiliated app");
}

if (errors.length) {
  console.error(`Catalog validation failed with ${errors.length} error(s):\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exit(1);
}

console.log(`Catalog valid: ${catalog.models.length} models, ${catalog.runtimes.length} runtimes, ${catalog.apps.length} apps.`);
