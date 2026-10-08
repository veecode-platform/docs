---
sidebar_position: 18
sidebar_label: Wiring
title: "Wiring a Frontend Plugin"
---

Frontend plugins must be wired to the DevPortal instance configuration during dynamic loading, or they will not work at all (despite being loaded). This is a critical feature because - unlike static ones - dynamic plugins cannot imply in code changes to the host Backstage project.

## Understand Frontend Plugin Wiring

All frontend plugins **must** bring their own settings in the `pluginConfig:` field of their plugin entry, thus defining routes, sidebars, mount points, icons, APIs, etc.

The sample frontend plugin built in [Example: Frontend Plugin](./frontend-plugin.md) defines a page and a sidebar link, so it is wired to DevPortal by a configuration like the one below:

```yaml
plugins:
  - package: ./dynamic-plugins/dist/internal-backstage-plugin-my-front-plugin-dynamic
    disabled: false
    pluginConfig:
      dynamicPlugins:
        frontend:
          internal.backstage-plugin-my-front-plugin:
            dynamicRoutes:
              - path: /my-front-plugin
                importName: MyFrontPluginPage
                menuItem:
                  icon: LibraryBooks
                  text: My Plugin Page
                  enabled: true
```

The plugin id under `dynamicPlugins.frontend.<plugin-id>` is the npm package name with `@` removed and `/` replaced by `.`. The `package` value above is the local export path used during development. A published plugin uses its OCI reference instead. See [Loading a Dynamic Plugin](./loading.md) and [Configure dynamic plugins for the local stack](../../installation-guide/docker-local/custom-plugins.md) for the entry shapes.

## Routes, menu entries, and mount points

`dynamicRoutes` is one of several `dynamicPlugins.frontend.<plugin-id>` keys the loader understands. Use them to make each part of the plugin appear. The example assumes the plugin also exports an icon, `MyPluginIcon`, and an entity card, `MyFrontPluginCard`; the scaffolded plugin exports only `MyFrontPluginPage`:

```yaml
pluginConfig:
  dynamicPlugins:
    frontend:
      internal.backstage-plugin-my-front-plugin:
        appIcons:
          - name: myPluginIcon
            importName: MyPluginIcon
        dynamicRoutes:
          - path: /my-front-plugin
            importName: MyFrontPluginPage
            menuItem:
              icon: myPluginIcon
              text: My Plugin Page
              enabled: true
        entityTabs:
          - path: /my-front-plugin-tab
            title: My Plugin
            mountPoint: entity.page.my-front-plugin
        mountPoints:
          - mountPoint: entity.page.overview/cards
            importName: MyFrontPluginCard
```

Before assuming a customization is not possible, check whether it is exposed as one of these keys rather than requiring a fork. The wiring surface is broader than any single plugin's configuration shows: `mountPoints` places cards on entity pages, `entityTabs` adds tabs, and `appIcons` registers icons the menu items reference.

## Test the wiring locally

Export the workspace and load it in devportal-local, as described in [Creating Your Own Plugin](./creating-own-plugins.md):

```bash
yarn dev:dynamic
```

Then run the printed Compose command from the devportal-local checkout, open the configured route in the browser, and confirm the sidebar item. If the package is absent from the UI, check `http://localhost:7007/api/dynamic-plugins-info/loaded-plugins` to see whether it loaded.

## Additional Documentation

More info on frontend plugin wiring can be found on [RHDH wiring documentation](https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.7/html-single/installing_and_viewing_plugins_in_red_hat_developer_hub/index#assembly-front-end-plugin-wiring.adoc_rhdh-extensions-plugins).
