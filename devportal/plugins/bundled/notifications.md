---
sidebar_position: 11
sidebar_label: Notifications
title: Notifications Plugin
---

# Notifications Plugin

The Notifications plugin gives every user a notification list at `/notifications`, reached from the **Notifications** sidebar entry, and shows a bell with the unread count in the header. Other systems address notifications to users through the backend REST API with a service credential.

**Status:** A default plugin, enabled in the default plugin file (`dynamic-plugins.veecode.yaml`). No `dynamic-plugins.yaml` entry required.

---

## Packages

| Package | Role |
|---|---|
| `backstage-plugin-notifications` | Frontend — notification list at `/notifications` |
| `backstage-plugin-notifications-backend` | Backend — stores notifications and serves `/api/notifications/notifications` |

Signals (`backstage-plugin-signals` and its backend) ships among the default plugins as well.

---

## What it does

- Lists each user's notifications at `/notifications`
- Shows a bell with the unread count in the header
- Accepts new notifications from other systems at `POST /api/notifications/notifications`
- Returns a user's notifications at `GET /api/notifications/notifications`

A notification that arrives while `/notifications` is open appears after you reload the page.

---

## Allow another system to send notifications

The backend accepts a post only with a service credential. A request with a user token fails with HTTP 403. Create a static token for the sending system under `backend.auth.externalAccess`. Generate a long random value and keep it in an environment variable; never write the token in a file:

```bash
export NOTIFICATIONS_STATIC_TOKEN="$(openssl rand -hex 32)"
```

Add the block below to a configuration fragment. The token resolves from the environment when the portal starts:

```yaml
backend:
  auth:
    externalAccess:
      - type: static
        options:
          token: ${NOTIFICATIONS_STATIC_TOKEN}
          subject: notifications-sender
```

### Local stack

Save the fragment as `app-config.notifications.yaml` next to `docker-compose.yml`. Save this override as `docker-compose.notifications.yaml`. The Compose `command` replaces the base command, so repeat the local stack's chain and add the fragment last:

```yaml
services:
  devportal:
    volumes:
      - ./app-config.notifications.yaml:/opt/app-root/src/app-config.notifications.yaml:ro
    environment:
      NOTIFICATIONS_STATIC_TOKEN: ${NOTIFICATIONS_STATIC_TOKEN:?set NOTIFICATIONS_STATIC_TOKEN}
    command:
      - --config
      - dynamic-plugins-root/app-config.dynamic-plugins.yaml
      - --config
      - app-config.veecode-auth.yaml
      - --config
      - app-config.veecode-branding.yaml
      - --config
      - app-config.extensions.yaml
      - --config
      - app-config.veecode-product.yaml
      - --config
      - app-config.notifications.yaml
```

Restart the stack with both files (see [Add configuration to the local stack](../../installation-guide/docker-local/custom-config.md)):

```bash
docker compose -f docker-compose.yml -f docker-compose.notifications.yaml down
docker compose -f docker-compose.yml -f docker-compose.notifications.yaml up -d
```

### Kubernetes

Add the same block under `upstream.backstage.appConfig` in your values, with the token read from the runtime Secret. Helm replaces the chart's `externalAccess` list with yours instead of merging them, so repeat the chart's own `legacy` entry next to the static one. Without it, the chart's `legacy` access with `BACKEND_SECRET` is no longer configured:

```yaml
upstream:
  backstage:
    extraEnvVarsSecrets:
      - veecode-runtime-secrets
    appConfig:
      backend:
        auth:
          externalAccess:
            - type: legacy
              options:
                subject: legacy-default-config
                secret: ${BACKEND_SECRET}
            - type: static
              options:
                token: ${NOTIFICATIONS_STATIC_TOKEN}
                subject: notifications-sender
```

Add `NOTIFICATIONS_STATIC_TOKEN` to the `veecode-runtime-secrets` Secret and upgrade the release (see [Install DevPortal on Kubernetes](../../installation-guide/production-setup/setup.md)).

---

## Send a notification

Post to the backend with the static token. Pass the token value as-is in the header:

```bash
curl -X POST http://localhost:7007/api/notifications/notifications \
  -H "Authorization: Bearer $NOTIFICATIONS_STATIC_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"recipients":{"type":"entity","entityRef":"user:default/admin"},"payload":{"title":"Deploy finished","description":"Version 1.4.0 reached production.","link":"/notifications","severity":"high","topic":"deploys"}}'
```

The recipients select users by entity reference. The payload carries the title, a description, a link, a severity, and a topic. A post with a user token instead of the static token fails with HTTP 403. A successful post returns HTTP 200, and the stored notification records the token subject as its origin.

---

## Read notifications

Read the list back as the recipient user:

```bash
curl http://localhost:7007/api/notifications/notifications \
  -H "Authorization: Bearer <user token>"
```

The response is a JSON object with a `totalCount` field and a `notifications` array.
