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
# check for latest release
docker run --rm --name devportal -d -p 7007:7007 veecode/devportal:latest
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
    image: veecode/devportal:latest
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
- The catalog will be populated with a built-in catalog for demo purposes (folder "/app/examples" inside the containers).
- The container loads several config files in a defined precedence order. Your custom file at `/app/app-config.local.yaml` overrides the base and profile defaults. See [Custom Configuration](./custom-config) for the full merge order.
- There are many plugins already bundled in the container image, ready to be enabled. You can mount the `/app/dynamic-plugins.yaml` plugin file to enable those you want to use.

We will talk more about these subjects later on, but understand there are many possible ways to extend and configure DevPortal container without rebuilding it (or making a derived image).

## Next Steps

Now that you have DevPortal running, you can customize it:

- **[Quick Setup with Profiles](./profiles)**: Use `VEECODE_PROFILE` for quick GitHub, GitLab, or Azure DevOps integration
- **[Custom Configuration](./custom-config)**: Mount custom `app-config.local.yaml` to configure integrations, authentication, and more
- **[Dynamic Plugins](./custom-plugins)**: Enable, disable, and configure plugins using `dynamic-plugins.yaml`
- **[Custom Catalog](./custom-catalog)**: Add your own components, APIs, and resources to the catalog
