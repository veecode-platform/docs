---
sidebar_position: 8
sidebar_label: Configuration Hierarchy
title: Configuration Hierarchy
---

# Configuration Hierarchy

Backstage's native config system merges multiple `--config` files in the order
they are supplied. The merge is **deep** (object keys are combined) and
**last-wins** on scalar values: if two files set the same leaf key, the later
file's value survives. DevPortal's entrypoint assembles that `--config` chain
at boot from base distribution files, preset-generated files, and your
overrides. Knowing the chain tells you exactly where to put a setting and why it
takes effect — or why it doesn't.

**Quick answer — where do I put my override?**
- Operator customizations (branding, catalog locations, integration credentials): `app-config.local.yaml` (layer 5).
- Auth provider and SCM integration (set once per environment): selected via `VEECODE_PRESETS`, which generates the preset layer (layer 4). See [Presets](./presets.md).
- Plugin-specific backend config (Kubernetes cluster URLs, SonarQube base URL, etc.): also goes in `app-config.local.yaml`, or is injected via `pluginConfig` in `dynamic-plugins.yaml` (layer 6). See [Composing a Portal](./portal-composition.md) for the relationship between plugin loading and backend config.

---

## The precedence chain

Entries are listed lowest to highest priority. A file loaded later wins on any
overlapping key.

| Order | File | When loaded |
| --- | --- | --- |
| 1 | `app-config.yaml` | Base distribution defaults (shipped in the image) |
| 2 | `app-config.production.yaml` | Container / production overrides (shipped in the image) |
| 3 | `app-config.distro.yaml` | VeeCode distro defaults (~10 lines, escape hatch; shipped in the image) |
| 4 | `app-config.preset-<name>.yaml` | One per selected preset, in `VEECODE_PRESETS` order |
| 5 | `app-config.local.yaml` | **Your** operator overrides (volume-mounted `app-config.local.yaml` only) |
| 6 | `dynamic-plugins-root/app-config.dynamic-plugins.yaml` | Generated at boot from each enabled plugin's `pluginConfig:` |
| 7 | `app-config.saas.yaml` | Decoded from `VEECODE_APP_CONFIG` (base64); wins over all earlier layers |

Files 1–3 are always present inside the image. File 4 is emitted once per
preset that declares an `appConfig:` block, in `VEECODE_PRESETS` order. Files
5–7 are conditional — each is skipped if absent.

The source of truth is the `EXTRA_ARGS` construction in `entrypoint.sh`.

:::note This is not the V1 seven-layer profile chain
V2 has no `app-config.<profile>.yaml` layer. The profile slot (old layer 3) is
replaced by **one file per selected preset** (layer 4 above), assembled in
`VEECODE_PRESETS` order. See [Presets](./presets.md).
:::

---

## Where `app-config.local.yaml` sits

`app-config.local.yaml` is your primary customization target. It loads at
**position 5** — after every preset-generated config, so it **wins over preset
fragments**. You do not need to replicate anything from earlier files; supply
only the keys you want to override or add, and Backstage deep-merges the rest.

```bash
docker run \
  -v $(pwd)/app-config.local.yaml:/app/app-config.local.yaml:ro \
  veecode/devportal:2.2.0
```

### Example: override a single preset value

Suppose the `github` preset enables the GitHub catalog provider at a 30-minute
refresh frequency and you want 5 minutes. In your `app-config.local.yaml`:

```yaml
catalog:
  providers:
    github:
      default:
        schedule:
          frequency: { minutes: 5 }
```

Because `app-config.local.yaml` loads after all preset files, your `frequency`
wins. You do not repeat the rest of the provider block — the deep-merge keeps it.

:::note `VEECODE_APP_CONFIG` — config without a file mount
In deployments where you cannot mount a file (ArgoCD managing plain manifests,
a CI-injected environment, or the VeeCode SaaS), encode your operator config as
base64 and pass it as `VEECODE_APP_CONFIG`. The entrypoint decodes it into
`/app/app-config.saas.yaml` (position 7), which wins over everything — preset
configs, plugin configs, and any mounted `local.yaml`. Use it for
deployment-specific values (database URLs, ingress hosts, secret references)
that must not be hardcoded.
:::

---

## Variable substitution

Any value in any config file may contain `${VAR}` or `${VAR:-default}`.
Backstage resolves these from the process environment at startup, **after** all
`--config` files are merged.

- `${VAR}` — replaced with the env value; if the variable is unset it resolves
  to an empty string (Backstage does not error).
- `${VAR:-default}` — replaced with the env value if set; falls back to
  `default` otherwise.

If a preset declares a variable as `required: true`, the entrypoint validates it
**before** Backstage starts. A missing required var exits with code **78**, so
substitution never runs on an incomplete environment. See
[Presets](./presets.md) for the full validation flow.

Substitution applies equally to all files in the chain. The chain position only
controls which file's *containing key* wins, not the substitution outcome.

:::warning `app.title` is baked at build time
`app.title` is compiled into the frontend bundle at image build time and
**cannot be overridden at runtime** through `app-config.local.yaml` or any
later layer. Runtime config overrides apply to backend-read keys and frontend
config delivered at boot, but the window title is fixed in the built bundle.
:::

---

## Inspecting and debugging the chain

To see the assembled `--config` flags and their order:

```bash
docker logs <container> 2>&1 | grep -E "EXTRA_ARGS|preset"
```

If a setting is not taking effect, check, in order:

1. Which layer is setting the conflicting value.
2. Whether a higher-priority layer (a later file in the chain) is overriding it.
3. Whether the key path is correct (e.g. `app.branding.theme.light.palette.*`).
4. Whether a `${VAR}` substitution resolved to something other than you expect.

Backstage does not expose a stock "merged config" endpoint. Verify a setting
either by reading the boot logs (many keys emit a `Found N config(s)` or
`Configured for ...` line) or by testing the behavior the key controls.

---

## Related

- [Presets](./presets.md) — the preset model and how preset configs (layer 4)
  are generated.
- [Dynamic Plugins](./dynamic-plugins.md) — how
  `app-config.dynamic-plugins.yaml` (layer 6) is built.
- [Composing a Portal](./portal-composition.md) — how `app-config` backend
  sections relate to plugin loading and entity annotations.
- For branding-specific keys, see [Simple Branding](../customization/branding.md).
