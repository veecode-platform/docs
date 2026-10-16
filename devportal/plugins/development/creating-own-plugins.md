---
sidebar_position: 20
sidebar_label: Creating Your Own Plugin
title: "Creating Your Own Plugin"
---

[Bootstrapping](./bootstrap.md) through [Wiring](./wiring.md) cover the mechanical steps of building a plugin. This page strings those steps into one loop: scaffold, build, export, load into devportal-local, and see the plugin run.

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

## 3. Export and start devportal-local

Run the workspace helper from the workspace root. First point it at your `devportal-local` checkout, in the same shell. The path below assumes `devportal-plugins` and `devportal-local` are cloned side by side.

```bash
export DEVPORTAL_LOCAL_DIR="$(cd ../../../devportal-local && pwd -P)"
yarn dev:dynamic
```

The helper exports the plugin directories it is given with the Red Hat Developer Hub CLI package `@red-hat-developer-hub/cli` (`rhdh-cli`). `yarn dev:dynamic` gives it the plugin the workspace was created with: `plugins/<workspace-name>` for a frontend plugin, `plugins/<workspace-name>-backend` for a backend plugin. It writes exports to `devportal-local/dynamic-plugins-src-dev/`, creates `devportal-local/dynamic-plugins-root-dev/dynamic-plugins.local.yaml`, and creates `devportal-local/dynamic-plugins-root-dev/docker-compose.dynamic-plugins-root.local.yml`. The `devportal-local` checkout supplies `docker-compose.yml` and `docker-compose.dynamic-plugins-root.yml`. The helper prints the command to start the stack with all three Compose files; run it from the `devportal-local` directory:

```bash
docker compose -f docker-compose.yml \
  -f docker-compose.dynamic-plugins-root.yml \
  -f dynamic-plugins-root-dev/docker-compose.dynamic-plugins-root.local.yml up -d
```

The `dynamic-plugins.local.yaml` operator file uses `./dynamic-plugins-src/<exported-directory>` for each exported package. DevPortal 3.1 does not include `/opt/app-root/src/dynamic-plugins/`; the local Compose override mounts `dynamic-plugins-src-dev` at `/opt/app-root/src/dynamic-plugins-src` for the installer. An entry that still points to `./dynamic-plugins/dist/...` is skipped because that directory is absent: the installer logs `Skipping 1 local plugins (directories not found)` and the stack still starts.

The installer copies each export from `dynamic-plugins-src-dev` into `dynamic-plugins-root-dev`, the plugin root the portal reads, every time the stack starts.

### Export a package added with `yarn new`

`yarn dev:dynamic` exports only the plugin the workspace was created with. A package you add with `yarn new` is exported when you pass its directory as an argument. For example, for a backend plugin, from the workspace root:

```bash
yarn new --select backend-plugin --option pluginId=my-back-plugin
```

Then add an entry for its exported directory to the workspace's `dynamic-plugins.yaml`, after the existing entry:

```yaml
  - package: ./dynamic-plugins-src/internal-backstage-plugin-my-back-plugin-backend-dynamic
    disabled: false
```

The directory name is the package name with `@` removed and `/` replaced by `-`. The `yarn new` backend package is `@internal/backstage-plugin-my-back-plugin-backend`, and its export keeps the `-dynamic` suffix. Check the name under `devportal-local/dynamic-plugins-src-dev/` after the first export.

On every run, pass the package's directory after the workspace's own:

```bash
yarn dev:dynamic plugins/my-back-plugin-backend
```

`yarn` appends the argument to the script, so both packages export. When the argument and the YAML entry do not match, the helper behaves as follows:

- An argument without the YAML entry stops with `Workspace dynamic plugin config has no package entry for @internal/backstage-plugin-my-back-plugin-backend-dynamic`.
- The YAML entry without the argument stops with `Workspace dynamic plugin config references unexported workspace plugins: internal-backstage-plugin-my-back-plugin-backend. Pass every plugin directory listed in dynamic-plugins.yaml.`
- No argument and no YAML entry exits without an error, and the package is missing from the export and from the operator file.

### Edit and reload

Change the plugin and rerun the same `yarn dev:dynamic` command you used for the first export, with the same arguments. Then, from `devportal-local`, stop the stack with the same three Compose files and `down`, and start it again with the printed command. A reload alone does not show the edit: the running portal still serves the copy the installer wrote when the stack last started. After the restart, the installer copies the new export into the portal and the served bundle has the new text. Verified for a frontend edit; the backend edit path was not run. Do not use `-v` when stopping the stack, because it deletes the PostgreSQL data volume.

## Manual fallback without the helper

If you cannot use `yarn dev:dynamic`, build and export each package manually. From the workspace root, set the path to the side-by-side local checkout:

```bash
yarn tsc
yarn build:all
export DEVPORTAL_LOCAL_DIR="$(cd ../../../devportal-local && pwd -P)"
```

Then run the Red Hat Developer Hub CLI from each plugin package directory, replacing the package path as needed:

```bash
cd plugins/my-front-plugin
npx --yes --package=@red-hat-developer-hub/cli@1.11.2 -- rhdh-cli plugin export --dev --dynamic-plugins-root "$DEVPORTAL_LOCAL_DIR/dynamic-plugins-src-dev"
```

From `devportal-local`, create the two directories first. Writing the operator file fails until `dynamic-plugins-root-dev` exists:

```bash
mkdir -p dynamic-plugins-root-dev dynamic-plugins-src-dev
```

Create `dynamic-plugins-root-dev/dynamic-plugins.local.yaml` in `devportal-local`. Add the default plugin index and each exported package:

```yaml
includes:
  - dynamic-plugins.default.yaml
plugins:
  - package: ./dynamic-plugins-src/<exported-directory>
    disabled: false
```

Create `dynamic-plugins-root-dev/docker-compose.dynamic-plugins-root.local.yml` with the same mounts used by the helper:

```yaml
services:
  install-dynamic-plugins:
    volumes:
      - ./dynamic-plugins-root-dev/dynamic-plugins.local.yaml:/opt/app-root/src/dynamic-plugins.operator.yaml:ro
      - ./dynamic-plugins-src-dev:/opt/app-root/src/dynamic-plugins-src
```

Start the stack from the `devportal-local` directory with the three Compose files shown above. For a frontend plugin, add its `pluginConfig` under the entry as described in [Wiring a Frontend Plugin](./wiring.md).

## 4. Confirm the plugin loaded

Get a guest token, then check the loaded plugins endpoint:

```bash
TOKEN=$(curl -s http://localhost:7007/api/auth/guest/refresh -H 'X-Requested-With: XMLHttpRequest' | python3 -c 'import sys,json; print(json.load(sys.stdin)["backstageIdentity"]["token"])')
curl -H "Authorization: Bearer $TOKEN" http://localhost:7007/api/dynamic-plugins-info/loaded-plugins
```

This works while guest sign-in is on, which is the local stack default. If the token request fails right after the portal starts, wait a few seconds and run it again.

Your package appears in the list. Then confirm it runs: open the configured frontend route in the browser, request a scaffolded backend route with the token, such as `curl -H "Authorization: Bearer $TOKEN" http://localhost:7007/api/my-back-plugin/todos` (without the token it answers 401), or open `/create/actions` for a Scaffolder action module.

## 5. Publish and install

When the plugin works locally, publish it as an OCI image in a registry your DevPortal can pull from and install it with a plugin entry, as described in [Packaging your Plugin](./packaging.md) and [Configure dynamic plugins for the local stack](../../installation-guide/docker-local/custom-plugins.md).

## Notes from the loop

- Frontend and backend plugins configure differently. A frontend plugin needs a `pluginConfig.dynamicPlugins.frontend` block with its routes, menu items, and mount points, described in [Wiring a Frontend Plugin](./wiring.md). A backend plugin needs no `pluginConfig`: the loader discovers it by its package role, and its runtime settings go in regular top-level app configuration.
- An OCI reference to an image that holds one plugin can leave out the `!<plugin path>` suffix: the installer reads the path from the image manifest. An entry that overrides a default plugin keeps the full suffix, as [Adding Plugins](../adding.md) describes.
- Some things genuinely require forking the base image because no configuration reaches them: the shell structure itself (`Sidebar`, `AppRouter`), the base entity-tab component (you can add tabs, but not replace the tab shell), catalog table columns, and icons imported directly into a component rather than resolved through the icon registry. If your requirement lands on one of these, plan for a fork or a support request rather than looking for a YAML key that does not exist.
