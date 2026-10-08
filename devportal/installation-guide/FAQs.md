---
sidebar_label: FAQs
sidebar_position: 5
title: Frequently Asked Questions
---

# Frequently Asked Questions

## How do I run DevPortal locally?

Use the [DevPortal 3.x local quickstart](./docker-local/intro.md), which runs the portal with `devportal-local`.

## Which Helm chart installs DevPortal on Kubernetes?

Use the [`devportal` Helm chart](./production-setup/setup.md). Start with the [installation plan](./production-setup/plan.md) to prepare its requirements.

## Does the chart install PostgreSQL?

No. The chart installs no database, and DevPortal requires PostgreSQL. See the [installation plan](./production-setup/plan.md) and [PostgreSQL setup step](./production-setup/setup.md#step-3-start-postgresql).

## Is guest sign-in enabled by default?

Yes. Guest sign-in is enabled by default and maps to `user:default/admin`. Set `global.veecode.guestAuth.enabled: false` in the chart values to turn it off. See the [setup guide](./production-setup/setup.md) and its [install values](./production-setup/setup.md#step-6-install-devportal).

## How do I move an existing 2.x installation to 3.x?

Follow the [2.x-to-3.x migration guide](../migrating-from-2x.md).

## Where can I find the 3.x support policy?

See [Support](../support.md) for the release support policy and troubleshooting route.

## Container startup

### Why does the Marketplace look empty?

The Marketplace fills after the catalog finishes loading. On a fresh local database, the first start takes two to three minutes; see the [local quickstart](./docker-local/intro.md). The Marketplace lists the plugins from a catalog index image that the plugin install step pulls. If it stays empty, read that step's output, shown in the next answer. A cluster without internet access must mirror that image; see [Install without internet access](./production-setup/setup.md#install-without-internet-access).

### Why does the portal not start locally?

The `devportal` service waits for the `install-dynamic-plugins` service to finish successfully before it starts. Read that step's output with:

```sh
docker compose logs install-dynamic-plugins
```

### The portal does not become ready on Kubernetes

Check the plugin installer log and rollout status with these commands:

```sh
kubectl -n "$NAMESPACE" logs deployment/devportal-developer-hub -c install-dynamic-plugins
kubectl -n "$NAMESPACE" rollout status deployment/devportal-developer-hub
```

### Why does a local configuration key have no effect?

Compose loads the product configuration fragment last by default. Add your fragment after it when you need to override a product value. Configuration arrays replace earlier arrays, so include the full array in your override. See [Add configuration to the local stack](./docker-local/custom-config.md).

## Authentication

### Why can a user not sign in after Keycloak accepts their credentials?

DevPortal signs a user in only after it imports that user from Keycloak. With the values in the setup guide, the first import runs 15 seconds after startup, then runs every five minutes. If the user is not in the catalog yet, wait for the next import and try again. See [Step 7: Sign in and check](./production-setup/setup.md#step-7-sign-in-and-check).

## Presets

### Does DevPortal 3.x use presets?

No. DevPortal 3.x has no preset model. Its default plugins ship in the image, and provider settings are configured explicitly. See the [2.x-to-3.x migration guide](../migrating-from-2x.md).

## Plugins

### How do I enable a plugin?

Open Marketplace after the catalog finishes loading and select a plugin to install. For a local portal, you can also add a plugin entry to the operator plugin file. See [Configure dynamic plugins for the local stack](./docker-local/custom-plugins.md). For Kubernetes, configure additions and overrides through chart values. See [Disable a default plugin](./production-setup/setup.md#disable-a-default-plugin).

### Do I need to copy the image's default plugins into chart values?

No. The image ships its default plugins. Use chart values for additions or overrides. See [Disable a default plugin](./production-setup/setup.md#disable-a-default-plugin) for the override form.
