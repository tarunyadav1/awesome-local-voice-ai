const state = { catalog: null, models: [], filters: { search: "", task: "all", hardware: "all", commercial: "all", apple: "all" } };

const $ = (selector) => document.querySelector(selector);
const list = $("#model-list");
const dialog = $("#model-dialog");
const content = $("#dialog-content");

const acronyms = new Map([["tts", "TTS"], ["ai", "AI"], ["cpu", "CPU"], ["gpu", "GPU"], ["ios", "iOS"], ["macos", "macOS"], ["mlx", "MLX"], ["mps", "MPS"], ["onnx", "ONNX"], ["cuda", "CUDA"]]);
const label = (value) => String(value)
  .split("-")
  .map((word) => acronyms.get(word.toLowerCase()) ?? word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function tag(value, tone = "") {
  return `<span class="tag ${tone}">${escapeHtml(label(value))}</span>`;
}

function rawTag(value, tone = "") {
  return `<span class="tag ${tone}">${escapeHtml(value)}</span>`;
}

function commercialTone(value) {
  return value === "permissive" ? "good" : value === "restricted" ? "bad" : "warn";
}

function setOptions(selector, values, prefix) {
  const select = $(selector);
  for (const value of [...values].sort()) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = `${prefix ? `${prefix}: ` : ""}${label(value)}`;
    select.append(option);
  }
}

function renderModels() {
  const normalize = (value) => String(value).toLowerCase().replaceAll("-", " ");
  const query = normalize(state.filters.search).trim();
  state.models = state.catalog.models.filter((model) => {
    const haystack = normalize([model.name, model.organization, model.summary, model.languages, model.parameters, ...model.platforms, ...model.tasks].join(" "));
    return (!query || haystack.includes(query))
      && (state.filters.task === "all" || model.tasks.includes(state.filters.task))
      && (state.filters.hardware === "all" || model.hardware_class === state.filters.hardware)
      && (state.filters.commercial === "all" || model.commercial_use === state.filters.commercial)
      && (state.filters.apple === "all" || model.apple_support === state.filters.apple);
  }).sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));

  $("#result-count").textContent = state.models.length;
  $("#empty-state").hidden = state.models.length !== 0;
  list.innerHTML = state.models.map((model) => `
    <button class="model-row" type="button" data-model="${escapeHtml(model.id)}" aria-label="View ${escapeHtml(model.name)} details">
      <span class="model-name"><strong>${escapeHtml(model.name)}</strong><span>${escapeHtml(model.organization)}</span></span>
      <span class="model-summary">${escapeHtml(model.summary)}</span>
      <span class="model-cell"><span class="cell-label">Tasks</span><span class="tags">${model.tasks.slice(0, 2).map((item) => tag(item)).join("")}</span></span>
      <span class="model-cell"><span class="cell-label">Targets</span><span class="tags">${model.platforms.slice(0, 2).map((item) => tag(item, ["MLX", "Core ML", "MPS"].includes(item) ? "good" : "")).join("")}</span></span>
      <span class="model-cell"><span class="cell-label">Use</span>${tag(model.commercial_use, commercialTone(model.commercial_use))}</span>
      <span class="model-arrow" aria-hidden="true">→</span>
    </button>
  `).join("");
}

function showModel(id) {
  const model = state.catalog.models.find((item) => item.id === id);
  if (!model) return;
  const link = (text, href, className = "button button-quiet") => href ? `<a class="${className}" href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(text)} <span aria-hidden="true">↗</span></a>` : "";
  content.innerHTML = `<div class="dialog-body">
    <p class="dialog-kicker">${escapeHtml(model.organization)} / ${escapeHtml(label(model.verification.level))}</p>
    <h2 id="dialog-title">${escapeHtml(model.name)}</h2>
    <p class="dialog-summary">${escapeHtml(model.summary)}</p>
    <div class="tags">${model.tasks.map((item) => tag(item, "good")).join("")}</div>
    <div class="detail-grid">
      <div><span>Languages</span><strong>${escapeHtml(model.languages)}</strong></div>
      <div><span>Parameters</span><strong>${escapeHtml(model.parameters)}</strong></div>
      <div><span>Streaming</span><strong>${escapeHtml(label(model.streaming))}</strong></div>
      <div><span>Voice cloning</span><strong>${escapeHtml(label(model.voice_cloning))}</strong></div>
      <div><span>Local targets</span><strong>${escapeHtml(model.platforms.join(", "))}</strong></div>
      <div><span>Hardware class</span><strong>${escapeHtml(label(model.hardware_class))}</strong></div>
      <div><span>Code license</span><strong>${escapeHtml(model.code_license.name)}</strong></div>
      <div><span>Weight license</span><strong>${escapeHtml(model.weights_license.name)}</strong></div>
      <div><span>Commercial use</span><strong>${escapeHtml(label(model.commercial_use))}</strong></div>
      <div><span>Apple support</span><strong>${escapeHtml(label(model.apple_support))}</strong></div>
    </div>
    <p class="license-note"><strong>License note:</strong> ${escapeHtml(model.license_note)}</p>
    <div class="dialog-links">
      ${link("Open project", model.repo, "button button-primary")}
      ${link("Model card", model.model_card)}
      ${link("Code license", model.code_license.url)}
      ${link("Apple evidence", model.apple_evidence)}
    </div>
  </div>`;
  dialog.showModal();
}

function renderResources() {
  $("#runtime-list").innerHTML = state.catalog.runtimes.sort((a, b) => a.name.localeCompare(b.name)).map((runtime) => `
    <a class="resource-row" href="${escapeHtml(runtime.repo)}" target="_blank" rel="noreferrer">
      <h3>${escapeHtml(runtime.name)}</h3><p>${escapeHtml(runtime.summary)}</p>
      <span class="resource-meta">${runtime.platforms.map((item) => tag(item, ["MLX", "Swift", "Core ML"].includes(item) ? "good" : "")).join("")}</span>
      <span class="arrow" aria-hidden="true">↗</span>
    </a>`).join("");

  $("#app-list").innerHTML = state.catalog.apps.sort((a, b) => a.name.localeCompare(b.name)).map((app) => `
    <a class="resource-row" href="${escapeHtml(app.url)}" target="_blank" rel="noreferrer">
      <h3>${escapeHtml(app.name)}</h3><p>${escapeHtml(app.summary)}</p>
      <span class="resource-meta">${rawTag(app.price, app.price === "Free" ? "good" : "")}${app.maintainer_affiliation ? rawTag("Maintainer affiliated", "warn") : rawTag(app.license)}</span>
      <span class="arrow" aria-hidden="true">↗</span>
    </a>`).join("");
}

function clearFilters() {
  state.filters = { search: "", task: "all", hardware: "all", commercial: "all", apple: "all" };
  $("#search").value = "";
  for (const id of ["task-filter", "hardware-filter", "commercial-filter", "apple-filter"]) $(`#${id}`).value = "all";
  renderModels();
}

async function init() {
  const response = await fetch("catalog.json");
  if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
  state.catalog = await response.json();
  $("#stat-models").textContent = state.catalog.models.length;
  $("#stat-tasks").textContent = new Set(state.catalog.models.flatMap((model) => model.tasks)).size;
  $("#stat-apple").textContent = state.catalog.models.filter((model) => !["unverified", "not-supported"].includes(model.apple_support)).length;

  setOptions("#task-filter", new Set(state.catalog.models.flatMap((model) => model.tasks)));
  setOptions("#hardware-filter", new Set(state.catalog.models.map((model) => model.hardware_class)));
  setOptions("#commercial-filter", new Set(state.catalog.models.map((model) => model.commercial_use)));
  setOptions("#apple-filter", new Set(state.catalog.models.map((model) => model.apple_support)));
  renderModels();
  renderResources();
}

$("#search").addEventListener("input", (event) => { state.filters.search = event.target.value; renderModels(); });
for (const [id, key] of [["task-filter", "task"], ["hardware-filter", "hardware"], ["commercial-filter", "commercial"], ["apple-filter", "apple"]]) {
  $(`#${id}`).addEventListener("change", (event) => { state.filters[key] = event.target.value; renderModels(); });
}
list.addEventListener("click", (event) => { const row = event.target.closest("[data-model]"); if (row) showModel(row.dataset.model); });
$("#clear-filters").addEventListener("click", clearFilters);
$("[data-clear]").addEventListener("click", clearFilters);
$(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    $("#search").focus();
  }
});

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
}, { threshold: .08 });
document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 55, 220)}ms`;
  observer.observe(element);
});

init().catch((error) => {
  list.innerHTML = `<p class="empty-state">Could not load catalog: ${escapeHtml(error.message)}</p>`;
});
