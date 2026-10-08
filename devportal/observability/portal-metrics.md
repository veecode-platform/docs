---
sidebar_position: 2
sidebar_label: Portal metrics
title: Monitor DevPortal's Own Metrics
---

# Monitor DevPortal's Own Metrics

The portal exposes Prometheus metrics about itself at `/metrics` on port 9464 inside the container. Point your Prometheus at that endpoint. Metric names include `catalog_entities_count` and `http_server_duration_count`.

To show metrics of your own services on entity pages instead, see [Observability Dashboard](./dashboard.md).

---

## Scrape the local stack

Compose publishes no metrics port by default. Add a `ports` entry on the `devportal` service in an override file, bound to loopback:

```yaml
services:
  devportal:
    ports:
      - "${DEVPORTAL_PORT:-7007}:7007"
      - "127.0.0.1:9464:9464"
```

Save this as `docker-compose.portal-metrics.yaml` next to `docker-compose.yml`, start the stack with both files, and scrape the endpoint:

```bash
docker compose -f docker-compose.yml -f docker-compose.portal-metrics.yaml up -d
curl http://localhost:9464/metrics
```

## Scrape on Kubernetes

The chart's Service already exposes the metrics port as `http-metrics`:

```yaml
- name: http-metrics
  port: 9464
  targetPort: 9464
```

Set this value to create a ServiceMonitor that selects that port:

```yaml
upstream:
  metrics:
    serviceMonitor:
      enabled: true
```

It renders a ServiceMonitor whose endpoint points at the metrics port and path:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: devportal-developer-hub
spec:
  endpoints:
    - port: http-metrics
      path: /metrics
```

The cluster needs the Prometheus Operator's ServiceMonitor resource for this object to take effect. Without the Operator installed, the rendered ServiceMonitor has no effect.
