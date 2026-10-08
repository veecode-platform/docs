---
sidebar_position: 8
sidebar_label: Custom header plugin
title: Custom header plugin
---

The shared header is one of the default plugins: the Red Hat Developer Hub global header, enabled, mounted at `application/header` with position `above-main-content`. The default plugin entry for the header package also orders the sidebar through `default.main-menu-items` menu items. Change the header by reconfiguring that entry, not by editing the image.

## Change sidebar items

Sidebar order and visibility are app configuration under `dynamicPlugins.frontend.default.main-menu-items.menuItems`, one entry per item. On the local stack, set them in `app-config.custom.yaml` in the `devportal-local` directory so the fragment loads after the product fragment, as described in [Add configuration to the local stack](../installation-guide/docker-local/custom-config.md):

```yaml
dynamicPlugins:
  frontend:
    default.main-menu-items:
      menuItems:
        default.home:
          priority: 100
        default.catalog:
          priority: 96
        default.learning-path:
          enabled: false
```

A higher `priority` sorts the item higher. `enabled: false` hides the item. On Kubernetes, set the same keys under `upstream.backstage.appConfig` in your chart values:

```yaml
upstream:
  backstage:
    appConfig:
      dynamicPlugins:
        frontend:
          default.main-menu-items:
            menuItems:
              default.home:
                priority: 100
              default.catalog:
                priority: 96
              default.learning-path:
                enabled: false
```

## Reconfigure the header plugin

To change the header mount itself, override the default plugin entry for the header package. An override's `pluginConfig` replaces the default plugin's whole `pluginConfig` (no merge), so copy the complete block and edit values in place. Copy the whole `pluginConfig` block for the header package from the default plugin file (`dynamic-plugins.veecode.yaml`) and edit only what you need. Prefer a `disabled: true` override alone when that is enough; reach for a full `pluginConfig` copy only when you must change the mount configuration.

Use `{{inherit}}` for the version so the override keeps the version that the default plugin file pins and survives upgrades. Always keep the `!<plugin-path>` part after the version. In chart values (`global.dynamic.plugins`) the chart renders the list as a template, so write the tag as `{{ "{{inherit}}" }}` there; in the local stack's operator plugin file write `{{inherit}}` as is.

## Replace or remove the header

To replace the header with your own plugin, disable the default plugin entry for the header package with an `{{inherit}}` reference and add your plugin, which must provide the `application/header` mount. On Kubernetes, both entries go under `global.dynamic.plugins`:

```yaml
global:
  dynamic:
    plugins:
      - package: oci://quay.io/veecode/red-hat-developer-hub-backstage-plugin-global-header:{{ "{{inherit}}" }}!red-hat-developer-hub-backstage-plugin-global-header
        disabled: true
```

On the local stack, put the equivalent `disabled: true` entry in the operator plugin file, as described in [Configure dynamic plugins for the local stack](../installation-guide/docker-local/custom-plugins.md). Write the version as `{{inherit}}` as is, keeping the `!<plugin-path>` part, so the override keeps the version that the default plugin file pins.

## Source code

The source code for the current DevPortal header plugin is at [VeeCode Header Plugin](https://github.com/veecode-platform/devportal-plugins/tree/main/workspace/global-header)

## RHDH Header docs

The VeeCode header plugin is based on the RHDH header plugin, so you can refer to the [RHDH Header docs](https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.7/html/customizing_red_hat_developer_hub/configuring-the-global-header-in-rhdh) for more information on mount points and customization patterns.
