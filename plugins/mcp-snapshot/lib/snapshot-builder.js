const { promises: fs } = require("node:fs");
const fsSync = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const Ajv = require("ajv").default;
const addFormats = require("ajv-formats").default;
const { walkProduct } = require("./doc-walker.js");

const PRODUCTS = [
  { id: "devportal", name: "DevPortal", description: "VeeCode's Backstage distribution" },
  { id: "platform", name: "Platform", description: "Platform engineering concepts and how-tos" },
  { id: "admin-ui", name: "Admin-UI", description: "VeeCode Admin UI configuration and operation" },
  { id: "vkdr", name: "VKDR-CLI", description: "VKDR command-line tool" },
];

function gitShortSha(cwd) {
  try {
    return execFileSync("git", ["rev-parse", "--short=7", "HEAD"], {
      cwd,
      encoding: "utf8",
    }).trim();
  } catch {
    return "0000000";
  }
}

function deriveVersion() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function loadValidator(schemaPath) {
  const schema = JSON.parse(fsSync.readFileSync(schemaPath, "utf8"));
  const ajv = new Ajv({ strict: false });
  addFormats(ajv);
  return ajv.compile(schema);
}

async function assembleSnapshot({ version, generatedAt, rootFor }) {
  const products = [];
  const allDocs = [];
  for (const p of PRODUCTS) {
    const docs = await walkProduct({ productId: p.id, productRoot: rootFor(p.id) });
    products.push({ ...p, docCount: docs.length });
    allDocs.push(...docs);
  }
  return { version, generatedAt, products, docs: allDocs };
}

async function validateAndWrite(snapshot, validate, outDir, fileName) {
  if (!validate(snapshot)) {
    const msg = JSON.stringify(validate.errors, null, 2);
    throw new Error(`${fileName} failed schema validation:\n${msg}`);
  }
  await fs.mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, fileName);
  await fs.writeFile(outFile, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
  return outFile;
}

async function buildSnapshot({ repoRoot, outDir, version, generatedAt, schemaPath }) {
  const finalVersion = version ?? `${deriveVersion()}-${gitShortSha(repoRoot)}`;
  const finalGeneratedAt = generatedAt ?? new Date().toISOString();
  const finalSchemaPath = schemaPath ?? path.join(repoRoot, "schemas", "mcp-snapshot.schema.json");
  const validate = loadValidator(finalSchemaPath);

  // Current = V2: every product walked from its own dir.
  const current = await assembleSnapshot({
    version: finalVersion,
    generatedAt: finalGeneratedAt,
    rootFor: (id) => path.join(repoRoot, id),
  });
  const outFile = await validateAndWrite(current, validate, outDir, "mcp-snapshot.json");

  // Frozen V1 (only if a version was cut): devportal from versioned_docs/version-v1,
  // the other three products from their current (versionless) dirs.
  const v1Root = path.join(repoRoot, "versioned_docs", "version-v1");
  if (fsSync.existsSync(v1Root)) {
    const v1 = await assembleSnapshot({
      version: finalVersion,
      generatedAt: finalGeneratedAt,
      rootFor: (id) => (id === "devportal" ? v1Root : path.join(repoRoot, id)),
    });
    await validateAndWrite(v1, validate, outDir, "mcp-snapshot-v1.json");
  }

  return outFile;
}

module.exports = { buildSnapshot, PRODUCTS };
