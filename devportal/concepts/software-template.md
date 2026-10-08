---
sidebar_position: 3
sidebar_label: Software Templates 
title: Software Templates
---

# Software Templates

## How to Create Components Using Templates in the Developer Portal

This guide explains how to run scaffolder templates in the Developer Portal to create components or projects with a predefined structure.

DevPortal 3.x ships no templates, so the [2.x infrastructure-as-code templates](/devportal/v2/concepts/iac-template) are not part of 3.x. The Create page is empty on a default install. Your platform team registers templates, and each template defines its own form, steps, and outputs.

---

### Overview of the Template Creation Tool

The **template creation feature** helps developers quickly create projects or components by providing a standardized, pre-configured base. This approach reduces the time spent on setup, allowing developers to focus on specific tasks.

The specific form fields you see depend entirely on the template selected — each template defines its own parameters. A default install has no publish actions, so templates that create repositories need a scaffolder module installed from Marketplace first (see [Available Actions](./available-actions.md)).

---

## Step-by-Step Guide

### **Accessing the Tool**

1. Log in to the **Developer Portal**.
2. From the homepage, click the **"Create"** tab in the sidebar menu.
3. Explore the list of project templates to find the one that best fits your needs. On a default install the list is empty until your platform team adds templates.

---

### **Registering an Existing Component (Optional)**

If you have an existing component to add:

1. Click **"Register an Existing Component"**.
2. Provide the **URL** of your repository.
3. Link to an entity file such as `catalog-info.yaml`. The wizard will analyze the file for entities and add valid entities to the DevPortal catalog.

---

### **Choosing a Template**

1. Open the **Templates Page**.
2. Use filters (favorites, tags, names) to search templates.
3. Select a template to view its description, source code repository link, and documentation.
4. Click **"Choose"** to begin configuration.

---

### **Configuring the Template**

Each template defines its own form steps and fields. Common categories of information that templates ask for include project information (name, description, owner) and repository details (provider, organization, repository name, visibility). The exact fields depend on the template. Review the template's description and documentation before starting.

---

### **Creating the Component**

1. Review all configurations on the **Overview Page**.
2. Ensure all inputs are accurate, then click **"Create"**.
3. Monitor the **creation log** for real-time updates.

Upon completion, open the generated cataloged component and fetch the source for further development.

---

## How to add your own templates

Templates are registered like any other catalog entity through a catalog location. On the local stack, add a file or URL location as described in [Add catalog entities](../installation-guide/docker-local/custom-catalog.md). On Kubernetes, set `catalog.locations` in the chart values under `upstream.backstage.appConfig`. See [Writing Templates](./writing-templates.md) to author one.

---

## Troubleshooting

- Restart builds or review logs to resolve issues during the process.

---

## Why Templates Matter

Templates are the primary mechanism through which [Golden Paths](/platform/concepts/golden-paths) are delivered in the DevPortal. Rather than a developer searching for the "right" way to start a new service, a well-crafted template makes the right way the easiest way.

- **Self-service:** Teams spin up new services without opening a ticket to the platform team.
- **Standardization:** Every project starts from the same base — same file structure, same pipeline, same observability hooks.
- **Compliance by default:** Security and governance requirements are built into the template rather than enforced after the fact.
- **Scalability:** Adding a new team or project type means adding a template, not duplicating runbooks.

---

## What template execution actually produces

Running a template executes a sequence of steps that leaves a durable trail in the catalog:

1. **Workspace content from the template's actions** — fetch and file actions scaffold files; publish actions push them to a repository when the deployment has an SCM integration configured.
2. **A `catalog-info.yaml` for the new entity** — the entity descriptor. It declares the component kind, owner, system, and the annotations that bind the entity to plugins.
3. **A Location entity registered in the catalog** — the scaffolder registers a `Location` pointing at the new `catalog-info.yaml` only when the template ends with a publish step followed by `catalog:register`.

The last point is the key design decision for template authors. A template that emits no annotations produces a catalog entry with no plugin tabs. A template that emits the right annotations produces a component that already has its CI tab, Kubernetes tab, and code-quality cards populated, provided those plugins are loaded and the backends are configured. The developer gets those plugin tabs and cards automatically; the platform team controls what "automatically" means.

For the full picture of how load, context, and backend interact, see [Composing a Portal](./portal-composition.md).

---

## References

- [Writing Templates](./writing-templates.md) — author your own templates from scratch
- [Available Actions](./available-actions.md) — the 16 actions on a default install
- [Composing a Portal](./portal-composition.md) — how plugins attach to entities via the three-layer model
- [The Catalog](./catalog.md) — entity kinds, ownership, and how `catalog-info.yaml` is processed
- [Golden Paths](/platform/concepts/golden-paths) — the platform strategy that templates implement
