---
sidebar_position: 1
sidebar_label: Microsoft and Azure DevOps
title: Sign in with Microsoft and connect Azure DevOps
---

Microsoft connects to DevPortal 3.x in three independent parts. Microsoft sign-in lets users enter with their Entra ID account. The Microsoft Graph module imports users and groups into the catalog. Azure DevOps access lets the catalog and entity pages read repositories, pipelines, and pull requests. Configure each part on its own; none implies the others.

The 3.x backend registers the `microsoft` sign-in provider, with the `userIdMatchingUserEntityAnnotation` resolver as its default. Sign-in succeeds only when the catalog already holds a matching User entity, so set up organization sync before you test sign-in.

## Prerequisites

You need:

- An Entra ID app registration. Create one in the [Azure portal](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade), following the [Backstage Microsoft provider documentation](https://backstage.io/docs/auth/microsoft/provider). Add a `Web` platform with redirect URI `http(s)://<portal-host>/api/auth/microsoft/handler/frame`, grant the delegated Microsoft Graph permissions `email`, `offline_access`, `openid`, `profile`, and `User.Read`, and create a client secret. Note the Application (client) ID, the secret, and the Directory (tenant) ID.
- Guest sign-in turned off. On the local stack, drop the guest fragment from the configuration chain, as described in [Add configuration to the local stack](../../installation-guide/docker-local/custom-config.md). On Kubernetes, set `global.veecode.guestAuth.enabled: false`, as shown in [Install DevPortal on Kubernetes](../../installation-guide/production-setup/setup.md).

## Configure Microsoft sign-in

Add this block to a custom configuration fragment on the local stack (see [Add configuration to the local stack](../../installation-guide/docker-local/custom-config.md)), or to an `extraAppConfig` fragment in the chart `values.yaml`. Replace the placeholder values with your app registration credentials. The `production` entry must match `auth.environment`.

```yaml
auth:
  environment: production
  providers:
    microsoft:
      production:
        clientId: ${AUTH_MICROSOFT_CLIENT_ID}
        clientSecret: ${AUTH_MICROSOFT_CLIENT_SECRET}
        tenantId: ${AUTH_MICROSOFT_TENANT_ID}
        signIn:
          resolvers:
            - resolver: userIdMatchingUserEntityAnnotation
signInPage: microsoft
```

What the keys do:

- `clientId`, `clientSecret`, and `tenantId` are the Application ID, client secret, and Directory ID from the app registration. See the [Backstage Microsoft provider documentation](https://backstage.io/docs/auth/microsoft/provider).
- `signIn.resolvers` maps the Microsoft identity to a catalog User entity. The default resolver matches the user profile ID against the `graph.microsoft.com/user-id` annotation on the User entity, which the Graph sync module sets.
- `signInPage: microsoft` makes Microsoft the sign-in method.

Pass the secrets as environment variables rather than writing them into the file. On the local stack, set them on the `devportal` service in a Compose override. On Kubernetes, store them in the runtime Secret and reference them with `${...}` placeholders. Restart the portal so it loads the new configuration. The portal can take up to two minutes before `/healthcheck` returns 200; test sign-in after that.

## Import users and groups

The `microsoft-graph-catalog-integration` module imports Entra ID users and groups as User and Group entities on a schedule. Install it from the Marketplace Extensions page, or add this entry to an operator plugin file (see [Configure dynamic plugins for the local stack](../../installation-guide/docker-local/custom-plugins.md)):

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-plugin-catalog-backend-module-msgraph@sha256:4e35f3c39026325949be60af2a9b0e04938de87a3e1e8d6caff8a0bc9ccb80b2
    disabled: false
    pluginConfig:
      catalog:
        providers:
          microsoftGraphOrg:
            providerId:
              target: https://graph.microsoft.com/v1.0
              tenantId: ${MICROSOFT_TENANT_ID}
              clientId: ${MICROSOFT_CLIENT_ID}
              clientSecret: ${MICROSOFT_CLIENT_SECRET}
              schedule:
                frequency:
                  minutes: 60
                initialDelay:
                  seconds: 15
                timeout:
                  minutes: 15
```

Set the tenant ID, client ID, and client secret from the same app registration. The app registration needs permission to read users and groups.

After the first sync runs, open the catalog and check that User entities from your directory are present. Then sign in with a Microsoft account from that directory.

## Connect Azure DevOps repositories

Backend Azure DevOps access uses the `integrations.azure` configuration with either a personal access token or a service principal. Create a token in Azure DevOps following [Microsoft's token guide](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate), with Code read and Build read access for entity data. Then add this block to a custom configuration fragment:

```yaml
integrations:
  azure:
    - host: dev.azure.com
      credentials:
        - personalAccessToken: ${AZURE_TOKEN}
```

For a service principal with a client secret, use this form instead:

```yaml
integrations:
  azure:
    - host: dev.azure.com
      credentials:
        - clientId: ${AZURE_CLIENT_ID}
          clientSecret: ${AZURE_CLIENT_SECRET}
          tenantId: ${AZURE_TENANT_ID}
```

See the [Backstage Azure DevOps integration documentation](https://backstage.io/docs/integrations/azure/locations) for managed identity options and per-organization credentials. Repository locations listed under `catalog.locations` use these credentials.

The Azure DevOps entity content (pipelines, pull requests) and the `azure:*` scaffolder actions come from their own Marketplace modules. Install `azure-devops` and the Azure scaffolder actions module from the Extensions page. The backend module reads its organization and token from this configuration:

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-community-plugin-azure-devops-backend@sha256:6e33292432cbeaa38b2913acf34cda9b819c84373675bb4fbdc62b9c1242cbc6
    disabled: false
    pluginConfig:
      azureDevOps:
        host: dev.azure.com
        token: ${AZURE_TOKEN}
        organization: ${AZURE_ORG}
```

## Which combinations to use

- Full Microsoft setup: configure sign-in, Graph sync, and Azure DevOps access. One app registration covers sign-in and sync; repository access additionally needs an Azure DevOps token or service principal.
- Azure DevOps repositories with another identity: configure only repository access, and sign in through a different provider such as [Keycloak](../Keycloak/keycloak-auth.md). No Entra ID app registration is needed.
- Entra ID identity without Azure DevOps: configure only sign-in and Graph sync. No Azure DevOps token is needed.

## Troubleshooting

- Sign-in fails with an identity resolution error: the User entity is missing from the catalog. Wait for the next Graph sync and confirm the user appears in the catalog before signing in again.
- Entity pages show no pipeline data: check that `integrations.azure` lists the right host with valid credentials, and that the Azure DevOps modules are installed with the right organization.
