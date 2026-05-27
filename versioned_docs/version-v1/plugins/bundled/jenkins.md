---
sidebar_position: 10
sidebar_label: Jenkins
title: Jenkins Plugin
---

# Jenkins Plugin

The Jenkins plugin displays Jenkins build status in catalog entity pages.

**Status:** Preloaded in the DevPortal image, **disabled by default**. Enable via `dynamic-plugins.yaml` or Marketplace.

---

## Packages

| Package | Role |
|---|---|
| `backstage-community-plugin-jenkins` | Frontend — entity CI tab card |
| `backstage-community-plugin-jenkins-backend-dynamic` | Backend — Jenkins API proxy |

Both must be enabled together.

---

## What it does

- Adds a **CI** tab entry showing Jenkins builds via `EntityJenkinsContent`
- Displays build status, duration, and link to Jenkins
- Only renders for entities with `isJenkinsAvailable` true

---

## Enabling the plugin

```yaml
plugins:
  - package: ./dynamic-plugins/dist/backstage-community-plugin-jenkins-backend-dynamic
    disabled: false
    pluginConfig:
      jenkins:
        instances:
          - name: default
            baseUrl: ${JENKINS_URL}
            username: ${JENKINS_USERNAME}
            apiKey: ${JENKINS_TOKEN}

  - package: ./dynamic-plugins/dist/backstage-community-plugin-jenkins
    disabled: false
    pluginConfig:
      dynamicPlugins:
        frontend:
          backstage-community.plugin-jenkins:
            mountPoints:
              - mountPoint: entity.page.ci/cards
                importName: EntityJenkinsContent
                config:
                  layout:
                    gridColumn: "1 / -1"
                  if:
                    allOf:
                      - isJenkinsAvailable
```

---

## App configuration

Jenkins connection details are supplied via the backend plugin's `pluginConfig`:

```yaml
jenkins:
  instances:
    - name: default
      baseUrl: ${JENKINS_URL}        # e.g. https://jenkins.company.com
      username: ${JENKINS_USERNAME}
      apiKey: ${JENKINS_TOKEN}       # Jenkins API token (not password)
```

Multiple Jenkins instances are supported — add additional entries to the `instances` array and reference them with `jenkins.com/host` annotation.

---

## Required annotation

```yaml
metadata:
  annotations:
    jenkins.io/job-full-name: my-folder/my-job
```
