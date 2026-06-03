---
sidebar_position: 16
sidebar_label: Loading
title: "Loading a Dynamic Plugin"
---

Dynamic plugins can be loaded by VeeCode DevPortal at start time. They are usually published to a private npm registry or OCI registry, and the DevPortal instance will load them from there according to the configuration.

## Configuration

Mount a `dynamic-plugins.yaml` file at `/app/dynamic-plugins.yaml` with a top-level `plugins:` list:

```yaml
plugins:
  # npm plugin
  - package: '@yourorg/yourplugin@x.y.z'
    disabled: false
    integrity: sha512-xxxxxxxxx
  # preloaded plugin (path relative to the dynamic-plugins directory)
  - package: ./dynamic-plugins/dist/another-plugin-dynamic
    disabled: false
```

You only provide `plugins:`. The entrypoint owns the `includes:` chain — on every boot it copies your file to a writable shadow and rebuilds `includes:` to prepend the marketplace state and each preset fragment. An `includes:` block you add yourself is replaced, so you never need to write one.

Mount it in your compose file or Kubernetes Deployment manifest — see [Adding Plugins](../adding.md) for the exact volume/ConfigMap syntax.

## Generating the `integrity` hash

The `integrity:` field is **required for remote npm packages** (unless the env var `SKIP_INTEGRITY_CHECK=true` is set). The installer downloads the package, recomputes its SHA-512, and refuses to load it on mismatch.

It is **not used** for:

- OCI packages (`oci://...`) — these are validated by digest comparison via `skopeo inspect`.
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

Due to security and compliance reasons you may not want VeeCode DevPortal to load plugins from public npm registries. You may prefer to use a private npm registry, like Nexus, Artifactory or even Verdaccio.

Mount a `.npmrc` file into the container at `/app/.npmrc` (or the path the install script reads from). For Kubernetes, create a Secret and mount it as a volume:

```bash
kubectl create secret generic devportal-npmrc \
  --namespace platform \
  "--from-literal=.npmrc=registry=https://your-registry-url/"
```

```yaml
# Deployment volumeMount
- mountPath: /app/.npmrc
  name: npmrc
  subPath: .npmrc
  readOnly: true

# Volume
- name: npmrc
  secret:
    secretName: devportal-npmrc
```

## Wiring plugins

Dynamic plugins wire themselves to the DevPortal instance through configuration. Unlike static plugins, they cannot modify the host Backstage project's code — wiring happens at runtime, declared in YAML.

**The wiring rule depends on the plugin's role**, declared in its `package.json` under `backstage.role`:

| Role | `pluginConfig` needed? | Where does its config go? |
|---|---|---|
| `frontend-plugin` | **Yes** — describes mount points, tabs, routes | Inside `pluginConfig.dynamicPlugins.frontend.<plugin-id>` |
| `backend-plugin` | **No** — auto-discovered by the loader | Plain top-level keys in `app-config.yaml` (e.g., `sonarqube:`, `gitlab:`) |
| `backend-plugin-module` | **No** — auto-attaches to its parent plugin | Plain top-level keys in `app-config.yaml` (parent plugin's config) |

There is no `dynamicPlugins.backend.*` key. Backend plugins never wire themselves through `pluginConfig` — the loader detects them by their package role and registers them automatically.

### Backend plugin example (no `pluginConfig`)

```yaml
plugins:
  - package: oci://quay.io/veecode/sonarqube:bs_1.48.4!backstage-community-plugin-sonarqube-backend
    disabled: false
    # No pluginConfig — backend role is auto-discovered
```

The plugin's runtime configuration goes in your regular `app-config.yaml` (or `app-config.local.yaml`) as a normal top-level section:

```yaml
sonarqube:
  baseUrl: ${SONARQUBE_URL}
  apiKey: ${SONARQUBE_TOKEN}
```

Same pattern for `backend-plugin-module` (e.g., a scaffolder action module attaches itself to the scaffolder plugin):

```yaml
plugins:
  - package: oci://quay.io/veecode/sonarqube:bs_1.48.4!backstage-community-plugin-sonarqube
    disabled: false
    # No pluginConfig — module auto-attaches to the scaffolder backend
```

### Frontend plugin example (`pluginConfig` required)

Frontend plugins must declare where their UI components mount, because Backstage's frontend has no auto-discovery for routes, sidebars, tabs, or cards:

```yaml
plugins:
  - package: oci://quay.io/veecode/sonarqube:bs_1.48.4!backstage-community-plugin-sonarqube
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

You can check the loaded plugins using this URL:

```bash
curl <your-devportal-url>/api/dynamic-plugins-info/loaded-plugins
```
