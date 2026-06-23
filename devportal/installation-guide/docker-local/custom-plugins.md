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

The image includes a catalog of optional plugins, all disabled by default. The core chrome plugins (global header, homepage, About) are pre-installed and enabled by default — they are listed in the shipped `dynamic-plugins.yaml`. You activate plugins via presets or a mounted `dynamic-plugins.yaml`. You add operator-level overrides by mounting a single file:

- **`dynamic-plugins.yaml`** (mounted at runtime): a top-level `plugins:` list. Mounting this file **replaces** the image's `/app/dynamic-plugins.yaml` — it does not merge with it. The entrypoint keeps your `plugins:` entries and assembles the internal `includes:` chain (marketplace state + preset fragments) itself, so you never reference the image's default file. Because it replaces: the shipped file already lists the core chrome plugins (global header, homepage, About) — keep those entries when you add your own, or those frontend plugins stop surfacing.

## Creating a Custom Plugins File

Create a `dynamic-plugins.yaml` file in your project directory. In this file you can simply enable pre-installed plugins (and use them with their default settings), disable them, or download and configure plugins from NPM or OCI registries.

All *pre-installed plugins* are available in the container image at `/app/dynamic-plugins-root/` - you can use relative paths to them. Downloaded plugins will be referenced by their NPM or OCI registry URL and fetched at runtime.

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
  veecode/devportal:2.2.0
```

## Mounting with Docker Compose

Update your `docker-compose.yml`:

```yaml
services:
  devportal:
    image: veecode/devportal:2.2.0
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

## How `dynamic-plugins.yaml` is assembled

You provide only a top-level `plugins:` list. You do **not** write an `includes:` key — the entrypoint owns it. On every boot it copies your `dynamic-plugins.yaml` to a writable shadow and **rebuilds** the `includes:` chain itself (marketplace state + any preset fragments); any `includes:` you add is replaced. `dynamic-plugins.default.yaml` is documentation only (a vitrine) and is **not** part of the runtime chain.

What it does **not** do is merge your `plugins:` list with the image's. A mounted file replaces `/app/dynamic-plugins.yaml` wholesale, so the core chrome plugins (global header, homepage, About) survive only because the shipped file lists them. Keep those entries in your file, then add your own:

```yaml
plugins:
  # keep the shipped core-chrome entries, then add your overrides below
  - package: './dynamic-plugins/dist/some-plugin-dynamic'
    disabled: false
```

After the plugin install script runs, it generates `dynamic-plugins-root/app-config.dynamic-plugins.yaml` from the `pluginConfig` blocks of all enabled plugins. This generated file loads after your `app-config.local.yaml` (and before `app-config.saas.yaml` in SaaS deployments).

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
