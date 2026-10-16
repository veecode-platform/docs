---
sidebar_position: 2
sidebar_label: Adding Plugins
title: Adding Plugins
---

This page explains how to add a plugin to a DevPortal 3.x instance: through the chart values on Kubernetes, through the operator plugin file on the local stack, or through Marketplace on either one.

## Prerequisites

Decide which plugin you need and find its package reference first. Default plugins list their exact reference on their bundled page. Marketplace plugins expose their reference as a `Package` catalog entity. See [Find the package reference](#find-the-package-reference).

Some plugins need configuration values before the portal starts. For example, enabling the Grafana package without `grafana.domain` set makes the backend log `Config must have required property 'domain' ... at /grafana` and stop at startup. Add the required settings to your app configuration before you enable such a plugin.

## Via Marketplace

Open the **Marketplace** sidebar item and select **Install** on the plugin card. The portal writes the selection to PostgreSQL and to `/devportal-data/extensions-install.yaml` at once, and the card shows a pending state.

A plain restart of the portal container does not apply the selection: the plugin installer only runs when the stack starts. On the local stack, take the stack down (keeping volumes) and start it again with the same Compose files:

```bash
docker compose down
docker compose up -d
```

After the restart the install service logs show `Installing OCI plugin ...` for the new package. The same cycle applies after uninstalling a plugin. On Kubernetes, restart the deployment with `kubectl rollout restart` and wait for the rollout to finish; the production setup guide shows the exact commands in [Install a plugin from the marketplace](../installation-guide/production-setup/setup.md#install-a-plugin-from-the-marketplace).

## On Kubernetes: chart values

Add the plugin under `global.dynamic.plugins` in your values file, using a full digest-pinned OCI reference. An entry for a new plugin adds it; an entry that matches a default plugin by registry, repository, and plugin path overrides that default plugin. To disable a default plugin, see [Disable a default plugin](../installation-guide/production-setup/setup.md#disable-a-default-plugin).

```yaml
global:
  dynamic:
    plugins:
      - package: oci://quay.io/veecode/backstage-community-plugin-github-actions@sha256:2b4ffde7809fced57ee77f1153d029bbdce1580f1cff926d8be4dafed25b4a72
        disabled: false
```

To turn off a default plugin instead, add an entry for that plugin with the `{{inherit}}` tag and the full `!<plugin path>` part, plus `disabled: true`. This example disables the Tech Radar frontend. The installer matches the override to the default plugin by registry, repository, and the plugin path after `!`; the tag is not part of the match, and `{{inherit}}` takes the version the catalog index gives the plugin. A tag or digest in an override sets that version instead, so a stale digest pins an older artifact. Write the tag as `{{ "{{inherit}}" }}` here because the chart renders this list as a template.

```yaml
global:
  dynamic:
    plugins:
      - package: oci://quay.io/veecode/backstage-community-plugin-tech-radar:{{ "{{inherit}}" }}!backstage-community-plugin-tech-radar
        disabled: true
```

If your override for a default plugin also sets `pluginConfig`, it replaces that plugin's whole `pluginConfig` instead of merging with it. Copy the complete `pluginConfig` block from the catalog index's `dynamic-plugins.default.yaml` and edit values in place. Each bundled page gives the override reference for its plugin.

Then upgrade the release. The production setup guide shows the full flow in [Disable a default plugin](../installation-guide/production-setup/setup.md#disable-a-default-plugin).

## Plugins that 3.0.x bundled in the image

DevPortal 3.0.3 bundled 41 plugins under `/opt/app-root/src/dynamic-plugins/dist`. The 3.1 image has no `dynamic-plugins/` directory. Plugins that 3.0.x shipped there are OCI artifacts from 3.1 on, and they are disabled by default. An entry with a `./dynamic-plugins/dist/...` path is skipped without an error, so the plugin is missing. Replace each such entry with the plugin's `oci://` reference from the Marketplace or the catalog index.

For example, the GitHub scaffolder module is an OCI artifact in the catalog index, disabled by default. On Kubernetes, enable it under `global.dynamic.plugins`:

```yaml
global:
  dynamic:
    plugins:
      - package: oci://quay.io/veecode/backstage-plugin-scaffolder-backend-module-github@sha256:bb3f9763b14b6bd524b99b58e209a3b89d7fdf9ccadcb6d957f8d365c1d5a719
        disabled: false
```

On the local stack, add the same entry under `plugins:` in the operator plugin file, then apply it with `docker compose down` and `docker compose up -d` using the same Compose files:

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-plugin-scaffolder-backend-module-github@sha256:bb3f9763b14b6bd524b99b58e209a3b89d7fdf9ccadcb6d957f8d365c1d5a719
    disabled: false
```

The GitHub scaffolder module loads at startup without extra configuration and adds actions such as `publish:github` and `publish:github:pull-request`. Configure a GitHub integration token before you run those actions.

The Marketplace lists the same upstream module as the `github-scaffolder-actions` plugin, backed by the digest-pinned OCI artifact above. The default plugin index has no `./dynamic-plugins/dist/...` entries. To change which catalog index the portal reads, see [Configure the plugin catalog index](../installation-guide/production-setup/catalog-index.md).

## On the local stack: the operator plugin file

The local stack merges an operator plugin file with Marketplace selections before installing plugins. Create the file and mount it as described in [Configure dynamic plugins for the local stack](../installation-guide/docker-local/custom-plugins.md), and put the same kind of entries in it: a digest-pinned reference with `disabled: false` to enable a plugin, or a default plugin's `{{inherit}}` reference with `disabled: true` to turn it off. In this file write `{{inherit}}` as is (no extra quoting). Apply the change with `down` (keeping volumes) followed by `up -d` using the same Compose files:

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-community-plugin-tech-radar:{{inherit}}!backstage-community-plugin-tech-radar
    disabled: true
```

## Find the package reference

For a default plugin, print the list of default plugin names from the running portal. It lists all 18 default plugins by repository and path. The override reference for one of them is `oci://<repository>:{{inherit}}!<path>`.

```bash
docker compose exec devportal cat /opt/app-root/src/factory-plugins.yaml
```

For a Marketplace plugin, read the reference from its `Package` catalog entity in the `rhdh` namespace: the `spec.dynamicArtifact` value is the digest-pinned OCI reference to use in a plugin entry. For example, the Grafana package entity carries:

```json
{"metadata":{"name":"backstage-community-plugin-grafana","namespace":"rhdh"},"spec":{"dynamicArtifact":"oci://quay.io/veecode/backstage-community-plugin-grafana@sha256:27e84e524b188b84bc46d35783e628c01d63d11293ec86454b34e08a333deceb"}}
```

## Configuring credentials

Keep plugin credentials in app configuration, not in the plugin entry. On Kubernetes, place them under `upstream.backstage.appConfig` in the chart values (sensitive values belong in the runtime Secret the install guide creates). On the local stack, add them to the custom configuration fragment. Each plugin page shows the settings its plugin needs: Azure DevOps needs `azureDevOps` host, token, and organization; Jenkins needs `jenkins` base URL and credentials; GitHub Actions needs a GitHub integration token.

## Check what was installed

Read the install service logs to see which OCI plugins were installed or skipped:

```bash
docker compose logs install-dynamic-plugins
```

The logs include lines such as `Installing OCI plugin ...` and `Skipping disabled plugin ...`. In the portal, the Marketplace **Installed packages** tab lists the packages the portal runs.
