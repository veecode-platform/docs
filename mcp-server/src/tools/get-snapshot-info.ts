import type { Snapshot } from "../schema.js";
import type { LoadSource, RefreshStatus } from "../snapshot/loader.js";

export interface SnapshotInfoInput {
  snapshot: Snapshot;
  source: LoadSource;
  bundledVersion: string;
  refreshStatus: RefreshStatus;
  docsVersion?: "v1" | "v2";
}

export interface SnapshotInfo {
  /** Which DevPortal docs line this server is serving: "v2" (default) or "v1" (prior split-image line). */
  docs_version: "v1" | "v2";
  version: string;
  generated_at: string;
  source: LoadSource;
  bundled_version: string;
  doc_count: number;
  section_count: number;
  refresh_status: RefreshStatus;
}

export function getSnapshotInfo(input: SnapshotInfoInput): SnapshotInfo {
  const section_count = input.snapshot.docs.reduce((n, d) => n + d.sections.length, 0);
  return {
    docs_version: input.docsVersion ?? "v2",
    version: input.snapshot.version,
    generated_at: input.snapshot.generatedAt,
    source: input.source,
    bundled_version: input.bundledVersion,
    doc_count: input.snapshot.docs.length,
    section_count,
    refresh_status: input.refreshStatus,
  };
}
