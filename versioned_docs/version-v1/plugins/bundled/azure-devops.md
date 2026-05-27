---
sidebar_position: 9
sidebar_label: Azure DevOps
title: Azure DevOps Plugin
---

# Azure DevOps Plugin

The Azure DevOps plugin displays Azure Pipelines builds and Azure Pull Requests in catalog entity pages.

**Status:** Preloaded in the DevPortal image, **disabled by default**. Enable via `dynamic-plugins.yaml` or Marketplace.

---

## Package

`backstage-community-plugin-azure-devops-dynamic`

---

## What it does

- **CI tab**: Shows Azure Pipelines build results via `EntityAzurePipelinesContent`
- **Pull Requests tab**: Shows open Azure PRs via `EntityAzurePullRequestsContent`
- Both components only render when `isAzureDevOpsAvailable` is true (i.e., the required annotation is present)

---

## Enabling the plugin

```yaml
plugins:
  - package: ./dynamic-plugins/dist/backstage-community-plugin-azure-devops-dynamic
    disabled: false
    pluginConfig:
      dynamicPlugins:
        frontend:
          backstage-community.plugin-azure-devops:
            mountPoints:
              - mountPoint: entity.page.ci/cards
                importName: EntityAzurePipelinesContent
                config:
                  layout:
                    gridColumn: "1 / -1"
                  if:
                    allOf:
                      - isAzureDevOpsAvailable
              - mountPoint: entity.page.pull-requests/cards
                importName: EntityAzurePullRequestsContent
                config:
                  layout:
                    gridColumn: "1 / -1"
                  if:
                    allOf:
                      - isAzureDevOpsAvailable
```

---

## App configuration

```yaml
azureDevOps:
  host: dev.azure.com
  token: ${AZURE_TOKEN}
  organization: ${AZURE_ORGANIZATION}
```

---

## Required annotation

```yaml
metadata:
  annotations:
    dev.azure.com/project-repo: my-project/my-repo
```
