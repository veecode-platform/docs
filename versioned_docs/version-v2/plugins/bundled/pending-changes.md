---
sidebar_position: 7
sidebar_label: Pending Changes
title: Pending Changes Plugin
---

# Pending Changes Plugin

The Pending Changes plugin adds a badge to the Global Header indicating that plugin configuration changes have been saved but not yet applied. It signals that a pod restart is needed to activate the changes.

**Status:** Always loaded (preInstalled). No `dynamic-plugins.yaml` entry required.

---

## Package

`devportal-pending-changes-dynamic`

---

## What it does

- Polls for pending plugin changes every 30 seconds (configurable)
- Displays a badge next to the Notifications bell in the header when changes are pending
- Clicking the badge navigates to the restart/apply flow in the customer portal

---

## Mount point configuration

```yaml
pluginConfig:
  dynamicPlugins:
    frontend:
      devportal.pending-changes:
        mountPoints:
          - mountPoint: global.header/component
            importName: PendingChangesButton
            config:
              priority: 55
              props:
                pollingIntervalMs: 30000
```

To change the polling interval, override `pollingIntervalMs` in your `dynamic-plugins.yaml`.
