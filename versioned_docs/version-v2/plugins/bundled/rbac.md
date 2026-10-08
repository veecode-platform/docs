---
sidebar_position: 1
sidebar_label: RBAC
title: RBAC Plugin
---

# RBAC Plugin

The RBAC plugin provides a UI for managing role-based access control policies in DevPortal. It adds a `/rbac` route under the **Admin** menu section.

**Status:** Disabled by default. Enabled via `VEECODE_PRESETS=recommended` (or by an explicit `dynamic-plugins.yaml` entry).

---

## Package

`backstage-community-plugin-rbac`

---

## What it does

- Displays all roles (`role:default/admin`, `role:default/developer`, `role:default/viewer`) and their members
- Shows permission policies per role
- Allows admins to create, edit, and delete roles and policies through the UI
- Reads and writes the RBAC policy CSV file at runtime

---

## Access

The RBAC UI is accessible at `/rbac` and appears in the sidebar under **Admin** for users with the `role:default/admin` role.

---

## Default roles

| Role | Purpose |
|---|---|
| `role:default/admin` | Full administrative access, including RBAC management |
| `role:default/developer` | Standard developer access |
| `role:default/viewer` | Read-only access |

The distro adds `extensions.plugin.configuration.read` and `extensions.plugin.configuration.write` permissions for the admin role via `rbac-policy-extensions.csv`.

---

## App configuration

RBAC is configured in `app-config.yaml` under `permission.rbac`:

```yaml
permission:
  enabled: true
  rbac:
    policies-csv-file: /app/rbac-policy.csv
    pluginsWithPermission:
      - catalog
      - scaffolder
      - kubernetes
```

See [Permissions and RBAC](../../rbac/permissions) for full configuration details.
