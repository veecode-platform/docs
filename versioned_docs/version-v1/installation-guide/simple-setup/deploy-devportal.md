---
sidebar_position: 5
sidebar_label: Deploy VeeCode DevPortal
title: Deploy VeeCode DevPortal
---

With `values.yaml` ready, deploy using Helm:

```bash
helm repo add veecode-devportal https://veecode-platform.github.io/next-charts
helm repo update veecode-devportal
helm upgrade --install veecode-devportal --values values.yaml veecode-devportal/veecode-devportal
```

After rollout, access the DevPortal at your configured host.

More details: [DevPortal chart on Artifact Hub](https://artifacthub.io/packages/helm/veecode-platform-next/veecode-devportal)
