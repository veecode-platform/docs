---
sidebar_position: 4
sidebar_label: Production Setup
title: Production Setup
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Welcome to the VeeCode Platform DevPortal production installation guide. This guide walks through installing DevPortal on a production-grade Kubernetes cluster using the official Helm chart.

## Overview

This guide covers:

1. **Prerequisites** — cluster, database, DNS, and credentials
2. **Creating a catalog repository** in your Git provider
3. **Configuring and deploying** DevPortal via Helm
4. **Accessing the portal**

## Prerequisites

- A Kubernetes cluster (cloud-managed or self-managed)
- `kubectl` and `helm` (v3) installed and configured
- A PostgreSQL database accessible from the cluster
- A DNS hostname pointing to your cluster's ingress load balancer (e.g., `devportal.example.com`)
- An ingress controller deployed in the cluster (nginx or Kong)
- A Git provider account (GitHub or GitLab) with credentials

<Tabs groupId="providers">
<TabItem value="github" label="GitHub">

**Required GitHub credentials:**

- **GitHub OAuth App** — Client ID and Client Secret for user sign-in.
  1. Go to [GitHub Developer Settings](https://github.com/settings/developers) → **New OAuth App**.
  2. Set **Homepage URL** to `https://devportal.example.com`.
  3. Set **Authorization callback URL** to `https://devportal.example.com/api/auth/github/handler/frame`.
  4. Note the **Client ID** and generate a **Client Secret**.

- **GitHub Personal Access Token (PAT)** — for backend catalog and API access.
  1. Go to [GitHub Tokens](https://github.com/settings/tokens) → **Generate new token (classic)**.
  2. Select scopes: `repo` (all), `workflow`.
  3. Note the token; it will not be shown again.

Store these as a Kubernetes Secret before deploying (see [Step 2](#step-2-create-a-kubernetes-secret-for-credentials)).

</TabItem>
<TabItem value="gitlab" label="GitLab">

**Required GitLab credentials:**

- **GitLab Personal Access Token** — for backend catalog and API access. Create one at **GitLab → User Settings → Access Tokens** with scopes `read_api`, `read_repository`.

- **GitLab OAuth Application** (optional, for user sign-in):
  1. Go to **GitLab → User Settings → Applications**.
  2. Set **Redirect URI** to `https://devportal.example.com/api/auth/gitlab/handler/frame`.
  3. Enable scopes: `read_user`, `openid`, `email`, `profile`.
  4. Note the **Application ID** and **Secret**.

Store these as a Kubernetes Secret before deploying (see [Step 2](#step-2-create-a-kubernetes-secret-for-credentials)).

</TabItem>
</Tabs>

---

## Step 1: Fork the sample catalog

Fork [veecode-platform/public-catalog](https://github.com/veecode-platform/public-catalog) into your Git account or organization. This gives you a starting catalog repository that DevPortal can index.

Note the repository name — you'll reference it in your `values.yaml`.

---

## Step 2: Create a Kubernetes Secret for credentials

Never put secrets directly in `values.yaml`. Create a Kubernetes Secret in the namespace where DevPortal will run (typically `platform`):

```bash
kubectl create namespace platform --dry-run=client -o yaml | kubectl apply -f -
```

<Tabs groupId="providers">
<TabItem value="github" label="GitHub">

```bash
kubectl create secret generic devportal-secrets \
  --namespace platform \
  --from-literal=GITHUB_AUTH_CLIENT_ID=<oauth-client-id> \
  --from-literal=GITHUB_AUTH_CLIENT_SECRET=<oauth-client-secret> \
  --from-literal=GITHUB_TOKEN=<personal-access-token>
```

</TabItem>
<TabItem value="gitlab" label="GitLab">

```bash
kubectl create secret generic devportal-secrets \
  --namespace platform \
  --from-literal=GITLAB_TOKEN=<personal-access-token> \
  --from-literal=GITLAB_AUTH_CLIENT_ID=<oauth-app-id> \
  --from-literal=GITLAB_AUTH_CLIENT_SECRET=<oauth-app-secret>
```

</TabItem>
</Tabs>

---

## Step 3: Create your `values.yaml`

The chart name is `veecode-devportal` from the `veecode-devportal` Helm repository. See [Understand the Helm Chart](../understand-chart) for a full reference of available keys.

<Tabs groupId="providers">
<TabItem value="github" label="GitHub">

```yaml
global:
  host: devportal.example.com   # your DNS hostname
  protocol: https
  port: ''

upstream:
  enabled: true
  ingress:
    enabled: true
    className: nginx             # or 'kong'
    tls:
      - secretName: devportal-tls
        hosts:
          - devportal.example.com
  backstage:
    image:
      repository: veecode/devportal
      tag: "1.4.5"
    extraEnvVarsSecret: devportal-secrets
    appConfig:
      app:
        title: "VeeCode DevPortal"
      backend:
        database:
          client: pg
          connection:
            host: <db-host>
            port: 5432
            database: platform_devportal
            user: <db-user>
            password: ${POSTGRES_PASSWORD} # injected from the devportal-secrets Secret — do not inline a real password in values.yaml
      integrations:
        github:
          - host: github.com
            token: ${GITHUB_TOKEN}
      auth:
        providers:
          github:
            development:
              clientId: ${GITHUB_AUTH_CLIENT_ID}
              clientSecret: ${GITHUB_AUTH_CLIENT_SECRET}
      catalog:
        providers:
          github:
            myOrg:
              organization: <your-github-org>
              catalogPath: /catalog-info.yaml
              filters:
                branch: main
                repository: public-catalog
```

</TabItem>
<TabItem value="gitlab" label="GitLab">

```yaml
global:
  host: devportal.example.com   # your DNS hostname
  protocol: https
  port: ''

upstream:
  enabled: true
  ingress:
    enabled: true
    className: nginx             # or 'kong'
    tls:
      - secretName: devportal-tls
        hosts:
          - devportal.example.com
  backstage:
    image:
      repository: veecode/devportal
      tag: "1.4.5"
    extraEnvVarsSecret: devportal-secrets
    appConfig:
      app:
        title: "VeeCode DevPortal"
      backend:
        database:
          client: pg
          connection:
            host: <db-host>
            port: 5432
            database: platform_devportal
            user: <db-user>
            password: ${POSTGRES_PASSWORD} # injected from the devportal-secrets Secret — do not inline a real password in values.yaml
      integrations:
        gitlab:
          - host: gitlab.com    # or your self-hosted hostname
            token: ${GITLAB_TOKEN}
      auth:
        providers:
          gitlab:
            development:
              clientId: ${GITLAB_AUTH_CLIENT_ID}
              clientSecret: ${GITLAB_AUTH_CLIENT_SECRET}
      catalog:
        providers:
          gitlab:
            myGroup:
              host: gitlab.com
              group: <your-gitlab-group>
              branch: main
              entityFilename: catalog-info.yaml
```

</TabItem>
</Tabs>

Replace all `<placeholder>` values with your actual configuration. Database credentials can also be supplied via a Kubernetes Secret and `extraEnvVarsSecret` instead of inline values.

---

## Step 4: Deploy with Helm

```bash
helm repo add veecode-devportal https://veecode-platform.github.io/next-charts
helm repo update veecode-devportal
helm upgrade --install veecode-devportal \
  --namespace platform \
  --create-namespace \
  --values values.yaml \
  veecode-devportal/veecode-devportal
```

---

## Step 5: Access the portal

Once the rollout completes, open `https://devportal.example.com` in your browser. You should reach the DevPortal login screen.

```bash
kubectl rollout status deployment/veecode-devportal-backstage -n platform
```

---

## Next steps

- Configure additional integrations and plugins — see the [Auth & Integrations](/devportal/integrations) section.
- Review RBAC roles (`role:default/admin`, `role:default/developer`, `role:default/viewer`) and assign them to users.
- For a deeper explanation of chart keys, see [Understand the Helm Chart](../understand-chart) or the [chart page on ArtifactHub](https://artifacthub.io/packages/helm/veecode-platform-next/veecode-devportal).

If you encounter issues, reach out via [support](https://platform.vee.codes/contact-us/) or join the [community](https://github.com/orgs/veecode-platform/discussions).
