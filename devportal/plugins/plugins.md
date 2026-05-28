---
sidebar_position: 0
sidebar_label: Plugins
title: Backstage Plugins
---

Plugins are how the portal becomes useful beyond Day-0 setup. The base DevPortal gives you a service catalog and a template runner — plugins are what turn it into a central hub where teams actually operate their services: checking deployments, tracking pipelines, monitoring code quality, without leaving the portal.

VeeCode DevPortal is built on top of [Backstage](https://backstage.io/) and ships with a set of bundled plugins ready to enable. Understand what each plugin adds before enabling it — the value is in the workflow it removes, not in the YAML you write.

Before choosing which plugins to enable, read [Composing a Portal](/devportal/concepts/portal-composition) — it explains the three-layer activation model (load → annotation → backend) and maps plugin combinations to operational use cases.

## Plugin Types

Backstage’s extensibility model is built around plugins that can contribute functionality either to the backend, the frontend, or as modules that extend other plugins or backend components (such as the scaffolder). VeeCode DevPortal extends this model to support dynamic plugins with reasonable defaults.

| Category | Runtime/Scope | What it is | Typical Features |
| --- | --- | --- | --- |
| Backend plugins | Backstage backend runtime | Packages that provide service factories and feature loaders; can be extended with backend modules | Expose secure routes, background tasks/schedulers, catalog processors; connect to external services; primary way to extend platform capabilities |
| Frontend plugins | Backstage frontend runtime | React-based packages that register routes and components | Render UI (routes, pages, cards, widgets); may pair with backend plugins; can work purely client-side |
| Backend modules | Backstage backend runtime (as extensions) | Specialized backend packages that extend existing plugins or DevPortal behavior | Add catalog processors, scaffolder actions, or other composable extensions; keep core plugins lean |

### Backend plugins

Backend plugins provide server-side capabilities that run within the Backstage backend runtime. A backend plugin is:

  - Delivered as a package that provides one or more service factories and feature loaders, and can be extended with backend modules when needed.
  - Expose as a secure route, background task/scheduler or catalog processors.
  - Is the key component in Backstage to extend any platform capabilities by connecting to external services.

### Frontend plugins

Frontend plugins provide client-side capabilities that run within the Backstage frontend runtime. A frontend plugin is:

  - Rendered as DevPortal UI (routes, pages, cards, widgets).
  - Implemented as React-based packages that register routes and components with the app.
  - Often pair with a backend plugin for APIs, but can work purely client-side when appropriate.

### Backend modules

Backend modules are specialized backend packages that extend DevPortal behavior.

  - It extends an existing plugin or some generic DevPortal behavior (for example, adding extra catalog processors to the `catalog` plugin, or new actions to the `scaffolder`).
  - Modules let you keep the core plugin lean while enabling optional, composable extensions.

## Plugin Loading Strategies

There are two primary ways to load plugins in a Backstage-based portal:

| Strategy | Build vs Runtime | Frontend handling | Backend handling | Pros | Cons |
| --- | --- | --- | --- | --- | --- |
| Static loading (traditional Backstage) | Build-time | Added to `packages/app`, routes/components wired in code; changes require rebuild/redeploy | Added to backend package and registered in composition; changes require restart/redeploy | Predictable, version-locked, simpler supply chain | Slower iteration; engineering involvement for each update |
| Dynamic loading (VeeCode/RHDH supported) | Runtime (during DevPortal start) | Discovered/loaded from a plugin registry or manifest without rebuilding | Enabled via configuration; loaded by backend composition; activation on restart or hot-reload | Faster iteration; easy trials; enable/disable flows; marketplace-like experience | Requires runtime-safe packaging and clear compatibility constraints |

### Static loading (traditional Backstage)

  - Plugins are compiled into the application at build time.
  - Frontend: added to `packages/app` and wired into the app routes; any change requires a rebuild/redeploy.
  - Backend: added to the backend package, registered in the backend builder/composition; changes usually require a restart/redeploy.
  - Pros: predictable, version-locked, simple supply chain; Cons: slower iteration, requires engineering involvement for each update.

### Dynamic loading (as supported by VeeCode and RHDH)

  - Frontend dynamic plugins can be discovered and loaded at runtime from a plugin registry or manifest, without rebuilding the app.
  - Backend dynamic plugins/modules can be enabled via configuration and loaded by the backend composition, with activation on restart or hot-reload depending on the platform.
  - Pros: faster iteration, easier trials and enable/disable flows, marketplace-like experience; Cons: requires a runtime-safe packaging and clear compatibility constraints.

### Why dynamic plugins?

By providing a dynamic plugin system any organization can extend DevPortal funcionality without the need to rebuild an entire Backstage distro. This is a key feature for VeeCode DevPortal and Red Hat Developer Hub that allows little friction for customers that want to try or develop new features or enable/disable plugins as needed.

### Choosing between static and dynamic

- Picking ready-to-use dynamic plugins is the best option for customers that do not want to spend engineers time to build and maintain plugins.
- VeeCode Admin-UI will provide a marketplace-like experience for customers to discover and install plugins (under development).
- You are still capable of building static plugins if you want to, but going this path will create friction for each DevPortal upgrade.

## Plugin Distribution Strategies

### Bundled plugins

Bundled plugins are plugins that are distributed as part of the DevPortal distro. They are typically used for plugins that are part of the core functionality of the distro.

**Bundled static plugins** are statically linked to DevPortal as a part of its build process as a regular project dependency (this is the common approach for "vanilla" Backstage plugins).

Example: TechDocs plugin.

**Bundled dynamic plugins** are not linked to DevPortal as a part of its build process, but stored in a "dynamic-plugins" folder included in DevPortal distro. DevPortal configuration can be set to load these plugins at start time. These plugins can also be referred as "pre-installed plugins".

Examples of always-active preInstalled plugins: VeeCode Homepage, Global Header, RBAC, Tech Radar, About, Marketplace, and Pending Changes.

Examples of bundled-but-disabled plugins: Kubernetes, GitHub Actions, Azure DevOps, Jenkins, SonarQube, GitHub Workflows.

For the complete list with package names and enable instructions, see the [Bundled Plugin Catalog](./bundled/index.md).

### Downloaded plugins

Downloaded plugins are dynamic plugins that are downloaded from a plugin registry or manifest at start time, without rebuilding the app. They are typically used for plugins that are **not** part of the core functionality of the distro but are generally available in a reliable way.

VeeCode DevPortal supports downloading plugins from:

- A npm registry (public or private)
- A generic OCI registry
