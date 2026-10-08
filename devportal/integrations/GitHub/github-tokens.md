---
sidebar_position: 4
sidebar_label: GitHub Tokens
title: Create a GitHub token for DevPortal
---

This page shows how to create a GitHub personal access token (PAT) for DevPortal's backend GitHub access, and how to wire it into the portal configuration. The token authenticates the portal to the GitHub API for catalog discovery, scaffolder operations, and entity data. For user sign-in, see [Sign in with GitHub](./github-auth.md) instead.

PATs are the simplest credential for local evaluation. For shared or production setups, consider a [GitHub App](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/about-creating-github-apps) instead, which gives higher rate limits and narrower permissions (see [GitHub backend integrations](./github-integrations.md)).

:::warning
A single PAT is usually enough for local evaluation.

For production or shared setups, prefer a **fine-grained token** for better permission control, or a GitHub App for higher rate limits.
:::

## About GitHub personal access tokens

A **personal access token** is a credential you generate and use instead of your GitHub password. It allows tools such as DevPortal to securely connect to GitHub and access repositories, workflows, and other resources.

Unlike a regular password, tokens can be limited in scope, tied to specific repositories, set to expire automatically, or revoked at any time. These features make tokens a convenient way to grant external tools controlled access to your GitHub account.

DevPortal uses this token to communicate with GitHub — for example, to discover `catalog-info.yaml` files, scaffold new repositories, or fetch workflow run data — without exposing your GitHub password.

:::info
For more details, see GitHub's official documentation:

- [Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [Fine-grained personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-fine-grained-personal-access-token)
:::

### Token types

GitHub offers two types of PATs:

- **Classic PATs**: Broad scopes (e.g., `repo`, `read:org`), long-lived, account-wide access
- **Fine-grained PATs**: Limited to specific repositories or organizations, shorter-lived, more secure

## Steps overview

In this section, you will:

1. **Create a personal access token** (classic or fine-grained).
1. **Store the token** securely.
1. **Wire the token into the portal configuration** so `integrations.github` uses it.

By the end, you will have a GitHub token that DevPortal uses for backend GitHub access.

## Step 1: Create a personal access token

There are two ways to create a personal access token on GitHub:

1. **Classic token**: simpler, easier to set up, but broader permissions.
1. **Fine-grained token**: more secure, allows restricting access by repository and permissions.

Choose the option that suits you best and follow its steps.

:::tip

If you want to test DevPortal without affecting your personal repositories or main organization, consider creating a separate GitHub organization specifically for testing.

This approach only works with a **fine-grained personal access token**, since classic tokens are always tied to your personal account.

When creating the fine-grained token, select the test organization as the resource owner. This scopes the token exclusively to that environment, keeping your experiments isolated and preventing accidental changes to production repositories.

:::

### Option 1: Create a classic access token (simplest option) {#classic-pat}

1. Go to [New personal access token (classic)](https://github.com/settings/tokens/new).
1. Fill out the form with the following:

   - **Note:** This is a descriptive label for your token. Choose something meaningful, like `devportal-token`, so you can easily identify it later if you have multiple tokens.

   - **Expiration:** This sets how long the token will remain valid. A recommended value is `90 days`, after which the token will expire automatically. This helps reduce security risks if the token is ever leaked.

   - **Scopes:** These define what the token can do and which resources it can access. Match them to the DevPortal features you enable:

     - `repo` – Grants full access to your repositories, including reading and writing code, issues, pull requests, and repository settings. Needed for catalog discovery and scaffolder operations.
     - `workflow` – Allows the token to trigger and manage GitHub Actions workflows.
     - `read:org` – Allows reading organization membership. Needed for organization and team sync.

1. Click the `Generate token` button at the bottom of the page.

GitHub will display the new token only once, on the same page. Do not leave or reload the page yet — you must copy and securely save it in Step 2 before navigating away, otherwise you will lose access to this token.

:::tip

Only select the scopes you actually need. Limiting scopes improves security by reducing what the token can access.

:::

### Option 2: Create a fine-grained access token (more secure) {#fine-grained-pat}

1.  Go to [New fine-grained personal access token](https://github.com/settings/personal-access-tokens/new).

1.  Fill out the form with the following:

    - **Token name:** Enter a descriptive name, for example `devportal-token`. This helps you identify the token later.

    - **Resource owner:** You can choose either your personal account or any organization you belong to. This specifies the GitHub account or organization that the token will be linked to. DevPortal will use this account to authenticate and access repositories, workflows, and other resources.

    - **Description:** (Optional) You can provide a short note to describe the purpose of the token, for example "DevPortal access token". While this field is not required, adding a description helps you identify the token later, especially if you have multiple tokens for different tools or environments.

    - **Repository access:** Choose `All repositories`. This is recommended for an Internal Developer Portal to have access across all repositories.

    - **Expiration:** This sets how long the token will remain valid. A recommended value is `90 days`, after which the token will expire automatically. This helps reduce security risks if the token is ever leaked.

    - **Permissions:** Choosing permissions can be tricky, as it depends on the DevPortal features or plugins you plan to use.

      For example:

      - If you use the **Catalog plugin** to display repository metadata and manage the software catalog, the token will need `Metadata: Read-only` permission.
      - If you use the **GitHub Actions plugin** to trigger CI/CD workflows, the token will need `Actions: Read/Write` permission.
      - If a plugin needs to access or display content files from repositories, it will require `Contents: Read/Write` permission.

      At minimum, configure the following permissions (remember: permissions are contextual to your use case).

      Repository permissions:

      - **Actions:** Read/Write — allows DevPortal (or plugins) to trigger, monitor, and interact with workflow runs (executions of CI/CD pipelines).
      - **Administration:** Read/Write — allows managing repository settings.
      - **Contents:** Read/Write — access to repository files and code contents.
      - **Metadata:** Read-only — allows reading repository information, such as names, descriptions, topics, and visibility.
      - **Pull requests:** Read-only — access pull request information, such as titles, descriptions, status, comments, and reviewers.
      - **Workflows:** Read/Write — allows DevPortal to read, create, or modify workflow definition files (`.github/workflows/*.yml`).

      Organization permissions (applies only if your Resource owner is an organization):

      - **Administration:** Read-only — read organization settings without modifying.
      - **Members:** Read-only — read organization member information, such as usernames, roles, and team memberships.

2.  Click the `Generate token` button at the bottom of the page.

GitHub will display the new token only once, on the same page. Do not leave or reload the page yet — you must copy and securely save it in Step 2 before navigating away, otherwise you will lose access to this token.

## Step 2: Store the token

After generating your GitHub token (classic or fine-grained), store it in a secure place where you can retrieve it when needed.

1.  **Copy the token carefully**: After clicking the `Generate token` button on Step 1, GitHub will display the token as a long string, for example:

    ```
    ghp_16characters…rest_of_the_token
    ```

    Copy it immediately. GitHub will not show it again, so do not refresh or leave the page before copying.

1.  **Store it securely**:
    Keep the token somewhere safe where you can always access it when needed, because anyone who has this token can act as you on GitHub and access your repositories and workflows.

    Recommended options include a password manager such as 1Password or Bitwarden, an encrypted file or secure notes application, or a secret management tool like Vault or AWS Secrets Manager.

    The key points are that you can always retrieve the token and that other people should never have access to it.

## Step 3: Wire the token into the portal configuration

The portal reads the token from the `integrations.github` configuration, with the value passed through an environment variable. Set `GITHUB_TOKEN` on the `devportal` service in a Compose override on the local stack:

```yaml
services:
  devportal:
    environment:
      GITHUB_TOKEN: ghp_your_token_here
```

On Kubernetes, store the token in the runtime Secret and reference it as `${GITHUB_TOKEN}` in the `integrations.github` block, following the `veecode-runtime-secrets` pattern in [Install DevPortal on Kubernetes](../../installation-guide/production-setup/setup.md).

The `integrations.github` block that uses it is shown in [GitHub backend integrations](./github-integrations.md). Restart the portal so it loads the new value.

### Check the token

Run the following command to confirm the token is valid:

```sh
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/user
```

Expected output (example):

```sh
200
```

If the return code is `200`, the token is valid. This check confirms the token works against GitHub; the portal also needs the `integrations.github` block above to use it.
