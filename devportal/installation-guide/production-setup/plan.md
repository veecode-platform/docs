---
sidebar_position: 2
sidebar_label: Plan your setup
title: Plan your setup
---

# Plan your setup

Review each item before you install DevPortal. The links open the sections that cover each decision.

## Namespace

Choose the namespace in [Step 1](./setup.md#step-1-choose-names-and-generate-secrets). The example uses `devportal`; [Step 2](./setup.md#step-2-create-the-namespace-and-the-tls-secret) creates it, and later `kubectl` and Helm commands use the same namespace.

## Plugins

Default plugins ship in the image. Add plugins or override image defaults through the chart's `global.dynamic.plugins` values. See [Disable a default plugin](./setup.md#disable-a-default-plugin) for the override form.

You can also install a plugin through the portal's Marketplace. See [Install a plugin from the marketplace](./setup.md#install-a-plugin-from-the-marketplace) for the Kubernetes flow.

## Secrets strategy

Create the runtime Secret in Step 5 with your PostgreSQL and identity provider settings. The chart passes that Secret to the portal. See [Step 5: Create the runtime Secret](./setup.md#step-5-create-the-runtime-secret) and [Step 6: Install DevPortal](./setup.md#step-6-install-devportal).

## Database

The chart installs no database. For production, provide a PostgreSQL database that you operate and give the portal a user that can create databases. DevPortal creates a separate database for each plugin that needs one. The guide starts a disposable PostgreSQL in Step 3 for the example install. See [Before you start](./setup.md#before-you-start) and [Step 3: Start PostgreSQL](./setup.md#step-3-start-postgresql).

## Ingress and TLS

Choose DNS names for the portal and identity provider, and select your Ingress class. Create a TLS Secret with a certificate that covers both names. See [Step 1: Choose names and generate secrets](./setup.md#step-1-choose-names-and-generate-secrets), [Step 2: Create the namespace and the TLS Secret](./setup.md#step-2-create-the-namespace-and-the-tls-secret), and [Step 6: Install DevPortal](./setup.md#step-6-install-devportal).

## Guest sign-in

Guest sign-in is enabled by default and maps guests to `user:default/admin`. Set `global.veecode.guestAuth.enabled: false` in the chart values before you expose the portal to users. See [Step 6: Install DevPortal](./setup.md#step-6-install-devportal).

## RBAC

The image includes the RBAC screens and backend. Permission checks are off by default, so every signed-in user can install plugins from the Marketplace. See [What ships by default](./setup.md#what-ships-by-default).

## Checklist before deploying

- [ ] Choose the namespace and DNS names, and set the Ingress class.
- [ ] Provide PostgreSQL and a database user that can create databases.
- [ ] Choose an OIDC identity provider and create the runtime Secret.
- [ ] Create a TLS Secret from a certificate that covers the portal and identity provider names.
- [ ] Set chart values for Ingress, OIDC sign-in, and any plugin additions or overrides.
- [ ] Disable guest sign-in before exposing the portal to users.
- [ ] If the cluster has no internet access, prepare the chart archive and registry mirror.
