---
sidebar_position: 1
sidebar_label: Requirements
title: Requirements
---

In this step, you will verify that all prerequisites are met.
Each of these tools is essential for setting up and running your local DevPortal environment.
If a requirement is already satisfied, simply verify it and move on to the next item.

## Steps Overview

In this section, you will:

1. Verify that a Unix-like shell is available.
1. Check that Docker is installed and running.
1. Confirm you have a GitHub account.

By the end, all prerequisites will be ready for setting up your local DevPortal environment.

## Step 1: Linux or macOS Shell

You need a Unix-like shell to run the installation commands. The shell you are currently using doesn’t need to be Bash, but **Bash must be available** on your system.

- On **Linux** or **macOS**, Bash is usually installed by default.
- On **Windows**, install [Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/install) to get a proper Linux shell with Bash.

Using Bash ensures compatibility with the installation scripts and CLI commands.

### Check if Bash is Available

Run the following command to verify:

```bash
command -v bash && echo "Bash is available" || echo "Bash is NOT available"
```

Expected output:

```
Bash is available
```

> Note: The command only checks if Bash is installed somewhere on your system. You do not need to switch your current shell to Bash.

## Step 2: Docker Engine

Docker is required because DevPortal runs inside containers. You will also use Docker indirectly through `k3d`, which launches a Kubernetes cluster inside Docker.

Choose the version appropriate for your OS:

- [Install Docker Engine](https://docs.docker.com/engine/install/): The native runtime for Linux. It is the core service that creates and manages containers.
- [Install Docker Desktop](https://docs.docker.com/get-docker/): The default option for macOS and Windows. It bundles Docker Engine with a graphical interface, Kubernetes integration, and extra tools.
- [Install Orbstack](https://orbstack.dev): An alternative runtime for macOS users who prefer faster performance.

:::info In practice

- On **Linux**, most users install **Docker Engine** only.
- On **macOS/Windows**, **Docker Desktop** is the default and easiest option.

:::

Docker provides the container runtime. Without it, Kubernetes and DevPortal cannot run locally.

### Start Docker

After installing, make sure Docker is running:

- On **Linux**, run:

```bash
sudo systemctl start docker
```

- On **macOS/Windows**, open **Docker Desktop** from your Applications/Start menu and wait until it shows as running.

You need Docker **running** before continuing with the DevPortal setup.

### Check Installation and Running Status

Run the following command:

```bash
docker version
```

Expected output (example):

```sh
Client:
 Version:           28.1.1
 API version:       1.49
 Go version:        go1.23.8
 Git commit:        4eba377
 Built:             Fri Apr 18 09:49:45 2025
 OS/Arch:           darwin/arm64
 Context:           desktop-linux

Server: Docker Desktop 4.41.2 (191736)
 Engine:
  Version:          28.1.1
  API version:      1.49 (minimum version 1.24)
  Go version:       go1.23.8
  Git commit:       01f442b
  Built:            Fri Apr 18 09:52:08 2025
  OS/Arch:          linux/arm64
  Experimental:     false
 containerd:
  Version:          1.7.27
  GitCommit:        05044ec0a9a75232cad458027ca83437aae3f4da
 runc:
  Version:          1.2.5
  GitCommit:        v1.2.5-0-g59923ef
 docker-init:
  Version:          0.19.0
  GitCommit:        de40ad0
```

> Note: Version numbers may vary depending on your installation. The important part is that Docker runs correctly.

## Step 3: GitHub Account

A GitHub account is required to generate tokens and grant DevPortal access to your repositories.

- [Sign up at GitHub](https://github.com/join) if you don’t already have an account.

DevPortal uses GitHub APIs to fetch metadata, repositories, and service configurations.
Without an account and credentials, DevPortal cannot integrate with your codebase.

### Check Installation

- Log in at [github.com](https://github.com).
- Confirm you can access your repositories.

---

Once all prerequisites are verified, you are ready to proceed to the VKDR installation.
