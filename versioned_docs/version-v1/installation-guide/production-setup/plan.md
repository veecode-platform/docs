---
sidebar_position: 2
sidebar_label: Plan your setup
title: Plan your setup
---

Before running `helm upgrade --install`, take a few minutes to answer these questions. The decisions here map directly to values in your `values.yaml`.

## Hostname and TLS

DevPortal needs a stable, publicly resolvable DNS hostname.

- Set `global.host` to the hostname (e.g., `devportal.example.com`).
- Set `global.protocol: https` for production.
- Configure `upstream.ingress.tls` with a TLS secret (cert-manager with Let's Encrypt is the recommended approach).

```yaml
global:
  host: devportal.example.com
  protocol: https
  port: ''
upstream:
  ingress:
    enabled: true
    className: nginx   # or 'kong' — must match your installed ingress controller
    tls:
      - secretName: devportal-tls
        hosts:
          - devportal.example.com
```

## Database

DevPortal requires a PostgreSQL database. SQLite is not supported in production.

- Provision a PostgreSQL instance (RDS, Cloud SQL, Azure Database, or self-hosted).
- Create a database named `platform_devportal` and a dedicated user.
- Ensure the Kubernetes cluster can reach the database (network policy / VPC peering / security groups).
- Supply the connection details under `upstream.backstage.appConfig.backend.database`.

Do not commit database passwords in `values.yaml`. Use `upstream.backstage.extraEnvVarsSecret` and reference them as `${DB_PASSWORD}` in the config.

## Secrets strategy

All tokens, client secrets, and passwords should be stored in a Kubernetes Secret:

```bash
kubectl create secret generic devportal-secrets \
  --namespace platform \
  --from-literal=GITHUB_TOKEN=... \
  --from-literal=GITHUB_AUTH_CLIENT_ID=... \
  --from-literal=GITHUB_AUTH_CLIENT_SECRET=...
```

Reference it in `values.yaml`:

```yaml
upstream:
  backstage:
    extraEnvVarsSecret: devportal-secrets
```

For GitOps workflows, use an external secrets operator (e.g., External Secrets Operator, Vault Agent) to populate the Kubernetes Secret from your secrets store.

## Git provider

Decide which Git provider(s) you need before writing `values.yaml`. The required credentials differ:

| Provider | Sign-in | Backend catalog access |
|---|---|---|
| GitHub | OAuth App (Client ID + Secret) | Personal Access Token or GitHub App |
| GitLab | OAuth Application (Client ID + Secret) | Personal Access Token |

See [Configure Git integrations](../simple-setup/configure-git-integrations.md) for the exact `appConfig` keys.

## Resource sizing

The chart does not enforce resource limits by default. For a production deployment, set them under `upstream.backstage.resources`:

```yaml
upstream:
  backstage:
    resources:
      requests:
        cpu: 500m
        memory: 512Mi
      limits:
        cpu: 1000m
        memory: 1Gi
```

Scale horizontally with care: DevPortal's backend uses in-memory caching, so multiple replicas require session affinity on the ingress. A single replica with appropriate CPU/memory is typically sufficient for small to medium teams.

## Namespace

The convention in this documentation is to deploy DevPortal into the `platform` namespace:

```bash
kubectl create namespace platform
```

If you use a different namespace, update `--namespace` in all `kubectl` and `helm` commands.

## RBAC

DevPortal ships with three built-in roles:

| Role | Intended audience |
|---|---|
| `role:default/admin` | Platform administrators |
| `role:default/developer` | Development team members |
| `role:default/viewer` | Read-only observers |

To create the necessary cluster roles automatically, set:

```yaml
createClusterRoles: true
```

Assign users to roles using the Backstage RBAC policy. See the [RBAC documentation](/devportal/v1/rbac/permissions) for details.

## Checklist before deploying

- [ ] DNS record created and resolving to the cluster load balancer
- [ ] TLS certificate provisioned (or cert-manager configured to issue one)
- [ ] PostgreSQL database and user created, network access confirmed
- [ ] Git provider OAuth App created with correct callback URL
- [ ] Kubernetes Secret created with all required tokens and secrets
- [ ] `values.yaml` reviewed — no plaintext secrets, correct hostname, correct ingress class
