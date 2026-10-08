---
sidebar_position: 9
sidebar_label: Writing Templates
title: Writing Templates
---

# Writing Templates

This guide covers how to **author** a Backstage software template — the YAML entity that drives the scaffolder wizard. It assumes you know how to run a template as a developer. If you want to run templates, see [Software Templates](./software-template.md).

Template steps may only invoke actions your portal has. A default install has the 16 actions listed in [Available Actions](./available-actions.md); every example on this page uses only those, so each one runs on a default install.

---

## What a template is

A template is a catalog entity of `kind: Template`. When the scaffolder backend loads it:

1. It renders a form from `spec.parameters`
2. It executes a sequence of steps from `spec.steps`
3. It shows links and text from `spec.output`

The template YAML lives in a Git repository beside its skeleton directory. You register it by pointing a `catalog.locations` entry at it.

---

## Registering a template

On the local stack, add a file or URL location to the custom configuration fragment, as described in [Add catalog entities](../installation-guide/docker-local/custom-catalog.md):

```yaml
catalog:
  locations:
    - type: url
      target: https://github.com/my-org/my-templates/blob/main/template.yaml
      rules:
        - allow: [Template]
```

On Kubernetes, set `catalog.locations` in the chart values under `upstream.backstage.appConfig`. A list in a later configuration file replaces the same list from an earlier file, so repeat every location you want to keep.

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
  tags: [docs, static]     # used for filtering in the UI
spec:
  owner: group:default/platform-team
  type: service            # category label (service, website, library, etc.)

  parameters: []   # defines the wizard form
  steps: []        # defines what runs when the user clicks Create
  output: {}       # defines the links and text shown after completion
```

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
        description: Unique name — used for the catalog entry
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
| `OwnerPicker` | Catalog entity picker pre-filtered to owners | `catalogFilter` |
| `EntityPicker` | Any catalog entity picker | `catalogFilter`, `allowArbitraryValues` |

```yaml
owner:
  title: Owner
  type: string
  ui:field: OwnerPicker
  ui:options:
    catalogFilter:
      kind: [Group, User]
```

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

---

## Steps

`spec.steps` is an array of action invocations executed in order. Each `action` must be an ID from [Available Actions](./available-actions.md).

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
  entityRef: ${{ steps['fetch-owner'].output.entity.metadata.name }}

# Shorthand when the step ID has no dashes
input:
  message: Fetched ${{ steps.fetchOwner.output.entity.metadata.name }}
```

The `catalog:fetch` action returns the fetched entity as `output.entity`, which later steps can read this way.

### Conditional execution

A step only runs when its `if:` expression evaluates to truthy:

```yaml
- id: log-name
  name: Log the service name
  if: ${{ parameters.environment === 'prod' }}
  action: debug:log
  input:
    message: Creating production service ${{ parameters.name }}

- id: remove-dev-notes
  name: Remove developer notes
  if: ${{ parameters.environment !== 'dev' }}
  action: fs:delete
  input:
    files:
      - NOTES-dev.md
```

The `if:` field accepts any expression using `===`, `!==`, `!`, `and`, `or`, and `${{ parameters.* }}` or `${{ steps.*.output.* }}` references.

### Iteration with `each:`

Repeat a step for each item in an array. The parent directory in `targetPath` must already exist in the workspace, because `fetch:plain:file` does not create it:

```yaml
- id: fetch-per-env
  name: Fetch config per environment
  each: ${{ parameters.environments }}
  action: fetch:plain:file
  input:
    url: ./configs/${{ each.value }}.yaml
    targetPath: fetched-${{ each.value }}.yaml
```

For arrays of objects, use `${{ each.value.fieldName }}`:

```yaml
- id: process-services
  each: ${{ parameters.services }}
  action: fetch:plain:file
  input:
    url: ./templates/${{ each.value.language }}.yaml
    targetPath: service-${{ each.value.name }}.yaml
```

---

## Output

`spec.output` defines the links and text shown after all steps complete:

```yaml
output:
  text:
    - title: Next steps
      content: |
        Your service files are ready. Register the written catalog-info.yaml
        through a catalog location to see the component in the catalog.
```

---

## Complete example

A template that scaffolds a static documentation site from a skeleton directory, writes its `catalog-info.yaml`, and logs a summary. It uses only default actions (`fetch:template`, `catalog:write`, `debug:log`), so it runs on a default install. The template repo holds `template.yaml` beside a `content/` skeleton directory.

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: example-docs-site
  title: Documentation Site
  description: Scaffolds a docs site and writes its catalog entry
  tags: [docs, static]
spec:
  owner: group:default/platform-team
  type: website

  parameters:
    - title: About your site
      required:
        - name
        - owner
      properties:
        name:
          title: Name
          type: string
          description: Unique name of the component
          ui:autofocus: true
        owner:
          title: Owner
          type: string
          ui:field: OwnerPicker
          ui:options:
            catalogFilter:
              kind: [Group, User]

  steps:
    # 1. Copy the skeleton files from ./content in this template's repo,
    #    substituting values throughout file contents and paths.
    - id: fetch-base
      name: Fetch skeleton
      action: fetch:template
      input:
        url: ./content
        values:
          name: ${{ parameters.name }}

    # 2. Write the catalog descriptor for the new component.
    - id: write-catalog
      name: Write catalog entry
      action: catalog:write
      input:
        entity:
          apiVersion: backstage.io/v1alpha1
          kind: Component
          metadata:
            name: ${{ parameters.name }}
            annotations: {}
          spec:
            type: website
            lifecycle: experimental
            owner: ${{ parameters.owner }}

    # 3. Log a summary line in the execution log.
    - id: log-done
      name: Log summary
      action: debug:log
      input:
        message: Scaffolded ${{ parameters.name }} for ${{ parameters.owner }}

  output:
    text:
      - title: Next steps
        content: |
          The site files and catalog-info.yaml are in the workspace.
          Register the catalog-info.yaml through a catalog location
          to see the component in the catalog.
```

To publish the result to a repository, add a publish step from a Marketplace scaffolder module (for example `github-scaffolder-actions`) and a `catalog:register` step after it. See [Available Actions](./available-actions.md) for the module list.

---

## References

- [Backstage: Writing Templates](https://backstage.io/docs/features/software-templates/writing-templates) — upstream canonical reference
- [Backstage: Input examples](https://backstage.io/docs/features/software-templates/input-examples) — parameter patterns and conditional fields
- [Available Actions](./available-actions.md) — the 16 actions on a default install
- [Custom Action](../plugins/development/custom-action.md) — write your own action in TypeScript when nothing in the list fits
- [Software Templates](./software-template.md) — user guide for running templates
