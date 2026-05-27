---
sidebar_position: 6
sidebar_label: Configure Git integration
title: Configure Git provider integration
---

## Why do we need this?

In order to create and manage catalog repositories or to interact with your Git provider's APIs, we need to configure DevPortal with your credentials. There are many useful GitHub related plugins that make your experience with VeeCode DevPortal even better and they all require this Git provider integration.

:::info
Our documentation is still in progress and we currently provide information on integration against GitHub and GitLab. There are Backstage plugins that provide integration against other Git providers, such as Bitbucket and Azure DevOps, and those should work too.
:::

## Choose your provider

Follow the detailed setup instructions for your Git provider in the [Auth & Integrations](/devportal/integrations) section:

- [GitHub](/devportal/integrations/GitHub/) — authentication, backend integrations, and personal access tokens
- [GitLab](#gitlab) — backend integration via personal access token

Once you have your credentials configured, add the corresponding values to your `values.yaml` file under `upstream.backstage.appConfig` and redeploy.

---

## GitHub

See [GitHub integrations](/devportal/integrations/GitHub/) for full details on OAuth apps, GitHub Apps, and PATs. The minimal `values.yaml` snippet for a GitHub backend integration using a PAT is:

```yaml
upstream:
  backstage:
    appConfig:
      integrations:
        github:
          - host: github.com
            token: ${GITHUB_TOKEN}
      catalog:
        providers:
          github:
            myOrg:
              organization: <your-github-org>
              catalogPath: /catalog-info.yaml
              filters:
                branch: main
```

Provide `GITHUB_TOKEN` (PAT) via an environment variable or a Kubernetes Secret (see [Secrets](#passing-secrets-as-environment-variables) below).

---

## GitLab

To integrate DevPortal with GitLab you need:

- A **GitLab personal access token** with `read_api`, `read_repository` scopes (assigned to `GITLAB_TOKEN`).
- Your **GitLab host** — use `gitlab.com` for SaaS or your self-hosted hostname.
- The **group** (and optional subgroup) that contains your repositories.

Add the following to your `values.yaml` under `upstream.backstage.appConfig`:

```yaml
upstream:
  backstage:
    appConfig:
      integrations:
        gitlab:
          - host: ${GITLAB_HOST}        # e.g. gitlab.com
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
              host: ${GITLAB_HOST}
              group: ${GITLAB_GROUP}          # e.g. my-org or my-org/my-subgroup
              groupPattern: ${GITLAB_GROUP_PATTERN}  # optional regex
              branch: main
              entityFilename: catalog-info.yaml
```

| Environment variable | Purpose |
|---|---|
| `GITLAB_HOST` | GitLab hostname (`gitlab.com` or self-hosted) |
| `GITLAB_TOKEN` | PAT for backend API access |
| `GITLAB_AUTH_CLIENT_ID` | OAuth App client ID (for sign-in) |
| `GITLAB_AUTH_CLIENT_SECRET` | OAuth App client secret (for sign-in) |
| `GITLAB_GROUP` | Root group to scan for catalog entries |
| `GITLAB_GROUP_PATTERN` | Optional regex to filter group names |

:::info Sign-in vs. integration
`GITLAB_AUTH_CLIENT_ID` / `GITLAB_AUTH_CLIENT_SECRET` are only required if you want users to **sign in via GitLab OAuth**. If you only need GitLab as a catalog source, `GITLAB_TOKEN` and `GITLAB_HOST` are sufficient.
:::

### Create a GitLab OAuth Application (for sign-in)

1. Go to **GitLab → User Settings → Applications** (or **Admin Area → Applications** for instance-wide).
2. Set **Redirect URI** to `https://<your-devportal-host>/api/auth/gitlab/handler/frame`.
3. Enable scopes: `read_user`, `openid`, `email`, `profile`.
4. Save and note the **Application ID** (`GITLAB_AUTH_CLIENT_ID`) and **Secret** (`GITLAB_AUTH_CLIENT_SECRET`).

---

## Passing secrets as environment variables

Never commit tokens directly in `values.yaml`. Instead, pass them as environment variables and reference them with `${VAR_NAME}` syntax in `appConfig`, or create a Kubernetes Secret and reference it via `upstream.backstage.extraEnvVarsSecret`:

```yaml
upstream:
  backstage:
    extraEnvVarsSecret: devportal-secrets
```

Create the secret once in the cluster:

```bash
kubectl create secret generic devportal-secrets \
  --namespace platform \
  --from-literal=GITLAB_TOKEN=<token> \
  --from-literal=GITLAB_AUTH_CLIENT_ID=<id> \
  --from-literal=GITLAB_AUTH_CLIENT_SECRET=<secret>
```
