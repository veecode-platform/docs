---
sidebar_position: 2
sidebar_label: VKDR Installation
title: VKDR Installation
---

In this step, you will install and initialize `vkdr` to prepare your local environment for running DevPortal.

## About VKDR

VKDR stands for _VeeCode Kubernetes Development Runtime_. It is a lightweight command-line tool that simplifies running a local Kubernetes cluster and other tools that are usually tricky to set up, allowing you to safely run **VeeCode DevPortal** in a local, containerized, and isolated environment.

The VKDR environment is fully disposable, so you can experiment freely without worrying about long-term impacts — ideal for testing and development.

:::note

VKDR is fully open source. If you’re curious, want to understand how it works, or contribute, you can find the source code on [GitHub](https://github.com/veecode-platform/vkdr).

This is completely optional — you can proceed with your environment as-is.

:::

## Steps Overview

In this section, you will:

1. **Install `vkdr`** using either the automatic script or manually.
1. **Initialize `vkdr`** to set up the local environment and dependencies.

By the end, you will have a fully functional VKDR environment ready for **testing, learning, and development**.

## Step 1: Install VKDR

### Option 1: Via Installation Script (Recommended)

Run the following command:

```sh
curl -s https://get-vkdr.vee.codes | bash
```

The command above will download and install the `vkdr` CLI on your machine into the `/usr/local/bin` directory. There are versions for Linux and OSX (both Intel and ARM), so the script will detect your OS and install the correct version.

### Option 2: Manual Installation

If you prefer, you can install `vkdr` manually:

1. Download the latest version from our [releases page](https://github.com/veecode-platform/vkdr/releases).
2. Add the executable to your PATH (suggested: `/usr/local/bin/`).

### Check Installation

Run the following command:

```bash
vkdr --version
```

Expected output (example):

```sh
VKDR: 0.1.76
Spring Boot: 3.5.5
Picocli: 4.7.7
JVM: 21.0.8 (Oracle Corporation Substrate VM 21.0.8+12-LTS)
OS: Mac OS X 15.6.1 aarch64
```

> Note: Version numbers may vary depending on your installation. The important part is that vkdr runs correctly.

## Step 2: Initialize VKDR

The command `vkdr init` downloads all the necessary tools and dependencies, creates an isolated local environment in `~/.vkdr`, and sets up a lightweight Kubernetes cluster automatically.

Run the following command:

```bash
vkdr init
```

Expected output (example):

```sh
Initializing VKDR...
Downloading required tools and dependencies...
Creating local environment in ~/.vkdr
Installing arkade, kubectl, k3d, jq, yq, Helm, Glow, vault...
VKDR environment is ready to use!
```

> Depending on your system, some tools may already be installed and will be skipped.
> The exact tool versions and paths may vary depending on your OS.

**When to run `vkdr init`:**

- After the first installation (mandatory).
- After running `vkdr upgrade` (to refresh the environment).
- Anytime you want to reset or recreate the environment — VKDR is fully disposable.

## (Optional) Upgrade VKDR

The command `vkdr upgrade` downloads and installs the latest VKDR version.

Run the following command:

```bash
vkdr upgrade && vkdr init
```

Expected output (example):

```sh
Checking for VKDR updates...
VKDR is up-to-date.
Re-initializing environment...
Checking installed tools: arkade, kubectl, k3d, jq, yq, Helm, Glow, vault...
All tools are up-to-date.
VKDR environment is ready to use!
```

**When to run:**

- When a new VKDR version is released — to get the latest features, bug fixes, and improvements.
- Before starting a new development session if you haven’t upgraded in a while — ensures your environment is up-to-date.
- To fix issues in your local environment — running upgrade + init refreshes dependencies and resets the environment safely.

> You do **not** need to run this command every time you use VKDR — only when updating or refreshing your environment.

---

After completing `vkdr init`, your environment is ready. The next step is **Infrastructure Configuration**, where you will start your local Kubernetes cluster and prepare it for DevPortal and its dependencies. All the tools, configurations, and the local environment set up during initialization will be used automatically, so you can continue confidently without additional setup.

:::tip
Run `vkdr --help` anytime to explore all available commands and options.
This can be useful if you want to go beyond the basic steps shown here.
:::
