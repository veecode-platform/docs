---
sidebar_position: 2
sidebar_label: GitLab Auth & Integration
title: GitLab Authentication & Integration
---

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

## Step 3: Configure auth and integration

Add the following to your `app-config.yaml` (or pass via environment variables):

```yaml
signInPage: gitlab

auth:
  environment: development
  providers:
    gitlab:
      development:
        clientId: ${GITLAB_AUTH_CLIENT_ID}
        clientSecret: ${GITLAB_AUTH_CLIENT_SECRET}
        # For self-hosted GitLab, uncomment and set your instance URL:
        # audience: https://${GITLAB_HOST}
        signIn:
          resolvers:
            - resolver: usernameMatchingUserEntityName
            - resolver: emailMatchingUserEntityProfileEmail
            - resolver: emailLocalPartMatchingUserEntityName

integrations:
  gitlab:
    - host: ${GITLAB_HOST}
      token: ${GITLAB_TOKEN}
```

:::note
The `audience` field is only required for self-hosted instances. For `gitlab.com`, it can be omitted.
:::

## Step 4: Configure org sync (catalog provider)

Org sync ingests groups and users from a root GitLab group into the Backstage catalog.

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
          frequency:
            minutes: 5
          timeout:
            minutes: 3
```

## Using the `gitlab` profile

Set `VEECODE_PROFILE=gitlab` and provide the required env vars. DevPortal loads the pre-bundled `app-config.gitlab.yaml` which includes all sections above.

```bash
docker run -p 7007:7007 \
  -e VEECODE_PROFILE=gitlab \
  -e GITLAB_HOST=gitlab.com \
  -e GITLAB_AUTH_CLIENT_ID=<app-id> \
  -e GITLAB_AUTH_CLIENT_SECRET=<app-secret> \
  -e GITLAB_TOKEN=<access-token> \
  -e GITLAB_GROUP=<root-group> \
  veecode/devportal:latest
```

## Troubleshooting

- **Callback URL mismatch**: The redirect URI in your GitLab application must match `https://<your-instance>/api/auth/gitlab/handler/frame` exactly.
- **Sign-in resolvers failing**: Ensure users in the catalog have `spec.profile.email` or `metadata.name` matching their GitLab username. The three resolvers are tried in order; the first match wins.
- **Catalog not ingesting repos**: Verify the `GITLAB_TOKEN` has `read_api` scope and is scoped to the correct group.
- **Self-hosted instance**: Set `audience: https://${GITLAB_HOST}` in the auth provider config. Without it, token validation may fail.

## References

- [Backstage GitLab Auth Provider](https://backstage.io/docs/auth/gitlab/provider/)
- [Backstage GitLab Integration](https://backstage.io/docs/integrations/gitlab/locations/)
- [GitLab OAuth Applications](https://docs.gitlab.com/ee/integration/oauth_provider.html)
