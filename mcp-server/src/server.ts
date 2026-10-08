import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { createRequire } from "node:module";
const _require = createRequire(import.meta.url);
const pkg = _require("../package.json") as { version: string };
import { loadSnapshot, type LoadResult } from "./snapshot/loader.js";
import { buildIndex } from "./search/index.js";
import { searchDocs } from "./tools/search-docs.js";
import { getDoc } from "./tools/get-doc.js";
import { getDocOutline } from "./tools/get-doc-outline.js";
import { listProducts } from "./tools/list-products.js";
import { listDocs } from "./tools/list-docs.js";
import { getSnapshotInfo } from "./tools/get-snapshot-info.js";

const TOOLS = [
  {
    name: "search_docs",
    description:
      "Search VeeCode documentation by keyword or concept. Returns ranked section-level matches across products (devportal, platform, admin-ui, vkdr). Best when you know what topic you're looking for. For exploring structure, prefer list_docs. For reading a known doc, prefer get_doc.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        product: { type: "string", enum: ["devportal", "platform", "admin-ui", "vkdr"] },
        limit: { type: "number", minimum: 1, maximum: 50 },
      },
      required: ["query"],
    },
  },
  {
    name: "get_doc",
    description:
      "Fetch a documentation page. Returns either the full markdown content (omit anchor) or a specific section (provide anchor). Always includes outline and frontmatter.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string" }, anchor: { type: "string" } },
      required: ["path"],
    },
  },
  {
    name: "get_doc_outline",
    description:
      "Cheap preview: returns just the frontmatter and heading tree of a doc without its content. Use before get_doc to decide whether the doc is worth fetching in full.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string" } },
      required: ["path"],
    },
  },
  {
    name: "list_products",
    description:
      "Overview of the four VeeCode products available in this MCP. Use first when you don't know what's documented.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_docs",
    description:
      "Directory tree of docs within a product, optionally filtered by a subpath. Use for structured navigation when search isn't the right tool.",
    inputSchema: {
      type: "object",
      properties: {
        product: { type: "string", enum: ["devportal", "platform", "admin-ui", "vkdr"] },
        subpath: { type: "string" },
      },
      required: ["product"],
    },
  },
  {
    name: "get_snapshot_info",
    description:
      "Returns metadata about the loaded documentation snapshot (version, source, freshness). Useful for debugging staleness.",
    inputSchema: { type: "object", properties: {} },
  },
] as const;

export type DocsVersion = "v1" | "v2" | "v3";

// Each docs version maps to its own bundled snapshot file and refresh URL, so
// the refresh can never pull another version's content.
const SNAPSHOT_SOURCES: Record<DocsVersion, { bundledFile: string; remoteUrl: string }> = {
  v1: {
    bundledFile: "snapshot-v1.json",
    remoteUrl: "https://docs.platform.vee.codes/mcp-snapshot-v1.json",
  },
  v2: {
    bundledFile: "snapshot-v2.json",
    remoteUrl: "https://docs.platform.vee.codes/mcp-snapshot-v2.json",
  },
  v3: {
    bundledFile: "snapshot.json",
    remoteUrl: "https://docs.platform.vee.codes/mcp-snapshot.json",
  },
};

// v3 is built from the current DevPortal tree, so it is the default.
export function resolveVersion(opt?: string): DocsVersion {
  const source = opt ?? process.env.VEECODE_DOCS_MCP_VERSION;
  if (source == null) return "v3";
  const raw = source.trim().toLowerCase();
  if (raw === "v1") return "v1";
  if (raw === "v2") return "v2";
  if (raw === "v3") return "v3";
  // Fail closed: a typo'd or unexpected value must not silently serve the
  // wrong docs line. Surfaces via index.ts as a clean fatal + exit 1.
  throw new Error(
    `Invalid docs version "${source}" — use "v1", "v2", or "v3" ` +
      `(via --version or VEECODE_DOCS_MCP_VERSION).`,
  );
}

function defaultBundledPath(version: DocsVersion): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, "..", "bundled", SNAPSHOT_SOURCES[version].bundledFile);
}

function resolveBundledPath(version: DocsVersion, opt?: string): string {
  return opt ?? process.env.VEECODE_DOCS_MCP_BUNDLED_PATH ?? defaultBundledPath(version);
}

function defaultCacheDir(): string {
  const xdg = process.env.XDG_CACHE_HOME;
  return xdg
    ? join(xdg, "veecode-docs-mcp")
    : join(homedir(), ".cache", "veecode-docs-mcp");
}

// The cache keeps one snapshot per directory with no version field, so a shared
// directory would let one version load a snapshot refreshed for another.
function resolveCacheDir(version: DocsVersion, opt?: string | null): string | null {
  if (opt === null) return null;
  const cacheRoot = opt ?? process.env.VEECODE_DOCS_MCP_CACHE_DIR ?? defaultCacheDir();
  return join(cacheRoot, version);
}

export interface CreateServerOptions {
  /**
   * DevPortal docs version to serve: "v3" (default), "v2", or "v1".
   * Already-validated value — untrusted input (CLI/env) must pass through
   * resolveVersion() first.
   */
  version?: DocsVersion;
  bundledPath?: string;
  /** Base directory for per-version cached snapshots. */
  cacheDir?: string | null;
  remoteUrl?: string | null;
  offline?: boolean;
}

export async function createServer(opts: CreateServerOptions = {}): Promise<{
  server: Server;
  dispose: () => Promise<void>;
}> {
  // opts.version is already a validated DocsVersion; fall back to env/default
  // (via resolveVersion) only when the caller didn't specify one.
  const version = opts.version ?? resolveVersion();
  const bundledPath = resolveBundledPath(version, opts.bundledPath);
  const cacheDir = resolveCacheDir(version, opts.cacheDir);
  const remoteUrl =
    opts.remoteUrl ??
    process.env.VEECODE_DOCS_MCP_SNAPSHOT_URL ??
    SNAPSHOT_SOURCES[version].remoteUrl;
  const offline =
    opts.offline ?? process.env.VEECODE_DOCS_MCP_OFFLINE === "1";

  const loaded: LoadResult = await loadSnapshot({ bundledPath, cacheDir, remoteUrl, offline });
  const index = buildIndex(loaded.snapshot);
  let refreshStatus = loaded.refreshStatus;
  loaded.refreshPromise
    .then((status) => { refreshStatus = status; })
    .catch(() => { refreshStatus = "failed"; });

  const server = new Server(
    { name: "veecode-docs-mcp", version: pkg.version },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS as unknown as never[] }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const name = req.params.name;
    const args = (req.params.arguments ?? {}) as Record<string, unknown>;
    let payload: unknown;
    switch (name) {
      case "search_docs":
        payload = searchDocs(loaded.snapshot, index, args as never);
        break;
      case "get_doc":
        payload = getDoc(loaded.snapshot, args as never);
        break;
      case "get_doc_outline":
        payload = getDocOutline(loaded.snapshot, args as never);
        break;
      case "list_products":
        payload = listProducts(loaded.snapshot);
        break;
      case "list_docs":
        payload = listDocs(loaded.snapshot, args as never);
        break;
      case "get_snapshot_info":
        payload = getSnapshotInfo({
          snapshot: loaded.snapshot,
          source: loaded.source,
          bundledVersion: loaded.bundledVersion,
          refreshStatus,
          docsVersion: version,
        });
        break;
      default:
        throw new Error(`unknown tool: ${name}`);
    }
    return { content: [{ type: "text", text: JSON.stringify(payload) }] };
  });

  return {
    server,
    dispose: async () => { await server.close(); },
  };
}

/** Parse `--version <v1|v2|v3>` / `--version=<v1|v2|v3>` from argv (CLI flag wins over env). */
function parseVersionArg(argv: string[]): string | undefined {
  const eq = argv.find((a) => a.startsWith("--version="));
  if (eq) return eq.slice("--version=".length);
  const i = argv.indexOf("--version");
  if (i !== -1 && argv[i + 1]) return argv[i + 1];
  return undefined;
}

export async function startServer(): Promise<void> {
  const versionArg = parseVersionArg(process.argv.slice(2));
  const { server } = await createServer(
    versionArg !== undefined ? { version: resolveVersion(versionArg) } : {},
  );
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
