---
sidebar_position: 6
sidebar_label: Custom home plugin
title: Custom home plugin
---

The home page is the VeeCode homepage plugin, one of the default plugins, enabled at route `/` with page size props and a visit recorder on the `application/listener` mount point. The stock Red Hat Developer Hub dynamic home page also ships among the default plugins, but disabled: exactly one page may own `/`, and re-enabling the stock page alongside the VeeCode home breaks the boot. Change the home page by reconfiguring or replacing the VeeCode homepage entry, not by editing the image.

## Change the home page settings

To change the home page props, override the default plugin entry for the homepage package. An override's `pluginConfig` replaces the default plugin's whole `pluginConfig` (no merge), so copy the complete block and edit values in place. On Kubernetes, the entry goes under `global.dynamic.plugins`:

```yaml
global:
  dynamic:
    plugins:
      - package: oci://quay.io/veecode/veecode-platform-plugin-veecode-homepage:{{ "{{inherit}}" }}!veecode-platform-plugin-veecode-homepage
        disabled: false
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
                        width: 1200
                        height: 700
                mountPoints:
                  - mountPoint: application/listener
                    importName: VisitListener
```

On the local stack, put the equivalent entry under `plugins:` in the operator plugin file, as described in [Configure dynamic plugins for the local stack](../installation-guide/docker-local/custom-plugins.md). Write the version as `{{inherit}}` as is there; in chart values above it is `{{ "{{inherit}}" }}` because the chart renders the list as a template:

```yaml
includes:
  - dynamic-plugins.default.yaml
  - /opt/app-root/src/dynamic-plugins.veecode.yaml
plugins:
  - package: oci://quay.io/veecode/veecode-platform-plugin-veecode-homepage:{{inherit}}!veecode-platform-plugin-veecode-homepage
    disabled: false
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
                    width: 1200
                    height: 700
            mountPoints:
              - mountPoint: application/listener
                importName: VisitListener
```

Keep the `VisitListener` mount point: it records visits, and without it the recently and top visited cards stay empty. `{{inherit}}` keeps the version that the default plugin file pins, so the override survives upgrades. Always keep the `!<plugin-path>` part after the version.

## Swap the home page

To replace the home page with your own plugin, disable the VeeCode homepage entry with an `{{inherit}}` reference and add your plugin with a `dynamicRoutes` entry that owns `/`. Disable the VeeCode entry first so two pages never compete for the same route. On Kubernetes, both entries go under `global.dynamic.plugins` with the version as `{{ "{{inherit}}" }}`; on the local stack, both go in the operator plugin file with the version as `{{inherit}}` as is. Always keep the `!<plugin-path>` part.

## Branding

The home page reads the standard `app.branding` keys: logos, logo width, and the light and dark theme palettes. Set them as described in [Simple branding](./branding.md).

## Source code

The source code for the current DevPortal home plugin is at [VeeCode Homepage Plugin](https://github.com/veecode-platform/devportal-plugins/tree/main/workspace/homepage)
