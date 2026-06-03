---
sidebar_position: 7
sidebar_label: Dynamic Plugins
title: Dynamic Plugins
---

# Dynamic Plugins

Dynamic plugins are the mechanism DevPortal uses to add Backstage plugins
**without rebuilding the container image**. A dynamic plugin is loaded at
runtime into `/app/dynamic-plugins-root/` rather than compiled into the
application bundle.

---

## Loading is step 1 of 3

This doc covers how plugins are packaged and loaded. Loading is necessary but not sufficient — a loaded plugin does nothing visible until two more steps are in place:

1. **Load** (a preset or `dynamic-plugins.yaml`) — this doc. Makes the plugin's code available.
2. **Context** (entity annotations in `catalog-info.yaml`) — tells the plugin which catalog entities it should attach to. Without the correct annotation on an entity, the plugin is loaded but idle.
3. **Backend** (`app-config`) — provides the credentials and endpoints the plugin queries. Without this, the plugin's tab appears but shows an error or empty state.

All three must be in place before a developer sees live data. See [Composing a Portal](./portal-composition.md) for the full model and a worked example.

---

## Static core vs. dynamic plugins

The image splits its plugins into two categories, mirroring Red Hat Developer
Hub's approach: a thin static core handles identity and data, and the feature
surface expands through the runtime plugin directory.

- **Static plugins** are registered directly in the backend
  (`packages/backend/src/index.ts`): auth, catalog, scaffolder, search,
  notifications, kubernetes backend, permissions, and the RBAC backend. Many
  integration presets only *configure* these static plugins (via `appConfig:`)
  and ship an empty `plugins: []` list.
- **Dynamic plugins** are everything else — every UI tab, every optional
  catalog provider, every CI integration. They are pulled at boot and installed
  into `/app/dynamic-plugins-root/`.

A handful of **core chrome** dynamic plugins ship pre-installed and always-on
(no `disabled:` field): `veecode-homepage`, `veecode-global-header`, the About
page and its backend, `dynamic-plugins-info`, and the marketplace catalog entity
provider. They are extracted into the image at build time and need no preset.

---

## The reference catalog: `dynamic-plugins.default.yaml`

`dynamic-plugins.default.yaml` is the **reference catalog** (the *vitrine*) — a
browsable list of every optional plugin the image bundles, with package names and
default OCI references. It is **not part of the boot chain**.

Every optional entry is listed with `disabled: true` as its default state. Use
the catalog to look up a plugin's package name or OCI reference before enabling
it via a preset or `dynamic-plugins.yaml`. A plugin not listed here works fine
if declared directly in `dynamic-plugins.yaml`.

Do not edit it to enable a plugin for one deployment — it is image-level
documentation. Use one of the selection surfaces below instead.

---

## How plugins get enabled — the three selection surfaces

A plugin is enabled if **any** selection surface includes it. There are three:

### 1. Presets (`VEECODE_PRESETS`) — recommended

Presets enable the plugins they declare. Each preset entry is self-contained — it
carries `package:`, `disabled: false`, and the full `pluginConfig:` (mount
points, dynamic routes, RBAC scopes, menu items) inline. No merge with
`dynamic-plugins.default.yaml` is needed at runtime. See [Presets](./presets.md).

### 2. Operator override — mounted `dynamic-plugins.yaml`

Mount a `dynamic-plugins.yaml` (read-only bind mount, or a Kubernetes ConfigMap)
with a top-level `plugins:` list. The entrypoint copies it to a writable shadow
and rebuilds the `includes:` chain on every boot, preserving your `plugins:`
entries. Because the operator's `plugins:` list is processed **last**, toggling
`disabled: true/false` here always wins over preset fragments. Apply changes
with `docker compose restart` (the entrypoint re-runs at boot).

### 3. Marketplace UI

The in-portal marketplace (`/marketplace`, enabled by the
`recommended` preset) lets end users install and uninstall plugins. The
marketplace backend writes selections to `/app/data/extensions-install.yaml`,
which is included in the plugin chain on the next restart and **survives
container restarts** as long as the `/app/data` volume is retained. (This is why
`/app/data` must be a directory volume, not a single-file bind mount.)

:::note The reference catalog and the marketplace index are independent
`dynamic-plugins.default.yaml` (reference catalog) and the marketplace's
`plugin-catalog-index` are two independent artifacts that share content but are
maintained separately. Editing one does not sync the other. The unification of
the two is a deferred decision — see
[ADR-013](https://github.com/veecode-platform/devportal-platform) in the
`devportal-platform` repo.
:::

For the full precedence table when surfaces conflict, see
[Adding Plugins](/devportal/v2/plugins/adding).

---

## OCI reference shape

OCI plugin references used in presets and `dynamic-plugins.yaml` follow this pattern:

```
oci://${PLUGIN_REGISTRY}/<workspace>:bs_${BACKSTAGE_VERSION}!<selector>
```

For example:

```yaml
# RBAC UI — workspace "rbac", selector "backstage-community-plugin-rbac"
- package: oci://${PLUGIN_REGISTRY}/rbac:bs_1.49.4!backstage-community-plugin-rbac

# Marketplace frontend — version tracked via BACKSTAGE_VERSION
- package: oci://${PLUGIN_REGISTRY}/marketplace:bs_${BACKSTAGE_VERSION}!devportal-marketplace-frontend-dynamic
```

The four parts:

- **`${PLUGIN_REGISTRY}`** — defaults to `quay.io/veecode`; substituted by
  `entrypoint.sh`. Override it (e.g. `PLUGIN_REGISTRY=registry.internal/veecode`)
  to redirect all OCI pulls that use the `${PLUGIN_REGISTRY}` variable form (the
  large majority of bundled plugins) to an internal mirror without editing any YAML.
- **`<workspace>`** — the export-overlays workspace that produced the bundle
  (e.g. `marketplace`, `rbac`, `tech-radar`, `sonarqube`, `backstage`). One
  workspace can bundle several packages.
- **`bs_${BACKSTAGE_VERSION}`** — the OCI tag. `${BACKSTAGE_VERSION}` is
  substituted from `backstage.json`, so a Backstage bump propagates to every
  reference that uses the variable form. Some entries pin a literal version
  (e.g. `bs_1.48.4`, `bs_1.49.4`) when the plugin has not yet been re-published
  under the current tag.
- **`!<selector>`** — the specific npm package name inside the bundle.

Pre-installed chrome plugins use a bare npm package name (no `oci://` prefix)
with `preInstalled: true`; the install script skips the pull and only merges
their `pluginConfig:`.

:::caution MCP plugin refs are hardcoded and not redirected by `PLUGIN_REGISTRY`
The MCP plugin refs (`mcp-actions-backend`, `mcp-integrations`, `mcp-chat`) are
hardcoded to `quay.io/veecode` and do **not** use the `${PLUGIN_REGISTRY}`
variable form. Setting `PLUGIN_REGISTRY` does not redirect them. Air-gapped or
mirror deployments using the `mcp` or `mcp-chat` presets must mirror those
workspaces (`quay.io/veecode/backstage`, `quay.io/veecode/mcp-integrations`,
`quay.io/veecode/mcp-chat`) explicitly, or override the refs in a
`dynamic-plugins.yaml`.
:::

---

## Boot sequence (what installs your plugins)

At container start, before Backstage accepts requests:

1. **Preset resolver** validates required env vars (exit 78 on missing) and
   writes a `preset-<name>-plugins.yaml` for each preset with a `plugins:` list.
2. **Assemble the includes chain** — `dynamic-plugins.yaml` is copied to a
   writable working file and the `includes:` chain is rebuilt to reference the
   marketplace file and each preset's plugin file.
3. **`${BACKSTAGE_VERSION}` and `${PLUGIN_REGISTRY}` substitution** across the
   working files.
4. **`install-dynamic-plugins.py`** — for each enabled entry, `skopeo copy`
   pulls the OCI bundle, the named selector is extracted into
   `/app/dynamic-plugins-root/<selector>/`, and the entry's `pluginConfig:` is
   merged into `/app/dynamic-plugins-root/app-config.dynamic-plugins.yaml`.
   Pre-installed entries skip the pull.
5. **Backend boot** — Backstage reads `app-config.dynamic-plugins.yaml` to
   discover mount points, dynamic routes, and RBAC scopes.

Loaded plugins are surfaced at
`/api/dynamic-plugins-info/loaded-plugins` once the backend is up.

:::warning Boot fails fast (exit 78) on plugin errors
If a plugin bundle cannot be pulled (registry unreachable, typo'd OCI ref,
missing mirror bundle), the install script prints an `INSTALL SUMMARY` of failed
refs and the entrypoint exits **78** rather than booting a half-installed
portal. The same exit-78 guard fires when the same plugin is enabled with two
different OCI refs (the duplicate detector). For dev iteration only, set
`DYNAMIC_PLUGINS_TOLERATE_FAILURES=true` to proceed with whatever installed.
:::

---

## Distribution modes

Three modes are supported by design:

- **Default — runtime OCI pull.** The image ships with no optional plugin bytes.
  At boot, `install-dynamic-plugins.py` pulls each enabled plugin from
  `quay.io/veecode/<workspace>:<tag>`. No operator config beyond
  `VEECODE_PRESETS`. Best for cloud/SaaS with outbound registry access.
- **Mirror — internal registry.** Set `PLUGIN_REGISTRY=registry.internal/veecode`
  (or any prefix mirroring `quay.io/veecode`). The entrypoint substitutes it
  into every `oci://${PLUGIN_REGISTRY}/...` reference before the install runs —
  no YAML edits needed for the plugins that use the variable form. The mirror must
  host the same workspace/tag paths. Note that the MCP plugin refs
  (`mcp-actions-backend`, `mcp-integrations`, `mcp-chat`) are hardcoded to
  `quay.io/veecode` and are not redirected; see the caution in the
  [OCI reference shape](#oci-reference-shape) section above.
- **Loaded variant — air-gapped image.** Build a derived image that extracts the
  selected plugin bundles at build time and copies them into
  `/app/dynamic-plugins-root/`. Mark those entries `preInstalled: true` so the
  install script skips the pull. Pre-baked variants are the operator's
  responsibility; the published image stays generic.

---

## Related

- [Presets](./presets.md) — the recommended way to enable plugins.
- [Configuration Hierarchy](./configuration-hierarchy.md) — how
  `app-config.dynamic-plugins.yaml` fits the config merge order.
- [Adding Plugins](/devportal/v2/plugins/adding) — the selection surfaces in
  practice and the full precedence rules.
