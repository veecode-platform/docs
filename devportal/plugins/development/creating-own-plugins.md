---
sidebar_position: 20
sidebar_label: Creating Your Own Plugin
title: "Creating Your Own Plugin"
---

[Bootstrapping](./bootstrap.md) through [Wiring](./wiring.md) cover the mechanical steps of building a plugin. This page strings those steps into one loop you can run end to end: scaffold, build, export, load into devportal-local, and see the plugin run.

You need a Linux machine with Docker, Node 22 or 24, and Yarn 4.12.0. Clone the two public repositories side by side:

```bash
git clone https://github.com/veecode-platform/devportal-plugins.git
git clone https://github.com/veecode-platform/devportal-local.git
```

## 1. Scaffold a workspace

From the `devportal-plugins` checkout, create a workspace for the plugin type you need:

```bash
cd devportal-plugins
yarn create-workspace my-workspace --role frontend-plugin
cd workspaces/my-workspace
yarn install
```

See [Bootstrapping](./bootstrap.md) for the roles and the host Backstage line.

## 2. Build the plugin

Develop the plugin as described in [Example: Frontend Plugin](./frontend-plugin.md), [Example: Backend Plugin](./backend-plugin.md), or [Example: Custom Action](./custom-action.md). Then check and build every package in the workspace:

```bash
yarn tsc
yarn build:all
```

## 3. Export the workspace

Register each new package before you export. `yarn dev:dynamic` exports only the plugin directories listed in the `dev:dynamic` script in the workspace root `package.json`, and it needs a matching entry in the workspace `dynamic-plugins.yaml` for each one:

1. Append the plugin directory to the `dev:dynamic` script arguments. For example, change `export-dev-dynamic.sh plugins/dummy plugins/dummy-backend` to `export-dev-dynamic.sh plugins/dummy plugins/dummy-backend plugins/my-back-plugin-backend`.
2. Add the export entry to `dynamic-plugins.yaml`:

```yaml
plugins:
  - package: ./dynamic-plugins/dist/internal-backstage-plugin-my-back-plugin-backend-dynamic
    disabled: false
```

A backend entry has no `pluginConfig`.

Then export the workspace packages as dynamic plugins:

```bash
yarn dev:dynamic
```

The command writes each plugin export under `dynamic-plugins-root-dev` in the workspace and prints the exact Compose command that loads the export into devportal-local.

## 4. Load the export in devportal-local

From the `devportal-local` checkout, run the command `yarn dev:dynamic` prints:

```bash
docker compose -f docker-compose.yml -f docker-compose.dynamic-plugins-root.yml -f dynamic-plugins-root-dev/docker-compose.dynamic-plugins-root.local.yml up -d
```

The export writes `dynamic-plugins-root-dev/docker-compose.dynamic-plugins-root.local.yml` on every run.

The override mounts `dynamic-plugins-root-dev` into the portal at `/opt/app-root/src/dynamic-plugins-root`, so the portal loads your export without rebuilding its image. The first start on a fresh database takes about two minutes while PostgreSQL and the plugin installer initialize. Open [http://localhost:7007](http://localhost:7007) and sign in as guest.

After a frontend edit, run `yarn dev:dynamic` again and refresh the portal. After a backend edit, re-export and restart the portal so the backend process loads the new code.

## 5. Confirm the plugin loaded

Get a guest token, then check the loaded plugins endpoint:

```bash
TOKEN=$(curl -s http://localhost:7007/api/auth/guest/refresh -H 'X-Requested-With: XMLHttpRequest' | python3 -c 'import sys,json; print(json.load(sys.stdin)["backstageIdentity"]["token"])')
curl -H "Authorization: Bearer $TOKEN" http://localhost:7007/api/dynamic-plugins-info/loaded-plugins
```

This works while guest sign-in is on, which is the local stack default. If the token request fails right after the portal starts, wait a few seconds and run it again: the backend can answer 503 for a short time after `/healthcheck` returns 200.

Your package appears in the list. Then confirm it runs: open the configured frontend route in the browser, request a backend route such as `/api/my-back-plugin/ping`, or open `/create/actions` for a Scaffolder action module.

## 6. Publish and install

When the plugin works locally, publish it as an OCI image in a registry your DevPortal can pull from and install it with a plugin entry, as described in [Packaging your Plugin](./packaging.md) and [Configure dynamic plugins for the local stack](../../installation-guide/docker-local/custom-plugins.md).

## Notes from the loop

- Frontend and backend plugins configure differently. A frontend plugin needs a `pluginConfig.dynamicPlugins.frontend` block with its routes, menu items, and mount points, described in [Wiring a Frontend Plugin](./wiring.md). A backend plugin needs no `pluginConfig`: the loader discovers it by its package role, and its runtime settings go in regular top-level app configuration.
- An OCI reference to an image that holds one plugin can leave out the `!<plugin path>` suffix: the installer reads the path from the image manifest. An entry that overrides a default plugin keeps the full suffix, as [Adding Plugins](../adding.md) describes.
- Some things genuinely require forking the base image because no configuration reaches them: the shell structure itself (`Sidebar`, `AppRouter`), the base entity-tab component (you can add tabs, but not replace the tab shell), catalog table columns, and icons imported directly into a component rather than resolved through the icon registry. If your requirement lands on one of these, plan for a fork or a support request rather than looking for a YAML key that does not exist.
