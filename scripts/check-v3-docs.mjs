// Guards the 3.x docs (devportal/) against the frozen 2.x docs (versioned_docs/version-v2/).
//
// 1. A 3.x page must not carry a 2.x-only marker unless scripts/v3-docs-check.json
//    allows that file, with a reason. An allowed file that no longer carries a
//    marker fails the check, so the allowlist only shrinks.
// 2. Every 2.x page needs a 3.x page with the same doc id, so the version selector
//    can pair them, or a parity entry saying where the topic moved or why it is gone.
//
// Usage: node scripts/check-v3-docs.mjs   (from the repository root)
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const v3Dir = path.join(root, "devportal");
const v2Dir = path.join(root, "versioned_docs", "version-v2");
const config = JSON.parse(fs.readFileSync(path.join(root, "scripts", "v3-docs-check.json"), "utf8"));
const problems = [];
const knownMarkerNames = new Set(config.markers.map((m) => m.name));
for (const m of config.markers) {
  if (/[gy]/.test(m.flags || "")) {
    problems.push(`marker "${m.name}": flags "${m.flags}" must not contain "g" or "y" (stateful lastIndex leaks between files)`);
  }
}
const safeFlags = (flags) => (flags || "").replace(/[gy]/g, "");
const markers = config.markers.map((m) => ({ name: m.name, re: new RegExp(m.pattern, safeFlags(m.flags)) }));

function isValidAllowEntry(entry) {
  if (typeof entry === "string") return entry.length > 0;
  if (entry && typeof entry === "object" && !Array.isArray(entry)) {
    return (
      typeof entry.reason === "string" &&
      entry.reason.length > 0 &&
      Array.isArray(entry.markers) &&
      entry.markers.length > 0 &&
      entry.markers.every((n) => typeof n === "string" && n.length > 0)
    );
  }
  return false;
}

function allowedMarkers(entry) {
  if (typeof entry === "string" && entry.length > 0) return markers.map((m) => m.name);
  if (isValidAllowEntry(entry)) return entry.markers;
  return [];
}

for (const [allowedPath, entry] of Object.entries(config.allow || {})) {
  if (!isValidAllowEntry(entry)) {
    problems.push(
      `${allowedPath}: invalid "allow" entry in scripts/v3-docs-check.json; must be a non-empty string or an object with a non-empty string "reason" and a non-empty "markers" array`
    );
    continue;
  }
  if (typeof entry === "object") {
    for (const name of entry.markers) {
      if (!knownMarkerNames.has(name)) {
        problems.push(`${allowedPath}: unknown marker "${name}" in "allow"; not defined in "markers"`);
      }
    }
  }
}

function docs(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...docs(full));
    else if (/\.mdx?$/.test(entry.name)) found.push(full);
  }
  return found;
}

const docId = (file, base) => path.relative(base, file).replace(/\.mdx?$/, "");
const repoPath = (file) => path.relative(root, file);

for (const file of docs(v3Dir)) {
  const text = fs.readFileSync(file, "utf8");
  const hits = markers.filter((m) => { m.re.lastIndex = 0; return m.re.test(text); }).map((m) => m.name);
  const allowed = config.allow[repoPath(file)];
  const exempted = allowedMarkers(allowed);
  const unexempted = hits.filter((h) => !exempted.includes(h));
  if (unexempted.length) {
    problems.push(`${repoPath(file)}: 2.x-only marker (${unexempted.join(", ")}) in a 3.x page`);
  }
  if (allowed !== undefined && isValidAllowEntry(allowed) && !hits.some((h) => exempted.includes(h))) {
    problems.push(`${repoPath(file)}: no 2.x marker left; remove it from "allow" in scripts/v3-docs-check.json`);
  }
}

for (const allowedPath of Object.keys(config.allow)) {
  if (!fs.existsSync(path.join(root, allowedPath))) {
    problems.push(`${allowedPath}: listed in "allow" but the file does not exist`);
  }
}

const v3Ids = new Set(docs(v3Dir).map((f) => docId(f, v3Dir)));
for (const file of fs.existsSync(v2Dir) ? docs(v2Dir) : []) {
  const id = docId(file, v2Dir);
  const entry = config.parity[id];
  if (v3Ids.has(id)) {
    if (entry) problems.push(`${id}: has a 3.x page with the same id; remove its parity entry`);
    continue;
  }
  if (!entry) {
    problems.push(`${id}: 2.x page without a 3.x page of the same id and without a parity entry`);
  } else if (entry.moved && !v3Ids.has(entry.moved)) {
    problems.push(`${id}: parity entry moves it to "${entry.moved}", which is not a 3.x page`);
  } else if (!entry.moved && !(entry.removed && entry.statedIn && v3Ids.has(entry.statedIn))) {
    problems.push(`${id}: parity entry needs "moved" to a 3.x page, or "removed" with "statedIn" naming the 3.x page that says so`);
  }
}

if (problems.length) {
  console.error(`check-v3-docs: ${problems.length} problem(s)`);
  for (const p of problems) console.error(`- ${p}`);
  process.exit(1);
}
console.log("check-v3-docs: ok");
