---
sidebar_label: Release sheets
title: Release sheets
---

Every 3.x release has a release sheet. It says what changed, which versions of the image, chart, catalog index and plugins go together, what the vulnerability scan found, which findings are accepted for now and until when, and what is known not to work.

The release sheets are:

- [DevPortal 3.0.3 release sheet](./release-sheet-3-0-3.md)
- [DevPortal 3.0.2 release sheet](./release-sheet-3-0-2.md)
- [DevPortal 3.0.1 release sheet](./release-sheet-3-0-1.md)
- [DevPortal 3.0.0 release sheet](./release-sheet-3-0-0.md)

This page is the template that every release sheet follows. A field with nothing to report says `None`, so a reader can tell an empty field from a forgotten one.

## Template

````markdown
# DevPortal X.Y.Z release sheet

Release date: YYYY-MM-DD

## What changed

### New features and enhancements

- What is new, and what it means for an install.

### Breaking changes and upgrade notes

- What to do before updating from the previous release.

### Deprecated and removed features

- What is deprecated or removed, and what replaces it.

### Fixed issues

- What was broken, and how it behaves now.

### Fixed security issues

- CVE-YYYY-NNNNN, package, fixed in version.

## What goes together

Use these values together. Pin the image by its digest.

| Part | Value |
| --- | --- |
| Image | `docker.io/veecode/devportal:X.Y.Z` |
| Image digest | `sha256:DIGEST` |
| Chart | `devportal` A.B.C |
| Chart checksum (SHA-256) | `CHECKSUM` |
| Backstage version | `1.NN.N` |
| Plugin tag line | `bs_1.NN.N` |
| Catalog index | `quay.io/veecode/plugin-catalog-index:bs_1.NN.N`, qualified at `sha256:DIGEST` |
| Catalog index tag for pinning | `quay.io/veecode/plugin-catalog-index:TIMESTAMPED_TAG` |
| Qualified on | Kubernetes 1.NN, PostgreSQL NN |

`bs_1.NN.N` is the tag under which the plugins and the catalog index are published, and it names the Backstage version they are built for. The catalog index tag moves when the catalog is republished. During an incident, pin the timestamped tag above so that the marketplace stops changing.

### Backstage packages

| Package | Version |
| --- | --- |
| `@backstage/PACKAGE` | `X.Y.Z` |

## Vulnerability report

- Image scanned: `docker.io/veecode/devportal@sha256:DIGEST`
- Scanner: Trivy X.Y.Z, database of YYYY-MM-DD
- Critical vulnerabilities with a fix and no live exception: 0

| Severity | Reported | With a fix | Accepted as an exception |
| --- | ---: | ---: | ---: |
| CRITICAL | 0 | 0 | 0 |
| HIGH | 0 | 0 | 0 |
| MEDIUM | 0 | 0 | 0 |
| LOW | 0 | 0 | 0 |
| UNKNOWN | 0 | 0 | 0 |

A release does not ship with a critical vulnerability that has a fix and no live exception.

### Exceptions

| ID | Package | Severity | Reason | Expires |
| --- | --- | --- | --- | --- |
| CVE-YYYY-NNNNN | `PACKAGE` | HIGH | Why the risk is accepted. | YYYY-MM-DD |

An exception expires on the date shown. After that date the finding counts again and blocks a release.

### Plugins enabled by default

The plugins the portal enables by default are separate artifacts. Each one is scanned by digest. This scan is a report and does not block a release.

| Artifact | Critical | High | Medium | Low |
| --- | ---: | ---: | ---: | ---: |
| `ARTIFACT@sha256:DIGEST` | 0 | 0 | 0 | 0 |

## Known limitations

- What does not work or works differently, and the workaround if there is one.
````

## Where each field comes from

| Field | Source |
| --- | --- |
| Image and digest | The tag on Docker Hub. |
| Chart version and checksum | The `chart-vA.B.C` release of the [chart repository](https://github.com/veecode-platform/devportal-chart), which carries the package and its `.sha256` file. |
| Backstage version and packages | [`docs/dynamic-plugins/versions.md`](https://github.com/veecode-platform/devportal-core/blob/main/docs/dynamic-plugins/versions.md) of the core repository, which lists the Backstage version and the table of packages. |
| Catalog index and its timestamped tag | The catalog index that the qualification installed. The timestamped tag comes from the same publication. |
| Qualified on | The Kubernetes and PostgreSQL versions of the qualification run. |
| Vulnerability report | `scan-summary.md` and `trivy.json`, which the qualification run uploads as the `qualification-scan` artifact. |
| Exceptions | `.trivyignore.yaml` of the chart repository. Each entry has an `id`, a `statement` (the reason) and an `expired_at` date. |
| Plugins enabled by default | The scan of each default artifact, in report mode. |

The section order follows the release notes of Red Hat Developer Hub. No text is copied.
