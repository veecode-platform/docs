---
sidebar_position: 2
sidebar_label: Create or choose a target organization/group
title: Create or choose a target organization/group
---

The Catalog is a key component in any [Backstage](https://backstage.io) installation. The Catalog is a centralized system that keeps track of ownership and metadata for all the software in your ecosystem (services, websites, repositories, clusters, environments, etc.).

There are way too many ways to fetch the catalog elements: from a git repository, from live cloud resources, from a database, from APIs, etc., but for the simplicity of this guide we will use just regular git repositories.

Decide where your catalog repo will live:

- GitHub: Use a dedicated organization where you have admin rights (or just create one). You can use an existing organization or even your personal account, it you know what you are doing.
- GitLab: Use a dedicated group/subgroup (or just create one) where you have admin rights or sufficient permissions to create repositories.

Tip: Prefer a dedicated organization/group to keep ownership scoped to your team. We will create access tokens and secrets to manipulate repositories, so it is better and more secure to have a dedicated organization/group.
