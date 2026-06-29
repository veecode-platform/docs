---
sidebar_position: 0
sidebar_label: VKDR (Kubernetes)
title: Install with VKDR (Kubernetes)
---

**Get DevPortal V2 running locally in under 5 minutes**

This guide installs **DevPortal V2** (`docker.io/veecode/devportal:2.1.3`) into a local Kubernetes cluster using `vkdr devportal-platform install` — a single command that provisions Kong, applies the published `veecode-devportal-platform` Helm chart, and wires up credentials automatically.

It is designed for users who want to quickly evaluate the V2 platform in a cost-effective manner, directly on their own machine, without the need for a full-scale cluster.

Within just a few minutes, you will have your own DevPortal V2 instance up and running on your computer, providing a swift, hands-on experience with the product.
The local setup is ideal for safe experimentation, feature evaluation, and prototyping, while requiring minimal setup and **no prior experience with Kubernetes or Helm**.

:::note
This guide covers **DevPortal V2**, which uses the presets model (`VEECODE_PRESETS`). V2 is configured through presets — not profiles. If you are looking for the V1 local setup, see [V1 local setup](/devportal/v1/installation-guide/vkdr-local/vkdr-setup).
:::

## Purpose of the Local Setup

Here’s why the local setup is the best starting point:

- **Run on your own machine**: test and explore without needing remote servers.
- **Cost-efficient**: everything runs locally; no cloud infrastructure required.
- **Rapid evaluation**: deploy a functional DevPortal V2 environment quickly.
- **Safe experimentation**: explore features and configurations without affecting production systems.
- **Hands-on experience**: interact with DevPortal as if it were running in a real environment, ideal for testing or prototyping.

## Overview of the Setup Process

The installation is divided into **six steps**, each building on the previous one:

1. **[Requirements Check](requirements.md):**
   Ensure all necessary components are available before starting the installation.
1. **[VKDR Installation](vkdr-install.md):**
   Install and initialize `vkdr`, a lightweight CLI tool that automatically prepares the local infrastructure required to run DevPortal.
1. **[Local Infrastructure Setup](infra.md):**
   Launch a lightweight Kubernetes cluster using `k3d` inside Docker. This cluster serves as the runtime environment for DevPortal.
1. **[SCM Credentials Configuration](github.md):**
   Generate and configure the required SCM credentials. These allow DevPortal to securely access your repositories and services. This uses GitHub as the example; for GitLab or Azure DevOps see [Integrations](/devportal/integrations).
1. **[DevPortal Deployment](deployment.md):**
   Deploy DevPortal V2 locally using `vkdr devportal-platform install`. The tool takes care of the entire installation in just a few commands.
1. **[Access and Verification](access-and-testing.md):**
   Open DevPortal in your browser and confirm everything is running correctly. You’ll also learn how to verify the setup and troubleshoot common issues.
