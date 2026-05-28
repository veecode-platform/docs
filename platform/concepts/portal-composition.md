---
sidebar_position: 3
sidebar_label: Composing a Portal
title: Composing a Portal
---

# Composing a Portal

A developer portal out of the box is a service catalog and a template runner: teams can register services, create new ones from templates, and browse the software landscape. That is **Day-0** — the portal knows what exists and can create things, but it doesn't connect to anything live yet.

The value engineers actually care about — seeing pod status, triggering a deployment, checking code quality, browsing dashboards without leaving the service page — comes from **plugin composition**. This page explains the model conceptually. For the exact configuration mechanics, see the DevPortal guide: [Composing a Portal (DevPortal)](/devportal/concepts/portal-composition).

---

## Three levels of composition

Every plugin activates across three layers. All three must be in place before a developer sees live data.

1. **Load** — the plugin's code is made available to the portal (in DevPortal, via a preset or a `dynamic-plugins.yaml` entry). Loading alone shows nothing.
2. **Context** — a catalog entity declares, through an **annotation** in its `catalog-info.yaml`, that the plugin applies to it. Plugins are context-aware by design: they attach to the specific entities that opt in, not to a global tab.
3. **Backend** — configuration tells the plugin where to fetch data (cluster URL, API base URL, credentials).

This is transparency over magic: nothing appears "automatically." Each layer is an explicit, inspectable decision.

### Diagnosing by symptom

A plugin that fails to show data has failed at one of these layers. Diagnose in order — load, then context, then backend.

| Symptom | Layer at fault | Direction |
|---|---|---|
| Plugin absent everywhere (or the container won't boot) | Load — not enabled, or install failed | Confirm it's enabled and that the install succeeded |
| Tab missing on a specific entity | Context — annotation missing | Add the annotation to that entity's `catalog-info.yaml` |
| Tab present but empty or erroring | Backend — config missing or unreachable | Configure the integration backend and check connectivity |

---

## The Day-0 → Day-1 → Day-2 progression

Composition is a deliberate sequence, not a one-time setup:

- **Day-0 — Foundation.** Catalog populated, software templates defined, authentication and source-control wired. The portal knows what exists and can create new services along your Golden Paths.
- **Day-1 — Connect services to tooling.** Enable the relevant plugins, annotate catalog entities so each declares what it owns, and configure the backends those plugins query.
- **Day-2 — The operational hub.** Developers operate services without leaving the portal: CI/CD status, Kubernetes workloads, and code quality all surface on the entity itself.

---

## Where this is configured

The three-layer model is the same across DevPortal versions; what differs is the configuration surface (V2 composes plugins with `VEECODE_PRESETS`; the legacy distro used a single `VEECODE_PROFILE`). For the concrete steps — enabling plugins, the annotation reference table, the fail-fast install diagnostics, and a full worked example — follow the version-specific guide:

- **[Composing a Portal (DevPortal)](/devportal/concepts/portal-composition)** — the load/context/backend mechanics, plugin→annotation reference, and diagnostics for your DevPortal version.
- **[Platform Capabilities](/platform/capabilities/platform-capabilities)** — the capability layers plugins realize.
- **[Golden Paths](/platform/concepts/golden-paths)** — the strategy templates implement.
