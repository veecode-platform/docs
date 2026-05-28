---
sidebar_position: 3
sidebar_label: Dynamic Plugins
title: Custom Dynamic Plugins
---

## Custom Dynamic Plugins

DevPortal supports **dynamic plugins** that can be enabled, disabled, and configured at runtime without rebuilding the container image. This guide shows you how to enable and customize plugin behavior using a custom `dynamic-plugins.yaml` file mount by docker compose.

:::important
Dynamic plugins are a deep subject on their own. Please refer to the [Plugins](/devportal/plugins/) section for more information.
:::

## Understanding Dynamic Plugins

The DevPortal image ships with pre-installed plugins, enabled by default. You add operator-level overrides by mounting a single file:

- **`dynamic-plugins.yaml`** (mounted at runtime): a top-level `plugins:` list of your overrides. The entrypoint merges it on top of the image defaults automatically — you never reference the image's internal default file.

## Creating a Custom Plugins File

Create a `dynamic-plugins.yaml` file in your project directory. In this file you can simply enable pre-installed plugins (and use them with their default settings), disable them, or download and configure plugins from NPM or OCI registries.

All *pre-installed plugins* are available in the container image at `/app/dynamic-plugins/dist/` - you can use relative paths to them. Downloaded plugins will be referenced by their NPM or OCI registry URL and fetched at runtime.

```yaml
plugins:
  # Enable a pre-installed plugin with its default settings
  - package: './dynamic-plugins/dist/some-plugin-dynamic'
    disabled: false

  # Disable a plugin
  - package: './dynamic-plugins/dist/another-plugin-dynamic'
    disabled: true
    
  # Download and configure plugin with custom settings
  - package: '@someorg/custom-plugin-dynamic'
    disabled: false
    pluginConfig:
      here:
        goes: xxx
        some: yyy
        config: yyy
```

## Mounting with Docker Run

```bash
docker run --rm --name devportal -d \
  -p 7007:7007 \
  -v $(pwd)/dynamic-plugins.yaml:/app/dynamic-plugins.yaml:ro \
  veecode/devportal:2.0.0
```

## Mounting with Docker Compose

Update your `docker-compose.yml`:

```yaml
services:
  devportal:
    image: veecode/devportal:2.0.0
    ports:
      - "7007:7007"
    volumes:
      - ./dynamic-plugins.yaml:/app/dynamic-plugins.yaml:ro
```

## Loading External Plugins

You can also load plugins from external registries (NPM or OCI):

```yaml
plugins:
  # Load from NPM registry
  - package: '@someorg/my-custom-plugin@1.0.0'
    disabled: false
    
  # Load from OCI registry
  - package: 'oci://ghcr.io/my-org/my-plugin:latest'
    disabled: false
```

## How merging works — the entrypoint owns `includes:`

You provide only a top-level `plugins:` list. You do **not** write an `includes:` key. On every boot the entrypoint copies your `dynamic-plugins.yaml` to a writable shadow and **rebuilds** the `includes:` chain itself, prepending the resolved image defaults, the marketplace state, and any preset fragments. Any `includes:` you add is replaced — so you cannot accidentally drop the pre-installed plugins by omitting it:

```yaml
plugins:
  # Your overrides — the image defaults are preserved automatically
  - package: './dynamic-plugins/dist/some-plugin-dynamic'
    disabled: false
```

(The entrypoint-owned shadow it prepends is `dynamic-plugins.default.resolved.yaml`, the image defaults with `${BACKSTAGE_VERSION}` and `${PLUGIN_REGISTRY}` already substituted. It exists for the entrypoint's use — you don't reference it.)

After the plugin install script runs, it generates `dynamic-plugins-root/app-config.dynamic-plugins.yaml` from the `pluginConfig` blocks of all enabled plugins. This generated file is loaded last in the config chain (after your `app-config.local.yaml`).

### `extensions-install.yaml`

You may notice an `extensions-install.yaml` file in the working directory. This is a write-through cache for marketplace plugin installation state — the database is the source of truth and the Node app regenerates this file on every change. The Python install script reads it at startup. Do not delete it; if it is missing, the entrypoint creates an empty one automatically.

## Important Notes

Dynamic plugins are a deep subject on their own. Please refer to the [Plugins](/devportal/plugins/) section for more information. The dynamic plugins feature is based on the same plugin system used by Red Hat Developer Hub, so Red Hat documentation is also a good resource on this topic.

:::warning
Dynamic plugins require a special kind of packaging. All DevPortal pre-installed dynamic plugins are published on the public NPM registry and pulled at build time into the `veecode/devportal` distro image. **Not all plugins are available as dynamic plugins**, so please check each plugin's documentation to see if it is available as such. There is usually a `-dynamic` suffix in a dynamic plugin package name, and they tend to exist in both forms in the NPM registry.
:::

## Examples

OCI plugins are fetched via `skopeo` at boot. See the [Dynamic Plugins](/devportal/plugins/) section for OCI registry usage examples.

## Viewing Available Plugins

To see which plugins are pre-installed in your image, check the logs when the container starts:

```bash
docker logs devportal | grep "dynamic-plugins"
```
