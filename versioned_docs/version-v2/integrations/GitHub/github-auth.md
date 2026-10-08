---
sidebar_position: 2
sidebar_label: GitHub Auth
title: GitHub Authentication
---

## GitHub Authentication Provider

The GitHub Authentication Provider enables users to sign in to VeeCode DevPortal using their GitHub accounts. In V2, it is activated by the `github-auth` preset. This preset belongs to the exclusive `identity` group — only one identity preset can be active per deployment.

The `github-auth` preset configures:

- GitHub OAuth sign-in (OAuth App credentials)
- The `githubOrg` catalog provider, which syncs org members and teams as `User`/`Group` catalog entities
- Sign-in resolvers that map authenticated GitHub identities to catalog User entities
- Disables the guest fallback so the login screen presents GitHub OAuth

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

## Prerequisites

1. A GitHub account with admin access to your organization.
2. A GitHub OAuth App (not a GitHub App) for sign-in.

## Step 1: Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the application details:
   - **Application name**: VeeCode DevPortal
   - **Homepage URL**: `https://your-devportal-instance.com` (local setup is usually `http://localhost:7007`)
   - **Authorization callback URL**: `https://your-devportal-instance.com/api/auth/github/handler/frame`
4. Click **Register application**
5. Note the **Client ID** and generate a new **Client Secret**

:::note
This can be done at organization level (recommended) or at user level. Use **Settings → Developer settings** at the organization level for an org-scoped OAuth App.
:::

## Step 2: Create a Personal Access Token

The `github-auth` preset also requires a PAT to power the `githubOrg` catalog provider, which reads org members and team membership.

Create a classic PAT (or fine-grained PAT scoped to your org) with at least:
- `read:org` — to read org members and teams

See the [GitHub Tokens](./github-tokens.md) page for detailed steps.

## Step 3: Activate the preset

Set the following environment variables and include `github-auth` in `VEECODE_PRESETS`:

```sh
VEECODE_PRESETS=recommended,github-auth
GITHUB_PAT=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_ORG=my-org
GITHUB_AUTH_CLIENT_ID=Iv1.abcdef0123456789
GITHUB_AUTH_CLIENT_SECRET=github-oauth-secret
```

For a full GitHub stack (auth + SCM), also add `github`:

```sh
VEECODE_PRESETS=recommended,github,github-auth
GITHUB_PAT=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_ORG=my-org
GITHUB_AUTH_CLIENT_ID=Iv1.abcdef0123456789
GITHUB_AUTH_CLIENT_SECRET=github-oauth-secret
```

## What the preset configures

The `github-auth` preset (`presets/github-auth.yaml`) produces the following `app-config` block at boot:

```yaml
signInPage: github

platform:
  guest:
    enabled: false
  signInProviders:
    - github

auth:
  environment: production
  providers:
    github:
      production:
        clientId: ${GITHUB_AUTH_CLIENT_ID}
        clientSecret: ${GITHUB_AUTH_CLIENT_SECRET}
        signIn:
          resolvers:
            - resolver: usernameMatchingUserEntityName
            - resolver: emailMatchingUserEntityProfileEmail
            - resolver: emailLocalPartMatchingUserEntityName

integrations:
  github:
    - host: github.com
      token: ${GITHUB_PAT}

catalog:
  providers:
    githubOrg:
      default:
        id: production
        githubUrl: https://github.com
        orgs:
          - ${GITHUB_ORG}
        schedule:
          frequency: { minutes: 30 }
          timeout: { minutes: 3 }
```

## Sign-in resolvers

The three resolvers are tried in order; the first match establishes the Backstage identity:

| Resolver | What it matches |
|---|---|
| `usernameMatchingUserEntityName` | GitHub username → `metadata.name` on the User entity |
| `emailMatchingUserEntityProfileEmail` | GitHub primary email → `spec.profile.email` |
| `emailLocalPartMatchingUserEntityName` | Email local part → `metadata.name` |

The `usernameMatchingUserEntityName` resolver requires the org sync to have run at least once so that `User` entities exist in the catalog.

## Troubleshooting

- **Callback URL mismatch**: Ensure the callback URL in your GitHub OAuth App matches exactly `https://<your-instance>/api/auth/github/handler/frame`.
- **Sign-in resolvers all fail**: Wait for the first org sync to complete, or ensure the User entity's `metadata.name` matches the GitHub username.
- **Missing `read:org` scope on PAT**: The `githubOrg` provider needs this scope to read organization members and teams. Without it, no `User`/`Group` entities are ingested and the sign-in resolvers that rely on them will fail.
- **Exclusive-group conflict at boot**: You have more than one identity preset in `VEECODE_PRESETS`. Keep only `github-auth` or switch to a different identity preset.

## Security considerations

- Never commit client secrets or PATs to version control.
- Use environment variables or a secret management system (Vault, AWS Secrets Manager, etc.).
- Regularly rotate your OAuth client secret.

## References

- [Backstage GitHub Auth Provider Docs](https://backstage.io/docs/auth/github/provider/)
- [Backstage GitHub Authentication Provider README](https://github.com/backstage/backstage/blob/master/docs/auth/github/provider.md)
- [GitHub OAuth Applications Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)
