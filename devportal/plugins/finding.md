---
sidebar_position: 1
sidebar_label: Finding Plugins
title: Finding Plugins
---

## In-portal Marketplace

The fastest way to find and enable plugins is the **Marketplace** built into DevPortal. Open the **Marketplace** sidebar item to browse available plugins, see which are installed, and install them without editing YAML. See [Bundled Plugins](./bundled/index.md) for what already ships with the portal, and [Adding Plugins](./adding.md) for the install and restart steps.

## Where the Marketplace list comes from

Marketplace reads the plugin catalog index image configured with the chart's `global.catalogIndex.image`. On startup the installer extracts the index's catalog entities into the portal, and the Extensions catalog provider displays them. The chart's [catalog index guide](https://github.com/veecode-platform/devportal-chart/blob/main/docs/catalog-index-configuration.md) documents the setting, including how to pin the index tag or add extra index images.

On 3.0.3 the index backs 71 plugin cards (68 `Plugin` entities in the `rhdh` namespace and 3 in `community`) and 117 `Package` entities in `rhdh`: the `Plugin` entity is what the Marketplace card shows, and the matching `Package` entity carries the installable artifact in its `spec.dynamicArtifact` field. The default plugin index shipped inside that image lists every installable package with its digest-pinned OCI reference and default configuration.

## Online catalogs

For plugins beyond the Marketplace list:

- [VeeCode Backstage Plugins](https://platform.vee.codes/en/resources/): VeeCode-curated list of maintained and third-party plugins, with OCI references for DevPortal.

- [Backstage Plugin Registry](https://backstage.io/plugins): The official Backstage plugin registry. Most entries assume a static Backstage custom build; for DevPortal use, you need a dynamic plugin version (OCI or npm).

- [Roadie Backstage Plugins](https://roadie.io/backstage/plugins/): Roadie-curated list. Check that a dynamic-compatible version is available before planning to use one with DevPortal.

:::note
The Backstage plugin ecosystem does not yet have a universal standard for publishing dynamic plugins. VeeCode publishes dynamic-ready OCI artifacts for a growing set of community plugins. Check the Marketplace first before sourcing from external registries.
:::

## The plugin ecosystem table

The [Plugin Ecosystem](./ecosystem.md) page lists the available plugin packages with their npm package names, OCI references, roles, and support levels. It is generated automatically from the plugin export overlays, so its versions move with the release line.

## Checking what is already installed

The Marketplace **Installed packages** tab lists the packages the portal runs: the 20 default plugins from the image plus anything installed from Marketplace or added through chart values. For the exact reference of a default plugin, print the default plugin file from the running portal:

```bash
docker compose exec devportal cat /opt/app-root/src/dynamic-plugins.veecode.yaml
```
