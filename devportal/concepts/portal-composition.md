---
sidebar_position: 2
sidebar_label: Composing a Portal
title: Composing a Portal
---

# Composing a Portal

A DevPortal installation is a service catalog and a way to create projects from templates. Teams register services, create new ones from templates, and browse the software landscape. Plugin composition lets developers see pod status, trigger deployments, check code quality, and browse dashboards from service pages. A 3.x portal combines four parts: the image with the core and default plugins, the chart, the catalog index image behind Marketplace, and the configuration fragments.

## The four parts of a 3.x portal

- **The image** ships the Backstage core with its static backend plugins (authentication, catalog, scaffolder, search, notifications) and the default plugin file (`dynamic-plugins.veecode.yaml`), which contains 20 digest-pinned OCI plugins, 18 enabled and 2 disabled. See [Dynamic Plugins](./dynamic-plugins.md).
- **The chart** (`devportal`) includes the default plugin file (`dynamic-plugins.veecode.yaml`) through `global.dynamic.includes`, adds operator plugins through the `global.dynamic.plugins` list, and carries operator configuration through `upstream.backstage.appConfig` and ordered `extraAppConfig` fragments. See [Configuration Hierarchy](./configuration-hierarchy.md).
- **The catalog index image** supplies the installable plugins shown in the Marketplace UI. Marketplace selections are stored in PostgreSQL and applied when the portal restarts with the installer.
- **The configuration fragments** set branding, authentication, catalog locations, and per-plugin backend settings. On the local stack you add a fragment as described in [Add a configuration fragment](../installation-guide/docker-local/custom-config.md).

## Three levels of composition

Every plugin activates across three layers. All three must be in place before a developer sees live data.

### 1. Load — the default plugin file, chart values, the operator file, or Marketplace

This controls which plugins are present at all. A plugin is loaded if any selection source includes it: the default plugin file (`dynamic-plugins.veecode.yaml`), a `global.dynamic.plugins` entry on Kubernetes, an operator plugin file entry on the local stack, or a Marketplace install. Enabling a plugin loads its code: UI components and backend routes become available. But nothing appears to the developer yet.

Some plugins need configuration values in a fragment before the portal starts. If the portal stops after a plugin change, read the backend logs and add the required settings first.

### 2. Context — entity annotations

Plugins are context-aware by design. They do not add global tabs. They add tabs and cards to specific catalog entities, and only when those entities carry the right annotation.

```yaml
# catalog-info.yaml
metadata:
  annotations:
    backstage.io/kubernetes-label-selector: 'app=my-service'
```

Without this annotation on the entity, the plugin is loaded but idle. With it, the matching tab appears on that entity only. A platform with dozens of services does not need every plugin visible on every entity: each service declares what it uses, and the portal shows only the plugins that belong to that service.

### 3. Backend — configuration fragments

The tab appears, but it needs to know where to fetch data from. The backend configuration provides that: cluster URLs and tokens, base URLs and API keys for each integration. Without it, the tab loads and shows an error or empty state. With all three layers in place, the tab displays live data.

### The diagnostic model

A plugin that fails to show data has failed at one of these three levels. Diagnose in layer order: load before context before backend, because each layer assumes the previous one succeeded.

| Symptom | Layer | Fix |
|---|---|---|
| Portal does not boot, or plugin absent on every entity | Load — install failed or plugin not enabled | Read the installer logs for install and skip lines; confirm the entry and its reference |
| Tab not visible on a specific entity | Context — annotation missing | Add the annotation to that entity's `catalog-info.yaml` |
| Tab visible, empty or error | Backend — configuration missing or unreachable | Check the fragments for the relevant integration, then credentials and reachability |

## The Day-0 to Day-2 progression

This is a deliberate sequence, not a checklist you complete once.

### Day-0: Foundation

Catalog populated: services, APIs, and resources registered through catalog locations. Authentication configured through the auth fragment. Guest sign-in is on by default and signs everyone in as the admin user, which is for evaluation only.

### Day-1: Connecting services to their tooling

Enable plugins through chart values, the operator file, or Marketplace. Add annotations to catalog entities: each annotation is a claim that an entity owns a workload, a project, or a dashboard. Configure backends in the fragments.

### Day-2: The operational hub

Developers operate services without leaving the portal: CI tabs show pipeline status alongside the service entity, Kubernetes tabs show pod health, and code quality tabs show analysis results.

The 2.x [environment and cluster journey](/devportal/v2/concepts/environment-cluster-journey-veecode-platform) relied on VeeCode plugins that 3.x does not ship, neither as default plugins nor in the Marketplace.

## References

- [Backstage software catalog](https://backstage.io/docs/features/software-catalog/) — entity model and annotations.
- [Dynamic Plugins](./dynamic-plugins.md) — the load layer in detail.
- [Configuration Hierarchy](./configuration-hierarchy.md) — the backend layer in detail.
