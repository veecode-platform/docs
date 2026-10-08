---
sidebar_position: 2
sidebar_label: GitLab Authentication
title: Sign in with GitLab
---

This page configures GitLab OAuth sign-in for DevPortal 3.x and the GitLab organization sync that imports users and groups into the catalog. The two are separate: sign-in is application configuration, and organization sync is a Marketplace module with its own configuration.

The 3.x backend registers the `gitlab` sign-in provider, with the `userIdMatchingUserEntityAnnotation` resolver as its default. Sign-in succeeds only when the catalog already holds a matching User entity, so set up organization sync before you test sign-in.

## Prerequisites

You need:

- A GitLab OAuth application. Create one from your GitLab user or admin settings, following [GitLab's OAuth provider guide](https://docs.gitlab.com/ee/integration/oauth_provider.html). Set the redirect URI to `http(s)://<portal-host>/api/auth/gitlab/handler/frame`, with no trailing slash after `frame`, and request the `read_user`, `openid`, `profile`, and `email` scopes, as described in the [Backstage GitLab provider documentation](https://backstage.io/docs/auth/gitlab/provider). Note the Application ID and generate a Secret.
- Guest sign-in turned off. On the local stack, drop the guest fragment from the configuration chain, as described in [Add configuration to the local stack](../../installation-guide/docker-local/custom-config.md). On Kubernetes, set `global.veecode.guestAuth.enabled: false`, as shown in [Install DevPortal on Kubernetes](../../installation-guide/production-setup/setup.md).

## Configure GitLab sign-in

Add this block to a custom configuration fragment on the local stack (see [Add configuration to the local stack](../../installation-guide/docker-local/custom-config.md)), or to an `extraAppConfig` fragment in the chart `values.yaml`. Replace the placeholder values with your OAuth application credentials. The `production` entry must match `auth.environment`.

```yaml
auth:
  environment: production
  providers:
    gitlab:
      production:
        clientId: ${AUTH_GITLAB_CLIENT_ID}
        clientSecret: ${AUTH_GITLAB_CLIENT_SECRET}
        signIn:
          resolvers:
            - resolver: userIdMatchingUserEntityAnnotation
signInPage: gitlab
```

For self-hosted GitLab, add the instance URL:

```yaml
auth:
  environment: production
  providers:
    gitlab:
      production:
        clientId: ${AUTH_GITLAB_CLIENT_ID}
        clientSecret: ${AUTH_GITLAB_CLIENT_SECRET}
        audience: https://gitlab.example.com
        signIn:
          resolvers:
            - resolver: userIdMatchingUserEntityAnnotation
signInPage: gitlab
```

What the keys do:

- `clientId` and `clientSecret` are the Application ID and Secret from your GitLab OAuth application. `audience` is the base URL of a self-hosted GitLab instance. See the [Backstage GitLab provider documentation](https://backstage.io/docs/auth/gitlab/provider).
- `signIn.resolvers` maps the GitLab identity to a catalog User entity. The default resolver matches the GitLab user ID against the user-id annotation on the User entity (`gitlab.com/user-id`, or `<host>/user-id` for self-hosted instances), which the organization sync module sets.
- `signInPage: gitlab` makes GitLab the sign-in method.

Pass the secrets as environment variables rather than writing them into the file. On the local stack, set them on the `devportal` service in a Compose override:

```yaml
services:
  devportal:
    environment:
      AUTH_GITLAB_CLIENT_ID: your-gitlab-application-id
      AUTH_GITLAB_CLIENT_SECRET: your-gitlab-secret
```

On Kubernetes, store them in the runtime Secret and reference them with `${...}` placeholders, following the `veecode-runtime-secrets` pattern in [Install DevPortal on Kubernetes](../../installation-guide/production-setup/setup.md). Restart the portal so it loads the new configuration. The portal can take up to two minutes before `/healthcheck` returns 200; test sign-in after that.

## Import users and groups

The `gitlab-org` module imports GitLab users and groups as User and Group entities on a schedule. Install it from the Marketplace Extensions page, or add this entry to an operator plugin file (see [Configure dynamic plugins for the local stack](../../installation-guide/docker-local/custom-plugins.md)):

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-plugin-catalog-backend-module-gitlab-org@sha256:1bd009a2bca08356ee46eddc9738ba2137fe7762e54fc17c5c2d923b64ad4664
    disabled: false
    pluginConfig:
      catalog:
        providers:
          gitlab:
            orgProvider:
              host: ${GITLAB_HOST}
              orgEnabled: true
              group: ${GITLAB_ORG_GROUP}
              schedule:
                frequency:
                  minutes: 30
                timeout:
                  minutes: 3
                initialDelay:
                  seconds: 15
```

Set `GITLAB_HOST` to your GitLab host (`gitlab.com` or your self-hosted host) and `GITLAB_ORG_GROUP` to the group to import. The module authenticates with the `integrations.gitlab` token described in [GitLab integrations](./gitlab.md).

After the first sync runs, open the catalog and check that User entities from your group are present. Then sign in with a GitLab account from that group.

## Sign-in resolvers

The backend default is `userIdMatchingUserEntityAnnotation`: it matches the GitLab user ID with the User entity carrying the same user-id annotation. Other resolvers from the [Backstage GitLab provider documentation](https://backstage.io/docs/auth/gitlab/provider#resolvers), such as `emailMatchingUserEntityProfileEmail`, work when your User entities carry the matching fields. List resolvers in order; each one is tried until one finds a match.

## Troubleshooting

- Sign-in fails with an identity resolution error: the User entity is missing from the catalog. Wait for the next organization sync and confirm the user appears in the catalog before signing in again.
- The GitLab button does not appear: check that `auth.environment` matches the provider entry name (`production` in the example) and that the portal restarted with the fragment loaded.
- Redirect mismatch after GitLab approval: the redirect URI in the OAuth application must exactly match `http(s)://<portal-host>/api/auth/gitlab/handler/frame`, with no trailing slash.
