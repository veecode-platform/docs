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
import { bundledFileName, resolveRemoteUrl, resolveCacheDir } from "./options.js";

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

function defaultBundledPath(v1: boolean): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, "..", "bundled", bundledFileName(v1));
}

function resolveBundledPath(opt: string | undefined, v1: boolean): string {
  return opt ?? process.env.VEECODE_DOCS_MCP_BUNDLED_PATH ?? defaultBundledPath(v1);
}

function defaultCacheDir(): string {
  const xdg = process.env.XDG_CACHE_HOME;
  return xdg
    ? join(xdg, "veecode-docs-mcp")
    : join(homedir(), ".cache", "veecode-docs-mcp");
}

export interface CreateServerOptions {
  bundledPath?: string;
  cacheDir?: string | null;
  remoteUrl?: string | null;
  offline?: boolean;
  version?: "current" | "v1";
}

export async function createServer(opts: CreateServerOptions = {}): Promise<{
  server: Server;
  dispose: () => Promise<void>;
}> {
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

export async function startServer(): Promise<void> {
  const version = process.argv.includes("--v1") ? "v1" : undefined;
  const { server } = await createServer({ version });
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
