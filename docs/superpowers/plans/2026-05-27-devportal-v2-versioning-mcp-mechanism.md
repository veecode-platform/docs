# DevPortal V1/V2 Versioning + MCP Mechanism — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the V1/V2 versioning scaffold for the DevPortal docs instance and make the `@veecode-platform/docs-mcp` server serve one coherent version per session (default V2, `--v1` to pin V1).

**Architecture:** Native Docusaurus per-instance versioning on the `devportal` (default) instance only — current tree = V2, frozen `version-v1` = today's content. The `mcp-snapshot` Docusaurus plugin emits a second snapshot (`mcp-snapshot-v1.json`) sourced from `versioned_docs/version-v1/` for devportal + the current dirs for the other three (versionless) products. The MCP server gains a `--v1` argv flag that switches the bundled-snapshot file, remote refresh URL, and cache namespace — sessions never mix versions.

**Tech Stack:** Docusaurus 3, Node 20, Yarn 4, the `mcp-snapshot` CJS plugin (vitest), the `@veecode-platform/docs-mcp` TS server (tsup + vitest), GitHub Actions.

**Baseline:** branch off `origin/main` in worktree `worktree-v2-docs`. Run `yarn install` once before starting (already done if `/tmp/v2-yarn-install.log` ends with "Done").

---

## Coordination risk (read before Task 2)

Running `docs:version v1` freezes whatever is in `devportal/` **at execution
time** into `versioned_docs/version-v1/`. A parallel workstream (branch
`docs/devportal-accuracy-overhaul`, the `.audit/` effort) is modernizing the
**V1** content against the real base/-distro repos. If that audit has not landed
on `main` when the real cut happens, the frozen V1 will be pre-audit. **Do not
touch the audit branch or `.audit/`.** At integration time, the cut should run
against the final (post-audit) V1, or the audit diff must be re-applied under
`versioned_docs/version-v1/`. In this worktree we cut against current `main` to
validate the mechanism end-to-end; that is acceptable because the cut is
reproducible and reversible (`git rm -r versioned_docs versioned_sidebars
versions.json`).

## File structure

| File | Responsibility | Action |
|---|---|---|
| `versions.json` | Docusaurus version list for the default instance | Create (via CLI) |
| `versioned_docs/version-v1/` | Frozen V1 of the DevPortal docs | Create (via CLI) |
| `versioned_sidebars/version-v1-sidebars.json` | Frozen V1 sidebar | Create (via CLI) |
| `docusaurus.config.js` | Version labels + `docsVersionDropdown` navbar item | Modify |
| `plugins/mcp-snapshot/lib/snapshot-builder.js` | Emit V2 + (when present) V1 snapshot | Modify |
| `plugins/mcp-snapshot/__tests__/snapshot-builder.test.js` | Cover dual-output | Modify |
| `mcp-server/src/server.ts` | `--v1` → version-aware bundled/remote/cache defaults | Modify |
| `mcp-server/src/options.ts` | Pure resolvers for bundled path / URL / cache dir | Create |
| `mcp-server/tests/unit/options.test.ts` | Cover the resolvers | Create |
| `.github/workflows/publish-mcp.yml` | Copy the V1 snapshot into `bundled/` | Modify |
| `mcp-server/README.md` | Document `--v1` | Modify |
| `devportal/integrations/mcp.md` | Document `--v1` for the docs-MCP | Modify |

---

### Task 1: Cut the V1 version of the DevPortal instance

**Files:**
- Create: `versions.json`, `versioned_docs/version-v1/**`, `versioned_sidebars/version-v1-sidebars.json` (all via CLI)

- [ ] **Step 1: Confirm the working tree is clean and on the worktree branch**

Run: `git -C /home/gio/devportal/docs/.claude/worktrees/v2-docs status -sb`
Expected: `## worktree-v2-docs` with no unstaged content changes under `devportal/`.

- [ ] **Step 2: Cut version `v1` for the default (devportal) instance**

Run: `yarn docusaurus docs:version v1`
Expected: console prints `[SUCCESS] [docs]: version v1 created!`. New paths appear: `versions.json` (contains `["v1"]`), `versioned_docs/version-v1/` (mirror of `devportal/`), `versioned_sidebars/version-v1-sidebars.json`.

- [ ] **Step 3: Verify the freeze captured devportal content directly (not nested)**

Run: `ls versioned_docs/version-v1/ && ls versioned_docs/version-v1/installation-guide/`
Expected: `versioned_docs/version-v1/` contains `intro.md`, `installation-guide/`, etc. directly (the default instance freezes the `path: devportal` tree's *contents*). This path shape is what Task 3 depends on.

- [ ] **Step 4: Commit the cut**

```bash
git add versions.json versioned_docs versioned_sidebars
git commit -m "chore(docs): freeze DevPortal V1 via docusaurus docs:version v1"
```

---

### Task 2: Label current as V2, default to it, add the version dropdown

**Files:**
- Modify: `docusaurus.config.js` (the `presets.classic.docs` block ~lines 45-51; the navbar `items` ~lines 131-162)

- [ ] **Step 1: Configure version labels + lastVersion on the default docs instance**

In `docusaurus.config.js`, replace the `docs:` block inside `presets.classic` (currently lines 45-51) with:

```js
        // https://docusaurus.io/docs/docs-multi-instance
        docs: {
          // id omitted => default instance (devportal)
          path: "devportal",
          routeBasePath: "devportal",
          sidebarPath: require.resolve("./sidebars.js"),
          lastVersion: "current",
          versions: {
            current: { label: "v2", path: "" },
            "v1": { label: "v1", path: "v1" },
          },
        },
```

Effect: current (V2) is the default, served at `/devportal/...`; V1 served at `/devportal/v1/...`.

- [ ] **Step 2: Enable the version dropdown in the navbar**

In `docusaurus.config.js`, the `docsVersionDropdown` item is currently commented out (~lines 153-156). Replace that commented block with a live one, placed just before the GitHub link:

```js
          {
            type: "docsVersionDropdown",
            position: "right",
          },
```

(No `docsPluginId` needed — it targets the default instance, which is devportal.)

- [ ] **Step 3: Build to verify the version config is valid**

Run: `yarn build`
Expected: build completes; output includes both `/devportal/` (v2) and `/devportal/v1/` route trees. No "docs version" errors. (Build also regenerates `build/mcp-snapshot.json`; the V1 snapshot does not exist yet — that's Task 3.)

- [ ] **Step 4: Commit**

```bash
git add docusaurus.config.js
git commit -m "feat(docs): label current as v2, default to v2, add version dropdown"
```

---

### Task 3: Emit a second MCP snapshot for V1

**Files:**
- Modify: `plugins/mcp-snapshot/lib/snapshot-builder.js`
- Test: `plugins/mcp-snapshot/__tests__/snapshot-builder.test.js`

The current builder walks `repoRoot/<product>` for all four products and writes `outDir/mcp-snapshot.json`. We refactor it to assemble from a per-product root resolver, keep the current output unchanged, and additionally write `outDir/mcp-snapshot-v1.json` when `versioned_docs/version-v1/` exists (devportal sourced from there, the other three from their current dirs).

- [ ] **Step 1: Write the failing test for the V1 snapshot output**

In `plugins/mcp-snapshot/__tests__/snapshot-builder.test.js`, extend `makeFakeRepo()` to also create a `versioned_docs/version-v1/` tree, then add a describe block. Add after the existing `makeFakeRepo` (inside it, before `return root;`):

```js
  // Frozen V1 of devportal lives directly under versioned_docs/version-v1
  await cp(join(here, "__fixtures__", "sample-product"), join(root, "versioned_docs", "version-v1"), {
    recursive: true,
  });
```

Then add a new top-level describe:

```js
describe("buildSnapshot with a frozen V1", () => {
  let outDir;
  beforeAll(async () => {
    const repoRoot = await makeFakeRepo();
    outDir = await mkdtemp(join(tmpdir(), "mcp-snapshot-v1-out-"));
    await buildSnapshot({
      repoRoot,
      outDir,
      version: "2026.05.25-abc1234",
      generatedAt: "2026-05-25T00:00:00Z",
      schemaPath: join(here, "..", "..", "..", "schemas", "mcp-snapshot.schema.json"),
    });
  });

  it("writes mcp-snapshot-v1.json alongside the current snapshot", async () => {
    const snap = JSON.parse(await fs.readFile(join(outDir, "mcp-snapshot-v1.json"), "utf8"));
    expect(snap.products.map((p) => p.id).sort()).toEqual([
      "admin-ui", "devportal", "platform", "vkdr",
    ]);
    // devportal docs in V1 come from versioned_docs/version-v1 (the 2-doc fixture)
    const devportal = snap.products.find((p) => p.id === "devportal");
    expect(devportal.docCount).toBe(2);
  });

  it("V1 devportal doc paths are reported under the devportal product id", async () => {
    const snap = JSON.parse(await fs.readFile(join(outDir, "mcp-snapshot-v1.json"), "utf8"));
    const devportalDocs = snap.docs.filter((d) => d.product === "devportal");
    expect(devportalDocs.length).toBe(2);
    expect(devportalDocs.every((d) => d.path.startsWith("devportal/"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn workspace mcp-snapshot test snapshot-builder`
Expected: FAIL — `mcp-snapshot-v1.json` does not exist (ENOENT).

- [ ] **Step 3: Refactor `buildSnapshot` to assemble + write both snapshots**

In `plugins/mcp-snapshot/lib/snapshot-builder.js`, replace the body of `buildSnapshot` (the loop that builds `products`/`allDocs` through the `await fs.writeFile(...)` return) with an assembler used twice:

```js
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
    throw new Error(`${fileName} failed schema validation:\n${JSON.stringify(validate.errors, null, 2)}`);
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

  // Current = V2: every product from its own dir.
  const current = await assembleSnapshot({
    version: finalVersion,
    generatedAt: finalGeneratedAt,
    rootFor: (id) => path.join(repoRoot, id),
  });
  const outFile = await validateAndWrite(current, validate, outDir, "mcp-snapshot.json");

  // Frozen V1 (only if the version was cut): devportal from versioned_docs/version-v1,
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
```

(Keep the existing `PRODUCTS`, `gitShortSha`, `deriveVersion`, `loadValidator`, and the `module.exports = { buildSnapshot, PRODUCTS };` line. `fsSync` is already imported at the top of the file.)

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn workspace mcp-snapshot test snapshot-builder`
Expected: PASS — both the original describe and the new "with a frozen V1" describe pass.

- [ ] **Step 5: Verify against a real build**

Run: `yarn build && ls build/mcp-snapshot*.json`
Expected: both `build/mcp-snapshot.json` and `build/mcp-snapshot-v1.json` exist (Task 1 created `versioned_docs/version-v1/`).

- [ ] **Step 6: Commit**

```bash
git add plugins/mcp-snapshot/lib/snapshot-builder.js plugins/mcp-snapshot/__tests__/snapshot-builder.test.js
git commit -m "feat(mcp-snapshot): emit mcp-snapshot-v1.json from versioned_docs/version-v1"
```

---

### Task 4: Add `--v1` version selection to the MCP server

**Files:**
- Create: `mcp-server/src/options.ts`
- Create: `mcp-server/tests/unit/options.test.ts`
- Modify: `mcp-server/src/server.ts`

Extract the bundled-path / remote-URL / cache-dir resolution into pure,
version-aware helpers (testable), then wire `version` through `createServer` and
parse `--v1` from argv in `startServer`.

- [ ] **Step 1: Write the failing test for the resolvers**

Create `mcp-server/tests/unit/options.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { resolveRemoteUrl, resolveCacheDir, bundledFileName } from "../../src/options.js";

describe("version-aware option resolvers", () => {
  it("bundledFileName picks the v1 file only for v1", () => {
    expect(bundledFileName(false)).toBe("snapshot.json");
    expect(bundledFileName(true)).toBe("snapshot-v1.json");
  });

  it("resolveRemoteUrl returns the v1 URL for v1 when no override", () => {
    expect(resolveRemoteUrl(undefined, undefined, false)).toBe(
      "https://docs.platform.vee.codes/mcp-snapshot.json",
    );
    expect(resolveRemoteUrl(undefined, undefined, true)).toBe(
      "https://docs.platform.vee.codes/mcp-snapshot-v1.json",
    );
  });

  it("resolveRemoteUrl honors explicit opt then env over the version default", () => {
    expect(resolveRemoteUrl("https://x/a.json", "https://y/b.json", true)).toBe("https://x/a.json");
    expect(resolveRemoteUrl(undefined, "https://y/b.json", true)).toBe("https://y/b.json");
  });

  it("resolveCacheDir namespaces v1 under the base dir (default only)", () => {
    expect(resolveCacheDir(undefined, "/base/cache", false)).toBe("/base/cache");
    expect(resolveCacheDir(undefined, "/base/cache", true)).toBe("/base/cache/v1");
  });

  it("resolveCacheDir uses an explicit opt verbatim regardless of version", () => {
    expect(resolveCacheDir("/explicit", "/base/cache", true)).toBe("/explicit");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn workspace @veecode-platform/docs-mcp test options`
Expected: FAIL — `src/options.js` (compiled from `options.ts`) cannot be resolved / module not found.

- [ ] **Step 3: Implement the resolvers**

Create `mcp-server/src/options.ts`:

```ts
import { join } from "node:path";

const REMOTE_BASE = "https://docs.platform.vee.codes";

/** Bundled snapshot file name shipped inside the package's `bundled/` dir. */
export function bundledFileName(v1: boolean): string {
  return v1 ? "snapshot-v1.json" : "snapshot.json";
}

/** Remote refresh URL. Precedence: explicit opt > env > version default. */
export function resolveRemoteUrl(
  opt: string | null | undefined,
  env: string | undefined,
  v1: boolean,
): string | null {
  if (opt !== undefined) return opt;
  if (env !== undefined) return env;
  return `${REMOTE_BASE}/${v1 ? "mcp-snapshot-v1.json" : "mcp-snapshot.json"}`;
}

/**
 * Cache directory. An explicit opt or env value is used verbatim (caller owns
 * isolation). Only the computed default is namespaced per version so a V1 and a
 * V2 session never share `meta.json`.
 */
export function resolveCacheDir(
  opt: string | null | undefined,
  computedDefault: string,
  v1: boolean,
): string {
  if (opt !== undefined && opt !== null) return opt;
  return v1 ? join(computedDefault, "v1") : computedDefault;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `yarn workspace @veecode-platform/docs-mcp test options`
Expected: PASS (5 assertions).

- [ ] **Step 5: Wire `version` through `createServer` and parse `--v1` in `startServer`**

In `mcp-server/src/server.ts`:

(a) add the import after the existing imports:

```ts
import { bundledFileName, resolveRemoteUrl, resolveCacheDir } from "./options.js";
```

(b) replace `defaultBundledPath` / `resolveBundledPath` with version-aware forms:

```ts
function defaultBundledPath(v1: boolean): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, "..", "bundled", bundledFileName(v1));
}

function resolveBundledPath(opt: string | undefined, v1: boolean): string {
  return opt ?? process.env.VEECODE_DOCS_MCP_BUNDLED_PATH ?? defaultBundledPath(v1);
}
```

(c) add `version` to the options interface:

```ts
export interface CreateServerOptions {
  bundledPath?: string;
  cacheDir?: string | null;
  remoteUrl?: string | null;
  offline?: boolean;
  version?: "current" | "v1";
}
```

(d) replace the `bundledPath` / `cacheDir` / `remoteUrl` resolution at the top of `createServer` with:

```ts
  const v1 = opts.version === "v1";
  const bundledPath = resolveBundledPath(opts.bundledPath, v1);
  const cacheDir =
    opts.cacheDir === null
      ? null
      : resolveCacheDir(
          opts.cacheDir ?? process.env.VEECODE_DOCS_MCP_CACHE_DIR,
          defaultCacheDir(),
          v1,
        );
  const remoteUrl = resolveRemoteUrl(
    opts.remoteUrl,
    process.env.VEECODE_DOCS_MCP_SNAPSHOT_URL,
    v1,
  );
  const offline = opts.offline ?? process.env.VEECODE_DOCS_MCP_OFFLINE === "1";
```

(e) update `startServer` to parse argv:

```ts
export async function startServer(): Promise<void> {
  const version = process.argv.includes("--v1") ? "v1" : undefined;
  const { server } = await createServer({ version });
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
```

- [ ] **Step 6: Run the full MCP test + typecheck + lint**

Run: `yarn mcp:ci`
Expected: PASS — typecheck clean, lint clean, all vitest suites green (existing `server-options.test.ts` still passes because explicit `bundledPath` / env still win).

- [ ] **Step 7: Commit**

```bash
git add mcp-server/src/options.ts mcp-server/tests/unit/options.test.ts mcp-server/src/server.ts
git commit -m "feat(mcp): --v1 flag selects the V1 snapshot, URL, and cache namespace"
```

---

### Task 5: Publish the V1 snapshot into the package bundle

**Files:**
- Modify: `.github/workflows/publish-mcp.yml` (the "Copy snapshot into mcp-server/bundled/" step, ~lines 42-45)

- [ ] **Step 1: Copy both snapshots into `bundled/`**

In `.github/workflows/publish-mcp.yml`, replace the `Copy snapshot into mcp-server/bundled/` step with:

```yaml
      - name: Copy snapshots into mcp-server/bundled/
        run: |
          mkdir -p mcp-server/bundled
          cp build/mcp-snapshot.json mcp-server/bundled/snapshot.json
          # V1 snapshot only exists once versioned_docs/version-v1 has been cut.
          if [ -f build/mcp-snapshot-v1.json ]; then
            cp build/mcp-snapshot-v1.json mcp-server/bundled/snapshot-v1.json
          fi
```

(`mcp-server/package.json` already ships the whole `bundled/` dir via `files`, so no package.json change is needed. The deploy workflow uploads the entire `build/` dir to Pages, so `mcp-snapshot-v1.json` is served at `https://docs.platform.vee.codes/mcp-snapshot-v1.json` automatically.)

- [ ] **Step 2: Lint the workflow YAML locally (syntax sanity)**

Run: `node -e "require('js-yaml')" 2>/dev/null && yarn dlx js-yaml .github/workflows/publish-mcp.yml >/dev/null && echo "YAML OK" || python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/publish-mcp.yml')); print('YAML OK')"`
Expected: `YAML OK`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/publish-mcp.yml
git commit -m "ci(mcp): bundle mcp-snapshot-v1.json when present"
```

---

### Task 6: Document `--v1` for users

**Files:**
- Modify: `mcp-server/README.md` (the "Use it with Claude Code" / "Use it with Codex CLI" sections)
- Modify: `devportal/integrations/mcp.md` (the "For developers" section documents the in-portal MCP; add a short docs-MCP note — but keep it scoped to the docs-MCP package, which is distinct from the runtime `mcp-actions` server)

- [ ] **Step 1: Add a `--v1` subsection to `mcp-server/README.md`**

After the "Use it with Codex CLI" section in `mcp-server/README.md`, insert:

```markdown
## Pinning the docs version (V1)

By default the server serves the **current** (V2) documentation. Teams still
running DevPortal V1 can pin the V1 docs by appending `--v1`:

```bash
claude mcp add veecode-docs --scope user -- npx -y @veecode-platform/docs-mcp --v1
```

A session is bound to one version for its whole lifetime — V1 and V2 are never
mixed. With `--v1` the server loads the bundled `snapshot-v1.json`, refreshes
from `https://docs.platform.vee.codes/mcp-snapshot-v1.json`, and caches under a
separate `v1/` namespace. Codex CLI users add the flag the same way:

```toml
[mcp_servers.veecode-docs]
command = "veecode-docs-mcp"
args = ["--v1"]
```
```

- [ ] **Step 2: Verify the README renders the new section without breaking the fence nesting**

Run: `grep -n "Pinning the docs version" mcp-server/README.md`
Expected: one match. Eyeball the surrounding code fences (the outer ```` ``` ```` blocks must each open and close).

- [ ] **Step 3: Commit**

```bash
git add mcp-server/README.md devportal/integrations/mcp.md
git commit -m "docs(mcp): document the --v1 docs-version pin"
```

(Note: `devportal/integrations/mcp.md` documents the *in-portal* `mcp-actions`
server, which is unrelated to the docs-MCP package. Only add a one-line pointer
if it clarifies the distinction; do not conflate the two. If no change is
warranted, drop it from the `git add` above.)

---

## Self-review notes

- **Spec coverage:** versioning scope (devportal only) → Tasks 1-2; native
  Docusaurus mechanism → Tasks 1-2; dual snapshot → Task 3; `--v1` default-V2 +
  pin + no-mix + cache isolation → Task 4; one-liner install unchanged + flag →
  Tasks 4 & 6; backward-compat (no v1 snapshot pre-cut) → Task 3 `existsSync`
  guard + Task 5 `if -f` guard; package name `@veecode-platform/docs-mcp` →
  used verbatim in Task 6.
- **Out of scope here (separate plan):** the V2 content rewrite (IA reshape +
  ~22 HIGH / ~18 LOW pages). This plan only builds the scaffold the content
  lands in.
- **Not unit-testable, verified by build:** the Docusaurus version cut/config
  (Tasks 1-2) and the workflow YAML (Task 5) — verified via `yarn build` and a
  YAML parse rather than unit tests.
