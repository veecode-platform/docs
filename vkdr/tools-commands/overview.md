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
