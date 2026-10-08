---
sidebar_position: 7
sidebar_label: GitLab Pipelines
title: GitLab Pipelines Plugin
---

# GitLab Pipelines Plugin

Without this plugin, a service registered in the portal has no visibility into its own CI pipelines. Developers context-switch to GitLab to check pipeline status or trigger runs — the portal and the CI tool are disconnected. Enable the plugin, add `gitlab.com/project-slug` to the entity, and the CI tab shows live pipeline history for that project.

The GitLab plugin integrates GitLab with your DevPortal component. It provides:

- **Pipelines table** — recent pipelines in the CI tab, with branch selection.
- **Merge request and issue tables** — open merge requests and issues for the project.
- **Merge request stats card** — an overview card with merge request counts.

### Community

> Join our community to resolve questions about our Plugins. We look forward to welcoming you!
>
> [Go to Community](https://github.com/orgs/veecode-platform/discussions)

---

## Plugin packages

| Package | Role |
|---|---|
| `immobiliarelabs-backstage-plugin-gitlab` | Frontend — pipelines, merge request, and issue cards |
| `immobiliarelabs-backstage-plugin-gitlab-backend` | Backend — GitLab API proxy |

Both are versioned packages in the active package index (`7.0.0`) and are **not default plugins**. Install them from the Marketplace or by package reference. The frontend mounts the pipelines table in the CI tab, the merge request stats card in the overview, and the issues and merge request tables in their respective tabs; each card renders when the entity carries the GitLab project annotation.

---

## Enabling the plugin

### Via Marketplace

Search for the GitLab entry in the Marketplace and install the frontend and backend packages, then recreate the stack so the installer runs. A plain container restart does not apply a Marketplace selection. See [Configure dynamic plugins for the local stack](../installation-guide/docker-local/custom-plugins.md) for the apply procedure.

### Via the operator file (local stack)

Add both index references to your operator file (`dynamic-plugins.local.yaml`):

```yaml
plugins:
  - package: oci://quay.io/veecode/immobiliarelabs-backstage-plugin-gitlab-backend@sha256:b1bbe7274759b17455c02c2903267adf83e48803367735109e24a14b6b1f1e3f
    disabled: false

  - package: oci://quay.io/veecode/immobiliarelabs-backstage-plugin-gitlab@sha256:54df61fe65be6aac92843ea70cf1217c0df88551f6afa8176a0fdc28228edaa6
    disabled: false
```

### On Kubernetes

Add the same two package references under `global.dynamic.plugins` in your chart values.

---

## GitLab integration

The backend calls the GitLab API server-side. Configure the credentials where the portal reads its app config — a configuration fragment on the local stack, `upstream.backstage.appConfig` on Kubernetes — with the token passed through an environment variable or a referenced Secret:

```yaml
integrations:
  gitlab:
    - host: gitlab.com                        # or your self-hosted GitLab hostname
      apiBaseUrl: https://gitlab.com/api/v4   # point at your instance for self-hosted
      token: ${GITLAB_TOKEN}
```

---

## Annotations

### `gitlab.com/project-slug` (required)

```yaml
metadata:
  annotations:
    gitlab.com/project-slug: my-group/my-project
```

All GitLab cards for the entity read the project from this annotation.

---

## Pipelines table

Lists recent pipelines for the component's GitLab project. Features:

- Branch selector
- Table with: Pipeline ID, status, GitLab URL, elapsed time

---

## Merge requests and issues

The merge request stats card on the overview shows open merge request counts for the project. The merge request and issue tables list the project's open merge requests and issues on their tabs.

---

## References

- [ImmobiliareLabs GitLab plugin (upstream README)](https://github.com/immobiliare/backstage-plugin-gitlab)
- [CI/CD Plugins](./cicd.md)
