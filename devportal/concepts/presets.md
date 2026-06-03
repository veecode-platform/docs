---
sidebar_position: 6
sidebar_label: Presets
title: Presets
---

# Presets (`VEECODE_PRESETS`)

DevPortal ships as a single unified image. A **preset** is what turns that
generic image into a working portal for a specific stack. Presets are
selected at runtime by setting the `VEECODE_PRESETS` environment variable to a
comma-separated list of names:

```sh
VEECODE_PRESETS=recommended,veecode-theme,github
```

The entrypoint resolves each listed preset **before** Backstage starts. If any
required environment variable is missing, the boot fails fast with exit code
**78** and names every missing variable at once.

:::note Presets replace the V1 `VEECODE_PROFILE`
In the previous distro model, a single `VEECODE_PROFILE` selected one
`app-config.<profile>.yaml`. V2 replaces that one-of-seven choice with
**composable** presets: you stack as many as you need, and they layer in order.
:::

---

## What a preset is

A preset is a versioned YAML file at `presets/<name>.yaml` that declares three
things:

| Field | Purpose |
| --- | --- |
| `requires.variables` | The environment variables the operator must supply, each with a description, `required` flag, optional `docs` URL, and `example`. |
| `plugins` | The dynamic plugins the situation needs. Each entry is self-contained: `package:` (OCI reference), `disabled: false`, and the full `pluginConfig:` block inline. |
| `appConfig` | The Backstage `app-config` block those plugins expect. Written to its own `app-config.preset-<name>.yaml` and passed to Backstage as a `--config` file. |

Many integration presets carry an empty `plugins: []` list — their backend
plugins (catalog, auth, scaffolder modules) are **static** (compiled into the
backend) and the preset only *configures* them via `appConfig`. See
[Dynamic Plugins](./dynamic-plugins.md) for the static-vs-dynamic split.

---

## How composition works at boot

`VEECODE_PRESETS=a,b,c` triggers the preset resolver in `entrypoint.sh`. For
each preset, in list order, it runs three steps:

1. **Variable validation** — for every `requires.variables` entry marked
   `required: true`, the resolver checks the environment. It accumulates **all**
   missing variables across **all** selected presets, then prints the combined
   error and exits 78. A single boot attempt surfaces every missing variable for
   the full list, not just the first one.

2. **Plugin fragment** — if the preset's `plugins:` list is non-empty, the
   resolver writes `/app/preset-<name>-plugins.yaml` and adds it to the plugin
   includes chain processed by `install-dynamic-plugins.py`.

3. **App-config fragment** — if the preset's `appConfig:` block is non-empty,
   the resolver writes `/app/app-config.preset-<name>.yaml` and appends it to
   Backstage's `--config` argument list.

Backstage's native config loader **deep-merges** the `--config` files: object
keys merge recursively, scalar keys are last-write-wins in **preset order**. No
manual merge logic runs. Plugin entries merge shallow per `package:` key, so if
two presets enable the same plugin, the later preset wins.

An operator-mounted `app-config.local.yaml` always wins over preset-generated
configs. See [Configuration Hierarchy](./configuration-hierarchy.md) for the
full precedence chain.

:::warning The `package:` value must be unique across all sources
If the same plugin is declared in both a preset and `dynamic-plugins.yaml`, the
`package:` strings must be identical — including the `${PLUGIN_REGISTRY}` and
`${BACKSTAGE_VERSION}` variable forms. A mismatch causes the install script to
treat them as two distinct plugins, installing the bundle twice and crashing the
backend on duplicate registration.
:::

---

## Inspecting what a preset configured

A preset is not a switch or a hidden mode — it is plain config the resolver
writes to disk **before** Backstage starts. If GitHub sign-in works, the catalog
populated, and templates target your org, that behavior came from files you can
read inside the running container:

```bash
# the app-config a preset contributed (layer 4)
docker exec devportal cat /app/app-config.preset-github.yaml

# the plugin fragment a preset enabled (present only when the preset enables plugins)
docker exec devportal cat /app/preset-github-plugins.yaml
```

Replace `github` with any selected preset. These files are the complete source of
truth for what the preset configured. If something works that you didn't
explicitly set, it came from a preset — and you override any of it by adding the
key to `app-config.local.yaml`, which loads after every preset layer and wins
(see [Configuration Hierarchy](./configuration-hierarchy.md)). The boot log also
echoes the assembled includes chain (`VEECODE: dynamic plugin includes → …`) and
the final `--config` list (`EXTRA_ARGS=…`).

---

## Tiers

Every plugin in the image falls into one of three tiers:

- **Core** — always on, baked into the image, gated by no preset. The global
  header (search, notifications, profile), the homepage, the About page and its
  backend, and `dynamic-plugins-info`. The portal is unusable without these and
  they need zero configuration.
- **`recommended`** — enabled by `VEECODE_PRESETS=recommended`. Adds the
  DevPortal marketplace (front + back), the pending-changes widget, a tech-radar
  with sample data, and the RBAC UI. Works with zero configuration and makes the
  image read as a DevPortal rather than a bare Backstage shell.
- **Integration presets** — enabled only when selected; each integrates with
  something customer-specific and therefore declares `requires.variables`.

---

## The SCM-vs-identity split

V2 separates **source-control integration** (SCM) from **sign-in identity**.
These are orthogonal axes you compose independently:

- `github` wires GitHub **as SCM** — catalog/repo discovery, integration, and
  the GitHub Actions UI tab. It does **not** wire OAuth sign-in.
- `github-auth` wires GitHub **as identity** — OAuth sign-in plus org/team user
  sync. Compose `github,github-auth` for the full GitHub stack, or compose
  `github-auth` with a different SCM preset to use GitHub purely as the login
  provider.
- `azure` (Azure DevOps as SCM) and `azure-auth` (Microsoft / Entra ID as
  identity) split the same way.
- **GitLab is a single preset.** There is **no separate `gitlab-auth`** — the
  `gitlab` preset wires both OAuth sign-in and repo/org catalog discovery.

### The `identity` exclusive group

Presets that provide sign-in declare `exclusive_group: identity`: `github-auth`,
`gitlab`, `azure-auth`, `keycloak`, and `ldap`. Only one identity provider can
be active at a time. (`ldap-ad` is an override-only layer on top of `ldap` and
is not itself an identity preset.)

### The `mcp,mcp-chat` dependent pair

`mcp` exposes the MCP server to external CLI clients (Claude Code, Codex CLI,
Cursor) and requires no LLM key. `mcp-chat` adds the in-portal AI chat at
`/mcp-chat` and talks loopback to the `mcp` backend, so it only works when
composed as `VEECODE_PRESETS=mcp,mcp-chat`. The schema cannot enforce this
dependency, so it is documented rather than validated.

---

## Shipped presets

Every preset in `presets/` at the current image tag. Each row is the operator's
contract — what enabling the preset gives you and what variables you must
supply.

| Preset | What it enables | Required env vars |
| --- | --- | --- |
| `recommended` | Marketplace (front + back), pending-changes, tech-radar (sample data), RBAC UI | none |
| `veecode-theme` | VeeCode brand palette + typography + logos/favicons | none |
| `github` | GitHub PAT integration + repo discovery + Actions UI tab. Does **not** wire OAuth sign-in | `GITHUB_PAT`, `GITHUB_ORG` |
| `github-auth` | GitHub OAuth sign-in + org/team user sync (identity group) | `GITHUB_PAT`, `GITHUB_ORG`, `GITHUB_AUTH_CLIENT_ID`, `GITHUB_AUTH_CLIENT_SECRET` |
| `gitlab` | GitLab OAuth sign-in + integration + repo/org catalog discovery (identity group) | `GITLAB_HOST`, `GITLAB_AUTH_CLIENT_ID`, `GITLAB_AUTH_CLIENT_SECRET`, `GITLAB_TOKEN`, `GITLAB_GROUP` |
| `azure` | Azure DevOps integration + catalog + pipelines/PR UI. Does **not** wire Microsoft sign-in | `AZURE_DEVOPS_TOKEN`, `AZURE_DEVOPS_HOST`, `AZURE_DEVOPS_ORG`, `AZURE_DEVOPS_PROJECT` |
| `azure-auth` | Microsoft (Entra ID) OAuth sign-in + msgraphOrg user sync (identity group) | `AZURE_AUTH_TENANT_ID`, `AZURE_AUTH_CLIENT_ID`, `AZURE_AUTH_CLIENT_SECRET` |
| `keycloak` | Keycloak / OIDC sign-in + keycloakOrg user/group sync (identity group) | `KEYCLOAK_BASE_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`, `AUTH_SESSION_SECRET` |
| `ldap` | LDAP sign-in + ldapOrg user/group sync, OpenLDAP defaults (identity group) | `LDAP_URL`, `LDAP_DN`, `LDAP_SECRET`, `LDAP_USERS_BASE_DN`, `LDAP_GROUPS_BASE_DN` |
| `ldap-ad` | Active Directory overrides for `ldap` (sAMAccountName, AD object classes). **Compose with `ldap`** (compose with `ldap`; not a standalone identity preset) | none (reuses `ldap` vars) |
| `jenkins` | Jenkins CI tab on entity pages | `JENKINS_URL`, `JENKINS_USERNAME`, `JENKINS_TOKEN` |
| `kubernetes` | Kubernetes workloads tab on entity pages | `K8S_CLUSTER_NAME`, `K8S_CLUSTER_URL`, `K8S_CLUSTER_TOKEN` |
| `sonarqube` | SonarQube code-quality tab + scaffolder action | `SONARQUBE_BASE_URL`, `SONARQUBE_API_KEY` |
| `mcp` | MCP server at `/api/mcp-actions/v1` for external AI clients via OAuth/DCR | none |
| `mcp-chat` | AI chat UI at `/mcp-chat`. **Compose with `mcp`** (loopback dependency) | `MCP_CHAT_PROVIDER`, `MCP_CHAT_API_KEY`, `MCP_CHAT_MODEL` |

Required variables are **unioned** across the selected presets; the boot exits
78 listing every missing one.

---

## Examples

### Out-of-box VeeCode look (no required vars)

```sh
docker run -p 7007:7007 \
  -e VEECODE_PRESETS=recommended,veecode-theme \
  veecode/devportal:2.0.0
```

The evaluation starting point: VeeCode brand palette, marketplace, tech-radar,
RBAC UI, pending-changes widget.

### GitHub-integrated stack

```sh
docker run -p 7007:7007 \
  -e VEECODE_PRESETS=recommended,veecode-theme,github \
  -e GITHUB_PAT=ghp_xxxx \
  -e GITHUB_ORG=my-org \
  veecode/devportal:2.0.0
```

The `github` preset wires a catalog provider that scans `catalog-info.yaml`
files under `GITHUB_ORG`, the GitHub SCM integration, and the GitHub Actions UI
tab. To add OAuth sign-in, compose `github-auth` as well.

### Keycloak-authenticated stack

```sh
docker run -p 7007:7007 \
  -e VEECODE_PRESETS=recommended,keycloak \
  -e KEYCLOAK_BASE_URL=https://keycloak.internal \
  -e KEYCLOAK_REALM=devportal \
  -e KEYCLOAK_CLIENT_ID=devportal \
  -e KEYCLOAK_CLIENT_SECRET=xxx \
  -e AUTH_SESSION_SECRET=xxx \
  veecode/devportal:2.0.0
```

---

## The curation boundary

`requires.variables` is the boundary between what a preset carries and what it
refuses to carry. A preset that declares a required variable is saying: *from
here on the configuration is customer-specific; here is what you need and where
the docs are, but you supply the values.* Presets therefore ship no opinionated
RBAC policies, no org-specific catalog rules, and no scaffolder templates —
those belong in your deployment repository. Sample data clearly marked as a
sample (such as the starter tech-radar in `recommended`) is allowed.

---

## Going further

- [Configuration Hierarchy](./configuration-hierarchy.md) — the full
  `app-config` merge order and where `app-config.local.yaml` sits.
- [Dynamic Plugins](./dynamic-plugins.md) — how presets enable plugins via the
  OCI catalog.
- For per-integration setup and the exact variable meanings, see the
  [integrations guides](/devportal/v2/integrations).
