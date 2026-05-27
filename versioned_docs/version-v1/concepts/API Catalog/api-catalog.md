---
sidebar_position: 1
sidebar_label: API Catalog
title: API Catalog
---
The **API Catalog** is the section of the Software Catalog that surfaces API entities — registered API definitions that teams can discover, browse, and document centrally. It enhances resource sharing and simplifies API governance across teams.

---

## Key Features

1. **API Discovery**
    - The **API Catalog** offers centralized access to organizational APIs, with search and filter tools to quickly locate specific APIs.
    - APIs are categorized by kind, owner, system, and tags for easy navigation.

2. **Comprehensive Documentation**
    - Detailed documentation is rendered from the API spec file for each API entity, including endpoints, parameters, response formats, and authentication requirements.
    - Additionally, code samples and tutorials may be available if included in linked TechDocs.

3. **Multiple Spec Formats**
    - The catalog supports **OpenAPI**, **AsyncAPI**, **GraphQL**, and **gRPC** spec formats.
    - You can register multiple API entities (one per version) if you need to maintain multiple versions in the catalog simultaneously. The platform does not manage versioning automatically.

4. **Documentation-Only Viewing**
    - The API catalog is a documentation and discovery layer. It renders spec content for reference — it does not provide a built-in sandbox or live "try it out" execution environment.
    - To test API endpoints, use your external tooling (Postman, curl, etc.) against the actual service.

5. **Access Control via RBAC**
    - Catalog RBAC controls who can *view* API entities in the portal. Assign the `catalog.entity.read` permission to the appropriate roles.
    - The portal does not act as an API gateway and does not enforce authentication on the APIs themselves.

---

## Why Use the API Catalog?

- **Promotes Reuse**: Developers can discover existing APIs, reducing duplication and ensuring consistency across applications.
- **Facilitates Collaboration**: Shared documentation lets teams access and understand APIs without contacting the owning team directly.
- **Increases Productivity**: Spec rendering and search capabilities enable faster onboarding and integration.
- **Improves Governance**: Centralized registration makes it easy to audit which APIs exist, who owns them, and what state they are in.
