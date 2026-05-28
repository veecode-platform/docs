---
sidebar_position: 6
sidebar_label: GitHub Workflows
title: GitHub Workflows Plugin
---

# GitHub Workflows Plugin

Without this plugin, triggering a workflow means leaving the portal, navigating to GitHub, finding the repository, and running the action from there — the developer loses service context and the portal has no visibility into what happened. Enable the plugin, add `github.com/project-slug` to the entity, and a workflow card appears on the entity overview. Workflows can be triggered and monitored without leaving the service page.

The GitHub Workflows plugin provides manual workflow triggering from within a DevPortal component. It offers two distinct approaches:

- **Workflows List** — lists all workflows in the repository, with branch selection and manual trigger support.
- **Workflow Cards** — an overview card showing only workflows pinned via annotation.

### Community

> Join our community to resolve questions about our Plugins. We look forward to welcoming you!
>
> [Go to Community](https://github.com/orgs/veecode-platform/discussions)

---

## Plugin packages

| Package | Role |
|---|---|
| `veecode-platform-backstage-plugin-github-workflows-dynamic` | Frontend — entity card and tab |
| `veecode-platform-backstage-plugin-github-workflows-backend-dynamic` | Backend — GitHub API proxy |

Both are preloaded in the DevPortal image and **disabled by default**. No image rebuild is needed.

---

## Enabling the plugin

Add the following to your `dynamic-plugins.yaml` (or the equivalent YAML section in your deployment):

```yaml
plugins:
  - package: ./dynamic-plugins/dist/veecode-platform-backstage-plugin-github-workflows-backend-dynamic
    disabled: false

  - package: ./dynamic-plugins/dist/veecode-platform-backstage-plugin-github-workflows-dynamic
    disabled: false
    pluginConfig:
      dynamicPlugins:
        frontend:
          veecode-platform.backstage-plugin-github-workflows:
            mountPoints:
              - mountPoint: entity.page.overview/cards
                importName: EntityGithubWorkflowsCard
                config:
                  layout:
                    gridRowStart:
                      lg: "4"
                    gridColumnStart:
                      lg: "1"
                    gridColumnEnd:
                      lg: "span 6"
                  if:
                    anyOf:
                      - hasAnnotation: "github.com/workflows"
                      - hasAnnotation: "vee.codes/has-github-workflows"
```

Restart DevPortal after saving. Via the Marketplace UI you can click **Enable** instead of editing YAML manually.

---

## GitHub integration

The plugin reads workflow data from the GitHub API using the GitHub integration configured in `app-config.yaml`. Ensure `integrations.github` is configured with a token or GitHub App credentials.

```yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}
```

No proxy configuration is needed for DevPortal — the backend plugin handles GitHub API calls server-side.

---

## Prerequisites in GitHub

To allow triggering workflows from the plugin, add `workflow_dispatch:` to each workflow you want to trigger:

```yaml
name: My Workflow
on:
  push:
    branches: ["main"]
  workflow_dispatch:    # required for manual trigger support
```

The key must be present even when no inputs are defined.

---

## Annotations

### `github.com/project-slug` (required)

Required for all catalog components using any GitHub plugin:

```yaml
metadata:
  annotations:
    github.com/project-slug: my-org/my-repo
```

### `github.com/workflows` or `vee.codes/has-github-workflows` (required for Workflow Cards)

Pin specific workflows to show in the overview card. The value is a comma-separated list of workflow file paths:

```yaml
metadata:
  annotations:
    github.com/workflows: deploy.yml,release.yml
```

The plugin renders the Workflow Cards component when either annotation is present. If neither annotation is present, the card does not appear.

---

## Workflows List

The Workflows List component shows all workflows in the repository. It appears in the entity overview and includes:

- Branch selector (filters by branch)
- Refresh button
- Table with: workflow name, status, action button, and link to the GitHub run

If a workflow has `inputs` defined under `workflow_dispatch`, the plugin shows a modal to collect those inputs before triggering.

---

## Workflow Cards

The Workflow Cards component shows only the workflows listed in the `github.com/workflows` or `vee.codes/has-github-workflows` annotation. It appears in the entity overview.

Multiple workflow file paths can be added:

```yaml
github.com/workflows: build.yml,deploy.yml,release.yml
```

---

## Integration with GitHub Actions plugin

The GitHub Workflows plugin integrates with the bundled GitHub Actions plugin (`backstage-community-plugin-github-actions-dynamic`). In the Workflows List, clicking **Logs** opens the corresponding GitHub Actions run. In Workflow Cards, clicking the label navigates to the Actions tab.

To use this integration, also enable the GitHub Actions plugin:

```yaml
  - package: ./dynamic-plugins/dist/backstage-community-plugin-github-actions-dynamic
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
