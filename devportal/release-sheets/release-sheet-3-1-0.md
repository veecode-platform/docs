---
sidebar_position: 5
sidebar_label: DevPortal 3.1.0
title: DevPortal 3.1.0 release sheet
---

# DevPortal 3.1.0 release sheet

Release date: 2026-10-15

## What changed

### New features and enhancements

- Backstage 1.54.9 replaces Backstage 1.52. The portal keeps the frontend system it uses in 3.0.x.
- The 18 plugins enabled by default now come from the plugin catalog index instead of the image. A plugin update is published as a new index, so it does not need a new image. The versions are in [Default plugin versions](#default-plugin-versions).
- Marketplace backend 0.3.1 and Marketplace frontend 0.3.2 are enabled by default.
- The image is built on Red Hat UBI 10.2.

### Breaking changes and upgrade notes

Check these before you upgrade. The full upgrade steps are on the [upgrade page](../installation-guide/production-setup/upgrade.md).

- **Values file includes.** If `global.dynamic.includes` still lists `/opt/app-root/src/dynamic-plugins.veecode.yaml`, remove that entry and keep `dynamic-plugins.default.yaml`. The 3.1 image has no such file. The installer skips it with a warning.
- **Chart upgrades.** Do not move to chart 1.1.0 with `helm upgrade --reuse-values`. It reuses the values of the previous release, so the 3.0.3 image and the old catalog index stay in place. Pass explicit values, or use `--reset-then-reuse-values` (Helm 3.14 or later).
- **Former local plugin paths.** Search `global.dynamic.plugins` and any mounted `dynamic-plugins.yaml` for `./dynamic-plugins/dist/`. Replace each entry with the plugin's `oci://` reference, or remove it. The installer skips these paths and still exits 0, so the plugin is missing without an error.
- **Marketplace selections.** The upgrade does not convert the rows in `marketplace_installations` whose `package_name` starts with `./dynamic-plugins/dist/`. After the upgrade, wait until the Marketplace lists the 3.1 version of each of these plugins, then reinstall it from the Marketplace with its saved YAML, and disable the new selection if the old row had `disabled` set to true. Before that, a reinstall stores the old path again. The Marketplace does not remove the old row. Once the new selection is in place (the plugin loads, or it shows as disabled when the old row was disabled), delete the old one from the `marketplace_installations` table in the Marketplace plugin's database, `backstage_plugin_extensions` with the default `backend.database.prefix`. When `pluginDivisionMode` is `schema`, the table is in a schema of the portal's database: find it with `SELECT table_schema FROM information_schema.tables WHERE table_name = 'marketplace_installations';` and qualify the table with it. `DELETE FROM marketplace_installations WHERE package_name = './dynamic-plugins/dist/<plugin>';`. If the two rows hold different `pluginConfig`, the install init container stops with `defined differently for 2 dynamic plugins`, so give the new row the saved YAML.
- **RBAC pair.** RBAC backend 8.1.4 is in the image, and RBAC frontend 2.3.1 comes from the catalog index. They move together. If you pin the RBAC frontend in `global.dynamic.plugins` to an older version, remove the pin or use 2.3.1. Backend 8 refuses the conditional-policy writes of frontend 1.52.4, and frontend 2.3.1 writes conditions that backend 7.12.5 refuses.
- **Plugins that moved to a new major version.** Several plugins in the catalog index moved to a new major version, for example Argo CD 3.1.3, Tekton 4.0.5 and bulk import 9.1.1. None of these three is enabled by default. Of the 18 plugins enabled by default, two moved to a new major version: the global header to 3.1.0 and the RBAC frontend to 2.3.1. If you override `pluginConfig` for a plugin that moved, compare your override with the default of the new version.
- **Azure DevOps.** If you enable the plugin, the backend requires `azureDevOps.pullRequestDashboard.organizations`, a list of entries with `organization` and `host`. Add it before the upgrade.
- **Bulk import.** If you enable bulk import, bulk import backend 9.x requires short-lived GitHub App installation tokens for the Orchestrator import mode. It refuses a classic personal access token in that mode.
- **Derived images.** If your image or an init script is built on the DevPortal image and uses UBI 9 packages or paths, check them against UBI 10.

### Deprecated and removed features

- The image no longer has the `dynamic-plugins/` directory. The catalog index has an OCI artifact for 40 of the 41 plugins that 3.0.x shipped in it. 12 of those 40 are enabled by default, and the other 28 are disabled by default. The catalog index has no entry for `red-hat-developer-hub-backstage-plugin-extensions-backend`.
- The image no longer has `dynamic-plugins.veecode.yaml`. It has `factory-plugins.yaml`, a list of the names of the plugins enabled by default. The plugin definitions come from the catalog index.

### Fixed issues

- The Marketplace saves the YAML typed on a plugin's install or edit page. Before, the portal stored the configuration already saved or the package's first example. An entry that comes without `pluginConfig` still gets the package's first example.
- The Marketplace refuses YAML with a syntax error when you install a plugin or save its configuration. The install page shows the line and column of the first error.

### Fixed security issues

- CVE-2026-106501 (GHSA-g2v8-7jhw-pp8p), critical, in `@backstage/plugin-scaffolder-backend`. 3.0.3 ships 4.0.1, which is affected. 3.1.0 ships 4.1.0, which fixes it. The advisory was published on 2026-10-07.
- CVE-2026-88932 (GHSA-3pph-fpjx-jg34), medium, in `multer`. Aborted uploads could leave orphaned disk writes, which allowed denial of service. `multer` moves from 2.3.0 to 2.4.0.

## What goes together

Use these values together. Pin the image by its digest.

| Part | Value |
| --- | --- |
| Image | `docker.io/veecode/devportal:3.1.0@sha256:fe33373b7e5dc536f04d1878519bb53862a769b46869f78f829b198a30e5246b` |
| Image digest | `sha256:fe33373b7e5dc536f04d1878519bb53862a769b46869f78f829b198a30e5246b` |
| Chart | `devportal` 1.1.0 |
| Chart checksum (SHA-256) | `061ab853c41cf05d5cc537d5c7c331290c6dd9c46cc756a6e6546a7acdc06a3e` |
| Backstage version | 1.54.9 |
| Plugin tag line | `bs_1.54.9` |
| Catalog index | `quay.io/veecode/plugin-catalog-index:bs_1.54.9`, qualified at `sha256:26bd062a8fad8c204b1a175e775a4549d599a2a57acd849f083d6591ed2a917d` |
| Catalog index tag for pinning | `quay.io/veecode/plugin-catalog-index:bs_1.54.9_20261015T183630` |
| Qualified on | Kubernetes 1.35.0, PostgreSQL 16 (image `postgres:16`) |

`bs_1.54.9` is the tag under which the plugins and the catalog index are published, and it names the Backstage version they are built for. The catalog index tag moves when the catalog is republished. The chart pins the catalog index by digest, so an installation keeps the same index until you move to a new chart version. To pin this index by its timestamped tag instead of its digest, set `global.catalogIndex.image.repository` to `veecode/plugin-catalog-index` and `global.catalogIndex.image.tag` to `bs_1.54.9_20261015T183630`.

### Backstage packages

The table lists the Backstage packages that the portal's backend declares directly, at the versions of the image's source commit. It does not list the packages that come in through other packages.

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

The catalog index enables these 18 plugins. Protected plugins cannot be disabled from the Marketplace. The other plugins can be disabled from it.

| Artifact | Version | Protected |
| --- | --- | --- |
| `quay.io/veecode/veecode-platform-plugin-veecode-homepage` | 1.0.3 | no |
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

- Image scanned: `docker.io/veecode/devportal@sha256:fe33373b7e5dc536f04d1878519bb53862a769b46869f78f829b198a30e5246b`
- Scanner: Trivy `0.74.0`, database dated `2026-10-15`.
- Critical vulnerabilities with a fix and no live exception: `0`.
- Qualification run: `https://github.com/veecode-platform/devportal-chart/actions/runs/38808478011`.

| Severity | Reported | With a fix | Accepted as an exception |
| --- | ---: | ---: | ---: |
| CRITICAL | 0 | 0 | 0 |
| HIGH | 8 | 6 | 12 |
| MEDIUM | 50 | 50 | 0 |
| LOW | 7 | 7 | 0 |
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
| `quay.io/veecode/backstage-plugin-techdocs-backend` | `17238af383db` | 426 | 0 | 14 | 12 | 1 | 0 | 0 | scanned |
| `quay.io/veecode/backstage-plugin-techdocs-module-addons-contrib` | `9a0a16aa6248` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/backstage-plugin-techdocs` | `6cd5aa0c2727` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/devportal-marketplace-backend` | `7948f276b640` | 78 | 0 | 0 | 3 | 1 | 0 | 0 | scanned |
| `quay.io/veecode/devportal-marketplace-frontend-dynamic` | `aa9e50d1b282` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/devportal-pending-changes-dynamic` | `6891aa72fa56` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/red-hat-developer-hub-backstage-plugin-catalog-backend-module-extensions` | `1913ab2bf352` | 15 | 0 | 11 | 3 | 1 | 0 | 0 | scanned |
| `quay.io/veecode/red-hat-developer-hub-backstage-plugin-global-header` | `2ef719107446` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/veecode-platform-backstage-plugin-about-backend` | `3b3a20e3d947` | 10 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/veecode-platform-backstage-plugin-about` | `799787003768` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/veecode-platform-plugin-veecode-homepage` | `fe312abc6c23` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |

## Known limitations

The Home page and offline install limitations carry over from 3.0.x. The RBAC limitation is specific to 3.1.0. The Marketplace window was first observed in the upgrade to chart 1.1.0, and it was not checked on 3.0.x.

- After an upgrade, the Marketplace can list the packages of the previous catalog index for up to 30 minutes. A package installed from the Marketplace during that window keeps the previous artifact until you reinstall it, and a former `./dynamic-plugins/dist/` entry is skipped. Wait until the Marketplace shows the 3.1 versions before you install plugins.
- The default plugins ship the Red Hat dynamic Home page entry disabled. Enabling it leaves the portal's pages empty. Keep it disabled. This was not re-tested on 3.1.0.
- An offline install must mirror the catalog index as well as the plugin artifacts. This was not re-tested on 3.1.0.
- RBAC backend 8.1.4 adds no database migration. An upgrade from a database written by RBAC backend 7.12.5 was not tested.
