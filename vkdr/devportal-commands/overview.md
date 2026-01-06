---
sidebar_position: 1
sidebar_label: Overview
title: Overview
---

# DevPortal Commands

## Overview

These commands are related to installing and managing VeeCode DevPortal, a ready-to-use Backstage distribution for developer portals.

VeeCode DevPortal provides:
- Service catalog for your organization
- Software templates for creating new projects
- TechDocs for documentation
- Integration with GitHub, GitLab, Azure DevOps, and LDAP

## Prerequisites

DevPortal requires **Kong Gateway** as the ingress controller:

```bash
vkdr infra up
vkdr kong install --default-ic
```

## Available Commands

- **[devportal](./devportal)** - Install and manage VeeCode DevPortal

## Quick Start

### Local Development (with samples)

```bash
# Start cluster with Kong
vkdr infra up
vkdr kong install --default-ic

# Install DevPortal with sample catalog
vkdr devportal install --samples

# Access at http://devportal.localhost:8000
```

### With GitHub Integration

```bash
vkdr infra up
vkdr kong install --default-ic

# Install with GitHub PAT (simplest)
vkdr devportal install \
  --profile github-pat \
  --github-org myorg \
  --github-token ghp_xxxxxxxxxxxx

# Access at http://devportal.localhost:8000
```

## Authentication Profiles

| Profile | Best For | Complexity |
|---------|----------|------------|
| `github-pat` | Quick testing | Simple |
| `github` | Production | Medium |
| `gitlab` | GitLab users | Medium |
| `azure` | Azure DevOps users | Medium |
| `ldap` | Enterprise LDAP | Medium |

## Integration with Other Services

DevPortal works well with other `vkdr` services:

```bash
# Full stack setup
vkdr infra up
vkdr kong install --default-ic
vkdr postgres install -w     # For DevPortal database
vkdr keycloak install        # For SSO authentication
vkdr devportal install --profile github-pat --github-org myorg --github-token ghp_xxxx
```
