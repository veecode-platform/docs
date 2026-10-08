---
sidebar_position: 10
sidebar_label: Available Actions
title: Available Actions
---

# Available Actions

Actions are functions registered in the scaffolder backend. You invoke them by `id` inside a template step. This page lists the 16 actions on a default install, all built into `@backstage/plugin-scaffolder-backend`.

Each action's input schema appears at `/create/actions` in the portal and through `GET /api/scaffolder/v2/actions`; module versions can change an action's inputs, and the installed `regex:replace` takes `regExps` entries.

| Action ID | What it does |
|---|---|
| `catalog:annotate` | Annotates an entity object with labels, annotations, and spec properties |
| `catalog:fetch` | Returns entities from the catalog by entity reference |
| `catalog:register` | Registers entities from a workspace catalog descriptor file into the catalog |
| `catalog:scaffolded-from` | Records the template entity reference in `catalog-info.yaml` |
| `catalog:template:version` | Records the template version in `catalog-info.yaml` |
| `catalog:timestamping` | Annotates scaffolded entities with a creation timestamp |
| `catalog:write` | Writes a `catalog-info.yaml` file for a template |
| `debug:log` | Writes a message into the log, optionally listing workspace files |
| `debug:wait` | Waits for a period of time |
| `fetch:plain` | Downloads a directory into the workspace without templating |
| `fetch:plain:file` | Downloads a single file into the workspace without templating |
| `fetch:template` | Downloads a skeleton directory, rendering variables into file names and content |
| `fetch:template:file` | Downloads a single file, rendering variables into its content |
| `fs:delete` | Deletes files and directories from the workspace |
| `fs:readdir` | Reads files and directories from the workspace |
| `fs:rename` | Renames files and directories within the workspace |

None of the 16 publishes to a repository. Publish and SCM actions come from Marketplace scaffolder modules: `github-scaffolder-actions`, `gitlab-scaffolder-actions`, `azure-scaffolder-actions`, `bitbucket-cloud-scaffolder-actions`, `bitbucket-server-scaffolder-actions`, and `gerrit-scaffolder-actions`. Until such a module is installed, templates compose workspace files and catalog entries only.

## See the live set

To see every action your portal currently has, open `/create/actions` in your DevPortal URL. Modules you install add to this list.

You can also query the scaffolder API with a signed-in token:

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:7007/api/scaffolder/v2/actions
```

## Installing a scaffolder module adds actions

Installing a scaffolder module through Marketplace or configuration extends the table above. The regex module adds `regex:replace`. The Roadie utilities module adds these 13 action IDs:

- `roadiehq:utils:fs:append`
- `roadiehq:utils:fs:parse`
- `roadiehq:utils:fs:replace`
- `roadiehq:utils:fs:write`
- `roadiehq:utils:json:merge`
- `roadiehq:utils:jsonata`
- `roadiehq:utils:jsonata:json:transform`
- `roadiehq:utils:jsonata:yaml:transform`
- `roadiehq:utils:merge`
- `roadiehq:utils:serialize:json`
- `roadiehq:utils:serialize:yaml`
- `roadiehq:utils:sleep`
- `roadiehq:utils:zip`

Open `/create/actions` after the install to confirm the new IDs before you use them in a template.

## References

- [Writing Templates](./writing-templates.md) — author templates with these actions.
- [Software Templates](./software-template.md) — run templates from the Create page.
- [Backstage: Built-in actions](https://backstage.io/docs/features/software-templates/builtin-actions) — upstream reference for the built-in actions.
