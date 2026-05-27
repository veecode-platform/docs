---
sidebar_position: 1
sidebar_label: Azure / Microsoft
title: Azure / Microsoft Auth & Integrations
---

The `azure` profile connects VeeCode DevPortal to Microsoft Azure AD (Entra ID) for user sign-in via OIDC, Azure DevOps for repository catalog ingestion, and Microsoft Graph for org sync (users and groups).

## Overview

- **Authentication**: Users sign in with their Microsoft accounts via OIDC.
- **Azure DevOps integration**: The catalog discovers `catalog-info.yaml` files across repositories using Azure DevOps Code Search.
- **Org sync**: Microsoft Graph ingests Azure AD users and groups as Backstage `User` and `Group` entities.

## Profile

Set `VEECODE_PROFILE=azure` to activate `app-config.azure.yaml`.

## Required environment variables

| Variable | Description |
|---|---|
| `AZURE_CLIENT_ID` | Azure AD App Registration client ID |
| `AZURE_CLIENT_SECRET` | Azure AD App Registration client secret |
| `AZURE_TENANT_ID` | Azure AD tenant ID |
| `AZURE_ORGANIZATION` | Azure DevOps organization name |
| `AZURE_PROJECT` | Azure DevOps project name (use `*` for all projects) |
| `AZURE_TOKEN` | Azure DevOps Personal Access Token (for integration) |
| `AUTH_SESSION_SECRET` | Random secret for server-side session cookies |

## Prerequisites

1. An Azure AD App Registration with:
   - **Redirect URI**: `https://<your-instance>/api/auth/microsoft/handler/frame`
   - **API permissions**: `User.Read`, `email`, `openid`, `profile` (for sign-in); `User.Read.All`, `Group.Read.All`, `GroupMember.Read.All` (for org sync via MS Graph)
2. An Azure DevOps PAT with **Code (Read)** scope (required for repo discovery). The [Azure DevOps Code Search extension](https://marketplace.visualstudio.com/items?itemName=ms.vss-code-search) must be installed in your organization.

## Step 1: Create an Azure AD App Registration

1. Go to [Azure Portal → App registrations](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps).
2. Click **New registration**.
3. Set the redirect URI to `https://<your-instance>/api/auth/microsoft/handler/frame` (type: Web).
4. Go to **Certificates & secrets → New client secret** and copy the secret value.
5. Note the **Application (client) ID** and **Directory (tenant) ID**.
6. Under **API permissions**, grant the required permissions and click **Grant admin consent**.

## Step 2: Configure auth and integration

```yaml
signInPage: microsoft

auth:
  session:
    secret: ${AUTH_SESSION_SECRET}
    cookieName: backstage-auth-session
    sameSite: lax
    secure: false
  environment: development
  providers:
    microsoft:
      development:
        clientId: "${AZURE_CLIENT_ID}"
        clientSecret: "${AZURE_CLIENT_SECRET}"
        tenantId: "${AZURE_TENANT_ID}"
        signIn:
          resolvers:
            - resolver: emailMatchingUserEntityProfileEmail
            - resolver: emailLocalPartMatchingUserEntityName

integrations:
  azure:
    - host: dev.azure.com
      credentials:
        - personalAccessToken: ${AZURE_TOKEN}
```

:::tip
The integration also supports service principal credentials (`clientId`, `clientSecret`, `tenantId`) as an alternative to a PAT. The PAT form is shown here as it is the most common starting point.
:::

## Step 3: Configure catalog discovery and org sync

```yaml
catalog:
  providers:
    # Azure DevOps repo discovery — requires Code Search extension
    azureDevOps:
      microsoft:
        organization: "${AZURE_ORGANIZATION}"
        project: "${AZURE_PROJECT}"
        repository: "*"
        path: "/catalog-info.yaml"
        schedule:
          frequency:
            minutes: 2
          initialDelay:
            seconds: 15
          timeout:
            minutes: 10

    # Microsoft Graph org sync
    microsoftGraphOrg:
      default:
        tenantId: ${AZURE_TENANT_ID}
        user:
          filter: accountEnabled eq true and userType eq 'member'
        group:
          filter: startsWith(displayName,'backstage-')
        schedule:
          frequency: PT1H
          timeout: PT50M
```

:::note
The `group.filter` above ingests only groups whose display name starts with `backstage-`. Adjust this filter to match your organization's group naming convention.
:::

## Permission (RBAC) group mapping

The live config pre-maps `group:default/backstage-admins` to the admin and superUser roles:

```yaml
permission:
  rbac:
    admin:
      users:
        - name: group:default/backstage-admins
      superUsers:
        - name: group:default/backstage-admins
```

Rename `backstage-admins` to match the group synced from Azure AD that should hold admin access.

## Quick start

```bash
docker run -p 7007:7007 \
  -e VEECODE_PROFILE=azure \
  -e AZURE_CLIENT_ID=<client-id> \
  -e AZURE_CLIENT_SECRET=<client-secret> \
  -e AZURE_TENANT_ID=<tenant-id> \
  -e AZURE_ORGANIZATION=<devops-org> \
  -e AZURE_PROJECT="*" \
  -e AZURE_TOKEN=<pat> \
  -e AUTH_SESSION_SECRET=<random-secret> \
  veecode/devportal:latest
```

## Troubleshooting

- **Redirect URI mismatch**: The URI registered in Azure must match `https://<your-instance>/api/auth/microsoft/handler/frame` exactly (including scheme and path).
- **MS Graph groups not ingesting**: Ensure the App Registration has `Group.Read.All` and `GroupMember.Read.All` permissions with admin consent granted.
- **Azure DevOps catalog empty**: Install the [Code Search extension](https://marketplace.visualstudio.com/items?itemName=ms.vss-code-search) in your organization and verify `AZURE_TOKEN` has **Code (Read)** scope.
- **Session errors**: `AUTH_SESSION_SECRET` must be set and stable across restarts; changing it invalidates all existing sessions.

## References

- [Backstage Microsoft Auth Provider](https://backstage.io/docs/auth/microsoft/provider/)
- [Backstage Azure DevOps Integration](https://backstage.io/docs/integrations/azure/org/)
- [Azure AD App Registrations](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
