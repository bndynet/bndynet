# icharts — Color System Guide

> Internal design and usage guide for the color pipeline of
> `@bndynet/icharts`. Two audiences:
>
> 1. **Users** building dashboards that need consistent colors across
>    multiple charts, branded themes, or per-name color pinning.
> 2. **Contributors / AI agents** adding new built-in chart types or
>    writing custom adapters via `registerAdapter()`, without breaking
>    the color contract.

---

## 1. Design goals

- **Single resolver entry point.** All "name → color" resolution goes
  through `resolveColors()` / `resolveColorsForNodes()` in
  `src/utils.ts`. Nothing else reads `colorHub` directly or duplicates
  the priority rules.
- **Adapter owns assembly.** Each adapter knows which ECharts option
  field consumes colors for its chart type (top-level `option.color` for
  line/bar/pie, per-node `itemStyle.color` for sankey/chord, gradient
  `areaStyle` for spark area, …). The adapter calls the resolver and
  places the result itself.
- **No central post-processing.** `core.ts` does not touch colors. What
  the adapter returns is what `echarts.setOption()` consumes.
- **Cross-chart consistency is opt-in.** `configure({ consistentColors:
  true })` makes the same name resolve to the same color in every
  chart. Off by default to keep the simple single-chart case obvious.

---

## 2. Two-layer pipeline

```
              ┌──────────────────────────────────────────┐
              │  RESOLVER LAYER  (src/utils.ts)          │
              │                                          │
              │  resolveColors(names, options)           │
              │  resolveColorsForNodes(nodes, options)   │
              │                                          │
              │  Inputs: names, options                  │
              │  Output: string[] of hex colors          │
              └──────────────────┬───────────────────────┘
                                 │ colors[]
                                 ▼
              ┌──────────────────────────────────────────┐
              │  ASSEMBLY LAYER  (src/adapters/*.ts)     │
              │                                          │
              │  Each adapter decides where colors go:   │
              │    • merged.color = colors               │
              │    • paintGraphNodes(merged, type, map)  │
              │    • areaStyle from spark gradient       │
              │                                          │
              │  Order inside the adapter:               │
              │    1. build base option                  │
              │    2. deepMerge user options.echarts     │
              │    3. resolve colors                     │
              │    4. write colors into merged option    │
              │    5. return merged                      │
              └──────────────────┬───────────────────────┘
                                 ▼
                         echarts.setOption(option)
```

Why the order **deepMerge first, then write colors**? So the resolved
palette wins over a user-provided `options.echarts.color`. Users who
genuinely want to override colors should reach for `options.colors`,
`options.colorMap`, or per-node `color` fields — those flow through the
resolver and stay traceable.

---

## 3. Resolution priority

`resolveColors(names, options)` applies (highest first):

| # | Source | Notes |
|---|--------|-------|
| 1 | `options.colors[i]` | Whole-palette positional override. Must have `length >= names.length` to take effect, otherwise this source is ignored. |
| 2 | `options.colorMap[name]` | Per-name override. |
| 3a | ColorHub by name | When `configure({ consistentColors: true })`. Same name → same color across all charts. |
| 3b | `palette[i % palette.length]` | When `consistentColors: false` (default). Each chart starts at `palette[0]`. |

`resolveColorsForNodes(nodes, options)` adds one rule **above** (1):

| # | Source | Notes |
|---|--------|-------|
| 0 | `node.color` | Per-node fixed color in the data itself. Highest priority. |
| 1–3 | _(same as above)_ | |
| 4 | `'#888888'` | Last-resort fallback when the palette is empty. |

---

## 4. `consistentColors` in detail

### Default (off)

Each chart starts at `palette[0]`:

```ts
createChart(el1, 'line', { categories: [...], series: [{ name: 'Revenue', data: [...] }] });
// Revenue = palette[0] = #3b82f6

createChart(el2, 'pie', [{ name: 'Profit', value: 30 }, { name: 'Revenue', value: 70 }]);
// Profit  = palette[0] = #3b82f6
// Revenue = palette[1] = #10b981   ← different from the line chart
```

### Turned on

```ts
import { configure } from '@bndynet/icharts';
configure({ consistentColors: true });
```

Internally `resolveColors` switches from `resolveColorsByPosition` to
`resolveSeriesColors` (see `src/themes/index.ts`). The library's
`PaletteRegistry` (`src/themes/palette-registry.ts`) remembers a
`name → color` map per theme. First time we see `"Revenue"` it gets
`palette[0]` and that mapping is stored; later charts that include
`"Revenue"` look it up instead of starting from `palette[0]`. (ColorHub
itself is now a read-only theme / palette / token repository — it no
longer accumulates the name → color map as a render side effect.)

```ts
configure({ consistentColors: true });

createChart(el1, 'line', { /* ... Revenue ... */ });
// Revenue → palette[0] = #3b82f6, stored in ColorHub.colorMap

createChart(el2, 'pie', [{ name: 'Profit', value: 30 }, { name: 'Revenue', value: 70 }]);
// Revenue → ColorHub.colorMap['Revenue'] = #3b82f6   ✅ same as the line chart
// Profit  → palette[next] = #10b981
```

### What happens when you flip the switch

`configure({ consistentColors })` does two things (`src/config.ts`):

1. If switching **on**, it calls `resetColorMap()` so the ColorHub's
   internal palette index restarts at 0 — no leftover state from
   earlier runs.
2. It walks `chartRegistry` and calls `update()` on every live chart
   so all of them re-resolve and re-render.

### Pre-binding names (sticky pins)

```ts
import { setColorMap } from '@bndynet/icharts';

setColorMap({
  Revenue:  '#ff6384',
  Expenses: '#36a2eb',
});

// Or scoped to a single theme:
setColorMap({ Revenue: '#ff8fab' }, 'dark');
```

`setColorMap` is **only meaningful when `consistentColors: true`**.
With `consistentColors: false` the resolver path is
`resolveColorsByPosition`, which does not read the registry's stored map.
For per-chart pins regardless of the global flag, use the chart's own
`options.colorMap`.

**Pins are sticky.** They survive both `switchTheme()` and `resetColorMap()`.
Internally they live in a dedicated per-theme `pins` map inside
`PaletteRegistry`, kept separate from the auto-assigned slots so the
auto-reset paths never touch them. Concretely:

```ts
setColorMap({ Premium: '#FFD166' }, 'light');
switchTheme('light');           // pin survives
resetColorMap();                // pin still survives
setColorMap({ Premium: '#000' });   // overwrites the pin
// No public API removes a single pin — start a fresh app session if you
// truly need to drop one.
```

This lets you call `setColorMap` once at app startup and forget about it;
auto-assigned palette slots get wiped by page transitions but your pins
do not.

### Resetting between dashboards (now automatic)

```ts
import { resetColorMap } from '@bndynet/icharts';

resetColorMap();          // rebuild ColorHub; next chart starts at palette[0]
resetColorMap('dark');    // clear only the 'dark' theme's auto state
```

`switchTheme(name)` **already** clears the target theme's auto-assigned
entries before re-applying the theme, so most SPA pages do not need to
call `resetColorMap()` directly — a page that mounts and calls
`switchTheme(currentTheme)` automatically starts the consumed palette slot
counter at 0 in the active theme. Use `resetColorMap()` explicitly when
you want to wipe state mid-page without changing theme, or when you want
to wipe **every** theme's auto state at once (the no-arg form).

In both cases, entries previously written by `setColorMap` are preserved.

### Name leases & dispose-release recycling

When `consistentColors` is on, each chart render is bracketed by a
**color render session** so the names it resolves become a *refcounted
lease* owned by that chart instance. The engine (`src/core.ts`)
wraps the adapter resolve in `beginColorRender(chart, theme)` /
`endColorRender(chart)`, and `dispose()` calls `releaseColorOwner(chart)`.

- **Acquire:** on each render, the chart's lease is recomputed from the
  names it resolved this pass. Newly-referenced auto names get
  `refcount += 1`; names it no longer uses get released.
- **Release:** when a chart disposes (or stops referencing a name), the
  auto entry's refcount drops. An **auto** entry whose refcount reaches
  zero is *recycled* — its palette slot is freed so the next new name
  restarts at the lowest open slot instead of drifting forward. **Pins
  are never recycled** (they live in the separate `pins` map and ignore
  refcounts).
- **Idempotent:** re-rendering the same chart with the same names does
  not change global state after the first pass — the lease is unchanged,
  so refcounts hold steady.

This makes `dispose()` the **load-bearing** cleanup path: a page that
unmounts all its charts releases their names, and a subsequent page with
brand-new names restarts at `palette[0]` **without** relying on
`pruneDetachedCharts` / the disconnect sentinel. Those sweeps are now a
pure safety net for charts that leak (never disposed, container detached)
rather than the mechanism that keeps colors from drifting.

> **Behavioral note (intended).** Because the last holder of a name
> releases its slot, a name that fully disappears from all live charts
> and later reappears may land on a *different* palette slot than before.
> A page that unmounts and remounts with the **same** names in the
> **same** first-seen order still gets the **same** colors (allocation is
> deterministic). Live charts always retain their colors — only names
> with zero live references are recycled. Names resolved outside a render
> session (e.g. `getSeriesColor()` or SSR `renderChartToSVGString`)
> acquire no refcount and simply linger, matching pre-refactor behavior.

Resolution happens through the same singleton, so the contract is
verified end-to-end in `src/core.test.ts` ("consistentColors
dispose-release recycle") and at the unit level in
`src/themes/palette-registry.test.ts`.

---

## 5. Themes and palettes

### Anatomy of a `ChartTheme`

```ts
// src/themes/types.ts
type ChartTheme = ColorTheme<ChartThemeColors>;
// {
//   name:       'light' | 'dark' | <custom>,
//   colorMode:  'light' | 'dark',
//   palette:    string[],            // series colors (ColorHub-managed)
//   colors:     ChartThemeColors,    // UI tokens: background, text, grid, tooltip, success/warning/…
//   colorMap?:  Record<string,string>,  // ColorHub's accumulated name → color
// }
```

Strict split:

| Field | Used for | Consumed by |
|-------|----------|-------------|
| `palette` | series / slice / node colors | ColorHub + `merged.color` |
| `colors` | background, text, axis line, grid, tooltip, status | `buildEChartsTheme()` bakes these into the ECharts theme |

### Token reuse across chart components

`colors.axisLine` and `colors.gridLine` are **visual-role tokens** —
named after the rule's job ("axis spine, more prominent" vs "grid
rule, subtle"), not after the ECharts component that paints it. Every
chart that draws a grid-like structure reuses them.

| Visual role | Theme token | XY axes | Radar |
|---|---|---|---|
| Axis spine / frame line / radar spokes | `colors.axisLine` | `categoryAxis.axisLine` / `valueAxis.axisLine` / `axisTick` | `radar.axisLine` |
| Grid rules / concentric rings | `colors.gridLine` | `categoryAxis.splitLine` / `valueAxis.splitLine` | `radar.splitLine` (and 30 %-opacity bands in `splitArea`) |

`buildEChartsTheme` factors the shared piece into
`buildStructuralLineDefaults(colors)`, which is spread into both
`buildAxisStyle` (XY) and the `radar` block. A regression test
(`src/themes/echarts-theme.test.ts` → "radar grid lines stay in
lockstep with XY axis grid lines") pins this — changing one of
`colors.axisLine` / `colors.gridLine` updates radar **and** XY in
lockstep, and any future divergence fails CI.

Any new chart-type theme block that paints structural lines should
spread `buildStructuralLineDefaults(colors)` for the same reason —
do not redeclare `{ lineStyle: { color: colors.axisLine } }` /
`{ lineStyle: { color: colors.gridLine } }` inline.

### Built-in themes

`src/themes/presets.ts` ships `light` (default) and `dark`, both with a
10-color palette tuned for their background brightness.

### Registering a custom theme

```ts
import { registerTheme } from '@bndynet/icharts';

registerTheme({
  name: 'ocean',
  colorMode: 'dark',                                  // inherit missing tokens from 'dark'
  colors: { background: '#001f3f', textPrimary: '#e0f2fe' },
  palette: ['#0ea5e9', '#06b6d4', '#14b8a6'],         // omit to inherit from 'dark'
});

createChart(el, 'bar', data, { theme: 'ocean' });
```

`registerTheme` does two things:

1. `colorHub.appendTheme(theme)` so ColorHub can store a `name → color`
   map for this theme when `consistentColors` is on.
2. `echarts.registerTheme(name, buildEChartsTheme(colors, palette))` so
   the ECharts engine recognizes the theme name.

> ⚠️ Call `registerTheme` **before** creating any chart. Existing
> charts will not pick up a newly registered theme until you call
> `switchTheme(name)` or per-instance `chart.setTheme(name)`.

### Switching themes globally

```ts
import { switchTheme } from '@bndynet/icharts';
switchTheme('dark');
```

`switchTheme` syncs ColorHub's current theme and calls `setTheme` on
every live chart in `chartRegistry` — no recreation needed.

---

## 6. Per-type color behavior

| Type | Names from | Resolver call | Color placement |
|------|------------|---------------|-----------------|
| `line` / `bar` / `area` | `series[].name` | `resolveColors(names, options)` | `merged.color = colors` |
| `area` + `spark` | same | `resolveColors(names, options)` | `merged.color = colors` + per-series `areaStyle = { color: buildSparkAreaGradient(colors[i]) }` |
| `pie` | slice `name` | `resolveColors(names, options)` | `merged.color = colors` |
| `sankey` / `chord` | `nodes[].name` | `resolveColorsForNodes(nodes, options)` | `merged.color = colors` + `paintGraphNodes(merged, '<seriesType>', nameToColor)` writes `series.data[i].itemStyle.color` |
| `gauge` | _(no series names)_ | _(none)_ | All gauge colors come from the registered ECharts theme via `buildEChartsTheme()` |

---

## 7. Adding a new built-in chart type — color checklist

### 7.1 Series-indexed chart (like line / bar / pie)

1. Add a `ChartType` enum value, data type, and `isXxxData` guard in
   `src/types.ts`.
2. Write the adapter under `src/adapters/<type>.ts`. **Build the option
   without any color literals or theme lookups.**
3. At the end of `resolveXxxOptions`:

   ```ts
   const names = /* extract names from data */;
   const eOption: Record<string, unknown> = { /* …no colors… */ };

   const merged = deepMerge(eOption, (options.echarts ?? {}) as Record<string, unknown>);
   merged.color = resolveColors(names, options);
   return merged;
   ```

4. Register the adapter in `src/adapters/index.ts`. Done.

### 7.2 Graph chart (`{ nodes, links }`, like sankey / chord)

1. Same `src/types.ts` work as above. Provide an `isXxxData` guard.
2. In the adapter, use the two graph helpers from
   `src/adapters/graph-colors.ts`:

   ```ts
   import {
     mapGraphNodesForECharts,
     paintGraphNodes,
   } from './graph-colors.js';
   import { resolveColorsForNodes, deepMerge } from '../utils.js';

   const nodes = mapGraphNodesForECharts(data.nodes /*, extra? */);
   // → [{ name, value?, …extra }, …]   no colors yet

   const series = { type: 'mytype', data: nodes, /* … */ };
   const eOption = { series: [series], /* … */ };

   const merged = deepMerge(eOption, (options.echarts ?? {}) as Record<string, unknown>);

   const colors = resolveColorsForNodes(data.nodes, options);
   merged.color = colors;
   paintGraphNodes(
     merged,
     'mytype',
     new Map(data.nodes.map((n, i) => [n.name, colors[i]])),
   );
   return merged;
   ```

3. Register the adapter. `paintGraphNodes` handles "skip nodes with an
   existing `itemStyle.color`" so users supplying their own
   `echarts.series.data[i].itemStyle.color` keep their override.

### 7.3 No-name chart (like gauge)

Skip the resolver entirely. Add a sub-key to `buildEChartsTheme()` in
`src/themes/echarts-theme.ts` so the chart inherits theme-level colors
(axis, label, progress, etc.) automatically.

### 7.4 Verification

```bash
npm run typecheck
npm run lint
npm run test
npm run build   # when exports or build pipeline may be affected
```

Add unit tests under `src/**/*.test.ts`:

- An `isXxxData` guard test.
- An adapter-level color test asserting the resolved palette ends up in
  the right ECharts field (see `src/utils.test.ts` for templates).

---

## 8. Custom chart types via `registerAdapter` (runtime)

Third-party code can register custom chart types **without modifying
this repo** and still get full theme / `consistentColors` / `colorMap`
support — `resolveColors` and `resolveColorsForNodes` are exported from
the package entry point.

```ts
import {
  registerAdapter,
  resolveColors,
  type ChartAdapter,
} from '@bndynet/icharts';

const radarAdapter: ChartAdapter = {
  validate: (data) => Array.isArray((data as any)?.indicators),
  resolve: (data, options) => {
    const series = (data as any).series as { name: string; data: number[] }[];
    const names = series.map((s) => s.name);
    const colors = resolveColors(names, options);

    return {
      option: {
        radar: { indicator: (data as any).indicators },
        color: colors, // honors theme + options.colors / colorMap / consistentColors
        series: [{
          type: 'radar',
          data: series.map((s) => ({ name: s.name, value: s.data })),
        }],
      },
    };
  },
};

registerAdapter('radar', radarAdapter);
```

For custom graph types, use `resolveColorsForNodes` plus the
`mapGraphNodesForECharts` / `paintGraphNodes` helpers exactly like the
built-in sankey / chord adapters.

---

## 9. Public API

From `src/index.ts`:

| Symbol | Purpose |
|--------|---------|
| `resolveColors(names, options)` | Resolve `name[] → color[]` honoring theme + `options.colors` / `colorMap` / `consistentColors`. |
| `resolveColorsForNodes(nodes, options)` | Same, but accepts `{ name, color? }[]` and gives `node.color` the top priority. |
| `configure({ consistentColors })` | Global flag for cross-chart same-name-same-color. |
| `getConfig()` | Read current global config. |
| `registerTheme(config)` | Register a custom theme (palette + UI tokens). |
| `switchTheme(name)` | Switch every live chart to a registered theme. |
| `getCurrentTheme()`, `getThemeColors()` | Inspect the active theme. |
| `getSeriesColor(name)` | Hex set `{ default, hover, active, disabled }` for a given name. |
| `setColorMap(map, themeName?)` | Pre-bind `name → color` (effective only with `consistentColors: true`). |
| `resetColorMap(themeName?)` | Clear ColorHub's accumulated map. |

`ChartOptions` fields:

| Field | Scope | Priority |
|-------|-------|----------|
| `options.theme` | single chart | selects which theme to use |
| `options.colors` | single chart | positional override; needs `length >= names.length` |
| `options.colorMap` | single chart | per-name override |
| `node.color` (in data) | single node | highest — graph charts only |

---

## 10. Allowed exceptions to "no color literals in adapters"

(Listed verbatim from `AGENTS.md` for cross-reference.)

- **Theme definitions** — `src/themes/presets.ts`, `registerTheme()`,
  `echarts-theme.ts`. Themes *are* the color source of truth.
- **Derived visuals** — opacity-only styling with no new hue (e.g.
  `buildSparkAreaGradient`, `lineStyle.color = 'gradient'` for
  sankey/chord ribbons).
- **Non-data UI** — tooltip error text, axis/grid defaults from the
  ECharts theme (not the series palette).
- **Last-resort fallback** — only inside shared color utilities
  (`resolveColorsForNodes`'s `'#888888'`), never per chart type.
- **Tests** — fixed hex in `*.test.ts` fixtures is fine.

Anything else with `#xxxxxx` in `src/adapters/**` is a violation.

---

## 11. Recipes

### 11.1 Dashboard with cross-chart consistency

```ts
import { configure, setColorMap, createChart } from '@bndynet/icharts';

configure({ consistentColors: true });

setColorMap({
  Revenue:  '#ff6384',
  Expenses: '#36a2eb',
});

createChart(el1, 'line', /* … includes Revenue / Expenses … */);
createChart(el2, 'pie',  /* … */);
createChart(el3, 'bar',  /* … */);
// Revenue is #ff6384 in all three. Expenses is #36a2eb in all three.
```

### 11.2 SPA — clean state between dashboards

Most SPA pages already call `switchTheme(currentTheme)` on mount (either
directly, or indirectly through a site-level theme watcher). That call
now clears the target theme's auto-assigned colorMap automatically, so
dashboard A's name → color assignments cannot leak into dashboard B —
no `resetColorMap()` needed:

```ts
configure({ consistentColors: true });
setColorMap({ Premium: '#FFD166' });   // sticky across switches

mountDashboardA();                     // page mounts, calls switchTheme(...)
unmountDashboardA();
mountDashboardB();                     // page mounts, calls switchTheme(...)
                                       // → palette restarts at 0
                                       // → Premium stays #FFD166 (pinned)
```

If a page does *not* call `switchTheme` on mount (e.g. it reuses whatever
theme is already active), call `resetColorMap()` manually to get the
same effect, or wrap your mount in `switchTheme(getCurrentTheme().name)`.

### 11.3 One-off override on a single chart

```ts
createChart(el, 'pie', data, {
  colorMap: { Premium: '#fbbf24', Free: '#94a3b8' },
});
// options.colorMap is always honored, regardless of the global consistentColors flag.
```

### 11.4 Pin one sankey node, let the others auto-color

```ts
const data: SankeyData = {
  nodes: [
    { name: 'Source A', color: '#ef4444' },   // pinned
    { name: 'Source B' },                     // from palette
    { name: 'Sink' },
  ],
  links: [/* … */],
};
createChart(el, 'sankey', data);
```

### 11.5 Light / dark toggle

```ts
import { switchTheme } from '@bndynet/icharts';

document.addEventListener('toggle-theme', () => {
  switchTheme(document.body.classList.contains('dark') ? 'dark' : 'light');
});
```

---

## 12. Do / Don't

### Do

- ✅ Call `resolveColors` / `resolveColorsForNodes` in every adapter
  that needs colors — this is the single entry point.
- ✅ For graph adapters, use `mapGraphNodesForECharts` for shape and
  `paintGraphNodes` for coloring, in that order.
- ✅ Apply colors **after** `deepMerge(eOption, options.echarts)` so the
  resolved palette wins over `options.echarts.color`.
- ✅ Register custom themes, call `configure({ consistentColors })`,
  and call `setColorMap` at application startup before creating any
  chart. `setColorMap` pins are sticky across `switchTheme` and
  `resetColorMap`, so once-and-done is enough.
- ✅ Rely on `switchTheme(name)` (called naturally by most SPA page
  mounts) to clear the previous page's auto-assigned palette slots.
  Only call `resetColorMap()` explicitly if you need to wipe state
  without changing theme.

### Don't

- ❌ Write `itemStyle: { color: '#3b82f6' }` (or any hex) in an
  adapter. Use the resolver.
- ❌ Re-introduce a central `applyChartColors` step in `core.ts` —
  adapters now own assembly end-to-end.
- ❌ Read `colorHub` or `paletteRegistry` directly from outside
  `src/themes/index.ts`. Neither is a public API — go through the
  resolver / `setColorMap` / `resetColorMap` entry points.
- ❌ Expect `options.colors` (the array form) to partially override —
  it is all-or-nothing. Use `options.colorMap` for selective overrides.
- ❌ Call `setColorMap` while `consistentColors: false`. It writes into
  ColorHub's name map, which that code path does not read.
- ❌ Call `registerTheme` *after* creating charts and expect them to
  pick it up automatically. Charts switch themes only via
  `switchTheme(name)` or per-instance `chart.setTheme(name)`.

---

## 13. Source map

| File | Role |
|------|------|
| `src/utils.ts` | Generic helpers + the resolver (`resolveColors`, `resolveColorsForNodes`) + `buildSparkAreaGradient`. |
| `src/themes/index.ts` | ColorHub wiring (read-only repo) + PaletteRegistry wiring, theme registration / switching, low-level resolvers (`resolveSeriesColors` / `resolveColorsByPosition`), `setColorMap` / `resetColorMap`, plus the internal render-session wrappers `beginColorRender` / `endColorRender` / `releaseColorOwner` (consumed by `core.ts`, not part of the public API). |
| `src/themes/palette-registry.ts` | `PaletteRegistry` — library-owned, SSR-safe name→color allocator for `consistentColors`. Separate auto / pin maps per theme + first-seen `order`. Replaces ColorHub's stateful accumulator. Refcounts auto names per render-session lease so `dispose()` recycles freed palette slots (pins never recycle). |
| `src/themes/presets.ts` | Built-in `light` / `dark` palettes and UI tokens. |
| `src/themes/echarts-theme.ts` | `buildEChartsTheme()` — bakes `ChartThemeColors` into an ECharts theme object. |
| `src/themes/types.ts` | `ChartTheme`, `ChartThemeColors`, `ChartThemeConfig`. |
| `src/adapters/graph-colors.ts` | `mapGraphNodesForECharts` (pure shape mapper) + `paintGraphNodes` (assign `itemStyle.color` post-merge). |
| `src/adapters/<type>.ts` | Per-chart-type adapters. Each calls the resolver and places colors itself. |
| `src/config.ts` | `configure({ consistentColors })` and registry-wide refresh on toggle. |
| `src/registry.ts` | Global `chartRegistry` used to push theme / config changes to all live charts. |
| `src/core.ts` | `IChart` engine — builds option via the adapter and calls `setOption`. Does **not** post-process colors. |
| `src/utils.test.ts` | Resolver + adapter-level color tests. |
