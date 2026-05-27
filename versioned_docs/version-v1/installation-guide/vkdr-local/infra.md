---
sidebar_position: 3
sidebar_label: Infrastructure Setup
title: Infrastructure Setup
---

In this step, you will configure the local infrastructure that will run **DevPortal** and its dependencies, emulating a real cloud scenario.

## Steps Overview

In this section, you will:

1. **Start a local cluster** to provide the runtime environment.
2. **Create host entries** to make DevPortal and services accessible via friendly domains.

By the end, you will have a fully running local cluster ready to host DevPortal.

## Step 1: Start a Local Cluster

Running `vkdr infra up` starts a lightweight Kubernetes cluster using k3d, a tool that simplifies the process of creating and managing "fake" Kubernetes clusters in Docker. The cluster will be used to run DevPortal and its dependencies.

Run the following command:

```sh
vkdr infra up
```

Expected output (example):

```sh
VKDR Local Infra Start Routine
Ports Used: 8000/http :8001/https
Kubernetes API port: random
Local Docker Hub Registry Mirror: 6000
INFO: Creating Kubernetes nodes and registries...
INFO: Starting LoadBalancer and tools node...
INFO: Cluster 'vkdr-local' created successfully!
INFO: You can now interact with the cluster using kubectl.
Script executed successfully.
```

After this step, the following will be available:

- A local Kubernetes cluster running under Docker.
- Ports **8000** and **8001** bound to HTTP and HTTPS of the first LoadBalancer in the cluster (DevPortal will configure this automatically).
- Local **registry mirrors** (starting from port 6000) to speed up Docker image downloads, even when recycling the cluster.

### Check Cluster Status

Verify that the local Kubernetes cluster is running by listing the k3d containers.

Run the following command:

```sh
docker ps --filter "name=vkdr"
```

Expected output (example):

```sh
CONTAINER ID   IMAGE                            COMMAND                  CREATED       STATUS       PORTS                                                                  NAMES
f91279d084f1   ghcr.io/k3d-io/k3d-proxy:5.8.3   "/bin/sh -c nginx-pr…"   5m ago        Up 2m        0.0.0.0:8000->80/tcp, 0.0.0.0:8001->443/tcp, 0.0.0.0:60068->6443/tcp   k3d-vkdr-local-serverlb
5b93055b88cf   rancher/k3s:v1.31.5-k3s1         "/bin/k3d-entrypoint…"   5m ago        Up 2m                                                                               k3d-vkdr-local-server-0

```

> - Output may vary depending on your environment (container IDs, ports, or node names).
> - You should see at least one container named `k3d-vkdr-local-server-0` (or similar) — this is the master node, and it must be running.
> - Other containers, like the load balancer (`k3d-vkdr-local-serverlb`), may also appear. The total number of containers can vary.
> - The key thing to check: all cluster containers have `STATUS` as `Up`. This confirms your local Kubernetes cluster is running correctly.
> - At this point, the DevPortal itself is not running yet; this step only verifies the infrastructure is ready for deployment.

## Step 2: Create Host Entries

To access DevPortal and other services in your local cluster, you need friendly domain names instead of raw IPs. This is done by adding entries to your `/etc/hosts` file.

Run the following command (or edit your hosts file manually):

```sh
echo "127.0.0.1 devportal.localhost manager.localhost petclinic.localhost" | sudo tee -a /etc/hosts
```

Expected result (example):

```sh
127.0.0.1 devportal.localhost manager.localhost petclinic.localhost
```

This maps `devportal.localhost`, `manager.localhost`, and `petclinic.localhost` to your local machine, so you can open DevPortal and sample applications in a browser as usual.

### Check Host Entries

Run the following command:

```sh
ping -c 1 devportal.localhost
```

Expected output (example):

```sh
PING devportal.localhost (127.0.0.1): 56 data bytes
64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.141 ms
...
```

Check the manager entry:

```sh
ping -c 1 manager.localhost
```

Expected output (example):

```sh
PING manager.localhost (127.0.0.1): 56 data bytes
64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.093 ms
...
```

> Note: Response times and details may vary depending on your system. The important part is receiving replies from `127.0.0.1`, which confirms that host entries are correctly configured and DevPortal will be accessible via the friendly domains.

---

After creating the host entries, your infrastructure is ready. Next, you’ll configure GitHub access by generating a personal token so DevPortal can securely connect to your repositories.

:::tip How to Stop the Local Cluster

When you’re finished with development or need to free up system resources, you can stop the local Kubernetes cluster using `vkdr infra down`. This safely shuts down the cluster and removes temporary resources, while keeping your `~/.vkdr` environment and configuration intact.

**Do not run this command now** — the cluster must stay running for the next step, DevPortal Deployment. If, for any reason, you have already stopped the cluster, run `vkdr infra up` to start it again before proceeding.

:::
