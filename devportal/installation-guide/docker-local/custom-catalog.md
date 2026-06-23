---
sidebar_position: 4
sidebar_label: Custom Catalog
title: Custom Catalog Examples
---

# Custom Catalog Examples

You can populate your DevPortal with custom catalog entities by mounting local catalog files. This is useful for testing, demos, or when you want to manage your catalog locally.

## Understanding Catalog Entities

Backstage catalogs are defined using YAML files (`catalog-info.yaml`) that describe:

- **Components**: Services, libraries, websites
- **APIs**: REST APIs, GraphQL, gRPC
- **Resources**: Databases, S3 buckets, CDNs
- **Systems**: Collections of components
- **Domains**: Business domains or product areas

## Creating a Catalog File

Create a `catalog-info.yaml` file in your project directory:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  description: My awesome microservice
  annotations:
    github.com/project-slug: my-org/my-service
    backstage.io/techdocs-ref: dir:.
spec:
  type: service
  lifecycle: production
  owner: team-a
  system: my-system
  providesApis:
    - my-api
---
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: my-api
  description: REST API for my service
spec:
  type: openapi
  lifecycle: production
  owner: team-a
  system: my-system
  definition: |
    openapi: 3.0.0
    info:
      title: My API
      version: 1.0.0
    paths:
      /health:
        get:
          summary: Health check
          responses:
            '200':
              description: OK
```

## Mounting with Docker Run

Mount your catalog file and configure it in `app-config.local.yaml`:

```bash
docker run --rm --name devportal -d \
  -p 7007:7007 \
  -v $(pwd)/catalog-info.yaml:/app/catalog-info.yaml:ro \
  -v $(pwd)/app-config.local.yaml:/app/app-config.local.yaml:ro \
  veecode/devportal:2.2.0
```

In your `app-config.local.yaml`:

```yaml
catalog:
  locations:
    - type: file
      target: /app/catalog-info.yaml
```

## Mounting with Docker Compose

Create a `docker-compose.yml`:

```yaml
services:
  devportal:
    image: veecode/devportal:2.2.0
    ports:
      - "7007:7007"
    volumes:
      - ./catalog-info.yaml:/app/catalog-info.yaml:ro
      - ./app-config.local.yaml:/app/app-config.local.yaml:ro
```

## Multiple Catalog Files

You can mount multiple catalog files using a directory:

```bash
mkdir -p catalogs
# Create catalogs/components.yaml, catalogs/apis.yaml, etc.
```

Then mount the directory:

```yaml
services:
  devportal:
    image: veecode/devportal:2.2.0
    ports:
      - "7007:7007"
    volumes:
      - ./catalogs:/app/catalogs:ro
      - ./app-config.local.yaml:/app/app-config.local.yaml:ro
```

In `app-config.local.yaml`:

```yaml
catalog:
  locations:
    - type: file
      target: /app/catalogs/components.yaml
    - type: file
      target: /app/catalogs/apis.yaml
```

## Example: Complete System

Here's a complete example with multiple entity types:

```yaml
---
apiVersion: backstage.io/v1alpha1
kind: Domain
metadata:
  name: ecommerce
  description: E-commerce domain
spec:
  owner: platform-team
---
apiVersion: backstage.io/v1alpha1
kind: System
metadata:
  name: checkout-system
  description: Checkout and payment system
spec:
  owner: checkout-team
  domain: ecommerce
---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: payment-service
  description: Payment processing service
spec:
  type: service
  lifecycle: production
  owner: checkout-team
  system: checkout-system
---
apiVersion: backstage.io/v1alpha1
kind: Resource
metadata:
  name: payment-db
  description: Payment database
spec:
  type: database
  owner: checkout-team
  system: checkout-system
```

## Remote Catalog Locations

You can also reference remote catalogs in your `app-config.local.yaml`. The `url` type requires a fully-resolved, direct URL to a single file — glob patterns are not supported by the `url` location type:

```yaml
catalog:
  locations:
    # Single file from a GitHub repository
    - type: url
      target: https://github.com/my-org/my-repo/blob/main/catalog-info.yaml
```

To discover catalog files across many repositories automatically, use the GitHub or GitLab catalog provider (activated via the `github` or `gitlab` preset in `VEECODE_PRESETS`, or configured manually in `app-config.local.yaml`). For example, using the GitHub provider in `app-config.local.yaml`:

```yaml
catalog:
  providers:
    github:
      my-org:
        organization: my-org
        catalogPath: /catalog-info.yaml
        filters:
          branch: main
        schedule:
          frequency:
            minutes: 30
          timeout:
            minutes: 3
```

## Replacing vs adding to the demo catalog

The default DevPortal image ships with demo entities registered via `/app/examples/` in `app-config.production.yaml` (see [Docker Run — What's in the demo catalog](./intro.md#whats-in-the-demo-catalog)). Backstage merges `catalog.locations[]` **additively** across config layers, so understanding the consequence matters:

**Adding alongside the demo (the common case):** Anything you put in `app-config.local.yaml` under `catalog.locations[]` is appended to the demo locations. Both sets will appear in the portal. This is what every example in this page does, and it's almost always what you want for a first contact.

**Removing the demo entirely:** You can't suppress an entry from a lower layer via the local config — `catalog.locations[]` does not support "remove this." The only path is to mount a replacement `app-config.production.yaml` that omits the demo locations:

```bash
# 1. Extract the existing production yaml as a starting point
docker cp devportal:/app/app-config.production.yaml ./app-config.production.yaml

# 2. Edit it — remove the /app/examples/* entries from catalog.locations
#    Keep everything else (baseUrl, CORS, auth, RBAC paths, etc.)

# 3. Mount your edited version on the next run
docker run --rm -d -p 7007:7007 \
  -v $(pwd)/app-config.production.yaml:/app/app-config.production.yaml:ro \
  veecode/devportal:2.2.0
```

:::warning
Mounting your own `app-config.production.yaml` replaces the file entirely. Make sure you start from the version in the image you're actually using — values change between releases. Re-extract after every image upgrade.
:::

## Next Steps

- [Custom App Configuration](./custom-config.md)
- [Configure Dynamic Plugins](./custom-plugins.md)
- [Backstage Catalog Documentation](https://backstage.io/docs/features/software-catalog/)
