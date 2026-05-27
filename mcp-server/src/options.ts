import { join } from "node:path";

const REMOTE_BASE = "https://docs.platform.vee.codes";

/** Bundled snapshot file name shipped inside the package's `bundled/` dir. */
export function bundledFileName(v1: boolean): string {
  return v1 ? "snapshot-v1.json" : "snapshot.json";
}

/** Remote refresh URL. Precedence: explicit opt > env > version default. */
export function resolveRemoteUrl(
  opt: string | null | undefined,
  env: string | undefined,
  v1: boolean,
): string | null {
  if (opt !== undefined) return opt;
  if (env !== undefined) return env;
  return `${REMOTE_BASE}/${v1 ? "mcp-snapshot-v1.json" : "mcp-snapshot.json"}`;
}

/**
 * Cache directory. An explicit opt or env value is used verbatim (caller owns
 * isolation). Only the computed default is namespaced per version so a V1 and a
 * V2 session never share `meta.json`.
 */
export function resolveCacheDir(
  opt: string | null | undefined,
  computedDefault: string,
  v1: boolean,
): string {
  if (opt !== undefined && opt !== null) return opt;
  return v1 ? join(computedDefault, "v1") : computedDefault;
}
