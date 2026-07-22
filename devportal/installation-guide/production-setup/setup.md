---
sidebar_position: 4
sidebar_label: Deploy to Kubernetes
title: Deploy DevPortal to Kubernetes
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This guide walks through deploying DevPortal V2 to a Kubernetes cluster using the `veecode-devportal-platform` Helm chart. See [Plan your setup](plan.md) before proceeding.

For environments where Helm is not available, a [no-Helm fallback](#no-helm-fallback) using raw manifests is documented at the end of this page.

---

## Step 1: Add the Helm repository (optional)

The install and upgrade commands in this guide point straight at the chart repo URL with `--repo`, so this step isn't required. Add it only if you want a persistent local alias — useful for `helm search`/`helm show values` outside of an install:

```bash
helm repo add next-charts https://veecode-platform.github.io/next-charts
helm repo update next-charts
helm search repo veecode-devportal-platform
# should show a CHART VERSION / APP VERSION pair, e.g. 0.4.0 / 2.2.0 — check
# https://veecode-platform.github.io/next-charts/index.yaml for the current latest
```

With the alias in place, swap `veecode-devportal-platform --repo https://veecode-platform.github.io/next-charts` for `next-charts/veecode-devportal-platform` in any command below.

---

<!-- dp-source: storage,pvc,postgres,helm -->
## Step 2: Create the credentials Secret

Credentials for the presets you select must be in a Kubernetes Secret **before** `helm install`. The chart references it via `existingSecret`.

Never pass production credentials through `--set credentials.*` — that stores them in the Helm release manifest. Use `existingSecret` for production.

<Tabs groupId="providers">
<TabItem value="github" label="GitHub">

For the `github` and `github-auth` presets:

```bash
kubectl create secret generic my-devportal-creds \
  --namespace platform \
  --from-literal=GITHUB_PAT=<personal-access-token> \
  --from-literal=GITHUB_ORG=<your-org> \
  --from-literal=GITHUB_AUTH_CLIENT_ID=<oauth-client-id> \
  --from-literal=GITHUB_AUTH_CLIENT_SECRET=<oauth-client-secret>
```

</TabItem>
<TabItem value="gitlab" label="GitLab">

For the `gitlab` preset (identity + integration):

```bash
kubectl create secret generic my-devportal-creds \
  --namespace platform \
  --from-literal=GITLAB_HOST=gitlab.com \
  --from-literal=GITLAB_TOKEN=<personal-access-token> \
  --from-literal=GITLAB_AUTH_CLIENT_ID=<oauth-app-id> \
  --from-literal=GITLAB_AUTH_CLIENT_SECRET=<oauth-app-secret> \
  --from-literal=GITLAB_GROUP=<root-group>
```

</TabItem>
<TabItem value="azure" label="Azure">

For the `azure` (integration) and `azure-auth` (identity) presets:

```bash
kubectl create secret generic my-devportal-creds \
  --namespace platform \
  --from-literal=AZURE_DEVOPS_TOKEN=<pat> \
  --from-literal=AZURE_DEVOPS_HOST=dev.azure.com \
  --from-literal=AZURE_DEVOPS_ORG=<org> \
  --from-literal=AZURE_DEVOPS_PROJECT=<project> \
  --from-literal=AZURE_AUTH_TENANT_ID=<tenant-id> \
  --from-literal=AZURE_AUTH_CLIENT_ID=<client-id> \
  --from-literal=AZURE_AUTH_CLIENT_SECRET=<client-secret>
```

</TabItem>
</Tabs>

For GitOps workflows, use an external secrets operator (External Secrets Operator, Vault Agent, Sealed Secrets) to populate the Secret from your secrets store.

### PostgreSQL credentials (production)

For production deployments using external PostgreSQL (see Step 3), include the database credentials in the same Secret. The chart injects them into `backend.database` automatically when `database.external.enabled=true`:

| Key | Description |
|---|---|
| `PG_HOST` | PostgreSQL hostname or endpoint |
| `PG_PORT` | Port — typically `5432` |
| `PG_USER` | Database user |
| `PG_PASSWORD` | Database password |
| `PG_DATABASE` | Database name — `backstage` is the conventional default |

Add them to your `kubectl create secret` command above, or patch an existing Secret:

```bash
kubectl patch secret my-devportal-creds \
  --namespace platform \
  --type merge \
  --patch '{"stringData":{"PG_HOST":"<host>","PG_PORT":"5432","PG_USER":"<user>","PG_PASSWORD":"<password>","PG_DATABASE":"backstage"}}'
```

For AWS RDS, prefer a Multi-AZ instance — with PVCs removed the database becomes the single durable dependency.

---

## Step 3: Install the chart

### Production (PostgreSQL — recommended)

This is the chart's **default** posture. `database.external.enabled=true` injects a `backend.database` block using the `PG_*` credentials from your Secret, and with both PVCs off the pod is fully stateless and schedules in any availability zone (the flags below are the defaults, shown explicitly for clarity):

```bash
helm install devportal veecode-devportal-platform \
  --repo https://veecode-platform.github.io/next-charts \
  --namespace platform \
  --create-namespace \
  --set 'presets={recommended,github,github-auth}' \
  --set existingSecret=my-devportal-creds \
  --set database.external.enabled=true \
  --set persistence.data.enabled=false \
  --set persistence.plugins.enabled=false
```

With stateless pods, `replicaCount > 1` is safe for steady-state traffic. Add `--set replicaCount=2` for basic HA. Note: the chart uses `strategy: Recreate`, so upgrades (`helm upgrade`) still cause a brief downtime window regardless of replica count — all pods are terminated before the new ones start.

### Development / minimal (SQLite)

This is an **opt-in** path — the chart defaults to stateless PostgreSQL and a render-time guard **blocks a bare install** unless you pick a persistence path. Enable the two PVCs (`/app/data` and `/app/dynamic-plugins-root`) explicitly. Suitable for a single-node dev cluster only; an EBS- or RWO-backed PVC pins the pod to one availability zone and is not recommended for production:

```bash
helm install devportal veecode-devportal-platform \
  --repo https://veecode-platform.github.io/next-charts \
  --namespace platform \
  --create-namespace \
  --set 'presets={recommended,github,github-auth}' \
  --set existingSecret=my-devportal-creds \
  --set persistence.data.enabled=true \
  --set persistence.plugins.enabled=true
```

### Common options

To enable ingress, add to either install command:

```bash
  --set ingress.enabled=true \
  --set ingress.hostname=devportal.example.com \
  --set ingress.ingressClassName=nginx
```

For the `kubernetes` preset, also pass `--set rbac.clusterRoles.create=true` so the chart creates the necessary `ClusterRole` and `ClusterRoleBinding`.

---

## Step 4: Verify the deployment

```bash
kubectl rollout status deploy/devportal-veecode-devportal-platform \
  --namespace platform --timeout=10m

# quick smoke-test without ingress
kubectl port-forward svc/devportal-veecode-devportal-platform \
  --namespace platform 7007:7007
curl -sf localhost:7007/healthcheck && echo OK
```

A successful boot logs lines like:

```
VEECODE: preset resolver — VEECODE_PRESETS=recommended,github,github-auth
VEECODE: applying preset "recommended"
...
Running in PRODUCTION mode
```

For a PostgreSQL deployment, the pre-step logs to stdout on success:

```
VEECODE prestep: pluginDivisionMode=database — read "backstage_plugin_extensions".marketplace_installations in backstage_plugin_extensions (<N> row(s))
VEECODE prestep: regenerated /app/data/extensions-install.yaml with <N> plugin selection(s) from the database
```

If the pre-step cannot reach the database it degrades gracefully (the pod still starts, but plugin selections may not be recovered from the database). You will see a line like:

```
VEECODE prestep: WARNING — could not read marketplace_installations (<error>); leaving /app/data/extensions-install.yaml as-is
```

Check the `PG_*` credentials and TLS settings if you see this.

If a required variable is missing, the container exits with **code 78** and logs exactly which variable to set — the pod will not enter a crash loop silently.

---

## Upgrading

```bash
helm upgrade devportal veecode-devportal-platform \
  --repo https://veecode-platform.github.io/next-charts \
  --namespace platform \
  --reuse-values \
  --set existingSecret=my-devportal-creds
```

---

<!-- dp-source: storage,pvc,postgres,helm -->
## No-Helm fallback

If Helm is not available, use the reference manifest from the [devportal-platform repository](https://github.com/veecode-platform/devportal-platform/blob/main/examples/deploy/k8s.yaml). The manifest contains two `PersistentVolumeClaim` resources, a `ConfigMap`, a `Deployment`, and a `Service`. By default it runs on SQLite — the two PVCs back `/app/data` (state) and `/app/dynamic-plugins-root` (plugin cache):

```bash
kubectl apply -f https://raw.githubusercontent.com/veecode-platform/devportal-platform/main/examples/deploy/k8s.yaml
```

You will need to edit the manifest to:
- Set `VEECODE_PRESETS` in the `Deployment` env block.
- Add an `envFrom` referencing a Secret with the required variables for your preset combination.
- Add an `Ingress` resource (see [Plan your setup](plan.md)).

**PostgreSQL (recommended for production):** Delete both `PersistentVolumeClaim` resources and their corresponding `volumeMounts`/`volumes` entries from the `Deployment`. Point `backend.database` at an external Postgres instance via `app-config.local.yaml`. The pod becomes stateless and can schedule in any availability zone. See [`docs/how-to/deploy-stateless-postgres.md`](https://github.com/veecode-platform/devportal-platform/blob/main/docs/how-to/deploy-stateless-postgres.md) in the source repo for the full walkthrough.

The Helm chart is the recommended path for production because it handles RBAC, ingress, and upgrades consistently. The raw manifest is suitable for minimal or air-gapped environments.

---

## Next steps

- Configure additional integrations — see [Auth & Integrations](/devportal/integrations)
- Review RBAC roles and assign them to users — see [RBAC](/devportal/rbac/permissions)
- Enable additional plugins via the marketplace in the DevPortal UI
