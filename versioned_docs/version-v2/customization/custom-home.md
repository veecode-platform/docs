---
sidebar_position: 6
sidebar_label: Custom home plugin
title: Custom home plugin
---

The entire DevPortal "home" can be replaced by your own custom dynamic plugin.

:::info
Please understand this is a development effort that involves coding a custom plugin and packaging it as an NPM package.
:::

The process for creating a "plugin-home" is described in the official Backstage documentation at [Backstage homepage - Setup and Customization](https://backstage.io/docs/getting-started/homepage).

## Dynamic config

This plugin requires a dynamic config to define its dynamicRoute:

```yaml
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

## Branding

The home plugin reads branding configuration from the standard `app.branding` keys in app-config. The correct keys are:

```yaml
app:
  branding:
    fullLogo: https://example.com/logo.svg       # logo URL (light mode)
    iconLogo: https://example.com/icon.png       # small/icon logo
    fullLogoWidth: 150
    theme:
      light:
        variant: "backstage"
        palette:
          navigation:
            background: "#222222"
          primary:
            main: "#1F5493"
          # ... other palette keys
        typography:
          fontFamily: "Inter"
      dark:
        variant: "backstage"
        palette:
          navigation:
            background: "#222222"
          # ... other palette keys
```

For the full list of available palette and typography keys, see [Simple Branding](./branding.md).

:::note
Keys like `primaryColor`, `headerColor1`, `headerColor2`, `navigationIndicatorColor`, and `fullLogoDarkMode` do not correspond to any supported app-config structure. Use the `app.branding.theme.{light,dark}.palette.*` keys shown above instead.
:::

## Source code

The source code for the current DevPortal home plugin is at [VeeCode Homepage Plugin](https://github.com/veecode-platform/devportal-plugins/tree/main/workspace/homepage)
