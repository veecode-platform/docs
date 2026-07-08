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

:::warning Validate before deploying
Malformed JSON in `THEME_CUSTOM_JSON` makes the entrypoint silently skip the override — the container still boots, but the theme doesn't change and nothing in the logs points at the JSON. Validate before deploying:

```bash
echo "$THEME_CUSTOM_JSON" | jq .
```
:::

The favicon download happens before the backend starts, and the browser renders it based on the remote server's `Content-Type` header rather than the URL's file extension — a `THEME_FAV_ICON` URL ending in `.ico`, `.png`, or `.svg` all work as long as the server serves the right content type.

## Example: partial theme override via Docker Compose

```yaml
services:
  devportal:
    image: veecode/devportal:2.1.3
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
| `primary.main` | Primary accent — buttons, links, focus rings |
| `navigation.background` | Sidebar background |
| `navigation.indicator` | Selection line under the active sidebar item |
| `navigation.color` / `navigation.selectedColor` | Sidebar item text, unselected / selected |
| `navigation.navItem.hoverBackground` | Sidebar item background on hover |
| `navigation.submenu.background` | Expanded sidebar submenu background |
| `tabbar.indicator` | Selection line under the active tab |
| `pageThemes` | Top bar gradient colors on entity pages |
| `bursts.backgroundColor` / `bursts.gradient.linear` | Decorative banners on landing pages |
| `background` | Page background and card/paper color |
| `status` | Tag and alert colors (ok, warning, error, running, pending, aborted) |
| `link` / `linkHover` | Inline link color |
| `pinSidebarButton.icon` / `pinSidebarButton.background` | Sidebar pin/unpin button |

This table covers the raw `theme.json` keys read by `THEME_CUSTOM_JSON`/`THEME_DOWNLOAD_URL`. The same keys, under the same names, are also reachable through the structured `app.branding.theme.*` config — see the full value dump in [Simple Branding](./branding.md#other-examples) if you'd rather configure via app-config than raw JSON.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Palette stays default even with `THEME_CUSTOM_JSON` set | Malformed JSON | Validate with `jq` before deploying (see above) |
| Some colors applied, others didn't | `THEME_MERGE_JSON=false` with an incomplete JSON object | Use the default merge behavior (any value other than `"false"`) so unspecified tokens keep their default |
| Favicon doesn't change | `THEME_FAV_ICON` URL returns a non-2xx status | Confirm the URL returns 200 before setting it |
