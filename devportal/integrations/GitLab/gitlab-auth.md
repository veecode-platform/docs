---
sidebar_position: 2
sidebar_label: GitLab Auth & Integration
title: GitLab Authentication & Integration
---

In V2, GitLab authentication is not a separate preset from GitLab SCM integration — both are provided by the single `gitlab` preset. This page documents the authentication-specific steps and configuration details. For the full activation guide including SCM and org sync, see [GitLab Auth & Integrations](./gitlab.md).

## How GitLab auth works in V2

The `gitlab` preset configures:

- **OAuth 2.0 sign-in** via a GitLab OAuth application (`GITLAB_AUTH_CLIENT_ID` / `GITLAB_AUTH_CLIENT_SECRET`)
- **Org sync** via the `catalog-backend-module-gitlab` provider, which ingests GitLab groups and users as Backstage `Group`/`User` entities
- **SCM integration** via `GITLAB_TOKEN` (Personal or Group Access Token) used for catalog discovery and scaffolder operations

All three are part of the same `gitlab` preset. You cannot activate GitLab auth without also activating the SCM integration and org sync.

## Prerequisites

1. A GitLab account with owner access to your group or instance.
2. Decide whether you are using **GitLab.com** (SaaS) or a **self-hosted GitLab** instance.

## Step 1: Create a GitLab OAuth application

1. Go to your group or user **Settings → Applications** (for a self-hosted instance, you can also use the admin area).
2. Fill in:
   - **Name**: VeeCode DevPortal
   - **Redirect URI**: `https://<your-instance>/api/auth/gitlab/handler/frame`
   - **Scopes**: `read_user`, `openid`, `profile`, `email`
3. Save the application and note the **Application ID** and **Secret**.

## Step 2: Create a Group or Personal Access Token (integration)

The backend integration requires a token with `read_api` scope so the catalog and scaffolder can read repository data.

1. Go to **User Settings → Access Tokens** (or a group's **Settings → Access Tokens** for a group token).
2. Select scopes: `read_api` (and `write_repository` if scaffolder needs to create branches/PRs).
3. Save the token — you will not see it again.

## Step 3: Activate the preset

```sh
VEECODE_PRESETS=recommended,gitlab
GITLAB_HOST=gitlab.com
GITLAB_AUTH_CLIENT_ID=<app-id>
GITLAB_AUTH_CLIENT_SECRET=<app-secret>
GITLAB_TOKEN=<access-token>
GITLAB_GROUP=<root-group>
```

## The generated auth configuration

At boot, the `gitlab` preset writes the following auth block:

```yaml
signInPage: gitlab

platform:
  guest:
    enabled: false
  signInProviders:
    - gitlab

auth:
  environment: production
  providers:
    gitlab:
      production:
        clientId: ${GITLAB_AUTH_CLIENT_ID}
        clientSecret: ${GITLAB_AUTH_CLIENT_SECRET}
        # For self-hosted GitLab uncomment:
        # audience: https://${GITLAB_HOST}
        signIn:
          resolvers:
            - resolver: usernameMatchingUserEntityName
            - resolver: emailMatchingUserEntityProfileEmail
            - resolver: emailLocalPartMatchingUserEntityName
```

:::note
The `audience` field is only required for self-hosted instances. For `gitlab.com`, it can be omitted. To override this for a self-hosted instance, add an `app-config.local.yaml` that sets `auth.providers.gitlab.production.audience`.
:::

## Org sync

Org sync ingests groups and users from a root GitLab group into the Backstage catalog. The `catalog-backend-module-gitlab` provider is static (compiled into the backend) and is configured by the preset's `appConfig` block:

```yaml
catalog:
  providers:
    gitlab:
      default:
        host: ${GITLAB_HOST}
        group: ${GITLAB_GROUP}
        orgEnabled: true
        restrictUsersToGroup: true
        includeUsersWithoutSeat: true
        relations:
          - INHERITED
          - DESCENDANTS
          - SHARED_FROM_GROUPS
        groupPattern: ${GITLAB_GROUP_PATTERN}
        branch: main
        fallbackBranch: master
        skipForkedRepos: false
        entityFilename: catalog-info.yaml
        rules:
          - allow: [Group, User]
        schedule:
          frequency: { minutes: 5 }
          timeout: { minutes: 3 }
```

## Troubleshooting

- **Callback URL mismatch**: The redirect URI in your GitLab application must match `https://<your-instance>/api/auth/gitlab/handler/frame` exactly.
- **Sign-in resolvers failing**: Ensure users in the catalog have `spec.profile.email` or `metadata.name` matching their GitLab username. The three resolvers are tried in order; the first match wins.
- **Catalog not ingesting repos**: Verify the `GITLAB_TOKEN` has `read_api` scope and is scoped to the correct group.
- **Self-hosted instance**: Set `audience: https://${GITLAB_HOST}` in the auth provider config. Without it, token validation may fail.
- **Exclusive-group conflict**: `gitlab` belongs to the `identity` group. Combining it with `github-auth`, `azure-auth`, `keycloak`, or `ldap` will fail at boot.

## References

- [Backstage GitLab Auth Provider](https://backstage.io/docs/auth/gitlab/provider/)
- [Backstage GitLab Integration](https://backstage.io/docs/integrations/gitlab/locations/)
- [GitLab OAuth Applications](https://docs.gitlab.com/ee/integration/oauth_provider.html)
