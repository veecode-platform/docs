---
sidebar_position: 4
sidebar_label: Adding Plugins
title: Adding Plugins
---

You can add dynamic plugins to your DevPortal instance at any time without rebuilding the base image.

:::note
Adding a plugin is the **load** step — step 1 of 3 in the plugin activation model. A loaded plugin does nothing visible until the relevant catalog entities carry the correct annotation (context) and `app-config` configures the backend it queries. See [Composing a Portal](/devportal/v2/concepts/portal-composition) for the full model.
:::

## Prerequisites

- A running DevPortal instance
- The plugin package reference (npm specifier, local path, or OCI artifact)
- Any credentials the plugin requires (API tokens, etc.)

<!-- dp-source: plugin,entrypoint -->
## Via Marketplace

The in-portal Marketplace is the simplest path — no YAML editing required.

1. Open your Backstage instance and click **Marketplace** in the sidebar
2. Search for the plugin you want (e.g., GitLab, Tech Insights, AWS ECS)
3. Click **Enable** on the plugin card
4. A *Restart Pending* badge appears in the DevPortal header
5. Restart the instance so the change takes effect — on self-hosted deployments restart the pod/container yourself (e.g. `kubectl rollout restart`); on the VeeCode SaaS the customer portal exposes a **Restart** button. Allow ~2 minutes for the instance to come back up.
6. The plugin appears in its configured location (sidebar entry, entity tab, etc.)

:::warning
Plugins installed via Marketplace only persist after an explicit **Restart**. Without a restart the plugin is active at runtime but lost on the next pod start.
:::

## Via YAML override

Use this path when a plugin is not in the Marketplace, or when you need advanced mount point or route configuration.

### SaaS (customer portal)

In the customer portal, go to **Configure → Plugins YAML** and edit the `plugins_overrides_yaml`. Provide only a top-level `plugins:` list — the platform manages the `includes:` chain for you (see the self-hosted section below for how this works):

```yaml
plugins:
  - package: oci://quay.io/veecode/<plugin-name>:bs_<backstage-version>__<plugin-version>!<plugin-name>
    disabled: false
    pluginConfig:
      dynamicPlugins:
        frontend:
          <plugin-id>:
            mountPoints:
              - mountPoint: entity.page.ci/cards
                importName: EntityGitlabPipelinesTable
                config:
                  layout:
                    gridColumn: 1 / -1
                  if:
                    allOf:
                      - isGitlabAvailable
```

### OCI artifact format

VeeCode publishes one OCI image per plugin, named from the plugin's npm
package (`@` removed, `/` → `-`). Which reference format you write depends on
how your DevPortal is deployed:

**Deployed via the `devportal-chart` Helm chart, version 0.1.21 or later** —
use the bare, index-resolved form. There is no `!selector`: the image
contains exactly one plugin, and the chart's catalog index
(`quay.io/veecode/plugin-catalog-index`) resolves the actual version for you:

```
oci://quay.io/veecode/<plugin-name>:{{inherit}}
```

```yaml
- package: oci://quay.io/veecode/immobiliarelabs-backstage-plugin-gitlab:{{inherit}}
```

This is the upstream RHDH convention (`dynamic-plugins.default.yaml` +
`{{inherit}}` + `CATALOG_INDEX_IMAGE`), and it's the recommended form on this
path — a plugin patch release propagates without editing YAML.

**Deployed as the standalone DevPortal image** (self-hosted Docker/Kubernetes
below, or the SaaS customer portal) — pin the version and append
`!<plugin-name>` (repeating the plugin name as the selector). The installer
this image ships with today still requires the `!` separator even for a
one-image-per-plugin reference:

```
oci://quay.io/veecode/<plugin-name>:bs_<backstage-version>__<plugin-version>!<plugin-name>
```

```yaml
- package: oci://quay.io/veecode/immobiliarelabs-backstage-plugin-gitlab:bs_1.52.0__7.0.0!immobiliarelabs-backstage-plugin-gitlab
```

- **plugin-name**: npm package name with `@` removed and `/` replaced by `-`. Examples: `@immobiliarelabs/backstage-plugin-gitlab` → `immobiliarelabs-backstage-plugin-gitlab`; `@roadiehq/backstage-plugin-argo-cd` → `roadiehq-backstage-plugin-argo-cd`.
- **backstage-version**: Backstage version of your DevPortal instance (e.g., `1.52.0`). Must match — a plugin built for `1.48.4` will not load on a `1.52.0` instance. See [Discovering your Backstage version](#discovering-your-backstage-version) below.
- **plugin-version**: the exact upstream plugin release, e.g. `7.0.0`.

A future DevPortal release will drop the `!<plugin-name>` requirement and
support `{{inherit}}` on this path too; until then, use the pinned form with
the selector.

The variable form `oci://${PLUGIN_REGISTRY}/<plugin-name>:bs_<backstage-version>__<plugin-version>!<plugin-name>`
lets the entrypoint substitute the registry for a mirror without editing the rest of the reference.

:::note Bundle images from before this migration keep working
Older references of the form `oci://quay.io/veecode/<workspace>:bs_<version>!<plugin-name>`
(one image per workspace, multiple plugins selected via `!`) are not going
away — existing `dynamic-plugins.yaml` files with that syntax keep resolving
indefinitely. The per-plugin syntax above is what new installs and new plugin
entries should use.
:::

#### Discovering your Backstage version

Every OCI reference is built for a specific Backstage release, and it must match your instance. The image resolves `${BACKSTAGE_VERSION}` from `/app/backstage.json` at boot, so that file is the authoritative source:

```bash
# On a running container — read the version field
docker exec <container> cat /app/backstage.json
# {"version":"1.49.4", ...}  → use bs_1.49.4

# On the image directly, without a running container
docker run --rm veecode/devportal:2.1.3 cat /app/backstage.json
```

The boot log prints the same value once resolved: `VEECODE: resolving ${BACKSTAGE_VERSION} → 1.49.4`. On a running container you can also grep the resolved defaults — `docker exec <container> grep -o 'bs_[0-9.]*' /app/dynamic-plugins.default.resolved.yaml | sort -u` — since the entrypoint substitutes the real version into that shadow.

:::note Why not other methods?
- The image labels (`docker inspect`) only carry UBI/RHEL base image metadata — no Backstage version.
- The `/api/version` endpoint exists but requires authentication, so it's not usable for a quick check.
- The `@backstage/backend-defaults` version inside `/app/packages/backend/package.json` is a Backstage-internal pin (e.g., `^0.16.0`), not the public Backstage release number — different namespace, don't use it.
:::

### Finding the OCI reference for a plugin

**Path A — Marketplace (fastest).** Open the in-portal Marketplace, search for the plugin, and the card shows the exact `package:` reference to copy into your YAML. The Marketplace consumes `quay.io/veecode/plugin-catalog-index:latest` — the same index the entrypoint downloads at boot — which aggregates every published plugin's metadata, so this is the most up-to-date source.

**Path B — Inspect the export-overlays repo (when you need to verify or you don't have Marketplace access).**

The [`devportal-plugin-export-overlays`](https://github.com/veecode-platform/devportal-plugin-export-overlays) repo organizes plugin *sources* into `workspaces/<workspace>/` directories — one workspace per upstream repo, which can contain several plugin packages. That grouping is a build-time concept only; it no longer appears in the OCI reference itself.

1. Open [`workspaces/`](https://github.com/veecode-platform/devportal-plugin-export-overlays/tree/main/workspaces) and find the workspace that packages the plugin's upstream repo. The workspace name usually matches the upstream npm scope or repo: `@roadiehq/*` → `roadie-backstage-plugins`; `@immobiliarelabs/backstage-plugin-gitlab` → `gitlab`; standalone plugins like `argocd` get their own workspace.
2. Open `workspaces/<workspace>/plugins-list.yaml`. **If the plugin is commented out, it is not currently published — there is no OCI artifact for it.**
3. If active, open `workspaces/<workspace>/metadata/<plugin-name>.yaml` to confirm the plugin's exact npm package name and version — normalize it (`@` removed, `/` → `-`) to get the per-plugin image name.

```bash
# Programmatic search across all workspaces:
git clone https://github.com/veecode-platform/devportal-plugin-export-overlays
grep -r "packageName" workspaces/ | grep -i "<plugin-name-substring>"
```

:::caution `dynamicArtifact` in metadata may still show the old bundle form
Some `workspaces/<workspace>/metadata/<plugin-name>.yaml` files have not yet been
updated to the per-plugin image and still show `dynamicArtifact:
oci://quay.io/veecode/<workspace>:bs_<version>!<plugin-name>`. That reference
still works, but for new installs prefer building the per-plugin reference
yourself from the `packageName` field (see [OCI artifact format](#oci-artifact-format)
above) rather than copying `dynamicArtifact` verbatim. **Some entries are also
local paths** like `./dynamic-plugins/dist/<plugin-name>`. That syntax means
the plugin is **preloaded inside the DevPortal image** — it is not available
as a pull-at-runtime OCI artifact, and you cannot use that string in your own
`dynamic-plugins.yaml` unless your distro already bundles the plugin's `dist/`
folder. If you need the plugin and it's only shipped as a local path, your
options are: rebuild your own image with the plugin bundled, or fork
`devportal-plugin-export-overlays` and add an OCI export step for it.
:::

:::caution Not every Backstage plugin is published as an OCI artifact by VeeCode
If a plugin's `plugins-list.yaml` entry is commented out (or the plugin doesn't appear in any workspace), VeeCode is not currently shipping a dynamic build for it. You can still enable it by referencing the npm package directly (`package: '@npm-scope/plugin-name'`) provided the upstream publishes a dynamic build, or you can fork `devportal-plugin-export-overlays` and add the plugin to a workspace yourself.
:::

#### When two vendors could plausibly provide the same plugin

Some upstream functionalities are implemented by **multiple independent npm packages** from different vendors — Argo CD is the canonical example. The community publishes one implementation; Roadie publishes another. Both are built in the export-overlays repo (in different workspaces), and each package gets its own per-plugin image. Pick deliberately:

| You want... | Packages |
|---|---|
| Argo CD deployment status + history, OCI-available frontend + backend | `@backstage-community/plugin-argocd` (frontend, OCI) + `@backstage-community/plugin-argocd-backend` (backend, OCI) |
| Roadie's Argo CD overview cards + a scaffolder action to create Argo CD resources | `@roadiehq/backstage-plugin-argo-cd-backend` (OCI) + `@roadiehq/scaffolder-backend-argocd` (OCI). **The Roadie frontend has no OCI artifact** (it ships as a local path) — pair the Roadie backend with a custom-bundled frontend, or use the community frontend instead. |

The two implementations share the same `argocd.appLocatorMethods` schema in `app-config.yaml`, so you can swap which backend you load without rewriting your config — but they expose different frontend component names and entity card layouts.

The same disambiguation pattern applies whenever you see plugins from `@backstage-community/*` and `@roadiehq/*` (or any other vendor) for the same upstream tool. Compare features, and pick the one whose frontend exists as OCI if you need pull-at-runtime install.

For a complete list of bundled (preloaded) plugins that do not require an OCI reference, see [Bundled Plugins](./bundled/index.md).

### Self-hosted (Docker / Kubernetes)

Mount a `dynamic-plugins.yaml` override file with a top-level `plugins:` list:

```yaml
plugins:
  - package: 'oci://quay.io/veecode/immobiliarelabs-backstage-plugin-gitlab:bs_1.52.0__7.0.0!immobiliarelabs-backstage-plugin-gitlab'
    disabled: false
    pluginConfig: {}
```

Mount the file in your compose file or Deployment manifest:

**Docker Compose:**
```yaml
volumes:
  - ./dynamic-plugins.yaml:/app/dynamic-plugins.yaml:ro
```

**Kubernetes (ConfigMap approach):**
```yaml
# ConfigMap
data:
  dynamic-plugins.yaml: |
    plugins:
      - package: 'oci://...'
        disabled: false

# Deployment volumeMount
- mountPath: /app/dynamic-plugins.yaml
  name: dp-override
  subPath: dynamic-plugins.yaml
```

After mounting, restart the container to apply the change (`docker compose restart devportal` or `kubectl rollout restart deployment/devportal`).

:::note The entrypoint manages `includes:` — you only provide `plugins:`
On every boot the entrypoint copies your mounted `dynamic-plugins.yaml` to a writable shadow and rebuilds the `includes:` chain, prepending `dynamic-plugins.default.resolved.yaml` (the shadow of the image defaults, with `${BACKSTAGE_VERSION}` and `${PLUGIN_REGISTRY}` substituted), the marketplace state, and each selected preset's plugin fragment. Any `includes:` you write yourself is **replaced**, so you don't need to reference the defaults — your `plugins:` entries are preserved and merged last, which is why a `disabled:` toggle here wins over a preset.

`integrity:` is **required for remote npm packages** (unless `SKIP_INTEGRITY_CHECK=true`), and **not used** for OCI or local-path packages. To generate the `sha512-<base64>` string, see [Generating the integrity hash](./development/loading.md#generating-the-integrity-hash).
:::

## Configuring credentials

Most integration plugins require tokens or API keys. **Never put sensitive values directly in YAML** — use environment variables.

### SaaS

1. In the customer portal, go to **Configure → Environment Variables**
2. Add the variable marked as *sensitive* (e.g., `GITLAB_TOKEN`)
3. Reference it in app-config as `${GITLAB_TOKEN}`

### Self-hosted

Pass credentials as environment variables to the container and reference them with `${VAR_NAME}` in `app-config.yaml`.

## Configuration examples

### GitLab integration

Required app-config:

```yaml
integrations:
  gitlab:
    - host: gitlab.com
      token: ${GITLAB_TOKEN}

gitlab:
  proxySecure: false
```

Required entity annotation in `catalog-info.yaml`:

```yaml
annotations:
  gitlab.com/project-slug: <namespace>/<project>
```

### Tech Insights (quality scorecards)

```yaml
techInsights:
  factRetrievers:
    entityOwnershipFactRetriever:
      cadence: '1 * * * *'
      lifecycle: { timeToLive: { weeks: 2 } }
    entityMetadataFactRetriever:
      cadence: '1 * * * *'
      lifecycle: { timeToLive: { weeks: 2 } }
  factChecker:
    checks:
      hasOwner:
        rule:
          factIds: [entityOwnershipFactRetriever]
          engine: json-rules-engine
          checkSpec:
            rule:
              conditions:
                all:
                  - fact: hasOwner
                    operator: equal
                    value: true
        name: Has Owner
        description: Component has an owner defined
        type: json-rules-engine
        factIds: [entityOwnershipFactRetriever]
```

## Post-restart verification

- The plugin appears in its expected location (tab, sidebar entry, overview card)
- Pod logs contain no `Cannot find module` or `YAMLParseError`
- Backstage starts without `BackendStartupError`

```shell
kubectl -n devportal-<instance-id> logs deploy/veecode-devportal --tail=100 | grep -E "(error|Error|WARN)"
```

## Common pitfalls

| Symptom | Cause | Fix |
|---|---|---|
| Plugin missing after restart | `disabled: true` or incorrect package reference | Check OCI reference and `disabled: false` |
| YAML parse error on restart | Duplicate keys (strict YAML 1.2) | Remove duplicates; validate with `node -e "require('yaml').parse(...)"` |
| Instance starts with empty plugin list | Invalid YAML silently ignored | Validate the YAML before saving |
| Missing environment variable on start | app-config references `${VAR}` not configured | Add the variable in Environment Variables |
| MUI runtime error in plugin frontend | Plugin uses MUI v7, distro uses MUI v5 | Pin to an earlier plugin version compatible with MUI v4/v5 |
