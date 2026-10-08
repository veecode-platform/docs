---
sidebar_position: 3
sidebar_label: Global Header
title: Global Header Plugin
---

# Global Header Plugin

The global header plugin provides the top navigation bar and the sidebar menu ordering across all DevPortal pages. It supplies search, notifications, and the user profile area, and it owns the Administration sidebar group that pages such as About and RBAC register under.

**Status:** Default plugin, enabled by default. No chart values entry is required.

---

## Package

`red-hat-developer-hub-backstage-plugin-global-header`

This is the Red Hat Developer Hub global header package. The 3.x default plugin set uses it instead of the 2.x VeeCode header package.

---

## What it does

- Renders the top header bar on every portal page
- Defines the Administration sidebar group used by the About, RBAC, and other admin pages
- Sets the sidebar order: Home, Catalog, APIs, Docs, self-service, Notifications, Tech Radar, Marketplace; Settings stays at the bottom.
- Hides the upstream Learning Paths menu item, which VeeCode DevPortal does not ship

---

## Configuration

The default plugin file (`dynamic-plugins.veecode.yaml`) enables the package and configures the sidebar through menu items:

```yaml
pluginConfig:
  dynamicPlugins:
    frontend:
      default.main-menu-items:
        menuItems:
          default.admin:
            title: Administration
            textKey: menuItem.administration
            icon: admin
          default.learning-path:
            enabled: false
          default.home:
            priority: 100
          default.catalog:
            priority: 96
          default.apis:
            priority: 92
          default.docs:
            title: Docs
            icon: docs
```

Higher priority sorts higher in the sidebar. Individual plugins add their own entries under this ordering with their own priorities: Marketplace uses priority 72, Tech Radar 76, and Notifications 80. The pending-changes indicator mounts into the header; see [Pending Changes](./pending-changes.md).

## Turn it off

Add the override entry with the `{{inherit}}` tag and the full `!<plugin path>` part, plus `disabled: true`, under `global.dynamic.plugins` on Kubernetes or in the operator plugin file on the local stack. On Kubernetes write the tag as `{{ "{{inherit}}" }}`; in the operator plugin file write `{{inherit}}` as is:

```yaml
plugins:
  - package: oci://quay.io/veecode/red-hat-developer-hub-backstage-plugin-global-header:{{inherit}}!red-hat-developer-hub-backstage-plugin-global-header
    disabled: true
```

Disabling the header also removes the Administration group and the sidebar ordering, so the admin pages lose their menu placement. See [Adding Plugins](../adding.md) for where to put this entry and how to apply it.
