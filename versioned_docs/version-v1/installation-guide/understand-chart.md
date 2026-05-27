---
sidebar_position: 6
sidebar_label: Understand the Helm Chart
title: Understand the Helm Chart
---

VeeCode DevPortal Helm chart can be used to install and configure our Backstage distribution and a whole set of plugins to provide a full Internal Development Portal experience.

The chart is available on [ArtifactHub](https://artifacthub.io/packages/helm/veecode-platform-next/veecode-devportal) and is maintained in a dedicated [GitHub repository](https://github.com/veecode-platform/next-charts). The full default `values.yaml` is at [`veecode-devportal-chart/values.yaml`](https://github.com/veecode-platform/next-charts/blob/main/veecode-devportal-chart/values.yaml).

## Chart structure

The `veecode-devportal` chart wraps the official [Backstage Helm chart](https://github.com/backstage/charts/tree/main/charts/backstage) as a subchart, aliased as `upstream`. This means:

- All upstream Backstage chart values are available under the `upstream:` key.
- VeeCode-specific settings (routing shortcuts, plugin manifests, RBAC toggles) live at the top level alongside `upstream`.
- The `app-config.yaml` content you would normally write as a file maps directly to `upstream.backstage.appConfig` in `values.yaml`.

## Global settings

The `global` block is a VeeCode convenience layer. Setting these three values propagates them automatically into several Backstage config fields so you don't have to repeat yourself.

```yaml
global:
  host: yourhost.yourdomain.com # change to your domain
  protocol: https               # http or https
  port: ''                      # must start with ':' if not empty, e.g. ':8000'
```

These values are used as defaults for:

- `upstream.backstage.appConfig.app.baseUrl`
- `upstream.backstage.appConfig.backend.baseUrl`
- `upstream.backstage.appConfig.backend.cors.origin`
- `upstream.ingress.host`

## Application config (`upstream.backstage.appConfig`)

Everything that would normally go in `app-config.yaml` is placed here. The chart merges your values with the chart's built-in defaults, so you only need to override what differs from the defaults.

Example — setting the portal title and enabling an ingress:

```yaml
upstream:
  enabled: true
  ingress:
    enabled: true
  backstage:
    appConfig:
      app:
        title: "My DevPortal"
```

For auth providers, integrations, catalog providers, and plugin configuration, nest the relevant Backstage config keys under `upstream.backstage.appConfig`. For example:

```yaml
upstream:
  backstage:
    appConfig:
      integrations:
        github:
          - host: github.com
            token: ${GITHUB_TOKEN}
      auth:
        providers:
          github:
            development:
              clientId: ${GITHUB_AUTH_CLIENT_ID}
              clientSecret: ${GITHUB_AUTH_CLIENT_SECRET}
```

## Passing secrets

Tokens and secrets should never be hardcoded in `values.yaml`. Reference them as environment variables (`${MY_VAR}` syntax in `appConfig`) and supply the values via a Kubernetes Secret:

```yaml
upstream:
  backstage:
    extraEnvVarsSecret: devportal-secrets
```

```bash
kubectl create secret generic devportal-secrets \
  --namespace platform \
  --from-literal=GITHUB_TOKEN=<token>
```

## Ingress

TLS and ingress class are configured under `upstream.ingress`:

```yaml
upstream:
  ingress:
    enabled: true
    className: nginx   # or 'kong'
    annotations: {}
    tls:
      - secretName: devportal-tls
        hosts:
          - yourhost.yourdomain.com
```

## Dynamic plugins

Preinstalled VeeCode plugins ship as disabled and are activated at runtime via a plugin manifest. The chart key is:

```yaml
global:
  dynamic:
    includes:
      - dynamic-plugins.default.yaml
```

To enable a specific plugin, add it under the includes list or reference a custom manifest. See the [dynamic plugins documentation](/devportal/concepts/dynamic-plugins) for details.

## RBAC

The chart can create cluster roles automatically:

```yaml
createClusterRoles: true
```

DevPortal's built-in RBAC roles are `role:default/admin`, `role:default/developer`, and `role:default/viewer`. These are defined in `rbac-policy.csv` inside the image and extended by the distro's `rbac-policy-extensions.csv`.