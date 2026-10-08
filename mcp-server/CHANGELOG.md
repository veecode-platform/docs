# Changelog

## Unreleased

### Changed

- Add DevPortal docs version `v3` as the default. Serve V2 from its own bundled
  and remote snapshot. Keep V1 on its existing snapshot.
- Accept `v1`, `v2`, and `v3` for `--version` and
  `VEECODE_DOCS_MCP_VERSION`. Invalid values list all three versions.
- Store refresh data in a separate cache subdirectory for each docs version.

## 0.2.0

### Changed

- **Default docs version is now `v2`.** Running the server without `--version`
  (or `VEECODE_DOCS_MCP_VERSION`) serves the **V2** docs line, matching the
  documentation site default. Previously the default was **V1**.

  This is a behavior change for anyone relying on the implicit default. To keep
  the prior split-image / profiles docs, pass `--version v1` (or set
  `VEECODE_DOCS_MCP_VERSION=v1`). Both version snapshots remain bundled; only
  the default selection changed.

- **Version selection now fails closed.** An unrecognized `--version` /
  `VEECODE_DOCS_MCP_VERSION` value now exits with a clear error instead of
  silently falling back to a default. Values are trimmed and case-insensitive
  (`V1`, ` v2 ` resolve correctly).
