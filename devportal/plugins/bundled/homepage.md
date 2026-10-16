---
sidebar_position: 2
sidebar_label: Homepage
title: Homepage Plugin
---

# Homepage Plugin

The VeeCode homepage plugin provides the landing page for DevPortal. It mounts at the root route `/` and replaces the stock Backstage home page.

**Status:** Default plugin, enabled by default. No chart values entry is required.

---

## Package

`veecode-platform-plugin-veecode-homepage`

The catalog index's default plugin file (`dynamic-plugins.default.yaml`) also lists the stock Red Hat Developer Hub home page package, but that entry is disabled in the index: enabling it alongside the VeeCode home page leaves the portal's pages empty, because both register the same frontend API. This was observed on 3.0.x and not re-tested on 3.1.0. Leave the stock entry disabled.

---

## What it does

- Renders the DevPortal landing page at `/`, with a greeting, highlighted card, stat cards, summary, and visited charts
- Records page visits through its own visit listener, which feeds the recently visited and top visited cards

---

## Configuration

The catalog index's default plugin file (`dynamic-plugins.default.yaml`) enables the package and mounts it at the root route:

```yaml
pluginConfig:
  dynamicPlugins:
    frontend:
      veecode-platform.plugin-veecode-homepage:
        translationResources:
          - importName: homepageTranslations
            ref: homepageTranslationRef
        dynamicRoutes:
          - path: /
            importName: VeecodeHomepagePage
            config:
              props:
                width: 1500
                height: 800
        mountPoints:
          - mountPoint: application/listener
            importName: VisitListener
```

## Turn it off

Add the override entry with the `{{inherit}}` tag and the full `!<plugin path>` part, plus `disabled: true`, under `global.dynamic.plugins` on Kubernetes or in the operator plugin file on the local stack. On Kubernetes write the tag as `{{ "{{inherit}}" }}`; in the operator plugin file write `{{inherit}}` as is:

```yaml
plugins:
  - package: oci://quay.io/veecode/veecode-platform-plugin-veecode-homepage:{{inherit}}!veecode-platform-plugin-veecode-homepage
    disabled: true
```

See [Adding Plugins](../adding.md) for where to put this entry and how to apply it.
