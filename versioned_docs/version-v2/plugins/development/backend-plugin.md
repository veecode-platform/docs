---
sidebar_position: 10
sidebar_label: Backend Plugin
title: "Example: Backend Plugin"
---

If your plugin needs server-side APIs, background tasks, or secure integrations, create a backend plugin as well:

```bash
# From the Backstage app root
yarn new --select backend-plugin --option pluginId=my-back-plugin
```

This creates `plugins/my-back-plugin-backend/` folder (or a similar path depending on the CLI version).

## Edit plugin

This will be a very simple backend "dummy" plugin that will just log a message and return a fixed JSON response. Edit the `plugins/my-back-plugin-backend/src/plugin.ts` file:

```ts
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import Router from 'express-promise-router';

/**
 * myBackPluginPlugin backend plugin
 *
 * @public
 */
export const myBackPluginPlugin = createBackendPlugin({
  pluginId: 'my-back-plugin',
  register(env) {
    const router = Router();
    router.get('/ping', (_, res) => res.json({ msg: "pong" }));
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
      },
      async init({ logger, httpRouter }) {
        httpRouter.use(router);
        logger.info('Registered my-back-plugin backend routes at /ping');
      },
    });
  },
});
```

:::important
You can remove most generated files from the `plugins/my-back-plugin-backend/src` folder, for this example is a very simple one. Keep only the `plugin.ts` and `index.ts` files.
:::

## Plugin registering

Check the backend plugin registering already created in the backend composition by opening the `packages/backend/src/index.ts` file:

```ts
// ...
backend.add(import('@internal/plugin-my-back-plugin-backend'));
// ...
backend.start();
```

## Exposing backend routes

Backend plugins usually expose endpoints for use by frontend plugins, but those are usually restricted to authenticated users or service tokens.

You may expose backend endpoints during development for testing purposes, but this is not recommended for production. Add this to the `app-config.local.yaml` file:

```yaml
# Backstage override configuration for your local development environment
backend:
  auth:
    providers:
      guest: {}
    dangerouslyDisableDefaultAuthPolicy: true
```

## Test the plugin in Backstage

Start Backstage development normally:

```bash
yarn start
```

The plugin exposes a `/ping` route that returns a fixed JSON response. You can test it by opening http://localhost:7007/api/my-back-plugin/ping in your browser or by using `curl`:

```bash
curl http://localhost:7007/api/my-back-plugin/ping

{
  "msg": "pong"
}
```

## Running the plugin in isolation

You can also run the plugin in isolation (without a Backstage runtime). This may be useful for testing or development purposes:

```bash
cd plugins/my-back-plugin-backend
yarn run start
```

This exposes the plugin endpoint in the same way it gets exposed in Backstage:

```bash
curl http://localhost:7007/api/my-back-plugin/ping

{
  "msg": "pong"
}
```
