---
sidebar_position: 12
sidebar_label: Grafana
title: Grafana Plugin
---

# Grafana Plugin

Without this plugin, Grafana dashboards are a separate tab the developer has to remember to open — and without the service entity as context, they're dashboards, not "the dashboard for this service." Enable the plugin, add `grafana/overview-dashboard` to the entity with the dashboard reference for that service, and an observability card appears in the entity overview. Metrics are now anchored to the service, not floating in a separate tool.

The Grafana plugin embeds Grafana dashboards and alert panels in entity pages, giving developers direct observability access from the catalog.

The plugin is **not a default plugin and has no Marketplace entry**. It is installable from the default plugin index by its package reference: `backstage-community-plugin-grafana` is a disabled index entry whose plugin config mounts the dashboards and alerts cards and reads the domain from `GRAFANA_DOMAIN`.

---

## Adding the plugin

### On the local stack

Add the index package reference to your operator file (`dynamic-plugins.local.yaml`). Use the full digest-pinned reference from the default plugin index:

```yaml
includes:
  - dynamic-plugins.default.yaml
plugins:
  - package: oci://quay.io/veecode/backstage-community-plugin-grafana@sha256:27e84e524b188b84bc46d35783e628c01d63d11293ec86454b34e08a333deceb
    disabled: false
```

Mount the operator file and recreate the stack as described in [Configure dynamic plugins for the local stack](../installation-guide/docker-local/custom-plugins.md). Enabling the entry alone is not enough: set `grafana.domain` with the configuration below before you start the stack. Without it, DevPortal 3.1.0 does not start: the backend logs `Config must have required property 'domain'` at `/grafana`, then `Backend startup failed`, and the readiness check keeps failing.

### On Kubernetes

Add the same package reference under `global.dynamic.plugins` in your chart values. The chart loads the catalog index's default plugin file (`dynamic-plugins.default.yaml`) through `global.dynamic.includes` and takes customer plugin entries from `global.dynamic.plugins`.

---

## App configuration

The plugin requires `grafana.domain` and the Grafana proxy endpoint. The index plugin config sets `grafana.domain` from the `GRAFANA_DOMAIN` variable. Set the domain before you start the portal. Without it, DevPortal 3.1.0 does not start: the backend logs `Config must have required property 'domain'` at `/grafana`, then `Backend startup failed`, and the readiness check keeps failing.

On the local stack, add a configuration fragment such as `app-config.grafana.yaml`:

```yaml
grafana:
  domain: ${GRAFANA_DOMAIN}
proxy:
  endpoints:
    /grafana/api:
      target: https://grafana.example.com/
      headers:
        Authorization: Bearer ${GRAFANA_TOKEN}
```

Pass the fragment with an extra `--config` argument and the variables with environment entries in your Compose override, as described in [Add a configuration fragment](../installation-guide/docker-local/custom-config.md). The tested local setup keeps the portal up (health check returns 200 a minute after start with no restarts) and loads the plugin.

On Kubernetes, put the same `grafana` and `proxy` blocks under `upstream.backstage.appConfig` and supply `GRAFANA_DOMAIN` and `GRAFANA_TOKEN` through a Secret referenced by the chart. See [Install DevPortal with Helm](../installation-guide/production-setup/setup.md) for the app-config and Secret pattern.

---

## Required annotations

Add the following annotations to the component's `catalog-info.yaml`:

```yaml
metadata:
  annotations:
    grafana/overview-dashboard: "my-service-overview"
    grafana/alert-label-selector: "service=my-service"
```

- `grafana/overview-dashboard` — selects the dashboard shown in the dashboards card on the entity overview page.
- `grafana/alert-label-selector` — selects the alerts shown in the alerts card on the entity overview page.

Each card only renders when its annotation is present on the entity.

---

## References

- [Grafana plugin for Backstage (upstream README)](https://github.com/backstage/community-plugins/blob/main/workspaces/grafana/plugins/grafana/README.md)
- [Adding Plugins to DevPortal](./adding.md)
- [Observability dashboards](../observability/dashboard.md)
