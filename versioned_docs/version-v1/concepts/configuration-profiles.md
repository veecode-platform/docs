---
sidebar_position: 6
sidebar_label: Configuration Profiles
title: Configuration Profiles
---

# Configuration Profiles (`VEECODE_PROFILE`)

DevPortal ships seven **configuration profiles**, each enabling a different authentication and identity provider. A profile is selected at startup by setting the `VEECODE_PROFILE` environment variable. The entrypoint script loads the corresponding `app-config.<profile>.yaml` on top of the base configuration.

---

## The 7 Profiles

| Profile | Provider | Primary use case |
| --- | --- | --- |
| `github-pat` | GitHub (Personal Access Token) | GitHub integration without OAuth sign-in; uses `GITHUB_TOKEN` for catalog/org-sync only |
| `github` | GitHub OAuth App | Full GitHub integration with OAuth sign-in |
| `gitlab` | GitLab OAuth App | Full GitLab integration with OAuth sign-in |
| `keycloak` | Keycloak | Enterprise SSO via OpenID Connect |
| `azure` | Azure AD | Microsoft Entra ID / Azure Active Directory |
| `ldap` | Generic LDAP | LDAP directory integration |
| `ldap-ad` | Active Directory (LDAP) | AD-specific LDAP with `sAMAccountName` and AD object classes |

---

## How Profiles Are Loaded

At container startup, `entrypoint.sh` reads `VEECODE_PROFILE` and passes the matching config file as an extra `--config` argument to Backstage:

```
app-config.yaml
  → app-config.production.yaml
    → app-config.<profile>.yaml    ← loaded here
      → app-config.distro.yaml
        → ...
```

See [Configuration Hierarchy](./configuration-hierarchy.md) for the full 7-layer merge order.

---

## Key Environment Variables per Profile

### `github-pat`
| Variable | Required | Notes |
| --- | --- | --- |
| `GITHUB_TOKEN` | Yes | Personal Access Token for catalog/org-sync |
| `GITHUB_ORG` | Yes | GitHub organization name |

This profile does **not** enable OAuth sign-in. Users authenticate as guest or via another mechanism.

### `github`
| Variable | Required | Notes |
| --- | --- | --- |
| `GITHUB_CLIENT_ID` | Yes | GitHub App client ID (for integrations) |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub App client secret (for integrations) |
| `GITHUB_APP_ID` | Yes | GitHub App ID |
| `GITHUB_PRIVATE_KEY` | Yes | GitHub App private key (YAML block scalar `\|`) |
| `GITHUB_ORG` | Yes | GitHub organization name |

Sign-in uses `GITHUB_AUTH_CLIENT_ID` / `GITHUB_AUTH_CLIENT_SECRET`. If those are unset, the entrypoint auto-copies `GITHUB_CLIENT_ID` → `GITHUB_AUTH_CLIENT_ID` and `GITHUB_CLIENT_SECRET` → `GITHUB_AUTH_CLIENT_SECRET`, so a single GitHub App's OAuth credentials can serve both sign-in and integration.

### `gitlab`
| Variable | Required | Notes |
| --- | --- | --- |
| `GITLAB_AUTH_CLIENT_ID` | Yes | GitLab OAuth Application client ID |
| `GITLAB_AUTH_CLIENT_SECRET` | Yes | GitLab OAuth Application client secret |
| `GITLAB_TOKEN` | Yes | Personal/group token for catalog integration |
| `GITLAB_HOST` | Yes | GitLab host (e.g., `gitlab.com`) |
| `GITLAB_GROUP` | Yes | Root group for catalog discovery |

### `keycloak`
| Variable | Required | Notes |
| --- | --- | --- |
| `KEYCLOAK_BASE_URL` | Yes | e.g., `https://keycloak.example.com` |
| `KEYCLOAK_CLIENT_ID` | Yes | Client ID in Keycloak |
| `KEYCLOAK_CLIENT_SECRET` | Yes | Client secret |
| `KEYCLOAK_REALM` | Yes | Realm name |
| `AUTH_SESSION_SECRET` | Yes | Session encryption secret |

The entrypoint derives `KEYCLOAK_METADATA_URL` from `KEYCLOAK_BASE_URL` + `KEYCLOAK_REALM` if not set explicitly.

### `azure`
| Variable | Required | Notes |
| --- | --- | --- |
| `AZURE_CLIENT_ID` | Yes | Azure AD app client ID |
| `AZURE_CLIENT_SECRET` | Yes | Azure AD app client secret |
| `AZURE_TENANT_ID` | Yes | Azure AD tenant ID |
| `AZURE_ORGANIZATION` | Yes | Azure DevOps organization |
| `AUTH_SESSION_SECRET` | Yes | Session encryption secret |

### `ldap` / `ldap-ad`
See `app-config.ldap.yaml` / `app-config.ldap-ad.yaml` for the full set of `LDAP_*` variables. The `ldap-ad` profile defaults `LDAP_TLS_REJECT_UNAUTHORIZED=true` and uses AD-specific object classes.

---

## Notes

- RSA private keys (e.g., `GITHUB_PRIVATE_KEY`) **must** use a YAML block scalar (`|`) to preserve newlines. Inline strings break parsing.
- If no profile is set, the base `app-config.yaml` guest auth is used (development only).
- Profiles are additive — the profile config merges on top of the base; it does not replace it.

For installation instructions that use these profiles, see the [installation guide](/devportal/installation-guide/simple-setup).
