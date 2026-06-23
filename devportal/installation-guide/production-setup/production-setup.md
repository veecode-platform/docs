---
sidebar_position: 1
sidebar_label: Production Setup
title: Production Setup (Kubernetes)
---

This section covers deploying VeeCode DevPortal V2 on a Kubernetes cluster. The canonical install path uses the published **`veecode-devportal-platform`** Helm chart. A no-Helm fallback using raw manifests is documented in the [Setup guide](setup.md).

## What is covered

- [Plan your setup](plan.md) — namespace, secrets strategy, persistent volumes, and ingress before you install
- [Setup guide](setup.md) — step-by-step Helm install (and raw-manifest fallback)

## When to use this guide

Use this guide when you need a persistent, team-accessible DevPortal instance — for example, a staging or production environment. If you are experimenting locally, see the [Docker Local](../docker-local/intro) or [VKDR Local](../vkdr-local/vkdr-setup.md) guides instead.

## Key requirements

- Kubernetes cluster with an ingress controller (nginx or Kong)
- `helm` v3 and `kubectl` installed and configured against the target cluster
- DNS hostname pointing to your cluster's ingress load balancer
- Git provider credentials (see [Integrations](/devportal/integrations))

## Deployment approach

DevPortal V2 is distributed as the `veecode-devportal-platform` Helm chart (chart version `0.1.0`, app version `2.2.0`) published in the `next-charts` Helm repository. The chart deploys the `docker.io/veecode/devportal:2.2.0` image and manages the following resources on your behalf:

| Resource | Purpose |
|----------|---------|
| `Deployment` | Runs the DevPortal container |
| `PersistentVolumeClaim` (×2) | Persists catalog state (`/app/data`) and plugin bundles (`/app/dynamic-plugins-root`) |
| `Secret` (optional) | Chart-managed credentials (dev convenience; `existingSecret` is recommended for production) |
| `Service` | Exposes port 7007 within the cluster |
| `Ingress` | Routes external traffic (opt-in via `ingress.enabled`) |
| `ClusterRole` / `ClusterRoleBinding` | Required only when the `kubernetes` preset is enabled (`rbac.clusterRoles.create=true`) |

:::note V2 vs V1
The `veecode-devportal-platform` chart and `docker.io/veecode/devportal:2.2.0` image are V2 only. The V1 chart (`veecode-devportal`) and image remain unchanged and deploy the 1.x distribution. Do not mix V1 and V2 resources.
:::
