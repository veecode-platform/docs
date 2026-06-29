---
sidebar_position: 4
sidebar_label: GitHub Configuration
title: GitHub Configuration
---

In this step you will configure GitHub integration for DevPortal. Relying on a PAT (personal access token) is the simplest option, but you may prefer to use a GitHub App for more security and control on real-world environments.

## Simplest option: PAT

You will create a **GitHub personal access token (PAT)**, which DevPortal will use to securely connect to GitHub and access repositories, workflows, and other resources.

GitHub offers two types of PATs:

- **Classic PATs**: simple to setup, long-lived, account-wide access
- **Fine-grained PATs**: Limited to specific repositories/organizations, shorter-lived, more secure

Follow this guide to create a **Classic PAT**:

- [Classic PAT](/devportal/v1/integrations/GitHub/github-tokens#classic-pat)

Follow this guide to create a **Fine-grained PAT**:

- [Fine-grained PAT](/devportal/v1/integrations/GitHub/github-tokens#fine-grained-pat)

:::tip
While you are still struggling to understand the permissions and how they relate to core DevPortal features and plugins, you can always create a **Classic PAT**. It is the simplest option and will work for most cases. Make it work and later refine it to a **Fine-grained PAT** for better security and control or, even better, use a **GitHub App** approach.
:::

## Export the token

Once you have your PAT, export it as an environment variable in your shell session. The deployment command in the next step reads it from `$GITHUB_TOKEN`.

```bash
export GITHUB_TOKEN=<your-token>
```

Replace `<your-token>` with the actual token value. This variable must be set in the same shell session where you run `vkdr devportal install`.

:::caution
Do not commit your token to version control. If you need this token to persist across shell sessions, add the `export` line to your shell profile (e.g., `~/.bashrc` or `~/.zshrc`) and restrict the file's read permissions.
:::
