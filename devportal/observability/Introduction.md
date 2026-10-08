---
sidebar_position: 1
sidebar_label: Observability overview
title: Observability overview
---

DevPortal's observability integration allows you to surface metrics, dashboards, and alert status from your existing observability stack **directly on catalog entity pages**. DevPortal does not provision or manage Prometheus or Grafana — these tools must be deployed and operated separately. DevPortal connects to them through the Grafana plugin and catalog entity annotations.

## **How the Integration Works**

The integration is display-only:

1. You deploy Prometheus and Grafana in your infrastructure (outside of DevPortal).
2. You install the **Grafana plugin** from the default plugin index by its package reference.
3. You annotate your catalog entities (`catalog-info.yaml`) with the Grafana annotations to tell DevPortal which dashboards and alerts belong to each service.
4. DevPortal renders Grafana dashboards and alert summaries as cards on the entity overview page.

Links to log or trace tools are plain entity links (`metadata.links` in `catalog-info.yaml`) that open the tool in the browser — they are not embedded views.

---

## **The Observability Stack (External)**

To use DevPortal's observability integration, you need these tools running externally:

### Prometheus
Prometheus collects and stores time-series metrics from your services. Grafana queries Prometheus to render dashboards and evaluate alert rules.

### Grafana
Grafana is the unified visualization layer. The Grafana plugin in DevPortal displays Grafana dashboards and alert status panels embedded on component pages.

---

## **What DevPortal Provides**

- The Grafana plugin (not a default plugin and not in the Marketplace — installed by package reference from the default plugin index), which reads catalog annotations and renders dashboards and alerts on entity overview pages.
- Catalog annotation conventions (`grafana/overview-dashboard`, `grafana/alert-label-selector`) for pointing entities to the correct Grafana dashboards and alert labels.
- A unified experience: developers can access observability data from the same entity page where they view source code, CI/CD status, and docs.

For plugin setup and required annotations, see [Observability Dashboard](./dashboard.md) and the [Grafana plugin](../plugins/grafana.md).

---

## **The portal's own metrics**

Separately from entity dashboards, the portal exposes its own Prometheus metrics at `/metrics` on port 9464. See [Portal metrics](./portal-metrics.md) to scrape them on the local stack or on Kubernetes.
