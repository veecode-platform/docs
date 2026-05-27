---
sidebar_position: 3
sidebar_label: GitHub Integrations
title: GitHub Backend Integrations
---

## Overview

GitHub backend integrations enable VeeCode DevPortal to interact with GitHub APIs for:

- **Catalog ingestion**: Reading `catalog-info.yaml` files from repositories
- **Scaffolder actions**: Creating repositories from templates, opening pull requests
- **Plugins**: Various plugins that fetch data from GitHub (e.g., code insights, pull request tracking)
- **TechDocs**: Fetching documentation from repositories

These integrations run server-side and use **service credentials** rather than end-user tokens.

:::tip
If you use the `github` profile, DevPortal will configure both authentication and integrations for you using a bundled `app-config.yaml` file. You still need to obtain the GitHub App and PAT credentials manually and provide the environment variables, though.

The `github-pat` profile configures **repository/catalog discovery and integrations only** (with guest/no authentication). It uses the `github` catalog provider to ingest `catalog-info.yaml` entities from the organization's repos — it does **not** import GitHub users and teams as `User`/`Group` entities (that org sync is the `githubOrg` provider, configured by the full `github` profile). It also does not configure the auth provider, and is intended for local development and PoCs. See [GitHub Tokens](./github-tokens.md) for the required `GITHUB_TOKEN` variable.
:::

## How Backend Integrations Work

When VeeCode DevPortal needs to access GitHub APIs for backend operations, it relies on Backstage’s GitHub integration credential resolution flow:

1. **GitHub App installation token (preferred)**  
   If a matching GitHub App is configured and installed for the target organization/repository, DevPortal creates a GitHub App JWT and exchanges it for an installation access token, which is used for the request.

2. **Personal Access Token (fallback)**  
   If no suitable GitHub App applies, DevPortal falls back to a Personal Access Token (PAT) configured in `integrations.github[].token` for that host.

3. **Unauthenticated request (last resort)**  
   If neither a GitHub App nor a PAT is available, the request is sent without authentication. This may still work for public repositories but will fail for private content or when anonymous rate limits are exceeded.

This is the "backend integration" path shown in the [decision tree](./github.md#decision-tree) on the overview page.

## Personal Access Tokens (PATs)

**Personal Access Tokens** are used by DevPortal to access GitHub resources when a GitHub App is not available or not installed for specific repositories.

We explain PATs in more detail on the [GitHub Tokens](./github-tokens.md) page.

### PAT Integration

To configure a PAT as a fallback or for development:

```yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}
```

### When to Use PATs

- **Development/Local Setups**: PATs are simpler for local development and testing
- **Fallback Credentials**: As a backup when GitHub App isn't installed on certain repositories
- **Legacy Plugins**: Some older plugins may only support PAT-based authentication
- **Scaffolder Actions**: Certain template actions may require PATs

:::note
Local and development setups usually rely solely on PATs and "guest mode" (no authentication). We offer the `github-pat` profile to ease this setup.
:::

## GitHub App Integration

Using a GitHub App for integrations is recommended for production scenarios:

- Better rate limits
- Direct organization access (no user consent screen)
- Safer & short-lived tokens in runtime
- More granular permissions per organization/repo
- Webhook support

### Create a GitHub App for Integrations

To create a GitHub App for backend integrations:

1. Go to "Developer Settings" at your organization settings
2. Click on "New Github App"
3. Fill in the application details:
   - **GitHub App name**: VeeCode DevPortal Integration
   - **Homepage URL**: `https://your-veecode-instance.com`
   - **Authorization callback URL**: `https://your-veecode-instance.com/api/auth/github/handler/frame` — only required if this same GitHub App also handles sign-in. For an integration-only App (the recommended setup, where an OAuth App handles sign-in), this can be left blank.
   - **Permissions** (read more at [Required GitHub App Permissions](./github-integrations.md#required-github-app-permissions)):
     - Repository Permissions
        - Actions: Read and Write
        - Administration: Read-only
        - Artifact metadata: Read-only
        - Checks: Read-only
        - Code scanning alerts: Read-only
        - Commit Statuses: Read-only
        - Contents: Read (and maybe Write)
        - Dependabot Alerts: Read-only
        - Deployments: Read-only
        - Environments: Read-only
        - Secret scanning alert dismissal requests: Read-only
        - Secret scanning alerts: Read-only
        - Issues: Read-only
        - Pull Requests: Read-only
        - Workflows: Read and Write
     - Organization Permissions
        - Members: Read-only
        - Administration: Read-only
        - Custom organization roles: Read-only
        - Events: Read-only
        - Projects: Read-only
        - Webhooks: Read-only
     - Account Permissions
       - Email addresses: Read-only
       - Events: Read-only
   - **Where can this GitHub App be installed**: only your account (actually the organization itself)

4. Install the app to your organization or specific repositories
5. Generate a private key
6. Configure in `app-config.yaml`:

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
          # webhookSecret: ${GITHUB_WEBHOOK_SECRET}  # optional — only for webhook event handling
```

:::warning
Never commit tokens or private keys to version control. Always use environment variables or secret management systems.
:::

### Combined Configuration

You can configure both GitHub App and PAT together. The GitHub App will be preferred, with PAT as fallback:

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
      token: ${GITHUB_TOKEN}  # Fallback PAT
```

## Common Issues and Confusion

### Mixed Credentials Behavior

A common source of confusion is that authentication (user login) and integrations (backend operations) are configured separately:

- Setting up a GitHub App for user login doesn't automatically configure it for backend integrations
- Backend plugins may still expect a token in `integrations.github[].token`
- Some API calls use GitHub App credentials while others silently fall back to PAT

This can lead to developers thinking "auth is broken" when actually a PAT is missing or expired.

### Rate Limits

- **GitHub App**: 5,000 requests/hour per installation
- **PAT**: 5,000 requests/hour per user
- **Unauthenticated**: 60 requests/hour per IP

For production environments with multiple users, GitHub Apps provide better rate limiting.

## Best Practices

### For Production

- **Prefer GitHub App** for backend integrations
- **Keep a PAT** only as a last-resort fallback for:
  - Repositories where the App isn't installed
  - Legacy plugins that don't support GitHub Apps
  - Specific scaffolder actions that require PATs
- **Be explicit in config**: Avoid mixing credentials unless necessary, so you know which credential type is in play
- **Use fine-grained PATs** when PATs are needed (for better security)

### For Development

- **PATs are sufficient** for local development and testing (most of the time)
- Use "guest mode" (no authentication) for quick prototyping
- Test with GitHub App in staging before deploying to production

## Required GitHub App Permissions

This is a very tricky topic, because the required permissions are a direct reflection of what plugins you have chosen to use. The settings presented at "[Create a GitHub App for Integrations](./github-integrations.md#create-a-github-app-for-integrations)" assume you are using all GitHub-related plugins available at the time of writing, such as:

- Catalog plugins
- TechDocs plugins
- Scaffolder plugins
- GitHub Workflow plugins

You should adjust permissions based on your specific use cases.

## Troubleshooting

### Catalog Not Ingesting from GitHub

- Verify GitHub App is installed on the organization/repository
- Check that the App has **Contents: Read** permission
- Verify PAT fallback is configured if App isn't installed
- Check logs for credential resolution errors

### Scaffolder Cannot Create Repositories

- Verify GitHub App has **Administration: Write** permission
- Check that the App is installed on the target organization
- Verify PAT has `repo` scope if using PAT fallback

### Rate Limit Errors

- Switch from PAT to GitHub App for better rate limits
- Check current rate limit status in GitHub API responses
- Consider installing GitHub App on more repositories to distribute load

## References

- [Backstage GitHub Integration Docs](https://backstage.io/docs/integrations/github/locations/)
- [GitHub Apps Documentation](https://docs.github.com/en/developers/apps/getting-started-with-apps/about-apps)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)