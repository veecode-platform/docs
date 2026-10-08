---
sidebar_position: 1
sidebar_label: Azure / Microsoft
title: Azure / Microsoft Auth & Integrations
---

V2 DevPortal splits Azure/Microsoft capabilities into two composable presets:

- **`azure`** — Azure DevOps as SCM: catalog discovery, scaffolder, and the Azure DevOps UI tabs (pipelines, PRs). Does **not** configure sign-in.
- **`azure-auth`** — Microsoft (Entra ID / Azure AD) as identity: OIDC sign-in + Microsoft Graph org sync. Does **not** configure Azure DevOps repo access.

Compose both for a full Microsoft stack, or use either independently.

## Overview

- **`azure` preset**: The catalog discovers `catalog-info.yaml` files across Azure DevOps repositories. The scaffolder can create repos, push branches, and open PRs. The Azure DevOps UI tabs appear on entity pages.
- **`azure-auth` preset**: Users sign in with their Microsoft accounts via OIDC (Entra ID). Microsoft Graph ingests Entra ID users and groups as Backstage `User` and `Group` entities.

:::important
`azure-auth` belongs to the exclusive `identity` group. Only one identity preset can be active per deployment. You cannot combine `azure-auth` with `github-auth`, `gitlab`, `keycloak`, or `ldap`.
:::

## `azure` preset — Azure DevOps SCM

### Required environment variables

| Variable | Description |
|---|---|
| `AZURE_DEVOPS_TOKEN` | Azure DevOps Personal Access Token with `Code (Read)`, `Build (Read)`, and `Project and Team (Read)` scopes |
| `AZURE_DEVOPS_HOST` | Azure DevOps host (e.g., `dev.azure.com` for Azure DevOps Services) |
| `AZURE_DEVOPS_ORG` | Azure DevOps organization slug |
| `AZURE_DEVOPS_PROJECT` | Azure DevOps project slug for catalog discovery |

### What the preset configures

The `azure` preset (`presets/azure.yaml`) produces the following `app-config` at boot:

```yaml
integrations:
  azure:
    - host: ${AZURE_DEVOPS_HOST}
      credentials:
        - personalAccessToken: ${AZURE_DEVOPS_TOKEN}

azureDevOps:
  host: ${AZURE_DEVOPS_HOST}
  organization: ${AZURE_DEVOPS_ORG}
  token: ${AZURE_DEVOPS_TOKEN}

catalog:
  providers:
    azureDevOps:
      default:
        host: ${AZURE_DEVOPS_HOST}
        organization: ${AZURE_DEVOPS_ORG}
        project: ${AZURE_DEVOPS_PROJECT}
        schedule:
          frequency: { minutes: 30 }
          timeout: { minutes: 3 }
```

It also enables the Azure DevOps frontend and backend dynamic plugins (pipeline + PR cards on entity pages).

### Creating an Azure DevOps PAT

1. Go to **Azure DevOps → User Settings → Personal Access Tokens**.
2. Click **New Token**.
3. Set the following permissions:
   - **Code**: Read
   - **Build**: Read
   - **Project and Team**: Read
4. Save the token — you will not see it again.

## `azure-auth` preset — Entra ID / Azure AD identity

### Required environment variables

| Variable | Description |
|---|---|
| `AZURE_AUTH_TENANT_ID` | Entra ID (Azure AD) tenant ID |
| `AZURE_AUTH_CLIENT_ID` | App registration (client) ID from Entra ID |
| `AZURE_AUTH_CLIENT_SECRET` | Client secret from the app registration |

### What the preset configures

The `azure-auth` preset (`presets/azure-auth.yaml`) produces:

```yaml
signInPage: microsoft

platform:
  guest:
    enabled: false
  signInProviders:
    - microsoft

auth:
  environment: production
  providers:
    microsoft:
      production:
        clientId: ${AZURE_AUTH_CLIENT_ID}
        clientSecret: ${AZURE_AUTH_CLIENT_SECRET}
        tenantId: ${AZURE_AUTH_TENANT_ID}
        signIn:
          resolvers:
            - resolver: emailMatchingUserEntityProfileEmail
            - resolver: emailLocalPartMatchingUserEntityName

catalog:
  providers:
    microsoftGraphOrg:
      default:
        tenantId: ${AZURE_AUTH_TENANT_ID}
        clientId: ${AZURE_AUTH_CLIENT_ID}
        clientSecret: ${AZURE_AUTH_CLIENT_SECRET}
        schedule:
          frequency: { hours: 1 }
          timeout: { minutes: 5 }
```

### Creating an Entra ID App Registration

1. Go to [Azure Portal → App registrations](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps).
2. Click **New registration**.
3. Set the redirect URI to `https://<your-instance>/api/auth/microsoft/handler/frame` (type: Web).
4. Go to **Certificates & secrets → New client secret** and copy the secret value.
5. Note the **Application (client) ID** and **Directory (tenant) ID**.
6. Under **API permissions**, grant the required permissions and click **Grant admin consent**:
   - `User.Read`, `email`, `openid`, `profile` (for sign-in)
   - `User.Read.All`, `Group.Read.All`, `GroupMember.Read.All` (for Microsoft Graph org sync)

### Sign-in resolvers

The two resolvers are tried in order:

| Resolver | What it matches |
|---|---|
| `emailMatchingUserEntityProfileEmail` | Microsoft account email → `spec.profile.email` on the User entity |
| `emailLocalPartMatchingUserEntityName` | Email local part → `metadata.name` |

## Composition examples

### Full Microsoft stack (DevOps repos + Entra identity)

```sh
VEECODE_PRESETS=recommended,azure,azure-auth
AZURE_DEVOPS_TOKEN=<pat>
AZURE_DEVOPS_HOST=dev.azure.com
AZURE_DEVOPS_ORG=my-org
AZURE_DEVOPS_PROJECT=my-project
AZURE_AUTH_TENANT_ID=00000000-0000-0000-0000-000000000000
AZURE_AUTH_CLIENT_ID=00000000-0000-0000-0000-000000000000
AZURE_AUTH_CLIENT_SECRET=azure-oauth-secret
```

```bash
docker run -p 7007:7007 \
  -e VEECODE_PRESETS=recommended,azure,azure-auth \
  -e AZURE_DEVOPS_TOKEN=<pat> \
  -e AZURE_DEVOPS_HOST=dev.azure.com \
  -e AZURE_DEVOPS_ORG=my-org \
  -e AZURE_DEVOPS_PROJECT=my-project \
  -e AZURE_AUTH_TENANT_ID=<tenant-id> \
  -e AZURE_AUTH_CLIENT_ID=<client-id> \
  -e AZURE_AUTH_CLIENT_SECRET=<client-secret> \
  veecode/devportal:2.1.3
```

### Azure DevOps repos + GitHub identity

```sh
VEECODE_PRESETS=recommended,azure,github-auth
AZURE_DEVOPS_TOKEN=<pat>
AZURE_DEVOPS_HOST=dev.azure.com
AZURE_DEVOPS_ORG=my-org
AZURE_DEVOPS_PROJECT=my-project
GITHUB_PAT=ghp_xxxx
GITHUB_ORG=my-github-org
GITHUB_AUTH_CLIENT_ID=Iv1.abcdef0123456789
GITHUB_AUTH_CLIENT_SECRET=github-oauth-secret
```

### Entra identity + GitHub repos (no Azure DevOps)

```sh
VEECODE_PRESETS=recommended,github,azure-auth
GITHUB_PAT=ghp_xxxx
GITHUB_ORG=my-org
AZURE_AUTH_TENANT_ID=00000000-0000-0000-0000-000000000000
AZURE_AUTH_CLIENT_ID=00000000-0000-0000-0000-000000000000
AZURE_AUTH_CLIENT_SECRET=azure-oauth-secret
```

## Troubleshooting

- **Redirect URI mismatch**: The URI registered in Azure must match `https://<your-instance>/api/auth/microsoft/handler/frame` exactly (including scheme and path).
- **MS Graph groups not ingesting**: Ensure the App Registration has `Group.Read.All` and `GroupMember.Read.All` permissions with admin consent granted.
- **Azure DevOps catalog empty**: Verify `AZURE_DEVOPS_TOKEN` has **Code (Read)** scope and `AZURE_DEVOPS_PROJECT` is set to the correct project name.
- **Exclusive-group conflict at boot**: `azure-auth` belongs to the `identity` group. Do not combine with `github-auth`, `gitlab`, `keycloak`, or `ldap`.

## References

- [Backstage Microsoft Auth Provider](https://backstage.io/docs/auth/microsoft/provider/)
- [Backstage Azure DevOps Integration](https://backstage.io/docs/integrations/azure/org/)
- [Entra ID App Registrations](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Azure DevOps PATs](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate)
