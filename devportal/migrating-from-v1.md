---
sidebar_position: 3
sidebar_label: Migrating from V1
title: Migrating from V1 to V2
---

# Migrating from V1 to V2

This guide is for operators running **V1** — the split-image topology
(`veecode/devportal-base` + `veecode/devportal`, profiles via
`VEECODE_PROFILE`) — who want to move to **V2**, the unified
`veecode/devportal:2.1.3` image driven by composable presets.

:::info Migration is optional and reversible
V1 stays on its maintenance line (security backports). Upgrade when it
suits you; rollback is a single config change (swap the image back and
restore `VEECODE_PROFILE`). Not sure which version you run? See
[Which version am I running?](./which-version.md).
:::

## What changes

| V1 (split image) | V2 (unified image) |
|---|---|
| Two images: `veecode/devportal-base` + `veecode/devportal` | One image: `veecode/devportal:2.1.3` |
| Plugins baked into the distro at build time | Plugins ship **disabled by default**, resolved at boot via `oci://` refs, enabled by presets |
| One profile via `VEECODE_PROFILE=<github\|gitlab\|…>` (loads one `app-config.<profile>.yaml`) | Composable presets via `VEECODE_PRESETS=a,b,c` — SCM and identity are **separate** presets you compose |
| VeeCode look baked into `packages/app` | Same look opt-in via the `veecode-theme` preset |

## Required: `VEECODE_PRESETS=recommended`

V1 shipped RBAC, marketplace, tech-radar, and pending-changes **enabled
by default**. V2 ships those same plugins **disabled by default**, gated
behind the `recommended` preset. **Every migrating deployment must set
`VEECODE_PRESETS=recommended`** to keep the previous experience, and add
`veecode-theme` to restore the VeeCode palette and branding:

```sh
VEECODE_PRESETS=recommended,veecode-theme,<your-integration-presets>
```

## Profile → preset translation

This table is the contract. Compose each row with `recommended,veecode-theme`.
Each preset's authoritative required-variable list lives in its
`presets/<name>.yaml` (`requires.variables`); a missing required variable
fails the boot with **exit code 78** naming the preset and the variable.

| V1 `VEECODE_PROFILE` | V2 preset(s) | Required env vars | Carry-over via `app-config.local.yaml` |
|---|---|---|---|
| `github-pat` | `github` | `GITHUB_PAT`, `GITHUB_ORG` | None — rename your env var `GITHUB_TOKEN` → `GITHUB_PAT`. |
| `github` | `github,github-auth` | `GITHUB_PAT`, `GITHUB_ORG`, `GITHUB_AUTH_CLIENT_ID`, `GITHUB_AUTH_CLIENT_SECRET` | None, unless you used GitHub **App** integration (`integrations.github[].apps`) — then lift that block. |
| `gitlab` | `gitlab` | `GITLAB_HOST`, `GITLAB_AUTH_CLIENT_ID`, `GITLAB_AUTH_CLIENT_SECRET`, `GITLAB_TOKEN`, `GITLAB_GROUP` (optional `GITLAB_GROUP_PATTERN`) | None. |
| `azure` | `azure,azure-auth` | `AZURE_DEVOPS_TOKEN`, `AZURE_DEVOPS_HOST`, `AZURE_DEVOPS_ORG`, `AZURE_DEVOPS_PROJECT`, `AZURE_AUTH_TENANT_ID`, `AZURE_AUTH_CLIENT_ID`, `AZURE_AUTH_CLIENT_SECRET` | None. |
| `keycloak` | `keycloak` | `KEYCLOAK_BASE_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`, `AUTH_SESSION_SECRET` | None. |
| `ldap` | `ldap` | `LDAP_URL`, `LDAP_DN`, `LDAP_SECRET`, `LDAP_USERS_BASE_DN`, `LDAP_GROUPS_BASE_DN` (optional `LDAP_USERS_FILTER`, `LDAP_GROUPS_FILTER`) | None. |
| `ldap-ad` | `ldap,ldap-ad` | Same as `ldap` | None — `ldap-ad` overrides the AD attributes/filters. **Order matters: list `ldap` before `ldap-ad`.** |

Presets compose: `VEECODE_PRESETS=recommended,veecode-theme,github,sonarqube`
adds SonarQube on top of the GitHub stack and demands both sets of vars.

**"None" in the carry-over column means the preset fully reproduces that profile's
integration config** — you don't re-supply `integrations.*`, `catalog.providers.*`,
or the auth block. It does **not** mean "migrate nothing": every deployment still
carries over config *outside* any preset's scope. See
[What the preset already configures](#what-the-preset-already-configures-do-not-copy-over).

:::warning Two behavior changes to plan for
- **`GITHUB_TOKEN` → `GITHUB_PAT`.** Most variable names carry over unchanged; this one renamed. Check each preset's `requires.variables` rather than assuming the legacy name.
- **The browser-tab title is baked at build time.** `app.title` is inlined into `index.html` when the frontend bundle is built, so a runtime-mounted `app-config.local.yaml` — and the `veecode-theme` preset — cannot change the browser-tab title; only a rebuilt image can. Logos and palette **do** override at runtime.
:::

:::warning One identity provider at a time
The identity presets — `github-auth`, `azure-auth`, `gitlab`, `keycloak`, `ldap` — are mutually exclusive (they share the `identity` exclusive group). Selecting two fails the boot with **exit code 78** naming the conflict. A straight 1:1 profile migration only ever uses one, so this bites only if you start composing extra sign-in providers on top.
:::

## What the preset already configures (do not copy over)

The preset owns these — copying them from your legacy
`app-config.<profile>.yaml` only invites drift:
integration base config (`integrations.<provider>`), the catalog provider
(`catalog.providers.<provider>`), the auth provider + sign-in page, and the
theme palette/branding (owned by `veecode-theme`). You **do** carry over
everything *outside* a preset's scope: custom catalog `locations`, a custom
RBAC policy, extra integration hosts, proxy entries, feature flags.

## Self-hosted migration steps (Docker)

If you run V1 via `docker run` / `docker-compose`, these are the concrete deltas
beyond setting `VEECODE_PRESETS`:

1. **Drop `VEECODE_PROFILE`.** V2 ignores it. The image logs a warning if it is
   still set, but it selects nothing — all selection now flows through
   `VEECODE_PRESETS`. Leaving it set won't break the boot; it just misleads.

2. **Do not reuse your V1 `dynamic-plugins.yaml`.** This is the most common
   migration break. A mounted `dynamic-plugins.yaml` **replaces** the image's
   plugin list — it is not merged on top of it. A V1 file hurts you two ways:
   - Its local `./dynamic-plugins/dist/...` references don't exist in the V2
     image. The boot-time installer fails on them and the container **exits 78**.
   - Even an OCI-only V1 file omits V2's core chrome entries (homepage, global
     header, About). Without their `pluginConfig` merged, those frontend plugins
     don't surface — the portal boots with broken navigation.

   Let presets drive plugins. If you genuinely need operator-level plugin
   overrides, start from a bare `plugins:` list per
   [Dynamic Plugins](./installation-guide/docker-local/custom-plugins.md) — don't
   carry the V1 file over.

3. **Mount the two state volumes.** V2 persists state under two paths; without
   them every restart wipes the marketplace and re-downloads every plugin bundle:
   - `/app/data` — Backstage SQLite databases plus the marketplace's
     `extensions-install.yaml`. Must be a **directory** volume, not a single-file
     bind (the marketplace rewrites the file via atomic temp-file + rename).
   - `/app/dynamic-plugins-root` — resolved plugin-bundle cache (fast restart).

   **Drop the legacy `extensions-install.yaml` bind.** V1's
   `-v …:/app/extensions-install.yaml` single-file mount is gone; V2 only reads
   `/app/data/extensions-install.yaml`. Remove the old bind from your run command.

A reference `docker-compose.yml` with both volumes and the optional
`dynamic-plugins.yaml` mount is in
[Run with Docker](./installation-guide/docker-local/intro.md).

## Helm chart migration steps (Kubernetes)

If you run V1 on Kubernetes, the chart itself changes — this is **not** a
`helm upgrade` of your existing release:

| | V1 | V2 |
|---|---|---|
| Chart | `veecode-devportal` | `veecode-devportal-platform` |
| Topology | wrapper around the upstream `backstage` subchart (aliased `upstream`) | standalone chart, no subchart |
| Release / Deployment | e.g. `veecode-devportal` / `veecode-devportal-backstage` | e.g. `devportal` / `devportal-veecode-devportal-platform` |

Because it is a different chart with a different release and Deployment, you
**install V2 fresh** and decommission the V1 release once V2 is healthy. The
`helm upgrade --reuse-values` shown in the install guide updates *within* V2 —
it does not carry you across charts.

:::warning Your `values.yaml` is rewritten, not edited
The two charts share **no** top-level keys. Applying a V1 `values.yaml`
against the V2 chart does not error — Helm silently ignores the unrecognized
keys, and you get a Deployment with none of your intended configuration. Start
the V2 `values.yaml` from scratch (this applies equally to a templated
`values.yaml.tpl` in a GitOps repo — replace it, don't diff it).
:::

Use this table to find where each V1 setting goes. Build the new file against
[Deploy to Kubernetes](./installation-guide/production-setup/setup.md).

| V1 `veecode-devportal` | V2 `veecode-devportal-platform` |
|---|---|
| `upstream.backstage.appConfig.integrations.*`, `.auth`, `.catalog.providers.*` | **Provided by presets** — do not recreate. See [What the preset already configures](#what-the-preset-already-configures-do-not-copy-over). |
| Remaining `upstream.backstage.appConfig.*` (catalog `locations`, proxy, custom RBAC, feature flags) | `appConfig:` — overrides only; rendered as a ConfigMap when non-empty |
| `global.dynamic.includes` / `global.dynamic.plugins` | `presets:` (plus optional `dynamicPlugins:` for surgical, per-deployment overrides) |
| `global.host` / `global.protocol` / `global.port` | `ingress.hostname` |
| `upstream.ingress.*` | `ingress.*` |
| `upstream.backstage.extraEnvVarsSecret` + `${VAR}` refs in `appConfig` | `existingSecret` (production) or `credentials: {}` — wired in via `envFrom` |
| `upstream.backstage.image` (`veecode/devportal:1.4.5`) | `image` (`veecode/devportal:2.1.3`) |
| `upstream.postgresql.*` (bundled Bitnami subchart) | `database.external.*` — no bundled database; supply external coordinates |
| `createClusterRoles: true` | `rbac.clusterRoles.create: true` |
| _(ephemeral; no PVCs)_ | `persistence.data` + `persistence.plugins` — **new in V2, required for production** (Backstage state + plugin-bundle cache) |

Two deltas have no V1 equivalent and are easy to miss:

1. **Credentials move out of `appConfig`.** In V1 you inlined `${VAR}` refs in
   `appConfig` and fed them via `extraEnvVarsSecret`. In V2 the presets read
   their variables from the environment, so put them in a Secret referenced by
   `existingSecret` — see [Step 2 of the install guide](./installation-guide/production-setup/setup.md#step-2-create-the-credentials-secret).
2. **Two PVCs are mandatory.** The V1 wrapper ran with ephemeral storage; V2
   persists Backstage state (`persistence.data`) and the resolved plugin cache
   (`persistence.plugins`). Without them every pod restart wipes the marketplace
   and re-downloads every plugin bundle.

## Installing V2

Pick the path that matches V1's:

- **Production Kubernetes** → the published `veecode-devportal-platform` Helm chart. See [Kubernetes (Helm chart)](./installation-guide/production-setup/plan.md).
- **Local Kubernetes (VKDR)** → `vkdr devportal-platform install`. See [VKDR (Local Kubernetes)](./installation-guide/vkdr-local/vkdr-setup.md).
- **Docker** → `veecode/devportal:2.1.3` with `VEECODE_PRESETS`. See [Docker Run](./installation-guide/docker-local/intro.md).

## What is NOT part of this migration

- **No automated config translation.** No script reads `VEECODE_PROFILE` and emits `VEECODE_PRESETS` — the per-integration preset is intentionally narrower than the legacy profile, so the mapping is documented (this table), not code.
- **No Backstage version bump.** Both V1 and V2 ship on Backstage 1.49.4.
- **No visual redesign.** `veecode-theme` repackages the same palette and logos.
