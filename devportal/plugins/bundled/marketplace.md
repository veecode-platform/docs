---
sidebar_position: 6
sidebar_label: Marketplace
title: Marketplace Plugin
---

# Marketplace Plugin

The Marketplace plugin is the in-portal interface for discovering, installing, and uninstalling dynamic plugins without editing YAML files. The sidebar item **Marketplace** opens it as the **Extensions** page at `/marketplace`.

**Status:** Default plugin, enabled by default. No chart values entry is required.

---

## Packages

| Package | Role |
|---|---|
| `devportal-marketplace-frontend-dynamic` | Frontend: Marketplace UI at `/marketplace` |
| `devportal-marketplace-backend` | Backend: plugin catalog and install state (`/api/extensions/*`) |
| `red-hat-developer-hub-backstage-plugin-catalog-backend-module-extensions` | Catalog module: ingests the extracted index entities so Marketplace can list them |

Marketplace is the VeeCode plugin experience built on the Red Hat Developer Hub Extensions mechanism: the Extensions catalog provider reads the plugin catalog index image, and the Marketplace frontend installs from it.

---

## What it does

- Lists the installable plugins from the catalog index as cards
- Shows which plugins are installed
- An **Install** selection is written to PostgreSQL and to `/devportal-data/extensions-install.yaml` at once; the card shows a pending state until the stack restarts
- The **Installed packages** tab lists the packages the portal runs

---

## Configuration

The default plugin file (`dynamic-plugins.veecode.yaml`) enables all three packages and configures the frontend route and sidebar entry:

```yaml
pluginConfig:
  dynamicPlugins:
    frontend:
      devportal.marketplace-frontend:
        appIcons:
          - name: pluginsIcon
            importName: PluginsIcon
        dynamicRoutes:
          - path: /marketplace
            importName: DynamicExtensionsPluginRouter
            menuItem:
              icon: pluginsIcon
              text: Marketplace
        menuItems:
          marketplace:
            title: Marketplace
            icon: pluginsIcon
            priority: 72
```

The extensions catalog module and the Marketplace backend ship with no `pluginConfig`. Which plugins the Marketplace lists is set by the chart's `global.catalogIndex.image`; see [Finding Plugins](../finding.md). Install selections need a full stack restart to take effect: a plain restart of the portal container does not run the plugin installer. See [Adding Plugins](../adding.md).

## Turn it off

Add the override entries with the `{{inherit}}` tag and the full `!<plugin path>` part, plus `disabled: true`, under `global.dynamic.plugins` on Kubernetes or in the operator plugin file on the local stack. On Kubernetes write the tag as `{{ "{{inherit}}" }}`; in the operator plugin file write `{{inherit}}` as is:

```yaml
plugins:
  - package: oci://quay.io/veecode/devportal-marketplace-frontend-dynamic:{{inherit}}!devportal-marketplace-frontend-dynamic
    disabled: true
  - package: oci://quay.io/veecode/devportal-marketplace-backend:{{inherit}}!devportal-marketplace-backend
    disabled: true
  - package: oci://quay.io/veecode/red-hat-developer-hub-backstage-plugin-catalog-backend-module-extensions:{{inherit}}!red-hat-developer-hub-backstage-plugin-catalog-backend-module-extensions
    disabled: true
```

Disabling Marketplace also removes the in-portal path for installing plugins; chart-values and operator-file entries keep working. See [Adding Plugins](../adding.md) for where to put these entries and how to apply them.
