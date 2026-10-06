---
sidebar_position: 4
sidebar_label: Support
title: Support and versions
---

This page says which DevPortal versions receive fixes, how versions are numbered, and which Kubernetes and PostgreSQL versions we test.

## Which versions receive fixes

| Line | Fixes | Until |
| --- | --- | --- |
| The latest 3.x release | All fixes | A newer 3.x release replaces it |
| Earlier 3.x releases | None. Update to the latest 3.x release. | |
| 2.x | Critical fixes only | The 2.x end date will be announced |

Only the latest 3.x release receives fixes. A fix ships as a new 3.x release, so you get it by updating to that release. The [release sheet](./release-sheets/release-sheets.md) of each release says what changed in it.

2.x receives critical fixes only. Other fixes are made in 3.x.

`veecode/devportal:latest` is the 2.x line and stays so until 2.x leaves support. It never points at a 3.x image. Pin the version you install.

## How versions are numbered

The DevPortal image and the Helm chart have separate version numbers.

- **Image.** `veecode/devportal:MAJOR.MINOR.PATCH`, for example `2.2.3`. The first number names the line: 2.x or 3.x. `veecode/devportal:edge` follows development and is not for production.
- **Pre-releases.** A version with a suffix, such as `3.0.0-rc.2` (a release candidate) or `3.0.0-beta.10`, is published for testing before the release it announces. It is not the version to install: the current stable release is `3.0.3`. Do not run a pre-release in production.
- **Chart.** The `devportal` chart has its own version. Each chart version pins one image by digest, and the release sheet lists the pair.
- **Backstage.** The release sheet states the Backstage version the release is built on.

## What we test

The qualification of a release installs it on a disposable cluster and runs these versions:

| Component | Version | How |
| --- | --- | --- |
| Kubernetes | 1.35 | A KinD cluster with the node image `kindest/node:v1.35.0` |
| PostgreSQL | 16 | The `postgres:16` image, outside the portal |

The release sheet states the versions a release was qualified on. Other versions may work, but we do not test them. The chart refuses to install on Kubernetes older than 1.27. It ships no database, so you provide your own PostgreSQL.

## Report a problem

To report a bug or ask for help, see [Troubleshooting](../troubleshooting.md).

The layout of this page follows the life cycle page of Red Hat Developer Hub. No text is copied.
