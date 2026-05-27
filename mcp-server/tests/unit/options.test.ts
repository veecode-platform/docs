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
