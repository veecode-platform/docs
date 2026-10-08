---
sidebar_position: 10
sidebar_label: Tech Docs
title: Tech Docs
---

# TechDocs

Without the `backstage.io/techdocs-ref` annotation and a `mkdocs.yml` in the repository, the Docs tab is absent from the entity. With both in place, documentation for the service is browsable inside the portal, versioned with the code, and always in sync with the current state of the service — not in a separate wiki space that drifts.

TechDocs is a **docs-as-code** system built into Backstage. Documentation lives as Markdown files in your source repository and is rendered inside DevPortal. There is no in-portal editor, "New Page" button, or "Publish" button — content is written, committed, and built from the repository.

TechDocs ships enabled as three default plugins: the frontend, the backend, and the addons module. No plugin entry is needed to use TechDocs. Configuration in the app config is sufficient.

---

## How it works

1. A repository contains a `mkdocs.yml` configuration file and a `docs/` directory with Markdown content.
2. The `catalog-info.yaml` for the component carries a `backstage.io/techdocs-ref` annotation pointing to the docs source.
3. When a user opens the **Docs** tab in DevPortal, TechDocs serves the documentation built for that entity.

---

## Repository requirements

Every component that uses TechDocs must have:

### `mkdocs.yml` (at the repository root)

```yaml
site_name: My Component
docs_dir: docs
nav:
  - Home: index.md
```

### `docs/index.md` (minimum content)

```markdown
# My Component

Welcome to the documentation for My Component.
```

### `catalog-info.yaml` annotation

```yaml
metadata:
  annotations:
    backstage.io/techdocs-ref: dir:.
```

`dir:.` means the `mkdocs.yml` is in the same directory as `catalog-info.yaml`. Use `dir:./path/to/docs` if your docs live in a subdirectory.

---

## Builder and publisher configuration

TechDocs requires a **builder** (how docs are generated) and a **publisher** (where generated docs are stored). The image configuration sets `techdocs.builder: external`, which means the portal only reads pre-built docs and never generates them itself. Generate the docs in CI and store them in a bucket the portal can read.

### The image default

```yaml
techdocs:
  builder: external
```

With `builder: external`, DevPortal does not attempt to generate docs itself. If no publisher is configured alongside it, the Docs tab has nothing to read.

### Generate docs in CI

Add a step to your CI pipeline using the `techdocs-cli`:

```bash
npx @techdocs/cli generate --source-dir . --output-dir ./site
npx @techdocs/cli publish --publisher-type awsS3 --storage-name my-techdocs-bucket --entity default/Component/my-api
```

### Configure a publisher

Set the publisher that matches the storage your CI publishes to. On the local stack, add the block to a configuration fragment; on Kubernetes, put it under `upstream.backstage.appConfig`.

#### Amazon S3

```yaml
techdocs:
  builder: external
  publisher:
    type: 'awsS3'
    awsS3:
      bucketName: ${TECHDOCS_S3_BUCKET_NAME}
      region: ${AWS_REGION}
```

Credentials come from the `aws` app-config section, the account ID setting, or the environment. See the [TechDocs configuration reference](https://backstage.io/docs/features/techdocs/configuration) for the credential options.

#### Google Cloud Storage

```yaml
techdocs:
  builder: external
  publisher:
    type: 'googleGcs'
    googleGcs:
      bucketName: ${TECHDOCS_GCS_BUCKET_NAME}
```

Credentials come from application default credentials or the `GOOGLE_APPLICATION_CREDENTIALS` variable.

#### Azure Blob Storage

```yaml
techdocs:
  builder: external
  publisher:
    type: 'azureBlobStorage'
    azureBlobStorage:
      containerName: ${TECHDOCS_AZURE_CONTAINER_NAME}
      credentials:
        accountName: ${TECHDOCS_AZURE_ACCOUNT_NAME}
        accountKey: ${TECHDOCS_AZURE_ACCOUNT_KEY}
```

### Local generation instead of CI

To generate docs on demand inside the portal, switch the builder back to local generation:

```yaml
techdocs:
  builder: 'local'
  generator:
    runIn: 'local'
  publisher:
    type: 'local'
```

With `builder: local` and `publisher.type: local`, DevPortal regenerates docs on demand and stores them in the container's local filesystem. **Docs are lost when the pod restarts**, so use this only for evaluation.

---

## Common issues

| Symptom | Likely cause | Fix |
|---|---|---|
| Docs tab shows "No docs found" | Missing `mkdocs.yml` or `docs/index.md` | Add `mkdocs.yml` and at least one Markdown file under `docs/` |
| Docs tab shows "No docs found" | Missing or wrong `backstage.io/techdocs-ref` annotation | Check annotation value — use `dir:.` for docs at repo root |
| Docs tab is empty with `builder: external` | Docs never generated or publisher not configured | Generate docs in CI and configure the matching publisher |
| Docs disappear after pod restart | `publisher.type: local` outside evaluation | Switch to S3/GCS/Azure Blob and generate docs in CI |
| MkDocs build error | Missing `mkdocs-techdocs-core` plugin | Add `plugins: - techdocs-core` to `mkdocs.yml` and ensure the package is installed |

---

## References

- [Backstage TechDocs documentation](https://backstage.io/docs/features/techdocs/)
- [TechDocs configuration reference](https://backstage.io/docs/features/techdocs/configuration)
- [TechDocs CLI](https://backstage.io/docs/features/techdocs/cli)
- [MkDocs documentation](https://www.mkdocs.org/)
