---
sidebar_position: 1
sidebar_label: Introduction
title: Introduction
---

DevPortal's observability integration allows you to surface metrics, dashboards, and alert status from your existing observability stack **directly on catalog entity pages**. DevPortal does not provision or manage Prometheus, Jaeger, Loki, or Grafana — these tools must be deployed and operated separately. DevPortal connects to them through the optional Grafana dynamic plugin and catalog entity annotations.

## **How the Integration Works**

The integration is display-only:

1. You deploy Prometheus, Grafana, Loki, and/or Jaeger in your infrastructure (outside of DevPortal).
2. You enable the **Grafana plugin** in DevPortal's `dynamic-plugins.yaml`.
3. You annotate your catalog entities (`catalog-info.yaml`) with the appropriate annotation keys to tell DevPortal where to find dashboards and alerts.
4. DevPortal renders Grafana dashboards and alert summaries as tabs and cards on the entity page.

Jaeger traces and Loki logs are surfaced as external links (URL annotations) that open the relevant tool in a browser — they are not embedded views.

---

## **The Observability Stack (External)**

To use DevPortal's observability integration, you need these tools running externally:

### Prometheus
Prometheus collects and stores time-series metrics from your services. Grafana queries Prometheus to render dashboards and evaluate alert rules.

### Grafana
Grafana is the unified visualization layer. The Grafana plugin in DevPortal displays Grafana dashboards and alert status panels embedded on component pages.

### Loki (optional)
Loki aggregates and indexes logs. Log links can be added as URL annotations on catalog entities, opening the Loki/Grafana Explore view in the browser.

### Jaeger (optional)
Jaeger handles distributed tracing. Trace links can be added as URL annotations on catalog entities, opening Jaeger's trace view in the browser.

---

## **What DevPortal Provides**

- A Grafana dynamic plugin (not bundled — must be enabled explicitly) that reads catalog annotations and renders dashboards/alerts on entity pages.
- Catalog annotation conventions for pointing entities to the correct Grafana dashboards, alert labels, and external trace/log URLs.
- A unified experience: developers can access observability data from the same entity page where they view source code, CI/CD status, and docs.

For plugin setup and required annotations, see [Observability Dashboard](./dashboard.md).
