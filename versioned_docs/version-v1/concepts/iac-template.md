---
sidebar_position: 4
sidebar_label:  Infrastructure as Code (IaC) Templates 
title:  Infrastructure as Code (IaC) Templates
---

This guide explains how **Infrastructure as Code (IaC) templates** work in DevPortal, enabling your team to provision infrastructure through a self-service scaffolder workflow rather than running tools manually.

---

### Step 1: **Understand the Basics**

IaC templates in DevPortal are scaffolder templates (like software templates) that generate infrastructure repositories — typically containing Terraform, CloudFormation, Pulumi, or similar IaC files. Provisioning happens through the CI/CD pipeline that the template wires up, not by the developer running infrastructure tools locally.

The typical flow is:
1. Developer fills in the template form (resource sizes, region, network settings, etc.).
2. The scaffolder creates a new repository with the IaC configuration files.
3. A CI/CD pipeline (GitHub Actions, GitLab CI, etc.) is triggered and runs the infrastructure tool (e.g., `terraform apply`).
4. The resulting infrastructure resource is registered in the catalog as a `Resource` entity.

---

### Step 2: **Access Available Templates**

1. Log in to your **Developer Portal**.
2. Navigate to the **Templates Page** and explore the list of preconfigured IaC templates available.

---

### Step 3: **Select the Appropriate Template**

- Review the available templates and select the one that aligns with your project needs.
- Consider resource types (e.g., virtual machines, storage), deployment scale, and additional infrastructure requirements.

---

### Step 4: **Customize the Template**

1. Read the documentation associated with the chosen template.
2. Fill in the form parameters, which typically include:
    - **Resource sizes:** CPU, memory, or storage requirements.
    - **Network configurations:** subnets, routing, and security rules.
    - **Security settings:** permissions or encryption protocols.
    - **Repository settings:** provider, owner, repository name, visibility.

---

### Step 5: **Create and Monitor the Pipeline**

1. Review all inputs on the **Overview Page** and click **"Create"**.
2. The scaffolder creates the IaC repository and triggers the CI/CD pipeline.
3. Monitor the creation log in the DevPortal scaffolder UI for real-time updates.
4. Once the pipeline completes, the infrastructure resource may be registered in the catalog automatically (depending on the template) or require manual registration.

:::info
You do not need to run `terraform apply`, `aws cloudformation deploy`, or any other infrastructure CLI locally. The CI/CD pipeline configured by the template handles deployment in your target environment.
:::

---

### Step 6: **Validate the Infrastructure**

- Verify that the deployed infrastructure matches your requirements.
- Test the environment for functionality, security, and stability using your standard validation tooling.

---

### Tips for Using IaC Templates

- **Leverage Version Control:** All IaC files are stored in Git — use PRs and code review for infrastructure changes.
- **Promote Collaboration:** Developers and operations teams co-own the generated repository.
- **Document Changes:** The catalog entity for the resource tracks ownership and metadata; keep it updated.

---

### Benefits of IaC Templates

1. **Consistency:** Eliminate configuration drift by ensuring uniform deployments.
2. **Scalability:** Easily replicate infrastructure to meet growing demands.
3. **Self-Service:** Developers can provision infrastructure without waiting for manual ops work.

By adopting IaC templates, you enable your team to create and manage infrastructure efficiently through the portal, with CI/CD as the enforcement layer.

For further assistance, refer to your platform's documentation or [contact us](https://platform.vee.codes/support/).
