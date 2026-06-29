---
sidebar_position: 2
sidebar_label: Which version am I running?
title: Which version am I running?
---

# Which version am I running?

VeeCode DevPortal has two lines. **The docs you're reading now are V2**, the
current default. If your running install is still **V1**, switch to the V1
docs so the instructions match what you actually deployed.

## Quick check

Look at any **one** of these on your running deployment:

| Signal | You're on **V1** | You're on **V2** |
|---|---|---|
| Container image | two images: `veecode/devportal-base` + `veecode/devportal` (or `veecode/devportal:1.x` / `:latest`) | one image: `veecode/devportal:2.1.3` |
| Enablement env var | `VEECODE_PROFILE=<github\|gitlab\|…>` | `VEECODE_PRESETS=<a,b,c>` |
| Helm chart name | `veecode-devportal` (appVersion `1.x`) | `veecode-devportal-platform` (appVersion `2.1.3`) |
| Plugin model | plugins baked into the distro image | plugins disabled by default, enabled by presets / OCI refs |

```sh
# Docker
docker inspect <container> --format '{{.Config.Image}}'   # image tag
docker inspect <container> --format '{{.Config.Env}}' | tr ' ' '\n' | grep -E 'VEECODE_(PROFILE|PRESETS)'

# Kubernetes
kubectl get deploy -A -o jsonpath='{..image}' | tr ' ' '\n' | grep devportal
helm list -A | grep -E 'veecode-devportal'
```

## You're on V1

That's the prior split-image line — still supported with security backports,
but no longer the default. **[Go to the V1 documentation →](/devportal/v1/intro)**

When you're ready to move to the unified image, see
[Migrating from V1 to V2](./migrating-from-v1.md).

## You're on V2

You're in the right place — keep reading. V2 is the current default: the
`veecode/devportal:2.1.3` image, presets, and the `veecode-devportal-platform`
Helm chart are documented here.
