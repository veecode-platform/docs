---
sidebar_position: 1
sidebar_label: Keycloak Authentication
title: Sign in with Keycloak
---

This page configures Keycloak sign-in for DevPortal 3.x over OIDC, plus the Keycloak organization sync that imports users and groups into the catalog. The two are separate: sign-in is application configuration, and organization sync is a Marketplace module with its own configuration.

The tested Keycloak run for 3.x is [Install DevPortal on Kubernetes](../../installation-guide/production-setup/setup.md), Steps 4 to 6. Those steps start Keycloak with the realm, client, and service account the portal needs, store the credentials in a runtime Secret, and install the portal with the OIDC and catalog configuration. Follow them for a Kubernetes install instead of duplicating their commands here. The sections below explain the configuration for the local stack and what each part does.

The 3.x backend registers the generic `oidc` sign-in provider, which is what Keycloak connects through. Its default resolvers match the Keycloak user ID and LDAP UUID annotations on catalog User entities. Sign-in succeeds only when the catalog already holds a matching User entity, so set up organization sync before you test sign-in.

## What the install guide sets up

Step 4 creates a `devportal` realm with a confidential `devportal` client (standard flow on), a redirect URI of `https://<portal-host>/*`, and a service account holding the `realm-management` roles `view-users`, `query-users`, `query-groups`, and `view-realm`. Step 5 stores the Keycloak address, realm, client ID, and client secret in the runtime Secret. Step 6 installs the portal with guest sign-in off (`global.veecode.guestAuth.enabled: false`), the OIDC provider, and the Keycloak catalog module.

For any other OIDC provider, keep the same shape and point the metadata URL, client ID, and client secret at it.

## Configure Keycloak sign-in

Add this block to a custom configuration fragment on the local stack (see [Add configuration to the local stack](../../installation-guide/docker-local/custom-config.md)), or to an `extraAppConfig` fragment in the chart `values.yaml`. The `production` entry must match `auth.environment`.

```yaml
auth:
  environment: production
  session:
    secret: ${AUTH_SESSION_SECRET}
  providers:
    oidc:
      production:
        metadataUrl: ${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/.well-known/openid-configuration
        clientId: ${KEYCLOAK_CLIENT_ID}
        clientSecret: ${KEYCLOAK_CLIENT_SECRET}
        prompt: auto
signInPage: oidc
```

What the keys do:

- `metadataUrl` is the realm's OpenID configuration document. The backend reads the token, user information, and signing key endpoints from it.
- `clientId` and `clientSecret` identify the confidential client created in Step 4 of the install guide.
- `prompt: auto` lets Keycloak decide whether to ask for credentials or skip the login prompt when the user has a session.
- `signInPage: oidc` makes the OIDC provider the sign-in method.

Pass the secrets as environment variables rather than writing them into the file. On the local stack, set them on the `devportal` service in a Compose override. On Kubernetes, store them in the runtime Secret as Step 5 does. Also turn guest sign-in off: drop the guest fragment from the local configuration chain, or keep `global.veecode.guestAuth.enabled: false` on Kubernetes. Restart the portal so it loads the new configuration. The portal can take up to two minutes before `/healthcheck` returns 200; test sign-in after that.

## Import users and groups

The `keycloak-catalog-integration` module imports Keycloak users and groups as User and Group entities on a schedule. Install it from the Marketplace Extensions page, or add it through chart configuration as Step 6 does:

```yaml
global:
  dynamic:
    plugins:
      - package: ./dynamic-plugins/dist/backstage-community-plugin-catalog-backend-module-keycloak-dynamic
        disabled: false
        pluginConfig:
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
                    frequency: {minutes: 5}
                    initialDelay: {seconds: 15}
                    timeout: {minutes: 3}
```

What the keys do:

- `baseUrl` is the address the portal backend uses to reach Keycloak. `loginRealm` is the realm used to authenticate, and `realm` is the realm to read users from.
- `clientId` and `clientSecret` authenticate the service account that reads users and groups. It needs the `realm-management` roles listed above.
- The schedule imports 15 seconds after the portal starts and then every 5 minutes.

The portal signs a user in only after it has imported that user. For a user who is not in the catalog yet, sign-in fails until the next import runs.

## Sign-in resolvers

The backend default for OIDC tries the Keycloak user ID resolver and then the LDAP UUID resolver against the annotations on catalog User entities. When users come from the Keycloak sync module, the default works without further configuration. See [Sign-in identities and resolvers](https://backstage.io/docs/auth/identity-resolver) for custom options.

## Troubleshooting

- Sign-in fails with an identity resolution error: the User entity is missing from the catalog. Wait for the next import and confirm the user appears in the catalog before signing in again.
- The OIDC button does not appear: check that `auth.environment` matches the provider entry name (`production` in the example) and that the portal restarted with the fragment loaded.
- Sign-out fails: the backend calls Keycloak at its public address when a user signs out. The backend must resolve that name and trust its certificate, as described in Step 6 of the install guide.
