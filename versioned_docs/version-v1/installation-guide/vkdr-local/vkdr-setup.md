---
sidebar_position: 0
sidebar_label: VKDR (Kubernetes)
title: Install with VKDR (Kubernetes)
---

**Get your DevPortal instance running in under 5 minutes**

This guide provides a straightforward installation of VeeCode DevPortal in a local, containerized, and isolated environment.
It is designed for users who want to quickly evaluate the platform in a cost-effective manner, directly on their own machine, without the need for a full-scale cluster.

Within just a few minutes, you will have your own DevPortal instance up and running on your computer, providing a swift, hands-on experience with the product.
The local setup is ideal for safe experimentation, feature evaluation, and prototyping, while requiring minimal setup and **no prior experience with Kubernetes or Helm**.

## Purpose of the Local Setup

Here’s why the local setup is the best starting point:

- **Run on your own machine**: test and explore without needing remote servers.
- **Cost-efficient**: everything runs locally; no cloud infrastructure required.
- **Rapid evaluation**: deploy a functional DevPortal environment quickly.
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
1. **[GitHub Access Configuration](github.md):**
   Generate and configure the required GitHub token and secrets. These credentials allow DevPortal to securely access your repositories and services.
1. **[DevPortal Deployment](deployment.md):**
   Deploy your DevPortal instance locally using `vkdr`. The tool takes care of the entire installation process in just a few commands.
1. **[Access and Verification](access-and-testing.md):**
   Open DevPortal in your browser and confirm everything is running correctly. You’ll also learn how to verify the setup and troubleshoot common issues.
