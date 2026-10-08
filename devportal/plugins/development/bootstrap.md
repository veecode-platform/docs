---
sidebar_position: 6
sidebar_label: Bootstrap
title: Bootstrapping a Plugin Project
---

This guide walks you through setting up a plugin workspace from scratch. The starting point is a named workspace in the public [devportal-plugins](https://github.com/veecode-platform/devportal-plugins) repository. The workspace renders a Backstage development host, creates the plugin package, and pins every `@backstage/*` dependency to the DevPortal host line.

You will later export the plugin as a dynamic plugin and load it in a DevPortal instance.

## Check the tool versions

Each workspace declares Node `22 || 24` and Yarn `4.12.0`. Confirm yours match before you scaffold:

```bash
node --version
yarn --version
```

If Yarn is not configured, run `corepack enable` first.

## Clone the plugin repository

```bash
git clone https://github.com/veecode-platform/devportal-plugins.git
cd devportal-plugins
```

## Scaffold a workspace

Create a workspace with a name and a role. The role sizes the development host to the plugin you plan to build:

```bash
yarn create-workspace my-workspace --role frontend-plugin
```

Use `--role frontend-plugin` for UI plugins and `--role backend-plugin` for server-side plugins and Scaffolder action modules. The command renders the workspace shell from the template, runs `yarn install`, creates the product package with the official Backstage template for the role, pins the Backstage dependencies to the host line, and formats the tree. It needs network access and takes a few minutes.

Move into the workspace and start the Backstage development host to validate the baseline works:

```bash
cd workspaces/my-workspace
yarn start
```

This starts the host the workspace generated. Keep it running in a terminal while developing. Each generated workspace ships an `AGENTS.md` with its exact commands; follow it from here on.

:::important
Version the workspace so you can maintain it over time. Make the project intent clear in the README file to help future onboarding.
:::

## Scaffold more packages inside the workspace

To add another plugin to an existing workspace, use the Backstage package creator from the workspace root:

```bash
yarn new --select frontend-plugin-legacy --option pluginId=my-front-plugin
yarn new --select backend-plugin --option pluginId=my-back-plugin
yarn new --select scaffolder-backend-module --option moduleId=my-scaffold-plugin
```

The workspace app uses the legacy frontend system, so `yarn new` offers `frontend-plugin-legacy` for UI plugins.

Each created plugin lands as a new package under `plugins/`. Product code stays under `plugins/`; `packages/app` and `packages/backend` hold only the development host and are never published.

## Stay on the host Backstage line

Every workspace carries a `backstage.json` that declares the Backstage version it tracks. That version follows the DevPortal host: a workspace may lag behind the host, but it must never lead it. Do not upgrade `@backstage/*` dependencies past the host line, and do not scaffold from a generic latest Backstage app, which drifts away from the versions DevPortal runs.

- Rename the `@internal/...` prefix for your plugin to a name you control in your package registry (like `@myorg/...`). Do not use `@internal/...` if you plan to publish the plugin later on.
- Run `yarn start` at the workspace root to start the development host with all plugins.
- Edit your plugin sources under `plugins/<your-plugin>/src`.
- Run `yarn tsc` for the TypeScript check and `yarn build:all` to build all packages.

## Next steps

Proceed to the next steps based on the type of plugin you created: a [frontend plugin](./frontend-plugin.md), a [backend plugin](./backend-plugin.md), or a [custom action](./custom-action.md). [Creating Your Own Plugin](./creating-own-plugins.md) shows how the steps fit into one loop, and [Packaging your Plugin](./packaging.md) covers distribution.

## Troubleshooting tips

- If the workspace host drifts from the current Backstage version, update it following the "[Keeping Backstage Updated](https://backstage.io/docs/getting-started/keeping-backstage-updated)" guide, without going past the DevPortal host line.

## References

- Backstage: Create an app — https://backstage.io/docs/getting-started/create-an-app
- Backstage: Plugin development — https://backstage.io/docs/plugins/plugin-development
