---
sidebar_position: 1
sidebar_label: Customizing DevPortal
title: Customizing DevPortal
---

VeeCode DevPortal follows Backstage's standards for customizing the UI and adds a few extra options:

- **Simple branding:** there is an entire branding section under `app.branding` in the app configuration that lets you pick one of the pre-defined theme variants and its light/dark options, allowing you to customize every aspect of the theme. Place these settings in `app-config.local.yaml` (mounted at `/app/app-config.local.yaml`).

- **Theme overrides via environment variables:** the `THEME_CUSTOM_JSON` and `THEME_DOWNLOAD_URL` environment variables allow low-level JSON overrides of the internal theme file — see [Theme overrides](./theme-hack.md) for details. For most use cases, the `app.branding.theme.*` mechanism above is sufficient and preferred.

- **Custom home page plugin:** the entire home page can be customized by replacing the default homepage dynamic plugin with your own. See [Custom home plugin](./custom-home.md).

- **Custom header plugin:** the header shared by all pages can also be customized as a dynamic plugin. See [Custom header plugin](./custom-header.md).

:::note
The custom home and custom header techniques described in those pages apply equally in V2. Any V2-specific differences (preset wiring, OCI references) are noted inline on each page.
:::

Usually the branding option is all you need to customize the look and feel of your DevPortal. If you need to go beyond that, you can use the custom theme hacking option or even create a custom plugin if you are feeling brave.
