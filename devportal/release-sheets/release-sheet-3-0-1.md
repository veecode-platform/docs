---
sidebar_position: 2
sidebar_label: DevPortal 3.0.1
title: DevPortal 3.0.1 release sheet
---

# DevPortal 3.0.1 release sheet

Release date: 2026-10-05

## What changed

### New features and enhancements

- None.

### Breaking changes and upgrade notes

- None.

### Deprecated and removed features

- None.

### Fixed issues

- The backend moves `better-sqlite3` from 12.11.1 to 13.0.3. This fixes a startup crash when the image runs outside this chart with SQLite under Node.js 24.19.0. Chart installs use PostgreSQL and are not affected.
- Marketplace 0.3.1 fixes two regressions in the Marketplace card. After you confirm an install or removal, the card shows the matching pending status. The confirm click no longer opens the details drawer.

### Fixed security issues

- None.

## What goes together

Use these values together. Pin the image by its digest.

| Part | Value |
| --- | --- |
| Image | `docker.io/veecode/devportal:3.0.1@sha256:881f936ff4a38b31998d52cb6cd558d6b5e6fca9a3d99b08e80aba77913aaa38` |
| Image digest | `sha256:881f936ff4a38b31998d52cb6cd558d6b5e6fca9a3d99b08e80aba77913aaa38` |
| Chart | `devportal` 1.0.1 |
| Chart checksum (SHA-256) | `ad896aaf2361a74069e3bf90e55ffc22e275f4a2f9864a38e3e8dd316149c52c` |
| Backstage version | 1.52.0 |
| Plugin tag line | `bs_1.52.0` |
| Catalog index | `quay.io/veecode/plugin-catalog-index:bs_1.52.0`, qualified at `sha256:9952cad12b45c9487aba789b93a094080a0001bfa71b6b0d77ec588d955417ee` |
| Catalog index tag for pinning | `quay.io/veecode/plugin-catalog-index:bs_1.52.0_20261005T164038` |
| Qualified on | Kubernetes `1.35.0`, PostgreSQL `16` (image `postgres:16`) |

`bs_1.52.0` names the Backstage version the plugin artifacts target. The catalog index tag moves when the catalog is republished. During an incident, pin the timestamped tag above.

### Backstage packages

| Package | Version |
| --- | --- |
| @backstage/backend-app-api | 1.7.1 |
| @backstage/backend-defaults | 0.17.3 |
| @backstage/backend-dev-utils | 0.1.7 |
| @backstage/backend-dynamic-feature-service | 0.8.3 |
| @backstage/backend-openapi-utils | 0.6.10 |
| @backstage/backend-plugin-api | 1.9.2 |
| @backstage/catalog-client | 1.16.0 |
| @backstage/catalog-model | 1.9.0 |
| @backstage/cli-common | 0.2.2 |
| @backstage/cli-node | 0.3.3 |
| @backstage/config | 1.3.8 |
| @backstage/config-loader | 1.10.12 |
| @backstage/connections | 0.1.0 |
| @backstage/errors | 1.3.1 |
| @backstage/filter-predicates | 0.1.3 |
| @backstage/integration | 2.0.3 |
| @backstage/integration-aws-node | 0.1.21 |
| @backstage/plugin-app-backend | 0.5.15 |
| @backstage/plugin-app-node | 0.1.46 |
| @backstage/plugin-auth-backend | 0.29.1 |
| @backstage/plugin-auth-backend-module-atlassian-provider | 0.4.16 |
| @backstage/plugin-auth-backend-module-auth0-provider | 0.4.2 |
| @backstage/plugin-auth-backend-module-azure-easyauth-provider | 0.2.21 |
| @backstage/plugin-auth-backend-module-bitbucket-provider | 0.3.16 |
| @backstage/plugin-auth-backend-module-bitbucket-server-provider | 0.2.16 |
| @backstage/plugin-auth-backend-module-cloudflare-access-provider | 0.4.16 |
| @backstage/plugin-auth-backend-module-gcp-iap-provider | 0.4.16 |
| @backstage/plugin-auth-backend-module-github-provider | 0.5.4 |
| @backstage/plugin-auth-backend-module-gitlab-provider | 0.4.4 |
| @backstage/plugin-auth-backend-module-google-provider | 0.3.16 |
| @backstage/plugin-auth-backend-module-guest-provider | 0.2.20 |
| @backstage/plugin-auth-backend-module-microsoft-provider | 0.3.16 |
| @backstage/plugin-auth-backend-module-oauth2-proxy-provider | 0.3.0 |
| @backstage/plugin-auth-backend-module-oidc-provider | 0.4.17 |
| @backstage/plugin-auth-backend-module-okta-provider | 0.2.16 |
| @backstage/plugin-auth-backend-module-onelogin-provider | 0.3.16 |
| @backstage/plugin-auth-node | 0.7.2 |
| @backstage/plugin-catalog-backend | 3.8.0 |
| @backstage/plugin-catalog-backend-module-logs | 0.1.23 |
| @backstage/plugin-catalog-backend-module-openapi | 0.2.23 |
| @backstage/plugin-catalog-backend-module-scaffolder-entity-model | 0.2.21 |
| @backstage/plugin-catalog-common | 1.1.10 |
| @backstage/plugin-catalog-node | 2.2.2 |
| @backstage/plugin-events-backend | 0.6.3 |
| @backstage/plugin-events-backend-module-gitlab | 0.3.13 |
| @backstage/plugin-events-node | 0.4.23 |
| @backstage/plugin-permission-backend | 0.7.13 |
| @backstage/plugin-permission-common | 0.9.9 |
| @backstage/plugin-permission-node | 0.11.1 |
| @backstage/plugin-proxy-backend | 0.6.14 |
| @backstage/plugin-proxy-node | 0.1.16 |
| @backstage/plugin-scaffolder-backend | 4.0.1 |
| @backstage/plugin-scaffolder-common | 2.2.1 |
| @backstage/plugin-scaffolder-node | 0.13.4 |
| @backstage/plugin-search-backend | 2.1.3 |
| @backstage/plugin-search-backend-module-catalog | 0.3.16 |
| @backstage/plugin-search-backend-module-pg | 0.5.56 |
| @backstage/plugin-search-backend-node | 1.4.5 |
| @backstage/plugin-search-common | 1.2.24 |
| @backstage/plugin-signals-node | 0.2.2 |
| @backstage/plugin-user-settings-backend | 0.4.4 |
| @backstage/plugin-user-settings-common | 0.1.0 |
| @backstage/types | 1.2.2 |

## Vulnerability report

- Image scanned: `docker.io/veecode/devportal@sha256:881f936ff4a38b31998d52cb6cd558d6b5e6fca9a3d99b08e80aba77913aaa38`
- Scanner: Trivy `0.74.0`, database dated `2026-10-05`.
- Critical vulnerabilities with a fix and no live exception: `0`.
- Qualification run: `https://github.com/veecode-platform/devportal-chart/actions/runs/37378674819`.

| Severity | Reported | With a fix | Accepted as an exception |
| --- | ---: | ---: | ---: |
| CRITICAL | 0 | 0 | 0 |
| HIGH | 62 | 14 | 15 |
| MEDIUM | 460 | 129 | 0 |
| LOW | 145 | 16 | 0 |
| UNKNOWN | 0 | 0 | 0 |

A release does not ship with a critical vulnerability that has a fix and no live exception.

### Exceptions

| ID | Package | Severity | Reason | Expires |
| --- | --- | --- | --- | --- |
| `CVE-2026-82659` | `nodemailer` 8.0.11 | HIGH | The fix requires a major update to 9.0.1. | 2026-12-30 |
| `GHSA-2x7j-588g-ccc2` | `nodemailer` 8.0.11 | HIGH | The fix requires a major update to 9.1.0. | 2026-12-30 |
| `GHSA-v53p-9fqp-m79j` | `nodemailer` 8.0.11 | HIGH | The fix requires a major update to 10.0.6. | 2026-12-30 |
| `CVE-2026-67422` | `pymdown-extensions` 10.19.1 | HIGH | The fix requires a major update to 11.0.1. | 2026-12-30 |
| `CVE-2026-12151` | `undici` 5.29.0 | HIGH | Fixes require a major update to 6.27.0, 7.28.0, or 8.5.0. | 2026-12-30 |
| `CVE-2026-1526` | `undici` 5.29.0 | HIGH | Fixes require a major update to 6.24.0 or 7.24.0. | 2026-12-30 |
| `CVE-2026-2229` | `undici` 5.29.0 | HIGH | Fixes require a major update to 6.24.0 or 7.24.0. | 2026-12-30 |
| `CVE-2026-55553` | `urllib` 3.27.3 | HIGH | The 4.9.1 fix is a major update; 2.44.1 would downgrade the installed version. | 2026-12-30 |
| `CVE-2025-66418` | `urllib3` 2.2.2 | HIGH | The requirements inputs pin 2.2.2, preventing pip-tools from compiling 2.6.0. Build-tool pins may also need raising; this was not tested. | 2026-12-30 |
| `CVE-2025-66471` | `urllib3` 2.2.2 | HIGH | The requirements inputs pin 2.2.2, preventing pip-tools from compiling 2.6.0. Build-tool pins may also need raising; this was not tested. | 2026-12-30 |
| `CVE-2026-21441` | `urllib3` 2.2.2 | HIGH | The requirements inputs pin 2.2.2, preventing pip-tools from compiling 2.6.3. Build-tool pins may also need raising; this was not tested. | 2026-12-30 |
| `CVE-2026-44431` | `urllib3` 2.2.2 | HIGH | The requirements inputs pin 2.2.2, preventing pip-tools from compiling 2.7.0. Build-tool pins may also need raising; this was not tested. | 2026-12-30 |
| `CVE-2026-97687` | `urllib3` 2.2.2 | HIGH | The requirements inputs pin 2.2.2, preventing pip-tools from compiling 2.8.0. Build-tool pins may also need raising; this was not tested. | 2026-12-30 |
| `CVE-2026-97689` | `urllib3` 2.2.2 | HIGH | The requirements inputs pin 2.2.2, preventing pip-tools from compiling 2.8.0. Build-tool pins may also need raising; this was not tested. | 2026-12-30 |

An exception expires on the date shown. After that date, the finding counts again and blocks a release.

### Plugins enabled by default

The table contains one row for each OCI artifact enabled by default, including the Marketplace card. These artifact scans are reports and do not block the image release.

| Artifact | Digest | Packages | Critical | High | Medium | Low | Unknown | Critical with a fix | Result |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `quay.io/veecode/backstage-community-plugin-rbac` | `36e9f606223d` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/backstage-community-plugin-tech-radar-backend` | `71f7f6c48161` | 78 | 0 | 1 | 2 | 2 | 0 | 0 | scanned |
| `quay.io/veecode/backstage-community-plugin-tech-radar` | `2a5e149c22bd` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/backstage-plugin-notifications-backend` | `b089cdda6380` | 109 | 0 | 0 | 2 | 1 | 0 | 0 | scanned |
| `quay.io/veecode/backstage-plugin-notifications` | `bb3c3f0739f8` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/backstage-plugin-signals-backend` | `3767a18cdb45` | 83 | 0 | 1 | 2 | 1 | 0 | 0 | scanned |
| `quay.io/veecode/backstage-plugin-signals` | `8764b50b78b6` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/backstage-plugin-techdocs-backend` | `a52ab2f01ccf` | 427 | 0 | 25 | 28 | 2 | 0 | 0 | scanned |
| `quay.io/veecode/backstage-plugin-techdocs-module-addons-contrib` | `9feeac06c77e` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/backstage-plugin-techdocs` | `d8222a85e6a4` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/devportal-marketplace-backend` | `153527c7d510` | 78 | 0 | 0 | 3 | 1 | 0 | 0 | scanned |
| `quay.io/veecode/devportal-marketplace-frontend-dynamic` | `2d3ffc77eac7` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/devportal-pending-changes-dynamic` | `18d75d59e287` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/red-hat-developer-hub-backstage-plugin-catalog-backend-module-extensions` | `9fad03e713fe` | 15 | 0 | 11 | 3 | 1 | 0 | 0 | scanned |
| `quay.io/veecode/red-hat-developer-hub-backstage-plugin-global-header` | `2a622b6a8c30` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/veecode-platform-backstage-plugin-about-backend` | `99ca46df8ebd` | 10 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/veecode-platform-backstage-plugin-about` | `5746126ea012` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |
| `quay.io/veecode/veecode-platform-plugin-veecode-homepage` | `897d9ae74de4` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | scanned |

## Known limitations

- A vulnerability database update on 2026-10-06 reports 14 critical findings with a fix in the 3.0.1 image, in `proxy-addr` 2.0.7 and `vm2` 3.11.7. Upgrade to 3.0.2 (use chart 1.0.2 for Helm installs), which fixes them.

The 3.0.0 release sheet also lists the following limitations. The 3.0.1 changes do not address them.

- The default plugins ship the Red Hat dynamic Home page entry disabled. Enabling it (for example from its Marketplace card) leaves the portal's pages empty, because it registers the same frontend API as the DevPortal home page. Keep it disabled.
- An offline install must mirror the catalog index as well as the OCI plugin artifacts. In beta.10 tests, the installer fetched the index before loading cached plugin artifacts and stopped when Quay was unreachable.
- In beta.10 measurements, median readiness took 67.237 seconds with an empty plugin volume and 19.514 seconds with a populated volume. These are beta.10 measurements, not measurements of the final 3.0.1 candidate.
