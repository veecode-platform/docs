---
sidebar_position: 1
sidebar_label: Kubernetes install
title: Kubernetes installation overview
---

# Kubernetes installation overview

Install DevPortal 3.x on Kubernetes with the `devportal` Helm chart. The guide covers planning, installation, and upgrades.

## What is covered

- [Plan your setup](./plan.md) covers the namespace, plugins, runtime Secret, PostgreSQL, Ingress, TLS, and sign-in decisions.
- [Install DevPortal on Kubernetes](./setup.md) walks through the `devportal` chart install and includes a path for clusters without internet access.
- [Upgrade DevPortal 3.x](./upgrade.md) backs up the portal databases, upgrades the chart, and verifies the result.

## When to use this guide

Use this guide when you need a Kubernetes installation with a public HTTPS address, PostgreSQL, and OIDC sign-in. For local evaluation, use the [Docker Compose quickstart](../docker-local/intro.md).

## Key requirements

- A Kubernetes cluster with `kubectl`, Helm 3, and an Ingress controller.
- DNS names for the portal and identity provider, plus a TLS certificate stored in a Kubernetes Secret.
- A PostgreSQL database that you operate. Give the portal a user that can create databases.
- An OIDC identity provider.
- A runtime Secret with the PostgreSQL, backend, and identity provider settings.
- `openssl` and `curl` on your machine, and a browser that allows pop-ups from the portal.

## Deployment approach

The `devportal` chart installs the portal image and its default plugins. Configure application settings, plugin additions, and plugin overrides through chart values. The chart installs no database, so provide PostgreSQL separately.

If your cluster cannot reach public Helm repositories or registries, follow [Install without internet access](./setup.md#install-without-internet-access) to prepare a chart archive and mirror.
