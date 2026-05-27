---
sidebar_position: 8
sidebar_label: Configuration Hierarchy
title: Configuration Hierarchy
---

# Configuration Hierarchy

DevPortal uses a 7-layer configuration merge system. Each layer overrides values from the layers below it. Understanding this order is essential for diagnosing unexpected behavior and knowing where to put your custom settings.

---

## The 7 Layers (lowest to highest priority)

```
1. app-config.yaml                          (base defaults, shipped in the image)
2. app-config.production.yaml               (production overrides, shipped in the image)
3. app-config.<profile>.yaml               (auth/identity provider config, loaded when VEECODE_PROFILE is set)
4. app-config.distro.yaml                  (distro-level additions: marketplace, extra plugins, etc.)
5. app-config.local.yaml                   (your operator overrides — mounted into the container)
6. dynamic-plugins-root/app-config.dynamic-plugins.yaml  (generated at startup from your dynamic-plugins.yaml)
7. app-config.saas.yaml                    (SaaS/platform-managed overrides — last wins; populated from VEECODE_APP_CONFIG)
```

Layer 7 wins. Layer 1 provides the baseline.

---

## When to Use Each Layer

| Layer | Who controls it | What to put there |
| --- | --- | --- |
| `app-config.yaml` | Distro (read-only) | Base catalog rules, auth skeleton, RBAC defaults |
| `app-config.production.yaml` | Distro (read-only) | Production DB, TechDocs publisher, backend URLs |
| `app-config.<profile>.yaml` | Distro + distro profiles | Auth provider config for your chosen provider |
| `app-config.distro.yaml` | Distro (read-only) | Extensions marketplace, `pluginsWithPermission`, distro branding tweaks |
| `app-config.local.yaml` | **You (operator)** | Your `app.branding`, `organization.name`, custom catalog locations, overrides |
| `app-config.dynamic-plugins.yaml` | Generated at startup | Plugin-specific config injected by enabled plugins |
| `app-config.saas.yaml` | VeeCode SaaS (if using managed offering) | Platform-level enforced settings |

**Your primary customization target is `app-config.local.yaml`** (or the equivalent `upstream.backstage.appConfig` in Helm values).

---

## Helm vs. Docker Config Paths

### Helm chart
In the Helm chart, your operator config lives under `upstream.backstage.appConfig` in `values.yaml`:

```yaml
upstream:
  backstage:
    appConfig:
      app:
        branding:
          fullLogo: https://example.com/logo.svg
      organization:
        name: My Org
```

This maps to the `app-config.local.yaml` layer at runtime.

### Docker / distro direct
For Docker or direct distro deployments, write your overrides in `app-config.local.yaml` at the repo root (top-level keys, no Helm wrapper):

```yaml
app:
  branding:
    fullLogo: https://example.com/logo.svg
organization:
  name: My Org
```

Mount it into the container at `/app/app-config.local.yaml` (for example, a Docker volume mount or a Kubernetes ConfigMap).

:::note `VEECODE_APP_CONFIG` is different
`VEECODE_APP_CONFIG` is **not** a path to `app-config.local.yaml`. It holds a **base64-encoded app-config document** that the entrypoint decodes into `app-config.saas.yaml` (layer 7, loaded last). It is used by the VeeCode SaaS platform; self-hosted operators normally mount `app-config.local.yaml` instead.
:::

---

## Practical Example

To set a custom organization name and branding without touching the distro files:

1. Create (or update) your `app-config.local.yaml`:

```yaml
app:
  title: Acme Developer Portal
  branding:
    fullLogo: https://cdn.acme.com/portal-logo.svg
    iconLogo: https://cdn.acme.com/portal-icon.png
    fullLogoWidth: 160
    theme:
      light:
        variant: "backstage"
        palette:
          navigation:
            background: "#1a1a2e"
      dark:
        variant: "backstage"
        palette:
          navigation:
            background: "#1a1a2e"
organization:
  name: Acme Corp
```

2. For Helm: place these keys under `upstream.backstage.appConfig` in `values.yaml`.
3. For Docker: mount the file into the container at `/app/app-config.local.yaml`.

---

## Debugging Config

If a setting is not taking effect, check:
1. Which layer is setting the conflicting value.
2. Whether a higher-priority layer is overriding it.
3. Whether the key path is correct (e.g., `app.branding.theme.light.palette.*`, not `branding.theme.light.primaryColor`).

For branding-specific keys, see [Simple Branding](../customization/branding.md).  
For profile-specific env vars, see [Configuration Profiles](./configuration-profiles.md).
