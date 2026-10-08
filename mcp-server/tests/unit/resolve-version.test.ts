import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer, resolveVersion } from "../../src/server.js";
import type { Snapshot } from "../../src/schema.js";

const mockLoadSnapshot = vi.hoisted(() => vi.fn());
vi.mock("../../src/snapshot/loader.js", () => ({ loadSnapshot: mockLoadSnapshot }));

const here = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(here, "..", "fixtures", "snapshot.json");
const cacheRoot = join(here, "..", "fixtures", "cache-root");
const snapshot: Snapshot = JSON.parse(readFileSync(fixturePath, "utf8"));
const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv };
  delete process.env.VEECODE_DOCS_MCP_VERSION;
  delete process.env.VEECODE_DOCS_MCP_BUNDLED_PATH;
  delete process.env.VEECODE_DOCS_MCP_SNAPSHOT_URL;
  delete process.env.VEECODE_DOCS_MCP_CACHE_DIR;
  mockLoadSnapshot.mockReset();
  mockLoadSnapshot.mockResolvedValue({
    snapshot,
    source: "bundled",
    bundledVersion: snapshot.version,
    refreshStatus: "disabled",
    refreshPromise: Promise.resolve("disabled"),
  });
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("resolveVersion", () => {
  it("defaults to v3 when no arg and no env var", () => {
    expect(resolveVersion(undefined)).toBe("v3");
  });

  it("reads each VEECODE_DOCS_MCP_VERSION value when no explicit arg", () => {
    for (const version of ["v1", "v2", "v3"] as const) {
      process.env.VEECODE_DOCS_MCP_VERSION = version;
      expect(resolveVersion(undefined)).toBe(version);
    }
  });

  it("an explicit arg wins over the env var", () => {
    process.env.VEECODE_DOCS_MCP_VERSION = "v1";
    expect(resolveVersion("v2")).toBe("v2");
  });

  it("normalizes case and surrounding whitespace to the resolved version", () => {
    expect(resolveVersion("v1")).toBe("v1");
    expect(resolveVersion("V1")).toBe("v1");
    expect(resolveVersion(" v1 ")).toBe("v1");
    expect(resolveVersion("v2")).toBe("v2");
    expect(resolveVersion("  V2")).toBe("v2");
    expect(resolveVersion("v3")).toBe("v3");
    expect(resolveVersion(" V3 ")).toBe("v3");
  });

  it("throws on an unrecognized or empty value (fail closed)", () => {
    for (const bad of ["v4", "bogus", "", "  ", "latest"]) {
      expect(() => resolveVersion(bad)).toThrow(/Invalid docs version/);
    }
    expect(() => resolveVersion("bogus")).toThrow(/"v1".*"v2".*"v3"/);
  });
});

describe("createServer snapshot selection", () => {
  it("uses the v3 snapshot and cache when no version is selected", async () => {
    const { dispose } = await createServer({ cacheDir: cacheRoot, offline: true });
    try {
      expect(mockLoadSnapshot).toHaveBeenCalledWith({
        bundledPath: join(here, "..", "..", "bundled", "snapshot.json"),
        cacheDir: join(cacheRoot, "v3"),
        remoteUrl: "https://docs.platform.vee.codes/mcp-snapshot.json",
        offline: true,
      });
    } finally {
      await dispose();
    }
  });

  it("maps v2 to its frozen snapshot, refresh URL, and cache", async () => {
    const { dispose } = await createServer({ version: "v2", cacheDir: cacheRoot, offline: true });
    try {
      expect(mockLoadSnapshot).toHaveBeenCalledWith({
        bundledPath: join(here, "..", "..", "bundled", "snapshot-v2.json"),
        cacheDir: join(cacheRoot, "v2"),
        remoteUrl: "https://docs.platform.vee.codes/mcp-snapshot-v2.json",
        offline: true,
      });
    } finally {
      await dispose();
    }
  });
});
