---
sidebar_position: 3
sidebar_label: Software Templates 
title: Software Templates
---

## How to Create Components Using Templates in the Developer Portal

This guide provides detailed steps for leveraging the **template creation feature** in the Developer Portal, enabling you to develop components or projects with a predefined structure efficiently.

---

### Overview of the Template Creation Tool

The **template creation feature** helps developers quickly create projects or components by providing a standardized, pre-configured base. This approach reduces the time spent on setup, allowing developers to focus on specific tasks.

Templates include options for linking repositories, integrating databases, and configuring CI/CD pipelines, promoting a seamless workflow from creation to deployment. The specific form fields you see depend entirely on the template selected — each template defines its own parameters.

---

## Step-by-Step Guide

### **Accessing the Tool**

1. Log in to the **Developer Portal**.
2. From the homepage, click the **"Create"** tab in the sidebar menu.
3. Explore the list of project templates to find the one that best fits your needs.

---

### **Registering an Existing Component (Optional)**

If you have a pre-existing component to add:

1. Click **"Register an Existing Component"**.
2. Provide the **URL** of your repository, e.g., GitHub.
3. Link to an entity file such as `catalog-info.yaml`. The wizard will:
    - Analyze the file for entities.
    - Add valid entities to the DevPortal catalog.
    - Suggest a Pull Request for repositories missing the required configuration.

---

### **Choosing a Template**

1. Open the **Templates Page**.
2. Use filters (favorites, tags, names) to search templates.
3. Select a template to view its:
    - Description.
    - Source code repository link.
    - Documentation.
4. Click **"Choose"** to begin configuration.

---

### **Configuring the Template**

Each template defines its own form steps and fields. Common categories of information that templates ask for include:

- **Project information:** name, description, owner.
- **Repository details:** provider (GitHub, GitLab, etc.), organization, repository name, visibility.
- **CI/CD pipeline setup:** target branch, pipeline configuration.
- **Database or infrastructure options:** where applicable, per-template.

The exact fields depend on the template. Review the template's description and documentation before starting.

---

### **Creating the Component**

1. Review all configurations on the **Overview Page**.
2. Ensure all inputs are accurate, then click **"Create"**.
3. Monitor the **creation log** for real-time updates.

Upon completion:

- Access the generated cataloged component.
- Retrieve the source code for further development.

---

## Troubleshooting

- Restart builds or review logs to resolve issues during the process.

---

## Why Templates Matter

Templates are the primary mechanism through which [Golden Paths](/platform/concepts/golden-paths) are delivered in the DevPortal. Rather than a developer searching for the "right" way to start a new service, a well-crafted template makes the right way the easiest way.

- **Self-service:** Teams spin up new services without opening a ticket to the platform team.
- **Standardization:** Every project starts from the same base — same Dockerfile structure, same CI pipeline, same observability hooks.
- **Compliance by default:** Security and governance requirements are built into the template rather than enforced after the fact.
- **Scalability:** Adding a new team or project type means adding a template, not duplicating runbooks.

---

## What template execution actually produces

Running a template creates more than a project skeleton. The scaffolder executes a sequence of steps that leaves a durable trail in the catalog:

1. **A new repository in the configured SCM** — the target provider (GitHub, GitLab, etc.) and organization are set by the configuration profile loaded at startup. The scaffolder uses those credentials; the developer doesn't configure SCM access per template.

2. **A `catalog-info.yaml` committed to that repository** — this is the entity descriptor. It declares the component kind, owner, system, and — critically — the annotations that bind the entity to plugins.

3. **A Location entity registered in the catalog** — the scaffolder registers a `Location` pointing at the new `catalog-info.yaml`. From that moment the new component appears in the portal catalog without any manual registration step.

4. **An entity wired for plugins, RBAC, and TechDocs** — the component is visible immediately, and the tabs and cards that appear on it are determined by what annotations the template wrote into `catalog-info.yaml`.

The last point is the key design decision for template authors. A template that emits no annotations produces a catalog entry with no plugin tabs. A template that emits the right annotations produces a component that already has its CI tab, Kubernetes tab, and Grafana cards populated — before the developer pushes a single commit.

### The annotation decision happens at template authoring time

When a developer runs a template, they don't see annotation fields. Those are fixed by the template. The platform team decides which annotations to include when they write the template, and every component created from that template inherits the same plugin surface.

Example: a template for a Node.js API service might emit:

```yaml
metadata:
  annotations:
    backstage.io/kubernetes-label-selector: 'app={{ values.componentId }}'
    gitlab.com/project-slug: '{{ values.group }}/{{ values.componentId }}'
    backstage.io/techdocs-ref: dir:.
```

Every component created from that template will have a Kubernetes tab, a GitLab CI tab, and TechDocs — provided those plugins are loaded and the backends are configured. The developer gets those surfaces automatically; the platform team controls what "automatically" means.

For the full picture of how load, context, and backend interact, see [Composing a Portal](/platform/concepts/portal-composition).

---

## References

- [Writing Templates](./writing-templates) — author your own templates from scratch
- [Composing a Portal](/platform/concepts/portal-composition) — how plugins attach to entities via the three-layer model
- [The Catalog](/devportal/v1/concepts/catalog) — entity kinds, ownership, and how `catalog-info.yaml` is processed
- [Golden Paths](/platform/concepts/golden-paths) — the platform strategy that templates implement

---

If additional help is needed, contact the support team or watch the video.
<center>
<iframe src="https://www.youtube.com/embed/2KX8fFaoIAk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</center>
