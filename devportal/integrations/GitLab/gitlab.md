---
sidebar_position: 1
sidebar_label: GitLab Overview
title: GitLab sign-in and repository access
---

GitLab connects to DevPortal 3.x in three independent parts. Sign-in lets users enter with their GitLab account. Backend access lets the catalog and the scaffolder read GitLab projects. Catalog discovery and organization sync are Marketplace modules. Configure each part on its own; none implies the others.

## The parts

- [Sign in with GitLab](./gitlab-auth.md): GitLab OAuth sign-in plus the organization sync module that imports users and groups.
- Backend access (this page, below): the `integrations.gitlab` credentials the portal uses against the GitLab API.
- Repository discovery (this page, below): the `gitlab` catalog module that finds `catalog-info.yaml` files in your projects.

## Configure backend access

Add this block to a custom configuration fragment on the local stack (see [Add configuration to the local stack](../../installation-guide/docker-local/custom-config.md)), or to an `extraAppConfig` fragment in the chart `values.yaml`. Create a group or personal access token in GitLab first, following [GitLab's personal access token guide](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html), with API read access.

```yaml
integrations:
  gitlab:
    - host: gitlab.com
      apiBaseUrl: https://gitlab.com/api/v4
      token: ${GITLAB_TOKEN}
```

For self-hosted GitLab, replace the host and API base URL:

```yaml
integrations:
  gitlab:
    - host: gitlab.example.com
      apiBaseUrl: https://gitlab.example.com/api/v4
      token: ${GITLAB_TOKEN}
```

Pass the token as an environment variable on the `devportal` service in a Compose override, or through a Kubernetes Secret referenced with `${...}`. See the [Backstage GitLab integration documentation](https://backstage.io/docs/integrations/gitlab/locations) for the full set of fields.

## Discover projects in the catalog

The `gitlab` catalog module discovers `catalog-info.yaml` files in your GitLab projects on a schedule. Install it from the Marketplace Extensions page, or add this entry to an operator plugin file (see [Configure dynamic plugins for the local stack](../../installation-guide/docker-local/custom-plugins.md)):

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-plugin-catalog-backend-module-gitlab@sha256:8c6ba7d7b7f016d7ea08633ede1dfdad54073a623b3d08ede8e6227609d703e9
    disabled: false
    pluginConfig:
      catalog:
        providers:
          gitlab:
            default:
              host: ${GITLAB_HOST}
              group: ${GITLAB_DISCOVERY_GROUP}
              schedule:
                frequency:
                  minutes: 30
                timeout:
                  minutes: 3
                initialDelay:
                  seconds: 15
```

Set `GITLAB_HOST` to your GitLab host and `GITLAB_DISCOVERY_GROUP` to the group whose projects to discover. The module reads through the `integrations.gitlab` credentials above. Repository locations listed under `catalog.locations` use the same credentials.

## Entity pages and scaffolder actions

GitLab pipeline data and scaffolder operations come from their own Marketplace modules. Install the ones you need from the Extensions page:

- `gitlab-scaffolder-actions` adds the `gitlab:*` scaffolder actions.
- The GitLab pipelines modules add pipeline cards to entity pages.

Each module reads through the `integrations.gitlab` credentials configured above, so no extra token setup is needed.

## Troubleshooting

- Catalog does not ingest from GitLab: confirm the token is valid and has API access, that `integrations.gitlab` lists the right host and API base URL, and that the discovery module entry is enabled with the right group.
- Scaffolder operations fail against GitLab: the token needs write access for the operation. Use a group token scoped to the target group when a personal token is too broad.
