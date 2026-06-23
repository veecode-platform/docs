---
sidebar_position: 4
sidebar_label: Theme overrides
title: Theme overrides via environment variables
---

For most branding use cases, the `app.branding.theme.*` configuration in `app-config.local.yaml` (see [Simple Branding](./branding.md)) is all you need. For low-level JSON overrides of the internal theme file (`/app/packages/app/dist/theme.json`), the image entrypoint supports dedicated environment variables.

## Environment variable reference

| Variable | Effect |
|----------|--------|
| `THEME_DOWNLOAD_URL` | URL to a JSON file. The entrypoint downloads it and replaces the internal theme file completely. |
| `THEME_CUSTOM_JSON` | Inline JSON string. Merged with or replaces the internal theme file, depending on `THEME_MERGE_JSON`. |
| `THEME_MERGE_JSON` | Set to `"false"` to replace the theme file entirely with `THEME_CUSTOM_JSON`. Defaults to merge (any value other than `"false"`). |
| `THEME_FAV_ICON` | URL to a favicon. The entrypoint downloads it and replaces `/app/packages/app/dist/favicon.ico`. |

## Example: partial theme override via Docker Compose

```yaml
services:
  devportal:
    image: veecode/devportal:2.2.0
    ports:
      - "7007:7007"
    environment:
      - VEECODE_PRESETS=recommended,veecode-theme,github,github-auth
      - GITHUB_PAT
      - GITHUB_ORG
      - GITHUB_AUTH_CLIENT_ID
      - GITHUB_AUTH_CLIENT_SECRET
      - THEME_MERGE_JSON=true
      - |
        THEME_CUSTOM_JSON={
          "light": {
            "background": {
              "default": "#efefef"
            }
          },
          "dark": {
            "background": {
              "default": "#202020"
            }
          }
        }
    volumes:
      - dp-data:/app/data
      - dp-plugins:/app/dynamic-plugins-root

volumes:
  dp-data:
  dp-plugins:
```

## Example: custom theme from a URL

```yaml
environment:
  - THEME_DOWNLOAD_URL=https://example.com/my-theme.json
```

The downloaded file replaces the internal theme file entirely (no merge).

## Internal `theme.json` reference

The default internal theme file is published at [theme.json](https://veecode-platform.github.io/support/references/devportal/theme.json). You can use it as a starting point to build a replacement or a partial override object.

The key sections are `"light"` and `"dark"`, each containing:

| Key | What it controls |
|-----|-----------------|
| `background` | Page background and card/paper color |
| `primary` | Primary accent color used in components |
| `navigation` | Sidebar background, icon, and indicator colors |
| `status` | Tag and alert colors (ok, warning, error, running, pending, aborted) |
| `pageThemes` | Top bar gradient colors |
