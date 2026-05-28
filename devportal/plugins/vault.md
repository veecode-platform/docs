---
sidebar_position: 14
sidebar_label: Vault
title: Vault Plugin
---

# Vault Plugin

Without this plugin, secrets are completely opaque from the portal's perspective. A developer who wants to know what secrets a service depends on must navigate to Vault separately, with separate credentials, and know where to look. Enable the plugin, add `vault.io/secrets-path` with the secret path prefix for that service, and the entity overview shows the secret paths — so the team knows what the service depends on without switching tools. The plugin shows paths and metadata only, not secret values.

The Vault plugin displays HashiCorp Vault secrets associated with a catalog entity, allowing developers to view secret paths and metadata directly from the DevPortal UI.

:::note
The Vault plugin is **not bundled** in the DevPortal image. It must be added as an external dynamic plugin via `dynamic-plugins.yaml` or the Marketplace. No special support plan is required — the plugin is a standard Backstage community plugin available publicly.
:::

---

## Adding the plugin

### Via Marketplace

Search for "Vault" in the DevPortal Marketplace and click **Enable**.

### Via `dynamic-plugins.yaml`

Check the [Marketplace](./finding.md) or the [Backstage Plugin Registry](https://backstage.io/plugins) for the current OCI reference and workspace tag that matches your DevPortal's Backstage version.

A typical entry looks like:

```yaml
plugins:
  - package: oci://quay.io/veecode/<workspace>:<tag>!backstage-community-plugin-vault
    disabled: false
    pluginConfig:
      dynamicPlugins:
        frontend:
          backstage-community.plugin-vault:
            mountPoints:
              - mountPoint: entity.page.overview/cards
                importName: EntityVaultCard
                config:
                  layout:
                    gridColumn: "1 / -1"
                  if:
                    allOf:
                      - isVaultAvailable
```

Replace `<workspace>` and `<tag>` with the values that match your instance. See [Adding Plugins](./adding.md) for details on the OCI artifact format.

---

## Prerequisites

- A running HashiCorp Vault instance with the HTTP API accessible from the DevPortal backend
- A Vault token or AppRole credentials with read access to the secret paths used by your components

---

## App configuration

```yaml
vault:
  baseUrl: ${VAULT_BASE_URL}        # e.g. https://vault.company.com
  token: ${VAULT_TOKEN}             # service token with read permissions
  # secretEngine: 'kv-v2'          # default; set to 'kv-v1' if needed
  # kvVersion: 2                    # KV secrets engine version (1 or 2)
```

---

## Required annotation

Add the `vault.io/secrets-path` annotation to the component's `catalog-info.yaml`:

```yaml
metadata:
  annotations:
    vault.io/secrets-path: secret/data/my-service
```

The entity card only renders when this annotation is present.

---

## References

- [Backstage Community Vault plugin](https://github.com/backstage/community-plugins/tree/main/workspaces/vault)
- [HashiCorp Vault documentation](https://developer.hashicorp.com/vault/docs)
- [Adding Plugins to DevPortal](./adding.md)
