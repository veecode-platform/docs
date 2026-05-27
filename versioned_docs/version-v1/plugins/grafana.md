---
sidebar_position: 12
sidebar_label: Grafana
title: Grafana Plugin
---

# Grafana Plugin

The Grafana plugin for Backstage embeds Grafana dashboards and alert panels in entity pages, giving developers direct observability access from the catalog.

:::note
The Grafana plugin is **not bundled** in the DevPortal image. It must be added as an external dynamic plugin via `dynamic-plugins.yaml` or the Marketplace. No support plan is required — the plugin is a standard Backstage community plugin available publicly.
:::

---

## Adding the plugin

### Via Marketplace

Search for "Grafana" in the DevPortal Marketplace and click **Enable**. The Marketplace handles the OCI reference and mount point configuration automatically.

### Via `dynamic-plugins.yaml`

Add the Grafana plugin from the community OCI registry. Check the [Marketplace](../plugins/finding) or the [Backstage Plugin Registry](https://backstage.io/plugins) for the current OCI reference and workspace tag that matches your DevPortal's Backstage version.

A typical entry looks like:

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

Replace `<workspace>` and `<tag>` with the values that match your instance. See [Adding Plugins](./adding) for details on the OCI artifact format.

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
- [Adding Plugins to DevPortal](./adding)
