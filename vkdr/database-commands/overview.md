---
sidebar_position: 1
sidebar_label: Overview
title: Overview
---

# Database Commands

## Overview

These commands are related to managing databases in your `vkdr` cluster.

Currently, `vkdr` supports PostgreSQL as a managed database service. PostgreSQL is deployed using CloudNativePG, providing a production-ready PostgreSQL cluster with automatic failover and backup capabilities.

## Available Commands

- **[postgres](./postgres)** - Manage PostgreSQL database instances

## Quick Start

```bash
# Start cluster
vkdr infra up

# Install PostgreSQL
vkdr postgres install -w

# Create a database for your application
vkdr postgres createdb -d myapp -u myuser -p mypassword -s

# Verify connectivity
vkdr postgres pingdb -d myapp -u myuser

# List all databases
vkdr postgres listdbs
```

## Integration with Vault

PostgreSQL can integrate with HashiCorp Vault for dynamic credential management:

```bash
# Install Vault and PostgreSQL
vkdr vault install --dev
vkdr postgres install -w

# Create database with Vault-managed credentials
vkdr postgres createdb -d myapp -u myuser --vault
```

This enables automatic credential rotation and secure secret management for your applications.
