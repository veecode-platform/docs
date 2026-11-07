---
sidebar_position: 2
sidebar_label: Which version am I running?
title: Which version am I running?
---

# Which version am I running?

VeeCode DevPortal has three lines. **The docs you're reading now are V2.** The
current line is 3.x, documented in the [DevPortal 3.x docs](/devportal/intro). If
your running install is still **V1**, switch to the V1 docs so the instructions
match what you actually deployed.

## Quick check

Look at any **one** of these on your running deployment:

| Signal | You're on **V1** | You're on **V2** | You're on **3.x** |
|---|---|---|---|
| Container image | two images: `veecode/devportal-base` + `veecode/devportal` (or `veecode/devportal:1.x`) | one image: `veecode/devportal:2.2.3` | one image: `veecode/devportal:3.x.y` |
| Enablement env var | `VEECODE_PROFILE=<github\|gitlab\|…>` | `VEECODE_PRESETS=<a,b,c>` | neither: default plugins ship in the image and are changed through chart values |
| Helm chart name | `veecode-devportal` (appVersion `1.x`) | `veecode-devportal-platform` (appVersion `2.1.3`) | `devportal` (appVersion `3.x.y`) |
| Plugin model | plugins baked into the distro image | plugins disabled by default, enabled by presets / OCI refs | default plugins enabled in the image, overridable per plugin; more from the marketplace |

```sh
# Docker
docker inspect <container> --format '{{.Config.Image}}'   # image tag
docker inspect <container> --format '{{.Config.Env}}' | tr ' ' '\n' | grep -E 'VEECODE_(PROFILE|PRESETS)'

# Kubernetes
kubectl get deploy -A -o jsonpath='{..image}' | tr ' ' '\n' | grep devportal
helm list -A | grep -E 'devportal'   # chart name and app version
```

## You're on V1

That's the prior split-image line — still supported with security backports,
but no longer the default. **[Go to the V1 documentation →](/devportal/v1/intro)**

When you're ready to move to the unified image, see
[Migrating from V1 to V2](./migrating-from-v1.md).

## You're on 3.x

Go to the [DevPortal 3.x docs](/devportal/intro). Moving a 2.x install to 3.x is
covered in [Migrating from 2.x to 3.x](/devportal/migrating-from-2x).

## You're on V2

You're in the right place — keep reading. The `veecode/devportal:2.2.3` image,
presets, and the `veecode-devportal-platform` Helm chart are documented here.

:::note
`veecode/devportal:latest` is the 2.x line. It keeps moving within 2.x and stays on 2.x until 2.x leaves support, and it never points at a 3.x image. Pin a version tag in every install you keep.
:::
