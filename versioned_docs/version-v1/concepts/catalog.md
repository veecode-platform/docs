---
sidebar_position: 1
sidebar_label: Catalog 
title: Catalog
---

The **Software Catalog** is the central hub of DevPortal — a registry of all software components, APIs, infrastructure resources, systems, groups, and users in your organization. It is built on Backstage's catalog model and covers all entity kinds that Backstage supports.

---

## **Entity Kinds**

The catalog tracks the following entity kinds (configured in `catalog.rules`):

| Kind | Description |
| --- | --- |
| **Component** | A software component: service, website, library, etc. |
| **API** | An API definition (OpenAPI, AsyncAPI, GraphQL, gRPC) |
| **Resource** | Infrastructure resources: databases, clusters, environments, etc. |
| **System** | A collection of related components and resources |
| **Template** | A scaffolder template for creating new components |
| **Group** | An organizational unit or team |
| **User** | An individual user |
| **Location** | A pointer to external catalog definition files |

All entities are described in `catalog-info.yaml` files and registered via the catalog import flow or auto-discovery.

---

## **API Specification Formats**

When viewing an API entity, the catalog renders its spec for documentation. Supported spec types include:

- **OpenAPI** (REST APIs — Swagger/OpenAPI 2 or 3)
- **AsyncAPI** (event-driven/message-based APIs)
- **GraphQL** (GraphQL schema definitions)
- **gRPC** (Protobuf-based APIs)

Each API entity displays its endpoints, request/response schemas, and authentication details as defined in the spec file. The catalog does not provide a live "try it out" sandbox — it is a documentation and discovery layer.

---

## **Navigating the Catalog**

To access the catalog, click on the **"Catalog"** tab in the navigation bar. You can use filters to refine your search by name, kind, owner, or tags. Once you select an item, a brief description will be displayed.

---

### **Viewing APIs**

Selecting an API from the catalog provides a detailed overview, including:

- Endpoints, request and response parameters (from the spec file).
- Authentication requirements.
- Spec format (OpenAPI, AsyncAPI, gRPC, etc.).

The catalog supports **OpenAPI, AsyncAPI, GraphQL, and gRPC** specification formats. Documentation is always derived from the registered spec file.

### **Viewing Templates**

Selecting a Template entity in the catalog shows the template's description, metadata, and links to the scaffolder wizard. To create a component from it, click **"Choose"** to launch the scaffolder. See [Software Templates](./software-template.md) for details.

### **Viewing Components**

Choosing a component from the catalog displays an overview that includes:

- Its source code repository.
- Any associated plugins configured via catalog annotations.
- Links to related entities (owner, system, dependencies).

### **Viewing Resources**

Resources represent infrastructure entities such as clusters, databases, and environments. DevPortal uses the `Resource` kind for environments and clusters in the [Environment/Cluster journey](./environment-cluster-journey-veecode-platform.md).

---

### **Accessing Documentation**

For components with TechDocs configured, a **"Documentation"** tab is available directly on the entity page, eliminating the need to switch between tools.

---

### **Registering Existing Components**

To add a pre-existing component to the catalog:

1. Click **"Register an Existing Component"** on the Create page.
2. Provide the URL of your repository.
3. Link to an entity file such as `catalog-info.yaml`. The wizard will:
   - Analyze the file for entities.
   - Add valid entities to the DevPortal catalog.
   - Suggest a Pull Request for repositories missing the required configuration.

---

## **Get Started with a Video Tutorial**

<center>
<iframe  src="https://www.youtube.com/embed/IlRLyzTO0sY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</center>
