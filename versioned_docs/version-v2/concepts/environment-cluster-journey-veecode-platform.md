---
sidebar_position: 5
sidebar_label: Environment Cluster Journey by Veecode Platform
title: Environment Cluster Journey by Veecode Platform
---

Welcome to the Environment Cluster journey. This guide explains the purpose of this approach and how to use it.

# Environment Cluster Journey by Veecode Platform

Our environment cluster journey is designed to make the development process more dynamic and independent. Once the DevOps team has set up the environments and the types of clusters available, developers can deploy their applications swiftly and accurately.

## How It Works

Both **Environments** and **Clusters** are modeled as `Resource` entities in the Software Catalog. The journey works as follows:

1. **Environment Creation:** The DevOps team manually inserts an Environment entity into the catalog. An environment stores configuration and credential references: network settings, environmental variables, service access credentials, and more. Environments are currently registered manually via a `catalog-info.yaml` with `kind: Resource` and `spec.type: environment`.

2. **Cluster Configuration:** A Cluster is a `Resource` entity that references an environment. Clusters are typically created via a scaffolder IaC template — the template uses the environment's configuration as input (network, region, credentials) and applies cluster-specific parameters (name, machine size, repository). Once the template runs, the cluster entity is registered in the catalog.

3. **Application Deployment:** With environments and clusters in the catalog, developers can reference them in software templates and deploy their applications to the correct target infrastructure.

This approach creates a clear separation of concerns: the DevOps team controls environment and cluster definitions; developers consume them self-service.

Because environments and clusters are catalog entities, they inherit everything the catalog provides — ownership, RBAC, search, and annotations. The same composition model that wires a `Component` to its CI plugin can wire a `Resource` (cluster) to a Grafana dashboard for cluster-level observability. See [Composing a Portal](./portal-composition.md).

**Summary:** Environments are utilized by clusters, and clusters provide the infrastructure for deploying final projects.

---

## Using Cluster Templates

The steps below describe the general flow for creating a cluster via a scaffolder template. The exact fields depend on the specific template your organization has published.

1. **Prepare your environment:** Before you start, make sure you have an environment `Resource` entity registered in the catalog.
2. **Access DevPortal:** Log in and select **"Create"** from the sidebar menu.
3. **Choose a cluster template:** Select the cluster provisioning template relevant to your target infrastructure.
4. **Select Environment:** Choose the desired environment from the available resources, then proceed.
5. **Configure cluster parameters:** Fill in resource-specific fields (machine size, region, network settings, etc.) as required by the template.
6. **Set up the repository:** Select your Git provider, specify the owner, and name the repository the template will create. Set repository visibility.
7. **Review and Create:** Review all the information, then click **"Create"**.
8. **Monitor the pipeline:** The scaffolder creates the repository and triggers a CI/CD pipeline. Monitor progress in the scaffolder log view. Ensure all required secrets (cloud credentials, tokens, etc.) are configured in your CI/CD environment before the pipeline runs.
9. **Locate the cluster in the catalog:** Once the pipeline completes and the entity is registered, navigate to the **Catalog**, filter by `Kind: Resource`, and look for your cluster by name.

:::info
There is no dedicated "Resources > Clusters" sidebar entry. Clusters and environments appear in the standard Catalog view — filter by `Kind: Resource` or use the search to find them.
:::

:::warning
Make sure all required CI/CD secrets (e.g., cloud provider credentials) are set before initiating the pipeline. Missing secrets will cause the pipeline to fail.
:::

If you encounter any issues, refer to the platform's documentation or reach out to the support team.
