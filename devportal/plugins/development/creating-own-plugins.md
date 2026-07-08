---
sidebar_position: 20
sidebar_label: Creating Your Own Plugin
title: "Creating Your Own Plugin"
---

[Bootstrapping](./bootstrap.md) through [Wiring](./wiring.md) cover the mechanical steps of building a plugin. This page covers what those steps don't: what actually happens once a dynamic plugin runs inside a production DevPortal instance. It's grounded in shipping one — a custom theme plugin — to production without forking the base image, plus the loader-behavior gotchas that surfaced along the way.

## Build with `export-dynamic`, not `package build`

If your plugin imports CSS (common for anything touching styling or a custom UI shell), export it with the RHDH CLI's dynamic-export path:

```bash
npx @red-hat-developer-hub/cli@latest plugin export
```

Do not build it with `@backstage/cli package build` and try to load the result as a dynamic plugin. That path breaks on how Rollup handles CSS imports — a stylesheet imported in your plugin's `index.ts` is silently dropped instead of bundled. `export-dynamic` is the only reliable way to ship global CSS with a dynamic plugin.

## Iterate locally without publishing

You don't need `npm publish` or a local registry like Verdaccio to test changes during development. Export, then mount the result directly into a running container:

```bash
npx @red-hat-developer-hub/cli@latest plugin export
docker rm -f devportal-dev 2>/dev/null
docker run -d --name devportal-dev \
  -v "$(pwd)/dist-dynamic:/app/dynamic-plugins-root/your-plugin-id:ro" \
  -v "$(pwd)/dynamic-plugins.yaml:/app/dynamic-plugins.yaml:ro" \
  -v "$(pwd)/app-config.local.yaml:/app/app-config.local.yaml:ro" \
  -p 7007:7007 \
  veecode/devportal:latest
```

Re-export and `docker rm -f && docker run` again after each change. This is a much tighter loop than round-tripping through a registry for every iteration — save publishing for when you actually need to distribute the plugin.

## The wiring surface is bigger than one example shows

[Wiring a Frontend Plugin](./wiring.md) demonstrates `dynamicRoutes`. That's one of several `dynamicPlugins.frontend.<plugin-id>` keys the loader understands — `mountPoints` (used throughout [Adding Plugins](../adding.md) for entity-page cards) and `appIcons` and `entityTabs` are others. Before assuming a customization isn't possible, check whether it's exposed as one of these keys rather than requiring a fork — the real surface is broader than any single plugin's config tends to show.

One specific, non-obvious case: the `/` home route itself is overridable. Disable the default home page (`disabled: true` on its entry) and register your own via `dynamicRoutes` in its place.

### Collision semantics differ by key

If two plugins (or your plugin and a bundled default) declare the same route, icon, or tab, what wins depends on **which key** you're using — this is not a single consistent rule:

| Key | Collision behavior |
|---|---|
| `dynamicRoutes` | First-registered wins. No dedupe, no warning. |
| `appIcons` | Last-merged wins (later config overwrites earlier). |
| `entityTabs` | Explicit `console.warn` logged on collision — check backend logs if a tab silently isn't where you expect. |

Don't assume the rule for one key applies to another.

## Theming and MUI-layer traps

If your plugin touches styling (a custom theme, a header, or any component with hand-written CSS), three MUI/Backstage-UI layering quirks caused real breakage while building VeeCode's own theme plugin:

- **`createUnifiedTheme` (v4/JSS) only accepts flat root-level style props for a component** — you can't target a nested selector the way you would in plain MUI. If you need to reach a nested element, write the CSS against a substring/tag selector instead of relying on the theme override to reach it.
- **v4 and v5 class-name prefixes differ.** A selector you hand-write against a v5-style class name (`.MuiButton-root`) silently won't match if the component actually renders under the v4 prefix, or vice versa — target the HTML tag or a `data-*` attribute when you're not sure which version a given bundled component uses.
- **The page canvas background isn't part of the MUI palette.** It's driven by a Backstage-UI CSS variable, `--bui-bg-app`, entirely outside `theme.palette`. Overriding `palette.background.default` won't change it — you have to set the CSS variable directly.

## Dependency `resolutions` don't reach into your plugin

If the host DevPortal image sets a `resolutions` entry to pin a shared dependency version, that does **not** propagate into your plugin's own bundled dependencies. The dynamic-plugin loader resolves each plugin's dependencies locally — there's no hoisting from the host. If your plugin needs a specific version of something the host also uses, pin it in your own `package.json`; don't rely on the host's resolution.

## Publishing your own plugin as an OCI artifact

[Packaging your Plugin](./packaging.md#packaging-options) covers `plugin package` as an alternative to `plugin export` when you want an OCI artifact instead of an npm package. The reference needs the trailing `!<selector>` even when the image contains only one plugin — omitting it produces an opaque `not enough values to unpack` error at load time, not a clear "missing selector" message.

## Embedding an iframe? Check `frame-src`, not just `img-src`

If your plugin embeds an external tool (a dashboard, a status page) via `<iframe>`, the relevant Content-Security-Policy directive is `backend.csp.frame-src`, not `img-src`. A missing `frame-src` entry blocks the embed with **no network error at all** — just a blank space where the iframe should be. See [External domains and CSP](../../customization/branding.md#external-domains-and-csp) for how CSP overrides work in this image (the same array-replace-not-merge rule applies).

## Know your ceiling

Some things genuinely require forking the base image — no config surface reaches them:

- The shell structure itself (`Sidebar`, `AppRouter`) — these are React components, not configuration.
- The base entity-tab component — you can add tabs via `entityTabs`, but not replace the tab shell itself.
- Catalog table columns.
- Icons that are imported directly into a component rather than resolved through the icon registry.

If your requirement lands on one of these, plan for a fork or a support request rather than looking for a YAML key that doesn't exist.
