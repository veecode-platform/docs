---
sidebar_position: 16
sidebar_label: Loading
title: "Loading a Dynamic Plugin"
---

Dynamic plugins can be loaded by VeeCode DevPortal at start time. They are usually published to a private npm registry or OCI registry, and the DevPortal instance will load them from there according to the configuration.

## Configuration

Mount a `dynamic-plugins.yaml` file at `/app/dynamic-plugins.yaml` and include the default chain so pre-installed plugins are preserved:

```yaml
includes:
  - dynamic-plugins.default.resolved.yaml

plugins:
  # npm plugin
  - package: '@yourorg/yourplugin@x.y.z'
    disabled: false
    integrity: sha512-xxxxxxxxx
  # preloaded plugin (path relative to the dynamic-plugins directory)
  - package: ./dynamic-plugins/dist/another-plugin-dynamic
    disabled: false
```

Mount it in your compose file or Kubernetes Deployment manifest — see [Adding Plugins](../adding) for the exact volume/ConfigMap syntax.

## Private npm registry

Due to security and compliance reasons you may not want VeeCode DevPortal to load plugins from public npm registries. You may prefer to use a private npm registry, like Nexus, Artifactory or even Verdaccio.

Mount a `.npmrc` file into the container at `/app/.npmrc` (or the path the install script reads from). For Kubernetes, create a Secret and mount it as a volume:

```bash
kubectl create secret generic devportal-npmrc \
  --namespace platform \
  "--from-literal=.npmrc=registry=https://your-registry-url/"
```

```yaml
# Deployment volumeMount
- mountPath: /app/.npmrc
  name: npmrc
  subPath: .npmrc
  readOnly: true

# Volume
- name: npmrc
  secret:
    secretName: devportal-npmrc
```

## Wiring plugins

Dynamic plugins have the ability to wire themselves to the DevPortal instance configuration. **This is a critical feature** because unlike static plugins they cannot imply in code changes to the host Backstage project.

Backend plugins should be detected and loaded automatically, but frontend plugins must be wired by `pluginConfig:` to the DevPortal instance.

All dynamic plugins can bring their own settings in the `pluginConfig:` field:

```yaml
plugins:
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
