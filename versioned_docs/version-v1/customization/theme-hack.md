---
sidebar_position: 4
sidebar_label: Theme hacking
title: Theme hacking
---

:::warning Legacy workaround
The `global.theme.customJson` mechanism described on this page is a **Helm-only** workaround that requires setting `readOnlyRootFilesystem: false`. It is superseded by the supported `app.branding.theme.*` configuration (see [Simple Branding](./branding.md)), which works in all install methods and does not require a writable container filesystem.

Use this page only if you need to override theme values that are not yet exposed by `app.branding.theme.*`, or if you are on an older install that has not migrated to the supported mechanism.
:::

A more obscure way to override theme settings despite the chosen variant is to use the `global.theme.customJson` value to override just the ones you want to change. This approach is specific to the **Helm chart install** — Docker/distro users should use `app.branding.theme.*` in `app-config.local.yaml` instead.

## How it works

At runtime the theme is defined by an internal JSON file at `/app/packages/app/dist/theme.json`. We allow overriding it completely or partially by using the `global.theme` values for the Helm chart:

```yaml
global:
  # custom theme settings
  theme:
    # Theme file url (should be a valid url to a json file)
    downloadUrl: ""
    # custom theme json (may merge or replace)
    customJson: |
      {
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
    # Merge customJson with default theme ("false" will replace default theme)
    mergeJson: true
    # define favIcon url
    favIcon: ''
upstream:
  backstage:
    containerSecurityContext:
      readOnlyRootFilesystem: false # changing the readOnlyRootFilesystem to allow changing theme
```

Please notice that:

- **downloadUrl** should point to a valid URL to a JSON file, the downloaded file will *replace* the internal theme file.
- **customJson** can be used to *replace* or *merge* with the internal theme file, based on the value of `mergeJson`.
- **favIcon** can be used to define a custom favicon for the portal.

:::warning
The `global.theme` changes require (for now) that `readOnlyRootFilesystem` is set to `false` in the `values.yaml` file (as shown above).
:::

Below, you'll find a table with references to the main graphical elements of the portal:

| background | DevPortal background color |
| --- | --- |
| paper | background overlays |
| status | tags and alerts |
| primary | primary app color used in components |
| page theme | top bar gradient theme |

![1.jpg](/img/customization/1.jpg)
![2.png](/img/customization/2.png)

## Internal `theme.json` file

You can find below a copy of the default content of the internal theme file, but you can find it online at [theme.json](https://veecode-platform.github.io/support/references/devportal/v1/theme.json). You can edit all the colors in this file, but remember you can use the `global.theme.customJson` value to override just the ones you want to change.

```json
{
  "light": {
    "background": {
      "default": "#efefef",
      "paper": "#ffffff"
    },
    "status": {
      "ok": "#129900",
      "warning": "#e0b908",
      "error": "#b41b39",
      "running": "#1F5493",
      "pending": "#FFED51",
      "aborted": "#757575"
    },
    "bursts": {
      "fontColor": "#FEFEFE",
      "slackChannelText": "#ddd",
      "backgroundColor": {
        "default": "#7C3699"
      },
      "gradient": {
        "linear": "linear-gradient(-137deg, #4BB8A5 0%, #187656 100%)"
      }
    },
    "primary": {
      "main": "#202020"
    },
    "banner": {
      "info": "#111b47",
      "error": "#ffaea5",
      "text": "#13182c",
      "link": "#104c7e",
      "closeButtonColor": "#FFFFFF",
      "warning": "#FF9800"
    },
    "border": "#E6E6E6",
    "textContrast": "#000000",
    "textVerySubtle": "#DDD",
    "textSubtle": "#6E6E6E",
    "highlight": "#FFFBCC",
    "errorBackground": "#FFEBEE",
    "warningBackground": "#F59B23",
    "infoBackground": "#ebf5ff",
    "errorText": "#CA001B",
    "infoText": "#004e8a",
    "warningText": "#000000",
    "linkHover": "#2196F3",
    "link": "#0A6EBE",
    "gold": "#FFD600",
    "navigation": {
      "background": "#171717",
      "indicator": "#9BF0E1",
      "color": "#b5b5b5",
      "selectedColor": "#FFF",
      "navItem": {
        "hoverBackground": "#404040"
      },
      "submenu": {
        "background": "#404040"
      }
    },
    "pinSidebarButton": {
      "icon": "#181818",
      "background": "#BDBDBD"
    },
    "tabbar": {
      "indicator": "#9BF0E1"
    },
    "pageThemes": {
      "primary": "#52a88c",
      "secondary": "#23c28e"
    }
  },
  "dark": {
    "background": {
      "default": "#202020",
      "paper": "#2c2c2c"
    },
    "status": {
      "ok": "#129900",
      "warning": "#e0b908",
      "error": "#b41b39",
      "running": "#1F5493",
      "pending": "#FFED51",
      "aborted": "#757575"
    },
    "bursts": {
      "fontColor": "#FEFEFE",
      "slackChannelText": "#ddd",
      "backgroundColor": {
        "default": "#7C3699"
      },
      "gradient": {
        "linear": "linear-gradient(-137deg, #4BB8A5 0%, #187656 100%)"
      }
    },
    "primary": {
      "main": "#ffffb3"
    },
    "banner": {
      "info": "#111b47",
      "error": "#ffaea5",
      "text": "#13182c",
      "link": "#104c7e",
      "closeButtonColor": "#FFFFFF",
      "warning": "#FF9800"
    },
    "border": "#E6E6E6",
    "textContrast": "#FFFFFF",
    "textVerySubtle": "#727272",
    "textSubtle": "#CCCCCC",
    "highlight": "#FFFBCC",
    "errorBackground": "#FFEBEE",
    "warningBackground": "#F59B23",
    "infoBackground": "#ebf5ff",
    "errorText": "#CA001B",
    "infoText": "#004e8a",
    "warningText": "#000000",
    "linkHover": "#82BAFD",
    "link": "#9CC9FF",
    "gold": "#FFD600",
    "navigation": {
      "background": "#424242",
      "indicator": "#9BF0E1",
      "color": "#b5b5b5",
      "selectedColor": "#FFF",
      "navItem": {
        "hoverBackground": "#404040"
      },
      "submenu": {
        "background": "#151515"
      }
    },
    "pinSidebarButton": {
      "icon": "#404040",
      "background": "#BDBDBD"
    },
    "tabbar": {
      "indicator": "#9BF0E1"
    },
    "pageThemes": {
      "primary": "#52a88c",
      "secondary": "#23c28e"
    }
  }
}
```
