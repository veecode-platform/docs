---
sidebar_position: 15
sidebar_label: CI/CD Plugins
title: CI/CD Plugins
---

# CI/CD Plugins

DevPortal ships several separate CI/CD plugins, each integrating with a specific CI/CD platform. There is no single "CI/CD Plugin" — each platform has its own bundled plugin that must be enabled individually.

All CI/CD plugins described here are **preloaded in the DevPortal image and disabled by default**. Enable them via `dynamic-plugins.yaml` or the Marketplace — no support contact required.

---

## Available CI/CD plugins

| Plugin | Platform | Package |
|---|---|---|
| [GitHub Actions](./bundled/github-actions) | GitHub Actions workflow runs | `backstage-community-plugin-github-actions-dynamic` |
| [GitHub Workflows](./GitHubWorkflows) | Manual GitHub workflow trigger + cards | `veecode-platform-backstage-plugin-github-workflows-dynamic` |
| [Jenkins](./bundled/jenkins) | Jenkins build status | `backstage-community-plugin-jenkins` + backend |
| [Azure DevOps](./bundled/azure-devops) | Azure Pipelines + Pull Requests | `backstage-community-plugin-azure-devops-dynamic` |
| [GitLab Pipelines](./GitLabPipelines) | GitLab CI pipeline trigger and status | OCI: `oci://quay.io/veecode/gitlab:bs_1.48.4!immobiliarelabs-backstage-plugin-gitlab` |

---

## How CI/CD results appear

The bundled GitHub Actions, Jenkins, and Azure DevOps plugins mount their content in the **CI** entity tab (`entity.page.ci/cards`). The tab appears automatically on entities that have the relevant annotation and `disabled: false` in the plugin configuration.

GitHub Workflows mounts as an **overview card** (`entity.page.overview/cards`) rather than in the CI tab, and is controlled by the `github.com/workflows` or `vee.codes/has-github-workflows` annotation.

---

## Quick enable: GitHub Actions

The simplest CI/CD plugin to enable for GitHub-hosted projects:

```yaml
plugins:
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

Add `github.com/project-slug: my-org/my-repo` to the component's `catalog-info.yaml` and the CI tab will appear.

For other platforms, follow the links in the table above for full enable instructions.
