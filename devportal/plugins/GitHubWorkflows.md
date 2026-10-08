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
| `veecode-platform-backstage-plugin-github-workflows` | Frontend — entity card and tab |
| `veecode-platform-backstage-plugin-github-workflows-backend` | Backend — GitHub API proxy |

Both are versioned packages in the active package index (`1.3.7`) and are **not default plugins**. Install them from the Marketplace or by package reference.

---

## Enabling the plugin

### Via Marketplace

Search for the GitHub Workflows entry in the Marketplace and install it, then recreate the stack so the installer runs. A plain container restart does not apply a Marketplace selection. See [Configure dynamic plugins for the local stack](../installation-guide/docker-local/custom-plugins.md) for the apply procedure.

### Via the operator file (local stack)

Add both index references to your operator file (`dynamic-plugins.local.yaml`):

```yaml
plugins:
  - package: oci://quay.io/veecode/veecode-platform-backstage-plugin-github-workflows-backend@sha256:f7f824e5af6777af901438d085fd6606eaac9050fb6404f194f3b812a6b13856
    disabled: false

  - package: oci://quay.io/veecode/veecode-platform-backstage-plugin-github-workflows@sha256:db84ae0a758bda91657154346be2c510149cb1955ced2960329b124e04f65c44
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
```

### On Kubernetes

Add the same two package references under `global.dynamic.plugins` in your chart values.

---

## GitHub integration

The backend calls the GitHub API with a GitHub App. Configure the app credentials where the portal reads its app config — a configuration fragment on the local stack, `upstream.backstage.appConfig` on Kubernetes — with secrets passed through environment variables or a referenced Secret:

```yaml
integrations:
  github:
    - host: github.com
      apps:
        - appId: ${GITHUB_APP_ID}
          clientId: ${GITHUB_CLIENT_ID}
          clientSecret: ${GITHUB_CLIENT_SECRET}
          privateKey: |
            ${GITHUB_PRIVATE_KEY}
```

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

The GitHub Workflows plugin integrates with the GitHub Actions plugin (`backstage-community-plugin-github-actions`). In the Workflows List, clicking **Logs** opens the corresponding GitHub Actions run. In Workflow Cards, clicking the label navigates to the Actions tab.

To use this integration, also enable the GitHub Actions plugin. See [CI/CD Plugins](./cicd.md) for its package reference and annotation.
