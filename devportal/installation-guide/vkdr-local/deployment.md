---
sidebar_position: 5
sidebar_label: DevPortal Deployment
title: DevPortal Deployment
---

In this step, you will deploy **DevPortal V2** (`docker.io/veecode/devportal:2.1.3`) into your local cluster using `vkdr devportal-platform install`.

VKDR installs the published `veecode-devportal-platform` Helm chart (version 0.1.0, appVersion 2.1.3) into the `platform` namespace and automatically wires up Kong as the ingress controller.

## Steps Overview

In this section, you will:

1. **Check Requirements**: ensure Docker, Kubernetes, DNS, and GitHub credentials are ready.
2. **Deploy DevPortal V2** using `vkdr devportal-platform install`.

By the end, you will have a fully functional DevPortal V2 instance running locally.

## Step 1: Requirements Check

Before deploying, confirm the following are in place:

- **Docker Engine** — installed and running (completed in [Step 2: Docker Engine](requirements.md#step-2-docker-engine)).
- **Kubernetes cluster** — created with `vkdr infra up` (completed in [Infrastructure Setup](infra.md#step-1-start-a-local-cluster)).
- **DNS name** — `devportal.localhost` resolves to `127.0.0.1` (configured in [Infrastructure Setup](infra.md#step-2-create-host-entries)).
- **GitHub credentials** — PAT and org set in your shell environment (configured in [GitHub Configuration](github.md)).

## Step 2: Deploy DevPortal V2

### Minimal install (core only)

No GitHub integration — useful for a quick smoke test:

```sh
vkdr devportal-platform install
```

### With GitHub integration and sign-in

Adds the `github` and `github-auth` presets. This is the recommended starting point for real use:

```sh
vkdr devportal-platform install \
  --github-pat "$GITHUB_PAT" \
  --github-org "$GITHUB_ORG" \
  --github-auth-client-id "$GITHUB_AUTH_CLIENT_ID" \
  --github-auth-client-secret "$GITHUB_AUTH_CLIENT_SECRET"
```

### With the Kubernetes workloads tab

Enables the `kubernetes` preset. VKDR creates a read-only service account and token automatically:

```sh
vkdr devportal-platform install --with-kubernetes
```

Expected output (example):

```sh
DevPortal Platform Install
==============================
Domain: localhost
Secure: false
Presets: recommended,github,github-auth
Install Sample apps: false
==============================

Kong Install
...
NAME: devportal
NAMESPACE: platform
STATUS: deployed

Script executed successfully.
```

:::note
VKDR creates a `devportal-platform-secrets` Kubernetes Secret and passes it to the chart via `existingSecret`, so your credentials are never stored in the Helm release history.
:::

### Remove DevPortal V2

```sh
vkdr devportal-platform remove
```

:::caution
`remove` uninstalls the Helm release and **deletes the data PVC**. All catalog data and plugin cache stored on the PVC will be lost.
:::

## Available flags

| Flag | Purpose |
|---|---|
| `-d, --domain` | Ingress host base (DevPortal is served at `devportal.<domain>`); add `-s/--secure` for HTTPS |
| `--presets` | Base preset list (default: `recommended`) |
| `--github-pat` | GitHub PAT — enables the `github` preset |
| `--github-org` | GitHub organization — required with `--github-pat` |
| `--github-auth-client-id` | OAuth App client ID — enables the `github-auth` sign-in preset |
| `--github-auth-client-secret` | OAuth App client secret — required with `--github-auth-client-id` |
| `--with-kubernetes` | Enables the `kubernetes` preset; VKDR creates a read-only SA + token in-cluster |
| `--plugin-registry` | OCI mirror URL (`PLUGIN_REGISTRY`) — for air-gapped environments |
| `--samples` | Install sample catalog applications |
| `--location` | Extra catalog location URL to register |
| `--merge <file>` | Merge a values file over the chart defaults (full V2 chart surface available) |
| `--load-env` | Read GitHub credentials from environment variables instead of flags |

:::info Presets and required credentials
Each preset requires specific credentials in the Secret. A missing required variable causes the DevPortal pod to exit with code 78 at boot — check pod logs if it does not become Ready. See the [Helm install guide](/devportal/installation-guide/production-setup/setup) for the full per-preset variable matrix.
:::

## Check Deployment

Wait for the pod to become Ready:

```sh
kubectl rollout status deploy/veecode-devportal-platform \
  -n platform --timeout=5m
```

Then open DevPortal in your browser:

> http://devportal.localhost:8000

The DevPortal interface should load, confirming the deployment was successful.

---

In the next section, you will verify the running instance and explore its features.
