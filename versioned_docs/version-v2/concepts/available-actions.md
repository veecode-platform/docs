---
sidebar_position: 10
sidebar_label: Available Actions
title: Available Actions
---

# Available Actions

Actions are functions registered in the scaffolder backend. You invoke them by `id` inside a `step`. This page lists everything pre-registered in VeeCode DevPortal — no extra installation needed.

To see all currently loaded actions in a running instance, open `/create/actions` in your DevPortal URL.

---

## Quick lookup

| Action ID | What it does | Source module |
|---|---|---|
| `fetch:template` | Copies a skeleton directory, rendering Nunjucks variables into file contents and paths | `@backstage/plugin-scaffolder-backend` |
| `fetch:plain` | Downloads a directory from a URL without any templating | `@backstage/plugin-scaffolder-backend` |
| `fetch:plain:file` | Downloads a single file from a URL | `@backstage/plugin-scaffolder-backend` |
| `catalog:register` | Registers a `catalog-info.yaml` as a new entity | `@backstage/plugin-scaffolder-backend` |
| `catalog:fetch` | Fetches an existing entity from the catalog | `@backstage/plugin-scaffolder-backend` |
| `debug:log` | Writes a message or lists workspace files in the step log | `@backstage/plugin-scaffolder-backend` |
| `publish:github` | Creates a GitHub repo and pushes workspace content | `@backstage/plugin-scaffolder-backend-module-github` |
| `github:repo:create` | Creates a GitHub repo without pushing content | `@backstage/plugin-scaffolder-backend-module-github` |
| `github:issues:create` | Creates a GitHub issue | `@backstage/plugin-scaffolder-backend-module-github` |
| `publish:gitlab` | Creates a GitLab project and pushes workspace content | `@backstage/plugin-scaffolder-backend-module-gitlab` |
| `publish:azure` | Creates an Azure DevOps repo and pushes workspace content | `@backstage/plugin-scaffolder-backend-module-azure` |
| `notification:send` | Sends a Backstage notification to entities or as broadcast | `@backstage/plugin-scaffolder-backend-module-notifications` |
| `http:backstage:request` | Makes an authenticated HTTP request to any Backstage API | `@roadiehq/scaffolder-backend-module-http-request` |
| `roadiehq:utils:fs:write` | Writes a string to a file in the workspace | `@roadiehq/scaffolder-backend-module-utils` |
| `roadiehq:utils:fs:append` | Appends content to a file (creates if absent) | `@roadiehq/scaffolder-backend-module-utils` |
| `roadiehq:utils:fs:parse` | Parses a JSON or YAML file into an object | `@roadiehq/scaffolder-backend-module-utils` |
| `roadiehq:utils:serialize:json` | Serializes data to a JSON string | `@roadiehq/scaffolder-backend-module-utils` |
| `roadiehq:utils:serialize:yaml` | Serializes data to a YAML string | `@roadiehq/scaffolder-backend-module-utils` |
| `roadiehq:utils:merge` | Deep-merges content into an existing YAML or JSON file | `@roadiehq/scaffolder-backend-module-utils` |
| `roadiehq:utils:json:merge` | Deep-merges JSON into an existing JSON file | `@roadiehq/scaffolder-backend-module-utils` |
| `roadiehq:utils:sleep` | Waits N seconds before continuing | `@roadiehq/scaffolder-backend-module-utils` |
| `roadiehq:aws:s3:cp` | Uploads workspace content to an S3 bucket | `@roadiehq/scaffolder-backend-module-aws` |
| `roadiehq:aws:ecr:create` | Creates an ECR container image repository | `@roadiehq/scaffolder-backend-module-aws` |
| `roadiehq:aws:secrets-manager:create` | Creates a secret in AWS Secrets Manager | `@roadiehq/scaffolder-backend-module-aws` |
| `argocd:create-resources` | Creates an Argo CD project and application | `@roadiehq/scaffolder-backend-argocd` |
| `veecode:kong:deck:ping` | Pings a Kong Gateway instance to verify connectivity | `@veecode-platform/plugin-scaffolder-backend-module-kong` |
| `veecode:kong:deck:generate` | Converts an OpenAPI spec to a Kong declarative config using decK | `@veecode-platform/plugin-scaffolder-backend-module-kong` |
| `veecode:kong:deck:sync` | Syncs a Kong declarative config to a running Kong Gateway | `@veecode-platform/plugin-scaffolder-backend-module-kong` |

Source: [Backstage built-in actions](https://backstage.io/docs/features/software-templates/builtin-actions) · [Roadie scaffolder actions](https://github.com/RoadieHQ/roadie-backstage-plugins/tree/main/plugins/scaffolder-actions) · [VeeCode OpenAPI template](https://github.com/veecode-platform/devportal-base/blob/main/examples/template-openapi/template.yaml)

---

## Fetch actions

### `fetch:template`

Downloads a directory, renders all files as Nunjucks templates substituting `${{ values.* }}` variables, and places the result in the workspace. This is the action you use to scaffold files from a skeleton.

```yaml
- id: fetch-base
  name: Fetch skeleton
  action: fetch:template
  input:
    url: ./content          # relative path inside the template repo, or any HTTPS URL
    values:
      name: ${{ parameters.name }}
      owner: ${{ parameters.owner }}
```

Variables passed via `values` are accessible inside skeleton files as `${{ values.name }}`.

Source: [Backstage API](https://backstage.io/api/stable/functions/_backstage_plugin-scaffolder-backend.index.createFetchTemplateAction.html)

### `fetch:plain`

Downloads a directory without any templating — contents are copied as-is.

```yaml
- id: fetch-docs
  name: Fetch documentation skeleton
  action: fetch:plain
  input:
    url: https://github.com/my-org/doc-templates/tree/main/mkdocs
    targetPath: docs/
```

### `fetch:plain:file`

Downloads a single file.

```yaml
- id: fetch-ci-config
  name: Fetch CI config
  action: fetch:plain:file
  input:
    url: https://raw.githubusercontent.com/my-org/ci-configs/main/.github/workflows/ci.yml
    targetPath: .github/workflows/ci.yml
```

---

## Debug

### `debug:log`

Writes a message to the step execution log, or lists all files currently in the workspace. Useful while developing and troubleshooting templates.

```yaml
# Log a message
- id: log-name
  action: debug:log
  input:
    message: "Creating service: ${{ parameters.name }}"

# List all files in the workspace
- id: list-workspace
  action: debug:log
  input:
    listWorkspace: true
```

Source: [Backstage API](https://backstage.io/api/stable/functions/_backstage_plugin-scaffolder-backend.index.createDebugLogAction.html)

---

## Catalog actions

### `catalog:register`

Registers a `catalog-info.yaml` in the catalog. Use after publishing a repo to make the new component appear immediately without manual registration.

```yaml
- id: register
  name: Register in catalog
  action: catalog:register
  input:
    repoContentsUrl: ${{ steps['publish'].output.repoContentsUrl }}
    catalogInfoPath: /catalog-info.yaml
```

**Outputs:** `entityRef` (e.g., `component:default/my-service`), `catalogInfoUrl`.

Source: [Backstage API](https://backstage.io/api/stable/functions/_backstage_plugin-scaffolder-backend.index.createCatalogRegisterAction.html)

### `catalog:fetch`

Fetches an existing entity. Useful when a step needs metadata from the catalog.

```yaml
- id: get-owner
  name: Fetch owner entity
  action: catalog:fetch
  input:
    entityRef: group:default/platform-team
```

**Output:** `entity` (the full entity object, accessible as `${{ steps['get-owner'].output.entity.metadata.name }}`).

---

## Publish actions

### `publish:github`

Creates a GitHub repository and pushes the current workspace content.

```yaml
- id: publish
  name: Publish to GitHub
  action: publish:github
  input:
    repoUrl: ${{ parameters.repoUrl }}
    description: ${{ parameters.name }} service
    defaultBranch: main
    repoVisibility: private   # private | public | internal
```

**Outputs:** `remoteUrl`, `repoContentsUrl`, `commitHash`.

Source: [Backstage API](https://backstage.io/api/next/functions/_backstage_plugin-scaffolder-backend-module-github.createPublishGithubAction.html)

### `github:repo:create`

Creates a GitHub repository without pushing any content. Use when you want to create the repo in one step and push content in a separate step.

```yaml
- id: create-repo
  name: Create GitHub repo
  action: github:repo:create
  input:
    repoUrl: ${{ parameters.repoUrl }}
    description: ${{ parameters.name }} service
    repoVisibility: private
```

**Outputs:** `remoteUrl`, `repoContentsUrl`.

### `github:issues:create`

Creates a GitHub issue in an existing repository.

```yaml
- id: create-issue
  name: Create onboarding issue
  action: github:issues:create
  input:
    repoUrl: ${{ parameters.repoUrl }}
    title: "Onboarding checklist for ${{ parameters.name }}"
    body: "Follow these steps to complete your service setup."
    assignees:
      - ${{ parameters.owner }}
```

**Outputs:** `issueUrl`, `issueNumber`.

### `publish:gitlab`

Creates a GitLab project and pushes workspace content.

```yaml
- id: publish
  name: Publish to GitLab
  action: publish:gitlab
  input:
    repoUrl: ${{ parameters.repoUrl }}
    description: ${{ parameters.name }} service
    defaultBranch: main
    repoVisibility: private
```

**Outputs:** `remoteUrl`, `repoContentsUrl`, `commitHash`, `projectId`.

### `publish:azure`

Creates an Azure DevOps repository and pushes workspace content.

```yaml
- id: publish
  name: Publish to Azure DevOps
  action: publish:azure
  input:
    repoUrl: ${{ parameters.repoUrl }}
    description: ${{ parameters.name }} service
    defaultBranch: main
```

**Outputs:** `remoteUrl`, `repoContentsUrl`, `repositoryId`, `commitHash`.

---

## Notification action

### `notification:send`

Sends a Backstage notification. Requires the notifications plugin to be enabled.

```yaml
- id: notify
  name: Notify team
  action: notification:send
  input:
    recipients: entity
    entityRefs:
      - ${{ parameters.owner }}
    title: Your service is ready
    info: "${{ parameters.name }} was created successfully"
    severity: normal          # low | normal | high | critical
```

Set `recipients: broadcast` to notify all users instead of specific entities.

---

## HTTP request

### `http:backstage:request`

Makes an authenticated request to any Backstage API (catalog, proxy endpoints, custom plugin backends). The authenticated user's token is forwarded automatically.

```yaml
- id: call-api
  name: Call internal API
  action: http:backstage:request
  input:
    method: POST
    path: /proxy/my-backend-service/api/endpoint
    headers:
      content-type: application/json
    body:
      key: ${{ parameters.value }}
```

**Outputs:** `body`, `code`, `headers`.

Source: [Roadie README](https://github.com/RoadieHQ/roadie-backstage-plugins/blob/main/plugins/scaffolder-actions/scaffolder-backend-module-http-request/README.md)

---

## File utility actions

### Write, append, parse

```yaml
# Write a file
- id: write-config
  action: roadiehq:utils:fs:write
  input:
    path: config/settings.json
    content: '{"env": "${{ parameters.environment }}"}'

# Append to a file (creates it if it does not exist)
- id: append-entry
  action: roadiehq:utils:fs:append
  input:
    path: CHANGELOG.md
    content: "\n## ${{ parameters.version }}\n"

# Parse a YAML or JSON file into an object for use in later steps
- id: parse-config
  action: roadiehq:utils:fs:parse
  input:
    path: config/values.yaml
    parser: yaml    # yaml | json | multiyaml
```

**Output of `fs:parse`:** `content` (the parsed object, usable as `${{ steps['parse-config'].output.content.someField }}`).

### Merge

Deep-merges content into an existing YAML or JSON file without overwriting unrelated keys:

```yaml
- id: patch-values
  action: roadiehq:utils:merge
  input:
    path: helm/values.yaml
    content:
      image:
        tag: ${{ parameters.imageTag }}
      replicaCount: ${{ parameters.replicas }}
```

### Serialize

Converts a JavaScript object to a YAML or JSON string:

```yaml
- id: to-yaml
  action: roadiehq:utils:serialize:yaml
  input:
    data:
      name: ${{ parameters.name }}
      replicas: ${{ parameters.replicas }}
```

**Output:** `serialized` (the string).

Source: [Roadie README](https://github.com/RoadieHQ/roadie-backstage-plugins/blob/main/plugins/scaffolder-actions/scaffolder-backend-module-utils/README.md)

---

## AWS actions

```yaml
# Upload workspace content to S3
- id: upload-artifacts
  name: Upload to S3
  action: roadiehq:aws:s3:cp
  input:
    bucket: my-artifacts-bucket
    region: us-east-1

# Create an ECR image repository
- id: create-ecr
  name: Create ECR repository
  action: roadiehq:aws:ecr:create
  input:
    repoName: ${{ parameters.name }}
    region: us-east-1
    imageMutability: MUTABLE

# Create a secret in AWS Secrets Manager
- id: create-secret
  name: Create secret
  action: roadiehq:aws:secrets-manager:create
  input:
    name: ${{ parameters.name }}/api-key
    region: us-east-1
    description: API key for ${{ parameters.name }}
```

Source: [Roadie README](https://github.com/RoadieHQ/roadie-backstage-plugins/blob/main/plugins/scaffolder-actions/scaffolder-backend-module-aws/README.md)

---

## Argo CD

### `argocd:create-resources`

Creates an Argo CD project and application. Requires the Argo CD plugin configured in `app-config.yaml` and an Argo CD user with `create` permissions.

```yaml
- id: create-argocd
  name: Create Argo CD resources
  action: argocd:create-resources
  input:
    appName: ${{ parameters.name }}
    argoInstance: main        # must match an instance name in app-config.yaml
    namespace: ${{ parameters.name }}
    repoUrl: ${{ steps['publish'].output.remoteUrl }}
    labelValue: ${{ parameters.name }}
    path: k8s/
```

Source: [Roadie README](https://github.com/RoadieHQ/roadie-backstage-plugins/blob/main/plugins/scaffolder-actions/scaffolder-backend-argocd/README.md)

---

## Kong (VeeCode)

These actions drive Kong Gateway configuration through the [decK CLI](https://docs.konghq.com/deck/). They require a Kong instance reachable from the DevPortal backend.

```yaml
# 1. Verify connectivity before running further steps
- id: test-kong
  name: Test Kong connection
  action: veecode:kong:deck:ping
  input: {}

# 2. Generate Kong declarative config from an OpenAPI spec
- id: generate-kong-config
  name: Generate Kong config
  action: veecode:kong:deck:generate
  input:
    openapiSpec: ${{ parameters.openapiInline }}   # OpenAPI YAML or JSON as a string
    outputPath: kong.yaml
    deckTag: ${{ parameters.name }}
    removePathEOLAnchor: true

# 3. Sync the generated config to Kong Gateway
- id: sync-kong
  name: Sync to Kong
  action: veecode:kong:deck:sync
  input:
    kongConfigPath: kong.yaml
    deckTag: ${{ parameters.name }}
```

Source: [VeeCode OpenAPI template](https://github.com/veecode-platform/devportal-base/blob/main/examples/template-openapi/template.yaml)

---

## References

- [Backstage: Built-in actions](https://backstage.io/docs/features/software-templates/builtin-actions) — official upstream reference
- [Roadie scaffolder actions](https://github.com/RoadieHQ/roadie-backstage-plugins/tree/main/plugins/scaffolder-actions) — source for `roadiehq:*`, `argocd:*`, `http:backstage:request`
- [VeeCode example templates](https://github.com/veecode-platform/devportal-base/tree/main/examples) — real templates that ship with DevPortal
- [Writing Templates](./writing-templates) — how to use these actions in a template
- [Custom Action](../plugins/development/custom-action) — write your own action in TypeScript when nothing here fits
