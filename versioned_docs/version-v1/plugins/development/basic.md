---
sidebar_position: 4
sidebar_label: Basics
title: Basics & Prerequisites
---

The same requirements for Backstage development described in the [Backstage documentation](https://backstage.io/docs/getting-started/#prerequisites) apply to plugin development. Below are the most important ones:

- Node.js current LTS version (we recommend using `nvm` to manage it).
    - Install `nvm` from [here](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating).
- Yarn version 4.4.1.
    - Enable Corepack: `corepack enable`, then set Yarn: `yarn set version 4.4.1`.
- Git
- A proper IDE (for example, VS Code).

## Plugin guidelines

A few critical points to consider when developing plugins:

- Write plugin code in TypeScript.
- Plan your project structure and folders to accelerate the development process.
- Develop plugins alongside a vanilla Backstage repo that loads the plugin statically (as a local package).
- Release plugins as npm packages (one static, one dynamic).
- Avoid reinventing the wheel—check if a plugin already does what you need.
- Build your UI with [Backstage components](https://backstage.io/storybook/) and [Material UI](https://mui.com/material-ui/).

## Official documentation

The official Backstage documentation provides useful information on plugin development. We recommend reading it to gain a better understanding of the process.

- [Backstage Introduction to plugins](https://backstage.io/docs/plugins/)
- [Backstage Design Guidelines](https://backstage.io/docs/dls/design)
- [Backstage Plugin Development](https://backstage.io/docs/plugins/plugin-development)
- [Backstage Plugin Structure](https://backstage.io/docs/plugins/structure-of-a-plugin)

:::important
Backstage frontend and backend systems have changed considerably over time. You may find outdated documentation in many places, as well as legacy plugins that work but do not adapt to the new systems or function as dynamic plugins.
:::

## VeeCode Plugin Development

Continue reading our documentation to learn how to develop plugins for VeeCode DevPortal—the instructions are largely portable to any custom-built Backstage as well. Note that VeeCode DevPortal uses the same approach as Red Hat for dynamic plugins, so RHDH documentation may also be applicable.

## Red Hat plugin development

Much of the RHDH (Red Hat Developer Hub) documentation on plugins is applicable to VeeCode DevPortal plugin development; however, we embed (pre-install) a different set of plugins in DevPortal container images.

- [RHDH: Introduction to plugins](https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.7/html/introduction_to_plugins/index) — brief introduction to plugins.
- [RHDH: Front-end plugin wiring](https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.7/html/installing_and_viewing_plugins_in_red_hat_developer_hub/assembly-front-end-plugin-wiring.adoc_rhdh-extensions-plugins) — how to wire plugins to the Backstage frontend (compatible with VeeCode DevPortal).
- [RHDH: Installing dynamic plugins using the Helm chart](https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.7/html/installing_and_viewing_plugins_in_red_hat_developer_hub/rhdh-installing-rhdh-plugins_title-plugins-rhdh-about#con-install-dynamic-plugin-helm_rhdh-installing-rhdh-plugins) — similar to VeeCode DevPortal dynamic plugin syntax.
- [RHDH: Dynamic plugin examples](https://github.com/redhat-developer/rhdh/blob/main/docs/dynamic-plugins/examples.md) — you can build and install these in DevPortal (or use them as a reference).
- [RHDH: Plugins repository](https://github.com/redhat-developer/rhdh-plugins) — a long list of Red Hat plugins that you may also package and install in DevPortal (or ask us to include in our next release by opening a GitHub issue).
