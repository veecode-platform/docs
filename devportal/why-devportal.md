---
sidebar_position: 2.3
sidebar_label: Why DevPortal?
title: Why DevPortal?
---

# Why DevPortal?

## What is a Backstage distro?

A Backstage distribution (distro) is a packaged, opinionated build of Backstage that comes with curated plugins, sensible defaults, integrations, and an upgrade path. Instead of stitching together the open-source core, dozens of plugins, auth, RBAC, catalog processors, search backends, and CI/CD yourself, a distro gives you a tested runtime you can deploy and operate reliably.

For 3.x, the default plugins ship in the image. Use chart values to add or override plugins. See [What ships by default](./installation-guide/production-setup/setup.md#what-ships-by-default) and [how to disable a default plugin](./installation-guide/production-setup/setup.md#disable-a-default-plugin).

## Why run a ready-to-use Backstage runtime?

- **Faster time-to-value:** start with a working portal on day one. The catalog, the API catalog, TechDocs, notifications, Tech Radar, the plugin Marketplace, and the self-service area for your own templates are already wired in the image.

- **Hardened, supported baseline:** vetted plugins, sensible configuration, and guidance for scale and multi-tenant realities. Permission checks are off by default in 3.x; see [the RBAC note](./installation-guide/production-setup/plan.md#rbac).

- **Upgrades made safe:** regular, non-breaking releases, security patches, and migration notes, without you chasing every upstream change.

- **Lower total cost of ownership:** reduce engineering hours spent on build, test, release, and incident response for the portal itself.

## The toil of running DIY Backstage

- **Dependency and plugin churn:** frequent breaking changes across core, plugins, and SDKs; pinning, patching, and debugging eat cycles.

- **Integration glue and drift:** auth providers, RBAC, catalog processors, search backends, and CI integrations require ongoing glue code that diverges from upstream.

- **Upgrade risk and fork maintenance:** customizations often create a local fork; over time, merging upstream becomes risky and slow. It takes time and effort to keep up with upstream changes while still delivering a reliable and secure portal with added features.

- **Lack of product thinking:** engineers will focus on the portal code instead of portal artifacts and experience, failing to deliver value to users.

## Focus on platform outcomes, not portal plumbing

Every hour spent keeping the portal alive is an hour not spent on golden paths, scorecards, paved-road templates, and developer experience. A supported distro lets your platform team focus on business-impact features instead of undifferentiated maintenance.

Building your platform is hard by itself, let's not make it harder by adding the complexity of maintaining a portal when value to be delivered lies somewhere else.

## We’ve got your back (support included)

- Expert support and SLAs for incidents and upgrades
- Guidance on information architecture, RBAC, and catalog modeling
- Compatibility testing for popular plugins and integrations
- Upgrade playbooks and migration assistance
- We can even develop plugins for you!

For the 3.x support lifecycle and release policy, see [Support](./support.md).

Outcome: a reliable, secure developer portal that evolves with your platform, without the maintenance burden.
