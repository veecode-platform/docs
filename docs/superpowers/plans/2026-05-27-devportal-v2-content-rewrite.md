# DevPortal V2 Content Rewrite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Rewrite the DevPortal docs from the current (V1) **distro + `VEECODE_PROFILE` + Helm/`values.yaml` + `dynamic-plugins.yaml`** model to the **devportal-platform** (V2) model: single unified image, composable `VEECODE_PRESETS`, OCI dynamic-plugin bundles pulled at boot, `app-config.local.yaml` layering, exit-code-78 fail-fast.

**Architecture:** The current `devportal/` tree (post-PR #14, on `develop`) **is the V2 editing surface**. It becomes "current"; the V1 freeze (`docusaurus docs:version v1`) is the final step of the *mechanism* plan and snapshots this tree as `version-v1` before the rewrite lands. Content is **adapted** from the devportal-platform repo's own docs — never copied verbatim, never invented.

**Source of truth:** the `codedb` MCP, project `/home/gio/devportal/devportal-platform`. Read the cited source file before writing each page. SaaS specifics: project `/home/gio/projetos/devportal-saas`.

**Baseline:** worktree `worktree-v2-docs` on branch `worktree-v2-docs`, rebased on `origin/develop` (the merged PR #14 modernized V1). **Not `main`** — the modernized V1 only exists on `develop`; `main` predates it. Production flow stays `develop → main`.

---

## Guiding principle — MIRROR the current IA, do NOT force 1:1

PR #14 gave the V1 docs a deliberate Information Architecture (folder/URL/sidebar structure). **The V2 docs mirror that structure** — same paths, content rewritten in place — instead of inventing a parallel tree. This makes the V1↔V2 version toggle map page-to-page and avoids redirect churn.

**But mirroring is the default, not a contract.** The V2 model genuinely changes some things and *drops* others. So for every page, the disposition is one of:

- **KEEP** — product-agnostic, no V1/V2 difference. Leave it.
- **REWRITE** — same concept, changed mechanics. Keep the path, rewrite the content.
- **RENAME** — the concept survives but its V2 name differs enough that the old slug misleads. Rename + add a client redirect.
- **REMOVE** — the concept does **not exist** in V2 (e.g. the Helm chart, `VEECODE_PROFILE`, the base/distro split). Delete the page; add a redirect only if the old URL was prominent. **This is a correct outcome, not a gap to backfill.**
- **FLAG** — unsure whether the concept survives. Verify against the codedb source *before* deciding; do not guess.

**Hard rules on flexibility:**
- No task may **invent** a V2 concept just to preserve a V1 page.
- No task may **force-port** a page whose subject vanished in V2.
- If a disposition below says REWRITE but execution reveals the concept is gone, switch it to REMOVE — that is expected. Note the switch in the commit message; do not treat it as a plan failure.
- When the codedb source contradicts a disposition here, the source wins. Flag it for the user if the contradiction is structural (a whole section appearing/disappearing).

---

## Source map (read the relevant row before writing a page)

| Source (codedb path in devportal-platform) | Feeds |
|---|---|
| `docs/topics/installing.md`, `.env.example`, `docker-compose.yml` | install hub, docker-local quickstart |
| `docs/topics/presets.md`, `docs/reference/shipped-presets.md` | presets concept, shipped-presets ref |
| `docs/reference/env-vars.md` | env-vars / config pages |
| `docs/topics/configuration-layering.md`, `app-config.local.template.yaml` | configuration-hierarchy |
| `docs/topics/dynamic-plugins.md`, `docs/topics/plugin-selection-surfaces.md`, `dynamic-plugins.default.yaml` | concepts/dynamic-plugins, plugins/* |
| `docs/topics/theming.md`, `docs/adr/011-frontend-design-system.md` | customization/* |
| `docs/UPGRADING_FROM_BASE_DISTRO.md` | migrating-from-v1 |
| `docs/adr/010-unified-image-and-presets.md`, `adr/012-013` | architecture framing, rationale callouts |
| `presets/*.yaml`, `entrypoint.sh` | exact required vars, boot behavior, exit 78 |

---

## Conventions for this plan

This is a **docs** plan: each task specifies **disposition / files / source / outline / key facts / verification** rather than full prose (prose is the deliverable produced at execution). Hard rules for every page touched:

- **No invented facts.** Every preset name, env var, command, path, port, exit code, and OCI ref must trace to a cited `codedb` source. Read the source (`presets/<name>.yaml`, `entrypoint.sh`, `dynamic-plugins.default.yaml`) before writing.
- **Image reference = `veecode/devportal:2.0.0`** — CONFIRMED against the source `docker-compose.yml` (`image: veecode/devportal:2.0.0`). No TODO needed; use this tag verbatim.
- **Keep Docusaurus conventions:** frontmatter (`sidebar_position`, `title`, `sidebar_label`), `:::note/:::warning` admonitions, relative doc links, fenced code with language tags. Preserve each page's existing frontmatter `sidebar_position` unless the section is re-ordered.
- **Per-page verification:** the page builds (covered by the phase-level `yarn build`), internal links resolve, and every command/var/preset on the page appears in its cited source.

---

## Disposition table — the whole `devportal/` tree

Legend: **KEEP** / **REWRITE** / **RENAME** / **REMOVE** / **FLAG** (verify first).

### Top level
| Page | Disposition | Why |
|---|---|---|
| `intro.md` | REWRITE-light | Drop any `VEECODE_PROFILE`/distro framing; otherwise product overview survives. |
| `why-devportal.md` | KEEP | Positioning, model-agnostic. |
| `troubleshooting.md` | REWRITE-light | Boot failures change: exit 78 (missing var / exclusive `identity` group / plugin-install failure). Verify against `entrypoint.sh`. |

### concepts/
| Page | Disposition | Why |
|---|---|---|
| `catalog.md`, `API Catalog/*`, `iac-template.md`, `software-template.md`, `environment-cluster-journey-veecode-platform.md` | KEEP | Backstage/platform concepts, no V1/V2 mechanics diff. Spot-check for stray `values.yaml`/profile mentions. |
| `configuration-profiles.md` | RENAME → `concepts/presets.md` | V2 calls them **presets** (`VEECODE_PRESETS`), not profiles. Concept survives but name + composition model changed. Redirect `configuration-profiles` → `presets`. (Heavy rewrite — Task 1.1.) |
| `configuration-hierarchy.md` | REWRITE | Same idea (layered `--config` merge), new precedence chain + `${VAR:-default}` substitution. Keep path. (Task 1.2.) |
| `dynamic-plugins.md` | REWRITE | Bundled-`disabled:true` + OCI pull survives, but `global.dynamic.plugins`/Helm framing → presets + `VEECODE_PRESETS`; `bs_1.49.4` ref → current `BACKSTAGE_VERSION`. Keep path. (Task 1.3.) |

### installation-guide/
| Page / dir | Disposition | Why |
|---|---|---|
| `installation-guide.md` (hub) | REWRITE | Cards reframed: profile→preset; drop/repoint the Helm "Simple Setup" card; add the one image-name TODO. (Task 2.1.) |
| `docker-local/intro.md` | REWRITE | Canonical local-run flow. Already compose-based; swap `VEECODE_PROFILE` → `VEECODE_PRESETS`, add `.env`/`cp .env.example`, named volumes, exit-78 boot notes. (Task 2.2.) |
| `docker-local/profiles.md` | RENAME → `docker-local/presets.md` | Profiles → presets selection. Redirect. (Task 2.3.) |
| `docker-local/custom-config.md` | REWRITE | `app-config.local.yaml` layering for compose; drop profile-merge wording, point at `concepts/configuration-hierarchy`. (Task 2.4.) |
| `docker-local/custom-plugins.md` | REWRITE | Enable via presets / mounted `dynamic-plugins.yaml` / marketplace. (Task 2.4.) |
| `docker-local/custom-catalog.md` | REWRITE-light | Catalog YAML + bind-mount survives; drop any profile framing. (Task 2.4.) |
| `understand-chart.md` | REMOVE → redirect | CONFIRMED: V2 ships **no** Helm chart (no `Chart.yaml`/`values.yaml` in devportal-platform; zero "helm" mentions in installing.md/UPGRADING). Delete; create `architecture.md` (unified image + presets + OCI) and redirect to it. (Task 2.5.) |
| `simple-setup/*` (7 pages) | REMOVE → redirect | CONFIRMED: the `values.yaml`/Helm install flow has no V2 equivalent. Delete the dir; redirect the section root + children to `docker-local/intro`. (Task 2.6.) |
| `production-setup/*` (plan, production-setup, setup) | REWRITE | Production path becomes plain k8s manifests (Deployment + Service + PVCs for `/app/data` and `/app/dynamic-plugins-root`), presets via env. Source `examples/deploy/k8s.yaml`. Collapse 3 pages if the flow no longer warrants plan/setup split. (Task 2.7.) |
| `vkdr-local/*` (7 pages) | FLAG → REWRITE-light | Depends on whether VKDR wraps the legacy chart or has a preset path. Update `--profile`→preset wording **only where VKDR exposes it**; if VKDR still targets legacy images, state that explicitly. **Do not invent a compose path.** Flag uncertainty for the user. (Task 2.8.) |
| `FAQs.md` | KEEP/light | Spot-check for profile/chart mentions. |
| `migrating-from-v1.md` | CREATE (NEW) | The one net-new page: profile→preset translation, env renames (`GITHUB_TOKEN`→`GITHUB_PAT`), image name change, what the preset auto-configures, not-a-forced-migration. Source `docs/UPGRADING_FROM_BASE_DISTRO.md`. (Task 2.9.) |

### integrations/
| Page / dir | Disposition | Why |
|---|---|---|
| `integrations.md` | REWRITE | Overview reframed around presets (SCM vs identity axis; `github` ≠ `github-auth`; `identity` exclusive group). (Task 3.1.) |
| `GitHub/*` (github, github-auth, github-integrations, github-tokens) | REWRITE | Keep valid `app-config` snippets; activation via `github`/`github-auth` presets; `VEECODE_PROFILE`→`VEECODE_PRESETS`; env var changes. (Task 3.2.) |
| `GitLab/*` (gitlab, gitlab-auth) | REWRITE | Single `gitlab` preset — **there is no separate `gitlab-auth` preset** (unlike GitHub/Azure which split SCM vs auth). `GITLAB_*` required vars from `presets/gitlab.yaml`. The V1 `gitlab-auth.md` page may merge into `gitlab.md` or stay as the auth-focused half of the one preset. (Task 3.3.) |
| `Azure/azure.md` | REWRITE | `azure`/`azure-auth` presets; vars from `presets/azure*.yaml`. (Task 3.4.) |
| `Keycloak/keycloak-auth.md` | REWRITE | `keycloak` preset (identity group); vars from `presets/keycloak.yaml`. (Task 3.5.) |
| `LDAP/ldap.md` | REWRITE | `ldap`/`ldap-ad` presets; vars from `presets/ldap*.yaml`. (Task 3.6.) |
| `mcp.md` | REWRITE | Self-hosted MCP via `mcp`/`mcp-chat` presets; keep OAuth/DCR app-config + tool/toolset tables + in-portal `mcpChat` config. **Do NOT touch the docs-MCP `--v1` content** (different package, mechanism plan). (Task 3.7.) |

### customization/
| Page | Disposition | Why |
|---|---|---|
| `theme-hack.md` | RENAME → `theming.md` | VeeCode theme is a dynamic frontend plugin enabled by the `veecode-theme` preset; drop `global.theme` Helm values. Redirect. (Task 4.1.) |
| `branding.md` | REWRITE | `app.branding` override via `app-config.local.yaml` while keeping `veecode-theme`; `app.title` build-time-baked `:::warning`. (Task 4.2.) |
| `customization.md`, `custom-home.md`, `custom-header.md` | REWRITE-light | Swap `values.yaml`/`global.theme` → `app-config.local.yaml`/preset; keep home/header plugin config (verify `global-header` is always-on chrome in V2). (Task 4.3.) |

### plugins/
| Page / dir | Disposition | Why |
|---|---|---|
| `plugins.md` | REWRITE | Static core vs dynamic OCI; `dynamic-plugins.default.yaml` as catalog (all `disabled:true`); presets flip `disabled:false`; distribution modes. (Task 5.1.) |
| `adding.md` | REWRITE | The selection surfaces: presets / operator-mounted `dynamic-plugins.yaml` / marketplace UI; precedence; exit-78 dup detection. Drop `global.dynamic.plugins` arrays + `vkdr --merge`. (Task 5.2.) |
| `finding.md`, `cicd.md` | REWRITE-light | Marketplace + preset framing. (Task 5.3.) |
| `bundled/*` (about, index, azure-devops, github-actions, global-header, homepage, jenkins, marketplace, pending-changes, rbac, tech-radar) | REWRITE | Per bundled plugin: which preset enables it (or always-on chrome), drop Helm enable steps. Map each to `dynamic-plugins.default.yaml` + its preset. (Tasks 5.4–5.5.) |
| `development/loading.md`, `wiring.md`, `packaging.md` | REWRITE | Runtime OCI model: OCI pull → `install-dynamic-plugins.py` → `app-config.dynamic-plugins.yaml`; packaging via `rhdh-cli plugin export`. Drop Helm `global.dynamic.plugins` + npmrc secret + `vkdr --merge`. (Task 5.6.) |
| `development/{backend-plugin,basic,custom-action,development,frontend-plugin}.md` | REWRITE-light | Authoring largely survives; fix only install/load references. (Task 5.7.) |
| `grafana.md`, `kubernetes.md`, `techdocs.md`, `vault.md`, `Sonar.md`, `GitHubWorkflows.md`, `GitLabPipelines.md` | REWRITE-light | Swap static `yarn add`/`EntityPage.tsx` install → enable via preset/marketplace; keep usage walkthroughs. (Task 5.8.) |

### observability/ & rbac/
| Page | Disposition | Why |
|---|---|---|
| `observability/Introduction.md`, `dashboard.md` | REWRITE-light | Enable Grafana plugin via preset/OCI not Helm; dashboard content survives. (Task 6.1.) |
| `rbac/permissions.md`, `creating-role.md` | KEEP/light | RBAC is preset-enabled in V2; permission semantics agnostic. Fix only the enable mechanism if mentioned. (Task 6.1.) |

---

## Phases

Each phase ends with a `yarn build` gate (links resolve, MDX compiles) and a commit. Phases are independent enough to execute and review one at a time.

### Phase 0 — redirects scaffold
Only RENAME/REMOVE pages need redirects. Add them to the `@docusaurus/plugin-client-redirects` array in `docusaurus.config.js` **as the renames/removals land** (a redirect to a not-yet-existing target fails `yarn build`), so commit redirects at the end of each phase that renames/removes, not up front. Track the running list:
- `concepts/configuration-profiles` → `concepts/presets` (Phase 1)
- `installation-guide/docker-local/profiles` → `installation-guide/docker-local/presets` (Phase 2)
- `installation-guide/understand-chart` → `installation-guide/architecture` *(if created)* (Phase 2)
- `installation-guide/simple-setup` (+ each child) → `installation-guide/docker-local/intro` *(if removed)* (Phase 2)
- `customization/theme-hack` → `customization/theming` (Phase 4)

### Phase 1 — concepts (presets, layering, dynamic plugins)
Tasks 1.1 (RENAME configuration-profiles→presets), 1.2 (configuration-hierarchy), 1.3 (dynamic-plugins). These three are the conceptual spine the rest links to — do them first.

**Task 1.1 key facts (verify against `presets/*.yaml`, `docs/topics/presets.md`):** preset = `presets/<name>.yaml` with `requires.variables` + `plugins:` (OCI refs) + `appConfig:`; selected via `VEECODE_PRESETS=a,b,c`; boot validates the **union** of required vars (all missing listed at once → exit 78); deep-merge in preset order, last wins; `identity` is an exclusive group; SCM (`github`) is separate from identity (`github-auth`); `mcp,mcp-chat` is a dependent pair. **15 shipped presets** (confirmed in `presets/`): azure, azure-auth, github, github-auth, gitlab, jenkins, keycloak, kubernetes, ldap, ldap-ad, mcp, mcp-chat, recommended, sonarqube, veecode-theme — render the full table here or in a `shipped-presets` reference, your call at execution.

**Task 1.2 key facts:** precedence chain of `--config` files, last-wins; `${VAR}` / `${VAR:-default}` substitution; `app-config.local.yaml` wins over preset fragments; `app.title` baked at build time, not runtime-overridable (`:::warning`).

**Task 1.3 key facts:** core static plugins always on; optional plugins ship `disabled:true` in `dynamic-plugins.default.yaml`; presets/operator/marketplace flip them; OCI ref shape `oci://${PLUGIN_REGISTRY}/<workspace>:bs_${BACKSTAGE_VERSION}!<selector>` (`PLUGIN_REGISTRY` default `quay.io/veecode`); distribution modes (OCI pull / mirror / air-gapped).

### Phase 2 — installation guide
Tasks 2.1–2.9 per the disposition table. The Helm-chart FLAG is **resolved**: V2 ships no chart, so `understand-chart.md` and `simple-setup/` are REMOVE+redirect (Tasks 2.5/2.6). Production path = the `examples/deploy/k8s.yaml` manifests (Task 2.7). Task 2.8 (vkdr) still needs verification: confirm VKDR's devportal install path before editing; flag uncertainty rather than inventing.

### Phase 3 — integrations
Tasks 3.1–3.7. Read each `presets/<name>.yaml` for exact required vars before writing the page. The per-preset var sets differ from V1's profile vars (e.g. V1 `github` uses `GITHUB_CLIENT_ID`/`GITHUB_APP_ID`/`GITHUB_PRIVATE_KEY`; confirm the V2 `github`/`github-auth` split in source — do not assume).

### Phase 4 — customization
Tasks 4.1–4.3.

### Phase 5 — plugins
Tasks 5.1–5.8, including the `bundled/` section.

### Phase 6 — observability + rbac sweep
Task 6.1: light edits to enable-mechanism wording only.

### Final verification
- [ ] `yarn build` clean end-to-end; no broken-link warnings for `/devportal/**`.
- [ ] Legacy-term sweep across the V2 tree (`git grep` in the docs repo): `values.yaml`, `helm upgrade`, `VEECODE_PROFILE`, `global.dynamic.plugins`, `global.theme`, `devportal-distro`, `devportal-base`, `vkdr --merge`. Each remaining hit is either intentional (migration page, version-comparison callout) or a miss to fix.
- [ ] Re-read every REWRITTEN page's commands/vars/presets against its cited codedb source (spot-check at minimum: presets concept, configuration-hierarchy, each integration's required vars).
- [ ] Confirm the single `<!-- TODO: confirm published image name/tag -->` (install hub) is the only open TODO.
- [ ] Confirm every redirect target exists (no redirect to a removed-and-not-replaced page).

---

## Execution gate

Do **not** run this plan until the V1 cut has frozen the current tree (mechanism plan Tasks 1-2: `docusaurus docs:version v1` + dropdown config). The cut snapshots today's `devportal/` as `version-v1`; this rewrite then edits `devportal/` as "current" (V2). Running before the cut would rewrite V1 in place and lose it. PR #14 is merged (prerequisite met); the remaining gate is the cut, which itself waits for the prose-validation corrections to land on `develop`.

## Self-review notes
- **IA decision:** mirror the post-PR #14 tree, rewrite in place; renames/removals allowed with redirects; no forced 1:1 (per user, 2026-05-27).
- **Coverage:** every current `devportal/` page appears in the disposition table with a disposition; KEEP pages need no task.
- **Out of scope:** versioning + docs-MCP mechanism (separate plan); `platform/`/`admin-ui/`/`vkdr/` product instances except the explicit vkdr-local install pages; the V1 cut (final, gated).
- **Resolved against codedb (2026-05-27):** image = `veecode/devportal:2.0.0`; V2 ships no Helm chart (→ `understand-chart`/`simple-setup` removed); 15 shipped presets; no separate `gitlab-auth` preset.
- **Still flagged, not guessed:** VKDR's devportal install internals (Task 2.8) — confirm whether VKDR wraps legacy images or has a preset path before editing vkdr-local pages.
- **Known V1→V2 var diffs to verify, not assume:** V1 `github` profile (`GITHUB_CLIENT_ID`/`GITHUB_APP_ID`/`GITHUB_PRIVATE_KEY`/`GITHUB_ORG`) vs V2 `github` preset; `GITHUB_TOKEN`→`GITHUB_PAT`.
