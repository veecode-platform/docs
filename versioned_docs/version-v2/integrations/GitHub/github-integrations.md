---
sidebar_position: 3
sidebar_label: GitHub Integrations
title: GitHub Backend Integrations
---

## Overview

GitHub backend integrations enable VeeCode DevPortal to interact with GitHub APIs for:

- **Catalog ingestion**: Reading `catalog-info.yaml` files from repositories
- **Scaffolder actions**: Creating repositories from templates, opening pull requests
- **Plugins**: Various plugins that fetch data from GitHub (e.g., GitHub Actions tab)
- **TechDocs**: Fetching documentation from repositories

These integrations run server-side and use **service credentials** rather than end-user tokens.

In V2, backend integrations are activated by the `github` preset. This preset is separate from `github-auth` (OAuth sign-in) — the two can be combined or used independently.

## Activating with the `github` preset

Add `github` to `VEECODE_PRESETS` and supply the required variables:

```sh
VEECODE_PRESETS=recommended,github
GITHUB_PAT=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_ORG=my-org
```

| Variable | Description |
|---|---|
| `GITHUB_PAT` | Personal Access Token with `repo` and `read:org` scopes |
| `GITHUB_ORG` | GitHub organization to scan for `catalog-info.yaml` files |

See [GitHub Tokens](./github-tokens.md) for instructions on creating a PAT with the right scopes.

## What the `github` preset configures

The preset (`presets/github.yaml`) produces the following `app-config` at boot:

```yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_PAT}

catalog:
  providers:
    github:
      default:
        organization: ${GITHUB_ORG}
        schedule:
          frequency: { minutes: 30 }
          timeout: { minutes: 3 }
```

It also enables the GitHub Actions UI tab (dynamic frontend plugin) on entity pages.

:::note
The `github` preset configures repo discovery via the `github` catalog provider (`catalog-backend-module-github`). It does **not** configure org/team user sync — that is handled by `github-auth` (`githubOrg` provider). Add both presets for the full GitHub stack.
:::

## How Backend Integrations Work

When VeeCode DevPortal needs to access GitHub APIs for backend operations, it relies on Backstage's GitHub integration credential resolution flow:

1. **GitHub App installation token (preferred)**
   If a matching GitHub App is configured and installed for the target organization/repository (via `app-config.local.yaml` overlay), DevPortal creates a GitHub App JWT and exchanges it for an installation access token, which is used for the request.

2. **Personal Access Token (fallback)**
   If no suitable GitHub App applies, DevPortal falls back to the PAT configured in `integrations.github[].token` — the `GITHUB_PAT` supplied to the preset.

3. **Unauthenticated request (last resort)**
   If neither is available, the request is sent without authentication. This may work for public repositories but will fail for private content or when anonymous rate limits are exceeded.

## Adding a GitHub App (optional overlay)

The `github` preset wires the PAT integration by default. If you need a GitHub App for better rate limits or organization-wide installation, add the App config via `app-config.local.yaml` (which wins over preset-generated config):

```yaml
# app-config.local.yaml
integrations:
  github:
    - host: github.com
      apps:
        - appId: ${GITHUB_APP_ID}
          clientId: ${GITHUB_CLIENT_ID}
          clientSecret: ${GITHUB_CLIENT_SECRET}
          privateKey: |
            ${GITHUB_PRIVATE_KEY}
      token: ${GITHUB_PAT}  # PAT as fallback for repos the App isn't installed on
```

> No V2 preset defines `GITHUB_APP_ID`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, or `GITHUB_PRIVATE_KEY` — these are placeholder names you choose and inject yourself. Only `GITHUB_PAT` and the OAuth pair (`GITHUB_AUTH_CLIENT_ID` / `GITHUB_AUTH_CLIENT_SECRET`) come from the `github` / `github-auth` presets.

### Create a GitHub App for Integrations

To create a GitHub App for backend integrations:

1. Go to **Developer Settings** at your organization settings
2. Click **New GitHub App**
3. Fill in the application details:
   - **GitHub App name**: VeeCode DevPortal Integration
   - **Homepage URL**: `https://your-devportal-instance.com`
   - **Authorization callback URL**: only required if this same GitHub App also handles sign-in; for an integration-only App this can be left blank.
   - **Permissions** (adjust based on the plugins you use):
     - Repository Permissions
        - Actions: Read and Write
        - Administration: Read-only
        - Contents: Read (and Write for scaffolder)
        - Issues: Read-only
        - Metadata: Read-only
        - Pull Requests: Read-only
        - Workflows: Read and Write
     - Organization Permissions
        - Members: Read-only
4. Install the app to your organization
5. Generate a private key
6. Add the App config to `app-config.local.yaml` as shown above

## Common Issues

### Mixed Credentials Behavior

A common source of confusion is that authentication (user login) and integrations (backend operations) are configured by separate presets:

- Activating `github-auth` configures both sign-in and the backend integration token (it sets integrations.github token from GITHUB_PAT). Add the `github` preset as well for catalog discovery and the GitHub Actions UI.
- Backend plugins still need `GITHUB_PAT` (from the `github` preset) for catalog discovery, scaffolder, and plugin API calls.
- Some API calls use GitHub App credentials while others fall back to PAT.

### Rate Limits

- **GitHub App**: 5,000 requests/hour per installation
- **PAT**: 5,000 requests/hour per user
- **Unauthenticated**: 60 requests/hour per IP

For production environments, a GitHub App provides better rate limiting. Use the PAT as a fallback.

## Troubleshooting

### Catalog Not Ingesting from GitHub

- Verify `GITHUB_PAT` has `repo` and `read:org` scopes.
- Verify `GITHUB_ORG` is set correctly and matches the GitHub organization name.
- If using a GitHub App, verify it is installed on the target organization and has **Contents: Read** permission.
- Check logs for credential resolution errors.

### Scaffolder Cannot Create Repositories

- Verify `GITHUB_PAT` has `repo` scope (write access).
- If using a GitHub App overlay, verify the App has **Administration: Write** permission and is installed on the target organization.

### Rate Limit Errors

- Add a GitHub App via `app-config.local.yaml` for higher rate limits.
- Check current rate limit status in GitHub API responses.

## References

- [Backstage GitHub Integration Docs](https://backstage.io/docs/integrations/github/locations/)
- [GitHub Apps Documentation](https://docs.github.com/en/developers/apps/getting-started-with-apps/about-apps)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
