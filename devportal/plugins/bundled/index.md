---
sidebar_position: 0
sidebar_label: Bundled Plugins
title: Bundled Plugin Catalog
---

# Bundled Plugin Catalog

DevPortal ships with a set of **preinstalled dynamic plugins** baked into the distro image. They are available immediately — no download or rebuild needed. Most are **disabled by default** and are enabled by adding an entry to `dynamic-plugins.yaml` (or via the Marketplace).

A few core plugins (`preInstalled: true` in `dynamic-plugins.yaml`) are always loaded — they power the UI shell, navigation, and marketplace itself.

Think of this catalog in terms of capability layers, not a flat install list. The always-on plugins establish the shell. The disabled-by-default plugins represent operational capabilities — CI/CD visibility, infrastructure observability, code quality — that your team activates based on what context-switches it wants to eliminate. Each plugin connects to a service entity via an annotation; the right question before enabling any plugin is "which entities will carry this annotation, and what does it replace for their developers?" See [Composing a Portal](/devportal/concepts/portal-composition) for the full three-layer model.

---

## Always-on plugins (preInstalled, no YAML entry needed)

These plugins are extracted into the image at build time with `preInstalled: true` and are active on every boot regardless of preset selection.

| Plugin | Package | What it does |
|---|---|---|
| [Homepage](./homepage.md) | `veecode-platform-plugin-veecode-homepage-dynamic` | Customizable landing page at `/` |
| [Global Header](./global-header.md) | `veecode-platform-plugin-veecode-global-header-dynamic` | Unified top navigation bar (search, notifications, profile) |
| [About](./about.md) | `veecode-platform-backstage-plugin-about-dynamic` + `veecode-platform-backstage-plugin-about-backend-dynamic` | DevPortal version and instance info at `/about` |
| Catalog Extensions Module | `red-hat-developer-hub-backstage-plugin-catalog-backend-module-extensions` | Registers Extension/Package/Collection entity kinds; reads `extensions-install.yaml` |

---

## Enabled by the `recommended` preset

These plugins are in the bundled catalog with `disabled: true` and are activated when the `recommended` preset is included in `VEECODE_PRESETS`. They are not unconditionally on.

| Plugin | Package | What it does |
|---|---|---|
| [RBAC](./rbac.md) | `backstage-community-plugin-rbac` | Role-based access control UI at `/rbac` |
| [Tech Radar](./tech-radar.md) | `backstage-community-plugin-tech-radar` + `backstage-community-plugin-tech-radar-backend` | Technology adoption radar at `/tech-radar` |
| [Marketplace](./marketplace.md) | `devportal-marketplace-frontend-dynamic` + `devportal-marketplace-backend` | In-portal plugin discovery and enable/disable UI at `/marketplace` |
| [Pending Changes](./pending-changes.md) | `devportal-pending-changes-dynamic` | Header badge indicating pending restart when plugins are enabled/disabled via Marketplace |

---

## Disabled-by-default plugins (bundled, require enabling)

| Plugin | Package | What it does |
|---|---|---|
| [Kubernetes](../kubernetes.md) | `backstage-plugin-kubernetes` | Kubernetes workload viewer on entity pages |
| [GitHub Actions](./github-actions.md) | `backstage-community-plugin-github-actions` | GitHub Actions run history on entity CI tab |
| [Azure DevOps](./azure-devops.md) | `backstage-community-plugin-azure-devops` | Azure Pipelines and Pull Requests on entity pages |
| [Jenkins](./jenkins.md) | `backstage-community-plugin-jenkins` + `backstage-community-plugin-jenkins-backend` | Jenkins build status on entity CI tab |
| [SonarQube](../Sonar.md) | `backstage-community-plugin-sonarqube` + `backstage-community-plugin-sonarqube-backend` | Code quality metrics on entity overview and Code Quality tab |
| Security Insights | `roadiehq-backstage-plugin-security-insights` | GitHub Dependabot alerts and security advisories |
| GitHub Insights | `roadiehq-backstage-plugin-github-insights` | GitHub code insights on entity pages |
| Global FAB | `red-hat-developer-hub-backstage-plugin-global-floating-action-button` | Configurable floating action button |

---

## OCI-only plugins (not in distro image, enable via dynamic-plugins.yaml)

These must be downloaded at startup from `quay.io/veecode`. See [Adding Plugins](../adding.md) for configuration details.

| Plugin | OCI Reference |
|---|---|
| MCP Actions Backend | `oci://quay.io/veecode/backstage:bs_1.49.4!backstage-plugin-mcp-actions-backend` |
| MCP Catalog Extras | `oci://quay.io/veecode/mcp-integrations:bs_1.49.4!red-hat-developer-hub-backstage-plugin-software-catalog-mcp-extras` |
| MCP TechDocs Extras | `oci://quay.io/veecode/mcp-integrations:bs_1.49.4!red-hat-developer-hub-backstage-plugin-techdocs-mcp-extras` |
| MCP Scaffolder Extras | `oci://quay.io/veecode/mcp-integrations:bs_1.49.4!red-hat-developer-hub-backstage-plugin-scaffolder-mcp-extras` |
| MCP Chat Backend | `oci://quay.io/veecode/mcp-chat:bs_1.49.4!backstage-community-plugin-mcp-chat-backend` |
| MCP Chat Frontend | `oci://quay.io/veecode/mcp-chat:bs_1.49.4!backstage-community-plugin-mcp-chat` |
| GitLab Pipelines | `oci://quay.io/veecode/gitlab:bs_1.48.4!immobiliarelabs-backstage-plugin-gitlab` |

---

For plugins not listed here (Grafana, Vault, Tech Insights, and others), see [Finding Plugins](../finding.md) and [Adding Plugins](../adding.md).
