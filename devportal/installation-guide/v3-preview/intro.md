---
sidebar_label: 3.x Preview
title: Install DevPortal 3.x (Preview)
---

:::warning Preview status
DevPortal 3.x is a preview. It is a minimal fork of [Red Hat Developer Hub](https://github.com/redhat-developer/rhdh); DevPortal 2.x remains the supported production line.
:::

The chart ships guest sign-in **enabled by default** and maps the guest identity to the `ADMIN` user (`user:default/admin`). That is useful for evaluation and dangerous for anything exposed to users. The single off-switch is `global.veecode.guestAuth.enabled: false`; after turning it off, configure a real authentication provider before exposing the portal.

## Before you install: set the host correctly

Getting `global.host` wrong is the highest-cost setup mistake: the portal can serve HTTP 200 for `/` while every route returns 404 because the frontend is trying to load its plugins from the wrong origin.

The chart's `rhdh.hostname` helper returns `global.host` literally, and the default app configuration renders both `app.baseUrl` and `backend.baseUrl` as `https://` followed by that hostname. Choose the values pattern that matches the endpoint:

- **Port-forward evaluation (supported preview path):** do not set `global.host`; use the appConfig overlay in Step 3, which sets `app.baseUrl`, `backend.baseUrl`, and `backend.cors.origin` to `http://localhost:7007`. The chart derives `https://<host>` from `global.host`, while a port-forward is plain HTTP, so all three URLs must say `http` explicitly.
- **Public TLS endpoint:** use the six-line values example in the TLS subsection below with a scheme-less `global.host`, such as `devportal.example.com`; the chart derives `https://devportal.example.com`.

The supported preview path below uses a local port-forward. Public Ingress exposure is described separately, but is not yet a supported preview scenario.

## Prerequisites

- A Kubernetes cluster
- Helm 3
- `kubectl`
- A PostgreSQL database provided by the customer; the chart deliberately ships no embedded database

## Step 1: Create the runtime Secret

Create the namespace and a Secret with the PostgreSQL connection values and the backend signing secret before installing the chart. Replace the placeholders with real values. `BACKEND_SECRET` should be a random string; the example uses the OpenSSL idiom used for this preview.

```bash
kubectl create namespace devportal --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic veecode-runtime-secrets \
  --namespace devportal \
  --from-literal=PG_HOST=<postgres-host> \
  --from-literal=PG_PORT=5432 \
  --from-literal=PG_USER=<postgres-user> \
  --from-literal=PG_PASSWORD=<postgres-password> \
  --from-literal=PG_DATABASE=<postgres-database> \
  --from-literal=BACKEND_SECRET="$(openssl rand -hex 16)"
```

## Step 2: Add the chart repository

```bash
helm repo add veecode https://veecode-platform.github.io/next-charts
helm repo update
helm search repo veecode/devportal --versions
```

The preview channel should list chart `0.1.0` with app version `3.0.0-beta.1`.

## Step 3: Install the preview

For the supported port-forward evaluation, save this exact consumer configuration as `values.yaml`:

```yaml
upstream:
  backstage:
    extraEnvVarsSecrets:
      - veecode-runtime-secrets
    appConfig:
      app:
        baseUrl: http://localhost:7007
      backend:
        baseUrl: http://localhost:7007
        cors:
          origin: http://localhost:7007
```

Install the pinned preview chart:

```bash
helm install devportal veecode/devportal --version 0.1.0 -n devportal --create-namespace -f values.yaml
```

## Step 4: Reach the portal

### Supported evaluation path: port-forward

Forward the chart's service and open the local endpoint:

```bash
kubectl -n devportal port-forward svc/devportal-developer-hub 7007:7007
```

Open [http://localhost:7007](http://localhost:7007). The values file above intentionally omits `global.host` and sets the app and backend URLs to the plain-HTTP port-forward endpoint.

### Exposing publicly (not supported for this preview yet)

When a public Ingress path is intentionally supported, use the following six-line values example with the real TLS hostname as the bare `global.host` value, then configure the cluster's Ingress controller and TLS Secret:

```yaml
global:
  host: devportal.example.com
upstream:
  backstage:
    extraEnvVarsSecrets:
      - veecode-runtime-secrets
```

For example:

```yaml
global:
  host: devportal.example.com
upstream:
  ingress:
    enabled: true
    className: nginx
    tls:
      enabled: true
      secretName: devportal-tls
```

This generic example is documentation for the future public path only. Do not expose this preview installation publicly yet.

## Step 5: First login and the marketplace

On the sign-in screen, choose **Guest** and continue. The default guest flow signs you in as `ADMIN`. The marketplace is available at `/marketplace`. Plugin installations are recorded in PostgreSQL and persist across portal restarts when the installation continues to use the same database.

## Enable or disable plugins

The chart's default plugin set is declared in `global.dynamic.plugins` in `values.yaml`. To disable a default or configured plugin, use the same entry with `disabled: true`:

```yaml
global:
  dynamic:
    plugins:
      - package: <plugin-package>
        disabled: true
```

## What ships by default

- VeeCode analytics home
- Global header, VeeCode theme, and About
- Marketplace
- RBAC UI; enforcement is **off** in the preview
- A read-only ClusterRole for the Kubernetes plugin, gated by `kubernetesPlugin.rbac`

## Version and lineage

Chart `0.1.0` and image `3.0.0-beta.1` are pinned by digest inside the chart. Never point production at `:edge`.

The chart source is [veecode-platform/devportal-chart](https://github.com/veecode-platform/devportal-chart). It is a renamed fork of [redhat-developer/rhdh-chart](https://github.com/redhat-developer/rhdh-chart) pinned at `backstage-7.0.1`.
