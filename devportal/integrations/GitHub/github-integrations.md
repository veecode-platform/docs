---
sidebar_position: 3
sidebar_label: GitHub Integrations
title: Connect DevPortal to GitHub repositories
---

This page configures the backend GitHub access that catalog discovery, scaffolder actions, and entity pages use. It is separate from [GitHub sign-in](./github-auth.md): these settings authenticate the portal to the GitHub API, not your users.

## Configure repository access

Add this block to a custom configuration fragment on the local stack (see [Add configuration to the local stack](../../installation-guide/docker-local/custom-config.md)), or to an `extraAppConfig` fragment in the chart `values.yaml`. Create the token first as described in [GitHub tokens](./github-tokens.md).

```yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}
```

For GitHub Enterprise, set `host` to your instance hostname. Pass the token as an environment variable on the `devportal` service in a Compose override, or through a Kubernetes Secret referenced with `${...}`.

### Use a GitHub App instead of a token

For higher rate limits and narrower permissions, register a GitHub App following [GitHub's guide to creating GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/about-creating-github-apps) and configure it instead of a token:

```yaml
integrations:
  github:
    - host: github.com
      apps:
        - appId: ${GITHUB_APP_ID}
          clientId: ${GITHUB_CLIENT_ID}
          clientSecret: ${GITHUB_CLIENT_SECRET}
          privateKey: |
            ${GITHUB_PRIVATE_KEY}
```

Configure either a token or an App for each host. See the [Backstage GitHub integration documentation](https://backstage.io/docs/integrations/github/locations) for the full set of fields.

## Discover repositories in the catalog

The `github` catalog module discovers `catalog-info.yaml` files in your repositories on a schedule. Install it from the Marketplace Extensions page, or add this entry to an operator plugin file (see [Configure dynamic plugins for the local stack](../../installation-guide/docker-local/custom-plugins.md)):

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-plugin-catalog-backend-module-github@sha256:d7d3a1f0bfdea4ede1b2410a293c680c7604e9b1de18906f536d4746ae0b3b20
    disabled: false
    pluginConfig:
      catalog:
        providers:
          github:
            providerId:
              organization: ${GITHUB_ORG}
```

Set `GITHUB_ORG` to the organization to discover. Repository locations listed under `catalog.locations` in the configuration also use the `integrations.github` credentials above.

## Entity pages and scaffolder actions

GitHub Actions data, pull requests, issues, and scaffolder operations come from their own Marketplace modules. Install the ones you need from the Extensions page:

- `github-actions` shows workflow runs on entity pages.
- `github-scaffolder-actions` adds the `github:*` scaffolder actions that create repositories and manage content.
- `github-pull-requests` and `github-issues` add pull request and issue cards.

Each module reads through the `integrations.github` credentials configured above, so no extra token setup is needed. Check the module documentation for the permissions your token or App needs.

## Troubleshooting

- Catalog does not ingest from GitHub: confirm the token is valid (see [GitHub tokens](./github-tokens.md)), that `integrations.github` lists the right host, and that the discovery module entry is enabled with the right organization.
- Scaffolder cannot create repositories: the token needs repository write access, or the GitHub App needs the matching repository permissions.
- Rate limit errors: GitHub Apps get higher rate limits than tokens. Switch to a GitHub App when many repositories are discovered or many users trigger GitHub operations.
