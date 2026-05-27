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
docker run ... -e CATALOG_INDEX_REFRESH=true veecode/devportal:latest
```

The default catalog image is `quay.io/veecode/plugin-catalog-index:latest`. Override it with `CATALOG_INDEX_IMAGE` if you host it internally.

### The container exits immediately after starting

Check the logs:

```bash
docker logs devportal
```

Common causes:
- A required environment variable for the selected `VEECODE_PROFILE` is missing (e.g., `GITLAB_HOST` is unset for the `gitlab` profile).
- The `app-config.local.yaml` mount path is wrong or the file has a syntax error. Backstage will fail to start if any mounted config file is invalid YAML.
- Port 7007 is already in use on the host.

### I set a key in `app-config.local.yaml` but it has no effect

Config files are merged in a 7-layer order. Your `app-config.local.yaml` is layer 5, but plugin-generated config (`dynamic-plugins-root/app-config.dynamic-plugins.yaml`) is layer 6 and loads after it. A plugin's `pluginConfig` block in `dynamic-plugins.yaml` can override keys from your `local.yaml`. See [Custom Configuration](./docker-local/custom-config) for the full merge order.

---

## Authentication

### GitLab OAuth sign-in is not working

Check that you are using the correct variable names. The GitLab profile reads `GITLAB_AUTH_CLIENT_ID` and `GITLAB_AUTH_CLIENT_SECRET`. Using `GITLAB_CLIENT_ID` or `GITLAB_CLIENT_SECRET` will not work.

Also verify the redirect URI in your GitLab OAuth Application matches exactly:
```
http://localhost:7007/api/auth/gitlab/handler/frame
```

### GitHub sign-in fails with "Bad credentials"

The `github` profile uses two separate credential sets:
- **Sign-in (OAuth)**: `GITHUB_AUTH_CLIENT_ID` / `GITHUB_AUTH_CLIENT_SECRET`
- **Integration (GitHub App)**: `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` + `GITHUB_APP_ID` + `GITHUB_PRIVATE_KEY`

If `GITHUB_AUTH_CLIENT_ID` is unset, the entrypoint automatically copies `GITHUB_CLIENT_ID` to it. Make sure your OAuth App credentials (not GitHub App credentials) are set for sign-in.

### `GITHUB_PRIVATE_KEY` causes errors due to newlines

Use `GITHUB_PRIVATE_KEY_BASE64` instead. Base64-encode the PEM file and set that variable. The entrypoint decodes it automatically:

```bash
base64 -w 0 < github-app.private-key.pem
# paste the output as GITHUB_PRIVATE_KEY_BASE64
```

### Keycloak authentication fails at sign-in

Confirm `KEYCLOAK_BASE_URL` and `KEYCLOAK_REALM` are correct — the discovery URL is built from them (`$KEYCLOAK_BASE_URL/realms/$KEYCLOAK_REALM`). The entrypoint logs the resolved value: check the container log line `VEECODE: Keycloak metadata URL: ...`.

Also confirm the redirect URI in your Keycloak client:
```
http://localhost:7007/api/auth/oidc/handler/frame
```

---

## Profiles

### Which profile should I use?

| Situation | Recommended profile |
|---|---|
| Just exploring, no auth needed | (no profile — use guest) |
| GitHub repos, simple token access | `github-pat` |
| GitHub repos + team sign-in | `github` |
| GitLab repos + sign-in | `gitlab` |
| Azure DevOps repos + sign-in | `azure` |
| Keycloak SSO | `keycloak` |
| OpenLDAP / FreeIPA | `ldap` |
| Microsoft Active Directory | `ldap-ad` |

### I set `VEECODE_PROFILE` but it has no effect

Profile names are case-sensitive and lowercase. Supported values: `github-pat`, `github`, `gitlab`, `keycloak`, `azure`, `ldap`, `ldap-ad`. Verify the container log shows `VEECODE: Loading <profile> configuration...` during startup.

---

## Plugins

### How do I enable a bundled plugin?

Add an entry to your `dynamic-plugins.yaml` with `disabled: false`. You do not need to rebuild the image or run `yarn add`. Example:

```yaml
plugins:
  - package: './dynamic-plugins/dist/backstage-plugin-kubernetes-dynamic'
    disabled: false
```

See [Dynamic Plugins](./docker-local/custom-plugins) for details.

### My `dynamic-plugins.yaml` disables all plugins unexpectedly

If your custom `dynamic-plugins.yaml` does not include `dynamic-plugins.default.yaml`, all built-in plugins revert to their default state (disabled). Add the `includes:` key:

```yaml
includes:
  - dynamic-plugins.default.yaml

plugins:
  - package: './dynamic-plugins/dist/my-plugin-dynamic'
    disabled: false
```

---

## Getting more help

- Container logs: `docker logs devportal`
- Project docs: [https://docs.platform.vee.codes](https://docs.platform.vee.codes)
- GitHub issues: [veecode-platform/devportal](https://github.com/veecode-platform/devportal)
