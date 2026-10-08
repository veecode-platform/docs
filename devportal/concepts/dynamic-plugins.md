---
sidebar_position: 7
sidebar_label: Dynamic Plugins
title: Dynamic Plugins
---

# Dynamic Plugins

Dynamic plugins add Backstage plugins to the portal without rebuilding the container image. The portal installs them at startup from digest-pinned OCI references and loads their code from the plugin root directory.

Loading is step 1 of 3. A loaded plugin does nothing visible until two more steps are in place: entity annotations in `catalog-info.yaml` tell the plugin which catalog entities it attaches to, and `app-config` provides the credentials and endpoints the plugin queries. See [Composing a Portal](./portal-composition.md) for the full model.

## The default plugins baked into the image

The image ships the default plugin file (`dynamic-plugins.veecode.yaml`) with 20 digest-pinned OCI plugin entries: 18 enabled and 2 disabled. The disabled entries are the stock Red Hat dynamic home page, which the VeeCode home page replaces, and the legacy VeeCode theme, which Red Hat Developer Hub native theming through `app-config` replaces. The enabled entries cover the VeeCode home page, the global header, the About page and its backend, the Marketplace backend and UI with the extensions catalog provider, TechDocs with its backend and addons, Notifications with its backend, Signals with its backend, Tech Radar with its backend, and the RBAC screens.

The running portal lists what it installed in its log and at `/api/dynamic-plugins-info/loaded-plugins` once the backend is up.

## The default plugin index behind Marketplace

The Marketplace UI reads its installable plugins from a catalog index image. The default index file ships in that image. The reference catalog and the Marketplace index share content but are separate artifacts: look up a plugin's package name or OCI reference in the index file before enabling it through configuration.

Each Marketplace package is a `Package` catalog entity in the `rhdh` namespace. Copy its `spec.dynamicArtifact` value into a plugin entry.

## Chart: includes and additions

On Kubernetes, the chart includes the default plugin file (`dynamic-plugins.veecode.yaml`) through `global.dynamic.includes` and accepts operator additions through `global.dynamic.plugins`. That list is empty by default. An entry for a new plugin adds it; an entry that matches a default plugin overrides that plugin, as shown below.

To add a plugin, set `global.dynamic.plugins` with a full digest-pinned OCI reference:

```yaml
global:
  dynamic:
    plugins:
      - package: oci://my-registry.example.com/my-plugin@sha256:...!my-plugin
        disabled: false
```

To turn off a default plugin, match its registry, repository, and full plugin path, then set `disabled: true`. This chart-values example disables the Tech Radar frontend:

```yaml
global:
  dynamic:
    plugins:
      - package: oci://quay.io/veecode/backstage-community-plugin-tech-radar:{{ "{{inherit}}" }}!backstage-community-plugin-tech-radar
        disabled: true
```

The installer matches overrides by registry, repository, and plugin path, not by tag or digest. A tag or digest in the override sets its version; `{{inherit}}` keeps the version pinned in the default plugin file.

If you set `pluginConfig` in an override for a default plugin, the installer replaces the whole block instead of merging it. Copy the complete block from `dynamic-plugins.veecode.yaml` before editing values.

## Local stack: the operator plugin file

On devportal-local you enable and disable plugins through an operator plugin file instead of chart values, as described in [Configure dynamic plugins for the local stack](../installation-guide/docker-local/custom-plugins.md). This example enables the regex scaffolder module and disables the Tech Radar frontend:

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-community-plugin-scaffolder-backend-module-regex@sha256:e0f3e1f69cb6c1bccd538f8ed80e6b16b85f2540b8866c636225903bb76a0e35
    disabled: false
  - package: oci://quay.io/veecode/backstage-community-plugin-tech-radar:{{inherit}}!backstage-community-plugin-tech-radar
    disabled: true
```

The regex module adds the `regex:replace` scaffolder action.

## Marketplace selections

The in-portal Marketplace at `/marketplace` lets signed-in users install and uninstall plugins. The Marketplace backend writes each selection to PostgreSQL and to `/devportal-data/extensions-install.yaml` at once. A plain container restart does not run the plugin installer, so it does not apply the selection. On the local stack, the selection is installed after the stack is taken down with volumes kept and started again. On Kubernetes, it is installed when the Deployment restarts.

## How the final list is assembled

The installer merges the operator entries with the Marketplace selections into one plugin list. When both name the same plugin, the operator entry wins.

## Related

- [Configure dynamic plugins for the local stack](../installation-guide/docker-local/custom-plugins.md) — the operator file procedure.
- [Adding Plugins](../plugins/adding.md) — plugin selection in practice.
- [Configuration Hierarchy](./configuration-hierarchy.md) — how each enabled plugin's `pluginConfig` becomes generated configuration.
