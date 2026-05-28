---
sidebar_position: 2
sidebar_label: Golden Paths
title: Golden Paths
---

# Golden Paths

> "The path of least resistance should be the path of right resistance."

**Golden Paths** (also known as Paved Roads) are opinionated, supported, and automated paths to production for specific types of applications. They are designed to reduce cognitive load and accelerate development by providing a "standard" way of doing things that is pre-configured with best practices.

## Why Golden Paths?

In a complex cloud-native environment, developers often face a paradox of choice: too many tools, too many configurations, and too many ways to deploy. Golden Paths solve this by offering:

- **Reduced Decision Fatigue**: Developers don't need to choose between 10 different CI/CD tools or infrastructure configurations.
- **Built-in Best Practices**: Security, observability, and scalability are baked in from the start.
- **Self-Service**: Teams can spin up a new service without waiting for the platform team.
- **Easier Support**: The platform team can provide better support for a few well-defined paths than for a chaotic mix of technologies.

## Examples

A Golden Path is typically realized through a **[Software Template](/devportal/concepts/software-template)** in the DevPortal.

### 1. Spring Boot on Kubernetes
For backend services, a Golden Path might include:
- A scaffolded Spring Boot application with standard dependencies.
- A pre-configured `Dockerfile`.
- Helm charts for Kubernetes deployment.
- A CI/CD pipeline (e.g., GitHub Actions) that builds, tests, and deploys to a dev environment.
- Integration with SonarQube for code quality.

### 2. React App on S3/CDN
For frontend applications:
- A React/Next.js boilerplate.
- Build scripts optimized for production.
- Infrastructure-as-Code (Terraform) to provision an S3 bucket and CloudFront distribution.
- Automated deployment on merge to `main`.

## Golden Paths vs. Restrictions

Golden Paths are **not** mandatory. Teams can choose to go "off-road" if they have specific needs that the Golden Path doesn't cover. However, going off-road means they take on more responsibility for maintaining their own infrastructure and tooling. The Golden Path is simply the *easiest* and *most supported* way to deliver value.
