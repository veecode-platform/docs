---
sidebar_position: 3
sidebar_label: Global Header
title: VeeCode Global Header Plugin
---

# VeeCode Global Header Plugin

The VeeCode Global Header plugin provides the unified top navigation bar across all DevPortal pages. It includes search, notifications, starred items, theme toggle, and the user profile dropdown.

**Status:** Always loaded (preInstalled). No `dynamic-plugins.yaml` entry required.

---

## Package

`veecode-platform-plugin-veecode-global-header-dynamic`

---

## What it does

The header mounts at `application/header` and adds the following components to the `global.header/component` mount point:

| Component | Mount point priority | Description |
|---|---|---|
| `SearchComponent` | 100 | Global search bar |
| `StarredDropdown` | 70 | Quick access to starred entities |
| `ToggleThemeButton` | 75 | Light/dark theme switcher |
| `NotificationButton` | 60 | Notifications bell |
| `PendingChangesButton` | 55 | (from Pending Changes plugin) Restart-pending indicator |
| `Divider` | 90 | Visual separator |
| `ProfileDropdown` | 10 | User avatar with Settings and Sign Out |

---

## Profile dropdown items

| Item | Link |
|---|---|
| Settings | `/settings` |
| My profile | User entity page |
| Sign out | Auth sign-out |

---

## Customization

Additional components can be injected into the header by adding entries to the `global.header/component` mount point in `dynamic-plugins.yaml`. See [Wiring a Frontend Plugin](../development/wiring) for the configuration syntax.
