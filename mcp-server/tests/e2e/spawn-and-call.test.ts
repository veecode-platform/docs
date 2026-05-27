import { describe, it, expect } from "vitest";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..");
const distEntry = join(repoRoot, "mcp-server", "dist", "index.js");
const fixturePath = join(here, "..", "fixtures", "snapshot.json");

function sanitizeEnv(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(process.env).filter(([, v]) => v !== undefined),
  ) as Record<string, string>;
}

describe("e2e: spawn binary and call tools", () => {
  it("answers list_products via real stdio", async () => {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [distEntry],
      env: {
        ...sanitizeEnv(),
        VEECODE_DOCS_MCP_OFFLINE: "1",
        VEECODE_DOCS_MCP_BUNDLED_PATH: fixturePath,
        // Isolate from any populated developer cache so the bundled fixture is served.
        VEECODE_DOCS_MCP_CACHE_DIR: mkdtempSync(join(tmpdir(), "veecode-docs-mcp-e2e-")),
      },
    });
    const client = new Client({ name: "e2e", version: "0.0.0" }, { capabilities: {} });
    await client.connect(transport);

    const result = await client.callTool({ name: "list_products", arguments: {} });
    const content = result.content as Array<{ type: string; text: string }>;
    const parsed = JSON.parse(content[0]!.text);
    expect(parsed).toHaveLength(4);

    await client.close();
  }, 30_000);
});
