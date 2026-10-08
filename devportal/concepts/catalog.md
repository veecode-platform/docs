---
sidebar_position: 1
sidebar_label: Catalog 
title: Catalog
---

The **Software Catalog** is the central hub of DevPortal — a registry of software components, APIs, infrastructure resources, systems, groups, and users in your organization. It is built on the Backstage catalog model described at [Backstage software catalog](https://backstage.io/docs/features/software-catalog/).

---

## Why the catalog is foundational

The catalog is not an optional feature — it is what the rest of the portal binds to.

- **Plugins are context-aware via annotations.** A loaded plugin adds nothing visible until it finds an entity carrying the right annotation. Without entities in the catalog, plugins have no subject to attach to. (See [Composing a Portal](./portal-composition.md) for the full three-layer model.)
- **Templates produce catalog entries.** Every component a team creates through the scaffolder registers a `catalog-info.yaml`, which is how the portal learns the new service exists.

This means Day-0 work is catalog work: register your services, APIs, and infrastructure before enabling plugins or configuring backends.

---

## **Entity Kinds**

The image's default catalog rules allow `Component`, `System`, `Group`, `Resource`, `Location`, `Template`, and `API` entities. A file location rejects `User` entities unless its `rules` allow `User`.

| Kind | Description |
| --- | --- |
| **Component** | A software component: service, website, library, etc. |
| **API** | An API definition |
| **Resource** | Infrastructure resources: databases, clusters, environments, etc. |
| **System** | A collection of related components and resources |
| **Template** | A scaffolder template for creating new components |
| **Group** | An organizational unit or team |
| **User** | An individual user (needs a location rule on file locations) |
| **Location** | A pointer to external catalog definition files |

All entities are described in `catalog-info.yaml` files and registered through catalog locations. To add entities on the local stack, see [Add catalog entities](../installation-guide/docker-local/custom-catalog.md).

There is no demo catalog in 3.x. The entities present on a default install are the Marketplace `Package` and `Plugin` entities. Catalog providers for organization data and source control come from Marketplace modules plus explicit configuration.

---

## **API Specification Formats**

When viewing an API entity, the catalog renders its spec for documentation through the Backstage API definition card. Each API entity displays its endpoints, request/response schemas, and authentication details as defined in the spec file. The catalog is a documentation and discovery layer: it does not provide a live "try it out" sandbox.

---

## **Navigating the Catalog**

To access the catalog, click on the **"Catalog"** tab in the navigation bar. You can use filters to refine your search by name, kind, owner, or tags. Once you select an item, a brief description will be displayed.

---

### **Viewing APIs**

Selecting an API from the catalog provides a detailed overview, including endpoints, request and response parameters from the spec file, and authentication requirements. See [How to Use the API Catalog](./API%20Catalog/Howto-catalog.md).

### **Viewing Templates**

Selecting a Template entity in the catalog shows the template's description, metadata, and links to the scaffolder wizard. To create a component from it, click **"Choose"** to launch the scaffolder. See [Software Templates](./software-template.md) for details.

### **Viewing Components**

Choosing a component from the catalog displays an overview that includes its source code repository, any associated plugins configured through catalog annotations, and links to related entities (owner, system, dependencies).

### **Viewing Resources**

Resources represent infrastructure entities such as clusters, databases, and environments. Filter the catalog by `Kind: Resource` to find them.

---

### **Accessing Documentation**

For components with TechDocs configured, a **"Documentation"** tab is available directly on the entity page, eliminating the need to switch between tools.

---

### **Registering Existing Components**

To add an existing component to the catalog:

1. Click **"Register an Existing Component"** on the Create page.
2. Provide the URL of your repository.
3. Link to an entity file such as `catalog-info.yaml`. The wizard will analyze the file for entities and add valid entities to the DevPortal catalog.

---

## **Get Started with a Video Tutorial**

<center>
<iframe  src="https://www.youtube.com/embed/IlRLyzTO0sY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</center>
