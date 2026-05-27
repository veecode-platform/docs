---
sidebar_position: 16
sidebar_label: Loading
title: "Loading a Dynamic Plugin"
---

Dynamic plugins can be loaded by VeeCode DevPortal at start time. They are usually published to a private npm registry or OCI registry, and the DevPortal instance will load them from there according to the configuration.

## Configuration

There are two configuration surfaces depending on your deployment model:

### `dynamic-plugins.yaml` (distro container / SaaS)

For the standard DevPortal container (docker-compose, SaaS, or VKDR), edit `dynamic-plugins.yaml` directly:

```yaml
plugins:
  # npm plugin
  - package: '@yourorg/yourplugin@x.y.z'
    disabled: false
    integrity: sha512-xxxxxxxxx
  # preloaded plugin (uses path relative to the dynamic-plugins directory)
  - package: ./dynamic-plugins/dist/another-plugin-dynamic
    disabled: false
```

### Helm `values.yaml` (Kubernetes deployment)

For Kubernetes deployments using the VeeCode Helm chart, configure plugins under `global.dynamic.plugins`:

```yaml
global:
  dynamic:
    plugins:
      # npm plugin
      - package: '@yourorg/yourplugin@x.y.z'
        disabled: false
        integrity: sha512-xxxxxxxxx
      # preloaded plugin
      - package: ./dynamic-plugins/dist/another-plugin-dynamic
        disabled: false
```

Both surfaces accept the same plugin entry format. The `dynamic-plugins.yaml` approach is recommended for non-Helm deployments.

## Private npm registry

Due to security and compliance reasons you may not want VeeCode DevPortal to load plugins from public npm registries. You may prefer to use a private npm registry, like Nexus, Artifactory or even Verdaccio.

VeeCode DevPortal can be configured to rely on a private npm registry - you just have to configure a special secret named "veecode-devportal-dynamic-plugins-npmrc" (where "veecode-devportal" is the Helm release name) in the same namespace as the DevPortal deployment:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: veecode-devportal-dynamic-plugins-npmrc
  namespace: <your-namespace>
type: Opaque
stringData:
  .npmrc: |
    registry=<registry-url>
    //<registry-url>:_authToken=<auth-token>
```

Alternatively you can create the secret using the `kubectl` command:

```bash
kubectl create secret generic veecode-devportal-dynamic-plugins-npmrc \
  "--from-literal=.npmrc=registry=your-registry-url"
```

## Wiring plugins

Dynamic plugins have the ability to wire themselves to the DevPortal instance configuration. **This is a critical feature** because unlike static plugins they cannot imply in code changes to the host Backstage project.

Backend plugins should be detected and loaded automatically, but frontend plugins must be wired by `pluginConfig:` to the DevPortal instance.

All dynamic plugins can bring their own settings in the `pluginConfig:` field:

```yaml
  dynamic:
    plugins:
      # npm plugin
      - package: '@yourorg/yourplugin@x.y.z'
        disabled: false
        integrity: sha512-xxxxxxxxx
        pluginConfig:
          dynamicPlugins:
            something:
              morethings:
                - foo
                - bar
```

:::important
The `pluginConfig` field affects frontend plugins and backend plugins differently. Backend plugins will have their content merged with Backstage "appConfig", while frontend plugins will have their content processed by the "scalprum" component (who will then define routes, sidebars, mount points, icons, APIs, etc.).
:::

Please check our [Wiring a Frontend Plugin](wiring.md) page for more info on this subject.

## Tips

You can check the loaded plugins using this URL:

```bash
curl <your-devportal-url>/api/dynamic-plugins-info/loaded-plugins
```
