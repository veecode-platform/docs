---
sidebar_position: 9
sidebar_label: Writing Templates
title: Writing Templates
---

# Writing Templates

This guide covers how to **author** a Backstage software template — the YAML entity that drives the scaffolder wizard. It assumes you know how to run a template as a developer. If you're looking to use existing templates, see [Software Templates](./software-template).

---

## What a template is

A template is a catalog entity of `kind: Template`. When the scaffolder backend loads it:

1. It renders a form from `spec.parameters`
2. It executes a sequence of steps from `spec.steps`
3. It shows links and text from `spec.output`

The template YAML lives in a Git repository. You register it by pointing a `catalog.locations` entry in `app-config.yaml` at it.

---

## Registering a template

Add a location entry to your `app-config.yaml` (or any config layer that is loaded at startup):

```yaml
catalog:
  locations:
    - type: url
      target: https://github.com/my-org/my-templates/blob/main/template.yaml
      rules:
        - allow: [Template]
```

For files inside the container (e.g., baked into the image at `/app/examples/`):

```yaml
catalog:
  locations:
    - type: file
      target: /app/examples/my-template/template.yaml
      rules:
        - allow: [Template]
```

---

## Anatomy: the three sections

Every template shares the same top-level structure:

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: my-template        # unique ID — used in URLs and entity refs
  title: My Template       # display name shown in the template catalog
  description: Does X      # one-line summary shown in the catalog card
  tags: [github, nodejs]   # used for filtering in the UI
spec:
  owner: group:default/platform-team
  type: service            # category label (service, website, library, etc.)

  parameters: []   # defines the wizard form
  steps: []        # defines what runs when the user clicks Create
  output: {}       # defines the links and text shown after completion
```

Source: [Backstage — Writing Templates](https://backstage.io/docs/features/software-templates/writing-templates)

---

## Parameters

`spec.parameters` is an array. Each item in the array becomes one page in the multi-step wizard.

### Basic types

```yaml
parameters:
  - title: About your service
    required:
      - name
      - owner
    properties:
      name:
        title: Service name
        type: string
        description: Unique name — used for the repo and catalog entry
        ui:autofocus: true
      owner:
        title: Owner
        type: string
        ui:field: OwnerPicker
        ui:options:
          catalogFilter:
            kind: [Group, User]
      replicas:
        title: Replica count
        type: integer
        default: 2
      enableCache:
        title: Enable cache?
        type: boolean
        default: false
```

Supported types: `string`, `integer`, `number`, `boolean`, `array`, `object`.

### Special UI fields

These fields render specialized widgets instead of plain text inputs:

| `ui:field` | What it renders | Key `ui:options` |
|---|---|---|
| `RepoUrlPicker` | Git repo selector (provider + org + repo name) | `allowedHosts`, `allowedOwners` |
| `OwnerPicker` | Catalog entity picker pre-filtered to owners | `catalogFilter` |
| `EntityPicker` | Any catalog entity picker | `catalogFilter`, `allowArbitraryValues` |

```yaml
repoUrl:
  title: Repository location
  type: string
  ui:field: RepoUrlPicker
  ui:options:
    allowedHosts:
      - github.com
    allowedOwners:
      - my-org
```

Source: [Backstage — Writing Templates](https://backstage.io/docs/features/software-templates/writing-templates)

### Enum with friendly labels

```yaml
environment:
  title: Target environment
  type: string
  enum: [dev, staging, prod]
  enumNames: ['Development', 'Staging', 'Production']
  default: dev
```

### Conditional fields

Use JSON Schema `dependencies` + `allOf` + `if/then` to show or hide fields based on another field's value:

```yaml
parameters:
  - title: Configuration
    properties:
      needsDatabase:
        title: Needs a database?
        type: boolean
        default: false
    dependencies:
      needsDatabase:
        allOf:
          - if:
              properties:
                needsDatabase:
                  const: true
            then:
              required:
                - dbName
              properties:
                dbName:
                  title: Database name
                  type: string
```

Source: [Backstage — Input examples](https://backstage.io/docs/features/software-templates/input-examples)

---

## Steps

`spec.steps` is an array of action invocations executed in order.

### Basic step

```yaml
steps:
  - id: fetch-base           # used to reference this step's output in later steps
    name: Fetch skeleton     # display name shown in the execution log
    action: fetch:template   # action ID — see Available Actions
    input:
      url: ./content         # path to skeleton directory inside this template's repo
      values:
        name: ${{ parameters.name }}
```

### Referencing parameters and step outputs

```yaml
# Inject a parameter value into a step input
input:
  description: This is ${{ parameters.name }}

# Reference a previous step's output
# Use bracket notation when the step ID contains a dash
input:
  repoContentsUrl: ${{ steps['publish'].output.repoContentsUrl }}

# Shorthand when the step ID has no dashes
input:
  ref: ${{ steps.register.output.entityRef }}
```

Source: [Backstage — Writing Templates](https://backstage.io/docs/features/software-templates/writing-templates)

### Conditional execution

A step only runs when its `if:` expression evaluates to truthy:

```yaml
- id: publish-github
  name: Publish to GitHub
  if: ${{ parameters.provider === 'github' }}
  action: publish:github
  input:
    repoUrl: ${{ parameters.repoUrl }}

- id: register
  name: Register in catalog
  if: ${{ parameters.provider !== 'local' }}
  action: catalog:register
  input:
    repoContentsUrl: ${{ steps['publish-github'].output.repoContentsUrl }}
    catalogInfoPath: /catalog-info.yaml
```

The `if:` field accepts any expression using `===`, `!==`, `!`, `and`, `or`, and `${{ parameters.* }}` or `${{ steps.*.output.* }}` references.

Source: [Backstage — Writing Templates](https://backstage.io/docs/features/software-templates/writing-templates)

### Iteration with `each:`

Repeat a step for each item in an array:

```yaml
- id: fetch-per-env
  name: Fetch config per environment
  each: ${{ parameters.environments }}
  action: fetch:plain:file
  input:
    url: ./configs/${{ each.value }}.yaml
    targetPath: config/${{ each.value }}.yaml
```

For arrays of objects, use `${{ each.value.fieldName }}`:

```yaml
- id: process-services
  each: ${{ parameters.services }}
  action: fetch:plain:file
  input:
    url: ./templates/${{ each.value.language }}.yaml
    targetPath: services/${{ each.value.name }}.yaml
```

Source: [Backstage — Writing Templates](https://backstage.io/docs/features/software-templates/writing-templates)

---

## Output

`spec.output` defines the links and text shown after all steps complete:

```yaml
output:
  links:
    - title: Repository
      url: ${{ steps['publish'].output.remoteUrl }}
    - title: Open in catalog
      icon: catalog
      entityRef: ${{ steps['register'].output.entityRef }}
    - if: ${{ parameters.provider === 'github' }}
      title: GitHub Actions
      url: ${{ steps['publish'].output.remoteUrl }}/actions
  text:
    - title: Next steps
      content: |
        Your service is live. Push your first commit to trigger the CI pipeline.
```

---

## Complete example

A template that creates a Node.js service on GitHub, registers it in the catalog, and notifies the owner. Based directly on the [template-nodejs example](https://github.com/veecode-platform/devportal-base/blob/main/examples/template-nodejs/template.yaml) that ships with VeeCode DevPortal.

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: example-nodejs-template
  title: Node.js Service
  description: Creates a Node.js repo on GitHub and registers it in the catalog
  tags: [github, nodejs]
spec:
  owner: group:default/platform-team
  type: service

  parameters:
    - title: About your service
      required:
        - name
      properties:
        name:
          title: Name
          type: string
          description: Unique name of the component
          ui:autofocus: true

    - title: Repository location
      required:
        - repoUrl
      properties:
        repoUrl:
          title: Repository location
          type: string
          ui:field: RepoUrlPicker
          ui:options:
            allowedHosts:
              - github.com

  steps:
    # 1. Copy the skeleton files from ./content in this template's repo,
    #    substituting ${{ values.name }} throughout file contents and paths.
    - id: fetch-base
      name: Fetch skeleton
      action: fetch:template
      input:
        url: ./content
        values:
          name: ${{ parameters.name }}

    # 2. Create the GitHub repo and push the workspace content.
    #    The output.repoContentsUrl and output.remoteUrl are used by later steps.
    - id: publish
      name: Publish to GitHub
      action: publish:github
      input:
        description: This is ${{ parameters.name }}
        repoUrl: ${{ parameters.repoUrl }}
        defaultBranch: main

    # 3. Register a Location entity pointing at the new catalog-info.yaml,
    #    making the component immediately visible in the catalog.
    - id: register
      name: Register in catalog
      action: catalog:register
      input:
        repoContentsUrl: ${{ steps['publish'].output.repoContentsUrl }}
        catalogInfoPath: /catalog-info.yaml

    # 4. Send a notification to the user:default/guest entity.
    #    Change entityRefs to the actual owner entity ref in your org.
    - id: notify
      name: Notify
      action: notification:send
      input:
        recipients: entity
        entityRefs:
          - user:default/guest
        title: Template executed
        info: Your template has been executed
        severity: normal

  output:
    links:
      - title: Repository
        url: ${{ steps['publish'].output.remoteUrl }}
      - title: Open in catalog
        icon: catalog
        entityRef: ${{ steps['register'].output.entityRef }}
```

To add more integrations, insert steps between `register` and `notify`. Each new step can use `${{ steps['publish'].output.remoteUrl }}` or `${{ parameters.* }}` as inputs. See [Available Actions](./available-actions) for the full list.

---

## References

- [Backstage: Writing Templates](https://backstage.io/docs/features/software-templates/writing-templates) — upstream canonical reference
- [Backstage: Input examples](https://backstage.io/docs/features/software-templates/input-examples) — parameter patterns and conditional fields
- [Available Actions](./available-actions) — all pre-registered actions in VeeCode
- [Custom Action](../plugins/development/custom-action) — write your own action in TypeScript when nothing in the list fits
- [Software Templates](./software-template) — user guide for running templates
