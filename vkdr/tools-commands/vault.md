---
sidebar_position: 4
sidebar_label: vault
title: vault
---

# vkdr vault

Use these commands to manage HashiCorp Vault for secrets management in your `vkdr` cluster.

## vkdr vault install

Install HashiCorp Vault in your cluster.

```bash
vkdr vault install [-hsV] [--dev] [--silent] [--tls] [-d=<domain>] \
  [--dev-root-token=<dev_root_token>]
```

### Flags

| Flag | Shorthand | Description | Default |
|------|-----------|-------------|---------|
| `--domain` | `-d` | Domain name for the generated ingress | `localhost` |
| `--secure` | `-s` | Enable HTTPS | `false` |
| `--dev` | | Enable development mode | `false` |
| `--dev-root-token` | | Root token for dev mode only | `root` |
| `--tls` | | Force TLS mode on Vault internal port | `false` |

### Examples

Install Vault in development mode (easiest for testing):

```bash
vkdr infra up
vkdr nginx install --default-ic
vkdr vault install --dev
# Access at http://vault.localhost:8000
# Dev root token: root
```

Install Vault in production mode:

```bash
vkdr vault install
# Vault will be sealed and needs initialization
vkdr vault init
```

Install with custom domain and HTTPS:

```bash
vkdr vault install -d example.com -s
```

Install with TLS on internal port:

```bash
vkdr vault install --tls
```

## vkdr vault remove

Remove Vault from your cluster.

```bash
vkdr vault remove [-hV] [--silent]
```

### Example

```bash
vkdr vault remove
```

## vkdr vault init

Initialize and unseal HashiCorp Vault. Required after installing Vault in production mode.

```bash
vkdr vault init [-hV] [--silent]
```

### Example

```bash
# After installing Vault in production mode
vkdr vault install
vkdr vault init
```

:::note
In development mode (`--dev`), Vault is automatically initialized and unsealed. The `init` command is only needed for production mode installations.
:::

## vkdr vault generate-tls

Generate TLS certificates for Vault.

```bash
vkdr vault generate-tls [-hV] [--force] [--save] [--silent] \
  [--cn=<commonName>] [--days=<validityDays>]
```

### Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--cn` | Certificate Common Name | `vault` |
| `--days` | Certificate validity in days | `365` |
| `--force` | Force regeneration even if certificates exist | `false` |
| `--save` | Save certificates to Kubernetes secrets | `false` |

### Examples

Generate TLS certificates:

```bash
vkdr vault generate-tls
```

Generate and save to Kubernetes secrets:

```bash
vkdr vault generate-tls --save
```

Generate with custom CN and validity:

```bash
vkdr vault generate-tls --cn vault.example.com --days 730 --save
```

Force regeneration of existing certificates:

```bash
vkdr vault generate-tls --force --save
```

## vkdr vault explain

Explain Vault install formulas and configuration options.

```bash
vkdr vault explain [-hV] [--silent]
```

### Example

```bash
vkdr vault explain
```

## Complete Example

### Development Mode Setup

For quick testing and development:

```bash
# Start cluster with ingress
vkdr infra up
vkdr nginx install --default-ic

# Install Vault in dev mode
vkdr vault install --dev --dev-root-token=mytoken

# Access Vault UI at http://vault.localhost:8000
# Login with token: mytoken

# Clean up
vkdr vault remove
```

### Production Mode Setup

For production-like environments:

```bash
# Start cluster with ingress
vkdr infra up
vkdr nginx install --default-ic

# Generate TLS certificates
vkdr vault generate-tls --save

# Install Vault with TLS
vkdr vault install --tls

# Initialize and unseal Vault
vkdr vault init

# Access Vault UI at http://vault.localhost:8000
# Use the unseal keys and root token from init output

# Clean up
vkdr vault remove
```

## Integration with PostgreSQL

Vault can manage database credentials with automatic rotation:

```bash
# Install Vault and PostgreSQL
vkdr vault install --dev
vkdr postgres install -w

# Create database with Vault integration
vkdr postgres createdb -d myapp -u myuser --vault

# Vault will manage dynamic credentials for this database
```
