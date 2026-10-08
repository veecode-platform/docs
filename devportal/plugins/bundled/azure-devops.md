---
sidebar_position: 9
sidebar_label: Azure DevOps
title: Azure DevOps Plugin
---

# Azure DevOps Plugin

Without this plugin, Azure Pipelines builds and pull requests are tracked only in Azure DevOps: a service registered in the portal has no operational visibility from it. Enable the plugin, add `dev.azure.com/project-repo` to the entity, and the entity gains both a CI card (Pipelines build history) and a pull requests card.

The Azure DevOps plugin displays Azure Pipelines builds and Azure pull requests in catalog entity pages.

**Status:** Not a default plugin. Install it from Marketplace (plugin `azure-devops`) or with a plugin entry.

---

## Package

| Package | Role |
|---|---|
| `backstage-community-plugin-azure-devops` | Frontend: entity CI and pull-requests cards |
| `backstage-community-plugin-azure-devops-backend` | Backend: Azure DevOps API proxy |

Both must be enabled together. The frontend cards only render when the entity carries the required annotation.

---

## What it does

- **CI card**: Shows Azure Pipelines build results via `EntityAzurePipelinesContent`
- **Pull Requests card**: Shows open Azure pull requests via `EntityAzurePullRequestsContent`
- Both components only render when `isAzureDevOpsAvailable` is true (the required annotation is present)

---

## Install it

In Marketplace, search for `azure-devops`, select **Install**, and restart the stack as described in [Adding Plugins](../adding.md). The Marketplace install also pulls in related Azure modules as dependencies: the catalog annotator processor, the Azure DevOps and .NET scaffolder modules, and Azure DevOps search.

Alternatively, add both digest-pinned references from the default plugin index under `global.dynamic.plugins` on Kubernetes, or in the operator plugin file on the local stack:

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-community-plugin-azure-devops@sha256:4bc7e55b6a0b7b02235d8a764908a0ab294561017b576364057349b4bef468c2
    disabled: false
  - package: oci://quay.io/veecode/backstage-community-plugin-azure-devops-backend@sha256:6e33292432cbeaa38b2913acf34cda9b819c84373675bb4fbdc62b9c1242cbc6
    disabled: false
```

---

## Configuration

The index supplies the frontend mount points and the backend connection settings. Keep the mount points as shipped and provide your organization and credentials through app configuration:

```yaml
azureDevOps:
  host: dev.azure.com
  token: ${AZURE_TOKEN}
  organization: ${AZURE_ORG}
```

Place this under `upstream.backstage.appConfig` in the chart values, or in the custom configuration fragment on the local stack. The [upstream plugin README](https://github.com/backstage/community-plugins/tree/main/workspaces/azure-devops/plugins/azure-devops) documents the components, including the pipelines card, the pull requests content, and the optional pull request dashboard page.

---

## Required annotation

```yaml
metadata:
  annotations:
    dev.azure.com/project-repo: my-project/my-repo
```

The value is the Team Project name followed by the repository name. The upstream README also documents the `dev.azure.com/build-definition`, `dev.azure.com/project`, and `dev.azure.com/host-org` annotations for monorepos, pipelines in a different project, pipelines-only setups, and multiple organizations.
