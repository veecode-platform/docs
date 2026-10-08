---
sidebar_position: 12
sidebar_label: Frontend Plugin
title: "Example: Frontend Plugin"
---

A frontend plugin can be scaffolded inside a workspace with the command below:

```bash
# From the workspace root
yarn new --select frontend-plugin-legacy --option pluginId=my-front-plugin
```

The workspace app uses the legacy frontend system, so `yarn new` offers `frontend-plugin-legacy` for UI plugins.

This creates a basic React-based plugin with a page/component and plugin exports under the `plugins/my-front-plugin/src` folder.

## Edit plugin

Edit the `components/ExampleComponent/ExampleComponent.tsx` file to change some labels and messages. Don't spend too much time trying to understand the code, it's just an example.

## Check the plugin registering

Look at the `plugin.ts` and `routes.ts` files to understand how the plugin is registered and defines a page mounted to a path.

## Check the plugin UI

Look at the `components` folder to understand how the plugin UI is defined based on known Backstage and Material UI elements.

## Develop in the workspace host

The workspace development host already wires the new page into its app shell so it is accessible during development. The host route lives in `packages/app/src/App.tsx`:

```tsx
import { MyFrontPluginPage } from '@internal/backstage-plugin-my-front-plugin';
// ...
<Route path="/my-front-plugin" element={<MyFrontPluginPage />} />
// ...
```

You can add a sidebar link to the host by editing `packages/app/src/components/Root/Root.tsx` and looking for the SideBarGroup named "Menu". Add a "SidebarItem" to the group:

```tsx
// ...
      <SidebarGroup label="Menu" icon={<MenuIcon />}>
 ...
        <SidebarItem icon={CreateComponentIcon} to="create" text="Create..." />
        <SidebarItem icon={LibraryBooks} to="my-front-plugin" text="My Plugin" />
 ...
      </SidebarGroup>
// ...
```

These edits apply to the development host only. They let you iterate on the UI with `yarn start` at the workspace root. DevPortal never reads them: the product portal learns about your pages from dynamic plugin configuration instead.

![Custom Frontend Plugin](/img/assets/custom-front.png)

## Register the package for export

`yarn dev:dynamic` exports only the plugin directories listed in the `dev:dynamic` script in the workspace root `package.json`. Before you export, register the frontend package in the two places the backend example uses:

1. Append `plugins/my-front-plugin` to the `dev:dynamic` script arguments, after the directories already listed.
2. Add the `dynamic-plugins.yaml` entry shown in [Expose the plugin to DevPortal](#expose-the-plugin-to-devportal) below.

## Expose the plugin to DevPortal

Declare where the UI mounts in a `pluginConfig.dynamicPlugins.frontend` block, as described in [Wiring a Frontend Plugin](./wiring.md). The block names the route, the sidebar entry, and any entity tabs or cards:

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

Export the workspace and load it in devportal-local, as described in [Creating Your Own Plugin](./creating-own-plugins.md):

```bash
yarn dev:dynamic
```

Then run the printed Compose command from the devportal-local checkout, open the configured route in the browser, and confirm the sidebar item. If the page is missing, check `http://localhost:7007/api/dynamic-plugins-info/loaded-plugins` to see whether the package loaded.

Next:

- Add UI elements (cards, widgets) using [Backstage components](https://backstage.io/storybook/) and [Material UI](https://mui.com/material-ui/).
- Add routes, entity pages, or catalog integrations as needed.
