---
sidebar_position: 5
sidebar_label: About
title: About Plugin
---

# About Plugin

The About plugin displays version and instance information for the DevPortal deployment. It is accessible at `/about` under the **Administration** menu section.

**Status:** Default plugin, enabled by default. No chart values entry is required.

---

## Packages

| Package | Role |
|---|---|
| `veecode-platform-backstage-plugin-about` | Frontend: About page at `/about` |
| `veecode-platform-backstage-plugin-about-backend` | Backend: serves version and instance metadata |

---

## What it does

- Shows the installed DevPortal version
- Shows the Backstage version the instance is running on
- Shows enabled plugins and runtime status
- Registers the About page under the Administration sidebar group

---

## Configuration

The default plugin file (`dynamic-plugins.veecode.yaml`) enables both packages and configures the frontend route and menu entry:

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
            parent: default.admin
            title: About
            icon: aboutIcon
```

The About backend package ships with no `pluginConfig`. The Administration sidebar group itself comes from the global header configuration; see [Global Header](./global-header.md).

## Turn it off

Add both override entries with the `{{inherit}}` tag and the full `!<plugin path>` part, plus `disabled: true`, under `global.dynamic.plugins` on Kubernetes or in the operator plugin file on the local stack. On Kubernetes write the tag as `{{ "{{inherit}}" }}`; in the operator plugin file write `{{inherit}}` as is:

```yaml
plugins:
  - package: oci://quay.io/veecode/veecode-platform-backstage-plugin-about:{{inherit}}!veecode-platform-backstage-plugin-about
    disabled: true
  - package: oci://quay.io/veecode/veecode-platform-backstage-plugin-about-backend:{{inherit}}!veecode-platform-backstage-plugin-about-backend
    disabled: true
```

See [Adding Plugins](../adding.md) for where to put these entries and how to apply them.
