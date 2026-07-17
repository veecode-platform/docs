---
sidebar_position: 1
sidebar_label: Docker Run
title: Run with Docker
---

**Get your DevPortal instance running in under 5 minutes.**

## Run DevPortal with Docker

This guide explains how to run the VeeCode DevPortal using standard Docker commands. This is useful for quick testing, local development, or if you prefer not to use the VKDR CLI.

## Prerequisites

- [Docker Engine](https://docs.docker.com/get-docker/) installed and running.
- [Docker Compose](https://docs.docker.com/compose/) installed and running.
- You can alternatively use [Docker Desktop](https://www.docker.com/products/docker-desktop) for Windows/Mac/Linux.
- Other options like [Podman](https://podman.io/), [OrbStack](https://orbstack.dev/), [Rancher Desktop](https://rancherdesktop.io/), or [Colima](https://github.com/abiosoft/colima) will probably work as well with some minor adjustments.

## Quick Start (Docker Run)

You can simply run the following command to start a DevPortal instance locally:

```bash
# pinned to 2.2.0 — replace with the current release tag
docker run --rm --name devportal -d -p 7007:7007 veecode/devportal:2.2.0
```

This will start a DevPortal instance running on [http://localhost:7007](http://localhost:7007).

:::note
The default behavior enables "guest" authentication as an admin user. The default catalog will be populated with a built-in catalog for demo purposes.
:::

You can stop this container with:

```bash
docker stop devportal
```

## Quick Start (Docker Compose)

Alternatively, you can use `docker compose` to start a DevPortal instance locally with exactly the same result:.

Create a `docker-compose.yml` file:

```yaml
services:
  devportal:
    image: veecode/devportal:2.2.0
    ports:
      - "7007:7007"
```

Run it with:

```bash
docker compose up -d
```

Stop it with:

```bash
docker compose down
```

## What you get

The DevPortal instance will be running on [http://localhost:7007](http://localhost:7007), with very limited functionality but still a good starting point.

<!-- markdownlint-disable MD033 -->
import SetupDefaults from '@site/static/img/docker-setup/setup-defaults.png';

<img src={SetupDefaults} alt="Setup Defaults" width="70%" className="zoomable" />
<!-- markdownlint-enable MD033 -->

Points to notice:

- "Guest" authentication enabled as an admin user ("user:default/admin", "group:default/admins", "role:default/admin" with all permissions granted).
- The catalog is populated with built-in demo entities (see [What's in the demo catalog](#whats-in-the-demo-catalog) below).
- The container loads several config files in a defined precedence order. Your custom file at `/app/app-config.local.yaml` overrides the base and preset defaults. See [Custom Configuration](./custom-config) for the full merge order.
- Plugins are activated via presets (`VEECODE_PRESETS`) — the image comes with many bundled plugins that presets enable at boot. You can also mount `/app/dynamic-plugins.yaml` to add operator-level plugin overrides on top.

We will talk more about these subjects later on, but understand there are many possible ways to extend and configure DevPortal container without rebuilding it (or making a derived image).

## What's in the demo catalog

When you run `veecode/devportal:2.2.0` with no custom config, the catalog is **not empty by accident** — it is populated from `/app/examples/` inside the image. Knowing what's in there matters because (a) you can read these files as concrete examples of how every entity kind is declared, and (b) you need a strategy for replacing them when you go beyond the demo.

The demo data lives in these files (you can inspect them directly with `docker exec`):

```bash
docker exec devportal ls /app/examples/
docker exec devportal cat /app/examples/entities.yaml
```

| File | What it contains |
|---|---|
| `entities.yaml` | System (`examples`), Components (`example-website`, `example-node-app`), an inline gRPC API (`example-grpc-api`) |
| `org.yaml` | Users and Groups (`guests`, `admins`) |
| `apis.yaml` | A live OpenAPI from `apis.guru` (loaded via remote ref) and a gRPC API |
| `resources.yaml` | Demo Resources — databases, environments, and similar infrastructure entities |
| `clusters.yaml` | A cluster Resource |
| `techdocs/catalog-info.yaml` | A Component with TechDocs enabled (good reference for TechDocs annotation usage) |
| `template-nodejs/template.yaml` | Scaffolder Template that creates a Node.js service repo on GitHub |
| `template-openapi/template.yaml` | Scaffolder Template that generates a Kong deck config from an OpenAPI spec |
| `template-azure-nodejs/template.yaml` | Variant of the Node.js template targeting Azure DevOps |

These files are registered as catalog locations in `app-config.production.yaml`, which is one of the layered configs loaded on startup. That is why they appear out of the box.

:::warning Demo Templates need credentials to execute
The three demo Templates appear in the **Create** tab but will fail at execution unless you provide the relevant secrets (a GitHub token for the Node.js and OpenAPI templates, a Kong connection for the OpenAPI template, an Azure DevOps PAT for the Azure template). They are useful as examples of template structure even if you don't run them.
:::

### Replacing the demo catalog

`catalog.locations[]` is **additive** in Backstage's config merge — entries from `app-config.local.yaml` are appended to (not substituted for) the ones in `app-config.production.yaml`. This means:

- **Adding your own entities alongside the demo:** mount your own `catalog-info.yaml` and add it as a location in `app-config.local.yaml`. Both sets will appear.
- **Fully removing the demo entities:** mount a replacement `app-config.production.yaml` that omits the `/app/examples/` entries. You must preserve all the other settings from the original (baseUrl, CORS, auth, RBAC paths, etc.) — only do this when you intentionally want a clean catalog.

See [Custom Catalog](./custom-catalog.md#replacing-vs-adding-to-the-demo-catalog) for the concrete YAML.

## Next Steps

Now that you have DevPortal running, you can customize it:

- **[Quick Setup with Presets](./presets.md)**: Use `VEECODE_PRESETS` to activate GitHub, GitLab, Azure DevOps, and other integrations at boot
- **[Custom Configuration](./custom-config.md)**: Mount custom `app-config.local.yaml` to configure integrations, authentication, and more
- **[Dynamic Plugins](./custom-plugins.md)**: Enable, disable, and configure plugins using `dynamic-plugins.yaml`
- **[Custom Catalog](./custom-catalog.md)**: Add your own components, APIs, and resources to the catalog
- **[Kubernetes (Helm chart)](/devportal/installation-guide/production-setup)**: Deploy to a real Kubernetes cluster using the `veecode-devportal-platform` Helm chart
