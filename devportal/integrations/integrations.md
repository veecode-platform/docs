---
sidebar_position: 0
sidebar_label: Auth & Integrations
title: Auth & Integrations
---

An usually confusing topic in Backstage world are its backend integrations and authentication mechanisms. This section explains how V2 DevPortal activates and configures each provider, and prepares you to read the per-provider pages.

## How integrations are activated in V2

In V2, every integration is activated by adding a **preset** name to the `VEECODE_PRESETS` environment variable. A preset is a YAML file (`presets/<name>.yaml`) that carries three things: the env vars the operator must supply, the dynamic plugins the integration needs (as OCI references), and the `app-config` block those plugins expect.

```sh
VEECODE_PRESETS=recommended,github,github-auth
```

The entrypoint validates all required variables across all selected presets at startup. If any are missing, the process exits with code 78 and lists every missing variable before the backend boots.

See [Presets](/devportal/concepts/presets) for how composition and layering work.

## SCM vs identity presets

DevPortal splits **source-control** (SCM) capabilities from **identity** (who can sign in) into separate presets. This lets you mix and match — for example, GitHub repositories with Keycloak sign-in, or Azure DevOps repos with GitHub OAuth.

| Axis | Presets | What they configure |
|---|---|---|
| SCM / backend | `github`, `azure` | Catalog discovery, scaffolder, CI/CD UI tabs, integration token |
| Identity | `github-auth`, `azure-auth`, `gitlab`, `keycloak`, `ldap` | OAuth/OIDC/LDAP sign-in + org sync (Users + Groups in the catalog) |

:::important
**The `identity` group is exclusive**: you can only activate one identity preset per deployment. Selecting two (e.g., `github-auth,keycloak`) will fail at boot with an exclusive-group conflict error. The presets in the identity group are: `github-auth`, `gitlab`, `azure-auth`, `keycloak`, `ldap`. (`ldap-ad` is an override layer that composes with `ldap`, not a standalone identity choice.)
:::

## Provider overview

| Provider | SCM preset | Identity preset | Auth type | Org sync |
|---|---|---|---|---|
| [GitHub](./GitHub/github.md) | `github` | `github-auth` | OAuth 2.0 (OAuth App) | GitHub Org / Teams |
| [GitLab](./GitLab/gitlab.md) | — | `gitlab` | OAuth 2.0 | GitLab Groups |
| [Azure / Microsoft](./Azure/azure.md) | `azure` | `azure-auth` | Microsoft OIDC (Entra ID) | Microsoft Graph |
| [Keycloak](./Keycloak/keycloak-auth.md) | — | `keycloak` | OIDC | Keycloak Realm |
| [LDAP / Active Directory](./LDAP/ldap.md) | — | `ldap` / `ldap-ad` | LDAP bind | LDAP org sync |
| [MCP (AI Tooling)](./mcp.md) | — | — | OAuth 2.1 + DCR | n/a |

:::note
GitLab is a single preset (`gitlab`) that covers both SCM and identity. There is no separate `gitlab-auth` preset — the OAuth sign-in and catalog discovery are wired together.
:::

## Authentication overview

Backstage authentication typically follows a standard OAuth 2.0 / OpenID Connect pattern, where the user is redirected to an external Identity Provider (IdP) or SaaS platform to sign in, and then redirected back to Backstage.

:::tip
This is the recommended approach for most scenarios, as it leverages the security and features of established identity providers, and avoids handling sensitive credentials directly within Backstage.
:::

At a high level, the flow looks like this:

- The Backstage frontend starts the sign-in and redirects the user to the chosen provider (for example GitHub or GitLab).
- After the user authorizes access, the provider redirects back to Backstage with an authorization code.
- The Backstage backend auth plugin exchanges that code for tokens and establishes the Backstage identity/session.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as Backstage Frontend
	participant BE as Backstage Backend (auth plugin)
	participant IdP as OAuth Provider (GitHub/GitLab)

	User->>FE: Click "Sign in"
	FE->>IdP: Redirect to /authorize (clientId, scope, redirect_uri, state)
	IdP->>User: Login + consent
	IdP-->>FE: Redirect back (authorization code + state)
	FE->>BE: Call auth callback endpoint with code
	BE->>IdP: POST /token (code + clientSecret)
	IdP-->>BE: Access token (and optionally refresh/id token)
	BE-->>FE: Session/identity established
```

To enable this, you must register an OAuth application on the target platform (e.g., create an OAuth App on GitHub, or an Application on GitLab) and generate credentials such as a `clientId` and `clientSecret`. These values are then supplied as environment variables consumed by the identity preset.

:::note
The LDAP auth flow is different: the Backstage backend binds directly to the LDAP server using an admin credential, then validates user credentials by attempting a bind as the authenticating user. There is no redirect flow.
:::

## Integrations overview

In Backstage, an **integration** is the configuration that lets the backend (and sometimes specific plugins) talk to external systems like source control providers (GitHub/GitLab/Azure DevOps), artifact registries, CI/CD systems, cloud APIs, etc.

Most integrations are configured in `app-config.yaml` (or environment variables) and then reused by multiple plugins. For example, the catalog and scaffolder can use SCM integrations to read `catalog-info.yaml`, fetch templates, open pull requests, or query repository metadata.

Credential-wise, integrations usually fall into one of these patterns:

- **OAuth application credentials** (for example `clientId` / `clientSecret`), commonly used when a plugin needs OAuth flows or token exchange.
- **Personal Access Tokens (PATs) or similar static tokens**, commonly used for server-to-server API calls.
- **Both**, where Backstage prefers OAuth/user tokens when available but can fall back to a configured token for background jobs or automation.

## Organizational data

A special case of integrations are **organizational data sources**, which are used to populate the Backstage catalog with **Users** and **Groups** from external systems (for example: GitHub Organizations/teams, GitLab groups, LDAP/Active Directory, Azure AD, etc.).

This matters because many Backstage features assume your organization exists as catalog entities:

- **Ownership and metadata**: entities often declare owners like `spec.owner: group:default/platform-team`.
- **Search and discovery**: users and teams can be browsed like any other catalog entity.
- **Permissions/RBAC**: the permission system can make authorization decisions based on "who is this user?" and "which groups are they in?".

In practice, the flow is usually:

- An org data provider syncs users/groups into the catalog.
- When a user signs in, Backstage maps the authenticated identity to a catalog **User** entity.
- Permission policies and permission-enabled plugins can then check group membership (from the catalog) to allow/deny actions.

## Understand the differences

Integrations configuration are different than authentication configuration, even if they sometimes share similar concepts (like OAuth apps or tokens).

- **Authentication** answers "who is the user?" and is mostly about the frontend sign-in flow and establishing a Backstage session.
- **Integrations** answer "how can Backstage call external APIs?" and are typically used by both **core** and **third-party** plugins to fetch data, read repositories, validate URLs, enrich entities, or trigger actions.

:::important
Integrations are most likely to be reused by both core Backstage and multiple plugins, while authentication is exclusively used by its identity provider.
:::

## Understand service identity

Integrations are configured in the backend and used server-side, **usually assuming a service identity** (for example: a PAT or OAuth app credentials). This means that **for most Backstage integrations** the integration represents DevPortal (Backstage) itself when it talks to external systems, not the end user.

There are exceptions to this rule, but they are less common and are always plugin-specific (for example: some plugins may support user token exchange to act on behalf of the signed-in user). A plugin that supports acting on behalf of the user will usually document how to set it up and mention such behavior.

For example, the **Kubernetes plugin** can (depending on configuration) propagate the signed-in user identity when talking to the Kubernetes API, instead of always using only a single backend service credential.

## Understand reuse implications

You should understand the generic implications of reusing the same OAuth credentials for authentication and integrations. **This is supported** and pretty much ok in local development and PoCs, but not recommended for production.

The main concern is that the shared client must be granted the combined set of scopes required for authentication and integrations. As a result, users are asked to consent to broader permissions than strictly necessary for sign-in, and the blast radius of those credentials is larger than it needs to be. Also consent screens and scopes will scare users and make them question the security of your Backstage instance.
