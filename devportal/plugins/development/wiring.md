---
sidebar_position: 18
sidebar_label: Wiring
title: "Wiring a Frontend Plugin"
---

Frontend plugins must be wired to the DevPortal instance configuration during dynamic loading, or they will not work at all (despite being loaded). This is a critical feature because - unlike static ones - dynamic plugins cannot imply in code changes to the host Backstage project.

## Understand Frontend Plugin Wiring

All frontend plugins **must** bring their own settings in the `pluginConfig:` field, thus defining routes, sidebars, mount points, icons, APIs, etc.

The sample frontend plugin we have just built and [packaged](packaging.md) defined a page and a sidebar link, so it can be wired to DevPortal by a configuration like the one below:

```yaml
plugins:
  - package: '@your-org/plugin-my-front-plugin-dynamic@x.y.z'
    disabled: false
    integrity: sha512-xxxxxxxxx
    pluginConfig:
      dynamicPlugins:
        frontend:
          your-org.plugin-my-front-plugin:
            dynamicRoutes:
              - path: /my-front-plugin
                importName: MyFrontPluginPage
                menuItem:
                  icon: SomeIcon
                  text: My Plugin Page
                  enabled: true
```

## Testing with VKDR

:::note VKDR is a Helm-based local-dev path, not the V2 format
The `vkdr devportal install --merge` flow below uses VKDR's Helm values format (`global.dynamic.plugins`), which is **not** the V2 install/override format. It still works as a local sandbox for exercising frontend wiring, but the V2 way to test a plugin locally is to mount your `dynamic-plugins.yaml` (a flat top-level `plugins:` list) into the [Docker](../../installation-guide/docker-local/custom-plugins.md) or Kubernetes deployment and restart — see [Adding Plugins](../adding.md).
:::

Our [local DevPortal setup](../../installation-guide/vkdr-local/vkdr-setup.md) using `vkdr` can be used to validate locally the wiring of a dynamic frontend plugin.

### Steps

What you need:

- A local npm registry (run [Verdaccio](https://verdaccio.org/) at local port 4873)
- Publish the frontend plugin to Verdaccio (as described [here](/devportal/plugins/development/packaging#publish-a-dynamic-plugin))
- Obtain the SHA integrity signature of the published plugin
- A local `vkdr` cluster with DevPortal properly installed - check the [local DevPortal setup](../../installation-guide/vkdr-local/vkdr-setup.md) guide for more info.

### Verdaccio

To start a local Verdaccio registry you may run:

```bash
verdaccio -l 0.0.0.0:4873
```

Do not forget to [package and publish the frontend plugin to Verdaccio](/devportal/plugins/development/packaging#publish-a-dynamic-plugin).

### Signature

To obtain the integrity signature of the published plugin you may run (replace `@your-org/plugin-my-front-plugin-dynamic@x.y.x` with your plugin name):

```bash
npm view @your-org/plugin-my-front-plugin-dynamic@x.y.z --registry http://localhost:4873 dist.integrity
```

:::important
The integrity signature is a SHA512 hash of the plugin package. It is required for the dynamic plugin to be loaded.
:::

### VKDR Infra Up

To start a local `vkdr` cluster you may run:

```bash
vkdr infra up
```

### VKDR DevPortal Setup

You can provide `vkdr devportal` command a complimentary YAML file containing the configuration for the dynamic plugin you have just published to Verdaccio. Create a file named `merge-dynamic.yaml` with the following content:

```yaml
global:
  dynamic:
    plugins:
      - package: '@your-org/plugin-my-front-plugin-dynamic@x.y.z'
        disabled: false
        integrity: sha512-xxxxxxxxx
        pluginConfig:
          dynamicPlugins:
            frontend:
              your-org.plugin-my-front-plugin:
                dynamicRoutes:
                  - path: /my-front-plugin
                    importName: MyFrontPluginPage
                    menuItem:
                      icon: LibraryBooks
                      text: My Plugin Page
                      enabled: true
```

Notice this config is equivalent to the static wiring we did in the [frontend plugin](frontend-plugin.md#wire-the-plugin-into-backstage) guide, enabling a route and a sidebar link.

To start `vkdr` and install DevPortal you may run (you need a valid Github token):

```bash
vkdr infra up
vkdr devportal install --github-token $GITHUB_TOKEN \
  --samples --npm "http://host.k3d.internal:4873" \
  --merge ./merge-dynamic.yaml
```

:::note
This command installs DevPortal with the extra plugin wiring. It also installs a few sample apps and configures DevPortal to rely on Verdaccio as an external npm registry.

This is the **V1** `vkdr devportal install` command (Helm-values `--merge` format), used here only as a quick local sandbox to exercise frontend wiring. To install DevPortal V2, use `vkdr devportal-platform install --github-pat ...` — see [Deployment](../../installation-guide/vkdr-local/deployment.md).
:::

### Open DevPortal (VKDR)

The local installation of DevPortal should be available at `http://devportal.localhost:8000`.

![VKDR DevPortal with Dynamic Frontend Plugin](/img/assets/devportal-dyn-plugin.png)

## Additional Documentation

More info on frontend plugin wiring can be found on [RHDH wiring documentation](https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.7/html-single/installing_and_viewing_plugins_in_red_hat_developer_hub/index#assembly-front-end-plugin-wiring.adoc_rhdh-extensions-plugins).
