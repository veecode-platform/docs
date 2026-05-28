---
sidebar_position: 7
sidebar_label: GitLab Pipelines
title: GitLab Pipelines Plugin
---

# GitLab Pipelines Plugin

Without this plugin, a service registered in the portal has no visibility into its own CI pipelines. Developers context-switch to GitLab to check pipeline status or trigger runs — the portal and the CI tool are disconnected. Enable the plugin, add `gitlab.com/project-slug` to the entity, and the CI tab shows live pipeline history with the ability to trigger new runs directly from the portal.

The GitLab Pipelines plugin integrates GitLab CI with your DevPortal component. It provides two views:

- **Pipelines List** — lists recent pipelines with the ability to trigger or cancel runs.
- **GitLab Jobs** — shows individual jobs separated by annotation, useful for triggering specific pipeline stages.

### Community

> Join our community to resolve questions about our Plugins. We look forward to welcoming you!
>
> [Go to Community](https://github.com/orgs/veecode-platform/discussions)

---

## Plugin package

The GitLab Pipelines plugin is available as an OCI artifact from `quay.io/veecode/gitlab`. It is **not preloaded** in the distro image — add it via `dynamic-plugins.yaml` or the Marketplace.

| OCI Reference | Role |
|---|---|
| `oci://quay.io/veecode/gitlab:bs_1.48.4!immobiliarelabs-backstage-plugin-gitlab` | Frontend + backend |

---

## Enabling the plugin

Add the following to your `dynamic-plugins.yaml`:

```yaml
plugins:
  - package: oci://quay.io/veecode/gitlab:bs_1.48.4!immobiliarelabs-backstage-plugin-gitlab
    disabled: false
    pluginConfig:
      dynamicPlugins:
        frontend:
          immobiliarelabs.backstage-plugin-gitlab:
            mountPoints:
              - mountPoint: entity.page.ci/cards
                importName: EntityGitlabPipelinesTable
                config:
                  layout:
                    gridColumn: "1 / -1"
                  if:
                    allOf:
                      - isGitlabAvailable
              - mountPoint: entity.page.overview/cards
                importName: EntityGitlabJobsTable
                config:
                  layout:
                    gridColumn: "1 / -1"
                  if:
                    allOf:
                      - isGitlabAvailable
```

Restart DevPortal after saving.

:::note
Replace `bs_1.48.4` with the Backstage version tag that matches your DevPortal instance. OCI workspace tags must match the deployed Backstage version.
:::

---

## GitLab integration

Configure the GitLab integration in `app-config.yaml`. The plugin uses these credentials to call the GitLab API server-side:

```yaml
integrations:
  gitlab:
    - host: gitlab.com                        # or your self-hosted GitLab hostname
      token: ${GITLAB_TOKEN}
      # apiBaseUrl: https://gitlab.company.com/api/v4   # required for self-hosted instances
```

For GitLab authentication (sign-in), DevPortal handles it through the GitLab auth provider configured in `app-config.yaml`:

```yaml
auth:
  providers:
    gitlab:
      production:
        clientId: ${GITLAB_AUTH_CLIENT_ID}
        clientSecret: ${GITLAB_AUTH_CLIENT_SECRET}
        audience: https://gitlab.com   # or your self-hosted GitLab URL
```

No code changes to `auth.ts`, `identityProviders.ts`, or `EntityPage.tsx` are needed. DevPortal uses the new backend system and dynamic plugin wiring — all configuration is done in YAML.

---

## Setting up GitLab CI

The plugin triggers new pipelines by setting variables, so your `.gitlab-ci.yml` must use variable conditions to control job execution. This ensures each trigger runs only the intended jobs.

```yaml
stages:
  - build
  - deploy
  - start
  - stop

variables:
  DEFAULT_JOB: 'false'
  START_JOB: 'false'
  STOP_JOB: 'false'

build-job:
  stage: build
  script:
    - echo "Building..."
  rules:
    - if: $DEFAULT_JOB == "true"

deploy-job:
  stage: deploy
  script:
    - echo "Deploying..."
  rules:
    - if: $DEFAULT_JOB == "true"

start-job:
  stage: start
  script:
    - echo "Starting..."
  rules:
    - if: $START_JOB == "true"

stop-job:
  stage: stop
  script:
    - echo "Stopping..."
  rules:
    - if: $STOP_JOB == "true"
```

---

## Annotations

### `gitlab.com/project-slug` (required)

```yaml
metadata:
  annotations:
    gitlab.com/project-slug: my-group/my-project
```

### `gitlab.com/jobs` (required for GitLab Jobs component)

Defines the jobs to show in the GitLab Jobs card. Format: `Label:VARIABLE_NAME`, comma-separated:

```yaml
metadata:
  annotations:
    gitlab.com/project-slug: my-group/my-project
    gitlab.com/jobs: 'Deploy:DEFAULT_JOB,Start:START_JOB,Stop:STOP_JOB'
```

---

## Pipelines List

Lists recent pipelines for the component's GitLab project. Features:

- Branch selector
- **Run Pipeline** button — opens a modal to set pipeline variables
- **Cancel** button on running pipelines
- Table with: Pipeline ID, status, GitLab URL, elapsed time

---

## GitLab Jobs

Shows the individual jobs defined via `gitlab.com/jobs` annotation. Each job is displayed as a button using the annotation label. Clicking a button triggers that job in a new pipeline execution — only the job whose variable is set to `"true"` runs.
