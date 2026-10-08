---
sidebar_position: 3
sidebar_label: Custom Configuration
title: Add configuration to the local stack
---

Use a configuration fragment to change portal settings in `devportal-local`. The Compose command passes `dynamic-plugins-root/app-config.dynamic-plugins.yaml`, `app-config.veecode-auth.yaml`, `app-config.veecode-branding.yaml`, `app-config.extensions.yaml`, and `app-config.veecode-product.yaml` with `--config`, in that order.

The files under `config/` and the root `dynamic-plugins.yaml` are derived from the pinned chart. Do not edit them. Add a separate file for local changes.

## Add a custom configuration fragment

Create `app-config.custom.yaml` in the `devportal-local` directory to set `app.title`:

```yaml
app:
  title: Local DevPortal
```

Create `docker-compose.custom-config.yaml` in the same directory. The Compose `command` replaces the base command, so keep the local stack's existing arguments and add your file last:

```yaml
services:
  devportal:
    volumes:
      - ./app-config.custom.yaml:/opt/app-root/src/app-config.custom.yaml:ro
    command:
      - --config
      - dynamic-plugins-root/app-config.dynamic-plugins.yaml
      - --config
      - app-config.veecode-auth.yaml
      - --config
      - app-config.veecode-branding.yaml
      - --config
      - app-config.extensions.yaml
      - --config
      - app-config.veecode-product.yaml
      - --config
      - app-config.custom.yaml
```

Start the local stack with both Compose files:

```bash
docker compose -f docker-compose.yml -f docker-compose.custom-config.yaml up
```

The product fragment is the last default file, and your custom file loads after it. The published UI port and portal base URLs follow `DEVPORTAL_PORT`. A list in a later file replaces the same list from an earlier file instead of merging with it, so repeat every entry you want to keep.

To apply a change after startup, restart with the same Compose files. Do not add `-v` if you want to keep Marketplace installation state:

```bash
docker compose -f docker-compose.yml -f docker-compose.custom-config.yaml down
docker compose -f docker-compose.yml -f docker-compose.custom-config.yaml up -d
```

## Use environment variables in configuration

Reference an environment variable in `app-config.custom.yaml` with `${NAME}` syntax, then set it on the `devportal` service in a Compose override. This lets you pass values such as secrets and tokens through the service environment instead of placing them in the configuration file.

For example, set the portal title from an environment variable:

```yaml
app:
  title: ${LOCAL_PORTAL_TITLE}
```

Save this Compose override as `docker-compose.env.yaml`:

```yaml
services:
  devportal:
    environment:
      LOCAL_PORTAL_TITLE: Env DevPortal
```

Add `-f docker-compose.env.yaml` after `-f docker-compose.custom-config.yaml` in the start command above, and keep it in every later command that starts or stops the stack.

## Database

The local stack runs PostgreSQL 16. Set `POSTGRES_PASSWORD` in `.env` to change the database password.

## Settings the stack reads from the environment

The local stack reads these environment variables:

- `DEVPORTAL_PORT` sets the published UI port and portal base URLs.
- `POSTGRES_PASSWORD` sets the PostgreSQL password.
- `DEVPORTAL_IMAGE` selects the portal image used by the local stack. By default, the stack uses the digest pinned for the chart.

For sign-in and integration settings, see the [integration guides](../../integrations/integrations.md).

## Continue customizing the local stack

- [Add catalog entities](./custom-catalog.md)
- [Configure dynamic plugins](./custom-plugins.md)
