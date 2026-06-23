---
sidebar_position: 1
sidebar_label: Keycloak Auth
title: Keycloak Authentication & Org Sync
---

The `keycloak` preset connects VeeCode DevPortal to a Keycloak instance for OIDC-based user sign-in and realm-based org sync (users and groups).

## Overview

- **Authentication**: Users sign in via OIDC using a Keycloak realm. The `oidc` Backstage auth provider handles the flow.
- **Org sync**: The `keycloakOrg` catalog provider ingests realm users and groups as Backstage `User` and `Group` entities.

:::important
The `keycloak` preset belongs to the exclusive `identity` group. Only one identity preset can be active per deployment. You cannot combine `keycloak` with `github-auth`, `gitlab`, `azure-auth`, or `ldap`.
:::

## Activating the preset

```sh
VEECODE_PRESETS=recommended,keycloak
```

## Required environment variables

| Variable | Description |
|---|---|
| `KEYCLOAK_BASE_URL` | Keycloak base URL (e.g., `https://keycloak.example.com/auth`) |
| `KEYCLOAK_REALM` | Keycloak realm name |
| `KEYCLOAK_CLIENT_ID` | OAuth client ID registered in the realm |
| `KEYCLOAK_CLIENT_SECRET` | OAuth client secret for the registered client |
| `AUTH_SESSION_SECRET` | Random secret used to sign session cookies (min 32 chars) |

The OIDC discovery URL is built from `KEYCLOAK_BASE_URL` + `KEYCLOAK_REALM`:

```
${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}
```

## Prerequisites

1. A Keycloak realm configured for your organization.
2. A Keycloak client with:
   - **Client protocol**: `openid-connect`
   - **Access type**: `confidential`
   - **Valid redirect URIs**: `https://<your-instance>/api/auth/oidc/handler/frame`
   - **Standard Flow Enabled**: yes
   - **Service Accounts Enabled**: yes (required for org sync)
   - **Client roles** or realm roles granting `view-users` and `query-groups` to the service account.

## What the preset configures

The `keycloak` preset (`presets/keycloak.yaml`) produces the following `app-config` at boot:

```yaml
signInPage: keycloak

platform:
  guest:
    enabled: false
  signInProviders:
    - keycloak

auth:
  session:
    secret: ${AUTH_SESSION_SECRET}
    cookieName: backstage-auth-session
    sameSite: lax
    secure: false
  environment: production
  providers:
    oidc:
      production:
        metadataUrl: ${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}
        clientId: ${KEYCLOAK_CLIENT_ID}
        clientSecret: ${KEYCLOAK_CLIENT_SECRET}
        prompt: auto
        signIn:
          resolvers:
            - resolver: oidcSubClaimMatchingKeycloakUserId
            - resolver: preferredUsernameMatchingUserEntityName
            - resolver: emailMatchingUserEntityProfileEmail
            - resolver: emailLocalPartMatchingUserEntityName

catalog:
  providers:
    keycloakOrg:
      default:
        baseUrl: ${KEYCLOAK_BASE_URL}
        loginRealm: ${KEYCLOAK_REALM}
        realm: ${KEYCLOAK_REALM}
        clientId: ${KEYCLOAK_CLIENT_ID}
        clientSecret: ${KEYCLOAK_CLIENT_SECRET}
        schedule:
          frequency: { minutes: 10 }
          initialDelay: { seconds: 15 }
          timeout: { minutes: 10 }
```

## Sign-in resolvers

The resolvers are tried in order; the first match establishes the Backstage identity:

| Resolver | What it matches |
|---|---|
| `oidcSubClaimMatchingKeycloakUserId` | OIDC `sub` claim → `keycloak.org/id` annotation on the User entity |
| `preferredUsernameMatchingUserEntityName` | Keycloak `preferred_username` → `metadata.name` |
| `emailMatchingUserEntityProfileEmail` | OIDC `email` → `spec.profile.email` |
| `emailLocalPartMatchingUserEntityName` | Email local part → `metadata.name` |

:::tip
`oidcSubClaimMatchingKeycloakUserId` is the most robust resolver when org sync is active, because Keycloak UUIDs are stable across username changes. The fallback resolvers handle cases where the org sync has not yet run or the user entity has no `keycloak.org/id` annotation.
:::

## Org sync

The `keycloakOrg` provider uses the client's service account to list realm users and groups. The service account must have the `view-users` and `query-groups` roles assigned (in Keycloak, under **Clients → your-client → Service Account Roles**).

## Quick start

```bash
docker run -p 7007:7007 \
  -e VEECODE_PRESETS=recommended,keycloak \
  -e KEYCLOAK_BASE_URL=https://keycloak.example.com/auth \
  -e KEYCLOAK_REALM=my-realm \
  -e KEYCLOAK_CLIENT_ID=devportal \
  -e KEYCLOAK_CLIENT_SECRET=<client-secret> \
  -e AUTH_SESSION_SECRET=<random-secret-min-32-chars> \
  veecode/devportal:2.2.0
```

### Docker Compose

```yaml
services:
  devportal:
    image: veecode/devportal:2.2.0
    ports:
      - "7007:7007"
    environment:
      VEECODE_PRESETS: recommended,keycloak
      KEYCLOAK_BASE_URL: https://keycloak.example.com/auth
      KEYCLOAK_REALM: my-realm
      KEYCLOAK_CLIENT_ID: devportal
      KEYCLOAK_CLIENT_SECRET: ${KEYCLOAK_CLIENT_SECRET}
      AUTH_SESSION_SECRET: ${AUTH_SESSION_SECRET}
```

## Troubleshooting

- **OIDC discovery fails**: Verify `KEYCLOAK_BASE_URL` is reachable from the DevPortal container. The discovery URL is `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/.well-known/openid-configuration`.
- **Sign-in resolvers all fail**: Run org sync first so User entities with `keycloak.org/id` annotations exist in the catalog. Until the first sync completes, only the email-based fallback resolvers will work.
- **Org sync 403**: The service account is missing `view-users` or `query-groups` roles. Assign them under **Clients → your-client → Service Account Roles** in the Keycloak admin console.
- **Session errors**: `AUTH_SESSION_SECRET` must be stable across restarts. Changing it invalidates all existing sessions.
- **Exclusive-group conflict at boot**: You have more than one identity preset in `VEECODE_PRESETS`. Keep only `keycloak` or switch to a different identity preset.

## References

- [Backstage OIDC Auth Provider](https://backstage.io/docs/auth/oidc/)
- [Backstage Keycloak Org Provider](https://backstage.io/docs/integrations/keycloak/org/)
- [Keycloak Documentation](https://www.keycloak.org/docs/latest/)
