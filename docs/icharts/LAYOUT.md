# icharts — Layout Pipeline

> Internal design and usage guide for the chart layout pipeline in
> `@bndynet/icharts` — the small set of helpers in
> `src/adapters/common.ts` that turn the optional **title** and
> **legend** widgets into per-edge pixel reserves so every chart type
> places its body consistently.
>
> Two audiences:
>
> 1. **Users** styling charts that mix multiple chart types on a page
>    and need title/legend behavior to agree across XY, pie, radar, …
> 2. **Contributors / AI agents** adding new built-in chart types or
>    custom adapters via `registerAdapter()` that render a title or a
>    legend, without re-deriving the slot math.

---

## 1. Design goals

- **Single source of truth for layout.** All "how much space does
  widget X need on edge Y?" math goes through one of two reserve
  helpers (`getTitleReserve`, `getLegendReserve`) in
  `src/adapters/common.ts`. Adapters never redefine the reserve
  constants or duplicate the position → edge switch.
- **Single builder per widget.** `buildTitle(options)` and
  `buildLegend(names, options)` emit the ECharts component config;
  adapters do not hand-author `title: { ... }` or `legend: { ... }`
  blocks.
- **Layout currency is `EdgeReserves`.** Both reserve helpers return
  the same shape (`{ top, bottom, left, right }`) so charts that
  combine them — even composing more than one widget on the same edge
  — write a single edge loop instead of branching by widget type.
- **Widgets live on the subtype that renders them.** Not every chart
  has a title/legend — gauge, sankey, and chord deliberately don't
  expose `legend?`. Title is universal (every base `ChartOptions`
  exposes it). Putting `legend` on the base would advertise a knob
  those charts ignore.
- **Same reserve, different math.** Grid-based charts (line / bar /
  area) pull their grid edges back by `padding + reserve`.
  Body-centered charts (radar / pie / gauge) shift `center` (and
  shrink `radius`) using the same reserve in their percent math.
  Both consume the *same* helpers.

---

## 2. Two-layer model

```
                ┌──────────────────────────────────────────────┐
                │  RESERVE LAYER  (src/adapters/common.ts)     │
                │                                              │
                │  getTitleReserve(options)                    │
                │  getLegendReserve(options, show, extraGap?)  │
                │                                              │
                │  Output: EdgeReserves                        │
                │          { top, bottom, left, right }        │
                └──────────────────┬───────────────────────────┘
                                   │ EdgeReserves
                ┌──────────────────┼───────────────────────────┐
                ▼                  ▼                           ▼
       buildGrid(options)   buildRadarLayout(...)       <future chart>
       (XY grid path)       (body-centered path)
                  │                │                           │
                  ▼                ▼                           ▼
       grid.{top,bottom,…}  radar.center +              (whatever the
       absolute pixels      radar.radius                chart positions)
                            percent-shifted
```

`buildTitle()` and `buildLegend()` are the orthogonal *appearance*
helpers — they take their respective options and emit the ECharts
component blocks. Position math for the **widget's own placement**
lives in the builder (e.g. `buildLegend` puts the legend at `bottom: p`
when `position: 'bottom'`). Position math for everything **else** that
needs to clear that widget's slot lives in the corresponding reserve
helper.

Why split builder and reserve? Because the widget's own placement is
always `padding` pixels from the canvas edge (set inside the builder),
but the *reserve* size depends on adapter intent — a radar wants extra
breathing room for `axisName` labels, an XY grid just wants the bar
edge.

---

## 3. Public API surface

Exported from the package root (`@bndynet/icharts`):

| Symbol | Type | Role |
|---|---|---|
| `TitleOptions` | type | `{ text; align?; fontSize?; padding? }` (in `src/types/shared.ts`). |
| `LegendOptions` | type | `{ show?; position?: 'top' \| 'bottom' \| 'left' \| 'right' }`. |
| `EdgeReserves` | type | `{ top: number; bottom: number; left: number; right: number }` — the shared layout currency. |
| `LEGEND_RESERVE` | const | Pixel slot per legend (height + gap to the plot area). Currently `36`. |
| `getTitleReserve(options)` | function | Returns `EdgeReserves` with the title widget's pixel height on `top`, zeros elsewhere. All-zero when no title. |
| `getLegendReserve(options, showLegend, extraGap?)` | function | Returns `EdgeReserves` with the legend's pixel slot on whichever edge is active, zero elsewhere. All-zero when hidden. |
| `buildTitle(options)` | function | Returns the ECharts `title` config object (or `undefined`). |
| `buildLegend(names, options)` | function | Returns the ECharts `legend` config object. |

The `LegendOptions` shape itself is intentionally minimal — only
`show` and `position`. `TitleOptions` is similarly minimal — `text`,
`align`, `fontSize`, `padding`. Anything beyond that goes through the
`echarts` escape hatch (see Section 9).

> **Why does `getTitleReserve` not take a `show` flag?**
> Title visibility is unambiguous (`options.title` defined ↔ shown).
> `getLegendReserve` needs `showLegend` because per-chart adapters apply
> different defaults (pie defaults to `false`, radar to `names.length > 1`,
> XY to `true`); the resolved flag must be threaded explicitly. Title has
> no such default ambiguity.

---

## 4. How adapters consume the reserves

Two patterns. Pick the one that matches your chart's positioning
model.

### 4.1 XY grid path (line / bar / area)

The grid sits in absolute canvas pixels. Pull each relevant edge back
by `padding + reserve`:

```
                 ┌───────────────── canvas ─────────────────┐
                 │   ↕ p + title.top   ← title slot         │
                 │   [           Chart Title          ]     │
                 │   ↑ padding (12)                         │
                 │   ┌──────── plot grid ─────────┐         │
                 │   │                            │         │
                 │   │                            │ padding │
                 │   │                            │  (12)   │
                 │   │                            │         │
                 │   └────────────────────────────┘         │
                 │   ↕ legend.bottom  ← legend slot         │
                 │   ↑ padding (12)                         │
                 │   [   Series-A   Series-B   Series-C  ]  │
                 └──────────────────────────────────────────┘
```

This is what `buildGrid()` does internally — it consumes
`getTitleReserve(options).top` for the top edge and
`getLegendReserve(...)` for whichever edge the legend lives on, then
adds `padding` to non-zero reserves. When **both** a title and a
top-positioned legend are present, the top edge composes them
additively (`p + title.top + legend.top`), so the stack reads
**title → legend → chart body**. `buildLegend()` shifts the top
legend's own `top` anchor below the title for the same reason —
otherwise the legend widget would render on top of the title text.

Adapters call `buildGrid`, not the reserve helpers directly:

```ts
// in src/adapters/bar.ts (or line/area)
const eOption = {
  title: buildTitle(options),
  legend: buildLegend(names, options),
  grid: buildGrid(options),               // ← consumes both reserves
  xAxis: buildXAxis(data, options, false),
  yAxis: buildYAxis(options),
  series: buildSeries(...),
};
```

Use `buildGrid(options, { legendShow: false })` to override the
default — see `bar.ts` `colorByCategory` mode, where the legend is
auto-hidden and the grid must collapse the bottom reserve.

### 4.2 Body-centered path (radar / pie / gauge / custom)

These charts position their body via percent `center` against the
full canvas. Convert pixel reserves to a percent shift, then
optionally shrink `radius` to fit. The radar adapter is the canonical
example — it composes title + legend into a single `EdgeReserves`
with the **same** edge loop:

```ts
// in src/adapters/radar.ts
import { type EdgeReserves, getLegendReserve, getTitleReserve } from './common.js';

function getEdgeReserves(options, showLegend): EdgeReserves {
  const p = options.padding ?? 12;
  const title  = getTitleReserve(options);
  const legend = getLegendReserve(options, showLegend, RADAR_EDGE_GAP);
  return {
    // Title contributes p + h on top (no contribution when h === 0 so
    // padding can cancel symmetrically — see §4.3).
    top:    (title.top > 0 ? p + title.top : 0) + legend.top,
    bottom: legend.bottom,
    left:   legend.left,
    right:  legend.right,
  };
}

function buildRadarLayout(options, showLegend) {
  const reserves = getEdgeReserves(options, showLegend);
  const yShiftPct = ((reserves.top - reserves.bottom) / REF_H) * 50;
  const xShiftPct = ((reserves.left - reserves.right) / REF_W) * 50;
  return {
    center: [`${50 + xShiftPct}%`, `${50 + yShiftPct}%`],
    radius: /* shrink based on max(verticalLoss, horizontalLoss) */,
  };
}
```

Key math:

| Quantity | Formula | Notes |
|---|---|---|
| `centerX %` | `50 + (left − right) / REF_W * 50` | Moves toward the side with more remaining space. |
| `centerY %` | `50 + (top − bottom) / REF_H * 50` | Same idea on the y axis. |
| `radius` shrink | `baseRadius − max(verticalLoss, horizontalLoss) × factor` | Optional. Floor with `radiusMinPct` so the body never collapses. |

`REF_W` / `REF_H` are per-adapter reference dimensions matching the
typical demo card size (radar uses 480 × 320). Charts at very different
aspect ratios may want a manual override via the `echarts` escape
hatch.

`pie.ts` and `gauge.ts` use a simpler form — they read
`getTitleReserve(options).top` and conditionally shift the body
downward when a title is present. Pie does not currently shift for the
legend (the 75% `outerRadius` default leaves enough buffer); gauge
ignores the legend entirely (no legend on `GaugeChartOptions`).

### 4.3 Why reserves don't include `padding`

`padding` is a **uniform** offset on all 4 sides. In percent-center
math it cancels symmetrically (`(p + top − p − bottom) = top − bottom`),
so the body-centered path simply omits it. In absolute-pixel grid math
the grid origin is the canvas corner, so the grid path adds `p +
reserve` itself. Keeping `padding` out of both reserve helpers means
**one helper, two correct call sites**.

The radar adapter shows a subtle nuance worth calling out: title's
`p + h` is added *only when `h > 0`*. When there's no title, the top
edge has no special widget on it, so the symmetric padding cancels
just like for an empty-on-both-sides edge. Adding `p` unconditionally
would cause the radar to drift downward whenever someone calls
`getTitleReserve` on a title-less chart.

---

## 5. Adding title/legend support to a new built-in chart type

Checklist for AI agents extending the library. See AGENTS.md
"Adding a new built-in chart type" for the full type / adapter / demo
flow; this is the layout-only slice.

1. **Type subtype**
   - **Title** is universal — every chart inherits `title?` from base
     `ChartOptions`, no extra field needed on the subtype.
   - **Legend** lives on the subtype that renders one. Add
     `legend?: LegendOptions` only if the chart shows a legend.
     Skip it for non-legend charts (sankey, chord, gauge stayed clean
     by *not* exposing the field).

2. **Adapter resolve function**
   - **Title** flows through `buildTitle(options)` automatically — no
     show flag to thread.
   - **Legend** needs a chart-appropriate default for the show flag.
     Compute it once and forward to both `buildLegend` and
     `getLegendReserve`:

     ```ts
     // multi-series radar shows the legend by default;
     // single-series suppresses it because one entry is just noise.
     const showLegend = options.legend?.show ?? names.length > 1;

     const legend = buildLegend(names, {
       ...options,
       legend: { ...options.legend, show: showLegend },
     });
     ```

3. **Layout** — pick the path:
   - **Grid charts**: just call `buildGrid(options)`. It consumes both
     `getTitleReserve` and `getLegendReserve` internally.
   - **Body-centered charts**: call `getTitleReserve(options)` and (if
     applicable) `getLegendReserve(options, showLegend, extraGap?)`,
     compose into `EdgeReserves`, derive `center` / `radius`. See
     `src/adapters/radar.ts` for the canonical example.

4. **Tests** — assert layout reacts to title presence, legend
   `position` (one test per side), and that hiding either widget
   collapses the corresponding reserve. See
   `src/adapters/radar.test.ts` for the pattern;
   `src/adapters/common.test.ts` covers the reserve helpers in
   isolation.

---

## 6. Adding title/legend support to a custom adapter

For charts registered via `registerAdapter()`, import the same helpers
from the package root:

```ts
import {
  registerAdapter,
  buildTitle,
  buildLegend,
  getTitleReserve,
  getLegendReserve,
  LEGEND_RESERVE,
  type EdgeReserves,
  type ChartAdapter,
} from '@bndynet/icharts';

const myAdapter: ChartAdapter = {
  validate(data) { /* … */ },
  resolve(data, options) {
    const names = extractNames(data);
    const showLegend = options.legend?.show ?? names.length > 1;

    const title  = getTitleReserve(options);
    const legend = getLegendReserve(
      options,
      showLegend,
      /* extraGap for body-overflow labels */ 0,
    );

    const p = options.padding ?? 12;
    const reserves: EdgeReserves = {
      top:    (title.top > 0 ? p + title.top : 0) + legend.top,
      bottom: legend.bottom,
      left:   legend.left,
      right:  legend.right,
    };

    const center: [string, string] = [
      `${50 + ((reserves.left - reserves.right) / 480) * 50}%`,
      `${50 + ((reserves.top  - reserves.bottom) / 320) * 50}%`,
    ];

    return {
      option: {
        title: buildTitle(options),
        legend: buildLegend(names, options),
        // …rest of your option using `center`…
      },
    };
  },
};

registerAdapter('scatter-cluster', myAdapter);
```

`LEGEND_RESERVE` is exported in case your math needs the raw constant
(e.g. computing your own composite reserve). Prefer
`getLegendReserve` over reading `LEGEND_RESERVE` directly. Title has
no equivalent constant because the title widget's height is a function
of `fontSize` and `padding` — always go through `getTitleReserve`.

---

## 7. The `extraGap` parameter (legend only)

The legend's own pixel height is `LEGEND_RESERVE` (36 px). Some chart
bodies have visual elements that extend **past** their nominal bounds:

- **Radar.** `axisName` labels render ~15 px past the polygon radius.
- **Pie.** Outside labels and label connector lines extend past
  `outerRadius`. (Pie currently does not shift its center for the
  legend; the 75% radius default leaves enough buffer in practice. If
  you need tighter packing, pass a small `extraGap` for outside-label
  pie charts.)
- **Polar / scatter clusters** with point labels.

`extraGap` adds extra breathing room only on the legend's active edge
— exactly where the collision would happen. Tune by eye against the
default 320 px chart-box; values in the 16–24 px range are typical.

```ts
// radar: legend bottom collides with axisName labels → reserve 24 extra px.
const RADAR_EDGE_GAP = 24;
getLegendReserve(options, showLegend, RADAR_EDGE_GAP);
```

`getTitleReserve` has no equivalent parameter today — the
`TITLE_CHART_GAP` constant inside `common.ts` already covers the gap
between the title baseline and the next element. If a chart needs
extra breathing room below its title, the cleanest solution is to bump
the chart's own `padding` rather than introduce a new layout knob.

---

## 8. Theming

The text color of both widgets is themed centrally in
`src/themes/echarts-theme.ts`:

```ts
title: {
  textStyle: { color: colors.textPrimary },
},
legend: {
  textStyle: { color: colors.textPrimary },
},
```

`textPrimary` is the token shared with chart title, pie/radar labels,
and bar/line value labels. Switching theme (light ↔ dark) recolors
both widgets automatically.

The legend icon shape (`'roundRect'`), spacing (`itemGap: 10`), and
edge positioning all live in `buildLegend()` — not in the theme. The
title's font weight (`'normal'`), alignment, and top placement live in
`buildTitle()`. Use `options.echarts.legend.{...}` /
`options.echarts.title.{...}` to override appearance per chart.

---

## 9. Per-chart defaults

| Chart type | `title` field | `legend` field | Default `legend.show` | Default `legend.position` |
|---|---|---|---|---|
| `line` / `bar` / `area` | inherited from base | `XYChartOptions.legend` | `true` (single & multi) | `'bottom'` |
| `bar` w/ `colorByCategory: true` | inherited | (overridden) | `false` (auto-hidden) | n/a |
| `pie` | inherited | `PieChartOptions.legend` | `false` (slice labels carry the names) | `'bottom'` |
| `radar` | inherited | `RadarChartOptions.legend` | `true` if `series.length > 1`, else `false` | `'bottom'` |
| `gauge` / `sankey` / `chord` | inherited | — | (no legend field) | — |

Title is universal across chart types — render it by setting
`options.title`. Legend defaults come from each adapter's
`showLegend` computation; override with `options.legend.show`.

---

## 10. Common recipes

### 10.1 Add a title to any chart

```ts
createChart(el, 'bar', data, { title: 'Quarterly Revenue' });
createChart(el, 'pie', pieData, { title: { text: 'Market Share', align: 'left' } });
```

The body shifts down automatically — `buildGrid` (XY) reads
`getTitleReserve(...).top`, and pie/gauge/radar shift their `center`
the same way.

### 10.2 Hide the legend on every chart

```ts
createChart(el, 'bar', data, { legend: { show: false } });
createChart(el, 'radar', radarData, { legend: { show: false } });
```

### 10.3 Move the legend to the right

```ts
createChart(el, 'pie', pieData, {
  legend: { show: true, position: 'right' },
});
```

Both `buildLegend` (placement) and `getLegendReserve` (radar/pie
shrink) react to the change with no further config.

### 10.4 Custom widget appearance via the escape hatch

```ts
createChart(el, 'line', data, {
  title: 'Revenue',
  legend: { show: true, position: 'bottom' },
  echarts: {
    title: { textStyle: { fontWeight: 'bold' } },
    legend: { itemGap: 24, icon: 'circle', textStyle: { fontSize: 14 } },
  },
});
```

`options.echarts.{title,legend}` deep-merges over the builder output,
so appearance overrides survive but position/show stay under icharts
control.

### 10.5 Adapter-side smart default ("show only when meaningful")

This is the pattern radar uses, and any new chart should adopt:

```ts
// inside the adapter:
const showLegend = options.legend?.show ?? names.length > 1;
//                                       └─ false for a single-series chart,
//                                          true otherwise
```

The user can still force `legend: { show: true }` for a single series
when they want to display the series name as a separate row.

---

## 11. Do / Don't

### Do

- ✅ Call `buildTitle(options)` for the title block; never hand-author
  `title: { ... }` literals in adapters.
- ✅ Call `buildLegend(names, options)` for the legend block.
- ✅ Call `buildGrid(options)` (which uses both reserve helpers
  internally) for XY grid charts.
- ✅ Call `getTitleReserve(options)` and `getLegendReserve(options,
  showLegend, extraGap?)` directly for body-centered charts.
- ✅ Compose `EdgeReserves` from both helpers using a single edge
  loop — that's why they share the shape.
- ✅ Compute a chart-appropriate `showLegend` default and forward it
  consistently to both `buildLegend` and `getLegendReserve`.
- ✅ Add `legend?: LegendOptions` to the per-chart `XxxChartOptions`
  subtype only when the chart renders a legend.
- ✅ Pass `extraGap` when your chart body has labels that extend past
  its nominal radius (radar.axisName, pie outside labels, …).
- ✅ Use `options.echarts.{title,legend}.{…}` for appearance fields
  that aren't on `TitleOptions` / `LegendOptions`.

### Don't

- ❌ Redeclare `LEGEND_RESERVE = 36` (or any layout magic constant)
  inside an adapter. Import it from `common.ts`.
- ❌ Hand-author `title: { ... }` or `legend: { show: ..., bottom: 12, ... }`
  blocks in adapters. Use the builders so position math stays
  consistent.
- ❌ Add `legend` to base `ChartOptions`. Charts that don't render a
  legend should not advertise the field. See AGENTS.md "Boundaries —
  do not".
- ❌ Reach for the (formerly exported) `getTitleHeight` helper.
  `getTitleReserve(options).top` is the single canonical entry point
  for title geometry. `getTitleHeight` is module-private inside
  `common.ts`.
- ❌ Read `LegendOptions.position` directly in two places (e.g.
  inside `buildLegend` and inside `getLegendReserve`) and trust them
  to stay in sync. They already do — but the helpers exist precisely
  so other adapters don't have to.
- ❌ Hardcode title or legend text color. The theme owns it
  (`title.textStyle.color = legend.textStyle.color = colors.textPrimary`).
- ❌ Use the `echarts` escape hatch for `position` or `show`. Those go
  through `LegendOptions` so adapters can react.
- ❌ Pre-add chart `padding` inside a reserve helper. Reserves are
  padding-free; callers add `p` when their coordinate system needs
  it. See §4.3.

---

## 12. Source map

| File | Role |
|------|------|
| `src/types/shared.ts` | `TitleOptions` and `LegendOptions` interfaces. |
| `src/adapters/common.ts` | `LEGEND_RESERVE` constant; `EdgeReserves` type; `getTitleReserve()`, `getLegendReserve()`, `buildTitle()`, `buildLegend()`, `buildGrid()` (consumer of both reserves). `getTitleHeight()` is module-private. |
| `src/adapters/radar.ts` | Body-centered consumer composing both reserves — `getEdgeReserves` + `buildRadarLayout` use `getTitleReserve` + `getLegendReserve(..., RADAR_EDGE_GAP)`. |
| `src/adapters/pie.ts` / `gauge.ts` / `sankey.ts` | Title-only consumers — read `getTitleReserve(options).top` to shift the chart body below the title widget. |
| `src/adapters/bar.ts` / `line.ts` / `area.ts` | Each XY adapter wires `buildTitle` + `buildLegend` + `buildGrid` (which delegates to both reserve helpers). |
| `src/themes/echarts-theme.ts` | `title.textStyle.color` and `legend.textStyle.color` both bind to `textPrimary`. |
| `src/types/<chart>.ts` | Each per-chart subtype either exposes `legend?: LegendOptions` (XY / pie / radar) or omits it (gauge / sankey / chord). Title is inherited universally from base `ChartOptions`. |
| `src/adapters/common.test.ts` | Direct tests for `getTitleReserve` and `getLegendReserve`. |
| `src/adapters/radar.test.ts` | End-to-end tests for the body-centered consumer pattern (composes both reserves). |
| `src/adapters/bar.test.ts` | End-to-end tests for the grid consumer pattern (`legendShow` override). |
| `src/index.ts` | Re-exports `LEGEND_RESERVE`, `EdgeReserves`, `getTitleReserve`, `getLegendReserve`, `LegendOptions` (and `TitleOptions` via the `types` barrel) to the package root for `registerAdapter` users. |
