---
sidebar_position: 4
sidebar_label: Custom Catalog
title: Add catalog entities to the local stack
---

The local catalog includes Marketplace Package and Plugin entities. Register a catalog file location to add your own entities.

## Catalog entities

The image's default catalog rules allow `Component`, `System`, `Group`, `Resource`, `Location`, `Template`, and `API` entities. A file location rejects `User` entities unless its `rules` allow `User`.

## Create a catalog file

Create `catalog-info.yaml` in the `devportal-local` directory:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: local-quickstart
  description: A component registered from a local catalog file
spec:
  type: service
  lifecycle: experimental
  owner: group:default/admins
```

Add a file location to `app-config.custom.yaml`, the custom fragment from [Add a configuration fragment](./custom-config.md):

```yaml
catalog:
  locations:
    - type: file
      target: /opt/app-root/src/catalog-info.yaml
```

Keep the `catalog-info.yaml` location and add every other location under the same `catalog.locations` key.

Entities from a new file location can take several minutes to appear; search the portal's Catalog page for a component such as `local-quickstart` to check whether it loaded.

## Mount the catalog file

Create `docker-compose.custom-catalog.yaml` in the `devportal-local` directory:

```yaml
services:
  devportal:
    volumes:
      - ./catalog-info.yaml:/opt/app-root/src/catalog-info.yaml:ro
```

Start the local stack with the base Compose file and both overrides:

```bash
docker compose -f docker-compose.yml -f docker-compose.custom-config.yaml -f docker-compose.custom-catalog.yaml up
```

The component appears in the catalog after the backend reads the configured location.

## Register several files

Create a directory for catalog YAML files:

```bash
mkdir -p catalogs
```

Add a second file location with a glob to the same list in `app-config.custom.yaml`:

```yaml
catalog:
  locations:
    - type: file
      target: /opt/app-root/src/catalog-info.yaml
    - type: file
      target: /opt/app-root/src/catalogs/*.yaml
      rules:
        - allow: [User, Group, System, Component, API]
```

Add the directory mount to `docker-compose.custom-catalog.yaml`, next to the `catalog-info.yaml` mount:

```yaml
services:
  devportal:
    volumes:
      - ./catalog-info.yaml:/opt/app-root/src/catalog-info.yaml:ro
      - ./catalogs:/opt/app-root/src/catalogs:ro
```

Restart the stack with the same Compose files to load the new location.

## Example: A complete system

Save this example as `catalogs/system.yaml`. It registers a Group, System, API with an inline OpenAPI definition, and Component:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Group
metadata:
  name: local-team
spec:
  type: team
  children: []
---
apiVersion: backstage.io/v1alpha1
kind: System
metadata:
  name: local-system
spec:
  owner: group:default/local-team
---
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: local-api
spec:
  type: openapi
  lifecycle: experimental
  owner: group:default/local-team
  system: local-system
  definition: |
    openapi: 3.0.0
    info:
      title: Local API
      version: 1.0.0
    paths: {}
---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: local-service
spec:
  type: service
  lifecycle: experimental
  owner: group:default/local-team
  system: local-system
  providesApis:
    - local-api
```

## Load User entities

The glob location above allows `User`, `Group`, `System`, `Component`, and `API` entities in this directory.

Save a User entity as `catalogs/users.yaml`:

```yaml
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: local-user
spec:
  memberOf:
    - local-team
```

The default rules do not include `User`. This entity registers because the glob location allows it.

## Load entities from a URL

Add a `url` location for a public GitHub file to the same list. This file registers its Component without a token:

```yaml
catalog:
  locations:
    - type: file
      target: /opt/app-root/src/catalog-info.yaml
    - type: file
      target: /opt/app-root/src/catalogs/*.yaml
      rules:
        - allow: [User, Group, System, Component, API]
    - type: url
      target: https://github.com/backstage/backstage/blob/master/packages/catalog-model/examples/components/artist-lookup-component.yaml
```

For provider-based discovery across many repositories, see the [integrations guides](../../integrations/integrations.md).

## Continue customizing the local stack

- [Add a configuration fragment](./custom-config.md)
- [Configure dynamic plugins](./custom-plugins.md)
