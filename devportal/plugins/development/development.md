---
sidebar_position: 0
sidebar_label: Plugin Development
title: Plugin Development
---

Plugin development is how you add functionality to your DevPortal instance. The kind of project you create depends on the kind of plugin you want to create:

- **Frontend plugin:** React pages, cards, and tabs that run in the portal UI. Start with [Example: Frontend Plugin](./frontend-plugin.md).
- **Backend plugin:** server-side APIs and integrations. Start with [Example: Backend Plugin](./backend-plugin.md).
- **Backend module:** code that extends an existing backend plugin, such as a [custom Scaffolder action](./custom-action.md).

In DevPortal 3.x you build all three inside a workspace in the public [devportal-plugins](https://github.com/veecode-platform/devportal-plugins) repository. Each workspace holds a Backstage development host for fast iteration plus one or more product packages under `plugins/`. The host exists for development only. DevPortal itself loads your plugin as a dynamic plugin, without rebuilding the portal.

The full path from an empty directory to a running plugin is:

1. [Set up a workspace](./bootstrap.md): install the required Node and Yarn versions, scaffold the workspace, and start the development host.
2. Build the plugin inside the workspace: a [frontend plugin](./frontend-plugin.md), a [backend plugin](./backend-plugin.md), or a [custom action](./custom-action.md).
3. [Make a frontend plugin appear](./wiring.md) through routes, menu items, and mount points in dynamic plugin configuration.
4. [Load the plugin locally](./loading.md): export the workspace and run it in devportal-local.
5. [Package and install](./packaging.md): publish the plugin as an OCI artifact and add a plugin entry.

Read [Basics](./basic.md) first for the required tool versions. [Creating Your Own Plugin](./creating-own-plugins.md) walks the whole loop in order, command by command.
