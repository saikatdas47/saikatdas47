"use strict";

const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

try {
  const envText = require("node:fs").readFileSync(path.join(__dirname, ".env"), "utf8");
  envText.split(/\r?\n/).forEach((line) => { const match = line.match(/^([A-Z0-9_]+)=(.*)$/); if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim(); });
} catch {}

const ADMIN_DIR = __dirname;
const ROOT_DIR = path.resolve(ADMIN_DIR, "..");
const DATA_DIR = path.join(ROOT_DIR, "data");
const PUBLIC_DIR = path.join(ADMIN_DIR, "public");
const BACKUP_DIR = path.join(ADMIN_DIR, ".backups");
const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT) || 4173;
const MAX_BODY_BYTES = 16 * 1024 * 1024;

const models = {
  home: {
    label: "Home profile", singular: "profile", shape: "object", assetFolder: "profile",
    description: "Main identity, biography, contact information and profile files.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "title", label: "Professional title", type: "text", required: true },
      { name: "location", label: "Location", type: "text" },
      { name: "about", label: "About", type: "textarea", required: true, wide: true },
      { name: "currentFocus", label: "Current focus", type: "text", help: "Short text shown below the profile picture, for example: Useful systems, trustworthy AI." },
      { name: "profileImage", label: "Profile image", type: "file", accept: "image/*" },
      { name: "industryCvPdf", label: "Industry-focused CV", type: "file", accept: "application/pdf", assetFolder: "documents" },
      { name: "academicCvPdf", label: "Academic-focused CV", type: "file", accept: "application/pdf", assetFolder: "documents" },
      { name: "contactEmail", label: "Email", type: "email" },
      { name: "contactPhone", label: "Phone", type: "text" },
      { name: "skills", label: "Skills", type: "tags", wide: true },
      { name: "links", label: "Profile links", type: "links", wide: true }
    ]
  },
  projects: {
    label: "Projects", singular: "project", shape: "array", assetFolder: "projects",
    description: "Projects with technologies, links, status, display order and cover image.",
    fields: [
      { name: "name", label: "Project name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true, wide: true },
      { name: "details", label: "Full project details", type: "textarea", wide: true, help: "Shown on the individual project page. Add the problem, approach, important features and outcome." },
      { name: "tags", label: "Technologies / tags", type: "tags", wide: true },
      { name: "repo", label: "Repository URL", type: "url" },
      { name: "demo", label: "Live project URL", type: "url", help: "Optional. Add the deployed website or working demo link." },
      { name: "image", label: "Project image", type: "file", accept: "image/*" },
      { name: "date", label: "Project date", type: "date" },
      { name: "status", label: "Status", type: "select", options: ["completed", "ongoing", "planned", "archived"] },
      { name: "industryFocused", label: "Industry-focused project", type: "checkbox", help: "Checked projects appear in the Industry-focused Projects group; unchecked projects appear under Undergraduate Projects." },
      { name: "featured", label: "Featured", type: "checkbox" },
      { name: "sortOrder", label: "Manual sort order", type: "number", help: "Higher numbers appear first on the portfolio." }
    ]
  },
  experience: {
    label: "Experience", singular: "experience", shape: "array", assetFolder: "experience",
    description: "Roles with organization, employment type, dates, achievements and supporting files.",
    fields: [
      { name: "role", label: "Role / position", type: "text", required: true },
      { name: "company", label: "Company / organization", type: "text", required: true },
      { name: "type", label: "Employment type", type: "select", options: ["Full-time", "Part-time", "Internship", "Contract", "Freelance", "Volunteer", "Research"] },
      { name: "location", label: "Location", type: "text" },
      { name: "workMode", label: "Work mode", type: "select", options: ["On-site", "Hybrid", "Remote"] },
      { name: "date", label: "Start date", type: "date" },
      { name: "endDate", label: "End date", type: "date" },
      { name: "current", label: "Currently working here", type: "checkbox" },
      { name: "details", label: "Achievements (one per line)", type: "lines", wide: true },
      { name: "skills", label: "Research areas / skills", type: "tags", wide: true },
      { name: "links", label: "Related links", type: "links", wide: true },
      { name: "attachment", label: "Supporting PDF", type: "file", accept: "application/pdf", assetFolder: "documents/experience" },
      { name: "sortOrder", label: "Manual sort order", type: "number", help: "Higher numbers appear first on the portfolio." }
    ]
  },
  education: {
    label: "Education", singular: "education record", shape: "array", assetFolder: "education",
    description: "Academic records, results, dates, details and optional documents.",
    fields: [
      { name: "degree", label: "Degree / qualification", type: "text", required: true },
      { name: "school", label: "Institution", type: "text", required: true },
      { name: "location", label: "Location", type: "text" },
      { name: "date", label: "Start date", type: "date" },
      { name: "endDate", label: "End date", type: "date" },
      { name: "cgpa", label: "CGPA", type: "text", help: "Use for university results when applicable." },
      { name: "gpa", label: "GPA", type: "text", help: "Use for school or college results when applicable." },
      { name: "details", label: "Focus, achievements and academic notes", type: "lines", wide: true, help: "Do not repeat CGPA or GPA here." },
      { name: "certificate", label: "Certificate / transcript", type: "file", accept: "application/pdf,image/*", assetFolder: "documents/education" },
      { name: "sortOrder", label: "Manual sort order", type: "number", help: "Higher numbers appear first on the portfolio." }
    ]
  },
  publications: {
    label: "Publications", singular: "publication", shape: "array", assetFolder: "publications",
    description: "Research outputs with conservative status, URLs, DOI and optional paper file.",
    fields: [
      { name: "title", label: "Title", type: "textarea", required: true, wide: true },
      { name: "authors", label: "Authors", type: "text", required: true, wide: true },
      { name: "venue", label: "Venue / status", type: "text", required: true },
      { name: "year", label: "Year", type: "text" },
      { name: "date", label: "Publication date", type: "date" },
      { name: "doi", label: "DOI", type: "text" },
      { name: "paperUrl", label: "Paper URL", type: "url" },
      { name: "codeUrl", label: "Code URL", type: "url" },
      { name: "paperFile", label: "Paper PDF", type: "file", accept: "application/pdf", assetFolder: "documents/publications" },
      { name: "notes", label: "Notes", type: "textarea", wide: true },
      { name: "ongoing", label: "Ongoing research", type: "checkbox", help: "Checked research appears in Ongoing Research; uncheck it when the work should move to Research Works." },
      { name: "sortOrder", label: "Manual sort order", type: "number", help: "Higher numbers appear first on the portfolio." }
    ]
  },
  blogs: {
    label: "Blogs", singular: "blog post", shape: "array", assetFolder: "blogs",
    description: "Blog metadata, summary, publishing state, tags and cover image.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, wide: true },
      { name: "excerpt", label: "Excerpt", type: "textarea", wide: true },
      { name: "content", label: "Content / notes", type: "textarea", wide: true },
      { name: "link", label: "Published URL", type: "url" },
      { name: "image", label: "Cover image", type: "file", accept: "image/*" },
      { name: "date", label: "Publish date", type: "date" },
      { name: "status", label: "Status", type: "select", options: ["draft", "published", "archived"] },
      { name: "tags", label: "Tags", type: "tags", wide: true },
      { name: "sortOrder", label: "Manual sort order", type: "number", help: "Higher numbers appear first on the portfolio." }
    ]
  },
  licences: {
    label: "Licences & certificates", singular: "credential", shape: "array", assetFolder: "licences",
    description: "Credentials with issuer, verification details, image and certificate file.",
    fields: [
      { name: "title", label: "Credential title", type: "text", required: true },
      { name: "issuer", label: "Issuer", type: "text", required: true },
      { name: "issueDate", label: "Issue date", type: "date" },
      { name: "expiryDate", label: "Expiry date", type: "date" },
      { name: "credentialId", label: "Credential ID", type: "text" },
      { name: "credentialUrl", label: "Verification URL", type: "url" },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "image", label: "Credential image", type: "file", accept: "image/*" },
      { name: "certificateFile", label: "Certificate PDF", type: "file", accept: "application/pdf", assetFolder: "documents/licences" },
      { name: "highlighted", label: "Highlight this certificate", type: "checkbox", help: "Highlighted certificates appear first in their own section." },
      { name: "sortOrder", label: "Manual sort order", type: "number", help: "Higher numbers appear first on the portfolio." }
    ]
  }
};

const allowedMime = new Map([
  ["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"], ["image/gif", ".gif"],
  ["image/svg+xml", ".svg"], ["application/pdf", ".pdf"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"]
]);

function respond(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(payload), "Cache-Control": "no-store" });
  res.end(payload);
}

function modelOrNull(name) { return typeof name === "string" && Object.hasOwn(models, name) ? models[name] : null; }
function dataFile(name) { return path.join(DATA_DIR, `${name}.json`); }
function getPath(object, dotted) { return dotted.split(".").reduce((value, key) => value?.[key], object); }
function setPath(object, dotted, value) {
  const keys = dotted.split("."); let target = object;
  keys.slice(0, -1).forEach((key) => { if (!target[key] || typeof target[key] !== "object") target[key] = {}; target = target[key]; });
  target[keys.at(-1)] = value;
}

function validate(name, value) {
  const model = models[name]; const errors = []; const warnings = [];
  if (model.shape === "array" && !Array.isArray(value)) return { errors: [`${model.label} data must be an array.`], warnings };
  if (model.shape === "object" && (!value || typeof value !== "object" || Array.isArray(value))) return { errors: [`${model.label} data must be an object.`], warnings };
  const records = model.shape === "array" ? value : [value];
  records.forEach((record, index) => {
    const prefix = model.shape === "array" ? `Record ${index + 1}` : model.label;
    if (!record || typeof record !== "object" || Array.isArray(record)) { errors.push(`${prefix} must be an object.`); return; }
    model.fields.forEach((field) => {
      const fieldValue = getPath(record, field.path || field.name);
      if (field.required && (fieldValue == null || String(fieldValue).trim() === "")) errors.push(`${prefix}: ${field.label} is required.`);
      if (fieldValue == null || fieldValue === "") return;
      if (["tags", "lines", "links"].includes(field.type) && !Array.isArray(fieldValue)) errors.push(`${prefix}: ${field.label} must be a list.`);
      if (field.type === "number" && typeof fieldValue !== "number") errors.push(`${prefix}: ${field.label} must be a number.`);
      if (field.type === "checkbox" && typeof fieldValue !== "boolean") errors.push(`${prefix}: ${field.label} must be true or false.`);
      if (field.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(fieldValue)) errors.push(`${prefix}: ${field.label} must use YYYY-MM-DD.`);
    });
    if (!record.id) warnings.push(`${prefix} has no ID; it will receive one when saved.`);
    if (!record.createdAt || !record.updatedAt) warnings.push(`${prefix} is missing timestamps; they will be added when saved.`);
  });
  return { errors, warnings };
}

function normalizeRecord(model, incoming, previous) {
  const now = new Date().toISOString();
  const record = { ...(previous || {}), ...incoming };
  model.fields.filter((field) => field.path).forEach((field) => {
    const nested = getPath(incoming, field.path); if (nested !== undefined) setPath(record, field.path, nested);
  });
  record.id = previous?.id || incoming.id || crypto.randomUUID();
  record.createdAt = previous?.createdAt || incoming.createdAt || now;
  record.updatedAt = now;
  if (model === models.home) record.contact = { ...(record.contact || {}), email: record.contactEmail || "", phone: record.contactPhone || "" };
  return record;
}

async function readCollection(name) { return JSON.parse(await fs.readFile(dataFile(name), "utf8")); }

function collectManagedAssetPaths(value, paths = new Set()) {
  if (typeof value === "string" && value.startsWith("data/assets/")) paths.add(value);
  else if (Array.isArray(value)) value.forEach((item) => collectManagedAssetPaths(item, paths));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectManagedAssetPaths(item, paths));
  return paths;
}

function managedAssetFile(relative) {
  if (typeof relative !== "string" || !relative.startsWith("data/assets/")) return null;
  const assetsRoot = path.join(DATA_DIR, "assets"); const target = path.resolve(ROOT_DIR, relative);
  return target.startsWith(`${assetsRoot}${path.sep}`) ? target : null;
}

async function removeUnreferencedAssets(previousValue) {
  const candidates = collectManagedAssetPaths(previousValue); if (!candidates.size) return { deletedAssets: [], assetWarnings: [] };
  const referenced = new Set();
  for (const name of Object.keys(models)) collectManagedAssetPaths(await readCollection(name), referenced);
  const deletedAssets = []; const assetWarnings = [];
  for (const relative of candidates) {
    if (referenced.has(relative)) continue;
    const file = managedAssetFile(relative); if (!file) { assetWarnings.push(`Skipped unsafe asset path: ${relative}`); continue; }
    try { await fs.unlink(file); deletedAssets.push(relative); }
    catch (error) { if (error.code !== "ENOENT") assetWarnings.push(`Could not remove ${relative}: ${error.message}`); }
  }
  return { deletedAssets, assetWarnings };
}

async function writeCollection(name, data) {
  const validation = validate(name, data); if (validation.errors.length) return { ok: false, validation };
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  const file = dataFile(name); const old = await fs.readFile(file, "utf8").catch(() => "");
  if (old) await fs.writeFile(path.join(BACKUP_DIR, `${name}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`), old, "utf8");
  const temp = `${file}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(temp, `${JSON.stringify(data, null, 2)}\n`, "utf8"); await fs.rename(temp, file);
  return { ok: true, validation: validate(name, data) };
}

function publicNewsSource(name, record) {
  return {
    category: name,
    name: record.name || record.title || record.role || record.degree || "Portfolio update",
    organization: record.company || record.school || record.issuer || record.venue || "",
    description: record.description || record.excerpt || record.notes || "",
    details: Array.isArray(record.details) ? record.details.slice(0, 3) : [],
    skills: Array.isArray(record.skills) ? record.skills.slice(0, 8) : Array.isArray(record.tags) ? record.tags.slice(0, 8) : [],
    status: record.status || (record.current ? "current" : "")
  };
}

function fallbackNews(name, action, record) {
  const item = record.name || record.title || record.role || record.degree || "portfolio";
  const organization = record.company || record.school || record.issuer || record.venue;
  const verbs = { projects: "added a project", publications: "updated his research portfolio with", experience: "updated his professional journey with", education: "added an education update", licences: "earned a new credential", cv: "updated", contact: "updated" };
  return {
    title: name === "home" ? "Portfolio profile updated" : `${item} ${action === "created" ? "added" : "updated"}`,
    summary: `Saikat ${verbs[name] || "updated"} ${item}${organization ? ` at ${organization}` : ""}.`
  };
}

async function aiNews(name, action, record) {
  const fallback = fallbackNews(name, action, record);
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { ...fallback, aiGenerated: false };
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST", signal: controller.signal,
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b", temperature: 0.5, max_completion_tokens: 220,
        messages: [
          { role: "system", content: "Write a concise portfolio news item in natural English. Use third person and the name Saikat. Return JSON only with title and summary. Title max 55 characters, summary max 220 characters. Never invent facts or achievements." },
          { role: "user", content: JSON.stringify({ action, ...publicNewsSource(name, record) }) }
        ]
      })
    });
    if (!response.ok) throw new Error("AI service unavailable");
    const result = await response.json(); const text = result.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ""));
    if (!parsed.title || !parsed.summary) throw new Error("Invalid AI response");
    return { title: String(parsed.title).slice(0, 80), summary: String(parsed.summary).slice(0, 300), aiGenerated: true };
  } catch { return { ...fallback, aiGenerated: false }; }
  finally { clearTimeout(timer); }
}

async function appendNews(name, action, record) {
  const generated = await aiNews(name, action, record); const now = new Date().toISOString();
  const file = path.join(DATA_DIR, "news.json"); const current = await fs.readFile(file, "utf8").then(JSON.parse).catch(() => []);
  const allowedNewsCategories = new Set(["projects", "publications", "experience", "education", "licences", "cv", "contact"]);
  const validCurrent = current.filter(item => allowedNewsCategories.has(item.category));
  const news = [{ id: crypto.randomUUID(), category: name, action, sourceId: record.id || "home", title: generated.title, summary: generated.summary, date: now.slice(0, 10), createdAt: now, aiGenerated: generated.aiGenerated }, ...validCurrent].slice(0, 10);
  const temp = `${file}.${crypto.randomUUID()}.tmp`; await fs.writeFile(temp, `${JSON.stringify(news, null, 2)}\n`, "utf8"); await fs.rename(temp, file);
}

const automaticNewsSections = new Set(["projects", "publications", "experience", "education", "licences"]);
async function appendHomeSpecificNews(previous, updated) {
  const previousCv = [previous.industryCvPdf || previous.resumePdf || "", previous.academicCvPdf || ""];
  const updatedCv = [updated.industryCvPdf || updated.resumePdf || "", updated.academicCvPdf || ""];
  if (JSON.stringify(previousCv) !== JSON.stringify(updatedCv)) await appendNews("cv", "updated", { id: "portfolio-cv", name: "Curriculum vitae", description: "Industry-focused or academic-focused CV availability was updated." });
  const previousContact = previous.contact || {}, updatedContact = updated.contact || {};
  if (previousContact.email !== updatedContact.email || previousContact.phone !== updatedContact.phone) await appendNews("contact", "updated", { id: "portfolio-contact", name: "Contact information", description: "Portfolio contact availability was updated." });
}

async function portfolioContext() {
  const [home, projects, experience, publications, education] = await Promise.all(["home", "projects", "experience", "publications", "education"].map(readCollection));
  return {
    profile: { name: home.name, title: home.title, location: home.location, about: home.about, skills: home.skills, links: home.links },
    projects: projects.map(publicNewsSource.bind(null, "projects")),
    experience: experience.map(publicNewsSource.bind(null, "experience")),
    research: publications.map(publicNewsSource.bind(null, "publications")),
    education: education.map(publicNewsSource.bind(null, "education"))
  };
}

async function portfolioChat(message, history = []) {
  const context = await portfolioContext();
  if (!process.env.GROQ_API_KEY) throw Object.assign(new Error("AI is available when the local Groq key is configured."), { status: 503 });
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST", signal: controller.signal,
      headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b", temperature: 0.35, max_completion_tokens: 500,
        messages: [
          { role: "system", content: "You are the portfolio assistant for Saikat Das. Answer only from the supplied public portfolio data. Be concise, accurate and helpful. Never invent achievements, statuses, contact details or facts. If the answer is absent, say that it is not available in the published portfolio. Reply in the language used by the visitor." },
          { role: "system", content: `PUBLIC PORTFOLIO DATA:\n${JSON.stringify(context)}` },
          ...history.slice(-6).map((item) => ({ role: item.role, content: item.content })),
          { role: "user", content: message }
        ]
      })
    });
    if (!response.ok) throw new Error("AI service is temporarily unavailable.");
    const result = await response.json(); const answer = result.choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error("AI returned an empty answer.");
    return answer.slice(0, 2500);
  } finally { clearTimeout(timer); }
}

async function body(req) {
  const chunks = []; let size = 0;
  for await (const chunk of req) { size += chunk.length; if (size > MAX_BODY_BYTES) throw Object.assign(new Error("Request exceeds 16 MB."), { status: 413 }); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw Object.assign(new Error("Request body must be valid JSON."), { status: 400 }); }
}

function safeName(original, extension) {
  const stem = path.basename(original, path.extname(original)).normalize("NFKD").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase().slice(0, 70) || "file";
  return `${Date.now()}-${stem}${extension}`;
}

async function upload(name, payload) {
  const model = models[name]; const extension = allowedMime.get(payload.mimeType);
  if (!extension) throw Object.assign(new Error("Allowed uploads: JPG, PNG, WebP, GIF, SVG, PDF and DOCX."), { status: 415 });
  const raw = String(payload.data || "").replace(/^data:[^;]+;base64,/, ""); const buffer = Buffer.from(raw, "base64");
  if (!buffer.length || buffer.length > 12 * 1024 * 1024) throw Object.assign(new Error("File must be between 1 byte and 12 MB."), { status: 413 });
  const requested = String(payload.assetFolder || model.assetFolder);
  if (!/^[a-z]+(?:\/[a-z]+)?$/.test(requested)) throw Object.assign(new Error("Invalid asset folder."), { status: 400 });
  const folder = path.join(DATA_DIR, "assets", requested); await fs.mkdir(folder, { recursive: true });
  const filename = safeName(payload.fileName || "file", extension); await fs.writeFile(path.join(folder, filename), buffer);
  return `data/assets/${requested}/${filename}`;
}

async function api(req, res, url) {
  const parts = url.pathname.split("/").filter(Boolean);
  if (url.pathname === "/api/models" && req.method === "GET") return respond(res, 200, { models });
  if (url.pathname === "/api/chat" && req.method === "POST") {
    try { const payload = await body(req); const message = String(payload.message || "").trim().slice(0, 500); const history = Array.isArray(payload.history) ? payload.history.filter((item) => item && ["user", "assistant"].includes(item.role) && typeof item.content === "string").slice(-6).map((item) => ({ role: item.role, content: item.content.slice(0, 800) })) : []; if (!message) return respond(res, 400, { error: "Please enter a question." }); return respond(res, 200, { answer: await portfolioChat(message, history) }); }
    catch (error) { return respond(res, error.status || 502, { error: error.message }); }
  }
  const name = parts[2]; const model = modelOrNull(name); if (!model) return respond(res, 404, { error: "Unknown content section." });
  try {
    if (parts[1] === "upload" && req.method === "POST") return respond(res, 201, { path: await upload(name, await body(req)) });
    if (parts[1] !== "data") return respond(res, 404, { error: "API route not found." });
    const collection = await readCollection(name);
    if (req.method === "GET") return respond(res, 200, { data: collection, validation: validate(name, collection) });
    const payload = req.method === "DELETE" ? null : await body(req);
    if (model.shape === "object") {
      if (!["POST", "PUT"].includes(req.method)) return respond(res, 405, { error: "Method not allowed." });
      const updated = normalizeRecord(model, payload, collection); const result = await writeCollection(name, updated);
      const cleanup = result.ok ? await removeUnreferencedAssets(collection) : {};
      if (result.ok && name === "home") await appendHomeSpecificNews(collection, updated);
      return respond(res, result.ok ? 200 : 422, result.ok ? { message: "Profile saved.", data: updated, ...result, ...cleanup } : result);
    }
    if (req.method === "POST") {
      const record = normalizeRecord(model, payload); const result = await writeCollection(name, [...collection, record]);
      if (result.ok && automaticNewsSections.has(name)) await appendNews(name, "created", record);
      return respond(res, result.ok ? 201 : 422, result.ok ? { message: `${model.singular} created.`, data: record, ...result } : result);
    }
    const id = parts[3]; const index = collection.findIndex((item) => item.id === id); if (index < 0) return respond(res, 404, { error: "Record not found." });
    if (req.method === "PUT") {
      const record = normalizeRecord(model, payload, collection[index]); const next = [...collection]; next[index] = record;
      const result = await writeCollection(name, next); const cleanup = result.ok ? await removeUnreferencedAssets(collection[index]) : {}; if (result.ok && automaticNewsSections.has(name)) await appendNews(name, "updated", record); return respond(res, result.ok ? 200 : 422, result.ok ? { message: `${model.singular} updated.`, data: record, ...result, ...cleanup } : result);
    }
    if (req.method === "DELETE") {
      const next = collection.filter((item) => item.id !== id); const result = await writeCollection(name, next);
      const cleanup = result.ok ? await removeUnreferencedAssets(collection[index]) : {};
      return respond(res, result.ok ? 200 : 422, result.ok ? { message: `${model.singular} and its unreferenced files were deleted.`, ...result, ...cleanup } : result);
    }
    return respond(res, 405, { error: "Method not allowed." });
  } catch (error) { return respond(res, error.status || 500, { error: error.message }); }
}

function type(file) { return ({ ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".webp":"image/webp", ".gif":"image/gif", ".svg":"image/svg+xml", ".pdf":"application/pdf" })[path.extname(file).toLowerCase()] || "application/octet-stream"; }
async function staticFile(res, pathname) {
  const relative = pathname === "/" || pathname === "/admin" || pathname === "/admin/" ? "index.html" : pathname.replace(/^\/admin\/?/, "").replace(/^\/+/, "");
  const target = path.resolve(PUBLIC_DIR, decodeURIComponent(relative));
  if (target !== PUBLIC_DIR && !target.startsWith(`${PUBLIC_DIR}${path.sep}`)) return respond(res, 403, { error: "Forbidden." });
  try { const content = await fs.readFile(target); res.writeHead(200, { "Content-Type": type(target), "Content-Length": content.length, "Cache-Control":"no-store" }); res.end(content); }
  catch { respond(res, 404, { error: "Not found." }); }
}

async function portfolioFile(res, pathname) {
  const relative = pathname === "/portfolio" || pathname === "/portfolio/" ? "index.html" : decodeURIComponent(pathname.replace(/^\/portfolio\/?/, ""));
  const target = path.resolve(ROOT_DIR, relative);
  if ((target !== ROOT_DIR && !target.startsWith(`${ROOT_DIR}${path.sep}`)) || target.startsWith(`${ADMIN_DIR}${path.sep}`)) return respond(res, 403, { error: "Forbidden." });
  try { const content = await fs.readFile(target); res.writeHead(200, { "Content-Type": type(target), "Content-Length": content.length, "Cache-Control":"no-store" }); return res.end(content); }
  catch { return respond(res, 404, { error: "Not found." }); }
}

async function handler(req, res) {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  if (url.pathname.startsWith("/api/")) return api(req, res, url);
  if (url.pathname.startsWith("/data/")) {
    const target = path.resolve(ROOT_DIR, url.pathname.slice(1)); if (!target.startsWith(`${DATA_DIR}${path.sep}`)) return respond(res, 403, { error:"Forbidden." });
    try { const content = await fs.readFile(target); res.writeHead(200,{"Content-Type":type(target),"Content-Length":content.length}); return res.end(content); } catch { return respond(res,404,{error:"Not found."}); }
  }
  if (url.pathname === "/portfolio" || url.pathname.startsWith("/portfolio/")) return portfolioFile(res, url.pathname);
  return staticFile(res, url.pathname);
}

async function checkData() {
  let failed = false;
  for (const name of Object.keys(models)) { try { const validation = validate(name, await readCollection(name)); console.log(`${validation.errors.length ? "FAIL" : "OK  "} ../data/${name}.json`); validation.errors.forEach((x) => console.error(`  - ${x}`)); if (validation.errors.length) failed = true; } catch (error) { failed = true; console.error(`FAIL ../data/${name}.json\n  - ${error.message}`); } }
  process.exitCode = failed ? 1 : 0;
}

async function migrateData() {
  for (const [name, model] of Object.entries(models)) {
    const current = await readCollection(name); const migrated = model.shape === "array" ? current.map((item) => normalizeRecord(model, item, item)) : normalizeRecord(model, current, current);
    const result = await writeCollection(name, migrated); if (!result.ok) throw new Error(result.validation.errors.join("\n")); console.log(`Migrated ../data/${name}.json`);
  }
}

if (process.argv.includes("--check-data")) checkData();
else if (process.argv.includes("--migrate-data")) migrateData().catch((error) => { console.error(error.message); process.exitCode = 1; });
else http.createServer(handler).listen(PORT, HOST, () => { console.log(`Portfolio Admin running at http://localhost:${PORT}`); console.log("Press Ctrl+C to stop."); });
