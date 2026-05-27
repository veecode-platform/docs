---
sidebar_position: 4
sidebar_label: Tech Radar
title: Tech Radar Plugin
---

# Tech Radar Plugin

The Tech Radar plugin provides a visual technology adoption radar, helping teams communicate which technologies are recommended, in trial, on hold, or being phased out.

**Status:** Always loaded (preInstalled). No `dynamic-plugins.yaml` entry required.

---

## Packages

| Package | Role |
|---|---|
| `backstage-community-plugin-tech-radar-dynamic` | Frontend — Tech Radar page at `/tech-radar` |
| `backstage-community-plugin-tech-radar-backend-dynamic` | Backend — serves radar data |

---

## What it does

- Renders an interactive radar visualization at `/tech-radar`
- Sidebar entry appears under the Tech Radar menu item
- Data is served by the backend plugin from a configured data source

---

## Mount point configuration (from `dynamic-plugins.default.yaml`)

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
```

---

## Customizing radar data

By default the Tech Radar backend serves a built-in sample dataset. To customize the data, implement a `TechRadarApi` by providing a custom radar data endpoint. Refer to the [Backstage Tech Radar plugin documentation](https://github.com/backstage/community-plugins/tree/main/workspaces/tech-radar) for API details.
