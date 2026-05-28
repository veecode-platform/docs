---
sidebar_position: 2
sidebar_label: GitHub Auth
title: GitHub Authentication
---
<!-- LLM: DO NOT TOUCH ABOVE -->

<!-- LLM: Explain in this page content how to configure the github auth provider in VeeCode DevPortal (VeeCode DevPortal is a Backstage distribution).

Explain what that this provider does and how to configure it.

Useful links to follow (you can include these links in the page):
- GitHub Authentication Provider Docs: https://backstage.io/docs/auth/github/provider/
- GitHub Authentication Provider README: https://github.com/backstage/backstage/blob/master/docs/auth/github/provider.md

DO NOT ERASE THIS BLOCK COMMENT
-->

## GitHub Authentication Provider

The GitHub Authentication Provider enables users to sign in to VeeCode DevPortal using their GitHub accounts. This integration provides a secure and familiar authentication experience leveraging OAuth 2.0.

import styles from '../../style.module.css';

<figure className={styles['image-container']}>
  <img 
    src="/img/github/login-github.png" 
    alt="GitHub Login"
    style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
  />
  <figcaption className={styles['caption']}>
    GitHub Login screen
  </figcaption>
</figure>

## Authentication Options

VeeCode DevPortal supports two methods for GitHub authentication: **GitHub App** and **GitHub OAuth App**.

- Both are OAuth 2.0 based authentication and SSO
- Both have better rate limits against GitHub APIs (GitHub App even better)
- Both allow organization and team-based access control (see integrations)

## Prerequisites

1. A GitHub account with admin access to your organization
2. Choose what authentication method you want to use:
   - OAuth App (simpler)
   - GitHub App (better rate limits and organization access)

## Option A: OAuth App Authentication (recommended)

A **GitHub OAuth App** provides a simpler setup:

- Users complete a classic OAuth flow
- They receive user tokens with the requested scopes (e.g., `read:user`, `user:email`)
- Scopes are good enough for authentication
- Rate limits are also good

<figure className={styles['image-container']}>
  <img 
    src="/img/github/consent-screen.png" 
    alt="GitHub Login"
    style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
  />
  <figcaption className={styles['caption']}>
    GitHub Login (OAuth consent screen)
  </figcaption>
</figure>

### Step 1: Create an OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on "New OAuth App"
3. Fill in the application details:
   - **Application name**: VeeCode DevPortal
   - **Homepage URL**: `https://your-veecode-instance.com` (local setup is usually "http://localhost:7777")
   - **Authorization callback URL**: `https://your-veecode-instance.com/api/auth/github/handler/frame`
4. Click "Register application"
5. Note down the **Client ID** and generate a new **Client Secret**

:::note
This can be done at organization level (recommended) or at user level (not recommended). Just use the "Developer Settings" link at organization settings instead.
:::

### Step 2. Configure OAuth App Authentication

Add the following configuration to your `app-config.yaml`:

```yaml
auth:
  environment: development
  providers:
    github:
      development:
        clientId: ${GITHUB_AUTH_CLIENT_ID}
        clientSecret: ${GITHUB_AUTH_CLIENT_SECRET}
        signIn:
          resolvers:
            - resolver: usernameMatchingUserEntityName
            - resolver: emailMatchingUserEntityProfileEmail
            - resolver: emailLocalPartMatchingUserEntityName
        scope:
          - read:user
          - user:email
          - read:org
```

:::tip
If you use the `github` profile, it will configure both authentication and integrations for you using a bundled `app-config.yaml` file.
:::

## Option B: GitHub App Authentication

A **GitHub App** provides enhanced security, better rate limits, and more granular permissions. When users sign in via a GitHub App:

- Users complete an OAuth flow through the GitHub App
- They receive short-lived user access tokens scoped by the App's permissions
- The App can be installed organization-wide with fine-grained repository access
- Rate limits are significantly higher

:::important
In production scenarios you will most likely use GitHub Apps for integrations and an OAuth App for authentication. Integrations not only need better rate limits but also organization access that you usually don't want in a consent screen at all.
:::

### Step 1: Create a GitHub App

To use GitHub App authentication:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on "New Github App"
3. Fill in the application details:
   - **GitHub App name**: VeeCode DevPortal Auth
   - **Homepage URL**: `https://your-veecode-instance.com`
   - **Authorization callback URL**: `https://your-veecode-instance.com/api/auth/github/handler/frame`
   - **Permissions**:
     - Account Permissions
       - Email addresses: Read-only
   - **Where can this GitHub App be installed**: only your account or any organization
4. Click "Register application"
5. Create a GitHub App in your organization
6. Install the app to your organization

### Step 2. Configure GitHub App Authentication

Add the following configuration to your `app-config.yaml`:

```yaml
auth:
  environment: development
  providers:
    github:
      development:
        clientId: ${GITHUB_AUTH_CLIENT_ID}
        clientSecret: ${GITHUB_AUTH_CLIENT_SECRET}
        signIn:
          resolvers:
            - resolver: usernameMatchingUserEntityName
            - resolver: emailMatchingUserEntityProfileEmail
            - resolver: emailLocalPartMatchingUserEntityName
        scope:
          - read:user
          - user:email
          - read:org
```

## About VeeCode Profiles

We created VeeCode Profiles as a simple way to configure authentication and integrations for your VeeCode DevPortal instance. A profile relies on bundled configuration snippets that are activated by environment variables. Once you have the credentials and tokens you can use a profile to configure your DevPortal instance without the need to deal with the `app-config.yaml` configuration file syntax.

You will find more information about VeeCode Profiles in:

- [Quick Setup with Profiles](/devportal/v1/installation-guide/docker-local/profiles)

## Troubleshooting

- **Callback URL Mismatch**: Ensure the callback URL in your GitHub OAuth app matches exactly with your VeeCode DevPortal URL.
- **Insufficient Permissions**: Verify that the OAuth app has the required scopes (`read:user`, `user:email`, `read:org`). Missing `read:org` prevents org/team resolution.
- **Rate Limiting**: Consider using GitHub App authentication for higher rate limits.

## Security Considerations

- Never commit client secrets or private keys to version control
- Use environment variables for sensitive configuration
- Regularly rotate your client secrets and private keys
- Enable 2FA for your GitHub organization

## References

- [Backstage GitHub Auth Provider Docs](https://backstage.io/docs/auth/github/provider/)
- [BackstageGitHub Authentication Provider 'README'](https://github.com/backstage/backstage/blob/master/docs/auth/github/provider.md)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)
- [GitHub App Authentication](https://docs.github.com/en/developers/apps/getting-started-with-apps/about-apps)
