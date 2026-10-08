---
sidebar_position: 18
sidebar_label: SonarQube
title: SonarQube
---

# SonarQube Plugin

Without this plugin, code quality is a concern that lives separately in SonarQube — a dashboard the team checks independently, disconnected from the service entity. Enable the plugin, add `sonarqube.org/project-key` with the project key from your SonarQube instance, and a quality card appears on the entity overview showing bugs, vulnerabilities, coverage, and technical debt for that specific service. Quality is now part of the service's record, not an external afterthought.

The SonarQube plugin displays code quality metrics — bugs, vulnerabilities, test coverage, and duplications — directly in the component catalog.

---

## What is SonarQube?

**SonarQube** is an open-source platform for static code analysis. It detects:

- **Bugs** — errors that can lead to failures
- **Vulnerabilities** — security issues like SQL injection and XSS
- **Code Smells** — non-error code that hinders maintainability
- **Test Coverage** — how much of your code is covered by automated tests
- **Duplications** — repeated blocks of code
- **Technical Debt** — estimated effort to fix detected issues

---

## Plugin packages

| Package | Role |
|---|---|
| `backstage-community-plugin-sonarqube` | Frontend — entity overview card |
| `backstage-community-plugin-sonarqube-backend` | Backend — SonarQube API proxy |
| `backstage-community-plugin-scaffolder-backend-module-sonarqube` | Optional — scaffolder actions for SonarQube |

All three are versioned packages in the active package index and are **not default plugins**. The frontend mounts the `EntitySonarQubeCard` in the entity overview for entities with the SonarQube annotation. Install them from the Marketplace (`sonarqube-catalog-cards` for the cards, `sonarqube-scaffolder-actions` for the scaffolder module) or by package reference.

---

## Prerequisites

- A running SonarQube instance (community, self-hosted, or SonarCloud)
- A SonarQube API key (user token or analysis token) with read access

---

## Enabling the plugin

### Via Marketplace

Install `sonarqube-catalog-cards` (and `sonarqube-scaffolder-actions` if you need the scaffolder actions), then recreate the stack so the installer runs. A plain container restart does not apply a Marketplace selection. See [Configure dynamic plugins for the local stack](../installation-guide/docker-local/custom-plugins.md) for the apply procedure.

### Via the operator file (local stack)

Add the index references to your operator file (`dynamic-plugins.local.yaml`):

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-community-plugin-sonarqube-backend@sha256:bdf9d45d8c73c03be632174a1918c472806cf4bc52966fb3cbe8f98363abd0c5
    disabled: false

  - package: oci://quay.io/veecode/backstage-community-plugin-sonarqube@sha256:8473d9a47b6d198b3a1101a5eacc84434cb4af2134e77e4f2bca8ed08d03acc3
    disabled: false

  # Optional: scaffolder actions
  - package: oci://quay.io/veecode/backstage-community-plugin-scaffolder-backend-module-sonarqube@sha256:ae19e47677c08b8439aface4a37d88b2d475f07bbddd814074d70322d8e61647
    disabled: false
```

### On Kubernetes

Add the same package references under `global.dynamic.plugins` in your chart values.

---

## App configuration

Add the SonarQube connection details where the portal reads its app config — a configuration fragment on the local stack, `upstream.backstage.appConfig` on Kubernetes — with the token passed through an environment variable or a referenced Secret. The index backend config reads the base URL from `SONARQUBE_URL` and the token from `SONARQUBE_TOKEN`.

### Single instance

```yaml
sonarqube:
  baseUrl: ${SONARQUBE_URL}
  apiKey: ${SONARQUBE_TOKEN}
```

`baseUrl` defaults to `https://sonarcloud.io` if omitted.

### Multiple instances

```yaml
sonarqube:
  instances:
    - name: default
      baseUrl: ${SONARQUBE_URL}
      apiKey: ${SONARQUBE_TOKEN}
    - name: specialProject
      baseUrl: ${SONARQUBE_URL_2}
      apiKey: ${SONARQUBE_TOKEN_2}
```

---

## Connecting a component to SonarQube

Add the `sonarqube.org/project-key` annotation in the component's `catalog-info.yaml`:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-api
  annotations:
    github.com/project-slug: my-org/my-api
    sonarqube.org/project-key: my-org_my-api
spec:
  type: service
  owner: user:default/admin
  lifecycle: production
```

The project key value must match the project key in your SonarQube instance. The SonarQube card only appears on entities where this annotation is set.

---

## References

- [SonarQube plugin (upstream README)](https://github.com/backstage/community-plugins/tree/main/workspaces/sonarqube)
- [CI/CD Plugins](./cicd.md)
