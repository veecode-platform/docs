---
sidebar_position: 2
sidebar_label: Plan your setup
title: Plan your setup
---

Before applying the Kubernetes manifests, answer the following questions. Each decision maps directly to a field in the deployment.

## Namespace

The convention in this documentation is to deploy DevPortal into the `platform` namespace:

```bash
kubectl create namespace platform --dry-run=client -o yaml | kubectl apply -f -
```

If you use a different namespace, update `--namespace` in all `kubectl` commands.

## Persistent volumes

DevPortal needs two persistent volumes:

| Volume | Mount path | Minimum size | What it holds |
|--------|-----------|-------------|---------------|
| `devportal-data` | `/app/data` | 1 Gi | SQLite databases (catalog cache) and marketplace state (`extensions-install.yaml`). Without this volume the catalog cache is wiped on every restart. |
| `devportal-plugins` | `/app/dynamic-plugins-root` | 2 Gi | Downloaded OCI plugin bundles. Without this, all plugins are re-fetched on every restart (~60–90 s). |

Ensure your cluster has a `StorageClass` that supports `ReadWriteOnce`. Cloud-managed clusters (GKE, EKS, AKS) include one by default.

## Secrets strategy

Never put tokens and credentials directly in the Deployment manifest. Create a Kubernetes Secret and reference it via `envFrom` or individual `env` entries:

```bash
kubectl create secret generic devportal-secrets \
  --namespace platform \
  --from-literal=GITHUB_PAT=<token> \
  --from-literal=GITHUB_ORG=<org> \
  --from-literal=GITHUB_AUTH_CLIENT_ID=<client-id> \
  --from-literal=GITHUB_AUTH_CLIENT_SECRET=<client-secret>
```

Reference it in the Deployment under `spec.template.spec.containers[0].envFrom`:

```yaml
envFrom:
  - secretRef:
      name: devportal-secrets
```

For GitOps workflows, use an external secrets operator (External Secrets Operator, Vault Agent, Sealed Secrets) to populate the Kubernetes Secret from your secrets store.

## Presets

Decide which presets to activate before writing the Deployment. The `VEECODE_PRESETS` value determines which integrations and plugins start with the container.

Recommended baseline: `recommended,veecode-theme,github,github-auth` (or replace `github,github-auth` with your provider).

See [Presets](../docker-local/presets) for the full list and required variables per preset.

## Ingress and TLS

The reference manifest in `examples/deploy/k8s.yaml` does not include an Ingress — add one separately to match your ingress controller:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: devportal
  namespace: platform
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod   # if using cert-manager
spec:
  ingressClassName: nginx   # or 'kong'
  tls:
    - hosts:
        - devportal.example.com
      secretName: devportal-tls
  rules:
    - host: devportal.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: devportal
                port:
                  number: 7007
```

DevPortal needs to know its public URL. Set `app.baseUrl` and `backend.baseUrl` in the `app-config.local.yaml` ConfigMap (see [Setup guide](setup.md)).

## RBAC

DevPortal ships with three built-in roles:

| Role | Intended audience |
|------|-------------------|
| `role:default/admin` | Platform administrators |
| `role:default/developer` | Development team members |
| `role:default/viewer` | Read-only observers |

Activate RBAC by including the `recommended` preset.

## Checklist before deploying

- [ ] Namespace created
- [ ] StorageClass available for `ReadWriteOnce` PVCs
- [ ] Kubernetes Secret created with all required variables for your preset combination
- [ ] Ingress controller installed in the cluster
- [ ] DNS record created and resolving to the cluster load balancer
- [ ] TLS certificate provisioned (or cert-manager configured)
- [ ] `app-config.local.yaml` ConfigMap populated with `app.baseUrl` and `backend.baseUrl`
