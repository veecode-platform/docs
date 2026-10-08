---
sidebar_position: 13
sidebar_label: Kubernetes
title: Kubernetes Plugin
---

# Kubernetes Plugin

Without this plugin, a service created through DevPortal has no connection to its own Kubernetes workloads — the developer still needs to context-switch to `kubectl` or a separate dashboard to check pod status, restart counts, or logs. The portal becomes a creation tool but not an operational one.

With the plugin enabled, the entity page becomes the operational view for the service: pods, deployment rollout status, and live logs visible in the same place the team already uses to understand the service.

The Kubernetes plugin displays the live state of Kubernetes resources — pods, deployments, services, and more — for a catalog entity. It appears as a **Kubernetes tab on the entity page** (not a sidebar item).

The image does not load the Kubernetes plugin by default. This is separate from cluster access: the chart creates a read-only ClusterRole and binding for the plugin (`kubernetesPlugin.rbac.enabled`, on by default), but that RBAC does not enable the plugin itself.

---

## Plugin packages

| Package | Role |
|---|---|
| `backstage-plugin-kubernetes` | Frontend — entity Kubernetes tab |
| `backstage-plugin-kubernetes-backend` | Backend — cluster discovery and API proxy |

Neither package is a default plugin. Both are installable from the default plugin index, and both are listed in the Marketplace (`kubernetes` and `kubernetes-backend`).

---

## Enabling the plugin

### Via Marketplace

Search for "Kubernetes" in the Marketplace and install both the frontend and the backend entries, then recreate the stack so the installer runs. A plain container restart does not apply a Marketplace selection. See [Configure dynamic plugins for the local stack](../installation-guide/docker-local/custom-plugins.md) for the apply procedure.

### Via the operator file (local stack)

Add both index references to your operator file (`dynamic-plugins.local.yaml`):

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-plugin-kubernetes@sha256:fd94026e0650a4992ecc8ff0cdaf1f515c644fc1b6373b7bff812243e81fd76f
    disabled: false
  - package: oci://quay.io/veecode/backstage-plugin-kubernetes-backend@sha256:c563ab12540e2e37bfcbb2dce83668f990234a5685bbce81924a6dbbca814d6f
    disabled: false
```

The frontend entry mounts `EntityKubernetesContent` as the Kubernetes tab. The tab only appears on entities that carry the `backstage.io/kubernetes-id` or `backstage.io/kubernetes-namespace` annotation.

### On Kubernetes

Add the same two package references under `global.dynamic.plugins` in your chart values. Keep the chart's default `kubernetesPlugin.rbac.enabled: true` so the chart service account keeps its read-only access, unless your cluster administrator provides equivalent access another way. When releases with the same name share a cluster across namespaces, set `kubernetesPlugin.rbac.namespaceQualifiedName: true`.

The ClusterRole the chart creates lets the service account read pods, services, limit ranges, resource quotas, deployments, replica sets, stateful sets, daemon sets, jobs, cron jobs, ingresses and horizontal pod autoscalers. It does not cover config maps, so the Kubernetes tab shows a 403 error for config maps next to the workloads it lists.

---

## App configuration

Configure the backend with the clusters it can reach. The index backend config ships `serviceLocatorMethod: multiTenant` with an empty `config` cluster list, so you must supply at least one cluster.

On the local stack, add a configuration fragment:

```yaml
kubernetes:
  serviceLocatorMethod:
    type: 'multiTenant'
  clusterLocatorMethods:
    - type: 'config'
      clusters:
        - name: production
          url: https://k8s-api.example.com
          authProvider: 'serviceAccount'
          skipTLSVerify: false
          serviceAccountToken: ${K8S_CLUSTER_TOKEN}
```

### On Kubernetes, for the cluster the portal runs in

On Kubernetes, put the `kubernetes` block under `upstream.backstage.appConfig`. To read the cluster the portal runs in, point the cluster entry at `https://kubernetes.default.svc` and give it a token for the chart's service account, `<release>-developer-hub`. Keep the token in the runtime Secret from [Install DevPortal with Helm](../installation-guide/production-setup/setup.md).

The commands below use the namespace and release of that guide, `devportal`, so the service account is `devportal-developer-hub`. Set the namespace first, and change both names if your install uses others:

```bash
export NAMESPACE=devportal
```

```bash
K8S_TOKEN=$(kubectl -n "$NAMESPACE" create token devportal-developer-hub --duration=86400s)
kubectl -n "$NAMESPACE" patch secret veecode-runtime-secrets --type merge \
  -p "{\"stringData\":{\"K8S_TOKEN\":\"$K8S_TOKEN\"}}"
```

The token expires after the duration you set. Create a new one and update the Secret before it does. A change to the Secret alone does not restart the portal, so restart the deployment after you update it.

The backend must also trust the certificate of the cluster API, which a private CA usually signs. Put that CA in the chart's `caBundle`, which the setup guide describes in [Let the backend reach and trust Keycloak](../installation-guide/production-setup/setup.md#let-the-backend-reach-and-trust-keycloak). The chart mounts the bundle and points `NODE_EXTRA_CA_CERTS` at it. Read the cluster CA from the `kube-root-ca.crt` ConfigMap:

```bash
kubectl get configmap kube-root-ca.crt -n default -o jsonpath='{.data.ca\.crt}' > cluster-ca.crt
```

If `caBundle` is not set yet, create the ConfigMap from that file:

```bash
kubectl -n "$NAMESPACE" create configmap devportal-ca --from-file=ca.crt=cluster-ca.crt
```

If you already set `caBundle` for your identity provider, the `devportal-ca` ConfigMap exists. A bundle can hold several PEM certificates, one after another, so append the cluster CA to the file you created it from and replace the ConfigMap. Then restart the deployment, because the backend reads the bundle when it starts:

```bash
cat <your-ca-file> cluster-ca.crt > ca-bundle.crt
kubectl -n "$NAMESPACE" create configmap devportal-ca --from-file=ca.crt=ca-bundle.crt \
  --dry-run=client -o yaml | kubectl apply -f -
```

Then add these values and upgrade the release:

```yaml
global:
  veecode:
    deployment:
      caBundle:
        kind: ConfigMap
        name: devportal-ca
        key: ca.crt
upstream:
  backstage:
    appConfig:
      kubernetes:
        serviceLocatorMethod:
          type: multiTenant
        clusterLocatorMethods:
          - type: config
            clusters:
              - name: in-cluster
                url: https://kubernetes.default.svc
                authProvider: serviceAccount
                skipTLSVerify: false
                serviceAccountToken: ${K8S_TOKEN}
```

The `caData` and `caFile` settings of a cluster entry had no effect in DevPortal 3.0.3: without the CA in `caBundle`, the request still failed with `self-signed certificate in certificate chain`.

`serviceLocatorMethod` decides which clusters a component runs on: `multiTenant` assumes every component runs on all configured clusters, `singleTenant` assumes one cluster per component (selected per entity with the `backstage.io/kubernetes-cluster` annotation). `clusterLocatorMethods` decides where the cluster list comes from: `config` reads the `clusters` array shown above. Multiple clusters are supported — add entries to the `clusters` array.

---

## Required annotation

Add the `backstage.io/kubernetes-id` annotation to the component's `catalog-info.yaml`. The value must match the `backstage.io/kubernetes-id` label on the workloads that belong to this component:

```yaml
metadata:
  annotations:
    backstage.io/kubernetes-id: 'my-service'
```

```yaml
# On the Kubernetes workload, as a label:
metadata:
  labels:
    backstage.io/kubernetes-id: 'my-service'
```

Use `backstage.io/kubernetes-namespace` when the workloads live outside the default namespace:

```yaml
metadata:
  annotations:
    backstage.io/kubernetes-id: 'my-service'
    backstage.io/kubernetes-namespace: 'production'
```

The Kubernetes tab and its content only render when one of these annotations is present on the entity.

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
