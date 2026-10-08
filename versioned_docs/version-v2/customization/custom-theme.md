---
sidebar_position: 5
sidebar_label: Custom theme plugin
title: Custom theme plugin
---

For simple color and logo changes, prefer [Simple branding](./branding.md) or the
[environment-variable overrides](./theme-hack.md) — no build step, no plugin. Reach for a
**custom theme plugin** when you need full control: your own MUI component overrides, a bespoke
typography scale with a self-hosted font, per-mode design tokens, or custom components mounted
into the app shell. A theme plugin is a frontend dynamic plugin that **replaces** the built-in
Backstage themes, so it survives image upgrades without forking DevPortal.

## When to use each option

| Approach | Build step | Scope |
|----------|-----------|-------|
| [Simple branding](./branding.md) (`app.branding.theme.*`) | No | Palette, typography, logo — the fastest lever |
| [Theme overrides](./theme-hack.md) (`THEME_*` env vars) | No | Low-level JSON merge into the theme file |
| **Custom theme plugin** (this page) | Yes (`rhdh-cli plugin export`) | All of the above **plus** MUI/Backstage `styleOverrides`, custom components, global CSS |

## Anatomy of a theme plugin

```
plugins/my-theme/
├── package.json            # role: frontend-plugin, scalprum block, sideEffects: ["**/*.css"]
└── src/
    ├── index.ts            # font/CSS imports (side effects) + public exports
    ├── plugin.ts           # createPlugin({ id: 'my-theme' })
    ├── providers.tsx       # UnifiedThemeProvider wrappers (the importNames the app mounts)
    ├── styles/
    │   └── component-fixes.css   # global CSS for the legacy (MUI v4) layer
    ├── components/
    │   └── BrandBadge.tsx  # optional: a custom component to mount in the header
    └── themes/
        ├── tokens.ts        # single source of truth for every design scale
        ├── typography.ts    # font family + modular type scale
        ├── components.ts    # makeComponents(mode) — MUI + Backstage styleOverrides
        ├── myLightTheme.ts  # createUnifiedTheme({ palette, pageTheme, typography, components })
        └── myDarkTheme.ts
```

Two `package.json` fields are easy to miss and both are load-bearing:

```json
{
  "backstage": { "role": "frontend-plugin", "supported-versions": "1.49.4" },
  "sideEffects": ["**/*.css"],
  "scalprum": {
    "name": "my-org.plugin-my-theme",
    "exposedModules": { "PluginRoot": "./src/index.ts" }
  }
}
```

- `sideEffects: ["**/*.css"]` keeps the bundler from tree-shaking away your `import './x.css'`
  side-effect imports — without it your fonts and global CSS silently vanish from the bundle.
- The `scalprum.name` (`my-org.plugin-my-theme`) is the key you use under
  `pluginConfig.dynamicPlugins.frontend.<name>` when you enable the plugin.

## 1. Design tokens — one source of truth

Put every scale (color, radius, elevation, spacing, state) in `tokens.ts` and read from it
everywhere. No MUI import here — these are plain values.

```ts
// src/themes/tokens.ts
const navyRGB = '12, 21, 87';

export const tokens = {
  brand: {
    navy: '#0c1557', blue: '#076cfe', link: '#0a5fd9',
    ink: '#101820', canvas: '#f3f5f8', paper: '#ffffff',
    sidebarText: '#c3c8db',
    dark: { canvas: '#101820', paper: '#17202b', primary: '#4d94ff', text: '#eef1fb', textSecondary: '#a6adca' },
  },
  chrome: '#161d2e',       // sidebar / persistent frame
  chromeDeep: '#0f1523',   // submenu depth stop
  // A hairline tinted with the brand color reads on a LIGHT surface but is
  // invisible on a DARK one — so keep a separate light-tinted hairline for dark.
  hairline: `rgba(${navyRGB}, 0.10)`,
  hairlineDark: 'rgba(233, 238, 252, 0.13)',
  radius: { sm: 6, md: 8, lg: 12 },
  density: { rowHeight: 44, inputHeight: 40, buttonHeight: 36 },
  state: {
    hoverOverlay: `rgba(${navyRGB}, 0.05)`,
    hoverOverlayDark: 'rgba(233, 238, 252, 0.06)',
    focusRing: '#076cfe',
    disabledOpacity: 0.38,
  },
  elevation: {
    e0: 'none',
    e1: `0 1px 2px rgba(${navyRGB}, 0.05), 0 4px 12px rgba(${navyRGB}, 0.06)`,
    e2: `0 2px 4px rgba(${navyRGB}, 0.06), 0 12px 28px rgba(${navyRGB}, 0.10)`,
  },
  // Navy shadows vanish on dark surfaces — use a near-black base so elevation still reads.
  elevationDark: {
    e0: 'none',
    e1: '0 1px 2px rgba(4, 7, 15, 0.50), 0 4px 12px rgba(4, 7, 15, 0.45)',
    e2: '0 2px 4px rgba(4, 7, 15, 0.55), 0 12px 28px rgba(4, 7, 15, 0.55)',
  },
} as const;

export type ThemeMode = 'light' | 'dark';
```

:::note
The hairline/elevation split above is the single most useful lesson from theming both modes: a
value tuned for light almost never works on dark. Design the two scales up front; don't discover
it component by component.
:::

## 2. The themes

Each theme is a `createUnifiedTheme` call. Reuse the built-in `palettes.light` / `palettes.dark`
and override only what you need. Register the theme under id `light` / `dark` (done later in the
dynamic-plugins config) to **replace** the stock themes.

```ts
// src/themes/myLightTheme.ts
import { createUnifiedTheme, genPageTheme, palettes, shapes } from '@backstage/theme';
import { makeComponents } from './components';
import { typography } from './typography';
import { tokens } from './tokens';

// A subtle two-stop page banner — not an "AI gradient".
const header = genPageTheme({ colors: [tokens.brand.navy, '#0a1145'], shape: shapes.wave });

export const myLightTheme = createUnifiedTheme({
  palette: {
    ...palettes.light,
    primary: { main: tokens.brand.blue },
    secondary: { main: tokens.brand.navy },
    background: { default: tokens.brand.canvas, paper: tokens.brand.paper },
    // NOTE: do NOT spread `palettes.light.text` here — `text` is not part of the exported
    // palette type, so the spread fails `tsc` in a workspace build. Set the keys directly.
    text: { primary: tokens.brand.ink, secondary: '#445067' },
    link: tokens.brand.link,
    linkHover: tokens.brand.blue,
    // navigation.* drives the sidebar. Painting it with your chrome color here is
    // what turns the sidebar into a solid brand frame.
    navigation: {
      ...palettes.light.navigation,
      background: tokens.chrome,
      indicator: '#4d94ff',
      color: tokens.brand.sidebarText,
      selectedColor: '#ffffff',
      navItem: { hoverBackground: 'rgba(233, 238, 252, 0.06)' },
      submenu: { background: tokens.chromeDeep },
    },
  },
  defaultPageTheme: 'home',
  pageTheme: {
    home: header, documentation: header, tool: header, service: header,
    website: header, library: header, other: header, app: header, apis: header,
  },
  typography,
  components: makeComponents('light'),
});
```

The dark theme is the same shape with `palettes.dark`, the dark canvas/paper from your tokens,
and `makeComponents('dark')`. Validate every foreground/background pair for WCAG AA contrast —
the dark primary usually needs to be a lighter blue than the light one.

## 3. Component overrides — the `makeComponents(mode)` factory

This is where a theme plugin earns its keep. Make `components` a **factory** keyed on the mode so
light and dark share one visual language but resolve mode-aware scale values (hairline, shadow,
hover overlay). Every value comes from `tokens` — no literals here.

```ts
// src/themes/components.ts
import type { UnifiedThemeOptions } from '@backstage/theme';
import { tokens, type ThemeMode } from './tokens';

export const makeComponents = (mode: ThemeMode): UnifiedThemeOptions['components'] => {
  const dark = mode === 'dark';
  const hairlineColor = dark ? tokens.hairlineDark : tokens.hairline;
  const hairline = `1px solid ${hairlineColor}`;
  const elev = dark ? tokens.elevationDark : tokens.elevation;
  const hoverOverlay = dark ? tokens.state.hoverOverlayDark : tokens.state.hoverOverlay;
  // Keyboard-only focus ring, identical on every interactive component.
  const focusRing = {
    '&:focus-visible': { outline: `2px solid ${tokens.state.focusRing}`, outlineOffset: 2 },
  } as const;

  return {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: tokens.radius.md,
          minHeight: tokens.density.buttonHeight,
          boxShadow: elev.e0,          // controls are flat; only surfaces cast a shadow
          '&.Mui-disabled': { opacity: tokens.state.disabledOpacity },
          ...focusRing,
        },
        outlined: { borderColor: hairlineColor, '&:hover': { borderColor: hairlineColor, backgroundColor: hoverOverlay } },
      },
    },

    MuiCard: {
      styleOverrides: {
        // IMPORTANT: only FLAT props (below) reach the legacy MUI v4 layer.
        // Nested selector objects are dropped there — see the Gotchas section.
        root: { borderRadius: tokens.radius.lg, border: hairline, boxShadow: elev.e1 },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: { height: 2, borderRadius: tokens.radius.sm, backgroundColor: tokens.brand.blue },
      },
    },

    // --- The global header (AppBar) — the highest-value override ---
    // DevPortal's global-header renders as an AppBar color="primary". Pin it to a
    // fixed chrome color in BOTH modes so the top bar matches the sidebar.
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: tokens.chrome,
          // MUI paints a translucent elevation overlay on elevated Paper in DARK
          // mode. The AppBar is elevation4, so without this the header renders
          // LIGHTER than the flat sidebar. Kill the overlay for an identical header.
          backgroundImage: 'none',
          color: tokens.brand.paper,
          // The header's icons/links are colorInherit and pick up the Toolbar's
          // dark ink, so on a dark bar they vanish. Target by TAG, not MUI class:
          // createUnifiedTheme prefixes runtime classes with `v5-`, and raw selector
          // strings here are NOT rewritten — `.MuiIconButton-root` never matches
          // `v5-MuiIconButton-root`. Tag selectors are prefix-agnostic. (See Gotchas.)
          '& button, & a, & svg': { color: `${tokens.brand.sidebarText} !important` },
          '& button:hover, & a:hover': { color: `${tokens.brand.paper} !important` },
          '& input': { color: `${tokens.brand.paper} !important` },
        },
        root: { boxShadow: elev.e0 },
      },
    },

    // --- Backstage-specific overrides ---
    // Only Backstage keys that are build-safe in your workspace. If
    // @backstage/core-components is not a dependency, these keys are UNTYPED — keep
    // to the ones you can verify render (InfoCard + SidebarItem ship in v1).
    BackstageInfoCard: {
      styleOverrides: {
        root: { borderRadius: tokens.radius.lg, border: hairline, boxShadow: elev.e1 },
        header: { borderBottom: hairline },   // hairline divider, no colored band
      },
    },
    BackstageSidebarItem: {
      styleOverrides: {
        root: { textDecorationLine: 'none', '&:hover': { backgroundColor: 'rgba(233, 238, 252, 0.06)' } },
        selected: { color: tokens.brand.dark.primary, '& $iconContainer': { color: tokens.brand.dark.primary } },
      },
    },
  };
};
```

## 4. Typography with a self-hosted font

Spread `defaultTypography` so the required shape stays complete, then override the family and
scale. Self-host the font with `@fontsource` (add it as a dependency) and import the weights in
`index.ts` (step 5) so they land in the bundle.

```ts
// src/themes/typography.ts
import { defaultTypography } from '@backstage/theme';

const family = '"Geist Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const typography = {
  ...defaultTypography,
  fontFamily: family,
  h1: { ...defaultTypography.h1, fontFamily: family, fontSize: '2.5rem', fontWeight: 700 },
  h2: { ...defaultTypography.h2, fontFamily: family, fontSize: '2rem',   fontWeight: 700 },
  h3: { ...defaultTypography.h3, fontFamily: family, fontSize: '1.5rem', fontWeight: 600 },
  // h4–h6 similarly…
  body1: { ...defaultTypography.body1, lineHeight: 1.5 },
};
```

## 5. Register and export

```ts
// src/plugin.ts
import { createPlugin } from '@backstage/core-plugin-api';
// A thin shell so the package satisfies the frontend-plugin role. The real payload
// is the exported theme providers, mounted via the themes: config (step 7).
export const myThemePlugin = createPlugin({ id: 'my-theme' });
```

```tsx
// src/providers.tsx
import { ReactNode } from 'react';
import { UnifiedThemeProvider } from '@backstage/theme';
import { myLightTheme } from './themes/myLightTheme';
import { myDarkTheme } from './themes/myDarkTheme';

export const MyLightThemeProvider = ({ children }: { children?: ReactNode }) =>
  <UnifiedThemeProvider theme={myLightTheme}>{children}</UnifiedThemeProvider>;
export const MyDarkThemeProvider = ({ children }: { children?: ReactNode }) =>
  <UnifiedThemeProvider theme={myDarkTheme}>{children}</UnifiedThemeProvider>;
```

```ts
// src/index.ts
// Side-effect imports — these bundle the font + global CSS. Kept alive by
// package.json "sideEffects": ["**/*.css"].
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-sans/700.css';
import './styles/component-fixes.css';

export { myThemePlugin } from './plugin';
export { MyLightThemeProvider, MyDarkThemeProvider } from './providers';
```

The `importName`s you export here (`MyLightThemeProvider`, `MyDarkThemeProvider`) are exactly
what the dynamic-plugins config references in step 7.

## 6. Build the plugin

Export it as a **dynamic** plugin with the RHDH CLI:

```bash
yarn export-dynamic        # → rhdh-cli plugin export → produces dist-dynamic/
```

```json
// package.json scripts
{ "tsc": "tsc", "export-dynamic": "rhdh-cli plugin export" }
```

:::warning
Do **not** build a theme plugin with `backstage-cli package build`. It fails on the CSS
imports (Rollup). The dynamic-plugin path uses webpack via `rhdh-cli plugin export`, which is the
only build that bundles the CSS you `import` from `index.ts` — and that CSS is how you reach the
legacy MUI v4 layer (see Gotchas).
:::

## 7. Enable it in DevPortal

Mount `dist-dynamic/` into the container (or publish it to an OCI/npm registry) and enable it in
`dynamic-plugins.yaml`, registering the themes under the built-in ids:

```yaml
plugins:
  - package: ./local-plugins/my-theme          # or oci://<registry>/my-theme:<tag>!my-org-plugin-my-theme
    disabled: false
    pluginConfig:
      dynamicPlugins:
        frontend:
          my-org.plugin-my-theme:               # === package.json scalprum.name
            themes:
              - id: light                        # reuse built-in ids to REPLACE the stock themes
                title: My Light
                variant: light
                importName: MyLightThemeProvider # === the export from providers.tsx
              - id: dark
                title: My Dark
                variant: dark
                importName: MyDarkThemeProvider
```

Test locally against the published image without a full app build:

```bash
docker run -d --name devportal-local -p 7007:7007 \
  -v $PWD/dynamic-plugins.local.yaml:/app/dynamic-plugins.yaml:ro \
  -v $PWD/plugins/my-theme/dist-dynamic:/app/local-plugins/my-theme:ro \
  -v $PWD/app-config.local.yaml:/app/app-config.local.yaml:ro \
  veecode/devportal:<tag>
```

Then open Settings → Appearance and confirm the picker shows **only** your variants — if the
stock Light/Dark are still there, the `id` did not match or the plugin failed to load.

:::warning
After rebuilding `dist-dynamic/`, recreate the container (`docker rm -f … && docker run …`) —
do **not** `docker restart` it. The dynamic-plugins installer keys installed plugins by a
content hash: on a plain restart it reinstalls your rebuilt local plugin into the same
directory, then its cleanup pass deletes that directory as a stale leftover of the *old* hash.
The portal comes up without your theme and it looks like the build broke. OCI-installed plugins
are not affected — this bites the local `./local-plugins/` flow only.
:::

:::note
A theme plugin enabled this way does **not** appear in the Marketplace catalog — and that is by
design. The marketplace lists curated `kind: Plugin` catalog entities, not everything present in
a registry; themes are wired through `dynamic-plugins.yaml` (as above), so don't look for your
theme under `/marketplace` to confirm it installed — check Settings → Appearance instead.
:::

## 8. Bonus — mount a custom component into the header

The same plugin can inject a component into the app shell via a mount point. Export it from
`index.ts`, then add a `mountPoints` entry alongside `themes` in the config. A brand badge:

```tsx
// src/components/BrandBadge.tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { tokens } from '../themes/tokens';

export const BrandBadge = () => {
  return (
    // `bgcolor: 'primary.main'` resolves through the theme context, so the dot
    // follows the active light/dark palette without an explicit useTheme() call.
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.5,
               borderRadius: 2, border: `1px solid ${tokens.hairlineDark}` }}>
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'primary.main' }} />
      <Typography component="span" sx={{ fontWeight: 600, fontSize: 13, color: tokens.brand.paper }}>
        My Brand
      </Typography>
    </Box>
  );
};
```

```yaml
            mountPoints:
              - mountPoint: global.header/component
                importName: BrandBadge
                config: { priority: 98 }
```

:::note
The header is dark chrome in both themes, so the badge uses fixed light-on-dark tones rather than
`palette.text.primary` (which is dark ink in light mode and would disappear on the chrome bar).
:::

## Gotchas

DevPortal renders a **mix** of MUI v5 and legacy MUI v4 (JSS) components (note the
`@material-ui/core` peer dependency). The facts below trip up most theme authors.

### The app canvas is not painted by your palette

Setting `palette.background.default` does **not** change the page background. The shell paints
the `<body>` from a Backstage UI (BUI) stylesheet — `body { background: var(--bui-bg-app) }`,
with defaults `#f8f8f8` (light) / `#333333` (dark) scoped by a `[data-theme-mode]` attribute.
That CSS variable lives **outside** the MUI palette, so no `createUnifiedTheme` option reaches it.

The trap: the **home page masks the problem**. The homepage plugin paints its own full-bleed
surface using your palette, so home looks right while every other page (catalog, entity pages,
APIs…) keeps the stock gray canvas behind your cards.

Fix it from the global CSS your plugin already ships (see the v4-layer section below —
`export-dynamic` bundles it). `UnifiedThemeProvider` stamps `data-theme-mode` on `<body>`, and
`body[data-theme-mode=...]` (specificity 0,1,1) beats the shell's bare attribute selector
(0,1,0) regardless of stylesheet load order:

```css
/* src/styles/component-fixes.css — values from your tokens */
body[data-theme-mode='light'] {
  --bui-bg-app: #f3f5f8;
}
body[data-theme-mode='dark'] {
  --bui-bg-app: #101820;
}
```

Keep `palette.background.default` in the theme too — MUI surfaces still read it; the variable
override covers the body canvas the palette cannot reach.

### Selector strings do not match prefixed classes

`createUnifiedTheme` runs with a class-name prefix (`v5-`). MUI rewrites the classes **it**
generates (`v5-MuiIconButton-root`), but not selector strings you write by hand in
`styleOverrides`. So this silently matches nothing:

```ts
// ❌ the DOM has `v5-MuiIconButton-root`, not `MuiIconButton-root`
'& .MuiIconButton-root': { color: '#fff' }
```

Target by **tag** — prefix-agnostic — and add `!important` when overriding an inherited
`color="inherit"` element (see the AppBar override in step 3):

```ts
'& button, & a, & svg': { color: '#fff !important' }  // ✅
```

### Reaching the legacy (MUI v4) layer

Some surfaces — e.g. the catalog user-list picker — are still MUI v4. `createUnifiedTheme`
propagates overrides to the v4 layer only **partially**:

- **Flat props** on `root` (borderRadius, border, boxShadow) **reach** v4 components.
- **Nested selector objects** (`'& > .MuiTypography-subtitle2': {…}`) are **dropped** in the v4
  translation, and v4 class names are suffixed at runtime (`MuiCard-root-2510`), so exact class
  selectors would not match anyway.

For structural rules on the v4 layer, use **global CSS** with substring selectors, imported from
`index.ts`:

```css
/* src/styles/component-fixes.css */
[class*="MuiCard-root"] > [class*="MuiTypography-subtitle2"]:first-child {
  display: block;      /* see note */
  margin-top: 16px;
}
```

:::note
Vertical margins have **no effect** on `display: inline` elements. If a label is a `<span>`,
`margin-top` computes but produces no visible gap — add `display: block`. Verify spacing with
`getBoundingClientRect()`, not `getComputedStyle` alone (the computed margin will read 16px while
the element hasn't moved).
:::

### Dark-mode elevation overlay on the AppBar

Covered in the AppBar override above: MUI paints `background-image: linear-gradient(...)` on
elevated `Paper` in dark mode. The header is an elevated AppBar, so it renders lighter than a
flat sidebar. `backgroundImage: 'none'` makes it match across both modes.

## What a theme plugin cannot reach

Some surfaces are baked into the app shell and are not reachable by theme overrides:

- **Sidebar icons** are largely imported directly by the shell. The `appIcons` registry overrides
  some, but not all — the rest require forking the app package. A partial swap looks inconsistent,
  so it is usually all-or-nothing.
- **Catalog table headers** are not reachable via `MuiTableCell` overrides without pulling in
  `@backstage/core-components` typed overrides.

For those, forking the DevPortal app package is the only option.
