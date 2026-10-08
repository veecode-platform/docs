---
sidebar_position: 5
sidebar_label: Dynamic Plugins
title: Configure dynamic plugins for the local stack
---

The image contains a default plugin index and the default plugin file (`dynamic-plugins.veecode.yaml`). The local stack mounts an operator plugin file into the `install-dynamic-plugins` service, which merges its entries with Marketplace selections before installing plugins.

The root `dynamic-plugins.yaml` is derived from the pinned chart. Do not edit it. Create a separate operator file for local additions.

## Add an operator plugin file

Create `dynamic-plugins.local.yaml` in the `devportal-local` directory. Include the default plugin index and the default plugin file:

```yaml
includes:
  - dynamic-plugins.default.yaml
  - /opt/app-root/src/dynamic-plugins.veecode.yaml
plugins: []
```

Replace `plugins: []` with the entries you need. Use a full digest-pinned OCI package reference to enable a plugin that is not a default plugin. To override a default plugin, use `oci://<registry>/<repository>:{{inherit}}!<plugin path>` with the full `!<plugin path>` suffix.

The installer matches an override by registry, repository, and plugin path, not by tag or digest. A tag or digest in an override sets the plugin version, so a stale digest can pin an older artifact. An override's `pluginConfig` replaces the default plugin's entire `pluginConfig`. Include every setting you want to keep.

### Enable or disable plugins from the index

This example enables the regex scaffolder module and disables the Tech Radar frontend:

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-community-plugin-scaffolder-backend-module-regex@sha256:e0f3e1f69cb6c1bccd538f8ed80e6b16b85f2540b8866c636225903bb76a0e35
    disabled: false
  - package: oci://quay.io/veecode/backstage-community-plugin-tech-radar:{{inherit}}!backstage-community-plugin-tech-radar
    disabled: true
```

The regex module adds the `regex:replace` action.

## Find plugin references

Print the default plugin file from the running container:

```bash
docker compose exec devportal cat /opt/app-root/src/dynamic-plugins.veecode.yaml
```

The file lists the default plugins with their package references. Each Marketplace package is a `Package` catalog entity in the `rhdh` namespace. Copy its `spec.dynamicArtifact` value into a plugin entry.

## How the plugin list is assembled

The `includes` list starts with `dynamic-plugins.default.yaml` and `/opt/app-root/src/dynamic-plugins.veecode.yaml`. The install service then places operator plugin entries before Marketplace selections. If both name the same plugin, the operator entry wins.

## Mount the operator plugin file with Compose

Create `docker-compose.plugins.yaml` in the same directory to mount your file at the operator config path:

```yaml
services:
  install-dynamic-plugins:
    volumes:
      - ./dynamic-plugins.local.yaml:/opt/app-root/src/dynamic-plugins.operator.yaml:ro
```

Start the local stack with both Compose files:

```bash
docker compose -f docker-compose.yml -f docker-compose.plugins.yaml up -d
```

If you also use the overrides from [Add a configuration fragment](./custom-config.md) or [Add catalog entities](./custom-catalog.md), keep their `-f` flags in this command and in every later one, so their changes stay loaded.

To apply a change to the operator file, restart with the same Compose files. This keeps the named volumes, including PostgreSQL:

```bash
docker compose -f docker-compose.yml -f docker-compose.plugins.yaml down
docker compose -f docker-compose.yml -f docker-compose.plugins.yaml up -d
```

## Plugins that need configuration

Some plugins need configuration values in a custom fragment before the portal starts. If the portal stops after a plugin change, read the `devportal` service logs:

```bash
docker compose logs devportal
```

Add the required settings to [the custom configuration fragment](./custom-config.md) before enabling the plugin.

## Marketplace state

An install or uninstall writes the Marketplace selection to PostgreSQL and `/devportal-data/extensions-install.yaml` at once. A plain `docker compose restart devportal` does not run the plugin installer, so it does not apply the selection.

To install a plugin from Marketplace, follow these steps:

1. Open [http://localhost:7007/marketplace](http://localhost:7007/marketplace) after the catalog loads. If you changed `DEVPORTAL_PORT`, use that port instead of 7007.
2. Choose a plugin, select **Install**, and confirm the restart prompt.
3. Recreate the local stack with the same Compose files. Do not pass `-v`.

If you use the operator override above, run the two Compose commands from [Mount the operator plugin file with Compose](#mount-the-operator-plugin-file-with-compose). If you use only the base local stack, run `docker compose down` and then `docker compose up -d` from the `devportal-local` directory. Use the same cycle after uninstalling a plugin.

## Check what was installed

Read the install service logs to see which OCI plugins were installed or skipped:

```bash
docker compose logs install-dynamic-plugins
```

The logs include lines such as `Installing OCI plugin ...` and `Skipping disabled plugin ...`.

For more plugin documentation, see the [Plugins guide](../../plugins/plugins.md).
