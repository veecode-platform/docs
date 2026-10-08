---
sidebar_position: 2
sidebar_label: GitHub Authentication
title: Sign in with GitHub
---

This page configures GitHub OAuth sign-in for DevPortal 3.x and the GitHub organization sync that imports users and teams into the catalog. The two are separate: sign-in is application configuration, and organization sync is a Marketplace module with its own configuration.

The 3.x backend registers the `github` sign-in provider, with the `userIdMatchingUserEntityAnnotation` resolver as its default. Sign-in succeeds only when the catalog already holds a matching User entity, so set up organization sync before you test sign-in.

## Prerequisites

You need:

- A GitHub OAuth App. Create one under your organization or account settings, following [GitHub's OAuth App guide](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app). Set the authorization callback URL to `http(s)://<portal-host>/api/auth/github/handler/frame`, as described in the [Backstage GitHub provider documentation](https://backstage.io/docs/auth/github/provider). Note the client ID and generate a client secret.
- Guest sign-in turned off. On the local stack, drop the guest fragment from the configuration chain, as described in [Add configuration to the local stack](../../installation-guide/docker-local/custom-config.md). On Kubernetes, set `global.veecode.guestAuth.enabled: false`, as shown in [Install DevPortal on Kubernetes](../../installation-guide/production-setup/setup.md).

## Configure GitHub sign-in

Add this block to a custom configuration fragment on the local stack (see [Add configuration to the local stack](../../installation-guide/docker-local/custom-config.md)), or to an `extraAppConfig` fragment in the chart `values.yaml`. Replace the placeholder values with your OAuth App credentials. The `production` entry must match `auth.environment`.

```yaml
auth:
  environment: production
  providers:
    github:
      production:
        clientId: ${AUTH_GITHUB_CLIENT_ID}
        clientSecret: ${AUTH_GITHUB_CLIENT_SECRET}
        signIn:
          resolvers:
            - resolver: userIdMatchingUserEntityAnnotation
signInPage: github
```

What the keys do:

- `clientId` and `clientSecret` identify your GitHub OAuth App. See the [Backstage GitHub provider documentation](https://backstage.io/docs/auth/github/provider).
- `signIn.resolvers` maps the GitHub identity to a catalog User entity. The default resolver matches the immutable GitHub user ID against the `github.com/user-id` annotation on the User entity, which the organization sync module sets. See [Sign-in identities and resolvers](https://backstage.io/docs/auth/identity-resolver).
- `signInPage: github` makes GitHub the sign-in method.

Pass the secrets as environment variables rather than writing them into the file. On the local stack, set them on the `devportal` service in a Compose override:

```yaml
services:
  devportal:
    environment:
      AUTH_GITHUB_CLIENT_ID: your-github-oauth-app-client-id
      AUTH_GITHUB_CLIENT_SECRET: your-github-oauth-app-client-secret
```

On Kubernetes, store them in the runtime Secret and reference them with `${...}` placeholders, following the `veecode-runtime-secrets` pattern in [Install DevPortal on Kubernetes](../../installation-guide/production-setup/setup.md). Restart the portal so it loads the new configuration. The portal can take up to two minutes before `/healthcheck` returns 200; test sign-in after that.

## Import users and teams

The `github-org` module imports GitHub users and teams as User and Group entities on a schedule. Install it from the Marketplace Extensions page, or add this entry to an operator plugin file (see [Configure dynamic plugins for the local stack](../../installation-guide/docker-local/custom-plugins.md)):

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-plugin-catalog-backend-module-github-org@sha256:0e61273f85ba64ea304d262f84f884a915a9f783946dea96928adb67935345d8
    disabled: false
    pluginConfig:
      catalog:
        providers:
          githubOrg:
            id: production
            githubUrl: ${GITHUB_URL}
            orgs:
              - ${GITHUB_ORG}
            schedule:
              frequency:
                minutes: 60
              initialDelay:
                seconds: 15
              timeout:
                minutes: 15
```

Set `GITHUB_URL` to `https://github.com` (or your GitHub Enterprise URL) and `GITHUB_ORG` to your organization name. The module needs a token with organization read access; configure repository access as described in [GitHub backend integrations](./github-integrations.md).

After the first sync runs, open the catalog and check that User entities from your organization are present. Then sign in with a GitHub account from that organization.

## Sign-in resolvers

The backend default is `userIdMatchingUserEntityAnnotation`: it matches the GitHub user ID with the User entity carrying the same `github.com/user-id` annotation. Prefer this resolver because GitHub usernames can change while user IDs cannot, as noted in the [Backstage GitHub provider documentation](https://backstage.io/docs/auth/github/provider#resolvers).

Other resolvers from that page, such as `emailMatchingUserEntityProfileEmail`, work when your User entities carry the matching fields. List resolvers in order; each one is tried until one finds a match.

## Troubleshooting

- Sign-in fails with an identity resolution error: the User entity is missing from the catalog. Wait for the next organization sync and confirm the user appears in the catalog before signing in again.
- The GitHub button does not appear: check that `auth.environment` matches the provider entry name (`production` in the example) and that the portal restarted with the fragment loaded.
- Redirect mismatch after GitHub approval: the callback URL in the OAuth App must exactly match `http(s)://<portal-host>/api/auth/github/handler/frame`.
