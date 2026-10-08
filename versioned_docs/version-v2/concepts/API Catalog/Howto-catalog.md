---
sidebar_position: 2
sidebar_label: API Catalog
title: How to Use the API Catalog
---

Follow this step-by-step guide to effectively utilize the **API Catalog** and streamline your API discovery and integration processes.

---

## **Step-by-Step Instructions**

1. **Access the API Catalog**

    Click on the **"Catalog"** tab in the sidebar, then filter by **Kind: API** to display only API entities.

2. **Explore or Search for APIs:**
    
    Browse the available APIs or use the search bar to find specific ones by name, owner, or tag.
    
3. **Review the Documentation:**
    
    Select an API to open its entity page. Examine the API spec details, including:
    
    - Available endpoints;
    - Expected parameters and responses;
    - Authentication requirements;
    - Code examples and tutorials, if available via TechDocs.

4. **Review API Metadata:**
    
    Check the entity's metadata for ownership, system membership, related components, and lifecycle status. Use this to understand the API's maturity and who to contact for support.
    
5. **Check Related Entities:**
    
    Use the **Relations** panel to navigate to the system, components, or resources that depend on or provide this API.
    
6. **Seek Support When Needed:**
    
    If you encounter issues or have questions, contact the API owner listed in the entity page, or reach out to the DevPortal support team.
    

---

## **Tips for Maximizing Efficiency**

- **Stay Organized:** Bookmark frequently used APIs for quick access.
- **Document Your Integrations:** Keep records of best practices and lessons learned for future reference.
- **Keep Up-to-Date:** Regularly review the catalog for new APIs or updates to existing ones.
- **Register Your APIs:** If your team owns an API, register it in the catalog by adding a `catalog-info.yaml` with `kind: API` and the appropriate `spec.definition`. See the [Catalog concepts page](../catalog.md) for supported spec formats.
