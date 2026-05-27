import { describe, it, expect } from "vitest";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "../../src/server.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

const here = dirname(fileURLToPath(import.meta.url));
const bundledPath = join(here, "..", "fixtures", "snapshot.json");

describe("MCP protocol", () => {
  it("lists all six tools", async () => {
    const { server, dispose } = await createServer({ bundledPath, offline: true, cacheDir: null });

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "test", version: "0.0.0" }, { capabilities: {} });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const list = await client.listTools();
    const names = list.tools.map((t) => t.name).sort();
    expect(names).toEqual([
      "get_doc",
      "get_doc_outline",
      "get_snapshot_info",
      "list_docs",
      "list_products",
      "search_docs",
    ]);

    await dispose();
  });

  it("calls search_docs through the protocol", async () => {
    const { server, dispose } = await createServer({ bundledPath, offline: true, cacheDir: null });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "test", version: "0.0.0" }, { capabilities: {} });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const result = await client.callTool({
      name: "search_docs",
      arguments: { query: "dynamic plugin config" },
    });
    const content = result.content as Array<{ type: string; text: string }>;
    expect(content[0]!.type).toBe("text");
    const parsed = JSON.parse(content[0]!.text);
    expect(parsed[0].path).toBe("devportal/integrations/mcp.md");

    await dispose();
  });
});
