---
sidebar_position: 1
sidebar_label: Production Setup
title: Production Setup
---

This section covers deploying VeeCode DevPortal on a production Kubernetes cluster using the official `veecode-devportal` Helm chart.

## What is covered

- [Plan your setup](plan.md) — sizing, database, ingress, and secrets strategy before you deploy
- [Setup guide](setup.md) — step-by-step Helm deployment with GitHub or GitLab

## When to use this guide

Use this guide when you need a persistent, team-accessible DevPortal instance — for example, a staging or production environment. If you are experimenting locally, see the [Simple Setup](../simple-setup/simple-setup.md) or [VKDR Local](../vkdr-local/vkdr-setup.md) guides instead.

## Key requirements

- Kubernetes cluster with an ingress controller (nginx or Kong)
- PostgreSQL database accessible from the cluster
- DNS hostname with a valid TLS certificate (recommended: cert-manager + Let's Encrypt)
- Git provider credentials (GitHub OAuth App + PAT, or GitLab OAuth App + PAT)

## Helm chart

| | |
|---|---|
| **Repo** | `https://veecode-platform.github.io/next-charts` |
| **Chart** | `veecode-devportal/veecode-devportal` |
| **Image** | `veecode/devportal:1.4.5` |
| **ArtifactHub** | [veecode-platform-next/veecode-devportal](https://artifacthub.io/packages/helm/veecode-platform-next/veecode-devportal) |

See [Understand the Helm Chart](../understand-chart) for a detailed breakdown of chart values.
