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

---

## IaC templates in the composition model

An IaC template execution produces the same catalog artifacts as a software template: a repository, a `catalog-info.yaml`, and a registered `Location` entity — except the entity kind is `Resource` rather than `Component`. That resource entity appears in the catalog, carries ownership metadata, and can have annotations that attach it to observability plugins (Grafana dashboards scoped to the provisioned infrastructure, for example).

The resource entity is the catalog's representation of the infrastructure. It is queryable via the Relations API, visible on dependency graphs, and subject to the same RBAC rules as any other entity.

### Template-of-templates: app + infra as a single Golden Path

An IaC template can be a step inside a software template. The software template orchestrates both: it scaffolds the application repository and invokes the IaC template (or an equivalent scaffolder action) to provision the required infrastructure in the same workflow. The developer fills in one form; both a `Component` entity and a `Resource` entity emerge, linked via the `dependsOn` relation in `catalog-info.yaml`.

This is the mechanism behind a complete [Golden Path](/platform/concepts/golden-paths): the template encodes the organization's standard for what a production-ready service looks like — application code, CI/CD configuration, and infrastructure — as a single self-service operation.

#### Declaring the `dependsOn` link

The link between Component and Resource is a standard Backstage relation, written into the Component's `catalog-info.yaml` under `spec.dependsOn[]`. The template emits it as part of the scaffolded file — the developer never writes it by hand.

```yaml
# catalog-info.yaml emitted by the software template for the Component
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: payment-service
  annotations:
    backstage.io/kubernetes-label-selector: 'app=payment-service'
    gitlab.com/project-slug: my-group/payment-service
spec:
  type: service
  lifecycle: production
  owner: checkout-team
  system: checkout-system
  dependsOn:
    - resource:default/payment-db        # provisioned by the IaC template step
    - resource:default/payment-queue
```

The referenced Resources are produced by the IaC template invocation inside the same workflow. Once both entities are registered, the Component's overview page shows the dependency graph; the Resources show the reverse `dependencyOf` relation. Catalog providers, RBAC rules, and observability plugins all see the link.

The format is `<kind>:<namespace>/<name>` (lowercase), matching Backstage's entity reference convention.

---

For the three-layer model that governs how the resulting entities connect to plugins, see [Composing a Portal](./portal-composition.md). For the software template side of this pattern, see [Software Templates](./software-template.md).

---

For further assistance, refer to your platform's documentation or [contact us](https://platform.vee.codes/support/).
