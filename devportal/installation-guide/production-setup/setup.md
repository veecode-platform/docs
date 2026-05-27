---
sidebar_position: 4
sidebar_label: Deploy to Kubernetes
title: Deploy DevPortal to Kubernetes
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This guide walks through deploying DevPortal V2 to a Kubernetes cluster using the reference manifest from the [devportal-platform repository](https://github.com/veecode-platform/devportal-platform/blob/main/examples/deploy/k8s.yaml).

## Prerequisites

- `kubectl` installed and configured against the target cluster
- Namespace created (`platform` by convention — see [Plan your setup](plan.md))
- Kubernetes Secret created with credentials for your preset combination

---

## Step 1: Create the credentials Secret

<Tabs groupId="providers">
<TabItem value="github" label="GitHub">

```bash
kubectl create secret generic devportal-secrets \
  --namespace platform \
  --from-literal=GITHUB_PAT=<personal-access-token> \
  --from-literal=GITHUB_ORG=<your-org> \
  --from-literal=GITHUB_AUTH_CLIENT_ID=<oauth-client-id> \
  --from-literal=GITHUB_AUTH_CLIENT_SECRET=<oauth-client-secret>
```

</TabItem>
<TabItem value="gitlab" label="GitLab">

```bash
kubectl create secret generic devportal-secrets \
  --namespace platform \
  --from-literal=GITLAB_HOST=gitlab.com \
  --from-literal=GITLAB_TOKEN=<personal-access-token> \
  --from-literal=GITLAB_AUTH_CLIENT_ID=<oauth-app-id> \
  --from-literal=GITLAB_AUTH_CLIENT_SECRET=<oauth-app-secret> \
  --from-literal=GITLAB_GROUP=<root-group>
```

</TabItem>
<TabItem value="azure" label="Azure">

```bash
kubectl create secret generic devportal-secrets \
  --namespace platform \
  --from-literal=AZURE_DEVOPS_TOKEN=<pat> \
  --from-literal=AZURE_DEVOPS_ORG=<org> \
  --from-literal=AZURE_DEVOPS_PROJECT=<project> \
  --from-literal=AZURE_AUTH_TENANT_ID=<tenant-id> \
  --from-literal=AZURE_AUTH_CLIENT_ID=<client-id> \
  --from-literal=AZURE_AUTH_CLIENT_SECRET=<client-secret>
```

</TabItem>
</Tabs>

---

## Step 2: Create the deployment manifest

Save the following as `devportal.yaml`. Adjust `VEECODE_PRESETS` and any literal env values for your setup, then replace the `value: "..."` lines with `secretKeyRef` entries pointing at the Secret you created above.

<Tabs groupId="providers">
<TabItem value="github" label="GitHub">

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: devportal-data
  namespace: platform
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 1Gi
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: devportal-plugins
  namespace: platform
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 2Gi
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: devportal-config
  namespace: platform
data:
  app-config.local.yaml: |
    app:
      baseUrl: https://devportal.example.com
    backend:
      baseUrl: https://devportal.example.com
      cors:
        origin: https://devportal.example.com
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: devportal
  namespace: platform
spec:
  replicas: 1
  selector:
    matchLabels: { app: devportal }
  template:
    metadata:
      labels: { app: devportal }
    spec:
      containers:
        - name: devportal
          image: veecode/devportal:2.0.0
          ports:
            - containerPort: 7007
          envFrom:
            - secretRef:
                name: devportal-secrets
          env:
            - name: VEECODE_PRESETS
              value: "recommended,veecode-theme,github,github-auth"
          volumeMounts:
            - { name: data,    mountPath: /app/data }
            - { name: plugins, mountPath: /app/dynamic-plugins-root }
            - { name: config,  mountPath: /app/app-config.local.yaml, subPath: app-config.local.yaml }
      volumes:
        - name: data
          persistentVolumeClaim: { claimName: devportal-data }
        - name: plugins
          persistentVolumeClaim: { claimName: devportal-plugins }
        - name: config
          configMap: { name: devportal-config }
---
apiVersion: v1
kind: Service
metadata:
  name: devportal
  namespace: platform
spec:
  selector: { app: devportal }
  ports:
    - port: 7007
      targetPort: 7007
```

</TabItem>
<TabItem value="gitlab" label="GitLab">

Same structure as the GitHub tab; change `VEECODE_PRESETS` to `"recommended,veecode-theme,gitlab"` and remove the GitHub-specific env entries. The Secret created in Step 1 is consumed via `envFrom: - secretRef: name: devportal-secrets`.

</TabItem>
<TabItem value="azure" label="Azure">

Same structure; change `VEECODE_PRESETS` to `"recommended,veecode-theme,azure,azure-auth"` and add `AZURE_DEVOPS_HOST: dev.azure.com` as a non-secret env entry. Secrets come from `envFrom`.

</TabItem>
</Tabs>

---

## Step 3: Apply the manifest

```bash
kubectl apply -f devportal.yaml
```

Watch the pod come up:

```bash
kubectl rollout status deployment/devportal -n platform
kubectl logs -f deployment/devportal -n platform
```

A successful boot shows lines like:

```
VEECODE: preset resolver — VEECODE_PRESETS=recommended,veecode-theme,github,github-auth
VEECODE: applying preset "recommended"
...
VEECODE: dynamic plugin includes → [...]
Running in PRODUCTION mode
```

If a required variable is missing, the container exits with code 78 and logs exactly which variable needs to be set.

---

## Step 4: Add an Ingress

Apply an Ingress to expose DevPortal externally (see [Plan your setup](plan.md) for an example manifest). Ensure the `app.baseUrl` and `backend.baseUrl` in the ConfigMap match the public hostname.

---

## Next steps

- Configure additional integrations — see [Auth & Integrations](/devportal/integrations)
- Review RBAC roles and assign them to users — see [RBAC](/devportal/rbac/permissions)
- Enable additional plugins via the marketplace in the DevPortal UI
