import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getSnapshotInfo } from "../../../src/tools/get-snapshot-info.js";
import type { Snapshot } from "../../../src/schema.js";

const here = dirname(fileURLToPath(import.meta.url));
const snapshot: Snapshot = JSON.parse(
  readFileSync(join(here, "..", "..", "fixtures", "snapshot.json"), "utf8"),
);

describe("get_snapshot_info", () => {
  it("returns docs_version, version, source, bundled_version, counts, refresh_status", () => {
    const result = getSnapshotInfo({
      snapshot,
      source: "bundled",
      bundledVersion: snapshot.version,
      refreshStatus: "up-to-date",
      docsVersion: "v2",
    });
    expect(result).toEqual({
      docs_version: "v2",
      version: snapshot.version,
      generated_at: snapshot.generatedAt,
      source: "bundled",
      bundled_version: snapshot.version,
      doc_count: 2,
      section_count: 3,
      refresh_status: "up-to-date",
    });
  });

  it("defaults docs_version to v2 when not provided", () => {
    const result = getSnapshotInfo({
      snapshot,
      source: "bundled",
      bundledVersion: snapshot.version,
      refreshStatus: "up-to-date",
    });
    expect(result.docs_version).toBe("v2");
  });
});
