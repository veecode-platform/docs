---
sidebar_position: 1
sidebar_label: GitHub Overview
title: GitHub sign-in and repository access
---

GitHub connects to DevPortal 3.x in two independent parts. Sign-in lets users enter with their GitHub account. Backend access lets the catalog discover repositories and lets the scaffolder and entity pages read from GitHub. Configure each part on its own; neither implies the other.

## The two parts

- [Sign in with GitHub](./github-auth.md): GitHub OAuth sign-in plus the organization sync module that imports users and teams.
- [GitHub backend integrations](./github-integrations.md): repository access for catalog discovery, scaffolder actions, and entity pages.
- [GitHub tokens](./github-tokens.md): how to create the token that backend access uses.

## Which combinations to use

- Full GitHub setup: configure sign-in ([Sign in with GitHub](./github-auth.md)) and backend access ([GitHub backend integrations](./github-integrations.md)). Sign-in uses a GitHub OAuth app; backend access uses a token or a GitHub App.
- GitHub repositories with another identity: configure only backend access, and sign in through a different provider such as [Keycloak](../Keycloak/keycloak-auth.md). No GitHub OAuth App is needed.
- GitHub identity without GitHub repositories: configure only sign-in and organization sync. No repository token is needed.
