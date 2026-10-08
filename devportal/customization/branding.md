---
sidebar_position: 2
sidebar_label: Simple branding
title: Simple branding
---

Brand the portal with the native Red Hat Developer Hub `app.branding` settings: the title, the logos, the logo width, and the light and dark theme palettes. No build step and no extra plugin is needed.

## Where the default brand comes from

Two configuration fragments set the VeeCode defaults. `config/app-config.veecode-branding.yaml` sets `app.title` and the `app.branding` logos, and `config/app-config.veecode-product.yaml` sets the theme palettes under `app.branding.theme` with the `rhdh` variant for both modes. The product fragment loads late in the `--config` chain, so its values win over earlier fragments. The load order is documented in [Add configuration to the local stack](../installation-guide/docker-local/custom-config.md).

## Change the brand on the local stack

Create `app-config.custom.yaml` in the `devportal-local` directory. This fragment sets the title, logos, logo width, and both theme palettes, and it loads after the product fragment, so every value here wins:

```yaml
app:
  title: My Portal
  branding:
    fullLogo: https://cdn.example.com/logo.svg
    iconLogo: https://cdn.example.com/icon.png
    fullLogoWidth: 150
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

Mount the fragment and load it last with a Compose override, saved as `docker-compose.custom-config.yaml` in the same directory:

```yaml
services:
  devportal:
    volumes:
      - ./app-config.custom.yaml:/opt/app-root/src/app-config.custom.yaml:ro
    command:
      - --config
      - dynamic-plugins-root/app-config.dynamic-plugins.yaml
      - --config
      - app-config.veecode-auth.yaml
      - --config
      - app-config.veecode-branding.yaml
      - --config
      - app-config.extensions.yaml
      - --config
      - app-config.veecode-product.yaml
      - --config
      - app-config.custom.yaml
```

Start the stack with both Compose files, as described in [Add configuration to the local stack](../installation-guide/docker-local/custom-config.md). The meaning of each theme key is documented in [Custom theme](./custom-theme.md).

## Change the brand on Kubernetes

Set the chart values. `global.veecode.branding` carries the title and logo width, and `upstream.backstage.appConfig` carries the `app.branding` theme, which the deployment applies after the chart fragments:

```yaml
global:
  veecode:
    branding:
      title: My Portal
      fullLogoWidth: 150
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
                navigation:
                  background: '#1b1f23'
                  indicator: '#00b39b'
            dark:
              variant: rhdh
              mode: dark
              palette:
                primary:
                  main: '#4d94ff'
                navigation:
                  background: '#1b1f23'
                  indicator: '#00b39b'
```

To use different logo files on Kubernetes, set `fullLogo` and `iconLogo` under `global.veecode.branding` with base64 data URIs, or set `app.branding.fullLogo` and `app.branding.iconLogo` URLs under `upstream.backstage.appConfig` as in the local fragment above. Every logo URL must be reachable from end users' browsers; see the CSP section below.

## External domains and CSP

DevPortal ships with a Content-Security-Policy that restricts which domains can serve images (and other resource types) to the browser. If your logo, icon, or favicon URL is on a domain not already allowed, the browser blocks it. The image silently falls back to the default, and the console shows a CSP violation.

Extend `backend.csp.img-src` in your custom fragment to add your domain:

```yaml
backend:
  csp:
    img-src:
      - "'self'"
      - "data:"
      - "https://cdn.example.com"
```

:::warning Config overrides replace arrays, they don't merge them
Backstage's config loader replaces array-valued config on override rather than appending to it. If you set `backend.csp.img-src` without including everything already in the default list, you don't just fail to add your domain. You break every other domain that was previously allowed. Read your instance's current effective `img-src` list before overriding it, and repeat it in full alongside your addition. To read it, run:

```bash
curl -sI http://localhost:7007/ | grep -i content-security-policy
```

The default image returns `img-src 'self' data:`. The same rule applies to `connect-src`, `script-src`, `style-src`, and any other CSP directive.
:::

If you're embedding an external tool via `<iframe>` (a dashboard, a status page) rather than serving an image, the directive you need is `backend.csp.frame-src`, not `img-src`. A missing `frame-src` entry is worse to debug than a missing `img-src` one: there's no console error at all, just a blank space where the iframe should be.

**Troubleshooting:**

| Symptom | Cause | Fix |
|---|---|---|
| Logo/icon doesn't render, falls back to default | Domain missing from `backend.csp.img-src` | Extend `img-src` with your domain, keeping all existing entries |
| Extending `img-src` broke unrelated images (avatars, analytics) | The override replaced the array instead of extending it | Re-add the full previous list plus your addition |
| Embedded iframe shows blank, no console error | Domain missing from `backend.csp.frame-src` | Extend `frame-src` with your domain, keeping all existing entries |

## Default palettes

The `rhdh` variant used above is the Red Hat Developer Hub default theme. To return one mode to its defaults, name only the variant and mode and omit the palette:

```yaml
app:
  branding:
    theme:
      light:
        variant: rhdh
        mode: light
      dark:
        variant: rhdh
        mode: dark
```

For the full list of keys each variant accepts, see the Red Hat Developer Hub appearance guide: [customizing the theme mode color palettes](https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.7/html/customizing_red_hat_developer_hub/customizing-appearance#proc-customize-rhdh-branding_customizing-appearance), [the default RHDH theme color palette](https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.7/html/customizing_red_hat_developer_hub/customizing-appearance#default-red-hat-developer-hub-theme-color-palette), and [the default Backstage theme color palette](https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.7/html/customizing_red_hat_developer_hub/customizing-appearance#default-backstage-theme-color-palette).
