---
sidebar_position: 4
sidebar_label: Tech Radar
title: Tech Radar Plugin
---

# Tech Radar Plugin

The Tech Radar plugin provides a visual technology adoption radar, helping teams communicate which technologies are recommended, in trial, on hold, or being phased out.

**Status:** Default plugin, enabled by default. No chart values entry is required.

---

## Packages

| Package | Role |
|---|---|
| `backstage-community-plugin-tech-radar` | Frontend: Tech Radar page at `/tech-radar` |
| `backstage-community-plugin-tech-radar-backend` | Backend: serves radar data |

---

## What it does

- Renders an interactive radar visualization at `/tech-radar`
- Registers a Tech Radar sidebar entry
- Data is served by the backend plugin from its configured data source

---

## Configuration

The default plugin file (`dynamic-plugins.veecode.yaml`) enables both packages and configures the frontend route and sidebar entry:

```yaml
pluginConfig:
  dynamicPlugins:
    frontend:
      backstage-community.plugin-tech-radar:
        appIcons:
          - name: techRadar
            importName: TechRadarIcon
        dynamicRoutes:
          - path: /tech-radar
            importName: TechRadarPage
            menuItem:
              icon: techRadar
              text: Tech Radar
              textKey: menuItem.techRadar
            config:
              props:
                width: 1500
                height: 800
        menuItems:
          tech-radar:
            priority: 76
```

To serve your own radar entries instead of the sample dataset, configure the Tech Radar backend data source. Refer to the [Backstage Tech Radar plugin documentation](https://github.com/backstage/community-plugins/tree/main/workspaces/tech-radar) for the backend API details.

## Turn it off

Add both override entries with the `{{inherit}}` tag and the full `!<plugin path>` part, plus `disabled: true`, under `global.dynamic.plugins` on Kubernetes or in the operator plugin file on the local stack. On Kubernetes write the tag as `{{ "{{inherit}}" }}`; in the operator plugin file write `{{inherit}}` as is:

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-community-plugin-tech-radar:{{inherit}}!backstage-community-plugin-tech-radar
    disabled: true
  - package: oci://quay.io/veecode/backstage-community-plugin-tech-radar-backend:{{inherit}}!backstage-community-plugin-tech-radar-backend
    disabled: true
```

The production setup guide shows the same entries in a full disable flow in [Disable a default plugin](../../installation-guide/production-setup/setup.md#disable-a-default-plugin). See [Adding Plugins](../adding.md) for the local-stack equivalent.
