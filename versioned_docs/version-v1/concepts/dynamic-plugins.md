---
sidebar_position: 7
sidebar_label: Dynamic Plugins
title: Dynamic Plugins
---

# Dynamic Plugins

Dynamic plugins are the mechanism DevPortal uses to ship, enable, and configure Backstage plugins **without rebuilding the container image**. This is one of the core differentiators of the distro.

---

## Preinstalled vs. Downloaded Plugins

DevPortal ships two categories of dynamic plugins:

### Preinstalled (bundled) plugins
These are compiled into the image at build time and live under `/app/dynamic-plugins/dist/`. They are always present but start **disabled by default** (`disabled: true`). You enable them at runtime by listing them in your `dynamic-plugins.yaml` configuration.

The full list of preinstalled plugins and their default configuration is in `devportal-distro/dynamic-plugins.default.yaml`.

### Downloaded (OCI/NPM) plugins
These are not bundled in the image. They are pulled at startup from an OCI registry (`oci://...`) or an NPM registry. You add them to your `dynamic-plugins.yaml` and the runtime downloads and installs them before the app starts.

---

## Enabling Plugins

To enable a plugin, reference it in your `dynamic-plugins.yaml`:

```yaml
plugins:
  # Enable a preinstalled plugin (already in the image)
  - package: ./dynamic-plugins/dist/backstage-plugin-kubernetes-dynamic
    disabled: false
    pluginConfig:
      # ... plugin-specific config

  # Download and enable an OCI plugin
  - package: 'oci://quay.io/veecode/backstage:bs_1.49.4!backstage-plugin-mcp-actions-backend'
    disabled: false
    pluginConfig:
      # ... plugin-specific config
```

In the Helm chart, this maps to `global.dynamic.plugins` in `values.yaml`. For Docker installs, mount your `dynamic-plugins.yaml` into the container at `/app/dynamic-plugins.yaml` (the entrypoint processes it at startup). Note that `VEECODE_APP_CONFIG` only carries `app-config` content — it cannot be used to deliver `dynamic-plugins.yaml`.

---

## Plugin Configuration

Each plugin entry can include a `pluginConfig` block that is merged into the app configuration for that plugin. This is how entity tabs, mount points, and feature flags are configured without touching `app-config.yaml` directly.

Mount points (frontend plugins) and backend plugin wiring are both declared in the plugin's own `pluginConfig`:

```yaml
pluginConfig:
  dynamicPlugins:
    frontend:
      my-org.my-plugin:
        mountPoints:
          - mountPoint: entity.page.overview/cards
            importName: MyEntityCard
        dynamicRoutes:
          - path: /my-feature
            importName: MyFeaturePage
```

---

## The Extensions Marketplace

The distro includes a plugin marketplace (`devportal-marketplace-frontend-dynamic`) that allows admins to browse, enable, and disable plugins via the DevPortal UI. Marketplace access is controlled by RBAC permissions (`extensions.plugin.configuration.read/write`). See [Permissions](../rbac/permissions.md) for details.

---

## MCP Stack (AI-powered Actions)

The distro ships an optional MCP (Model Context Protocol) stack as OCI dynamic plugins from `quay.io/veecode`:

| Package | Role |
| --- | --- |
| `backstage-plugin-mcp-actions-backend` | Core MCP backend; aggregates tool sources |
| `*-software-catalog-mcp-extras` | Catalog tools for MCP |
| `*-techdocs-mcp-extras` | TechDocs tools for MCP |
| `*-scaffolder-mcp-extras` | Scaffolder tools for MCP |
| `*-mcp-chat-backend` + `*-mcp-chat` | In-portal AI chat at `/mcp-chat` |

All must be enabled together (`disabled: false`). Supported AI providers for the chat plugin: OpenAI, Anthropic, Gemini, and Ollama.

---

## Key Files

| File | Purpose |
| --- | --- |
| `dynamic-plugins.default.yaml` | All preinstalled plugins with their defaults (disabled by default) |
| `dynamic-plugins.yaml` | Your runtime overrides — enable plugins and add OCI/NPM packages here |
| `app-config.dynamic-plugins.yaml` | Generated at startup; merges plugin configs into the running app config |

For adding plugins through the UI, see the [Adding Plugins guide](/devportal/plugins/adding).
