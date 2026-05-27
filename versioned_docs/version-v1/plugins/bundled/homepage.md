---
sidebar_position: 2
sidebar_label: Homepage
title: VeeCode Homepage Plugin
---

# VeeCode Homepage Plugin

The VeeCode Homepage plugin provides the customizable landing page for DevPortal. It mounts at the root route `/` and replaces the default Backstage home page.

**Status:** Always loaded (preInstalled). No `dynamic-plugins.yaml` entry required.

---

## Package

`veecode-platform-plugin-veecode-homepage-dynamic`

---

## What it does

- Renders the DevPortal landing page at `/`
- Supports customization of content, quick-links, and branding through app configuration
- Integrates with the Global Header for consistent navigation

---

## Mount point configuration (from `dynamic-plugins.default.yaml`)

```yaml
pluginConfig:
  dynamicPlugins:
    frontend:
      veecode-platform.plugin-veecode-homepage:
        dynamicRoutes:
          - path: /
            importName: VeecodeHomepagePage
            config:
              props:
                width: 1500
                height: 800
```
