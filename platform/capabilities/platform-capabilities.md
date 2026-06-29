---
sidebar_position: 1
sidebar_label: Platform Capabilities
title: Platform Capabilities
---

# Platform Capabilities

An Internal Developer Platform delivers value across four capability layers. The layers are interdependent — an observability layer without a service catalog to anchor dashboards to is just a dashboard tool. Composition is what makes the platform more than the sum of its parts.

For a concrete walkthrough of how these layers come together in a running portal, see [Composing a Portal](/platform/concepts/portal-composition).

---

## Developer Experience Layer

**The problem it solves:** Developers spend time on undifferentiated work — figuring out how to start a new project, how to structure CI, where to find documentation for a dependency. Each team invents its own answer.

**How DevPortal realizes it:**
- **Service catalog** — a single place to discover every service, API, and resource in the organization, with its ownership, lifecycle, and documentation
- **Software templates** — opinionated project bootstraps that encode the organization's [Golden Paths](/platform/concepts/golden-paths) so the right way is also the easiest way
- **TechDocs** — documentation lives in the service repository and renders inside the portal, versioned with the code and always in context

The catalog is the foundation everything else builds on. Without a populated catalog, plugins have no entities to attach to.

---

## Application Lifecycle Layer

**The problem it solves:** Developers context-switch between the portal (which knows about the service) and CI/CD tools (which know about its builds). The service and its pipeline are the same thing, but they live in different places.

**How DevPortal realizes it** (via plugins):
- **[GitHub Actions](/devportal/plugins/bundled/github-actions)** — CI run history on the entity page
- **[GitHub Workflows](/devportal/plugins/GitHubWorkflows)** — manual workflow triggers from the entity overview
- **[GitLab Pipelines](/devportal/plugins/GitLabPipelines)** — pipeline list and job triggers for GitLab CI
- **[Jenkins](/devportal/plugins/bundled/jenkins)** — build status for Jenkins pipelines
- **[Azure DevOps](/devportal/plugins/bundled/azure-devops)** — Azure Pipelines and Pull Requests on entity pages

Each plugin connects to the entity via an annotation in `catalog-info.yaml`. The entity declares which project it maps to in the CI tool; the plugin reads that and surfaces the relevant data.

---

## Infrastructure Abstraction Layer

**The problem it solves:** Infrastructure is opaque to application developers. They don't know what Kubernetes cluster their service runs on, what secrets it uses, or what version is deployed. That knowledge lives with the platform team or in separate tools.

**How DevPortal realizes it** (via plugins):
- **[Kubernetes](/devportal/plugins/kubernetes)** — live pod status, deployment rollout, and logs for the service's workloads
- **[Vault](/devportal/plugins/vault)** — secrets metadata visible on the entity page (paths and keys, not values)
- **IaC templates** — infrastructure provisioned through the portal's scaffolder, so infrastructure creation follows the same Golden Path as application creation

The Kubernetes plugin is the most direct bridge: a service entity with the right label selector annotation shows exactly which pods belong to it and their current health.

---

## Observability Layer

**The problem it solves:** Metrics, logs, and alerts live in separate tools. A developer responding to an incident has to pivot between the portal (to understand the service), Grafana (to see metrics), and potentially a code quality tool to understand technical debt.

**How DevPortal realizes it** (via plugins):
- **[Grafana](/devportal/plugins/grafana)** — dashboards scoped to the entity, embedded in the overview
- **[SonarQube](/devportal/plugins/Sonar)** — code quality metrics (bugs, coverage, vulnerabilities) on the entity's Code Quality tab

The `grafana/dashboard-selector` annotation connects the entity to its dashboards by tag. The `sonarqube.org/project-key` annotation connects it to its SonarQube project. Each connection is explicit and per-entity — one service's dashboards don't bleed into another's.

---

## How the layers compose

A portal with only the Developer Experience layer is useful for onboarding and discovery. Add the Application Lifecycle layer and developers can trigger deployments from the same page where they read service documentation. Add Infrastructure Abstraction and they can see pod health without a kubectl context. Add Observability and they can correlate a deployment with a metrics spike — all within the service entity.

The question for every plugin evaluation: **which context-switch does this eliminate, and for which team?**

See [Composing a Portal](/platform/concepts/portal-composition) for a step-by-step example.
