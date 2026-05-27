# DevPortal V2 Content Rewrite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Rewrite the DevPortal `installation-guide`, `plugins`, `customization`, and the MCP integration docs from the Helm/`values.yaml`/`VEECODE_PROFILE`/base-distro model to the **devportal-platform** model (single image, `VEECODE_PRESETS`, Docker Compose, OCI dynamic-plugin bundles, `app-config.local.yaml` layering) — reshaping the installation IA to the preset model.

**Architecture:** The current `devportal/` tree is the editing surface (it becomes V2 / "current"; the V1 freeze is the final step of the *mechanism* plan, gated on the V1 audit). Content is **adapted** from the devportal-platform repo's own docs — never copied verbatim, never invented.

**Source of truth:** the `codedb` MCP, project `/home/gio/devportal/devportal-platform`. Read the cited source file before writing each page. SaaS specifics: project `/home/gio/projetos/devportal-saas`.

**Baseline:** worktree `worktree-v2-docs` on branch off `origin/main`.

> ⚠ **Execution gate — re-baseline against PR #14 first.** PR #14
> (`docs/devportal-accuracy-overhaul` → develop, the modernized V1) rewrites all
> 77 `devportal/` files and ADDS structure this plan didn't account for:
> `integrations/{Azure,GitLab,Keycloak,LDAP}/` and a `plugins/bundled/` section.
> This plan's substance (codedb sources, key facts, IA philosophy) holds, but its
> concrete file ops — the Phase-0 deletes/redirects and the per-page "modify"
> targets — MUST be re-pinned to the post-PR#14 tree before executing. Do not run
> the V2 content rewrite until: (1) PR #14 is merged, and (2) the V1 cut has
> frozen it (mechanism plan Tasks 1-2). The new per-integration and bundled-plugin
> pages PR #14 adds are a *better* skeleton to map presets onto — fold them into
> the Target IA at re-baseline time.

---

## Conventions for this plan

This is a **docs** plan: each page task specifies **action / source / outline / key
facts / removals / verification** rather than full prose (the prose is the
deliverable produced during execution). Hard rules for every page:

- **No invented facts.** Every preset name, env var, command, path, port, exit
  code, and OCI ref must trace to a cited `codedb` source. When unsure, read the
  source (`presets/<name>.yaml`, `entrypoint.sh`, `dynamic-plugins.default.yaml`)
  before writing.
- **Image reference = `veecode/devportal:2.0.0`** (per spec decision; the repo's
  `docker-compose.yml` uses it while its prose says `devportal-platform`). Leave a
  one-line HTML comment `<!-- TODO: confirm published image name/tag -->` on the
  hub page only.
- **Keep Docusaurus conventions:** frontmatter (`sidebar_position`, `title`,
  `sidebar_label`), `:::note/:::warning` admonitions, relative doc links, fenced
  code with language tags.
- **Per-page verification:** the page builds (covered by the phase-level
  `yarn build`), internal links resolve, and every command/var/preset on the page
  appears in its cited source.

## Source map (read these once before starting)

| Source (codedb path in devportal-platform) | Feeds |
|---|---|
| `docs/topics/installing.md`, `.env.example`, `docker-compose.yml` | quickstart, hub |
| `docs/topics/presets.md`, `docs/reference/shipped-presets.md` | presets concept, shipped-presets ref |
| `docs/reference/env-vars.md` | env-vars ref |
| `docs/topics/configuration-layering.md`, `app-config.local.template.yaml` | configuration |
| `docs/topics/dynamic-plugins.md`, `docs/topics/plugin-selection-surfaces.md`, `dynamic-plugins.default.yaml` | plugins section |
| `docs/topics/theming.md` | customization/theming |
| `docs/UPGRADING_FROM_BASE_DISTRO.md` | migrating-from-v1 |
| `docs/adr/010-013` | architecture page, rationale callouts |
| `presets/*.yaml`, `entrypoint.sh` | exact required vars, boot behavior |

## Target installation IA

```
devportal/installation-guide/
  installation-guide.md         (hub — reshaped)
  architecture.md               (NEW — was understand-chart.md; single image + presets + OCI)
  quickstart/                   (NEW canonical compose flow; absorbs docker-local/)
    intro.md                    (cp .env.example → presets → docker compose up -d)
    presets.md                  (concept: tiers + composition)
    shipped-presets.md          (reference table)
    env-vars.md                 (reference)
    configuration.md            (app-config.local.yaml layering)
    custom-catalog.md           (kept; compose bind-mount framing)
  plugins-operator.md           (NEW — the four selection surfaces, operator view)
  production-setup/             (reshaped → k8s manifests; no Helm chart yet)
    production-setup.md
    kubernetes.md               (NEW — examples/deploy/k8s.yaml)
  migrating-from-v1.md          (NEW — profile→preset translation)
  vkdr-local/                   (kept; small profile→preset edits)
  FAQs.md                       (kept; NONE)
  _category_.json
```

Removed/redirected (Phase 0): `simple-setup/` (Helm), `understand-chart.md`,
`docker-local/profiles.md`, `docker-local/custom-plugins.md`,
`docker-local/custom-config.md`, `docker-local/intro.md`,
`production-setup/setup.md`, `production-setup/plan.md`.

---

## Phase 0 — IA scaffold + redirects

### Task 0.1: Create the new directory skeleton and category metadata

**Files:**
- Create: `devportal/installation-guide/quickstart/_category_.json`
- Modify: `devportal/installation-guide/_category_.json` (label/position unchanged; confirm present)

- [ ] **Step 1:** Create `devportal/installation-guide/quickstart/_category_.json`:

```json
{ "label": "Quickstart (Docker Compose)", "position": 2 }
```

- [ ] **Step 2:** Commit.

```bash
git add devportal/installation-guide/quickstart/_category_.json
git commit -m "docs(devportal): add quickstart category for V2 install IA"
```

### Task 0.2: Add client redirects for every moved/removed URL

**Files:**
- Modify: `docusaurus.config.js` (the `@docusaurus/plugin-client-redirects` `redirects` array, ~lines 100-118)

- [ ] **Step 1:** Append these redirect entries to the existing `redirects` array (old URL → new home). Use the existing entry shape (`{ from, to }`):

```js
{ from: '/devportal/installation-guide/understand-chart', to: '/devportal/installation-guide/architecture' },
{ from: '/devportal/installation-guide/docker-local/intro', to: '/devportal/installation-guide/quickstart/intro' },
{ from: '/devportal/installation-guide/docker-local/profiles', to: '/devportal/installation-guide/quickstart/presets' },
{ from: '/devportal/installation-guide/docker-local/custom-plugins', to: '/devportal/installation-guide/plugins-operator' },
{ from: '/devportal/installation-guide/docker-local/custom-config', to: '/devportal/installation-guide/quickstart/configuration' },
{ from: '/devportal/installation-guide/docker-local/custom-catalog', to: '/devportal/installation-guide/quickstart/custom-catalog' },
{ from: '/devportal/installation-guide/simple-setup/simple-setup', to: '/devportal/installation-guide/quickstart/intro' },
{ from: '/devportal/installation-guide/simple-setup/deploy-devportal', to: '/devportal/installation-guide/quickstart/intro' },
{ from: '/devportal/installation-guide/simple-setup/create-values-file', to: '/devportal/installation-guide/quickstart/configuration' },
{ from: '/devportal/installation-guide/simple-setup/check-prerequisites', to: '/devportal/installation-guide/quickstart/intro' },
{ from: '/devportal/installation-guide/simple-setup/configure-git-integrations', to: '/devportal/integrations/integrations' },
{ from: '/devportal/installation-guide/production-setup/setup', to: '/devportal/installation-guide/production-setup/kubernetes' },
{ from: '/devportal/installation-guide/production-setup/plan', to: '/devportal/installation-guide/production-setup/production-setup' },
```

- [ ] **Step 2:** Verify redirect targets are all pages this plan creates (cross-check against the Target IA). No redirect may point at a page no task produces.

- [ ] **Step 3:** Commit (build verification deferred to end of Phase 1, after targets exist — redirects to not-yet-created pages fail `yarn build`).

```bash
git add docusaurus.config.js
git commit -m "docs(devportal): redirect legacy Helm/profile install URLs to V2 IA"
```

### Task 0.3: Delete the superseded Helm/profile pages

**Files:**
- Delete: `devportal/installation-guide/simple-setup/` (whole dir), `understand-chart.md`, `docker-local/profiles.md`, `docker-local/custom-plugins.md`, `docker-local/custom-config.md`, `docker-local/intro.md`, `production-setup/setup.md`, `production-setup/plan.md`

- [ ] **Step 1:** Before deleting, read each file once via codedb against the *current docs repo* is not needed — these are local. Read each with the Read tool to salvage any still-true content (e.g. `custom-catalog.md` is kept and moved, not deleted). Confirm the kept set: `docker-local/custom-catalog.md` moves to `quickstart/custom-catalog.md` (Task 1.7), everything else above is deleted.

- [ ] **Step 2:** `git rm` the superseded files (do NOT rm `custom-catalog.md`, handled in Task 1.7):

```bash
git rm -r devportal/installation-guide/simple-setup
git rm devportal/installation-guide/understand-chart.md \
       devportal/installation-guide/docker-local/profiles.md \
       devportal/installation-guide/docker-local/custom-plugins.md \
       devportal/installation-guide/docker-local/custom-config.md \
       devportal/installation-guide/docker-local/intro.md \
       devportal/installation-guide/production-setup/setup.md \
       devportal/installation-guide/production-setup/plan.md
```

- [ ] **Step 3:** Commit.

```bash
git commit -m "docs(devportal): remove Helm/profile/base-distro install pages (superseded by V2)"
```

---

## Phase 1 — Installation core

> Each task creates one page. After the last page, run the Phase-1 build gate
> (Task 1.10) so redirects from Phase 0 resolve.

### Task 1.1: `quickstart/intro.md` — the compose quickstart

**Files:** Create `devportal/installation-guide/quickstart/intro.md`
**Source:** `docs/topics/installing.md`, `.env.example`, `docker-compose.yml`

- [ ] **Outline:** What the image is (single Backstage distro, presets at runtime) → Prerequisites (Docker Engine 24+ with compose v2) → The flow (`cp .env.example .env`, edit `VEECODE_PRESETS` + required vars, `docker compose up -d`, `docker compose logs -f devportal`) → Minimal `.env` (`VEECODE_PRESETS=recommended,veecode-theme`, open `http://localhost:7007`) → Why the two named volumes matter (`dp-data:/app/data`, `dp-plugins:/app/dynamic-plugins-root`) → Picking up an env change (`up -d` recreates; `restart` does not re-read `.env`) → What to expect at boot (60–90s cold / 15–30s warm; preset resolver → plugin install via `skopeo`/`install-dynamic-plugins.py` → `/healthcheck`) → Common boot failures (exit 78: missing var, exclusive `identity` group, plugin install failure; note `up -d` returns 0 even on boot failure — pair with `docker compose ps -a`).
- [ ] **Key facts (verify against source):** image `veecode/devportal:2.0.0`; port `7007`; healthcheck `curl -sf http://localhost:7007/healthcheck`; exit code `78`; `recommended` = marketplace + RBAC UI + tech-radar + pending-changes; `veecode-theme` = brand palette/logos.
- [ ] **Frontmatter:** `sidebar_position: 1`, `title`, `sidebar_label: Quickstart`.
- [ ] **Commit:** `docs(devportal): add V2 compose quickstart`

### Task 1.2: `quickstart/presets.md` — presets concept

**Files:** Create `devportal/installation-guide/quickstart/presets.md`
**Source:** `docs/topics/presets.md`

- [ ] **Outline:** What a preset is (`presets/<name>.yaml`: `requires.variables`, `plugins:` OCI refs, `appConfig:`) → selected via `VEECODE_PRESETS=a,b,c` → Tiers (Core always-on; `recommended`; integration presets) → How composition works at boot (variable validation accumulates all missing → exit 78; plugin fragment; app-config fragment; deep-merge in preset order) → SCM vs identity axis (`github` ≠ `github-auth`; compose for the full stack) → the `identity` exclusive group → three worked combinations (`recommended,veecode-theme`; `+github`; `+keycloak`) → the `mcp,mcp-chat` pair (loopback dependency).
- [ ] **Key facts:** 14 integration presets; required-var union across presets; last preset wins on plugin conflict.
- [ ] **Frontmatter:** `sidebar_position: 2`.
- [ ] **Commit:** `docs(devportal): add presets concept page`

### Task 1.3: `quickstart/shipped-presets.md` — preset reference table

**Files:** Create `devportal/installation-guide/quickstart/shipped-presets.md`
**Source:** `docs/reference/shipped-presets.md` + each `presets/<name>.yaml` `requires.variables`

- [ ] **Outline:** one table: Preset | What it enables | Required env vars. Rows for `recommended`, `veecode-theme`, `github`, `github-auth`, `gitlab`, `azure`, `azure-auth`, `keycloak`, `ldap`, `ldap-ad`, `jenkins`, `kubernetes`, `sonarqube`, `mcp`, `mcp-chat`. Then a short "Composition" note (vars unioned; exit 78 lists every missing one).
- [ ] **Key facts (verify each row against `presets/<name>.yaml`):** `github`→`GITHUB_PAT`,`GITHUB_ORG`; `gitlab`→`GITLAB_HOST`,`GITLAB_AUTH_CLIENT_ID`,`GITLAB_AUTH_CLIENT_SECRET`,`GITLAB_TOKEN`,`GITLAB_GROUP`; `keycloak`→`KEYCLOAK_BASE_URL`,`KEYCLOAK_REALM`,`KEYCLOAK_CLIENT_ID`,`KEYCLOAK_CLIENT_SECRET`,`AUTH_SESSION_SECRET`; `azure`→`AZURE_DEVOPS_TOKEN`,`AZURE_DEVOPS_HOST`,`AZURE_DEVOPS_ORG`,`AZURE_DEVOPS_PROJECT`; `ldap`→`LDAP_URL`,`LDAP_DN`,`LDAP_SECRET`,`LDAP_USERS_BASE_DN`,`LDAP_GROUPS_BASE_DN`; `jenkins`→`JENKINS_URL`,`JENKINS_USERNAME`,`JENKINS_TOKEN`; `kubernetes`→`K8S_CLUSTER_NAME`,`K8S_CLUSTER_URL`,`K8S_CLUSTER_TOKEN`; `sonarqube`→`SONARQUBE_BASE_URL`,`SONARQUBE_API_KEY`; `mcp-chat`→`MCP_CHAT_PROVIDER`,`MCP_CHAT_API_KEY`,`MCP_CHAT_MODEL`; `recommended`/`veecode-theme`/`mcp` → none.
- [ ] **Frontmatter:** `sidebar_position: 3`.
- [ ] **Commit:** `docs(devportal): add shipped-presets reference`

### Task 1.4: `quickstart/env-vars.md` — env var reference

**Files:** Create `devportal/installation-guide/quickstart/env-vars.md`
**Source:** `docs/reference/env-vars.md`

- [ ] **Outline:** Platform-wide table (Variable | Purpose | Default) — `VEECODE_PRESETS`, `VEECODE_APP_CONFIG`, `VEECODE_DOMAIN`, `BACKSTAGE_VERSION`, `PLUGIN_REGISTRY` (default `quay.io/veecode`), `CATALOG_INDEX_IMAGE`, `CATALOG_INDEX_REFRESH`, `DYNAMIC_PLUGINS_TOLERATE_FAILURES` (default false; do-not-use-in-prod note), `LOG_LEVEL`, `RBAC_POLICY_PATH` (`/app/rbac-policy.csv`), `DEVPORTAL_DB_PATH` (`/app/data`) → Theme/branding vars (`THEME_*`) with the `THEME_CUSTOM_JSON` broken-path warning carried as a `:::warning` → pointer to per-preset vars (shipped-presets).
- [ ] **Frontmatter:** `sidebar_position: 4`.
- [ ] **Commit:** `docs(devportal): add env-vars reference`

### Task 1.5: `quickstart/configuration.md` — app-config layering

**Files:** Create `devportal/installation-guide/quickstart/configuration.md`
**Source:** `docs/topics/configuration-layering.md`, `app-config.local.template.yaml`

- [ ] **Outline:** Backstage merges `--config` files deep, last-wins → the precedence chain table (1 `app-config.yaml` … 5 `app-config.local.yaml` … 7 `app-config.saas.yaml`) → variable substitution (`${VAR}`, `${VAR:-default}`) → the two operator paths (preset path; raw Backstage path) → `VEECODE_APP_CONFIG` base64 for chart-managed deploys → common ops (mount `app-config.local.yaml` via compose bind-mount `:ro`; override a single preset value e.g. github schedule).
- [ ] **Key facts:** `app-config.local.yaml` is position 5 and wins over presets; `app.title` is baked at build time and cannot be overridden at runtime (carry as `:::warning`).
- [ ] **Frontmatter:** `sidebar_position: 5`.
- [ ] **Commit:** `docs(devportal): add configuration layering page`

### Task 1.6: `architecture.md` — single image + presets + OCI (replaces understand-chart)

**Files:** Create `devportal/installation-guide/architecture.md`
**Source:** `docs/adr/010-unified-image-and-presets.md`, `docs/topics/dynamic-plugins.md` (Distribution modes)

- [ ] **Outline:** The unified image (one `veecode/devportal` image, no base/distro split) → presets resolved at runtime → dynamic plugins as OCI bundles pulled at boot (default OCI pull / mirror via `PLUGIN_REGISTRY` / air-gapped loaded variant) → static core vs dynamic feature surface → where state lives (`/app/data`, `/app/dynamic-plugins-root`). Keep it conceptual; link to quickstart/presets/plugins for the how-to.
- [ ] **Frontmatter:** `sidebar_position: 2` (right after the hub).
- [ ] **Commit:** `docs(devportal): replace understand-chart with V2 architecture page`

### Task 1.7: Move `custom-catalog.md` into quickstart, reframe for compose

**Files:** Create `devportal/installation-guide/quickstart/custom-catalog.md`; `git rm devportal/installation-guide/docker-local/custom-catalog.md`
**Source:** existing page content (Read it) + `docs/topics/configuration-layering.md` for the mount mechanism

- [ ] **Outline:** keep the catalog-YAML concept; reframe the delivery as a compose bind-mount of catalog files + `catalog.locations` in `app-config.local.yaml`. Drop any Helm/`values.yaml` framing.
- [ ] **Frontmatter:** `sidebar_position: 6`.
- [ ] **Commit:** `docs(devportal): move custom-catalog into quickstart, compose framing`

### Task 1.8: `migrating-from-v1.md` — profile→preset translation

**Files:** Create `devportal/installation-guide/migrating-from-v1.md`
**Source:** `docs/UPGRADING_FROM_BASE_DISTRO.md`

- [ ] **Outline:** What changed (two images → one; profiles → composable presets; theme now a preset) → not a forced migration (legacy images stay on 1.49.4 maintenance) → quick reference diff (`VEECODE_PROFILE: github` → `VEECODE_PRESETS: recommended,veecode-theme,github,github-auth`) → required `VEECODE_PRESETS=recommended` to keep the old experience → the profile→preset translation table (the 6 legacy profiles → presets + required vars + gaps) → env var renames (`GITHUB_TOKEN`→`GITHUB_PAT`) → what the preset already configures (don't copy integration/catalog/auth/branding blocks) → volumes migration (`/app/extensions-install.yaml` → `/app/data/`) → rollback (image name change, not a tag swap) → what is NOT in scope (1.50, automated translation, first-party Helm chart).
- [ ] **Key facts:** image name changes (platform line restarts at `0.1.x` per source — but our docs use `veecode/devportal:2.0.0`; reconcile by stating the image name change explicitly and using the project's tag with the TODO already on the hub); no automated migration tool.
- [ ] **Frontmatter:** `sidebar_position: 8`, `sidebar_label: Migrating from V1`.
- [ ] **Commit:** `docs(devportal): add V1→V2 migration guide`

### Task 1.9: Reshape the hub + production-setup

**Files:** Modify `devportal/installation-guide/installation-guide.md`; create `devportal/installation-guide/production-setup/kubernetes.md`; rewrite `devportal/installation-guide/production-setup/production-setup.md`
**Source:** `docs/topics/installing.md`, `docs/UPGRADING_FROM_BASE_DISTRO.md` §Helm/Kubernetes, `examples/deploy/k8s.yaml`

- [ ] **Hub:** reframe around single image + presets; cards link to quickstart, presets, architecture, migrating-from-v1, production. Add the single `<!-- TODO: confirm published image name/tag -->`.
- [ ] **production-setup.md:** intro that the supported production path today is plain k8s manifests (no first-party Helm chart yet); link to kubernetes.md.
- [ ] **kubernetes.md:** adapt `examples/deploy/k8s.yaml` — Deployment + Service + two PVCs (`/app/data`, `/app/dynamic-plugins-root`) + optional carry-over ConfigMap; presets via env; note the legacy Helm chart only targets the legacy images.
- [ ] **Commit:** `docs(devportal): reshape install hub + production k8s path`

### Task 1.10: Phase 1 build gate

- [ ] **Step 1:** Run `yarn build`. Expected: success; the Phase-0 redirects now resolve (all targets exist). Fix any broken internal links or MDX errors.
- [ ] **Step 2:** Spot-check the dev server route tree: `/devportal/installation-guide/quickstart/intro` and the redirect `/devportal/installation-guide/docker-local/intro` both resolve.
- [ ] **Step 3:** Commit any link fixes: `docs(devportal): fix links after Phase 1`

---

## Phase 2 — Plugins section

### Task 2.1: Rewrite `plugins/plugins.md` — bundled/distro split → single image + OCI

**Files:** Modify `devportal/plugins/plugins.md`
**Source:** `docs/topics/dynamic-plugins.md` (What this is, inventory, distribution modes)

- [ ] **Outline:** static core vs dynamic plugins → `dynamic-plugins.default.yaml` is the catalog (every optional plugin `disabled: true`) → six always-on chrome plugins → presets flip `disabled: false` → distribution modes (OCI pull / mirror / air-gapped). Remove base/distro image and build-time NPM-pull framing.
- [ ] **Commit:** `docs(devportal): rewrite plugins overview for OCI dynamic-plugin model`

### Task 2.2: Rewrite `plugins/adding.md` → the four selection surfaces

**Files:** Modify `devportal/plugins/adding.md`
**Source:** `docs/topics/plugin-selection-surfaces.md`

- [ ] **Outline:** the vitrine (catalog) vs the three selection surfaces → Surface 1 presets (`VEECODE_PRESETS`) → Surface 2 operator override (mount `dynamic-plugins.yaml` top-level `plugins:`, `compose restart` to apply) → Surface 3 marketplace UI (`/extensions/marketplace`, persists in `/app/data/extensions-install.yaml`) → precedence rules table → duplicate-detector (exit 78 on conflicting OCI refs) → operator decision tree. Remove `global.dynamic.plugins` Helm arrays and `vkdr --merge`.
- [ ] **Key facts:** OCI ref shape `oci://${PLUGIN_REGISTRY}/<workspace>:bs_${BACKSTAGE_VERSION}!<selector>`; operator `plugins:` processed last (wins); `compose restart` (not `up -d`) for bind-mount edits.
- [ ] **Commit:** `docs(devportal): rewrite plugin-adding for the four selection surfaces`

### Task 2.3: Create `installation-guide/plugins-operator.md` — operator quick path

**Files:** Create `devportal/installation-guide/plugins-operator.md`
**Source:** `docs/topics/installing.md` §Operator plugin override, `plugin-selection-surfaces.md`

- [ ] **Outline:** short, install-context companion: how an operator toggles plugins on the compose deployment — edit the bind-mounted `dynamic-plugins.yaml` (ships `plugins: []`), `docker compose restart devportal`; or use the marketplace UI; pointer to `plugins/adding` for the full surface model. (This is the redirect target for the old `docker-local/custom-plugins`.)
- [ ] **Frontmatter:** `sidebar_position: 7`.
- [ ] **Commit:** `docs(devportal): add operator plugin-toggling quick path`

### Task 2.4: Rewrite `plugins/development/loading.md` and `wiring.md`

**Files:** Modify `devportal/plugins/development/loading.md`, `devportal/plugins/development/wiring.md`
**Source:** `docs/topics/dynamic-plugins.md` (boot sequence, reference shape), `docs/topics/plugin-packaging.md` (read via codedb before writing)

- [ ] **loading.md:** how a dynamic plugin is loaded at boot (OCI pull → `install-dynamic-plugins.py` → `pluginConfig` merge into `app-config.dynamic-plugins.yaml` → backend feature loader). Remove Helm `global.dynamic.plugins` + `veecode-devportal-dynamic-plugins-npmrc` secret.
- [ ] **wiring.md:** how a plugin's `pluginConfig` (mount points, dynamic routes, menu items) is declared in `dynamic-plugins.default.yaml` and surfaced via `DynamicRoot`. Remove `vkdr --merge` YAML.
- [ ] **Commit:** `docs(devportal): rewrite plugin loading/wiring for runtime OCI model`

### Task 2.5: LOW edits — `plugins/development/packaging.md`, `GitHubWorkflows.md`, `GitLabPipelines.md`, `Sonar.md`

**Files:** Modify the four pages
**Source:** `docs/topics/plugin-packaging.md`; for the three plugin pages, replace static `yarn add` + `EntityPage.tsx` wiring with "enable via the relevant preset (`github`/`gitlab`/`sonarqube`) or the marketplace" and keep the in-portal usage walkthrough.

- [ ] **packaging.md:** note OCI bundle output via `rhdh-cli plugin export` (not `janus-cli`); where the bundle lands.
- [ ] **GitHubWorkflows / GitLabPipelines / Sonar:** swap install snippets to preset/marketplace; keep usage.
- [ ] **Commit:** `docs(devportal): update plugin pages to preset/OCI install`

### Task 2.6: Phase 2 build gate

- [ ] Run `yarn build`; fix links; commit `docs(devportal): fix links after Phase 2`.

---

## Phase 3 — Customization

### Task 3.1: Rewrite `customization/theme-hack.md` → theming via preset

**Files:** Modify `devportal/customization/theme-hack.md` (consider renaming to `theming.md` + redirect)
**Source:** `docs/topics/theming.md`, `docs/adr/011-frontend-design-system.md`

- [ ] **Outline:** the VeeCode theme is a dynamic frontend plugin enabled by the `veecode-theme` preset → the always-on global header (minimum identity without the theme) → why a separate preset (theme ids `light`/`dark`, no dedup) → what `veecode-theme` does (enables the plugin + sets `app.branding`) → customizing as a customer (copy the preset, point at your OCI bundle, **replace** not compose) → authoring gotchas (`rhdh-cli`, `sideEffects`, React/MUI as peers, matching theme ids). Remove `global.theme` Helm values + `readOnlyRootFilesystem`.
- [ ] If renamed: add redirect `/devportal/customization/theme-hack` → `/devportal/customization/theming`.
- [ ] **Commit:** `docs(devportal): rewrite theming for veecode-theme preset model`

### Task 3.2: Rewrite `customization/branding.md`

**Files:** Modify `devportal/customization/branding.md`
**Source:** `docs/topics/theming.md` (§"Sets app.branding"), `docs/UPGRADING_FROM_BASE_DISTRO.md` (§"Overriding branding while keeping veecode-theme")

- [ ] **Outline:** override `app.branding` (`fullLogo`, `iconLogo`, `fullLogoWidth`) via `app-config.local.yaml` while keeping `veecode-theme`; asset must be reachable (absolute URL or bind-mount into static dir); `app.title` is build-time-baked (`:::warning`). Remove Helm `upstream.backstage.appConfig` framing.
- [ ] **Commit:** `docs(devportal): rewrite branding for runtime app.branding override`

### Task 3.3: LOW edits — `customization/customization.md`, `custom-home.md`

**Files:** Modify both
**Source:** `docs/topics/theming.md`, `configuration-layering.md`

- [ ] Replace `values.yaml`/`global.theme` references with `app-config.local.yaml`/preset framing; keep the home-plugin `dynamicPlugins` config (still valid), adjust where config lands.
- [ ] **Commit:** `docs(devportal): update customization pages for V2 config locations`

### Task 3.4: Phase 3 build gate — `yarn build`; fix links; commit.

---

## Phase 4 — Integrations + MCP

### Task 4.1: `integrations/mcp.md` — self-hosted preset activation

**Files:** Modify `devportal/integrations/mcp.md`
**Source:** `presets/mcp.yaml`, `presets/mcp-chat.yaml`, `docs/topics/presets.md` (§`mcp,mcp-chat` pair)

- [ ] **Edit:** replace the self-hosted `dynamic-plugins.yaml` OCI activation block with the preset equivalent: `VEECODE_PRESETS=...,mcp` (server only, no LLM key) and `...,mcp,mcp-chat` (in-portal chat; requires `MCP_CHAT_PROVIDER`/`MCP_CHAT_API_KEY`/`MCP_CHAT_MODEL`). Keep the OAuth/DCR app-config and the tool/toolset tables (still accurate). Keep the in-portal `mcpChat` advanced config. **Do not** touch the docs-MCP `--v1` content (that's the other plan / a different package).
- [ ] **Commit:** `docs(devportal): mcp integration via mcp/mcp-chat presets`

### Task 4.2: LOW edits — `integrations/GitHub/github-auth.md`, `github-integrations.md`

**Files:** Modify both
**Source:** `presets/github.yaml`, `presets/github-auth.yaml`, `.env.example`

- [ ] Keep the `app-config.yaml` auth/integration snippets (still valid Backstage config), but reframe activation as presets (`github`, `github-auth`) and replace `VEECODE_PROFILE` references with `VEECODE_PRESETS`; note `GITHUB_TOKEN`→`GITHUB_PAT`.
- [ ] **Commit:** `docs(devportal): github integration/auth via presets`

### Task 4.3: Phase 4 build gate — `yarn build`; fix links; commit.

---

## Phase 5 — admin-ui + vkdr small edits

### Task 5.1: admin-ui plugin/update pages

**Files:** Modify `admin-ui/Settings/05-plugins.md`, `admin-ui/Installation/02-update.md`, `admin-ui/Config/02-update.md`, `admin-ui/Installation/Installations-helm.md`, `admin-ui/intro.md`
**Source:** `docs/topics/plugin-selection-surfaces.md`, `docs/topics/configuration-layering.md`

- [ ] Reframe the plugin-enable UI and the "re-deploy" mechanism toward preset/OCI selection + `app-config.local.yaml`; keep the existing "Admin-UI is being updated / not yet functional" caveat in `intro.md`. Fix the pre-existing content bug in `Installations-helm.md` (it currently holds SSL text). Keep edits minimal — admin-ui is flagged non-functional.
- [ ] **Commit:** `docs(admin-ui): align plugin/config pages with V2 model`

### Task 5.2: vkdr devportal-command pages

**Files:** Modify `vkdr/devportal-commands/devportal.md`, `vkdr/devportal-commands/overview.md`, and the LOW mentions (`vkdr/tools-commands/openldap.md`, `minio.md`, `ingress-commands/*` Kong-for-devportal notes)
**Source:** confirm current `vkdr devportal install` behavior — check whether VKDR still wraps Helm or has a compose path (read VKDR source if indexed; otherwise mark the profile→preset wording change only and flag uncertainty).

- [ ] **Edit:** update `--profile` → preset wording where VKDR exposes it; if VKDR still wraps the legacy Helm chart, state that explicitly (VKDR targets the legacy images today) rather than inventing a compose path. **Flag any uncertainty for the user** rather than guessing.
- [ ] **Commit:** `docs(vkdr): update devportal command pages for preset wording`

### Task 5.3: Phase 5 build gate — `yarn build`; fix links; commit.

---

## Final verification

- [ ] `yarn build` clean end-to-end; no broken-link warnings for `/devportal/**`.
- [ ] Grep the V2 tree for leftover legacy terms that should be gone from current
  docs: `values.yaml`, `helm upgrade`, `VEECODE_PROFILE`, `dynamic-plugins.default.yaml`
  used as an operator instruction, `devportal-distro`, `devportal-base`. Each hit
  is either intentional (migration page, architecture comparison) or a miss to fix.
- [ ] Re-read every page's commands/vars/presets against its cited codedb source
  (spot-check at minimum: shipped-presets table, env-vars table, the migration
  translation table).
- [ ] Confirm the single `<!-- TODO: confirm published image name/tag -->` is the
  only open TODO.

## Self-review notes

- **Spec coverage:** IA reshape → Phase 0 + Target IA; the 22 HIGH pages each map
  to a task (installation→Phase 1, plugins→Phase 2, customization→Phase 3,
  mcp/github→Phase 4, admin-ui/vkdr→Phase 5); LOW pages → Tasks 2.5, 3.3, 4.2,
  5.x; "adapt not copy / no invention" → Conventions + Final verification claim-check.
- **Out of scope:** the versioning + MCP mechanism (separate plan); `platform/`
  (0 impact); the V1 cut (final, gated on audit).
- **Known uncertainty flagged for the user, not guessed:** the published image
  name/tag (TODO), and VKDR's devportal install internals (Task 5.2).
- **Verification model:** docs have no unit tests; each phase ends with a
  `yarn build` gate, and the final pass does a source claim-check + legacy-term grep.
