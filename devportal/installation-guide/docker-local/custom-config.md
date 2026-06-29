---
sidebar_position: 3
sidebar_label: Custom Configuration
title: Custom App Configuration
---

## Custom App Configuration

You can use a combination of `docker compose`, presets, configuration files, and environment variables to customize the behavior of the DevPortal instance.

The recommended approach is to mount a custom `app-config.local.yaml` file. This lets you override default settings without modifying the container image.

## Config File Precedence

All configuration files are loaded and merged in this order (later entries override earlier ones):

1. `app-config.yaml` — base image defaults
2. `app-config.production.yaml` — production overrides baked into image
3. `app-config.distro.yaml` — VeeCode distro defaults (baked in)
4. `app-config.preset-{name}.yaml` — one file per active preset in `VEECODE_PRESETS` (resolved at boot from `/app/presets/`)
5. **`app-config.local.yaml`** ← your custom file, mounted at `/app/app-config.local.yaml`
6. `dynamic-plugins-root/app-config.dynamic-plugins.yaml` — generated at startup by the plugin install script
7. `app-config.saas.yaml` — SaaS mode only; decoded from `VEECODE_APP_CONFIG`

Your `app-config.local.yaml` (layer 5) wins over the base and preset defaults, but plugin-injected config (layer 6) is loaded after it. If a setting in `local.yaml` seems to be ignored, check whether an enabled plugin's `pluginConfig` block is overriding it.

:::note Layer 7 and `VEECODE_APP_CONFIG`
`app-config.saas.yaml` (layer 7), decoded from `VEECODE_APP_CONFIG`, loads last and wins over all layers including layer 6. Use it for deployment-specific values (database URLs, ingress hosts) that must not be hardcoded in a mounted file. See [Configuration Hierarchy](/devportal/concepts/configuration-hierarchy).
:::

## Creating a Custom Config File

Create an `app-config.local.yaml` file in your project directory:

```yaml
app:
  title: My Company DevPortal
  baseUrl: http://localhost:7007

organization:
  name: My Company

backend:
  baseUrl: http://localhost:7007
  listen:
    port: 7007
  cors:
    origin: http://localhost:7007
    methods: [GET, HEAD, PATCH, POST, PUT, DELETE]
    credentials: true

# Example: Configure GitHub integration
integrations:
  github:
    - host: github.com
      token: ${GITHUB_PAT}

# Example: Add a catalog location
catalog:
  locations:
    - type: url
      target: https://github.com/your-org/your-repo/blob/main/catalog-info.yaml
```

## Mounting with Docker Run

Use the `-v` flag to mount your config file:

```bash
docker run --rm --name devportal -d \
  -p 7007:7007 \
  -v $(pwd)/app-config.local.yaml:/app/app-config.local.yaml:ro \
  veecode/devportal:2.1.3
```

## Mounting with Docker Compose

Update your `docker-compose.yml`:

```yaml
services:
  devportal:
    image: veecode/devportal:2.1.3
    ports:
      - "7007:7007"
    environment:
      - GITHUB_PAT=${GITHUB_PAT}
    volumes:
      - ./app-config.local.yaml:/app/app-config.local.yaml:ro
```

Then run:

```bash
docker compose up -d
```

## Development Mode

Set `DEVELOPMENT=true` to enable nodemon hot-reload. DevPortal will watch `app-config.yaml`, `app-config.production.yaml`, `app-config.local.yaml`, and the generated `dynamic-plugins-root/app-config.dynamic-plugins.yaml` for changes and restart automatically:

```yaml
services:
  devportal:
    image: veecode/devportal:2.1.3
    ports:
      - "7007:7007"
    environment:
      - DEVELOPMENT=true
    volumes:
      - ./app-config.local.yaml:/app/app-config.local.yaml:ro
```

You can also expose the Node.js debugger by setting `DEBUG_PORT`:

```yaml
    environment:
      - DEVELOPMENT=true
      - DEBUG_PORT=9229
    ports:
      - "7007:7007"
      - "9229:9229"
```

## Common Configuration Examples

### GitHub Authentication

```yaml
auth:
  environment: development
  providers:
    github:
      development:
        clientId: ${GITHUB_AUTH_CLIENT_ID}
        clientSecret: ${GITHUB_AUTH_CLIENT_SECRET}
```

### Database Configuration

```yaml
backend:
  database:
    client: pg
    connection:
      host: ${POSTGRES_HOST}
      port: ${POSTGRES_PORT}
      user: ${POSTGRES_USER}
      password: ${POSTGRES_PASSWORD}
```

## Environment Variables

You can reference environment variables in your config file using the `${VAR_NAME}` syntax. Pass them via Docker:

```bash
docker run --rm --name devportal -d \
  -p 7007:7007 \
  -e GITHUB_PAT=your_token_here \
  -v $(pwd)/app-config.local.yaml:/app/app-config.local.yaml:ro \
  veecode/devportal:2.1.3
```

## Next Steps

- [Configure Dynamic Plugins](./custom-plugins)
- [Add Custom Catalog](./custom-catalog)
