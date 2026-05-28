---
sidebar_position: 10
sidebar_label: Tech Docs
title: Tech Docs
---

# TechDocs

TechDocs is preinstalled and active — it doesn't need to be enabled. The question is whether your services are using it. Without the `backstage.io/techdocs-ref` annotation and a `mkdocs.yml` in the repository, the Docs tab is absent from the entity. With both in place, documentation for the service is browsable inside the portal, versioned with the code, and always in sync with the current state of the service — not in a separate Confluence space that drifts.

TechDocs is a **docs-as-code** system built into Backstage. Documentation lives as Markdown files in your source repository and is rendered inside DevPortal. There is no in-portal editor, "New Page" button, or "Publish" button — content is written, committed, and built from the repository.

---

## How it works

1. A repository contains a `mkdocs.yml` configuration file and a `docs/` directory with Markdown content.
2. The `catalog-info.yaml` for the component carries a `backstage.io/techdocs-ref` annotation pointing to the docs source.
3. When a user opens the **Docs** tab in DevPortal, TechDocs builds (or serves pre-built) documentation using MkDocs.

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

TechDocs requires a **builder** (how docs are generated) and a **publisher** (where generated docs are stored). The default configuration uses `local` for both, which is suitable for local development but not recommended for production.

```yaml
# app-config.yaml (default — suitable for development only)
techdocs:
  builder: 'local'
  generator:
    runIn: 'local'
  publisher:
    type: 'local'
```

With `builder: 'local'` and `publisher: 'local'`, DevPortal regenerates docs on demand and stores them in the container's local filesystem. **Docs are lost when the pod restarts.**

### Local builder toolchain requirement

When `builder: 'local'` and `generator.runIn: 'local'` are set, the DevPortal container runs `mkdocs` directly. The container image includes the required Python toolchain. If you are running DevPortal outside the official image, install:

```bash
pip install mkdocs mkdocs-techdocs-core
```

---

## Production setup: external builder + cloud storage

For production deployments, generate docs in CI and store them in a cloud bucket. This avoids per-request generation overhead and persists docs across restarts.

### Step 1: Generate docs in CI

Add a step to your CI pipeline using the `techdocs-cli`:

```bash
npx @techdocs/cli generate --source-dir . --output-dir ./site
npx @techdocs/cli publish --publisher-type awsS3 --storage-name my-techdocs-bucket --entity default/Component/my-api
```

### Step 2: Configure an external publisher

#### Amazon S3

```yaml
techdocs:
  builder: 'external'
  publisher:
    type: 'awsS3'
    awsS3:
      bucketName: ${TECHDOCS_S3_BUCKET_NAME}
      region: ${AWS_REGION}
      # credentials: use IAM role or AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY env vars
```

#### Google Cloud Storage

```yaml
techdocs:
  builder: 'external'
  publisher:
    type: 'googleGcs'
    googleGcs:
      bucketName: ${TECHDOCS_GCS_BUCKET_NAME}
      # credentials: use Application Default Credentials or set GOOGLE_APPLICATION_CREDENTIALS
```

#### Azure Blob Storage

```yaml
techdocs:
  builder: 'external'
  publisher:
    type: 'azureBlobStorage'
    azureBlobStorage:
      containerName: ${TECHDOCS_AZURE_CONTAINER_NAME}
      credentials:
        accountName: ${AZURE_ACCOUNT_NAME}
        accountKey: ${AZURE_ACCOUNT_KEY}
```

With `builder: 'external'`, DevPortal only reads from the bucket — it does not attempt to generate docs itself.

---

## Static plugin status

TechDocs is a **static plugin** in DevPortal — the frontend and backend are compiled into the base image and always active. No entry in `dynamic-plugins.yaml` is needed to enable TechDocs. Configuration in `app-config.yaml` is sufficient.

---

## Common issues

| Symptom | Likely cause | Fix |
|---|---|---|
| Docs tab shows "No docs found" | Missing `mkdocs.yml` or `docs/index.md` | Add `mkdocs.yml` and at least one Markdown file under `docs/` |
| Docs tab shows "No docs found" | Missing or wrong `backstage.io/techdocs-ref` annotation | Check annotation value — use `dir:.` for docs at repo root |
| Docs disappear after pod restart | `publisher.type: local` in production | Switch to S3/GCS/Azure Blob and generate docs in CI |
| MkDocs build error | Missing `mkdocs-techdocs-core` plugin | Add `plugins: - techdocs-core` to `mkdocs.yml` and ensure the package is installed |

---

## References

- [Backstage TechDocs documentation](https://backstage.io/docs/features/techdocs/)
- [TechDocs CLI](https://backstage.io/docs/features/techdocs/cli)
- [MkDocs documentation](https://www.mkdocs.org/)
