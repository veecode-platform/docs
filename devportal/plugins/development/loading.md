---
sidebar_position: 16
sidebar_label: Loading
title: "Loading a Dynamic Plugin"
---

Dynamic plugins can be loaded by VeeCode DevPortal at start time. They are usually published to an OCI registry, and the DevPortal instance loads them from there according to the configuration. During development you load a local export instead, without publishing anything.

## Load a local export in devportal-local

The fastest loop is the workspace export into devportal-local, described in [Creating Your Own Plugin](./creating-own-plugins.md):

```bash
# From the plugin workspace
yarn dev:dynamic
```

```bash
# From the devportal-local checkout, using the printed command
docker compose -f docker-compose.yml -f docker-compose.dynamic-plugins-root.yml -f dynamic-plugins-root-dev/docker-compose.dynamic-plugins-root.local.yml up -d
```

The export writes `dynamic-plugins-root-dev/docker-compose.dynamic-plugins-root.local.yml` on every run. The override mounts the workspace export directory into the portal, so the portal loads your plugin without rebuilding its image. Re-export and refresh after a frontend change; re-export and restart the portal after a backend change.

## Plugin entries

On the local stack, customer plugins are added through an operator plugin file with a top-level `plugins:` list. The file starts with the default plugin index and the product plugin file under `includes:`, and each entry uses a full digest-pinned OCI reference. See [Configure dynamic plugins for the local stack](../../installation-guide/docker-local/custom-plugins.md) for the file and the Compose mount that activates it.

A published entry has this shape:

```yaml
plugins:
  - package: oci://quay.io/veecode/<plugin-name>@sha256:<digest>
    disabled: false
```

An image that holds one plugin needs no `!<plugin path>` suffix: the installer reads the path from the image manifest. To turn on or change a plugin that is already in the default plugin list, follow [Adding Plugins](../adding.md) instead.

## Generating the `integrity` hash

The `integrity:` field is **required for remote npm packages**. The installer downloads the package, recomputes its SHA-512, and refuses to load it on mismatch.

It is **not used** for:

- OCI packages (`oci://...`) — these are validated by digest comparison.
- Local paths (`./dynamic-plugins/dist/...`) — pre-bundled in the image; no download involved.

Expected format: `sha512-<base64>`. Two ways to generate it:

**Method A — query the npm registry directly (preferred for public packages):**

```bash
npm view <package>@<version> dist.integrity
# example
npm view @backstage/plugin-catalog@2.0.5 dist.integrity
```

Returns the hash in exactly the format the installer compares against. **Always pin the version** — `npm view <package> dist.integrity` (no version) returns the latest, which will mismatch if you have a specific version pinned in your `package:` field.

**Method B — compute it locally (fallback for private registries or when `npm view` fails):**

```bash
npm pack <package>@<version> && \
  HASH=$(cat <package>-<version>.tgz | openssl dgst -sha512 -binary | openssl base64 -A) && \
  echo "sha512-$HASH"
```

This replicates the exact pipeline the installer uses internally (`cat archive | openssl dgst -sha512 -binary | openssl base64 -A`), so the produced hash is guaranteed to match a successful install.

## Private npm registry

Due to security and compliance reasons you may not want VeeCode DevPortal to load plugins from public npm registries. You may prefer to use a private npm registry, like Nexus or Artifactory.

On Kubernetes, the chart mounts an optional Secret named `<release>-dynamic-plugins-npmrc` into the plugin installer. Put your `.npmrc` under the key `.npmrc` before you add entries that point at the private registry; the installer uses it as its npm configuration through `NPM_CONFIG_USERCONFIG`.

## Wiring plugins

Dynamic plugins wire themselves to the DevPortal instance through configuration. Unlike static plugins, they cannot modify the host Backstage project's code — wiring happens at runtime, declared in YAML.

**The wiring rule depends on the plugin's role**, declared in its `package.json` under `backstage.role`:

| Role | `pluginConfig` needed? | Where does its config go? |
|---|---|---|
| `frontend-plugin` | **Yes** — describes mount points, tabs, routes | Inside `pluginConfig.dynamicPlugins.frontend.<plugin-id>` |
| `backend-plugin` | **No** — auto-discovered by the loader | Plain top-level keys in app configuration (e.g., `sonarqube:`) |
| `backend-plugin-module` | **No** — auto-attaches to its parent plugin | Plain top-level keys in app configuration (parent plugin's config) |

There is no `dynamicPlugins.backend.*` key. Backend plugins never wire themselves through `pluginConfig` — the loader detects them by their package role and registers them automatically.

### Backend plugin example (no `pluginConfig`)

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-community-plugin-sonarqube-backend:bs_1.52.0__1.1.1!backstage-community-plugin-sonarqube-backend
    disabled: false
    # No pluginConfig — backend role is auto-discovered
```

The plugin's runtime configuration goes in your regular app configuration as a normal top-level section:

```yaml
sonarqube:
  baseUrl: https://sonarqube.example.com
```

Same pattern for `backend-plugin-module` (e.g., a scaffolder action module attaches itself to the scaffolder plugin):

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-community-plugin-sonarqube:bs_1.52.0__1.1.0!backstage-community-plugin-sonarqube
    disabled: false
    # No pluginConfig — module auto-attaches to the scaffolder backend
```

### Frontend plugin example (`pluginConfig` required)

Frontend plugins must declare where their UI components mount, because Backstage's frontend has no auto-discovery for routes, sidebars, tabs, or cards:

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-community-plugin-sonarqube:bs_1.52.0__1.1.0!backstage-community-plugin-sonarqube
    disabled: false
    pluginConfig:
      dynamicPlugins:
        frontend:
          backstage-community.plugin-sonarqube:
            mountPoints:
              - mountPoint: entity.page.overview/cards
                importName: EntitySonarQubeCard
                config:
                  if:
                    allOf:
                      - isSonarQubeAvailable
```

The plugin-id under `dynamicPlugins.frontend.<plugin-id>` is the npm package name with `@` removed and `/` replaced by `.` (note: `.`, not `-`, for this key specifically — different from the OCI reference convention).

See [Wiring a Frontend Plugin](wiring.md) for the full list of frontend mount points, tab paths, and the `scalprum` mechanism that processes these declarations at runtime.

## Tips

Get a guest token, then check the loaded plugins:

```bash
TOKEN=$(curl -s http://localhost:7007/api/auth/guest/refresh -H 'X-Requested-With: XMLHttpRequest' | python3 -c 'import sys,json; print(json.load(sys.stdin)["backstageIdentity"]["token"])')
curl -H "Authorization: Bearer $TOKEN" http://localhost:7007/api/dynamic-plugins-info/loaded-plugins
```

This works while guest sign-in is on, which is the local stack default.
