---
sidebar_position: 0
sidebar_label: Plugin Development
title: Plugin Development
---

Plugin development is how you add functionality to your DevPortal instance. The kind of project you create depends on the kind of plugin you want to create:

- **Backend Plugin:** A plugin that runs on the backend and provides functionality to the frontend.
- **Frontend Plugin:** A plugin that runs on the frontend and provides functionality to the user.
- **Module:** A module is a more generic plugin that extends other plugins or DevPortal behavior.

Plugins can be developed using the Backstage plugin development framework, which provides a set of tools and APIs to create and manage plugins. Once ready a plugin can be packaged as a regular (static) plugin or as a dynamic plugin (each form of plugin becomes a different npm package).