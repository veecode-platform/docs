---
sidebar_position: 10
sidebar_label: Jenkins
title: Jenkins Plugin
---

# Jenkins Plugin

Without this plugin, build status lives in Jenkins: you context-switch to check whether a build passed and trace failures back to code. Enable the plugin, add `jenkins.io/job-full-name` with the job path in Jenkins, and a CI card appears on the entity showing build history and status.

The Jenkins plugin displays Jenkins build status in catalog entity pages.

**Status:** Not a default plugin. Install it from Marketplace (plugin `backstage-community-plugin-jenkins`) or with a plugin entry.

---

## Packages

| Package | Role |
|---|---|
| `backstage-community-plugin-jenkins` | Frontend: entity CI card |
| `backstage-community-plugin-jenkins-backend` | Backend: Jenkins API proxy |

Both must be enabled together. The frontend card only renders when the entity carries the required annotation.

---

## What it does

- Adds a **CI** card entry showing Jenkins builds via `EntityJenkinsContent`
- Displays build status, duration, and link to Jenkins
- Only renders for entities with `isJenkinsAvailable` true

---

## Install it

In Marketplace, search for `backstage-community-plugin-jenkins`, select **Install**, and restart the stack as described in [Adding Plugins](../adding.md).

Alternatively, add both digest-pinned references from the default plugin index under `global.dynamic.plugins` on Kubernetes, or in the operator plugin file on the local stack:

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-community-plugin-jenkins@sha256:bbed7a06c0b758213e58b9bb0427e22c83895b199530bb56984ea7e5caa1d193
    disabled: false
  - package: oci://quay.io/veecode/backstage-community-plugin-jenkins-backend@sha256:dc043d5b0302f8e4f42d1f0599a050463082f08a214fc5991709f32471d536cb
    disabled: false
```

The index supplies the frontend mount point (`EntityJenkinsContent` on `entity.page.ci/cards`, shown when `isJenkinsAvailable` is true) and the backend connection settings.

---

## Configuration

The backend plugin needs the Jenkins base URL and credentials. The index default reads them from the environment:

```yaml
jenkins:
  baseUrl: ${JENKINS_URL}
  username: ${JENKINS_USERNAME}
  apiKey: ${JENKINS_TOKEN}
```

Use a Jenkins API token, not a password. Set the three variables in the runtime Secret on Kubernetes or in the local stack environment, and keep the block above in app configuration. The [upstream plugin README](https://github.com/backstage/community-plugins/tree/main/workspaces/jenkins/plugins/jenkins) documents the card components and their options.

---

## Required annotation

```yaml
metadata:
  annotations:
    jenkins.io/job-full-name: my-folder/my-job
```

The value is the full job path in Jenkins. The plugin works with folder projects backed by Git source control.
