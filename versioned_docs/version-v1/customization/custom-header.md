---
sidebar_position: 8
sidebar_label: Custom header plugin
title: Custom header plugin
---

Similarly to "home" plugin customizations, the shared Backstage header can also be customized as a dynamic plugin.

The default header ships as package `veecode-platform-plugin-veecode-global-header-dynamic` (preinstalled, enabled by default). It uses the `application/header` mount point with `position: above-main-content`, and exposes sub-mount-points for injecting custom components into the header bar (`global.header/component`, `global.header/profile`).

## Source code

The source code for the current DevPortal header plugin is at [VeeCode Header Plugin](https://github.com/veecode-platform/devportal-plugins/tree/main/workspace/global-header)

## RHDH Header docs

The VeeCode header plugin is based on the RHDH header plugin, so you can refer to the [RHDH Header docs](https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.7/html/customizing_red_hat_developer_hub/configuring-the-global-header-in-rhdh) for more information on mount points and customization patterns.
