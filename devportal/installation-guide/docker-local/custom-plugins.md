---
sidebar_position: 5
sidebar_label: Dynamic Plugins
title: Configure dynamic plugins for the local stack
---

The default plugins come from the plugin catalog index, not from the portal image. The image carries only their names, in `/opt/app-root/src/factory-plugins.yaml`. The local stack mounts an operator plugin file into the `install-dynamic-plugins` service, which merges its entries with Marketplace selections before installing plugins. The `devportal-local` checkout ships `docker-compose.yml` and `docker-compose.dynamic-plugins-root.yml`. You create `dynamic-plugins-root-dev/dynamic-plugins.local.yaml` and `dynamic-plugins-root-dev/docker-compose.dynamic-plugins-root.local.yml`; `yarn dev:dynamic` creates both for a workspace export.

The root `dynamic-plugins.yaml` is derived from the pinned chart. Do not edit it. Use the separate operator file for local additions. Use OCI references for published plugins. For a workspace export, use the `./dynamic-plugins-src/<exported-directory>` path and mount `dynamic-plugins-src-dev` into `install-dynamic-plugins`; [Creating Your Own Plugin](../../plugins/development/creating-own-plugins.md) shows that flow.

## Add an operator plugin file

From the `devportal-local` directory, create the local directories and operator file. Include the default plugin index:

```bash
mkdir -p dynamic-plugins-root-dev dynamic-plugins-src-dev
```

```yaml
includes:
  - dynamic-plugins.default.yaml
plugins: []
```

Replace `plugins: []` with the entries you need. Use a full digest-pinned OCI package reference for a published plugin that is not in the default index. To override a default plugin, use `oci://<registry>/<repository>:{{inherit}}!<plugin path>` with the full `!<plugin path>` suffix.

The installer matches an override by registry, repository, and plugin path, not by tag or digest. A tag or digest in an override sets the plugin version, so a stale digest can pin an older artifact. An override's `pluginConfig` replaces the default plugin's entire `pluginConfig`. Include every setting you want to keep.

### Enable or disable plugins from the index

This example enables the regex scaffolder module and disables the Tech Radar frontend:

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-community-plugin-scaffolder-backend-module-regex@sha256:3b19c142968ab34c6180332156ba345e9bebbffd2ff79bef14d3d645b8f6c05d
    disabled: false
  - package: oci://quay.io/veecode/backstage-community-plugin-tech-radar:{{inherit}}!backstage-community-plugin-tech-radar
    disabled: true
```

The regex module adds the `regex:replace` action.

## Find plugin references

Print the default plugin names from the running container:

```bash
docker compose exec devportal cat /opt/app-root/src/factory-plugins.yaml
```

The file lists each default plugin by its repository and path. Their configuration is in the `dynamic-plugins.default.yaml` file of the catalog index. To extract that file on the local stack, copy the image reference from `CATALOG_INDEX_IMAGE` in the `install-dynamic-plugins` service of `docker-compose.yml`, then run the `docker create` and `docker cp` commands in [What ships by default](../production-setup/setup.md#what-ships-by-default) with that reference in place of the chart's index. Each Marketplace package is a `Package` catalog entity in the `rhdh` namespace. Copy its `spec.dynamicArtifact` value into a plugin entry.

## How the plugin list is assembled

The `includes` list holds `dynamic-plugins.default.yaml`, the default plugin file of the catalog index. The install service then places operator plugin entries before Marketplace selections. If both name the same plugin, the operator entry wins.

## Mount the operator plugin file with Compose

Create `dynamic-plugins-root-dev/docker-compose.dynamic-plugins-root.local.yml` to mount the operator file and local export directory:

```yaml
services:
  install-dynamic-plugins:
    volumes:
      - ./dynamic-plugins-root-dev/dynamic-plugins.local.yaml:/opt/app-root/src/dynamic-plugins.operator.yaml:ro
      - ./dynamic-plugins-src-dev:/opt/app-root/src/dynamic-plugins-src
```

Start the local stack with the two files shipped by `devportal-local` and the override you created:

```bash
docker compose -f docker-compose.yml -f docker-compose.dynamic-plugins-root.yml -f dynamic-plugins-root-dev/docker-compose.dynamic-plugins-root.local.yml up -d
```

If you also use the overrides from [Add a configuration fragment](./custom-config.md) or [Add catalog entities](./custom-catalog.md), keep their `-f` flags in this command and in every later one, so their changes stay loaded.

To apply a change to the operator file, restart with the same Compose files. This keeps the named volumes, including PostgreSQL:

```bash
docker compose -f docker-compose.yml -f docker-compose.dynamic-plugins-root.yml -f dynamic-plugins-root-dev/docker-compose.dynamic-plugins-root.local.yml down
docker compose -f docker-compose.yml -f docker-compose.dynamic-plugins-root.yml -f dynamic-plugins-root-dev/docker-compose.dynamic-plugins-root.local.yml up -d
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
