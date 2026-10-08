---
sidebar_position: 2
sidebar_label: Adding Plugins
title: Adding Plugins
---

This page explains how to add a plugin to a DevPortal 3.x instance: through the chart values on Kubernetes, through the operator plugin file on the local stack, or through Marketplace on either one.

## Prerequisites

Decide which plugin you need and find its package reference first. Default plugins list their exact reference on their bundled page. Marketplace plugins expose their reference as a `Package` catalog entity. See [Find the package reference](#find-the-package-reference).

Some plugins need configuration values before the portal starts. For example, enabling the Grafana package without `grafana.domain` set makes the backend log `Config must have required property 'domain' ... at /grafana` during startup while the health check still answers. Add the required settings to your app configuration before you enable such a plugin.

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
      - package: oci://quay.io/veecode/backstage-community-plugin-github-actions@sha256:fe9cea3a11097339f85bab0bf095ecf1dc95b972194d41e4c9ca0e34c85ecebd
        disabled: false
```

To turn off a default plugin instead, add an entry for that plugin with the `{{inherit}}` tag and the full `!<plugin path>` part, plus `disabled: true`. This example disables the Tech Radar frontend. The installer matches the override to the default plugin by registry, repository, and the plugin path after `!`; the tag is not part of the match, and `{{inherit}}` keeps the version the default plugin file pins. A tag or digest in an override sets that version instead, so a stale digest pins an older artifact. Write the tag as `{{ "{{inherit}}" }}` here because the chart renders this list as a template.

```yaml
global:
  dynamic:
    plugins:
      - package: oci://quay.io/veecode/backstage-community-plugin-tech-radar:{{ "{{inherit}}" }}!backstage-community-plugin-tech-radar
        disabled: true
```

If your override for a default plugin also sets `pluginConfig`, it replaces that plugin's whole `pluginConfig` instead of merging with it. Copy the complete `pluginConfig` block from the default plugin file and edit values in place. Each bundled page gives the override reference for its plugin.

Then upgrade the release. The production setup guide shows the full flow in [Disable a default plugin](../installation-guide/production-setup/setup.md#disable-a-default-plugin).

## Enable a plugin bundled in the image

DevPortal 3.0.3 bundles 41 plugins under `/opt/app-root/src/dynamic-plugins/dist`. These bundled plugins are separate from the 20 default plugins. A `./dynamic-plugins/dist/...` entry enables a bundled plugin and does not override a default plugin; to disable or reconfigure a default plugin, use the OCI `{{inherit}}` form described in [Disable a default plugin](../installation-guide/production-setup/setup.md#disable-a-default-plugin). List their directories on the local stack with:

```bash
docker compose exec devportal ls /opt/app-root/src/dynamic-plugins/dist
```

To enable a bundled plugin on the local stack, add its relative path to the operator plugin file and set `disabled` to `false`:

```yaml
plugins:
  - package: ./dynamic-plugins/dist/backstage-plugin-scaffolder-backend-module-github-dynamic
    disabled: false
```

Apply the change by running `docker compose down` and then `docker compose up -d` with the same Compose files. On Kubernetes, put the same entry under `global.dynamic.plugins`:

```yaml
global:
  dynamic:
    plugins:
      - package: ./dynamic-plugins/dist/backstage-plugin-scaffolder-backend-module-github-dynamic
        disabled: false
```

The [production setup guide's Keycloak catalog module example](../installation-guide/production-setup/setup.md#step-6-install-devportal) uses this path.

The GitHub scaffolder module loads at startup without extra configuration and adds actions such as `publish:github` and `publish:github:pull-request`. Configure a GitHub integration token before you run those actions.

The Marketplace offers the same upstream module in the `github-scaffolder-actions` collection as a digest-pinned OCI artifact. A bundled path does not require pulling that artifact from a registry, which helps when a cluster cannot reach the registry. The default plugin index lists none of the `./dynamic-plugins/dist` paths, so those paths do not appear there as installable entries. To change which catalog index the portal reads, see [Configure the plugin catalog index](../installation-guide/production-setup/catalog-index.md).

## On the local stack: the operator plugin file

The local stack merges an operator plugin file with Marketplace selections before installing plugins. Create the file and mount it as described in [Configure dynamic plugins for the local stack](../installation-guide/docker-local/custom-plugins.md), and put the same kind of entries in it: a digest-pinned reference with `disabled: false` to enable a plugin, or a default plugin's `{{inherit}}` reference with `disabled: true` to turn it off. In this file write `{{inherit}}` as is (no extra quoting). Apply the change with `down` (keeping volumes) followed by `up -d` using the same Compose files:

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-community-plugin-tech-radar:{{inherit}}!backstage-community-plugin-tech-radar
    disabled: true
```

## Find the package reference

For a default plugin, print the default plugin file from the running portal. It lists all 20 default plugins with their exact references:

```bash
docker compose exec devportal cat /opt/app-root/src/dynamic-plugins.veecode.yaml
```

For a Marketplace plugin, read the reference from its `Package` catalog entity in the `rhdh` namespace: the `spec.dynamicArtifact` value is the digest-pinned OCI reference to use in a plugin entry. For example, the Grafana package entity carries:

```json
{"metadata":{"name":"backstage-community-plugin-grafana","namespace":"rhdh"},"spec":{"dynamicArtifact":"oci://quay.io/veecode/backstage-community-plugin-grafana@sha256:f532f66d796de182d32cbe5f0eb7f0829cc31e61dac09f6cfed646ef6f8bcad3"}}
```

## Configuring credentials

Keep plugin credentials in app configuration, not in the plugin entry. On Kubernetes, place them under `upstream.backstage.appConfig` in the chart values (sensitive values belong in the runtime Secret the install guide creates). On the local stack, add them to the custom configuration fragment. Each plugin page shows the settings its plugin needs: Azure DevOps needs `azureDevOps` host, token, and organization; Jenkins needs `jenkins` base URL and credentials; GitHub Actions needs a GitHub integration token.

## Check what was installed

Read the install service logs to see which OCI plugins were installed or skipped:

```bash
docker compose logs install-dynamic-plugins
```

The logs include lines such as `Installing OCI plugin ...` and `Skipping disabled plugin ...`. In the portal, the Marketplace **Installed packages** tab lists the packages the portal runs.
