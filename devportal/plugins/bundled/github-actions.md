---
sidebar_position: 8
sidebar_label: GitHub Actions
title: GitHub Actions Plugin
---

# GitHub Actions Plugin

Without this plugin, CI history lives only in GitHub: you leave the portal to check whether a build passed or trace a failed run back to a commit. Enable the plugin, add `github.com/project-slug` to the entity, and a CI card appears showing recent Actions run history with status, duration, and direct links to logs.

The GitHub Actions plugin displays GitHub Actions workflow run history on catalog entities. It is the standard Backstage community plugin for GitHub Actions integration.

**Status:** Not a default plugin. Install it from Marketplace (plugin `github-actions`) or with a plugin entry.

---

## Package

`backstage-community-plugin-github-actions` (frontend: entity CI card)

---

## What it does

- Adds a **CI** card to entity pages showing recent GitHub Actions workflow runs
- Displays run status, duration, branch, and commit
- Links to the GitHub Actions run for logs and details
- Shows only for entities with the `github.com/project-slug` annotation

---

## Install it

In Marketplace, search for `github-actions`, select **Install**, and restart the stack as described in [Adding Plugins](../adding.md).

Alternatively, add the digest-pinned reference from the default plugin index under `global.dynamic.plugins` on Kubernetes, or in the operator plugin file on the local stack:

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-community-plugin-github-actions@sha256:fe9cea3a11097339f85bab0bf095ecf1dc95b972194d41e4c9ca0e34c85ecebd
    disabled: false
```

The index supplies the frontend mount point (`EntityGithubActionsContent` on `entity.page.ci/cards`, shown when `isGithubActionsAvailable` is true).

---

## Required annotation

```yaml
metadata:
  annotations:
    github.com/project-slug: my-org/my-repo
```

The [upstream plugin README](https://github.com/backstage/community-plugins/tree/main/workspaces/github/plugins/github-actions) documents this annotation key and the card views it enables.

---

## GitHub integration

The plugin calls the GitHub API, so the portal needs GitHub credentials. Configure a GitHub integration in app configuration:

```yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}
```

Place this under `upstream.backstage.appConfig` in the chart values, or in the custom configuration fragment on the local stack. For GitHub sign-in through an OAuth app, the upstream README also shows the `auth.providers.github` settings.
