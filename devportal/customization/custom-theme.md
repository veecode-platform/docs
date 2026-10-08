---
sidebar_position: 5
sidebar_label: Custom theme plugin
title: Custom theme
---

Change the portal colors with the native Red Hat Developer Hub `app.branding.theme` settings. Each mode declares its variant and palette, and the VeeCode defaults use the `rhdh` variant for both modes.

## Change the palette on the local stack

Create or extend `app-config.custom.yaml` in the `devportal-local` directory so it loads after the product fragment, as described in [Add configuration to the local stack](../installation-guide/docker-local/custom-config.md). This fragment overrides the primary and secondary colors, the sidebar navigation colors, and the RHDH layout tokens for both modes:

```yaml
app:
  branding:
    theme:
      light:
        variant: rhdh
        mode: light
        palette:
          primary:
            main: '#0055aa'
          secondary:
            main: '#5a3fc0'
          navigation:
            background: '#1b1f23'
            indicator: '#00b39b'
            color: '#d8d8d8'
            selectedColor: '#ffffff'
          rhdh:
            general:
              sidebarBackgroundColor: '#1b1f23'
              sidebarItemSelectedBackgroundColor: '#0055aa'
      dark:
        variant: rhdh
        mode: dark
        palette:
          primary:
            main: '#4d94ff'
          secondary:
            main: '#8b6fe0'
          navigation:
            background: '#1b1f23'
            indicator: '#00b39b'
            color: '#d8d8d8'
            selectedColor: '#ffffff'
          rhdh:
            general:
              sidebarBackgroundColor: '#1b1f23'
              sidebarItemSelectedBackgroundColor: '#4d94ff'
```

The meaning of each key is documented in the Red Hat Developer Hub appearance guide: [customizing the theme mode color palettes](https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.7/html/customizing_red_hat_developer_hub/customizing-appearance#proc-customize-rhdh-branding_customizing-appearance) for `palette.primary`, `palette.secondary`, and `palette.navigation`; [the default RHDH theme color palette](https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.7/html/customizing_red_hat_developer_hub/customizing-appearance#default-red-hat-developer-hub-theme-color-palette) for `palette.rhdh.general`; [customizing the page theme header](https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.7/html/customizing_red_hat_developer_hub/customizing-appearance#proc-customize-rhdh-page-theme_customizing-appearance) for `pageTheme`; and [customizing the font](https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.7/html/customizing_red_hat_developer_hub/customizing-appearance#proc-customize-rhdh-font_customizing-appearance) for `typography`.

## Change the palette on Kubernetes

Set the same keys under `upstream.backstage.appConfig` in your chart values. The deployment applies them after the chart fragments, so they win:

```yaml
upstream:
  backstage:
    appConfig:
      app:
        branding:
          theme:
            light:
              variant: rhdh
              mode: light
              palette:
                primary:
                  main: '#0055aa'
                secondary:
                  main: '#5a3fc0'
                navigation:
                  background: '#1b1f23'
                  indicator: '#00b39b'
            dark:
              variant: rhdh
              mode: dark
              palette:
                primary:
                  main: '#4d94ff'
                secondary:
                  main: '#8b6fe0'
                navigation:
                  background: '#1b1f23'
                  indicator: '#00b39b'
```

## The legacy theme plugin ships disabled

The default plugin file (`dynamic-plugins.veecode.yaml`) still carries the legacy VeeCode theme plugin, but its entry is `disabled: true`. The RHDH-native theming above replaces it. Leave the entry disabled. Re-enabling it restores the old theme provider, which does not implement the palette contract the 3.x shell requires.

DevPortal 2.x also read theme overrides from the `THEME_CUSTOM_JSON` and `THEME_DOWNLOAD_URL` environment variables, as described in the [2.x theme guide](/devportal/v2/customization/theme-hack). 3.x does not read them; set the palette through app configuration as shown above.

## Load a custom theme plugin

When palette values are not enough, for example for component style overrides or a self-hosted font, ship a frontend dynamic plugin that provides theme providers. Follow [Loading a custom Developer Hub theme by using a dynamic plugin](https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.7/html/customizing_red_hat_developer_hub/customizing-appearance#proc-loading-custom-theme-using-dynamic-plugin-_customizing-appearance) and [Creating a custom theme](https://backstage.io/docs/getting-started/app-custom-theme/) to build it. Install it on the local stack through an operator plugin file, as described in [Configure dynamic plugins for the local stack](../installation-guide/docker-local/custom-plugins.md), or on Kubernetes through `global.dynamic.plugins`, as described in [Set up DevPortal on a cluster](../installation-guide/production-setup/setup.md).
