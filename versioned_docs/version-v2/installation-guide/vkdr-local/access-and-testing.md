---
sidebar_position: 6
sidebar_label: Access and Testing
title: Access and Testing
---

This section guides you through **verifying and accessing DevPortal V2** after a local VKDR install.

## Steps Overview

In this section, you will:

1. **Verify the pod is healthy** — confirm DevPortal V2 is running and responding.
1. **Access DevPortal** — open the web interface in your browser.
1. **Explore the Catalog** — browse components catalogued in DevPortal.
1. **Explore the APIs menu** — check the list of APIs in the cluster.
1. **Explore the Create menu** — browse scaffolder templates.
1. **Explore the Settings menu** — check personal preferences and interface configuration.
1. **Explore the Clusters menu** — view your local Kubernetes cluster (if `--with-kubernetes` was used).

## Step 1: Verify the Pod is Healthy

Wait for the pod to become Ready:

```sh
kubectl rollout status deploy/veecode-devportal-platform \
  -n platform --timeout=5m
```

Confirm the health endpoint responds:

```sh
curl -sf http://devportal.localhost:8000/healthcheck && echo OK
```

Expected output:

```
OK
```

If the pod does not become Ready, check its logs for the root cause:

```sh
kubectl logs -n platform -l app.kubernetes.io/name=veecode-devportal-platform --tail=50
```

:::tip
A missing required preset credential causes DevPortal to exit with code 78 at startup. The log will identify the missing variable. Add it to your credentials and re-run `vkdr devportal-platform install`.
:::

## Step 2: Access DevPortal

Open your browser and navigate to:

> http://devportal.localhost:8000

The DevPortal interface should load. If you installed the `github-auth` preset, you will be prompted to sign in with GitHub. Without an identity preset, the instance allows guest access.

## Step 3: Explore the Catalog

1. Click **Catalog** in the sidebar.
1. If you deployed with `--samples`, you should see the sample components registered automatically.
1. Click on any component to view its details, documentation, and integrations.

## Step 4: Explore the APIs Menu

1. Click **APIs** in the sidebar.
1. If sample applications were installed, their API components will appear here.
1. Click on an entry to explore its API details and documentation.

## Step 5: Explore the Create Menu

1. Click **Create** in the sidebar.
1. You should see the scaffolder templates available for creating new components.
1. Refer to [Backstage Software Templates](https://backstage.io/docs/features/software-templates/) for detailed usage instructions.

## Step 6: Explore the Settings Menu

1. Click **Settings** in the sidebar.
1. You will see options for personal preferences and interface configuration.

## Step 7: Explore the Clusters Menu

If you deployed with `--with-kubernetes`:

1. Click **Clusters** in the sidebar.
1. You should see `cluster-vkdr-local` representing the local VKDR Kubernetes cluster.
1. Clicking it shows cluster status, nodes, and workloads.

---

With these steps completed, your DevPortal V2 local setup is fully operational. You are ready to explore, test, and prototype components and workflows in your local environment.

## Remove the Environment

When you are finished, remove DevPortal V2:

```sh
vkdr devportal-platform remove
```

To also tear down the local cluster:

```sh
vkdr infra down
```
