---
sidebar_position: 14
sidebar_label: Packaging
title: "Packaging your Plugin"
---

Plugins must be built and packaged before being distributed. Development happens in a workspace from the [devportal-plugins](https://github.com/veecode-platform/devportal-plugins) repository, and DevPortal loads the result as a dynamic plugin at start time.

## Build the plugin

To build all plugins under the workspace just go to the workspace root folder and run:

```bash
yarn tsc
yarn build:all
```

This type-checks the workspace and builds every package.

## Export a dynamic package

A dynamic plugin is a plugin that can be loaded at runtime. It is not statically linked to the host project, but is loaded at start time.

Technically, a dynamic plugin is a slightly different repackaging of a regular plugin. To export, run this command at the workspace root *after you have already built it successfully*:

```bash
yarn dev:dynamic
```

The command exports every workspace package into `dynamic-plugins-root-dev` and prints the Compose command that loads the export into devportal-local. Use that export for local testing, as described in [Creating Your Own Plugin](./creating-own-plugins.md): no publishing step is needed to see the plugin run.

:::info
The workspace export uses the Red Hat Developer Hub CLI (`rhdh-cli plugin export`) under the hood. Older material may call it by its previous name, `@janus-idp/cli`.
:::

## Publish as an OCI artifact

When the plugin works locally, publish it as an OCI image in a registry your DevPortal can pull from, then reference the image in a plugin entry.

### Publish in your own registry

The Red Hat Developer Hub CLI packages a plugin as an OCI image with its `plugin package` command. Follow the [Red Hat Developer Hub documentation](https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.7/html-single/installing_and_viewing_plugins_in_red_hat_developer_hub/index#assembly-package-publish-third-party-dynamic-plugin) for the command, then push the image to your registry.

### Propose a plugin for the DevPortal catalog

VeeCode publishes the plugins of the DevPortal catalog from the public [export overlays](https://github.com/veecode-platform/devportal-plugin-export-overlays) repository. That repository exports upstream Backstage plugins as dynamic plugins and publishes one OCI image per plugin. To propose a plugin, open a pull request that adds a plugin workspace:

1. Create a directory under `workspaces/<workspace-name>/`.
2. Add a `source.json` pointing at the upstream repository and version.
3. Add a `plugins-list.yaml` listing the plugins to export.
4. Optionally add a `metadata/` directory with one Package manifest per plugin. These manifests feed smoke tests and the Extensions UI.

The repository's GitHub Actions workflows build and publish the images. Published images live under `quay.io/veecode/<plugin-name>`, with tags shaped like `bs_<backstage-version>__<plugin-version>`, for example `bs_1.52.0__2.8.0`.

### Reference the image

Reference the published image in a plugin entry by its digest. For an image in the DevPortal catalog the entry looks like this:

```yaml
plugins:
  - package: oci://quay.io/veecode/<plugin-name>@sha256:<digest>
    disabled: false
```

An image that holds one plugin needs no `!<plugin path>` suffix: the installer reads the path from the image manifest. To turn on or change a plugin that is already in the default plugin list, follow [Adding Plugins](../adding.md) instead. See [Loading a Dynamic Plugin](./loading.md) and [Configure dynamic plugins for the local stack](../../installation-guide/docker-local/custom-plugins.md) for where the entry goes.

An OCI plugin image and its Extensions catalog entry are distinct artifacts. The catalog index is a separate OCI image that supplies the Extensions UI metadata; publishing the plugin image alone does not list it in the Marketplace.

## Packaging options

The OCI path above is the default for DevPortal 3.x. You have other options where the plugin owner needs them:

- You can host the `tgz` file produced by `npm pack` on an internal web server and use its URL in the `package` field.
- You can use a local path in the `package` field with a volume mount into the portal container, which is what `yarn dev:dynamic` plus the devportal-local override does during development.
- You can publish the dynamic package to an npm registry, public or private, and pin it with an `integrity` hash. See [Loading a Dynamic Plugin](./loading.md#generating-the-integrity-hash).

You can find more info on these packaging options in [Red Hat Developer Hub documentation](https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.7/html-single/installing_and_viewing_plugins_in_red_hat_developer_hub/index#assembly-package-publish-third-party-dynamic-plugin). Both VeeCode DevPortal and RHDH use the same dynamic loading mechanism.

## Additional Notes

It becomes clear that plugins may have a release cycle of their own, and any DevPortal instance should be able to load the specific plugins it chooses.
