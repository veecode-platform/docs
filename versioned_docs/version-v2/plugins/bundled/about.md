---
sidebar_position: 5
sidebar_label: About
title: About Plugin
---

# About Plugin

The About plugin displays version and instance information for the DevPortal deployment. It is accessible at `/about` under the **Admin** menu section.

**Status:** Always loaded (preInstalled). No `dynamic-plugins.yaml` entry required.

---

## Packages

| Package | Role |
|---|---|
| `veecode-platform-backstage-plugin-about-dynamic` | Frontend — About page at `/about` |
| `veecode-platform-backstage-plugin-about-backend-dynamic` | Backend — serves version and instance metadata |

---

## What it does

- Shows the installed DevPortal version
- Shows the Backstage version the instance is running on
- Shows enabled plugins and runtime status
- Accessible to admin users under the Admin menu

---

## Mount point configuration

```yaml
pluginConfig:
  dynamicPlugins:
    frontend:
      veecode-platform.backstage-plugin-about:
        appIcons:
          - name: aboutIcon
            importName: AboutIcon
        dynamicRoutes:
          - path: /about
            importName: AboutPage
            menuItem:
              icon: aboutIcon
              text: About
              enabled: true
        menuItems:
          about:
            parent: admin
            title: About
            icon: aboutIcon
```
