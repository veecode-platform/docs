import { describe, it, expect, afterEach } from "vitest";
import { resolveVersion } from "../../src/server.js";

describe("resolveVersion", () => {
  const originalEnv = { ...process.env };
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("defaults to v2 when no arg and no env var", () => {
    delete process.env.VEECODE_DOCS_MCP_VERSION;
    expect(resolveVersion(undefined)).toBe("v2");
  });

  it("reads VEECODE_DOCS_MCP_VERSION when no explicit arg", () => {
    process.env.VEECODE_DOCS_MCP_VERSION = "v1";
    expect(resolveVersion(undefined)).toBe("v1");
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
  });

  it("throws on an unrecognized or empty value (fail closed)", () => {
    for (const bad of ["v3", "bogus", "", "  ", "latest"]) {
      expect(() => resolveVersion(bad)).toThrow(/Invalid docs version/);
    }
  });
});
