---
sidebar_position: 10
sidebar_label: Jenkins
title: Jenkins Plugin
---

# Jenkins Plugin

Without this plugin, build status lives in Jenkins — developers context-switch to check whether a build passed, find the right job among many, and trace failures back to code. Enable the plugin, add `jenkins.io/job-full-name` with the job path in Jenkins, and a CI tab appears on the entity showing build history and status. Configure `JENKINS_URL` and credentials in the backend plugin config.

The Jenkins plugin displays Jenkins build status in catalog entity pages.

**Status:** Listed in `dynamic-plugins.default.yaml` (reference) as `disabled: true`. Fetched from the OCI registry at boot when enabled — no image rebuild needed. Activated automatically by the `jenkins` preset.

---

## Packages

| Package | Role |
|---|---|
| `backstage-community-plugin-jenkins` | Frontend — entity CI tab card |
| `backstage-community-plugin-jenkins-backend` | Backend — Jenkins API proxy |

Both must be enabled together.

---

## What it does

- Adds a **CI** tab entry showing Jenkins builds via `EntityJenkinsContent`
- Displays build status, duration, and link to Jenkins
- Only renders for entities with `isJenkinsAvailable` true

---

## Enabling the plugin

The simplest path is to add the `jenkins` preset to `VEECODE_PRESETS` — it enables both the frontend and backend plugins together. See [Presets](/devportal/concepts/presets) for details.

To enable manually, add the following to your `dynamic-plugins.yaml`:

```yaml
plugins:
  - package: oci://${PLUGIN_REGISTRY}/jenkins:bs_1.48.4!backstage-community-plugin-jenkins-backend
    disabled: false
    pluginConfig:
      jenkins:
        instances:
          - name: default
            baseUrl: ${JENKINS_URL}
            username: ${JENKINS_USERNAME}
            apiKey: ${JENKINS_TOKEN}

  - package: oci://${PLUGIN_REGISTRY}/jenkins:bs_1.48.4!backstage-community-plugin-jenkins
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
