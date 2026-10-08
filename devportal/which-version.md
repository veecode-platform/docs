---
sidebar_position: 2
sidebar_label: Which version am I running?
title: Which version am I running?
---

# Which version am I running?

These docs cover DevPortal 3.x. Check one signal from your installation against the table below.

## Quick check

| Signal | V1 | 2.x | 3.x |
| --- | --- | --- | --- |
| Container image | Two images, `veecode/devportal-base` and `veecode/devportal`, or the `1.x` image line | `veecode/devportal:2.x` | `veecode/devportal:3.x` |
| Enablement environment variable | `VEECODE_PROFILE=<profile>` | `VEECODE_PRESETS=<preset-list>` | None for plugin selection. Default plugins ship in the image; chart values configure additions and overrides. |
| Helm chart | `veecode-devportal` | `veecode-devportal-platform` | `devportal` |
| Plugin model | Plugins are baked into the distribution image. | Presets or OCI references select plugins. | Default plugins ship in the image. Use chart values or Marketplace installs to add or change plugins. |

Check the image, environment variables, and chart on a running installation with these commands:

```sh
# Docker
docker inspect <container> --format '{{.Config.Image}}'   # image tag
docker inspect <container> --format '{{.Config.Env}}' | tr ' ' '\n' | grep -E 'VEECODE_(PROFILE|PRESETS)'

# Kubernetes
kubectl get deploy -A -o jsonpath='{..image}' | tr ' ' '\n' | grep devportal
helm list -A | grep -E 'devportal'   # chart name and app version
```

## V1

Read the [V1 documentation](/devportal/v1/intro) and its [V1-to-2.x migration guide](/devportal/v2/migrating-from-v1). To continue to 3.x, follow the [2.x-to-3.x migration guide](./migrating-from-2x.md).

## 2.x

Read the [2.x documentation](/devportal/v2/intro). To move to 3.x, follow the [2.x-to-3.x migration guide](./migrating-from-2x.md).

:::note
The `veecode/devportal:latest` tag belongs to the 2.x line. It is not a 3.x tag.
:::

## 3.x

These docs cover 3.x. Start with the [DevPortal 3.x introduction](./intro.md). If you are moving from 2.x, follow the [2.x-to-3.x migration guide](./migrating-from-2x.md).
