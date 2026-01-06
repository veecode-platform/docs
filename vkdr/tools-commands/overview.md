---
sidebar_position: 1
sidebar_label: Overview
title: Overview
---

# Tools Commands

## Overview

These commands are related to installing and managing supporting tools in your `vkdr` cluster. These tools provide essential services like identity management, secrets management, and more.

## Available Tools

- **[keycloak](./keycloak)** - Identity and access management (IAM)
- **[vault](./vault)** - HashiCorp Vault for secrets management
- **[minio](./minio)** - S3-compatible object storage
- **[eso](./eso)** - External Secrets Operator for syncing secrets
- **[mirror](./mirror)** - Container image registry mirrors
- **[openldap](./openldap)** - LDAP directory service

## Quick Start

### Identity Management with Keycloak

```bash
# Start cluster with ingress
vkdr infra up
vkdr nginx install --default-ic

# Install Keycloak
vkdr keycloak install

# Access at http://keycloak.localhost:8000
# Default credentials: admin/admin
```

### Secrets Management with Vault

```bash
# Start cluster with ingress
vkdr infra up
vkdr nginx install --default-ic

# Install Vault in dev mode for testing
vkdr vault install --dev

# Access at http://vault.localhost:8000
# Dev token: root
```

## Integration Examples

### Keycloak + Kong OIDC

Use Keycloak as identity provider for Kong Gateway:

```bash
vkdr infra up
vkdr kong install --default-ic --oidc
vkdr keycloak install
# Kong Admin UI uses Keycloak for authentication
```

### Vault + PostgreSQL

Use Vault for dynamic database credentials:

```bash
vkdr infra up
vkdr vault install --dev
vkdr postgres install -w
vkdr postgres createdb -d myapp -u myuser --vault
# Vault manages database credentials automatically
```

### Object Storage with MinIO

```bash
vkdr infra up
vkdr nginx install --default-ic
vkdr minio install --api
# Console: http://minio.localhost:8000
# API: http://minio-api.localhost:8000
```

### External Secrets with ESO + Vault

```bash
vkdr infra up
vkdr vault install --dev
vkdr eso install
# ESO can now sync secrets from Vault to Kubernetes
```

### Container Image Mirrors

```bash
vkdr infra up
vkdr mirror add --host docker.io
vkdr mirror add --host ghcr.io
# Image pulls are now cached locally to avoid rate limits
```

### LDAP Authentication with OpenLDAP

```bash
vkdr infra start --nodeports 1
vkdr nginx install --default-ic
vkdr openldap install --ldap-admin
# phpLDAPadmin: http://ldapadmin.localhost:8000
```
