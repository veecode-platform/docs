---
sidebar_position: 0
sidebar_label: Plugins
title: Backstage Plugins
---

Plugins are how the portal becomes useful beyond day-zero setup. The base DevPortal gives you a service catalog and software templates. Plugins turn it into a central hub where teams operate their services: checking deployments, tracking pipelines, and reading code quality without leaving the portal.

VeeCode DevPortal is built on top of [Backstage](https://backstage.io/) and every plugin it runs is a dynamic plugin: no rebuild of the portal image is needed to add, remove, or configure one.

## Plugin Types

Backstage plugins contribute functionality to the backend, the frontend, or as modules that extend other plugins.

| Category | Runtime/Scope | What it is | Typical Features |
| --- | --- | --- | --- |
| Backend plugins | Backstage backend runtime | Packages that provide service factories and feature loaders; can be extended with backend modules | Expose routes, background tasks, catalog processors; connect to external services |
| Frontend plugins | Backstage frontend runtime | React-based packages that register routes and components | Render UI (routes, pages, cards, widgets); may pair with backend plugins; can work purely client-side |
| Backend modules | Backstage backend runtime (as extensions) | Specialized backend packages that extend existing plugins or portal behavior | Add catalog processors, scaffolder actions, or other composable extensions; keep core plugins lean |

### Backend plugins

Backend plugins provide server-side capabilities that run within the Backstage backend runtime. A backend plugin is delivered as a package that provides one or more service factories and feature loaders, and can be extended with backend modules when needed. Backend plugins expose routes, background tasks, or catalog processors, and connect to external services.

### Frontend plugins

Frontend plugins provide client-side capabilities that run within the Backstage frontend runtime. A frontend plugin renders portal UI (routes, pages, cards, widgets) and is implemented as a React-based package that registers routes and components with the app. Frontend plugins often pair with a backend plugin for APIs, but can work purely client-side when appropriate.

### Backend modules

Backend modules are specialized backend packages that extend portal behavior. A module extends an existing plugin or some generic portal behavior (for example, adding extra catalog processors to the `catalog` plugin, or new actions to the `scaffolder`). Modules let you keep the core plugin lean while enabling optional, composable extensions.

## How plugins load in 3.x

DevPortal 3.x loads every plugin as a dynamic plugin when the portal starts. There are two sources, layered on top of each other:

1. The default plugins: 20 digest-pinned OCI plugins baked into the portal image and listed in the default plugin file (`dynamic-plugins.veecode.yaml`), wired in through the chart's `global.dynamic.includes`. 18 are enabled and 2 ship disabled. See the [Bundled Plugin Catalog](./bundled/index.md).
2. Your additions: entries under the chart's `global.dynamic.plugins`, which only add to the default plugins and never replace them, plus Marketplace selections stored in PostgreSQL. See [Adding Plugins](./adding.md).

The installer matches an override entry to a default plugin by registry, repository, and the plugin path after `!`; the tag or digest is not part of the match. A tag or digest in an override sets that version, so a stale digest pins an older artifact. To disable or reconfigure a default plugin while keeping the version the default plugin file pins, use the `{{inherit}}` tag with the full `!<plugin path>` part: `oci://quay.io/veecode/<repository>:{{inherit}}!<plugin path>`. In chart values write the tag as `{{ "{{inherit}}" }}`, because the chart renders that list as a template. In the local stack's operator plugin file write `{{inherit}}` as is. An override's `pluginConfig` replaces the default plugin's whole `pluginConfig` (no merge); copy the complete block and edit values in place. See [Adding Plugins](./adding.md) for the Kubernetes and local-stack forms.

## Default plugins and Marketplace

[Default plugins](./bundled/index.md) ship in the image and need no download: the home page, the global header, the About page, Marketplace with the Extensions catalog provider, TechDocs, Notifications with Signals, Tech Radar, and the RBAC screens. Each bundled page names whether its plugin is a default plugin and gives the override reference for disabling it.

[Marketplace](./bundled/marketplace.md) is the in-portal plugin store; the sidebar item **Marketplace** opens the **Extensions** page at `/marketplace`. It reads the plugin catalog index image configured with the chart's `global.catalogIndex.image`, which on 3.0.3 lists 71 installable plugins. See [Finding Plugins](./finding.md).

## Plugin pages and plugin development

Each plugin page in this section explains what the plugin adds, how to install or disable it, the configuration it needs, and the catalog annotations it reads. Pages for Azure DevOps, GitHub Actions, and Jenkins describe Marketplace plugins; the remaining bundled pages describe default plugins.

To write your own plugin, see [Plugin development](./development/development.md). To install a plugin on a Kubernetes install or on the local stack, see [Adding Plugins](./adding.md).

## Plugins that are not available in 3.x

The Vault plugin is not available in 3.x. No Vault package is among the default plugins or in the Marketplace. See the [2.x Vault plugin](/devportal/v2/plugins/vault).
