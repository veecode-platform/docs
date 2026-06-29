import { describe, it, expect, afterEach } from "vitest";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "../../src/server.js";

const here = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(here, "..", "fixtures", "snapshot.json");

describe("createServer bundledPath resolution", () => {
  const originalEnv = { ...process.env };
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("honors VEECODE_DOCS_MCP_BUNDLED_PATH env var", async () => {
    process.env.VEECODE_DOCS_MCP_BUNDLED_PATH = fixturePath;
    delete process.env.VEECODE_DOCS_MCP_OFFLINE;
    // explicit offline: true to skip remote fetch
    const { server, dispose } = await createServer({ offline: true });
    expect(server).toBeTruthy();
    await dispose();
  });

  it("explicit opts.bundledPath overrides env var", async () => {
    process.env.VEECODE_DOCS_MCP_BUNDLED_PATH = "/nonexistent.json";
    const { server, dispose } = await createServer({ bundledPath: fixturePath, offline: true });
    expect(server).toBeTruthy();
    await dispose();
  });

  it("accepts an explicit version with an explicit bundledPath", async () => {
    for (const version of ["v1", "v2"] as const) {
      const { server, dispose } = await createServer({
        version,
        bundledPath: fixturePath,
        offline: true,
      });
      expect(server).toBeTruthy();
      await dispose();
    }
  });

  it("rejects an unknown VEECODE_DOCS_MCP_VERSION value (fail closed)", async () => {
    process.env.VEECODE_DOCS_MCP_VERSION = "bogus";
    await expect(
      createServer({ bundledPath: fixturePath, offline: true }),
    ).rejects.toThrow(/Invalid docs version/);
  });
});
