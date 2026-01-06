---
sidebar_position: 1
sidebar_label: Overview
title: Overview
---

# Ingress Commands

## Overview

These commands are related to exposing `vkdr` applications through exposed TCP ports (mostly HTTP/HTTPS).

When starting the `vkdr` cluster you have an option to enable Traefik as its default ingress controller, but there are other ingress controllers available in `vkdr` too. You can use our own commands to install Traefik, NGinx or Kong - they may even coexist on different ports.

## Available Ingress Controllers

- **[nginx](./nginx)** - NGinx ingress controller (simple, widely used)
- **[kong](./kong)** - Kong Gateway (API gateway with advanced features)
- **[traefik](./traefik)** - Traefik ingress controller (modern, easy setup)
- **[whoami](./whoami)** - Test service for verifying ingress

## Quick Start Examples

### Traefik (Quickest)

```bash
vkdr infra start --traefik  # 8000/8001 ports
curl localhost:8000         # 404 after Traefik starts
vkdr infra stop
```

### NGinx

```bash
vkdr infra up                      # 8000/8001 ports, no ingress
vkdr nginx install --default-ic    # NGinx as default ingress
curl localhost:8000                # 404 after NGinx starts
vkdr infra stop
```

### Kong (For DevPortal or API Gateway)

```bash
vkdr infra up
vkdr kong install --default-ic     # Kong as default ingress
curl localhost:8000                # 404 after Kong starts
vkdr devportal install             # DevPortal requires Kong
vkdr infra stop
```

## Choosing an Ingress Controller

| Controller | Best For | Key Features |
|------------|----------|--------------|
| **Traefik** | Development, simple setups | Built-in dashboard, auto HTTPS |
| **NGinx** | General purpose | Widely used, well documented |
| **Kong** | API management, DevPortal | Rate limiting, auth, plugins |

## Notes

A "default ingress controller" is a Kubernetes concept: any Ingress object that does not define an ingress class will be served by the default ingress controller.

Most `vkdr` commands that install applications will rely on the default ingress controller.
