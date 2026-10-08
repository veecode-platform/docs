---
sidebar_position: 1
sidebar_label: Customizing DevPortal
title: Customizing DevPortal
---

DevPortal ships with the VeeCode brand applied through native Red Hat Developer Hub settings. Change the look and feel with these pages:

- **Brand and colors:** [Simple branding](./branding.md) sets the title, logos, logo width, and the light and dark theme palettes through `app.branding`. Start here; it covers most branding needs.
- **Theme palettes:** [Custom theme](./custom-theme.md) explains the `app.branding.theme` structure both modes share and what the disabled legacy theme plugin means for you.
- **Home page:** [Custom home plugin](./custom-home.md) configures or replaces the default home page.
- **Header:** [Custom header plugin](./custom-header.md) changes the shared header and sidebar menu items.

On the local stack, each change is a configuration fragment that loads last in the `--config` chain, as described in [Add configuration to the local stack](../installation-guide/docker-local/custom-config.md). On Kubernetes, each change is chart values, as described in [Set up DevPortal on a cluster](../installation-guide/production-setup/setup.md). A later file wins over an earlier one, and a list in a later file replaces the same list instead of merging with it, so restate every list entry you want to keep.
