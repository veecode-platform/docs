---
sidebar_position: 1
sidebar_label: Production Setup
title: Production Setup (Kubernetes)
---

This section covers deploying VeeCode DevPortal V2 on a Kubernetes cluster using plain manifests.

## What is covered

- [Plan your setup](plan.md) — namespace, secrets strategy, persistent volumes, and ingress before you apply
- [Setup guide](setup.md) — step-by-step deployment with `kubectl`

## When to use this guide

Use this guide when you need a persistent, team-accessible DevPortal instance — for example, a staging or production environment. If you are experimenting locally, see the [Docker Local](../docker-local/intro) or [VKDR Local](../vkdr-local/vkdr-setup.md) guides instead.

## Key requirements

- Kubernetes cluster with an ingress controller (nginx or Kong)
- `kubectl` installed and configured against the target cluster
- DNS hostname pointing to your cluster's ingress load balancer
- Git provider credentials (see [Integrations](/devportal/integrations))

## Deployment approach

DevPortal V2 ships as a single container image (`veecode/devportal:2.0.0`) with no Helm chart dependency. You deploy it with standard Kubernetes primitives:

| Resource | Purpose |
|----------|---------|
| `Deployment` | Runs the DevPortal container |
| `PersistentVolumeClaim` (×2) | Persists catalog state (`/app/data`) and plugin bundles (`/app/dynamic-plugins-root`) |
| `ConfigMap` | Mounts `app-config.local.yaml` |
| `Secret` | Holds tokens and credentials |
| `Service` | Exposes port 7007 within the cluster |
| `Ingress` | Routes external traffic (add separately) |

The reference manifest is in the [devportal-platform repository](https://github.com/veecode-platform/devportal-platform/blob/main/examples/deploy/k8s.yaml).
