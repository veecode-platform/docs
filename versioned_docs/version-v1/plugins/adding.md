---
sidebar_position: 4
sidebar_label: Adding Plugins
title: Adding Plugins
---

You can add dynamic plugins to your DevPortal instance at any time without rebuilding the base image.

## Prerequisites

- A running DevPortal instance
- The plugin package reference (npm specifier, local path, or OCI artifact)
- Any credentials the plugin requires (API tokens, etc.)

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

In the customer portal, go to **Configure → Plugins YAML** and edit the `plugins_overrides_yaml`:

```yaml
includes:
  - dynamic-plugins.default.yaml

plugins:
  - package: oci://quay.io/veecode/<workspace>:bs_<backstage-version>!<plugin-package>
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

OCI artifacts published by VeeCode follow this format:

```
oci://quay.io/veecode/<workspace>:bs_<backstage-version>!<plugin-name>
```

- **workspace**: workspace name in the export-overlays pipeline (e.g., `gitlab`, `tech-insights`, `aws-ecs`)
- **backstage-version**: Backstage version of your instance (e.g., `1.49.4`)
- **plugin-name**: npm package name with `@` removed and `/` replaced by `-` (e.g., `immobiliarelabs-backstage-plugin-gitlab`)

Available workspaces on `quay.io/veecode`:

| Workspace | Plugins | Tag |
|---|---|---|
| `gitlab` | GitLab frontend + backend (immobiliare) | `bs_1.48.4` |
| `tech-insights` | Tech Insights frontend, backend, jsonfc | `bs_1.48.4` |
| `aws-ecs` | AWS ECS frontend + backend | `bs_1.48.4` |
| `mcp-integrations` | MCP extras (catalog, techdocs, scaffolder) | `bs_1.49.4` |
| `backstage` | MCP actions backend | `bs_1.49.4` |
| `mcp-chat` | MCP Chat frontend + backend | `bs_1.49.4` |

:::note
The workspace tag must match the Backstage version of your DevPortal instance. The examples above reflect current published tags; MCP workspaces are on `bs_1.49.4` while others are on `bs_1.48.4`. The workspace table above is not exhaustive — there are 60+ workspaces in the export-overlays pipeline. Use the Marketplace for the complete catalog.
:::

For a complete list of bundled (preloaded) plugins that do not require an OCI reference, see [Bundled Plugins](./bundled).

### VKDR (local setup)

If you are using VKDR to manage your local DevPortal instance, add plugins using the `--merge` argument during install:

```bash
vkdr devportal install \
  --github-token=$GITHUB_TOKEN \
  --samples \
  --merge ./my-plugins.yaml
```

The `my-plugins.yaml` file should have a `global.dynamic.plugins` section:

```yaml
global:
  dynamic:
    plugins:
      - package: '@veecode-platform/backstage-plugin-global-floating-action-button-dynamic@1.4.0'
        disabled: false
        integrity: sha512-...
        pluginConfig:
          dynamicPlugins:
            frontend:
              red-hat-developer-hub.backstage-plugin-global-floating-action-button:
                mountPoints:
                  - mountPoint: application/listener
                    importName: DynamicGlobalFloatingActionButton
```

### Helm

Add the plugin to the `global.dynamic.plugins` array in your `values.yaml`:

```yaml
global:
  dynamic:
    plugins:
      - package: 'oci://quay.io/veecode/gitlab:bs_1.48.4!immobiliarelabs-backstage-plugin-gitlab'
        disabled: false
        pluginConfig: {}
```

:::warning
`global.dynamic.plugins` is an array that overrides the chart default. Check the chart's [values.yaml](https://github.com/veecode-platform/next-charts/blob/main/veecode-devportal-chart/values.yaml) to understand what the baseline includes before overriding.
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
