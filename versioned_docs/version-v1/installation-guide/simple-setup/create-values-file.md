---
sidebar_position: 4
sidebar_label: Create a "values" file
title: Create a values.yaml file
---

## Helm values file

Create a `values.yaml` in a safe place where you can keep it (and share with other admins).

:::tip
Note that the official Backstage chart is a subchart of VeeCode DevPortal chart, referenced as "upstream" on the values file. This means that you can refer to [Backstage Helm chart repo](https://github.com/backstage/charts/tree/main/charts/backstage) for more information on its fields and behaviour.
:::

### Backstage appConfig

It is also worth noticing that both Backstage and VeeCode DevPortal main configuration are the same `app-config.yaml` file mentioned all over [Backstage documentation](https://backstage.io/docs/), so usually any settings you find on Backstage or in a plugin documentation are usually valid for VeeCode DevPortal as well - after all VeeCode DevPortal is a Backstage distribution.

The whole content of the `app-config.yaml` file is rendered by the Helm chart installation and can be coded on the `values.yaml` file under `upstream.backstage.appConfig` (just as defined on Backstage official Helm chart).

:::warning
Please understand that the resulting `app-config.yaml` file is a merge from what you define on the `values.yaml` file you provide with the default values from VeeCode DevPortal Helm chart. A lot of effort went into making these defaults easy to use and good to go from the start, but feel free to [revise the default values](https://github.com/veecode-platform/next-charts/blob/main/veecode-devportal-chart/values.yaml).
:::

### Minimal values file

The following minimal `values.yaml` is enough to get a running DevPortal instance:

```yaml
global:
  host: localhost
  protocol: http
  port: ':8000' # needs quotes, must start with ':' if not empty
upstream:
  enabled: true
  ingress:
    enabled: true
  backstage:
    appConfig:
      app:
        title: "Devportal Platform (minimal)"
```

This will deploy a functional DevPortal with sensible defaults. You can access it at `http://localhost:8000` (or whatever host/port you configure).

:::info
To enable authentication and full Git provider integration (GitHub, GitLab, etc.), see the [Auth & Integrations](/devportal/integrations) section. The values for those integrations should be added under `upstream.backstage.appConfig` in your `values.yaml` file.
:::

### About the Helm chart

Please check [Understand the Helm Chart](../understand-chart) for more information on the chart structure and available settings. You can also check the chart page on [ArtifactHub](https://artifacthub.io/packages/helm/veecode-platform-next/veecode-devportal).
