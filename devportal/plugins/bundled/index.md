---
sidebar_position: 0
sidebar_label: Bundled Plugins
title: Bundled Plugin Catalog
---

DevPortal 3.x ships 20 digest-pinned OCI plugins baked into the portal image. They install from the default plugin file (`dynamic-plugins.veecode.yaml`) without any entry in your values: 18 are enabled by default and 2 ship disabled. The [production setup guide](../../installation-guide/production-setup/setup.md#what-ships-by-default) lists the same set from the install side.

## Default plugins

| Plugin | Status | Page |
|---|---|---|
| RHDH stock home page (superseded by the VeeCode home page) | Disabled | No page |
| [VeeCode home page](./homepage.md) | Enabled | [Homepage](./homepage.md) |
| [Global header and sidebar ordering](./global-header.md) | Enabled | [Global Header](./global-header.md) |
| [RBAC screens](./rbac.md) | Enabled (permission checks are off by default) | [RBAC](./rbac.md) |
| Legacy VeeCode theme (superseded by app-config branding) | Disabled | No page |
| [About page](./about.md) | Enabled | [About](./about.md) |
| About backend | Enabled | [About](./about.md) |
| Extensions catalog provider (Marketplace loop) | Enabled | [Marketplace](./marketplace.md) |
| Marketplace backend | Enabled | [Marketplace](./marketplace.md) |
| Pending-changes install indicator | Enabled | [Pending Changes](./pending-changes.md) |
| Marketplace UI at `/marketplace` | Enabled | [Marketplace](./marketplace.md) |
| TechDocs frontend | Enabled | [TechDocs](../techdocs.md) |
| TechDocs backend | Enabled | [TechDocs](../techdocs.md) |
| TechDocs add-ons | Enabled | [TechDocs](../techdocs.md) |
| [Notifications frontend](./notifications.md) | Enabled | [Notifications](./notifications.md) |
| Signals frontend (notifications transport) | Enabled | No page |
| Notifications backend | Enabled | [Notifications](./notifications.md) |
| Signals backend | Enabled | No page |
| [Tech Radar frontend](./tech-radar.md) | Enabled | [Tech Radar](./tech-radar.md) |
| Tech Radar backend | Enabled | [Tech Radar](./tech-radar.md) |

To turn off an enabled default plugin, add an override entry with the `{{inherit}}` tag and the full `!<plugin path>` part, plus `disabled: true`, as described in [Adding Plugins](../adding.md). Each plugin page below gives the override reference.

## Plugins that moved to Marketplace

These pages from the 2.x bundled set are not default plugins in 3.x. They install from Marketplace or through a plugin entry:

- [Azure DevOps](./azure-devops.md): Marketplace plugin `azure-devops`.
- [GitHub Actions](./github-actions.md): Marketplace plugin `github-actions`.
- [Jenkins](./jenkins.md): Marketplace plugin `backstage-community-plugin-jenkins`.

For plugins not listed here (Grafana, SonarQube, Kubernetes, and others), see [Finding Plugins](../finding.md) and [Adding Plugins](../adding.md). Grafana is an installable package in the default plugin index but has no Marketplace card on 3.0.3: enable it with a plugin entry and set `grafana.domain` before the portal starts. The Vault plugin is not available in 3.x at all; see [Backstage Plugins](../plugins.md#plugins-that-are-not-available-in-3x).
