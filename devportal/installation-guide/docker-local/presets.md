---
sidebar_position: 2
sidebar_label: Presets
title: Quick Setup with Presets
---

## Using VeeCode Presets

DevPortal V2 uses **presets** to configure integrations, identity providers, and bundled plugins at startup. Instead of manually writing `app-config.local.yaml`, set `VEECODE_PRESETS` to a comma-separated list of preset names. The container resolver validates required variables, wires the preset's plugins into the dynamic-plugins chain, and merges the preset's config — all before the backend starts.

If any required variable for a selected preset is missing, the boot fails with exit code 78 and logs exactly which variable is needed.

## How Presets Work

Each preset is a YAML file in `/app/presets/` inside the image. It declares:

- **`plugins`**: which bundled plugins to activate for this preset
- **`appConfig`**: the config fragment to merge into the startup config chain
- **`requires.variables`**: environment variables the preset needs
- **`exclusive_group`**: prevents two identity providers from being selected together

The preset list is composable: `VEECODE_PRESETS=recommended,veecode-theme,github,github-auth` activates all four presets in order.

### Identity exclusivity

Only one preset from the identity group can be active at a time. The valid identity presets are:

`github-auth`, `gitlab`, `azure-auth`, `keycloak`, `ldap`

Selecting two of these together fails the boot immediately (exit 78).

## Available Presets

| Preset | Purpose | Identity? |
|--------|---------|-----------|
| `recommended` | Marketplace, RBAC, tech-radar | No |
| `veecode-theme` | VeeCode branding theme | No |
| `github` | GitHub SCM + catalog discovery | No |
| `github-auth` | GitHub OAuth sign-in | Yes |
| `gitlab` | GitLab SCM + catalog discovery + OAuth sign-in | Yes |
| `azure` | Azure DevOps SCM + catalog discovery | No |
| `azure-auth` | Azure Entra ID (Microsoft) sign-in | Yes |
| `keycloak` | Keycloak OIDC sign-in | Yes |
| `ldap` | LDAP authentication + org sync | Yes |
| `ldap-ad` | LDAP (Active Directory variant) + org sync — override layer, must be composed with `ldap` | No |
| `mcp` | MCP actions server | No |
| `mcp-chat` | MCP chat provider | No |
| `sonarqube` | SonarQube code quality integration | No |
| `kubernetes` | Kubernetes cluster integration | No |
| `jenkins` | Jenkins CI integration | No |

:::note
`recommended` is the baseline for production use. It activates the marketplace, RBAC, and tech-radar plugins. Without it, DevPortal boots in minimal mode.
:::

---

## Preset Reference

### `recommended`

Activates marketplace, RBAC, and tech-radar. No required variables. Add this to every deployment.

```yaml
environment:
  - VEECODE_PRESETS=recommended
```

---

### `veecode-theme`

Applies the VeeCode visual theme. No required variables. Combine with `recommended` for standard branding.

---

### `github`

GitHub SCM integration: catalog autodiscovery and GitHub Actions/Issues/PRs.

**Required variables:**

| Variable | Description |
|----------|-------------|
| `GITHUB_PAT` | Personal access token with `repo` and `read:org` scope |
| `GITHUB_ORG` | GitHub organization name for catalog discovery |

**Docker Compose example:**

```yaml
services:
  devportal:
    image: veecode/devportal:2.1.3
    ports:
      - "7007:7007"
    environment:
      - VEECODE_PRESETS=recommended,veecode-theme,github
      - GITHUB_PAT
      - GITHUB_ORG
    volumes:
      - dp-data:/app/data
      - dp-plugins:/app/dynamic-plugins-root

volumes:
  dp-data:
  dp-plugins:
```

Use together with `github-auth` to add OAuth sign-in.

---

### `github-auth`

GitHub OAuth sign-in (identity provider).

**Required variables:**

| Variable | Description |
|----------|-------------|
| `GITHUB_PAT` | Personal access token (also used by the `github` preset) |
| `GITHUB_ORG` | GitHub organization name |
| `GITHUB_AUTH_CLIENT_ID` | OAuth App client ID |
| `GITHUB_AUTH_CLIENT_SECRET` | OAuth App client secret |

**Docker Compose example (full GitHub setup):**

```yaml
services:
  devportal:
    image: veecode/devportal:2.1.3
    ports:
      - "7007:7007"
    environment:
      - VEECODE_PRESETS=recommended,veecode-theme,github,github-auth
      - GITHUB_PAT
      - GITHUB_ORG
      - GITHUB_AUTH_CLIENT_ID
      - GITHUB_AUTH_CLIENT_SECRET
    volumes:
      - dp-data:/app/data
      - dp-plugins:/app/dynamic-plugins-root

volumes:
  dp-data:
  dp-plugins:
```

For instructions on creating a GitHub OAuth App, see the [GitHub integration guide](/devportal/integrations/GitHub/github-auth).

---

### `gitlab`

GitLab SCM integration + GitLab OAuth sign-in. This single preset covers both catalog discovery and authentication.

**Required variables:**

| Variable | Description |
|----------|-------------|
| `GITLAB_HOST` | GitLab hostname — e.g., `gitlab.com` or `gitlab.example.com` |
| `GITLAB_AUTH_CLIENT_ID` | OAuth Application ID |
| `GITLAB_AUTH_CLIENT_SECRET` | OAuth Application Secret |
| `GITLAB_TOKEN` | Personal or Group Access Token with `read_api` scope |
| `GITLAB_GROUP` | Root group for org sync and discovery — e.g., `my-org` |

**Optional:**

| Variable | Description |
|----------|-------------|
| `GITLAB_GROUP_PATTERN` | Optional regex to filter groups during sync. No default — if unset, no group filter is applied. |

**Docker Compose example:**

```yaml
services:
  devportal:
    image: veecode/devportal:2.1.3
    ports:
      - "7007:7007"
    environment:
      - VEECODE_PRESETS=recommended,veecode-theme,gitlab
      - GITLAB_HOST
      - GITLAB_AUTH_CLIENT_ID
      - GITLAB_AUTH_CLIENT_SECRET
      - GITLAB_TOKEN
      - GITLAB_GROUP
    volumes:
      - dp-data:/app/data
      - dp-plugins:/app/dynamic-plugins-root

volumes:
  dp-data:
  dp-plugins:
```

For instructions on creating a GitLab OAuth Application, see the [GitLab integration guide](/devportal/integrations/GitLab/gitlab-auth).

---

### `azure`

Azure DevOps SCM integration: catalog autodiscovery from Azure DevOps repos.

**Required variables:**

| Variable | Description |
|----------|-------------|
| `AZURE_DEVOPS_TOKEN` | Azure DevOps PAT with `Code (Read)` scope |
| `AZURE_DEVOPS_HOST` | Azure DevOps hostname — e.g., `dev.azure.com` |
| `AZURE_DEVOPS_ORG` | Azure DevOps organization name |
| `AZURE_DEVOPS_PROJECT` | DevOps project to scan. Use `*` to scan all projects in the org. |

Combine with `azure-auth` to add Microsoft Entra ID sign-in.

---

### `azure-auth`

Azure Entra ID (Microsoft) sign-in (identity provider).

**Required variables:**

| Variable | Description |
|----------|-------------|
| `AZURE_AUTH_TENANT_ID` | Azure AD tenant ID |
| `AZURE_AUTH_CLIENT_ID` | App registration client ID |
| `AZURE_AUTH_CLIENT_SECRET` | App registration client secret |

**Docker Compose example (full Azure setup):**

```yaml
services:
  devportal:
    image: veecode/devportal:2.1.3
    ports:
      - "7007:7007"
    environment:
      - VEECODE_PRESETS=recommended,veecode-theme,azure,azure-auth
      - AZURE_DEVOPS_TOKEN
      - AZURE_DEVOPS_HOST=dev.azure.com
      - AZURE_DEVOPS_ORG
      - AZURE_DEVOPS_PROJECT
      - AZURE_AUTH_TENANT_ID
      - AZURE_AUTH_CLIENT_ID
      - AZURE_AUTH_CLIENT_SECRET
    volumes:
      - dp-data:/app/data
      - dp-plugins:/app/dynamic-plugins-root

volumes:
  dp-data:
  dp-plugins:
```

For setup instructions, see the [Azure integration guide](/devportal/integrations/Azure).

---

### `keycloak`

Keycloak OIDC sign-in and org sync (identity provider).

**Required variables:**

| Variable | Description |
|----------|-------------|
| `KEYCLOAK_BASE_URL` | Full URL to your Keycloak server — e.g., `https://auth.example.com` |
| `KEYCLOAK_REALM` | Keycloak realm name |
| `KEYCLOAK_CLIENT_ID` | Client ID configured in Keycloak |
| `KEYCLOAK_CLIENT_SECRET` | Client secret |
| `AUTH_SESSION_SECRET` | Random string for session cookie signing |

For setup instructions, see the [Keycloak integration guide](/devportal/integrations/Keycloak/keycloak-auth).

---

### `ldap`

LDAP authentication and org sync for standard LDAP directories (OpenLDAP, FreeIPA, etc.).

**Required variables:**

| Variable | Description |
|----------|-------------|
| `LDAP_URL` | LDAP server URL — e.g., `ldap://ldap.example.com` |
| `LDAP_DN` | Bind DN for service account |
| `LDAP_SECRET` | Bind password |
| `LDAP_USERS_BASE_DN` | Base DN for user search |
| `LDAP_GROUPS_BASE_DN` | Base DN for group search |

For setup instructions, see the [LDAP integration guide](/devportal/integrations/LDAP).

---

### `ldap-ad`

LDAP authentication tuned for Microsoft Active Directory (and Samba AD). Uses `sAMAccountName` as the login attribute.

`ldap-ad` adds no new required variables — it reuses all `ldap` vars. `LDAP_USERS_FILTER` and `LDAP_GROUPS_FILTER` are optional in both presets and default to AD-appropriate filters if unset.

For setup instructions, see the [LDAP integration guide](/devportal/integrations/LDAP).

---

### `mcp`

MCP (Model Context Protocol) actions server integration. No required variables — see the [MCP integration guide](/devportal/integrations/mcp) for configuration.

---

### `mcp-chat`

MCP chat provider integration.

**Required variables:**

| Variable | Description |
|----------|-------------|
| `MCP_CHAT_PROVIDER` | Chat provider name — `claude` or `openai` |
| `MCP_CHAT_API_KEY` | API key for the chat provider |
| `MCP_CHAT_MODEL` | Model identifier — e.g., `claude-sonnet-4-6-latest` (check your provider's current model catalogue) |

---

## Runtime Variables (any preset)

These variables apply regardless of which presets are selected:

| Variable | Description | Default |
|---|---|---|
| `DEVELOPMENT` | Enable nodemon hot-reload + watch config files | `false` |
| `DEBUG_PORT` | Start Node.js with `--inspect=0.0.0.0:<port>` | unset |
| `CATALOG_INDEX_REFRESH` | Force re-download of the marketplace catalog index | `false` |
| `CATALOG_INDEX_IMAGE` | OCI image for marketplace catalog entities | `quay.io/veecode/plugin-catalog-index:latest` |
| `PLUGIN_REGISTRY` | Mirror registry for OCI plugin images (air-gapped deployments) | `quay.io/veecode` |
| `VEECODE_APP_CONFIG` | Base64-encoded `app-config` blob, decoded to `app-config.saas.yaml` (SaaS mode only) | unset |

---

## Next Steps

- [Custom Configuration](./custom-config) — mount `app-config.local.yaml` for overrides not covered by a preset
- [Dynamic Plugins](./custom-plugins) — override individual plugin settings at runtime
- [Custom Catalog](./custom-catalog) — mount local catalog files
