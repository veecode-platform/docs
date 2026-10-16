---
sidebar_position: 10
sidebar_label: Backend Plugin
title: "Example: Backend Plugin"
---

If your plugin needs server-side APIs, background tasks, or secure integrations, create a backend plugin as well:

```bash
# From the workspace root
yarn new --select backend-plugin --option pluginId=my-back-plugin
```

This creates a `plugins/my-back-plugin-backend/` folder with a backend plugin built on `createBackendPlugin`.

## Export the plugin

Build and export this package with the commands in [Creating Your Own Plugin](./creating-own-plugins.md). The 3.1 operator entry uses `./dynamic-plugins-src/<exported-directory>`, mounted from `dynamic-plugins-src-dev`. A backend entry has no `pluginConfig`.

## Edit plugin

The generated `plugin.ts` already registers its router with `httpRouter.use(await createRouter(...))`. Add the route to `plugins/my-back-plugin-backend/src/router.ts`:

```ts
router.get('/ping', (_req, res) => {
  res.json({ msg: 'pong' });
});
```

:::important
Place the route after `const router = Router();` and before `return router;`. Keep the generated `plugin.ts`, `router.ts`, `index.ts`, and `services/TodoListService.ts`; the plugin and router import these files.
:::

## Plugin registering

The workspace development host only has a backend composition when you create it with `--role backend-plugin`. That role generates `packages/backend/src/index.ts`. A workspace created with `--role frontend-plugin` holds only `packages/app` and has no `packages/backend/src/index.ts`, so there is nothing to register there.

When your workspace has `packages/backend/src/index.ts`, add the package to its backend composition for host development only:

```ts
// ...
backend.add(import('@internal/backstage-plugin-my-back-plugin-backend'));
// ...
backend.start();
```

DevPortal does not use this file. It discovers the exported dynamic package by its package role instead.

## Test the plugin in the development host

Start the workspace host:

```bash
yarn start
```

The plugin exposes a `/ping` route under its plugin id, `GET /api/my-back-plugin/ping`, which returns `{"msg":"pong"}`. Use it to confirm the plugin loaded.

## Load the plugin in DevPortal

Export the package, start devportal-local, and apply later edits as described in [Creating Your Own Plugin](./creating-own-plugins.md).

Get a guest token, then confirm the package in the loaded plugins endpoint:

```bash
TOKEN=$(curl -s http://localhost:7007/api/auth/guest/refresh -H 'X-Requested-With: XMLHttpRequest' | python3 -c 'import sys,json; print(json.load(sys.stdin)["backstageIdentity"]["token"])')
curl -H "Authorization: Bearer $TOKEN" http://localhost:7007/api/dynamic-plugins-info/loaded-plugins
```

This works while guest sign-in is on, which is the local stack default.

Then request the plugin route:

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:7007/api/my-back-plugin/ping
```

The route you added to `router.ts` returns `{"msg":"pong"}`.

Backend plugins need no `pluginConfig`: the loader registers them automatically, and their runtime settings go in regular top-level app configuration. See [Loading a Dynamic Plugin](./loading.md).
