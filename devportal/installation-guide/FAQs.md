---
sidebar_label: FAQs
title: Frequently Asked Questions
---

# Frequently Asked Questions

## Container startup

### The container starts but the marketplace is empty

The marketplace catalog is downloaded from an OCI image at startup. If the download fails (no internet access, image pull timeout, or first-boot race) the marketplace will be empty.

Force a fresh download on the next startup:

```bash
docker run ... -e CATALOG_INDEX_REFRESH=true veecode/devportal:2.2.0
```

The default catalog image is `quay.io/veecode/plugin-catalog-index:latest`. Override it with `CATALOG_INDEX_IMAGE` if you host it internally.

### The container exits immediately after starting

Check the logs:

```bash
docker logs devportal
```

Common causes:
- A required environment variable for one of the selected presets is missing (e.g., `GITLAB_HOST` is unset for the `gitlab` preset). The entrypoint logs exactly which variable is missing before exiting with code 78.
- Two identity presets were selected at once (e.g., `github-auth,gitlab`). Only one identity preset can be active. The container exits with code 78 and names the conflicting presets.
- The `app-config.local.yaml` mount path is wrong or the file has a syntax error. Backstage will fail to start if any mounted config file is invalid YAML.
- Port 7007 is already in use on the host.

### I set a key in `app-config.local.yaml` but it has no effect

Config files are merged in a 7-layer order. Your `app-config.local.yaml` is layer 5, but plugin-generated config (`dynamic-plugins-root/app-config.dynamic-plugins.yaml`) is layer 6 and loads after it. A plugin's `pluginConfig` block in `dynamic-plugins.yaml` can override keys from your `local.yaml`. See [Custom Configuration](./docker-local/custom-config.md) for the full merge order.

---

## Authentication

### GitLab OAuth sign-in is not working

Check that you are using the correct variable names. The `gitlab` preset reads `GITLAB_AUTH_CLIENT_ID` and `GITLAB_AUTH_CLIENT_SECRET`. Using `GITLAB_CLIENT_ID` or `GITLAB_CLIENT_SECRET` will not work.

Also verify the redirect URI in your GitLab OAuth Application matches exactly:
```
http://localhost:7007/api/auth/gitlab/handler/frame
```

### GitHub sign-in is not working

The `github-auth` preset uses GitHub OAuth App credentials for sign-in:
- `GITHUB_AUTH_CLIENT_ID` — OAuth App client ID
- `GITHUB_AUTH_CLIENT_SECRET` — OAuth App client secret

Also include the `github` preset (which provides SCM catalog access via `GITHUB_PAT` + `GITHUB_ORG`). The typical combination is `VEECODE_PRESETS=recommended,veecode-theme,github,github-auth`.

### Keycloak authentication fails at sign-in

Confirm `KEYCLOAK_BASE_URL` and `KEYCLOAK_REALM` are correct — the discovery URL is built from them (`$KEYCLOAK_BASE_URL/realms/$KEYCLOAK_REALM`). To verify the resolved value, read the preset config directly: `docker exec devportal cat /app/app-config.preset-keycloak.yaml`.

Also confirm the redirect URI in your Keycloak client:
```
http://localhost:7007/api/auth/oidc/handler/frame
```

---

## Presets

### Which preset combination should I use?

| Situation | Recommended `VEECODE_PRESETS` |
|---|---|
| Just exploring, no auth | `recommended,veecode-theme` |
| GitHub repos + team sign-in | `recommended,veecode-theme,github,github-auth` |
| GitLab repos + sign-in | `recommended,veecode-theme,gitlab` |
| Azure DevOps repos + sign-in | `recommended,veecode-theme,azure,azure-auth` |
| Keycloak SSO | `recommended,veecode-theme,keycloak` |
| OpenLDAP / FreeIPA | `recommended,veecode-theme,ldap` |
| Microsoft Active Directory | `recommended,veecode-theme,ldap,ldap-ad` |

> **Note:** `ldap-ad` is not an identity preset — it's a composition layer that overrides `ldap` defaults for Active Directory.

### I set `VEECODE_PRESETS` but nothing changed

Preset names are case-sensitive and lowercase. Check the container logs at startup — the entrypoint logs `VEECODE: applying preset "<name>"` for each active preset. If the line is absent, the variable was not passed to the container.

:::note
If you migrated from V1 and still have `VEECODE_PROFILE` in your environment, the entrypoint ignores it and emits a warning. Replace it with `VEECODE_PRESETS`.
:::

---

## Plugins

### How do I enable a bundled plugin?

The easiest path is the in-portal Marketplace — search for the plugin and click **Enable**. Alternatively, add an entry to your operator `dynamic-plugins.yaml`:

```yaml
plugins:
  - package: 'oci://${PLUGIN_REGISTRY}/backstage:bs_1.49.4!backstage-plugin-kubernetes'
    disabled: false
```

See [Dynamic Plugins](./docker-local/custom-plugins.md) for mount instructions.

### Why do I only set `plugins:` in `dynamic-plugins.yaml`, not `includes:`?

In V2 the entrypoint owns the `includes:` chain. On every boot it copies your mounted `dynamic-plugins.yaml` to a writable shadow and rebuilds `includes:` to prepend the marketplace state and each selected preset's plugin fragment. Any `includes:` you write yourself is **replaced**.

So you provide only a top-level `plugins:` list:

```yaml
plugins:
  - package: './dynamic-plugins/dist/my-plugin-dynamic'
    disabled: false
```

You cannot accidentally lose the pre-installed plugins — the core plugins are declared directly in `dynamic-plugins.yaml` with `preInstalled: true` and are always merged in. (This differs from V1, where the defaults had to be included manually.) If your mounted `dynamic-plugins.yaml` is malformed YAML, the boot aborts with exit code **78** rather than silently dropping plugins.

---

## Kubernetes install

### How do I install DevPortal V2 on Kubernetes?

The canonical path is the `veecode-devportal-platform` Helm chart published in the `next-charts` repo:

```sh
helm repo add next-charts https://veecode-platform.github.io/next-charts
helm repo update next-charts
helm search repo veecode-devportal-platform   # → chart 0.1.0, app 2.2.0
```

Create a Secret with the variables required by your chosen presets (see the [per-preset matrix](/devportal/installation-guide/production-setup/plan)), then install:

```sh
helm install devportal next-charts/veecode-devportal-platform \
  --set 'presets={recommended,github,github-auth}' \
  --set existingSecret=my-devportal-creds
```

Use `existingSecret` (a Secret you manage) for production. The `credentials: { KEY: value }` values shortcut is available for development but stores credentials in the Helm release in plaintext.

If you prefer not to use Helm, the raw `examples/deploy/k8s.yaml` in the `devportal-platform` repo is the no-Helm fallback, but the Helm chart is the recommended path for any ongoing deployment. See [Kubernetes (Helm chart)](/devportal/installation-guide/production-setup/plan) for the full install guide.

---

## Getting more help

- Container logs: `docker logs devportal`
- Project docs: [https://docs.platform.vee.codes](https://docs.platform.vee.codes)
- GitHub issues: [veecode-platform/devportal](https://github.com/veecode-platform/devportal)
