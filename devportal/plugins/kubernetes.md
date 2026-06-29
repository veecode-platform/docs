---
sidebar_position: 13
sidebar_label: Kubernetes
title: Kubernetes Plugin
---

# Kubernetes Plugin

Without this plugin, a service created through DevPortal has no connection to its own Kubernetes workloads — the developer still needs to context-switch to `kubectl` or a separate dashboard to check pod status, restart counts, or logs. The portal becomes a creation tool but not an operational one.

With the plugin enabled, the entity page becomes the operational view for the service: pods, deployment rollout status, and live logs visible in the same place the team already uses to understand the service.

The Kubernetes plugin displays the live state of Kubernetes resources — pods, deployments, services, and more — for a catalog entity. It appears as a **Kubernetes tab on the entity page** (not a sidebar item).

The plugin is listed in `dynamic-plugins.default.yaml` (reference) as `disabled: true`. It is fetched from the OCI registry at boot when enabled — no image rebuild or support contact is needed. The recommended activation path is the `kubernetes` preset.

---

## Plugin package

| Package | Role |
|---|---|
| `backstage-plugin-kubernetes` | Frontend — entity Kubernetes tab |

The backend for Kubernetes is a **static plugin** compiled into the DevPortal base image. The frontend is a dynamic plugin that must be enabled in `dynamic-plugins.yaml`.

---

## Enabling the plugin

The simplest path is to add the `kubernetes` preset to `VEECODE_PRESETS` — it enables both the frontend dynamic plugin and the backend configuration in one step. See [Presets](/devportal/concepts/presets) for details.

To enable manually, add the following to your `dynamic-plugins.yaml`:

```yaml
plugins:
  - package: oci://${PLUGIN_REGISTRY}/backstage:bs_1.49.4!backstage-plugin-kubernetes
    disabled: false
    pluginConfig:
      dynamicPlugins:
        frontend:
          backstage.plugin-kubernetes:
            entityTabs:
              - path: /kubernetes
                title: Kubernetes
                mountPoint: entity.page.kubernetes
                config:
                  if:
                    allOf:
                      - hasAnnotation: backstage.io/kubernetes-label-selector
            mountPoints:
              - mountPoint: entity.page.kubernetes/cards
                importName: EntityKubernetesContent
                config:
                  layout:
                    gridColumn: "1 / -1"
                  if:
                    allOf:
                      - hasAnnotation: backstage.io/kubernetes-label-selector
```

Restart DevPortal after saving. Via the Marketplace UI you can click **Enable** instead of editing YAML manually.

The **Kubernetes tab only appears on entities that have the `backstage.io/kubernetes-label-selector` annotation**. Entities without the annotation will not show the tab.

---

## App configuration

Configure the Kubernetes backend in `app-config.yaml`:

```yaml
kubernetes:
  serviceLocatorMethod:
    type: 'multiTenant'
  clusterLocatorMethods:
    - type: 'config'
      clusters:
        - name: ${K8S_CLUSTER_NAME}
          url: ${K8S_CLUSTER_URL}
          authProvider: 'serviceAccount'
          skipTLSVerify: true
          serviceAccountToken: ${K8S_CLUSTER_TOKEN}
```

Multiple clusters are supported — add additional entries to the `clusters` array.

---

## Required annotation

Add the `backstage.io/kubernetes-label-selector` annotation to the component's `catalog-info.yaml`. The value is a Kubernetes label selector that identifies the workloads belonging to this component:

```yaml
metadata:
  annotations:
    backstage.io/kubernetes-label-selector: 'app=my-service,environment=production'
```

The Kubernetes tab and its content only render when this annotation is present on the entity.

---

## What the plugin shows

The Kubernetes tab displays:

- Running **pods** (with status, restarts, and age)
- **Deployments** and their rollout status
- **ReplicaSets**, **StatefulSets**, and **DaemonSets**
- **Services** and **Ingresses**
- Pod logs (click a pod for live log streaming)

The plugin does not add a top-level sidebar item — it is accessible only via the entity's Kubernetes tab.

---

## References

- [Backstage Kubernetes plugin documentation](https://backstage.io/docs/features/kubernetes/)
- [Kubernetes backend configuration](https://backstage.io/docs/features/kubernetes/configuration)
