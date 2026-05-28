---
sidebar_position: 12
sidebar_label: Grafana
title: Grafana Plugin
---

# Grafana Plugin

Without this plugin, Grafana dashboards are a separate tab the developer has to remember to open — and without the service entity as context, they're dashboards, not "the dashboard for this service." Enable the plugin, add `grafana/dashboard-selector` to the entity with a tag expression matching that service's dashboards, and an observability card appears in the entity overview. Metrics are now anchored to the service, not floating in a separate tool.

The Grafana plugin embeds Grafana dashboards and alert panels in entity pages, giving developers direct observability access from the catalog.

:::caution Grafana is not currently published as an OCI artifact by VeeCode
The `@roadiehq/backstage-plugin-grafana` package exists upstream (Roadie community plugins) but is **not** in any active workspace in [`devportal-plugin-export-overlays`](https://github.com/veecode-platform/devportal-plugin-export-overlays) — the entry is commented out in the `roadie-backstage-plugins` workspace, which means VeeCode is not currently publishing an OCI image for it.

Your options:

1. **Reference the npm package directly** — if upstream Roadie publishes a dynamic build of this plugin, you can use `package: '@roadiehq/backstage-plugin-grafana'` in `dynamic-plugins.yaml`. Confirm upstream has a `-dynamic` artifact before relying on this.
2. **Fork [`devportal-plugin-export-overlays`](https://github.com/veecode-platform/devportal-plugin-export-overlays)** and add the plugin to a workspace yourself, then publish your own OCI artifact.
3. **Use an alternative** — for ready-to-use observability/quality plugins that VeeCode publishes today, see [Tech Insights](./bundled/index.md), [SonarQube](./Sonar.md), or the `kiali` workspace for service-mesh observability.

The configuration below shows the composition contract (annotation + backend config) regardless of which installation path you choose.
:::

---

## Adding the plugin

### Via Marketplace

If the Marketplace shows a Grafana plugin entry (the catalog is updated continuously), click **Enable** and skip the manual steps below.

### Via `dynamic-plugins.yaml`

If the OCI artifact is not available, you can still reference the upstream npm package or your own build. The illustrative OCI entry below uses placeholder workspace/tag — see the caution box above for the current publishing status.

```yaml
plugins:
  - package: oci://quay.io/veecode/<workspace>:<tag>!roadiehq-backstage-plugin-grafana
    disabled: false
    pluginConfig:
      dynamicPlugins:
        frontend:
          roadiehq.backstage-plugin-grafana:
            mountPoints:
              - mountPoint: entity.page.overview/cards
                importName: EntityGrafanaDashboardsCard
                config:
                  layout:
                    gridColumn: "1 / -1"
                  if:
                    allOf:
                      - isGrafanaAvailable
```

Replace `<workspace>` and `<tag>` with the values that match your instance. See [Adding Plugins](./adding.md) for details on the OCI artifact format.

---

## App configuration

```yaml
grafana:
  # The base URL of your Grafana instance
  domain: ${GRAFANA_URL}
  # Optional: Grafana API key for fetching dashboards programmatically
  # unifiedAlerting: true   # set to true if using Grafana Unified Alerting
```

---

## Required annotation

Add the following annotation to the component's `catalog-info.yaml`:

```yaml
metadata:
  annotations:
    grafana/dashboard-selector: "tags @> 'my-service'"
    grafana/alert-label-selector: "service=my-service"
```

- `grafana/dashboard-selector` — a Grafana tag expression that filters dashboards to show
- `grafana/alert-label-selector` — a label selector for Grafana alerts

---

## References

- [Roadie Grafana plugin on GitHub](https://github.com/RoadieHQ/roadie-backstage-plugins/tree/main/plugins/frontend/backstage-plugin-grafana)
- [Adding Plugins to DevPortal](./adding.md)
