---
sidebar_position: 1
sidebar_label: Docker Compose
title: Run DevPortal locally with Docker Compose
---

Use the `devportal-local` repository to run DevPortal 3.x with Docker Compose.

## Start the local stack

Install Docker with Compose, then clone and start the local stack:

```bash
git clone https://github.com/veecode-platform/devportal-local.git
cd devportal-local
docker compose up
```

Open [http://localhost:7007](http://localhost:7007). On a fresh database, the first start takes two to three minutes. To change the published UI port or PostgreSQL password, copy `.env.example` to `.env` before starting. Set `DEVPORTAL_PORT` or `POSTGRES_PASSWORD` in that file. The portal's base URLs follow `DEVPORTAL_PORT`.

To publish the portal on a different host port, set `DEVPORTAL_PORT` when you start the stack:

```bash
DEVPORTAL_PORT=8080 docker compose up
```

## What you get

The local stack provides the same portal and Marketplace as the Kubernetes install described in [production-setup/setup.md](../production-setup/setup.md), backed by PostgreSQL:

- The VeeCode sidebar includes Home, Catalog, APIs, Docs, Self-service, Notifications, Tech Radar, and Marketplace, with Settings at the bottom.
- TechDocs, Notifications/Signals, and Tech Radar are wired up.
- VeeCode branding includes light and dark themes.
- Marketplace selections persist in PostgreSQL when you stop and start the stack without removing its volumes.

## Review the local defaults

The local stack includes the following defaults:

- Guest sign-in maps to `user:default/admin` with ownership `group:default/admins`. Anyone who can reach the URL can act as an administrator. To turn off guest access, remove the auth fragment mount and the matching `--config app-config.veecode-auth.yaml` argument from the `devportal` service, then configure a real sign-in provider.
- The catalog starts with the Marketplace Package and Plugin entities only. It has no demo components, APIs, systems, templates, users, or groups. To register your own, see [Add catalog entities](./custom-catalog.md).
- The default portal image is pinned by digest for the chart version in `.chart-pin`. Set `DEVPORTAL_IMAGE=veecode/devportal:edge` to try the next portal. The `latest` tag is the 2.x line.

## Stop the stack

Run this command from the `devportal-local` directory:

```bash
docker compose down
```

Do not add `-v` if you want to keep Marketplace installation state in the PostgreSQL volume.

## Next steps

Use these pages to continue configuring the local stack:

- [Add a configuration fragment](./custom-config.md)
- [Add catalog entities](./custom-catalog.md)
- [Configure dynamic plugins](./custom-plugins.md)
- [Deploy DevPortal to Kubernetes](../production-setup/production-setup.md)
- [Migrate from DevPortal 2.x](../../migrating-from-2x.md)
