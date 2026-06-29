---
sidebar_position: 2
sidebar_label: Profiles
title: Quick Setup with Profiles
---

## Using VeeCode Profiles

VeeCode DevPortal supports **profiles** as a convenient way to quickly configure authentication and catalog integration for common identity providers. Instead of manually configuring `app-config.local.yaml`, you can set the `VEECODE_PROFILE` environment variable and DevPortal will merge the corresponding pre-built configuration during startup.

## What are Profiles?

Profiles are pre-configured setups that automatically configure:

- **Authentication**: Login integration against your identity provider
- **Catalog Integration**: Automatic discovery of repositories and catalog files
- **Organizational Data**: Replicate your organization's users and groups structure in DevPortal
- **Default Settings**: Sensible defaults for common use cases

A profile is activated by setting the `VEECODE_PROFILE` environment variable to one of the supported profile names:

| Profile | Auth | Org Data | Discovery |
|---------|------|----------|-----------|
| `github-pat` | Guest (none) | Built-in (or from catalog) | Repos in org |
| `github` | GitHub OAuth | Teams and members | Repos in org |
| `gitlab` | GitLab OAuth | Groups and members | Repos in group |
| `keycloak` | Keycloak OIDC | Users and groups from Keycloak | None |
| `azure` | Azure Entra ID | Groups and members | Repos in org/project |
| `ldap` | LDAP | Users and groups | None |
| `ldap-ad` | LDAP (Active Directory) | Users and groups | None |

Profile settings are opinionated starting points. They can be further customized or overridden by providing a custom `app-config.local.yaml` file.

## Available Profiles

### GitHub PAT Profile

The simplest GitHub-related profile. Requires only a GitHub PAT token for repo access. Authentication uses the "guest" mode (no sign-in required).

Use the following sample `docker-compose.yml`:

```yaml
services:
  devportal:
    image: veecode/devportal:latest
    ports:
      - "7007:7007"
    environment:
      - VEECODE_PROFILE=github-pat
      - GITHUB_ORG
      - GITHUB_TOKEN
```

Then run:

```bash
docker compose up --no-log-prefix
```

**What it configures:**

- Guest authentication
- GitHub catalog provider for automatic repository discovery
- GitHub integration for actions, issues, pull requests, and more

**Required environment variables:**

- `GITHUB_TOKEN`: Personal access token (classic or fine-grained) with `repo` or `public_repo` scope
- `GITHUB_ORG`: GitHub organization name for catalog discovery

:::note
A PAT is limited in API calls. Watch the container logs for rate-limiting errors. For production use, prefer the `github` profile with a GitHub App.
:::

---

### GitHub Profile

Create a `docker-compose.yml`:

```yaml
services:
  devportal:
    image: veecode/devportal:latest
    ports:
      - "7007:7007"
    environment:
      - VEECODE_PROFILE=github
      - GITHUB_ORG
      - GITHUB_AUTH_CLIENT_ID
      - GITHUB_AUTH_CLIENT_SECRET
      - GITHUB_APP_ID
      - GITHUB_CLIENT_ID
      - GITHUB_CLIENT_SECRET
      - GITHUB_PRIVATE_KEY
```

Then run:

```bash
docker compose up --no-log-prefix
```

**What it configures:**

- GitHub OAuth authentication
- GitHub App integration for organization catalog sync
- GitHub App for catalog discovery, actions, issues, pull requests, and more

**Required environment variables:**

- `GITHUB_ORG`: GitHub organization name
- `GITHUB_AUTH_CLIENT_ID`: OAuth App client ID (for sign-in)
- `GITHUB_AUTH_CLIENT_SECRET`: OAuth App client secret (for sign-in)
- `GITHUB_APP_ID`: GitHub App ID (for integrations)
- `GITHUB_CLIENT_ID`: GitHub App client ID (for integrations)
- `GITHUB_CLIENT_SECRET`: GitHub App client secret (for integrations)
- `GITHUB_PRIVATE_KEY`: GitHub App RSA private key (for integrations) — must preserve newlines (use a YAML block scalar `|` if embedding in config)

**Optional environment variables:**

- `GITHUB_PRIVATE_KEY_BASE64`: Base64-encoded alternative to `GITHUB_PRIVATE_KEY`. When set, the entrypoint decodes it automatically. Use this when newlines in the raw key cause shell/environment issues.
- `GITHUB_TOKEN`: Personal access token (fallback for non-App integrations)

:::note
If `GITHUB_AUTH_CLIENT_ID` is not set, the entrypoint automatically copies the value of `GITHUB_CLIENT_ID` to it. Both variables must ultimately resolve to the same OAuth App credentials for sign-in to work.
:::

For details on creating a GitHub OAuth App and GitHub App, see the [GitHub integration guide](/devportal/v1/integrations/GitHub/github-auth).

---

### GitLab Profile

Create a `docker-compose.yml`:

```yaml
services:
  devportal:
    image: veecode/devportal:latest
    ports:
      - "7007:7007"
    environment:
      - VEECODE_PROFILE=gitlab
      - GITLAB_HOST
      - GITLAB_AUTH_CLIENT_ID
      - GITLAB_AUTH_CLIENT_SECRET
      - GITLAB_TOKEN
      - GITLAB_GROUP
      - GITLAB_GROUP_PATTERN
```

Then run:

```bash
docker compose up --no-log-prefix
```

**What it configures:**

- GitLab OAuth authentication
- GitLab catalog provider for group/repo discovery
- GitLab integration

**Required environment variables:**

- `GITLAB_HOST`: GitLab hostname — e.g., `gitlab.com` or `gitlab.example.com`. There is no default; the container will fail to connect if this is unset.
- `GITLAB_AUTH_CLIENT_ID`: OAuth Application ID (for sign-in)
- `GITLAB_AUTH_CLIENT_SECRET`: OAuth Application Secret (for sign-in)
- `GITLAB_TOKEN`: Personal or Group Access Token with `read_api` scope (for catalog integration)
- `GITLAB_GROUP`: Root group for org sync and repository discovery (e.g., `my-org`)

**Optional environment variables:**

- `GITLAB_GROUP_PATTERN`: Pattern to match groups during catalog sync (defaults to `[\s\S]*` — all groups)

For details on creating a GitLab OAuth Application, see the [GitLab integration guide](/devportal/v1/integrations/GitLab/gitlab-auth).

:::caution
The correct variable names are `GITLAB_AUTH_CLIENT_ID` and `GITLAB_AUTH_CLIENT_SECRET`. Do not use `GITLAB_CLIENT_ID` or `GITLAB_CLIENT_SECRET` — these are not read by the profile config and GitLab OAuth will silently fail.
:::

---

### Keycloak Profile

Create a `docker-compose.yml`:

```yaml
services:
  devportal:
    image: veecode/devportal:latest
    ports:
      - "7007:7007"
    environment:
      - VEECODE_PROFILE=keycloak
      - KEYCLOAK_BASE_URL
      - KEYCLOAK_REALM
      - KEYCLOAK_CLIENT_ID
      - KEYCLOAK_CLIENT_SECRET
      - AUTH_SESSION_SECRET
```

Then run:

```bash
docker compose up --no-log-prefix
```

**What it configures:**

- Keycloak OIDC authentication (sign-in via Keycloak)
- Keycloak organization sync (users and groups from the realm)
- Session cookie management

**Required environment variables:**

- `KEYCLOAK_BASE_URL`: Full URL to your Keycloak server — e.g., `https://auth.example.com`
- `KEYCLOAK_REALM`: Keycloak realm name — e.g., `my-realm`
- `KEYCLOAK_CLIENT_ID`: Client ID configured in Keycloak
- `KEYCLOAK_CLIENT_SECRET`: Client secret from Keycloak
- `AUTH_SESSION_SECRET`: Random string used to sign session cookies (any long random string)

**Optional environment variables:**

- `KEYCLOAK_METADATA_URL`: Computed and logged by the entrypoint as `$KEYCLOAK_BASE_URL/realms/$KEYCLOAK_REALM`. The bundled config builds the discovery URL from `KEYCLOAK_BASE_URL` + `KEYCLOAK_REALM` directly, so setting this variable alone does not change it — override `auth.providers` in `app-config.local.yaml` for a non-standard endpoint.

For setup instructions, see the [Keycloak integration guide](/devportal/v1/integrations/Keycloak/keycloak-auth).

---

### Azure DevOps Profile

Create a `docker-compose.yml`:

```yaml
services:
  devportal:
    image: veecode/devportal:latest
    ports:
      - "7007:7007"
    environment:
      - VEECODE_PROFILE=azure
      - AZURE_TENANT_ID
      - AZURE_CLIENT_ID
      - AZURE_CLIENT_SECRET
      - AZURE_ORGANIZATION
      - AZURE_TOKEN
      - AUTH_SESSION_SECRET
      - AZURE_PROJECT
```

Then run:

```bash
docker compose up --no-log-prefix
```

**What it configures:**

- Microsoft (Azure Entra ID) authentication
- Azure DevOps catalog provider for repo discovery
- Microsoft Graph org sync (users and groups)
- Azure DevOps integration

**Required environment variables:**

- `AZURE_TENANT_ID`: Azure Active Directory tenant ID (used for both auth and org sync)
- `AZURE_CLIENT_ID`: Azure application (client) ID
- `AZURE_CLIENT_SECRET`: Azure application client secret
- `AZURE_ORGANIZATION`: Azure DevOps organization name
- `AZURE_TOKEN`: Personal access token with `Code (Read)`, `Graph (Read)`, `Project and Team (Read)` scopes
- `AUTH_SESSION_SECRET`: Random string used to sign session cookies
- `AZURE_PROJECT`: Azure DevOps project to scan for repos. Set to `*` to discover across all projects in the organization. There is no default, so set it explicitly.

:::note
`AZURE_CLIENT_ID` and `AZURE_TENANT_ID` are used for both Microsoft Entra ID sign-in and Microsoft Graph org sync. Ensure the app registration has the necessary Microsoft Graph API permissions (`User.Read.All`, `Group.Read.All`).
:::

For setup instructions, see the [Azure integration guide](/devportal/v1/integrations/Azure).

---

### LDAP Profile

For organizations using standard LDAP directories (OpenLDAP, FreeIPA, etc.).

```yaml
services:
  devportal:
    image: veecode/devportal:latest
    ports:
      - "7007:7007"
    environment:
      - VEECODE_PROFILE=ldap
      - LDAP_URL
      - LDAP_DN
      - LDAP_SECRET
      - LDAP_USERS_BASE_DN
      - LDAP_GROUPS_BASE_DN
```

**What it configures:**

- LDAP authentication
- LDAP org sync (users and groups)

**Required environment variables:**

- `LDAP_URL`: LDAP server URL — e.g., `ldap://ldap.example.com`
- `LDAP_DN`: Bind DN for service account — e.g., `cn=admin,dc=example,dc=com`
- `LDAP_SECRET`: Bind password for the service account
- `LDAP_USERS_BASE_DN`: Base DN for user search — e.g., `ou=People,dc=example,dc=com`
- `LDAP_GROUPS_BASE_DN`: Base DN for group search — e.g., `ou=Groups,dc=example,dc=com`

**Optional environment variables:**

- `LDAP_USERS_FILTER`: LDAP filter for users (defaults to `(uid=*)`)
- `LDAP_GROUPS_FILTER`: LDAP filter for groups (defaults to `(objectClass=groupOfNames)`)

For setup instructions, see the [LDAP integration guide](/devportal/v1/integrations/LDAP).

---

### LDAP Active Directory Profile (`ldap-ad`)

A variant of the LDAP profile tuned for Microsoft Active Directory (and Samba AD). Uses `sAMAccountName` as the username attribute and AD-style object class filters by default.

```yaml
services:
  devportal:
    image: veecode/devportal:latest
    ports:
      - "7007:7007"
    environment:
      - VEECODE_PROFILE=ldap-ad
      - LDAP_URL
      - LDAP_DN
      - LDAP_SECRET
      - LDAP_USERS_BASE_DN
      - LDAP_GROUPS_BASE_DN
      - LDAP_USERS_FILTER
      - LDAP_GROUPS_FILTER
```

**What it configures:**

- LDAP authentication using `sAMAccountName` as the login attribute
- AD-tuned LDAP org sync with `cn`/`memberOf`/`member` attribute mapping

**Required environment variables:**

- `LDAP_URL`: LDAP/LDAPS server URL — e.g., `ldaps://dc.example.com`
- `LDAP_DN`: Bind DN for service account — e.g., `CN=svc-devportal,OU=ServiceAccounts,DC=example,DC=com`
- `LDAP_SECRET`: Bind password for the service account
- `LDAP_USERS_BASE_DN`: Base DN for user search — e.g., `OU=Users,DC=example,DC=com`
- `LDAP_GROUPS_BASE_DN`: Base DN for group search — e.g., `OU=Groups,DC=example,DC=com`
- `LDAP_USERS_FILTER`: LDAP filter for users — e.g., `(&(objectClass=user)(objectCategory=person))`
- `LDAP_GROUPS_FILTER`: LDAP filter for groups — e.g., `(objectClass=group)`

**Optional / auto-defaulted environment variables:**

- `LDAP_TLS_REJECT_UNAUTHORIZED`: Whether to reject untrusted TLS certificates. Defaults to `true`. Set to `false` when using self-signed certs (not recommended for production).
- `LDAP_SYNC_FREQUENCY`: ISO 8601 duration for org sync interval. Defaults to `PT1H` (every hour).

:::note
Unlike the `ldap` profile, `LDAP_USERS_FILTER` and `LDAP_GROUPS_FILTER` have no built-in defaults in `ldap-ad` and must be provided to match your AD schema.
:::

For setup instructions, see the [LDAP integration guide](/devportal/v1/integrations/LDAP).

---

## Operational Environment Variables

The following variables apply to any profile and control runtime behavior:

| Variable | Description | Default |
|---|---|---|
| `DEVELOPMENT` | Set to `true` to enable nodemon hot-reload and watch config files for changes. Useful during local setup. | `false` |
| `DEBUG_PORT` | When set, starts the Node.js process with `--inspect=0.0.0.0:<port>` for remote debugging. | unset |
| `CATALOG_INDEX_REFRESH` | Set to `true` to force re-download of the marketplace plugin catalog index from OCI on startup. Use when the marketplace is empty. | `false` |
| `CATALOG_INDEX_IMAGE` | OCI image containing marketplace catalog entities. | `quay.io/veecode/plugin-catalog-index:latest` |
| `VEECODE_APP_CONFIG` | Base64-encoded full `app-config` blob. Decoded into `app-config.saas.yaml` and loaded last (SaaS mode). Not needed for self-hosted. | unset |

---

## Config Merge Order

When a profile and a custom config file are both used, all config files are merged in this order (later entries override earlier ones):

1. `app-config.yaml` — base image defaults
2. `app-config.production.yaml` — production overrides baked into image
3. `app-config.{profile}.yaml` — profile-specific config (if `VEECODE_PROFILE` is set)
4. `app-config.distro.yaml` — distro-level overrides (baked in)
5. `app-config.local.yaml` — your custom file, mounted at `/app/app-config.local.yaml`
6. `dynamic-plugins-root/app-config.dynamic-plugins.yaml` — generated by the plugin install script at startup
7. `app-config.saas.yaml` — decoded from `VEECODE_APP_CONFIG` (SaaS mode only)

Your `app-config.local.yaml` (layer 5) takes precedence over the base image and profile defaults, but is itself superseded by plugin-injected config (layer 6). If a key you set in `local.yaml` seems to be ignored, check whether a plugin's `pluginConfig` block is overriding it in layer 6.

Example:

```yaml
services:
  devportal:
    image: veecode/devportal:latest
    ports:
      - "7007:7007"
    environment:
      - VEECODE_PROFILE=github
      - GITHUB_ORG
      - GITHUB_AUTH_CLIENT_ID
      - GITHUB_AUTH_CLIENT_SECRET
      - GITHUB_APP_ID
      - GITHUB_CLIENT_ID
      - GITHUB_CLIENT_SECRET
      - GITHUB_PRIVATE_KEY
    volumes:
      - ./app-config.local.yaml:/app/app-config.local.yaml:ro
```

---

## Getting OAuth Credentials

### GitHub App / OAuth App / PAT

See the [GitHub integration guide](/devportal/v1/integrations/GitHub/github-auth).

### GitLab OAuth App

1. Go to **User Settings** → **Applications** (or **Admin Area** → **Applications** for instance-wide)
2. Set **Redirect URI**: `http://localhost:7007/api/auth/gitlab/handler/frame`
3. Select scopes: `read_user`, `read_repository`, `write_repository`, `openid`, `profile`, `email`
4. Copy the **Application ID** (→ `GITLAB_AUTH_CLIENT_ID`) and **Secret** (→ `GITLAB_AUTH_CLIENT_SECRET`)

### Azure DevOps Token

1. Go to **User settings** → **Personal access tokens**
2. Create a new token with scopes: `Code (Read)`, `Graph (Read)`, `Project and Team (Read)`
3. Copy the token value (→ `AZURE_TOKEN`)

### Keycloak Client

1. In your Keycloak Admin Console, open your realm and go to **Clients** → **Create**
2. Set **Client ID** and enable **Client authentication**
3. Set **Valid redirect URIs**: `http://localhost:7007/api/auth/oidc/handler/frame`
4. Copy the client secret from the **Credentials** tab

---

## Troubleshooting

### Profile not loading

Check the container logs for a line like `VEECODE: Loading GitHub configuration...` during startup:

```bash
docker logs devportal
```

If no profile message appears, ensure `VEECODE_PROFILE` is set to an exact profile name (lowercase).

### Authentication fails

Verify your OAuth callback URLs match exactly:

- GitHub: `http://localhost:7007/api/auth/github/handler/frame`
- GitLab: `http://localhost:7007/api/auth/gitlab/handler/frame`
- Keycloak (OIDC): `http://localhost:7007/api/auth/oidc/handler/frame`
- Azure: `http://localhost:7007/api/auth/microsoft/handler/frame`

### Catalog not populating

Ensure your token has the correct permissions:

- GitHub: `repo` scope for private repos, `public_repo` for public
- GitLab: `read_api` scope
- Azure: `Code (Read)` scope

### Marketplace is empty

Force a fresh catalog index download on next startup:

```bash
docker run ... -e CATALOG_INDEX_REFRESH=true veecode/devportal:latest
```

---

## Next Steps

- [Custom Configuration](./custom-config.md) for advanced customization
- [Dynamic Plugins](./custom-plugins.md) to enable additional features
- [Custom Catalog](./custom-catalog.md) to add manual catalog entries
