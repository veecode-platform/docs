---
sidebar_position: 4
sidebar_label: GitHub Configuration
title: GitHub Configuration
---

In this step you will configure GitHub integration for DevPortal V2. DevPortal V2 supports **PAT + OAuth sign-in only** — GitHub App auth is not available through the presets model.

## Create a GitHub Personal Access Token (PAT)

You will create a **GitHub personal access token (PAT)**, which DevPortal will use to connect to GitHub and access repositories, workflows, and other resources.

GitHub offers two types of PATs:

- **Classic PATs**: simple to set up, long-lived, account-wide access
- **Fine-grained PATs**: limited to specific repositories/organizations, shorter-lived, more secure

Follow this guide to create a **Classic PAT**:

- [Classic PAT](/devportal/integrations/GitHub/github-tokens#classic-pat)

Follow this guide to create a **Fine-grained PAT**:

- [Fine-grained PAT](/devportal/integrations/GitHub/github-tokens#fine-grained-pat)

:::tip
Start with a **Classic PAT** while you are learning which permissions each feature requires. Once you have a working setup, you can switch to a **Fine-grained PAT** for better security and control.
:::

:::note
DevPortal V2 (presets model) uses **PAT + OAuth** for GitHub identity. GitHub App auth is not supported through presets and would require a manual `app-config.local.yaml` override outside the standard VKDR install path.
:::

## Create an OAuth App (for sign-in)

If you want users to sign in with GitHub, you also need a **GitHub OAuth App**. This provides the `GITHUB_AUTH_CLIENT_ID` and `GITHUB_AUTH_CLIENT_SECRET` values used by the `github-auth` preset.

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Set **Homepage URL** to `http://devportal.localhost:8000`.
3. Set **Authorization callback URL** to `http://devportal.localhost:8000/api/auth/github/handler/frame`.
4. Note the **Client ID** and generate a **Client Secret**.

## Export your credentials

Once you have your PAT (and optionally OAuth credentials), export them as environment variables in your shell session. The deployment command in the next step reads them from these variables, or you can pass them as flags.

```bash
export GITHUB_PAT=<your-pat>
export GITHUB_ORG=<your-org>

# optional — only needed for sign-in via github-auth preset
export GITHUB_AUTH_CLIENT_ID=<your-client-id>
export GITHUB_AUTH_CLIENT_SECRET=<your-client-secret>
```

Replace the placeholder values with your actual credentials. These variables must be set in the same shell session where you run `vkdr devportal-platform install`.

:::caution
Do not commit your credentials to version control. If you need them to persist across shell sessions, add the `export` lines to your shell profile (e.g., `~/.bashrc` or `~/.zshrc`) and restrict the file's read permissions.
:::
