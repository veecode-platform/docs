---
sidebar_position: 8
sidebar_label: Configuration Hierarchy
title: Configuration Hierarchy
---

# Configuration Hierarchy

Backstage merges every `--config` file in the order it is passed on the command line. The merge is deep for objects and last-wins for single values: when two files set the same key, the later file wins. A list in a later file replaces the same list from an earlier file instead of merging with it. DevPortal 3.x assembles that `--config` chain from a base file plus a fixed set of product fragments.

## The load order on a default install

On devportal-local 3.0.3 the backend starts with these files, in this order:

1. `app-config.yaml`
2. `app-config.example.yaml`
3. `app-config.example.production.yaml`
4. `dynamic-plugins-root/app-config.dynamic-plugins.yaml` (generated at boot from each enabled plugin's `pluginConfig`)
5. `app-config.veecode-auth.yaml`
6. `app-config.veecode-branding.yaml`
7. `app-config.extensions.yaml`
8. `app-config.veecode-product.yaml`

A setting in a later file wins over the same setting in an earlier file. The product fragment loads last, so it overrides the earlier fragments.

## Where your settings go on Kubernetes

On a Kubernetes install you add configuration through the `devportal` chart instead of mounting files. The chart accepts configuration through two values:

- `upstream.backstage.appConfig` carries the main operator configuration (application URLs, authentication, catalog locations).
- `extraAppConfig` adds ordered fragments. The chart ships entries for the auth, branding, extensions, and product fragments, with the product fragment last so it wins.

Because a list in a later file replaces the same list from an earlier file, repeat every entry you want to keep when you override a list such as `catalog.locations`.

## Where your settings go on the local stack

The local stack derives its files from the pinned chart. Do not edit them. Add a separate fragment file and pass it with `--config` after the product fragment, as described in [Add a configuration fragment](../installation-guide/docker-local/custom-config.md). The same replacement rule applies: a list in your fragment replaces the same list from an earlier file.

## Environment variables

Configuration values may reference process environment variables with `${NAME}` syntax. Backstage resolves them from the process environment at startup, after all `--config` files are merged.

On the local stack, `APP_CONFIG_app_baseUrl` and `APP_CONFIG_backend_baseUrl` set the portal and backend URLs using `DEVPORTAL_PORT`:

```yaml
APP_CONFIG_app_baseUrl: "http://localhost:${DEVPORTAL_PORT:-7007}"
APP_CONFIG_backend_baseUrl: "http://localhost:${DEVPORTAL_PORT:-7007}"
```

## Related

- [Add a configuration fragment](../installation-guide/docker-local/custom-config.md) — the local-stack procedure for adding a fragment.
- [Dynamic Plugins](./dynamic-plugins.md) — how `app-config.dynamic-plugins.yaml` in position 4 is built.
- [Composing a Portal](./portal-composition.md) — how configuration relates to plugin loading and entity annotations.
