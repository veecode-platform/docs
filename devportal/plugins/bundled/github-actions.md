---
sidebar_position: 8
sidebar_label: GitHub Actions
title: GitHub Actions Plugin
---

# GitHub Actions Plugin

Without this plugin, CI history lives only in GitHub — the developer has to leave the portal to check whether a build passed or trace a failed run back to a commit. Enable the plugin, add `github.com/project-slug` to the entity, and a CI tab appears showing recent Actions run history with status, duration, and direct links to logs. Build health becomes part of the service's entity, not a separate GitHub tab.

The GitHub Actions plugin displays GitHub Actions workflow run history in the CI tab of catalog entities. It is the standard Backstage community plugin for GitHub Actions integration.

**Status:** Listed in `dynamic-plugins.default.yaml` (reference) as `disabled: true`. Fetched from the OCI registry at boot when enabled — no image rebuild needed. Activated automatically by the `github` preset.

---

## Package

`backstage-community-plugin-github-actions`

---

## What it does

- Adds a **CI** tab to entity pages showing recent GitHub Actions workflow runs
- Displays run status, duration, branch, and commit
- Links to the GitHub Actions run for logs and details
- Shows only for entities with the `github.com/project-slug` annotation

---

## Enabling the plugin

The simplest path is to add the `github` preset to `VEECODE_PRESETS` — it enables the GitHub Actions plugin along with the rest of the GitHub integration. See [Presets](/devportal/concepts/presets) for details.

To enable manually, add the following to your `dynamic-plugins.yaml`:

```yaml
plugins:
  - package: oci://${PLUGIN_REGISTRY}/github-actions:bs_1.48.4!backstage-community-plugin-github-actions
    disabled: false
    pluginConfig:
      dynamicPlugins:
        frontend:
          backstage-community.plugin-github-actions:
            mountPoints:
              - mountPoint: entity.page.ci/cards
                importName: EntityGithubActionsContent
                config:
                  layout:
                    gridColumn: "1 / -1"
                  if:
                    allOf:
                      - isGithubActionsAvailable
```

---

## Required annotation

```yaml
metadata:
  annotations:
    github.com/project-slug: my-org/my-repo
```

---

## GitHub integration

The plugin uses `integrations.github` in `app-config.yaml`. Ensure a GitHub token or GitHub App is configured:

```yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_PAT}
```
