---
sidebar_position: 2
sidebar_label: Plan your setup
title: Plan your setup
---

Before running `helm install`, answer the following questions. Each decision maps directly to a chart value or a pre-install resource.

## Namespace

The convention in this documentation is to deploy DevPortal into the `platform` namespace. Pass `--create-namespace` to `helm install` to create it automatically, or create it manually:

```bash
kubectl create namespace platform --dry-run=client -o yaml | kubectl apply -f -
```

If you use a different namespace, supply `--namespace <your-namespace>` in all `helm` and `kubectl` commands.

---

## Presets

Decide which presets to activate before installing. The `presets` chart value populates `VEECODE_PRESETS` in the container. The preset resolver runs at boot — a missing required variable causes a **hard exit with code 78** rather than a silent misconfiguration.

**Rules:**
- You may activate any number of integration presets.
- You must activate **at most one identity preset** (`exclusive_group: identity`). Selecting two identity presets fails with exit 78.
- `recommended` has no required variables and is a safe baseline for all configurations.

### Identity presets — pick at most one

| Preset | Required variables |
|---|---|
| `github-auth` | `GITHUB_PAT` *(S)*, `GITHUB_ORG`, `GITHUB_AUTH_CLIENT_ID`, `GITHUB_AUTH_CLIENT_SECRET` *(S)* |
| `azure-auth` | `AZURE_AUTH_TENANT_ID`, `AZURE_AUTH_CLIENT_ID`, `AZURE_AUTH_CLIENT_SECRET` *(S)* |
| `gitlab` | `GITLAB_HOST`, `GITLAB_AUTH_CLIENT_ID`, `GITLAB_AUTH_CLIENT_SECRET` *(S)*, `GITLAB_TOKEN` *(S)*, `GITLAB_GROUP`, `GITLAB_GROUP_PATTERN` *(optional)* |
| `keycloak` | `KEYCLOAK_BASE_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET` *(S)*, `AUTH_SESSION_SECRET` *(S)* |
| `ldap` | `LDAP_URL`, `LDAP_DN`, `LDAP_SECRET` *(S)*, `LDAP_USERS_BASE_DN`, `LDAP_GROUPS_BASE_DN`, `LDAP_USERS_FILTER` *(optional)*, `LDAP_GROUPS_FILTER` *(optional)* |

### Integration presets — composable

| Preset | Required variables |
|---|---|
| `github` | `GITHUB_PAT` *(S)*, `GITHUB_ORG` |
| `azure` | `AZURE_DEVOPS_TOKEN` *(S)*, `AZURE_DEVOPS_HOST`, `AZURE_DEVOPS_ORG`, `AZURE_DEVOPS_PROJECT` |
| `jenkins` | `JENKINS_URL`, `JENKINS_USERNAME`, `JENKINS_TOKEN` *(S)* |
| `kubernetes` | `K8S_CLUSTER_NAME`, `K8S_CLUSTER_URL`, `K8S_CLUSTER_TOKEN` *(S)* — also set `rbac.clusterRoles.create=true` |
| `sonarqube` | `SONARQUBE_BASE_URL`, `SONARQUBE_API_KEY` *(S)* |
| `mcp-chat` | `MCP_CHAT_PROVIDER`, `MCP_CHAT_API_KEY` *(S)*, `MCP_CHAT_MODEL` |

### No required variables

`recommended`, `veecode-theme`, `mcp`, `ldap-ad`

*(S)* = sensitive value; put it in the Secret, not in plain `--set` arguments.

Recommended baseline: `{recommended,veecode-theme,github,github-auth}` (or replace the git and identity presets with your provider).

---

## Secrets strategy

All sensitive variables belong in a Kubernetes Secret. The chart reads it via `existingSecret: <name>` (`envFrom: secretRef`).

```bash
kubectl create secret generic my-devportal-creds \
  --namespace platform \
  --from-literal=GITHUB_PAT=<token> \
  --from-literal=GITHUB_ORG=<org> \
  --from-literal=GITHUB_AUTH_CLIENT_ID=<client-id> \
  --from-literal=GITHUB_AUTH_CLIENT_SECRET=<client-secret>
```

Then pass `--set existingSecret=my-devportal-creds` to `helm install`.

The chart also accepts a `credentials: { KEY: value, ... }` map that renders a Secret inline — this is a dev convenience only. The credentials are stored in the Helm release manifest in plaintext; do not use it for production.

---

<!-- dp-source: storage,pvc,helm -->
## Persistent volumes

The chart provisions two PVCs by default:

| Value key | Mount path | Default size | What it holds |
|-----------|-----------|-------------|---------------|
| `persistence.data` | `/app/data` | 1 Gi | SQLite databases (catalog cache) and marketplace state. Without this PVC the catalog is wiped on every restart. |
| `persistence.plugins` | `/app/dynamic-plugins-root` | 2 Gi | Downloaded OCI plugin bundles. Without this, all plugins are re-fetched on every restart (~60–90 s). |

Ensure your cluster has a `StorageClass` that supports `ReadWriteOnce`. Cloud-managed clusters (GKE, EKS, AKS) include one by default.

:::warning
`helm uninstall` deletes the data PVC along with the release. Back up the SQLite database before uninstalling if you need to preserve the catalog state.
:::

---

<!-- dp-source: postgres -->
## Database

By default DevPortal uses **persistent SQLite** on the `/app/data` PVC. This is correct for single-replica deployments.

For multi-replica deployments (`replicaCount > 1`), SQLite is not safe — you must switch to **external PostgreSQL**:

```bash
helm install devportal next-charts/veecode-devportal-platform \
  --namespace platform \
  --set database.external.enabled=true \
  --set existingSecret=my-devportal-creds  # must contain PG_* vars
```

The Secret must contain: `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DATABASE`. When `database.external.enabled=true` the chart does not create the data PVC (Postgres is the state store).

---

## Ingress and TLS

Set `ingress.enabled=true` at install time, or add an Ingress resource separately:

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
                name: devportal-veecode-devportal-platform
                port:
                  number: 7007
```

DevPortal serves at `/` on port 7007 — there is no sub-path. The `app.baseUrl` and `backend.baseUrl` in the container must match the public hostname. Pass these via `--set appConfig.app.baseUrl=https://devportal.example.com` or include them in an `app-config.local.yaml` values override.

---

## RBAC

DevPortal ships with three built-in roles:

| Role | Intended audience |
|------|-------------------|
| `role:default/admin` | Platform administrators |
| `role:default/developer` | Development team members |
| `role:default/viewer` | Read-only observers |

Activate RBAC by including the `recommended` preset.

If you enable the `kubernetes` preset, also set `rbac.clusterRoles.create=true` so the chart creates the `ClusterRole` and `ClusterRoleBinding` the kubernetes plugin requires.

---

## Checklist before deploying

- [ ] Namespace created (or `--create-namespace` passed to `helm install`)
- [ ] StorageClass available for `ReadWriteOnce` PVCs
- [ ] Kubernetes Secret created with all required variables for your preset combination
- [ ] Preset list finalized (at most one identity preset)
- [ ] Ingress controller installed in the cluster
- [ ] DNS record created and resolving to the cluster load balancer
- [ ] TLS certificate provisioned (or cert-manager configured)
- [ ] `app.baseUrl` and `backend.baseUrl` set to the public hostname
