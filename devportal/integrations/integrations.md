---
sidebar_position: 1
sidebar_label: Auth and Integrations
title: Connect DevPortal to your providers
---

DevPortal 3.x connects to outside systems in three separate ways. Sign-in providers are application configuration. Organization sync and catalog discovery are installable Marketplace modules with their own configuration. Repository access for the catalog and the scaffolder is application configuration under `integrations`.

The three mechanisms are independent. You can use GitHub repositories with Keycloak sign-in, or Microsoft sign-in with GitLab repositories, by configuring each part on its own.

## Sign-in

Guest sign-in is on by default. It maps every visitor to the administrator identity (`user:default/admin`), with no password. That default is for a first look only. Turn it off before the portal reaches real users by stopping the guest authentication fragment and configuring a real provider instead. The local stack reads that fragment from `config/app-config.veecode-auth.yaml`, and the install guide shows the off switch on Kubernetes.

The 3.x image includes these sign-in providers, among others:

- GitHub OAuth ([GitHub sign-in](./GitHub/github-auth.md)).
- GitLab OAuth ([GitLab sign-in](./GitLab/gitlab-auth.md)).
- Microsoft Entra ID ([Microsoft sign-in](./Azure/azure.md)).
- Generic OIDC, which is how Keycloak connects ([Keycloak sign-in](./Keycloak/keycloak-auth.md)).

There is no LDAP sign-in provider in the 3.x image. To use an LDAP directory, connect it through an OIDC provider such as Keycloak ([LDAP organization sync](./LDAP/ldap.md)).

Each sign-in page shows the application configuration for the local stack and for the Helm chart, with placeholder credentials that you replace with your own.

## Organization sync and catalog discovery

Users and groups come from Marketplace modules that import them into the catalog on a schedule. Sign-in resolves a user only when a matching User entity already exists in the catalog, so install the sync module before you test sign-in.

- GitHub users and teams: [GitHub sign-in](./GitHub/github-auth.md).
- GitHub repository discovery: [GitHub backend integrations](./GitHub/github-integrations.md).
- GitLab users and groups: [GitLab sign-in](./GitLab/gitlab-auth.md).
- GitLab repository discovery: [GitLab integrations](./GitLab/gitlab.md).
- Keycloak users and groups: [Keycloak sign-in](./Keycloak/keycloak-auth.md).
- LDAP and Active Directory users and groups: [LDAP organization sync](./LDAP/ldap.md).
- Microsoft Entra ID users and groups: [Microsoft sign-in](./Azure/azure.md).

Install a module from the Marketplace Extensions page, or add its package reference to an operator plugin file. Each provider page lists the exact package reference and the configuration keys for devportal-local 3.0.3.

## Repository access

The catalog and the scaffolder read repositories through the `integrations` configuration: `integrations.github`, `integrations.gitlab`, and `integrations.azure`. These settings hold the tokens or application credentials the backend uses, and they are separate from sign-in.

- GitHub access and tokens: [GitHub backend integrations](./GitHub/github-integrations.md) and [GitHub tokens](./GitHub/github-tokens.md).
- GitLab access: [GitLab integrations](./GitLab/gitlab.md).
- Azure DevOps access: [Microsoft and Azure DevOps](./Azure/azure.md).

## AI tooling

[MCP Actions](./mcp.md) exposes catalog, scaffolder, TechDocs, and Kubernetes tools to external AI clients over HTTP, behind a static token.
