---
sidebar_position: 6
sidebar_label: Marketplace
title: Marketplace Plugin
---

# Marketplace Plugin

The Marketplace plugin is the in-portal interface for discovering, enabling, and disabling dynamic plugins without editing YAML files. It is accessible at `/marketplace` in the sidebar.

**Status:** Always loaded (preInstalled). No `dynamic-plugins.yaml` entry required.

---

## Packages

| Package | Role |
|---|---|
| `devportal-marketplace-frontend-dynamic` | Frontend — Marketplace UI at `/marketplace` |
| `devportal-marketplace-backend-dynamic-dynamic` | Backend — plugin catalog and install state management |
| `red-hat-developer-hub-backstage-plugin-catalog-backend-module-extensions` | Catalog module — registers Extension/Package/Collection entity kinds |

The DevPortal Marketplace is a fork of the Red Hat Developer Hub Extensions plugin, customized for VeeCode DevPortal.

---

## What it does

- Displays all available plugins (bundled + OCI-published)
- Shows which plugins are enabled or disabled
- **Enable** button saves the plugin selection to `extensions-install.yaml`
- **Pending Changes** badge appears in the header when a restart is needed to apply changes
- After restart, enabled plugins load from `extensions-install.yaml`

---

## How plugin persistence works

When you enable a plugin via the Marketplace:

1. The backend writes an entry to `/app/extensions-install.yaml`
2. A **Pending Changes** indicator appears in the header
3. On the next pod restart, `install-dynamic-plugins.py` reads `extensions-install.yaml` (included in `dynamic-plugins.yaml`) and installs the selected plugins

This means Marketplace selections **persist across restarts** once the pod is restarted.

---

## Mount point configuration (from `dynamic-plugins.default.yaml`)

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
```
