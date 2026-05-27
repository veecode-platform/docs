import { describe, it, expect, beforeAll } from "vitest";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtemp, cp } from "node:fs/promises";
import { buildSnapshot } from "../lib/snapshot-builder.js";

const here = dirname(fileURLToPath(import.meta.url));

async function makeFakeRepo() {
  const root = await mkdtemp(join(tmpdir(), "mcp-snapshot-"));
  for (const id of ["devportal", "platform", "admin-ui", "vkdr"]) {
    await fs.mkdir(join(root, id), { recursive: true });
  }
  await cp(join(here, "__fixtures__", "sample-product"), join(root, "devportal"), {
    recursive: true,
  });
  await fs.writeFile(join(root, "platform", "intro.md"), `---\ntitle: P\n---\n## H\nbody\n`);
  await fs.writeFile(join(root, "admin-ui", "intro.md"), `---\ntitle: A\n---\n`);
  await fs.writeFile(join(root, "vkdr", "intro.md"), `---\ntitle: V\n---\n`);
  return root;
}

async function makeFakeRepoWithV1() {
  const root = await makeFakeRepo();
  // Frozen V1 of devportal lives directly under versioned_docs/version-v1
  // (default instance freezes the `path: devportal` tree's contents).
  await cp(join(here, "__fixtures__", "sample-product"), join(root, "versioned_docs", "version-v1"), {
    recursive: true,
  });
  return root;
}

describe("buildSnapshot", () => {
  let outDir;
  beforeAll(async () => {
    const repoRoot = await makeFakeRepo();
    outDir = await mkdtemp(join(tmpdir(), "mcp-snapshot-out-"));
    await buildSnapshot({
      repoRoot,
      outDir,
      version: "2026.05.25-abc1234",
      generatedAt: "2026-05-25T00:00:00Z",
      schemaPath: join(here, "..", "..", "..", "schemas", "mcp-snapshot.schema.json"),
    });
  });

  it("writes mcp-snapshot.json into outDir", async () => {
    const text = await fs.readFile(join(outDir, "mcp-snapshot.json"), "utf8");
    const snap = JSON.parse(text);
    expect(snap.version).toBe("2026.05.25-abc1234");
    expect(snap.products.map((p) => p.id).sort()).toEqual([
      "admin-ui",
      "devportal",
      "platform",
      "vkdr",
    ]);
  });

  it("counts docs per product", async () => {
    const snap = JSON.parse(await fs.readFile(join(outDir, "mcp-snapshot.json"), "utf8"));
    const devportal = snap.products.find((p) => p.id === "devportal");
    // Fixture has 2 .md files (intro.md + guides/long-doc.md), plus _draft.md is skipped, notes.txt is skipped.
    expect(devportal.docCount).toBe(2);
  });

  it("produced output validates against the emitted JSON Schema", async () => {
    const Ajv = (await import("ajv")).default;
    const addFormats = (await import("ajv-formats")).default;
    const schemaPath = join(here, "..", "..", "..", "schemas", "mcp-snapshot.schema.json");
    const schema = JSON.parse(await fs.readFile(schemaPath, "utf8"));
    const snap = JSON.parse(await fs.readFile(join(outDir, "mcp-snapshot.json"), "utf8"));
    const ajv = new Ajv({ strict: false });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    const ok = validate(snap);
    expect(validate.errors ?? null).toBeNull();
    expect(ok).toBe(true);
  });

  it("does not emit mcp-snapshot-v1.json when no version is cut", async () => {
    await expect(fs.access(join(outDir, "mcp-snapshot-v1.json"))).rejects.toThrow();
  });
});

describe("buildSnapshot with a frozen V1", () => {
  let outDir;
  beforeAll(async () => {
    const repoRoot = await makeFakeRepoWithV1();
    outDir = await mkdtemp(join(tmpdir(), "mcp-snapshot-v1-out-"));
    await buildSnapshot({
      repoRoot,
      outDir,
      version: "2026.05.25-abc1234",
      generatedAt: "2026-05-25T00:00:00Z",
      schemaPath: join(here, "..", "..", "..", "schemas", "mcp-snapshot.schema.json"),
    });
  });

  it("still writes the current snapshot", async () => {
    const snap = JSON.parse(await fs.readFile(join(outDir, "mcp-snapshot.json"), "utf8"));
    expect(snap.products.find((p) => p.id === "devportal").docCount).toBe(2);
  });

  it("writes mcp-snapshot-v1.json with all four products", async () => {
    const snap = JSON.parse(await fs.readFile(join(outDir, "mcp-snapshot-v1.json"), "utf8"));
    expect(snap.products.map((p) => p.id).sort()).toEqual([
      "admin-ui",
      "devportal",
      "platform",
      "vkdr",
    ]);
    // devportal docs in V1 come from versioned_docs/version-v1 (the 2-doc fixture)
    expect(snap.products.find((p) => p.id === "devportal").docCount).toBe(2);
  });

  it("reports V1 devportal docs under the devportal product id and path prefix", async () => {
    const snap = JSON.parse(await fs.readFile(join(outDir, "mcp-snapshot-v1.json"), "utf8"));
    const devportalDocs = snap.docs.filter((d) => d.product === "devportal");
    expect(devportalDocs.length).toBe(2);
    expect(devportalDocs.every((d) => d.path.startsWith("devportal/"))).toBe(true);
  });
});
