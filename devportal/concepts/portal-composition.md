---
sidebar_position: 2
sidebar_label: Composing a Portal
title: Composing a Portal
---

# Composing a Portal

A DevPortal installation out of the box is a service catalog and a template runner. Teams can register their services, create new ones from templates, and browse the software landscape. That is Day-0: the portal knows what exists and can create things, but it doesn't connect to anything live yet.

The value engineers actually care about — seeing pod status, triggering a deployment, checking code quality, browsing dashboards without leaving the service page — comes from plugin composition. Understanding how composition works is what separates "I set `VEECODE_PRESETS`" from "I built an operational hub."

---

## Three levels of composition

Every plugin activates across three layers. All three must be in place before a developer sees anything.

### 1. Load — presets or `dynamic-plugins.yaml`

This controls which plugins are present at all. In V2 there are two ways to load a plugin, and a plugin is loaded if **either** path selects it:

- **A preset** (recommended). Setting `VEECODE_PRESETS=...,kubernetes` flips the Kubernetes plugin from `disabled: true` to `disabled: false` and supplies its baseline `appConfig`. This is the curated fast path. See [Presets](./presets.md).
- **An operator override.** Mount a `dynamic-plugins.yaml` with a top-level `plugins:` list to enable a bundled plugin or pull an external OCI/npm one that no preset covers.

```yaml
# dynamic-plugins.yaml — enable a bundled plugin no preset covers
plugins:
  - package: oci://quay.io/veecode/grafana:bs_${BACKSTAGE_VERSION}!backstage-plugin-grafana
    disabled: false
```

Enabling a plugin loads its code: UI components and backend routes become available. But nothing appears to the developer yet.

### 2. Context — entity annotations

Plugins are **context-aware by design**. They do not add global tabs. They add tabs and cards to specific catalog entities — and only when those entities carry the right annotation.

```yaml
# catalog-info.yaml
metadata:
  annotations:
    backstage.io/kubernetes-label-selector: 'app=my-service'
```

Without this annotation on the entity, the Kubernetes plugin is loaded but idle. With it, the Kubernetes tab appears on that entity only, and shows pods matching the selector.

This is intentional. A platform with dozens of services doesn't need every plugin visible on every entity. Each service declares what it uses. The portal surfaces exactly what belongs to that service.

### 3. Backend — `app-config`

The tab appears. But it needs to know where to fetch data from. The backend configuration provides that. A preset supplies a baseline (for `kubernetes`, the cluster wired from `K8S_CLUSTER_URL` / `K8S_CLUSTER_TOKEN`); anything beyond the baseline goes in your `app-config.local.yaml`:

```yaml
kubernetes:
  clusterLocatorMethods:
    - type: config
      clusters:
        - name: production
          url: ${K8S_CLUSTER_URL}
          serviceAccountToken: ${K8S_CLUSTER_TOKEN}
```

Without this, the tab loads and shows an error or empty state. With all three layers in place, the tab displays live data.

### The diagnostic model

A plugin that fails to show data has failed at one of these three levels. Diagnose in layer order — load before context before backend, because each layer assumes the previous one succeeded.

| Symptom | Layer | Fix |
|---|---|---|
| Container won't boot (crash loop / exited), or plugin absent on every entity | Load — install failed or plugin not enabled | See [Diagnosing the Load layer](#diagnosing-the-load-layer) below |
| Tab not visible on a specific entity | Context — annotation missing | Add the annotation to that entity's `catalog-info.yaml` |
| Tab visible, empty or error | Backend — configuration missing or unreachable | Check `app-config` for the relevant integration |

#### Diagnosing the Load layer

This is where V2 differs sharply from the V1 distro. **V2 fails fast.** When `install-dynamic-plugins.py` cannot install an enabled plugin — typo'd OCI ref, registry unreachable, wrong `PLUGIN_REGISTRY` mirror, integrity mismatch — it prints an `INSTALL SUMMARY` and the entrypoint **aborts the boot with exit code 78** rather than starting a half-installed portal. So the usual symptom is not "the portal is up but the plugin is missing" — it is "**the container never came up**" (a crash loop in Kubernetes, an exited container under Docker).

Check the container logs for the install lifecycle lines:

```bash
docker logs devportal 2>&1 | grep -E "======= (Installing|Skipping|Using pre-installed|ERROR|INSTALL SUMMARY)"
```

A healthy load:

```
======= Installing dynamic plugin oci://quay.io/veecode/kubernetes:bs_1.49.4!...
	==> Successfully installed dynamic plugin oci://quay.io/veecode/kubernetes:bs_1.49.4!...
```

A failed load ends with the summary that triggers exit 78:

```
======= ERROR: Failed to install plugin oci://quay.io/veecode/kubernetes:...: <error>
	==> Skipping this plugin and continuing with the rest...
======= INSTALL SUMMARY: 1 of 12 plugins failed:
	- oci://quay.io/veecode/kubernetes:...: <error>
```

Common failure signatures and what they mean:

| Log signature | What happened | Likely cause |
|---|---|---|
| `======= ERROR: Failed to install plugin ... npm ERR! 404` | npm package or version doesn't exist | Typo in `package:`, or version not published |
| `======= ERROR: Failed to install plugin ... skopeo ... non-zero exit status 1` | OCI image not found or unreachable | Wrong workspace/tag, registry unreachable, or a bad `PLUGIN_REGISTRY` mirror prefix — see [Finding the OCI reference](/devportal/plugins/adding) |
| `======= ERROR: ... hash of the downloaded package ... does not match the provided integrity hash` | Tampered or wrong-version artifact | Regenerate or remove the `integrity:` field, or set `SKIP_INTEGRITY_CHECK=true` for a trusted source |
| `VEECODE: FATAL — /app/dynamic-plugins.yaml is not valid YAML; aborting boot` | Your mounted `dynamic-plugins.yaml` doesn't parse | YAML syntax error — boot aborts **before** install runs |
| `InstallException: Config key '...' defined differently for 2 dynamic plugins` / duplicate ref rejection | The same plugin is enabled via two different refs | Reconcile the preset and your operator override to a single ref |
| No `Installing`/`Skipping` line for the plugin at all | The package was never enabled | It is `disabled: true`, not selected by any preset, and not in your `dynamic-plugins.yaml` |

:::caution The fail-fast default is deliberate — and overridable
Booting with a half-installed plugin set is a footgun (the UI silently misses tabs), so V2 aborts instead. For dev iteration or a known-flaky upstream plugin, set `DYNAMIC_PLUGINS_TOLERATE_FAILURES=true`. The installer then completes a **partial** install and the portal boots **without** the failed plugins — at which point the failure mode reverts to the V1-style "plugin silently absent," and you must read the `INSTALL SUMMARY` lines above to know what's missing.
:::

#### Diagnosing "tab appears but is empty or errors"

The plugin is loaded and the annotation is correct, but the data isn't showing. Check in this order:

1. **Backend section exists in the merged config** — for Kubernetes: `kubernetes.clusterLocatorMethods`. For SonarQube: `sonarqube.baseUrl` + `apiKey`. A preset supplies a baseline; anything else goes in `app-config.local.yaml`. Without the backend config, the plugin frontend has no source to query.

2. **The annotation value matches reality** — `backstage.io/kubernetes-label-selector: 'app=my-service'` must match the actual labels on the pods in the cluster. If the pods are labeled `app=myservice` (no hyphen), the plugin returns empty with no UI error.

3. **Credentials and reachability** — the service account token, OAuth credentials, or API key must have read access, and the DevPortal container's network must reach the external system.

4. **TLS settings** — for self-signed certs in `kubernetes.clusterLocatorMethods`, set `skipTLSVerify: true`. Otherwise the connection fails silently from the frontend's perspective.

5. **Backend logs** — connection errors surface in the container logs, not the UI:

   ```bash
   docker logs devportal | grep -i <plugin-name>
   ```

---

## The Day-0 → Day-1 → Day-2 progression

This isn't a checklist you complete once. It is a deliberate sequence.

### Day-0: Foundation

- Catalog populated — services, APIs, and resources registered via `catalog-info.yaml`
- Software templates defined — teams can create new services following the organization's Golden Paths
- Authentication and SCM configured via `VEECODE_PRESETS` — an identity preset (`github-auth`, `gitlab`, `keycloak`, …) sets the sign-in provider, and an SCM preset (`github`, `gitlab`, `azure`) wires catalog discovery and repository integration (see [Presets](./presets.md))

The portal knows what exists. Engineers can create new services from opinionated templates. Value: reduced onboarding time and consistent project structure.

### Day-1: Connecting services to their tooling

- Enable plugins — add the relevant preset (`kubernetes`, `sonarqube`, `jenkins`) or, for plugins no preset covers, an entry in `dynamic-plugins.yaml`
- Add annotations to catalog entities — each annotation is a claim: "this entity owns this Kubernetes workload / this GitLab project / this SonarQube project"
- Configure backends — preset baselines plus any overrides in `app-config.local.yaml`

### Day-2: The operational hub

- Developers operate services without leaving the portal
- CI/CD tabs show pipeline status alongside the service entity
- Kubernetes tab shows pod health and live logs
- Code Quality tab surfaces SonarQube results

The portal is no longer a catalog. It is the operational interface for the service.

---

## Example: internal team portal

A concrete composition — GitLab CI, Kubernetes workloads, and SonarQube code quality — across the three layers. GitLab, Kubernetes, and SonarQube are all presets, so the Load and baseline-Backend layers come from `VEECODE_PRESETS`; the Context layer is per-entity annotations.

**Load + auth + SCM + baseline backend — `VEECODE_PRESETS` and its variables:**

```sh
docker run -p 7007:7007 \
  -e VEECODE_PRESETS=recommended,gitlab,kubernetes,sonarqube \
  -e GITLAB_HOST=gitlab.com \
  -e GITLAB_AUTH_CLIENT_ID=xxx -e GITLAB_AUTH_CLIENT_SECRET=xxx \
  -e GITLAB_TOKEN=xxx -e GITLAB_GROUP=my-group \
  -e K8S_CLUSTER_NAME=production -e K8S_CLUSTER_URL=https://k8s.internal:6443 \
  -e K8S_CLUSTER_TOKEN=xxx \
  -e SONARQUBE_BASE_URL=https://sonar.internal -e SONARQUBE_API_KEY=xxx \
  -v $(pwd)/app-config.local.yaml:/app/app-config.local.yaml:ro \
  veecode/devportal:2.0.0
```

**Each service's `catalog-info.yaml` — Context, what it owns:**

```yaml
metadata:
  annotations:
    backstage.io/kubernetes-label-selector: 'app=my-service,env=production'
    gitlab.com/project-slug: my-group/my-service
    sonarqube.org/project-key: my-group_my-service
```

**`app-config.local.yaml` — Backend overrides beyond the preset baseline:**

```yaml
kubernetes:
  serviceLocatorMethod:
    type: multiTenant
  clusterLocatorMethods:
    - type: config
      clusters:
        - name: production
          url: ${K8S_CLUSTER_URL}
          serviceAccountToken: ${K8S_CLUSTER_TOKEN}
          skipTLSVerify: true        # self-signed cluster cert
```

Result: each service entity has a Kubernetes tab, a GitLab CI tab, and a Code Quality tab — each scoped to that service by its annotations. Developers see the operational state of their service in one place.

:::note Plugins without a preset
Not every plugin has a dedicated preset (Grafana, Vault, GitHub Workflows, and others ship in the catalog but are enabled via `dynamic-plugins.yaml` or the marketplace UI). The composition model is identical regardless of how a plugin is loaded — once loaded, it still follows the Context (annotation) and Backend (`app-config`) rules above. See [Adding Plugins](/devportal/plugins/adding) and the [Bundled Plugin Catalog](/devportal/plugins/bundled).
:::

---

## Choosing the right plugins for your context

The question isn't "which plugins are available" — it's "what does my team need to stop context-switching for?"

| If your team uses... | Enable... | Required annotation |
|---|---|---|
| GitHub CI | GitHub Actions | `github.com/project-slug: org/repo` |
| GitHub workflow triggers | GitHub Workflows | `github.com/project-slug` + `github.com/workflows` |
| GitLab CI | GitLab Pipelines (`gitlab` preset) | `gitlab.com/project-slug: group/project` |
| Jenkins | Jenkins (`jenkins` preset) | `jenkins.io/job-full-name: folder/job` |
| Azure Pipelines | Azure DevOps (`azure` preset) | `dev.azure.com/project-repo: project/repo` |
| Kubernetes | Kubernetes (`kubernetes` preset) | `backstage.io/kubernetes-label-selector: app=name` |
| Grafana | Grafana | `grafana/dashboard-selector: "tags @> 'name'"` |
| SonarQube | SonarQube (`sonarqube` preset) | `sonarqube.org/project-key: project-key` |
| HashiCorp Vault | Vault | `vault.io/secrets-path: secret/data/service` |

For plugins not in the bundled set, see [Finding Plugins](/devportal/plugins/finding).

---

## References

- [Presets](./presets.md) — how `VEECODE_PRESETS` sets Day-0 auth, SCM, and the curated plugin set
- [Dynamic Plugins](./dynamic-plugins.md) — the load layer in depth: catalog, selection surfaces, OCI references
- [The Catalog](./catalog.md) — entity kinds, ownership, and how `catalog-info.yaml` is processed
- [Adding Plugins](/devportal/plugins/adding) — OCI and npm download configuration for plugins no preset covers
- [Bundled Plugin Catalog](/devportal/plugins/bundled) — what ships in the image and its default state
