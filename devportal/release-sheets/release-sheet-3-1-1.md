---
sidebar_position: 6
sidebar_label: DevPortal 3.1.1
title: DevPortal 3.1.1 release sheet
---

# DevPortal 3.1.1 release sheet

Release date: 2026-10-21

## What changed

### New features and enhancements

- None.

### Breaking changes and upgrade notes

- **Chart upgrades.** Do not move to chart 1.1.2 with `helm upgrade --reuse-values`. It reuses the values of the previous release, so the 3.1.0 image and the previous catalog index stay in place. Pass explicit values, or use `--reset-then-reuse-values` (Helm 3.14 or later). The steps are on the [upgrade page](../installation-guide/production-setup/upgrade.md#upgrade-to-chart-112).
- From 3.0.x, the upgrade notes of the [3.1.0 release sheet](./release-sheet-3-1-0.md#breaking-changes-and-upgrade-notes) also apply.

### Deprecated and removed features

- None.

### Fixed issues

- Chart 1.1.2 moves the catalog index to `bs_1.54.9_20261021T175344`, which enables VeeCode homepage 1.0.4. Homepage 1.0.3 spaced the Home page cards with MUI Grid spacing. When another dynamic plugin set the `v5-` class name prefix on the MUI copy that the portal shares, the spacing did not apply, and the cards moved under the header and past the left edge of the page. Homepage 1.0.4 lays out the cards with CSS grid, which does not depend on MUI class names.

### Fixed security issues

- GHSA-6q48-6c7w-9gw2, critical, in `certifi`, which the image's TechDocs Python environment uses. `certifi` bundled emSign root certificates whose intermediate CA keys were compromised. `certifi` moves from 2024.7.4 to 2026.10.19. The advisory has no CVE ID and was published on 2026-10-20, after 3.1.0 shipped. The 3.0.x images include the same `certifi` version.

3.1.1 changes only `certifi` against 3.1.0.

## What goes together

Use these values together. Pin the image by its digest.

| Part | Value |
| --- | --- |
| Image | `docker.io/veecode/devportal:3.1.1@sha256:726cc70543dd5a122e4ffcbc7fe9734f9b25366e39b775cd4a86e9c68f7c6f26` |
| Image digest | `sha256:726cc70543dd5a122e4ffcbc7fe9734f9b25366e39b775cd4a86e9c68f7c6f26` |
| Chart | `devportal` 1.1.2 |
| Chart checksum (SHA-256) | `980a4be76ef523df660f613ee7248c2a799422fe5dfdfce422184d735f25e1fd` |
| Backstage version | 1.54.9 |
| Plugin tag line | `bs_1.54.9` |
| Catalog index | `quay.io/veecode/plugin-catalog-index:bs_1.54.9`, qualified at `sha256:6b30147c2146dda4bc8f607c04cc37135c02e41cc297a3bfcb4af78ef702aefa` |
| Catalog index tag for pinning | `quay.io/veecode/plugin-catalog-index:bs_1.54.9_20261021T175344` |
| Qualified on | Kubernetes 1.35.0, PostgreSQL 16 (image `postgres:16`) |

`bs_1.54.9` is the tag under which the plugins and the catalog index are published, and it names the Backstage version they are built for. The catalog index tag moves when the catalog is republished. The chart pins the catalog index by digest, so an installation keeps the same index until you move to a new chart version. To pin this index by its timestamped tag instead of its digest, set `global.catalogIndex.image.repository` to `veecode/plugin-catalog-index` and `global.catalogIndex.image.tag` to `bs_1.54.9_20261021T175344`. This index differs from the index of chart 1.1.1 only in VeeCode homepage 1.0.4.

### Backstage packages

The table lists the Backstage packages that the portal's backend declares directly, at the versions of the image's source commit. It does not list the packages that come in through other packages. The versions are the same as in 3.1.0.

| Package | Version |
| --- | --- |
| `@backstage/backend-app-api` | 1.7.3 |
| `@backstage/backend-defaults` | 0.17.8 |
| `@backstage/backend-dynamic-feature-service` | 0.8.6 |
| `@backstage/backend-plugin-api` | 1.10.0 |
| `@backstage/catalog-client` | 1.16.1 |
| `@backstage/catalog-model` | 1.10.0 |
| `@backstage/cli-node` | 0.3.4 |
| `@backstage/config` | 1.3.8 |
| `@backstage/plugin-app-backend` | 0.5.17 |
| `@backstage/plugin-auth-backend` | 0.30.0 |
| `@backstage/plugin-auth-backend-module-atlassian-provider` | 0.4.18 |
| `@backstage/plugin-auth-backend-module-auth0-provider` | 0.4.4 |
| `@backstage/plugin-auth-backend-module-azure-easyauth-provider` | 0.2.23 |
| `@backstage/plugin-auth-backend-module-bitbucket-provider` | 0.3.18 |
| `@backstage/plugin-auth-backend-module-bitbucket-server-provider` | 0.2.18 |
| `@backstage/plugin-auth-backend-module-cloudflare-access-provider` | 0.4.18 |
| `@backstage/plugin-auth-backend-module-gcp-iap-provider` | 0.4.18 |
| `@backstage/plugin-auth-backend-module-github-provider` | 0.5.6 |
| `@backstage/plugin-auth-backend-module-gitlab-provider` | 0.4.6 |
| `@backstage/plugin-auth-backend-module-google-provider` | 0.3.18 |
| `@backstage/plugin-auth-backend-module-guest-provider` | 0.2.22 |
| `@backstage/plugin-auth-backend-module-microsoft-provider` | 0.3.18 |
| `@backstage/plugin-auth-backend-module-oauth2-proxy-provider` | 0.3.2 |
| `@backstage/plugin-auth-backend-module-oidc-provider` | 0.4.20 |
| `@backstage/plugin-auth-backend-module-okta-provider` | 0.2.18 |
| `@backstage/plugin-auth-backend-module-onelogin-provider` | 0.3.18 |
| `@backstage/plugin-auth-node` | 0.7.5 |
| `@backstage/plugin-catalog-backend` | 3.9.1 |
| `@backstage/plugin-catalog-backend-module-logs` | 0.1.25 |
| `@backstage/plugin-catalog-backend-module-openapi` | 0.2.25 |
| `@backstage/plugin-catalog-backend-module-scaffolder-entity-model` | 0.2.23 |
| `@backstage/plugin-events-backend` | 0.6.5 |
| `@backstage/plugin-events-backend-module-gitlab` | 0.3.15 |
| `@backstage/plugin-events-node` | 0.4.25 |
| `@backstage/plugin-permission-backend` | 0.7.15 |
| `@backstage/plugin-proxy-backend` | 0.6.17 |
| `@backstage/plugin-scaffolder-backend` | 4.1.0 |
| `@backstage/plugin-search-backend` | 2.1.6 |
| `@backstage/plugin-search-backend-module-catalog` | 0.3.18 |
| `@backstage/plugin-search-backend-module-pg` | 0.5.58 |
| `@backstage/plugin-user-settings-backend` | 0.4.6 |

### Default plugin versions

The catalog index enables these 18 plugins. Protected plugins cannot be disabled from the Marketplace. The other plugins can be disabled from it. Against chart 1.1.1, only VeeCode homepage moves, from 1.0.3 to 1.0.4.

| Artifact | Version | Protected |
| --- | --- | --- |
| `quay.io/veecode/veecode-platform-plugin-veecode-homepage` | 1.0.4 | no |
| `quay.io/veecode/red-hat-developer-hub-backstage-plugin-global-header` | 3.1.0 | no |
| `quay.io/veecode/backstage-community-plugin-rbac` | 2.3.1 | no |
| `quay.io/veecode/veecode-platform-backstage-plugin-about` | 1.2.1 | no |
| `quay.io/veecode/veecode-platform-backstage-plugin-about-backend` | 1.2.0 | no |
| `quay.io/veecode/red-hat-developer-hub-backstage-plugin-catalog-backend-module-extensions` | 0.18.0 | yes |
| `quay.io/veecode/devportal-marketplace-backend` | 0.3.1 | yes |
| `quay.io/veecode/devportal-pending-changes-dynamic` | 0.3.0 | yes |
| `quay.io/veecode/devportal-marketplace-frontend-dynamic` | 0.3.2 | yes |
| `quay.io/veecode/backstage-plugin-techdocs` | 1.18.0 | no |
| `quay.io/veecode/backstage-plugin-techdocs-backend` | 2.2.5 | no |
| `quay.io/veecode/backstage-plugin-techdocs-module-addons-contrib` | 1.1.39 | no |
| `quay.io/veecode/backstage-plugin-notifications` | 0.5.20 | no |
| `quay.io/veecode/backstage-plugin-signals` | 0.0.34 | no |
| `quay.io/veecode/backstage-plugin-notifications-backend` | 0.6.8 | no |
| `quay.io/veecode/backstage-plugin-signals-backend` | 0.3.18 | no |
| `quay.io/veecode/backstage-community-plugin-tech-radar` | 1.22.0 | no |
| `quay.io/veecode/backstage-community-plugin-tech-radar-backend` | 1.21.0 | no |

## Vulnerability report

- Image scanned: `docker.io/veecode/devportal@sha256:726cc70543dd5a122e4ffcbc7fe9734f9b25366e39b775cd4a86e9c68f7c6f26`
- Scanner: Trivy `0.74.0`, database dated `2026-10-21`.
- Critical vulnerabilities with a fix and no live exception: `0`.
- Qualification run: `https://github.com/veecode-platform/devportal-chart/actions/runs/39664942005`.
- Chart 1.1.2: the qualification of the published package (`devportal-1.1.2.tgz`, SHA-256 `980a4be7…`), `https://github.com/veecode-platform/devportal-chart/actions/runs/39673522641`, installed the same image and catalog index with the same database. It found the same counts as the table below.

| Severity | Reported | With a fix | Accepted as an exception |
| --- | ---: | ---: | ---: |
| CRITICAL | 0 | 0 | 0 |
| HIGH | 12 | 10 | 12 |
| MEDIUM | 51 | 51 | 0 |
| LOW | 8 | 8 | 0 |
| UNKNOWN | 0 | 0 | 0 |

`Reported` counts the findings that no exception covers. `Accepted as an exception` counts the findings that an exception covers.

A release does not ship with a critical vulnerability that has a fix and no live exception.

### Exceptions

| ID | Package | Severity | Reason | Expires |
| --- | --- | --- | --- | --- |
| `CVE-2026-67422` | `pymdown-extensions` | HIGH | The fix is a major update to 11.0.1. | 2026-12-30 |
| `CVE-2026-12151` | `undici` | HIGH | The fixes are major updates to 6.27.0, 7.28.0 or 8.5.0. | 2026-12-30 |
| `CVE-2026-1526` | `undici` | HIGH | The fixes are major updates to 6.24.0 or 7.24.0. | 2026-12-30 |
| `CVE-2026-2229` | `undici` | HIGH | The fixes are major updates to 6.24.0 or 7.24.0. | 2026-12-30 |
| `CVE-2026-55553` | `urllib` | HIGH | The 4.9.1 fix is a major update, and the 2.44.1 fix would downgrade the installed version. This exception covers two findings. | 2026-12-30 |
| `CVE-2025-66418` | `urllib3` | HIGH | `python/requirements.in` and `python/requirements-build.in` pin urllib3 2.2.2, so pip-tools cannot compile the fix. The hatchling and setuptools-scm build-tool pins may also need raising; this was not tested. | 2026-12-30 |
| `CVE-2025-66471` | `urllib3` | HIGH | `python/requirements.in` and `python/requirements-build.in` pin urllib3 2.2.2, so pip-tools cannot compile the fix. The hatchling and setuptools-scm build-tool pins may also need raising; this was not tested. | 2026-12-30 |
| `CVE-2026-21441` | `urllib3` | HIGH | `python/requirements.in` and `python/requirements-build.in` pin urllib3 2.2.2, so pip-tools cannot compile the fix. The hatchling and setuptools-scm build-tool pins may also need raising; this was not tested. | 2026-12-30 |
| `CVE-2026-44431` | `urllib3` | HIGH | `python/requirements.in` and `python/requirements-build.in` pin urllib3 2.2.2, so pip-tools cannot compile the fix. The hatchling and setuptools-scm build-tool pins may also need raising; this was not tested. | 2026-12-30 |
| `CVE-2026-97687` | `urllib3` | HIGH | `python/requirements.in` and `python/requirements-build.in` pin urllib3 2.2.2, so pip-tools cannot compile the fix. The hatchling and setuptools-scm build-tool pins may also need raising; this was not tested. | 2026-12-30 |
| `CVE-2026-97689` | `urllib3` | HIGH | `python/requirements.in` and `python/requirements-build.in` pin urllib3 2.2.2, so pip-tools cannot compile the fix. The hatchling and setuptools-scm build-tool pins may also need raising; this was not tested. | 2026-12-30 |

An exception expires on the date shown. After that date the finding counts again and blocks a release.

### Plugins enabled by default

The plugins enabled by default are separate artifacts. Each one is scanned by digest. This scan is a report and does not block a release.

| Artifact | Digest | Packages | Critical | High | Medium | Low | Unknown | Critical with a fix | Result |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `quay.io/veecode/backstage-community-plugin-rbac` | `36cc13d76a4a` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/backstage-community-plugin-tech-radar-backend` | `c727ce2f8f76` | 78 | 0 | 1 | 2 | 2 | 0 | 0 | scanned |
| `quay.io/veecode/backstage-community-plugin-tech-radar` | `32bbb5403933` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/backstage-plugin-notifications-backend` | `d48f3ff2f2d4` | 109 | 0 | 0 | 2 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/backstage-plugin-notifications` | `1919932ddf6a` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/backstage-plugin-signals-backend` | `fba0c367d0fa` | 83 | 0 | 1 | 2 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/backstage-plugin-signals` | `5386b0ef4af6` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/backstage-plugin-techdocs-backend` | `17238af383db` | 426 | 0 | 16 | 12 | 1 | 0 | 0 | scanned |
| `quay.io/veecode/backstage-plugin-techdocs-module-addons-contrib` | `9a0a16aa6248` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/backstage-plugin-techdocs` | `6cd5aa0c2727` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/devportal-marketplace-backend` | `7948f276b640` | 78 | 0 | 0 | 3 | 1 | 0 | 0 | scanned |
| `quay.io/veecode/devportal-marketplace-frontend-dynamic` | `aa9e50d1b282` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/devportal-pending-changes-dynamic` | `6891aa72fa56` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/red-hat-developer-hub-backstage-plugin-catalog-backend-module-extensions` | `1913ab2bf352` | 15 | 0 | 11 | 3 | 1 | 0 | 0 | scanned |
| `quay.io/veecode/red-hat-developer-hub-backstage-plugin-global-header` | `2ef719107446` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/veecode-platform-backstage-plugin-about-backend` | `3b3a20e3d947` | 10 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/veecode-platform-backstage-plugin-about` | `799787003768` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/veecode-platform-plugin-veecode-homepage` | `5d3d244e9ad3` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |

## Known limitations

The 3.1.0 release sheet also lists the following limitations. The 3.1.1 changes do not address them, and they were not re-tested on 3.1.1.

- After an upgrade, the Marketplace can list the packages of the previous catalog index for up to 30 minutes. A package installed from the Marketplace during that window keeps the previous artifact until you reinstall it, and a former `./dynamic-plugins/dist/` entry is skipped. Wait until the Marketplace shows the 3.1 versions before you install plugins.
- The default plugins ship the Red Hat dynamic Home page entry disabled. Enabling it leaves the portal's pages empty. Keep it disabled.
- An offline install must mirror the catalog index as well as the plugin artifacts.
- RBAC backend 8.1.4 adds no database migration. An upgrade from a database written by RBAC backend 7.12.5 was not tested.
