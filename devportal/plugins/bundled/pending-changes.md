---
sidebar_position: 7
sidebar_label: Pending Changes
title: Pending Changes Plugin
---

# Pending Changes Plugin

The Pending Changes plugin adds an indicator to the global header that appears after a Marketplace install or uninstall. It signals that the selection is saved but not yet applied, and that the stack needs a restart to install or remove the plugin.

**Status:** Default plugin, enabled by default. No chart values entry is required.

---

## Package

`devportal-pending-changes-dynamic`

---

## What it does

- Polls for unsaved plugin changes every 30 seconds
- Displays an indicator in the header when a Marketplace change is waiting for a restart
- Clears once the stack restarts and the installer applies the selection

---

## Configuration

The default plugin file (`dynamic-plugins.veecode.yaml`) enables the package and mounts its button into the header:

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

To change the polling interval, copy this whole `pluginConfig` block into an override entry for the same package and edit `pollingIntervalMs` in place. Match the entry by registry, repository, and the plugin path after `!`, and use the `{{inherit}}` tag to keep the version the default plugin file pins. An override that sets `pluginConfig` replaces the whole block (no merge), so keep the mount point entry intact. See [Adding Plugins](../adding.md) for the Kubernetes and local-stack override forms.

## Turn it off

Add the override entry with the `{{inherit}}` tag and the full `!<plugin path>` part, plus `disabled: true`, under `global.dynamic.plugins` on Kubernetes or in the operator plugin file on the local stack. On Kubernetes write the tag as `{{ "{{inherit}}" }}`; in the operator plugin file write `{{inherit}}` as is:

```yaml
plugins:
  - package: oci://quay.io/veecode/devportal-pending-changes-dynamic:{{inherit}}!devportal-pending-changes-dynamic
    disabled: true
```

Without the indicator there is no header signal for a pending Marketplace change; the install still applies on the next full stack restart. See [Adding Plugins](../adding.md) for where to put this entry and how to apply it.
