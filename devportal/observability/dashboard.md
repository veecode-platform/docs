---
sidebar_position: 7
sidebar_label: Template Dashboards
title: Observability Dashboard
---

This page explains how to configure the Grafana plugin in DevPortal and what catalog annotations are required to surface observability data on entity pages.

DevPortal does **not** embed Prometheus directly. Instead, it integrates with an externally-deployed Grafana instance through the Grafana plugin and catalog entity annotations.

---

## **Setting Up the Grafana Plugin**

The Grafana plugin is not a default plugin and has no Marketplace entry. Install it from the default plugin index by its package reference. Refer to the [Grafana plugin guide](../plugins/grafana.md) for the package reference and the tested local-stack example.

At minimum, configure the Grafana domain and proxy endpoint in your app config:

```yaml
grafana:
  domain: ${GRAFANA_DOMAIN}

proxy:
  endpoints:
    /grafana/api:
      target: https://your-grafana-instance.example.com
      headers:
        Authorization: Bearer ${GRAFANA_TOKEN}
      changeOrigin: true
```

Set `grafana.domain` before you start the stack. Without it, the backend logs `Config must have required property 'domain'` at `/grafana`, but the healthcheck still returns 200 and the plugin still loads. Pass the secrets through environment variables on the local stack or a referenced Secret on Kubernetes.

---

## **Catalog Annotations**

To enable observability panels on an entity page, add the following annotations to the entity's `catalog-info.yaml`:

### Grafana Dashboard Panel

```yaml
metadata:
  annotations:
    grafana/overview-dashboard: "my-service-overview"
```

### Grafana Alert Status Panel

```yaml
metadata:
  annotations:
    grafana/alert-label-selector: "service=my-service"
```

Each card renders on the entity overview page only when its annotation is present.

### External Trace and Log Links

Trace and log tools are surfaced as external entity links — clicking opens the tool in a new browser tab:

```yaml
metadata:
  links:
    - url: https://jaeger.example.com/search?service=my-service
      title: Jaeger traces
    - url: https://grafana.example.com/explore?orgId=1&left=%7Bservice%3D%22my-service%22%7D
      title: Logs in Grafana Explore
```

---

## **Accessing the Observability Data**

1. **Navigate to the Catalog:** Select the component you want to observe.
2. **Open the entity page:** Look for the Grafana dashboards and alerts cards in the Overview section.
3. **Metrics view:** The Grafana dashboard matching the `overview-dashboard` annotation is displayed inline.
4. **Alert status:** Alert panels matching the `alert-label-selector` annotation show current alert state.
5. **Trace/Log links:** If entity links are configured, they appear on the entity page and open the respective tools in your browser.

---

:::info External tools required
The Grafana and Prometheus instances must be separately deployed and accessible to both DevPortal's backend (for API calls) and end users' browsers (for direct links). DevPortal does not provision or manage these services.
:::

For more on the plugin, see the [Grafana plugin guide](../plugins/grafana.md).
