---
sidebar_position: 15
sidebar_label: CI/CD Plugins
title: CI/CD Plugins
---

# CI/CD Plugins

The problem CI/CD plugins solve is the same across every platform: the service is registered in the portal, but its pipeline lives in GitHub Actions, GitLab, Jenkins, or Azure DevOps. Developers context-switch to check builds, find failures, and trigger runs. Each CI/CD plugin closes that gap for one platform by surfacing build status and triggers on the entity page itself — the service and its pipeline become one view.

This is the [Application Lifecycle](/platform/capabilities/platform-capabilities) capability layer in practice. Pick the plugin that matches the platform your team uses; the activation pattern is the same for all of them.

DevPortal ships several separate CI/CD plugins, each integrating with a specific CI/CD platform. There is no single "CI/CD Plugin" — each platform has its own plugin that must be installed individually. None of them is a default plugin. Install each one from the Marketplace or by its package reference from the default plugin index, then add the platform's app configuration and entity annotation.

---

## Available CI/CD plugins

| Plugin | Platform | Marketplace name | Annotation |
|---|---|---|---|
| [GitHub Actions](./bundled/github-actions.md) | GitHub Actions workflow runs | `github-actions` | `github.com/project-slug` |
| [GitHub Workflows](./GitHubWorkflows.md) | Manual GitHub workflow trigger + cards | By package reference | `github.com/project-slug`, `github.com/workflows` |
| Jenkins | Jenkins build status | `backstage-community-plugin-jenkins` | `jenkins.io/job-full-name` |
| [Azure DevOps](./bundled/azure-devops.md) | Azure Pipelines + Pull Requests | `azure-devops` | `dev.azure.com/project-repo` |
| [GitLab](./GitLabPipelines.md) | GitLab pipelines, merge requests, issues | By package reference | `gitlab.com/project-slug` |
| [SonarQube](./Sonar.md) | Code quality metrics | `sonarqube-catalog-cards` | `sonarqube.org/project-key` |
| Tekton | Tekton pipeline runs | `tekton` | See the [upstream Tekton plugin README](https://github.com/backstage/community-plugins/tree/main/workspaces/tekton) |
| Argo CD (Red Hat) | GitOps deployments | `redhat-argocd` | See the [upstream Argo CD plugin README](https://github.com/backstage/community-plugins/tree/main/workspaces/argocd) |
| Argo CD (Roadie) | GitOps deployments | `roadie-argocd` | See the Marketplace entry |

Each plugin's page (or the linked upstream README) gives the exact configuration block and annotation values.

---

## How CI/CD results appear

The GitHub Actions, Jenkins, Azure DevOps, and Tekton plugins mount their content in the **CI** tab (`entity.page.ci/cards`). The tab appears on entities that have the relevant annotation.

GitHub Workflows mounts as an **overview card** (`entity.page.overview/cards`) controlled by the `github.com/workflows` or `vee.codes/has-github-workflows` annotation. The GitLab plugin mounts its pipelines table in the CI tab and its merge request stats card in the overview. The Argo CD plugin mounts a deployment summary in the overview and the deployment lifecycle in the **CD** tab. Azure DevOps additionally mounts a Pull Requests tab.

---

## What each plugin needs

Every CI/CD plugin needs credentials for its platform in the app config, with secrets passed through environment variables on the local stack or a referenced Secret on Kubernetes:

- **GitHub Actions and GitHub Workflows** — `integrations.github` with a token or GitHub App credentials.
- **GitLab** — `integrations.gitlab` with `host`, `apiBaseUrl`, and `token`.
- **Jenkins** — `jenkins` with `baseUrl`, `username`, and `apiKey`.
- **Azure DevOps** — `azureDevOps` with `host`, `token`, and `organization`.
- **SonarQube** — `sonarqube` with `baseUrl` and `apiKey`.
- **Tekton and Argo CD** — configure the cluster access and instance settings from the plugin README, then annotate the entity.

Azure DevOps and Argo CD need the instance settings listed above. Installed from the Marketplace without them, both plugins still load, but the backend logs missing-configuration errors at startup (`search.collators.azureDevOpsWikiCollator.wikis[0].organization` for the Azure DevOps wiki search collator and `argocd.appLocatorMethods[0].instances[0].url` for Argo CD). The healthcheck still returns 200.

---

## Quick enable: GitHub Actions

The simplest CI/CD plugin to enable for GitHub-hosted projects. Add the index reference to your operator file on the local stack, or under `global.dynamic.plugins` in your chart values on Kubernetes:

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-community-plugin-github-actions@sha256:fe9cea3a11097339f85bab0bf095ecf1dc95b972194d41e4c9ca0e34c85ecebd
    disabled: false
```

Add `github.com/project-slug: my-org/my-repo` to the component's `catalog-info.yaml` and the CI tab will appear.

For other platforms, follow the links in the table above for full enable instructions.
