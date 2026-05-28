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
docker run ... -e CATALOG_INDEX_REFRESH=true veecode/devportal:2.0.0
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

Confirm `KEYCLOAK_BASE_URL` and `KEYCLOAK_REALM` are correct — the discovery URL is built from them (`$KEYCLOAK_BASE_URL/realms/$KEYCLOAK_REALM`). The entrypoint logs the resolved value: check the container log line `VEECODE: Keycloak metadata URL: ...`.

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
| Microsoft Active Directory | `recommended,veecode-theme,ldap-ad` |

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
includes:
  - dynamic-plugins.default.resolved.yaml

plugins:
  - package: './dynamic-plugins/dist/backstage-plugin-kubernetes-dynamic'
    disabled: false
```

See [Dynamic Plugins](./docker-local/custom-plugins.md) for mount instructions.

### Why do I only set `plugins:` in `dynamic-plugins.yaml`, not `includes:`?

In V2 the entrypoint owns the `includes:` chain. On every boot it copies your mounted `dynamic-plugins.yaml` to a writable shadow and rebuilds `includes:` to prepend the resolved image defaults (`dynamic-plugins.default.resolved.yaml`), the marketplace state, and each selected preset's plugin fragment. Any `includes:` you write yourself is **replaced**.

So you provide only a top-level `plugins:` list:

```yaml
plugins:
  - package: './dynamic-plugins/dist/my-plugin-dynamic'
    disabled: false
```

You cannot accidentally lose the pre-installed plugins by omitting the defaults, and you never reference `dynamic-plugins.default.resolved.yaml` yourself. (This differs from the V1 distro, where the defaults had to be included manually.) If your mounted `dynamic-plugins.yaml` is malformed YAML, the boot aborts with exit code **78** rather than silently dropping plugins.

---

## Getting more help

- Container logs: `docker logs devportal`
- Project docs: [https://docs.platform.vee.codes](https://docs.platform.vee.codes)
- GitHub issues: [veecode-platform/devportal](https://github.com/veecode-platform/devportal)
