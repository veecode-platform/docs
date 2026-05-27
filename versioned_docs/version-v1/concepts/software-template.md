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

## Benefits of Using Templates

- **Efficiency:** Predefined configurations save time.
- **Standardization:** Ensures consistency across projects.
- **Scalability:** Easily replicable infrastructure for new components.
- **Integration:** Simplifies linking to CI/CD and database systems.

You now have a comprehensive understanding of the **template creation feature** in the Developer Portal. By using this tool, you can streamline project setup and focus on development tasks.

If additional help is needed, contact the support team or watch the video.
<center>
<iframe src="https://www.youtube.com/embed/2KX8fFaoIAk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</center>
