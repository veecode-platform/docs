---
sidebar_position: 1
sidebar_label: Finding Plugins
title: Finding Plugins
---

# Finding Plugins

## In-portal Marketplace (recommended)

The fastest way to find and enable plugins is the **Marketplace** built into DevPortal. Navigate to **Marketplace** in the sidebar to browse available plugins, see which are enabled or disabled, and enable them with one click — no YAML editing required.

The Marketplace shows:
- All bundled plugins (preloaded in the image, ready to enable)
- OCI-published plugins available for download at startup

See [Bundled Plugins](./bundled/index.md) for a complete list of what ships with DevPortal.

---

## Online catalogs

For plugins beyond the bundled set:

- [VeeCode Backstage Plugins](https://platform.vee.codes/en/resources/): VeeCode-curated list of maintained and third-party plugins, with OCI references for DevPortal.

- [Backstage Plugin Registry](https://backstage.io/plugins): The official Backstage plugin registry. Most entries assume a static Backstage custom build; for DevPortal use, you need a dynamic plugin version (OCI or npm).

- [Roadie Backstage Plugins](https://roadie.io/backstage/plugins/): Roadie-curated list. The self-hosted path requires static linking unless a dynamic-compatible version is available.

:::note
The Backstage plugin ecosystem does not yet have a universal standard for publishing dynamic plugins. VeeCode publishes dynamic-ready OCI artifacts for a growing set of community plugins. Check the Marketplace first before sourcing from external registries.
:::

---

## Checking what is already bundled

`dynamic-plugins.default.yaml` in the DevPortal distro is a convenience reference listing bundled plugin packages and their default configuration — useful for finding a plugin's package name. It is not part of the boot chain.

The always-on plugins are declared in `dynamic-plugins.yaml` with `preInstalled: true` and carry their full `pluginConfig` there. Optional plugins are enabled by declaring them in your `dynamic-plugins.yaml` or by activating a preset — no `includes` reference to `.default.yaml` is required. A plugin not listed in `.default.yaml` works fine if declared directly in `dynamic-plugins.yaml`.
