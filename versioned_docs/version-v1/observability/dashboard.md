---
sidebar_position: 7
sidebar_label: Template Dashboards
title: Observability Dashboard
---

This page explains how to configure the Grafana plugin in DevPortal and what catalog annotations are required to surface observability data on entity pages.

DevPortal does **not** embed Prometheus, Jaeger, or Loki directly. Instead, it integrates with externally-deployed instances of these tools through the Grafana plugin and catalog entity annotations.

---

## **Setting Up the Grafana Plugin**

The Grafana plugin is not bundled in the default image. Add it to your `dynamic-plugins.yaml` as an external plugin. Refer to the [Grafana plugin guide](/devportal/v1/plugins/grafana) for the full plugin package reference and configuration.

At minimum, configure the Grafana proxy in your app-config:

```yaml
proxy:
  endpoints:
    /grafana/api:
      target: https://your-grafana-instance.example.com
      headers:
        Authorization: Bearer ${GRAFANA_TOKEN}
      changeOrigin: true

grafana:
  domain: https://your-grafana-instance.example.com
```

---

## **Catalog Annotations**

To enable observability panels on an entity page, add the following annotations to the entity's `catalog-info.yaml`:

### Grafana Dashboard Panel

```yaml
metadata:
  annotations:
    grafana/dashboard-selector: "title @> 'My Service'"
```

### Grafana Alert Status Panel

```yaml
metadata:
  annotations:
    grafana/alert-label-selector: "service=my-service"
```

### External Trace Links (Jaeger)

Jaeger traces are surfaced as external links — clicking opens Jaeger in a new browser tab:

```yaml
metadata:
  annotations:
    jaeger/service-name: my-service
```

*(Exact annotation keys depend on which Jaeger/tracing annotation plugin you have enabled.)*

### External Log Links (Loki)

Loki logs are surfaced as external links to the Grafana Explore view:

```yaml
metadata:
  annotations:
    grafana/tag-filter: "service=my-service"
```

---

## **Accessing the Observability Data**

1. **Navigate to the Catalog:** Select the component you want to observe.
2. **Open the entity page:** Look for the Grafana plugin tab or cards in the Overview section.
3. **Metrics view:** Grafana dashboards matching the `dashboard-selector` annotation are displayed inline.
4. **Alert status:** Alert panels matching the `alert-label-selector` annotation show current alert state.
5. **Trace/Log links:** If trace or log annotations are configured, links appear on the entity page that open the respective tools in your browser.

---

:::info External tools required
The Grafana, Prometheus, Loki, and Jaeger instances must be separately deployed and accessible to both DevPortal's backend (for API calls) and end users' browsers (for direct links). DevPortal does not provision or manage these services.
:::

For more on the plugin, see the [Grafana Plugin guide](/devportal/v1/plugins/grafana).
