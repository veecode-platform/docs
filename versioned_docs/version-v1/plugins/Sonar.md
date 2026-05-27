---
sidebar_position: 18
sidebar_label: SonarQube
title: SonarQube
---

# SonarQube Plugin

The SonarQube plugin for DevPortal displays code quality metrics — bugs, vulnerabilities, test coverage, and duplications — directly in the component catalog. It connects to your SonarQube instance and surfaces key insights inside Backstage.

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
| `backstage-community-plugin-sonarqube` | Frontend — entity card and Code Quality tab |
| `backstage-community-plugin-sonarqube-backend-dynamic` | Backend — SonarQube API proxy |
| `backstage-community-plugin-scaffolder-backend-module-sonarqube-dynamic` | Optional — scaffolder actions for SonarQube |

All three are preloaded in the DevPortal image and **disabled by default**. No image rebuild is needed.

---

## Prerequisites

- A running SonarQube instance (community, self-hosted, or SonarCloud)
- A SonarQube API key (user token or analysis token) with read access

---

## Enabling the plugin

Add the following to your `dynamic-plugins.yaml`:

```yaml
plugins:
  - package: ./dynamic-plugins/dist/backstage-community-plugin-sonarqube-backend-dynamic
    disabled: false

  - package: ./dynamic-plugins/dist/backstage-community-plugin-sonarqube
    disabled: false
    pluginConfig:
      dynamicPlugins:
        frontend:
          backstage-community.plugin-sonarqube:
            entityTabs:
              - path: /code-quality
                title: Code Quality
                mountPoint: entity.page.code-quality
                config:
                  if:
                    allOf:
                      - isSonarQubeAvailable
            mountPoints:
              - mountPoint: entity.page.code-quality/cards
                importName: SonarQubeRelatedEntitiesOverview
                config:
                  layout:
                    gridColumn: "1 / -1"
                  if:
                    allOf:
                      - isSonarQubeAvailable
              - mountPoint: entity.page.overview/cards
                importName: EntitySonarQubeCard
                config:
                  layout:
                    gridColumnEnd:
                      lg: span 4
                      md: span 6
                      xs: span 12
                  if:
                    allOf:
                      - isSonarQubeAvailable

  # Optional: scaffolder actions
  - package: ./dynamic-plugins/dist/backstage-community-plugin-scaffolder-backend-module-sonarqube-dynamic
    disabled: false
```

Restart DevPortal after saving. Via the Marketplace UI you can click **Enable** instead of editing YAML manually.

---

## App configuration

Add SonarQube connection details to `app-config.yaml`.

### Single instance

```yaml
sonarqube:
  baseUrl: ${SONARQUBE_BASE_URL}
  apiKey: ${SONARQUBE_API_KEY}
```

`baseUrl` defaults to `https://sonarcloud.io` if omitted.

### Multiple instances

```yaml
sonarqube:
  instances:
    - name: default
      baseUrl: ${SONARQUBE_BASE_URL}
      apiKey: ${SONARQUBE_API_KEY}
    - name: specialProject
      baseUrl: ${SONARQUBE_BASE_URL_2}
      apiKey: ${SONARQUBE_API_KEY_2}
```

The valid top-level fields are `baseUrl`, `externalBaseUrl`, `apiKey`, and `instances`. There is no `instanceKey` field — that field does not exist in the schema and is silently ignored if present.

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

The project key value must match the project key in your SonarQube instance. The SonarQube card and Code Quality tab only appear on entities where `isSonarQubeAvailable` is true (i.e., where this annotation is set).
