# @bndynet/icharts

A lightweight charting library with a Web Component (`<i-chart>`) and a simple `createChart()` API.

## Installation

```bash
npm install @bndynet/icharts
```

---

## Quick Start

### Option 1 — Web Component (HTML)

```html
<script type="module">
  import '@bndynet/icharts';
</script>

<i-chart id="myChart" type="line" style="width: 600px; height: 400px;"></i-chart>

<script type="module">
  const chart = document.getElementById('myChart');
  chart.data = {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    series: [
      { name: 'Revenue', data: [120, 200, 150, 80, 270] },
      { name: 'Cost',    data: [90,  170, 130, 60, 210] },
    ],
  };
  chart.options = { title: 'Monthly Overview' };
</script>
```

### Option 2 — JavaScript / TypeScript

```ts
import { createChart } from '@bndynet/icharts';

const chart = createChart(
  document.getElementById('app'),
  'bar',
  {
    categories: ['Q1', 'Q2', 'Q3', 'Q4'],
    series: [{ name: 'Sales', data: [300, 450, 280, 600] }],
  },
  { title: 'Quarterly Sales' }
);

// Update / resize later:
chart.update(newData, newOptions);
chart.resize();

// Disposal is automatic — the chart releases itself the moment its
// container leaves the DOM (e.g. when a Vue/React component unmounts).
// Calling `chart.dispose()` explicitly is still supported and idempotent
// for cases where you want to free resources eagerly.
chart.dispose();
```

### Option 3 — CDN (no bundler)

```html
<script src="./node_modules/@bndynet/icharts/dist/index.global.js"></script>

<div id="chart" style="width: 600px; height: 400px;"></div>
<script>
  iCharts.createChart(document.getElementById('chart'), 'pie', [
    { name: 'Chrome',  value: 65 },
    { name: 'Firefox', value: 15 },
    { name: 'Safari',  value: 12 },
    { name: 'Edge',    value: 8  },
  ]);
</script>
```

### Option 4 — SSR / Server-Side Rendering (Next.js, Nuxt, Astro, SvelteKit, Vite SSR…)

Import from the SSR-safe subpath `@bndynet/icharts/core` so the module
graph never touches the `<i-chart>` web component, Lit, or the
`@echarts-x` plugin installers. There are two distinct SSR scenarios
this entry supports:

#### 4a. Client-side chart, SSR-safe import (the common case)

The page is server-rendered to HTML, the chart is instantiated **on the
client** inside a lifecycle hook (`onMounted`, `useEffect`, `'use client'`
boundary, …). The server import only needs to be safe to evaluate.

```ts
// SSR-safe: this import does not access `window` / `document` /
// `customElements` and is safe to evaluate on the server.
import { createChart } from '@bndynet/icharts/core';

// In client-only lifecycle code:
onMounted(() => {
  createChart(el.value, 'line', {
    categories: ['Jan', 'Feb', 'Mar'],
    series: [{ name: 'Sales', data: [10, 20, 30] }],
  });
});
```

#### 4b. Server-rendered chart image (no browser needed)

Generate a complete `<svg>...</svg>` document directly on the server —
inline it into HTML, save it to disk, attach it to an email, or pipe it
through `sharp` / `@resvg/resvg-js` to produce PNG. No DOM, no canvas,
no headless browser required. Powered by ECharts 6's built-in SSR mode.

```ts
import { renderChartToSVGString } from '@bndynet/icharts/core';
import { writeFileSync } from 'node:fs';

const svg = renderChartToSVGString(
  'line',                                                              // chart type
  {                                                                    // data
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    series: [
      { name: 'Revenue', data: [120, 200, 150, 80, 270] },
      { name: 'Cost',    data: [90,  170, 130, 60, 210] },
    ],
  },
  { width: 800, height: 400 },                                         // SSR options
  { title: 'Quarterly Revenue', theme: 'default' },                    // chart options
);

writeFileSync('chart.svg', svg);
```

`RenderChartToSVGStringOptions` controls the rendered viewport:

| Field            | Required | Description                                                                                         |
|------------------|----------|-----------------------------------------------------------------------------------------------------|
| `width`          | yes      | Viewport width in px (used as the SVG coordinate system).                                           |
| `height`         | yes      | Viewport height in px.                                                                              |
| `locale`         | no       | ECharts locale (default `'EN'`).                                                                    |
| `useViewBox`     | no       | `true` (default) → root `<svg>` carries `width` + `height` + `viewBox`. `false` → no `viewBox` (strictly fixed-size). |

The underlying ECharts instance is created and disposed entirely
inside the function, so calling it in a hot request loop never leaks
engine state.

To convert the SVG to PNG (for emails, social cards, server-side
rasterization), use a standalone library — icharts deliberately stays
SVG-only so SSR consumers don't pay for a native canvas dependency
they may not need:

```ts
import { renderChartToSVGString } from '@bndynet/icharts/core';
import { Resvg } from '@resvg/resvg-js';

const svg = renderChartToSVGString(
  'pie',
  [{ name: 'Apple', value: 30 }, { name: 'Banana', value: 50 }, { name: 'Cherry', value: 20 }],
  { width: 800, height: 500 },
  { title: 'Fruit Mix', legend: { show: true, position: 'bottom' } },
);

const png = new Resvg(svg).render().asPng();   // Buffer
// or with sharp:
//   const png = await sharp(Buffer.from(svg)).png().toBuffer();
```

**SSR-mode fallbacks** — a few canvas-based features degrade
gracefully when no DOM / canvas is available:

- Label-width measurement falls back to a `chars × 7px` estimate, so
  race-chart `grid.right` headroom and tree label widths can drift by
  1–2 px from browser output.
- `ResizeObserver` is unavailable, so the pie adapter's resize-driven
  pixel-perfect center / radius recompute is replaced by the static
  percent fallback (still legible, slightly less centered).
- ECharts' SVG renderer approximates text widths internally, so very
  long labels can wrap differently than in the browser. Pad your
  widths slightly if you depend on exact parity.

These trade-offs are intrinsic to the SSR contract; the library
documents them but does not paper over them with hidden polyfills.

#### Entry-point cheat sheet

| Entry                              | Auto-loads `<i-chart>`                       | Auto-loads wordcloud + liquid-progress | Safe to import on the server | `renderChartToSVGString` |
|------------------------------------|----------------------------------------------|----------------------------------------|------------------------------|--------------------------|
| `@bndynet/icharts` (default)       | yes (no-op when `customElements` is absent)  | yes                                    | no — the `@echarts-x` plugins reference `window` / `document` at module load | yes (re-exported from /core) |
| `@bndynet/icharts/core` (SSR)      | no                                           | no                                     | yes                          | yes                          |

If you import the default entry from a server bundle, keep the
import inside a client-only branch (Next.js `'use client'` files,
Nuxt `<client-only>` islands, dynamic `await import()` inside
`onMounted`, …).

#### Plugin-backed chart types under `/core` (`liquidprogress`, `wordcloud`)

The SSR-safe entry deliberately does NOT auto-register the
`@echarts-x/*` plugins on import. Opt in per chart type:

- **`liquidprogress` (server + client):** call the SSR-safe installer
  once at boot. It hides the `echarts` and `@echarts-x/*` packages —
  you stay on `@bndynet/icharts/core`-only imports.

  ```ts
  import { installLiquidProgress, renderChartToSVGString } from '@bndynet/icharts/core';

  installLiquidProgress(); // idempotent — call once at boot or per request

  const svg = renderChartToSVGString(
    'liquidprogress',
    { value: 0.65 },
    { width: 400, height: 400 },
    { title: 'CPU' },
  );
  ```

  For the **client** path under `/core`, the same `installLiquidProgress()`
  call works from a client-only branch (`onMounted`, `useEffect`, …).
  Or simply pull in the main entry via dynamic import — that registers
  liquidprogress + wordcloud both:

  ```ts
  await import('@bndynet/icharts');                          // both plugins
  await import('@bndynet/icharts/dist/installers/index.js'); // narrower, same effect
  ```

- **`wordcloud` (browser-only):** the `@echarts-x/custom-word-cloud`
  package requires a real `window` at module-load and a real `<canvas>`
  with `addEventListener` at render-time — both fundamental browser
  dependencies that `renderChartToSVGString` cannot fake. There is
  intentionally no `installWordCloud()` helper. Render wordcloud only
  on the client, via `createChart('wordcloud', …)` from the main
  `@bndynet/icharts` entry (or from a client-only branch when using
  `/core`).

  If you genuinely need wordcloud as a server-rendered image, run
  the chart in a real browser (Playwright / Puppeteer) and screenshot
  it — there is no pure-Node path today.

---

## Chart Types

| Type   | `type` value | Variants |
|--------|-------------|----------|
| Line   | `line`   | `default`, `spark`, `race` |
| Bar    | `bar`    | `default`, `horizontal`, `spark`, `race` |
| Area   | `area`   | `default`, `spark` |
| Pie    | `pie`    | `default`, `doughnut`, `half-doughnut`, `nightingale` |
| Gauge  | `gauge`  | `default`, `percentage` |
| Liquid Progress | `liquidprogress` | `default` |
| Sankey | `sankey` | `default`, `vertical` |
| Chord  | `chord`  | `default` |
| Radar  | `radar`  | `default`, `circle` |
| Network | `network` | `default`, `circular` |
| Tree   | `tree`   | `default` (use `direction` for layout orientation) |
| Word Cloud | `wordcloud` | `default`, `diamond`, `poster` |

---

## Data Formats

Each chart type expects a specific data shape. Full schemas, field notes, and chart-specific options live in [`docs/`](docs/) (one file per family).

| Chart | Data type | Reference |
|-------|-----------|-----------|
| Line / Bar / Area | `XYData` (`LineData` / `BarData` / `AreaData`) | [docs/chart-xy.md](docs/chart-xy.md) |
| Pie | `PieData` | [docs/chart-pie.md](docs/chart-pie.md) |
| Word Cloud | `WordCloudData` | [docs/chart-wordcloud.md](docs/chart-wordcloud.md) |
| Gauge | `GaugeData` | [docs/chart-gauge.md](docs/chart-gauge.md) |
| Liquid Progress | `LiquidProgressData` | [docs/chart-liquidprogress.md](docs/chart-liquidprogress.md) |
| Sankey | `SankeyData` | [docs/chart-sankey.md](docs/chart-sankey.md) |
| Chord | `ChordData` | [docs/chart-chord.md](docs/chart-chord.md) |
| Radar | `RadarData` | [docs/chart-radar.md](docs/chart-radar.md) |
| Network | `NetworkData` | [docs/chart-network.md](docs/chart-network.md) |
| Tree | `TreeData` | [docs/chart-tree.md](docs/chart-tree.md) |

**Shared options** (theme, title, colors, tooltip, …): [docs/chart-options-common.md](docs/chart-options-common.md).

Runnable demos for every variant live in the [demo site](site/) (`npm start`).

---

## Options Reference

All options fields are optional. Each chart type extends the base `ChartOptions`; line / bar / area also share `XYChartOptions`.

| Chart type | Options interface | Extends | Reference |
|------------|-------------------|---------|-----------|
| `line` | `LineChartOptions` | `XYChartOptions` | [docs/chart-xy.md](docs/chart-xy.md) |
| `bar` | `BarChartOptions` | `XYChartOptions` | [docs/chart-xy.md](docs/chart-xy.md) |
| `area` | `AreaChartOptions` | `XYChartOptions` | [docs/chart-xy.md](docs/chart-xy.md) |
| `pie` | `PieChartOptions` | `ChartOptions` | [docs/chart-pie.md](docs/chart-pie.md) |
| `gauge` | `GaugeChartOptions` | `ChartOptions` | [docs/chart-gauge.md](docs/chart-gauge.md) |
| `liquidprogress` | `LiquidProgressChartOptions` | `ChartOptions` | [docs/chart-liquidprogress.md](docs/chart-liquidprogress.md) |
| `sankey` | `SankeyChartOptions` | `ChartOptions` | [docs/chart-sankey.md](docs/chart-sankey.md) |
| `chord` | `ChordChartOptions` | `ChartOptions` | [docs/chart-chord.md](docs/chart-chord.md) |
| `radar` | `RadarChartOptions` | `ChartOptions` | [docs/chart-radar.md](docs/chart-radar.md) |
| `network` | `NetworkChartOptions` | `ChartOptions` | [docs/chart-network.md](docs/chart-network.md) |
| `tree` | `TreeChartOptions` | `ChartOptions` | [docs/chart-tree.md](docs/chart-tree.md) |
| `wordcloud` | `WordCloudChartOptions` | `ChartOptions` | [docs/chart-wordcloud.md](docs/chart-wordcloud.md) |

`createChart` accepts `AnyChartOptions` — a chart-specific literal type-checks without importing the subtype. For stricter validation, import the matching `XxxChartOptions` and annotate explicitly.

Cross-cutting fields (`theme`, `title`, `padding`, `colors`, `colorMap`, `labelFontSize`, `tooltip`, `echarts`): [docs/chart-options-common.md](docs/chart-options-common.md).

Internal design notes: [docs/COLORS.md](docs/COLORS.md) (color pipeline), [docs/LAYOUT.md](docs/LAYOUT.md) (title + legend layout).

---

## Theming

Two built-in themes: `light` (default) and `dark`.

### Custom Theme

```ts
import { registerTheme } from '@bndynet/icharts';

registerTheme({
  name: 'ocean',
  colorMode: 'dark',           // inherit unspecified tokens from 'dark'
  colors: {
    background:  '#0c1a2e',
    textPrimary: '#ccd6f6',
  },
  palette: ['#64ffda', '#00b4d8', '#48cae4'],
});

createChart(el, 'bar', data, { theme: 'ocean' });
```

Call `registerTheme` once at application start, before any charts are created.

### Global Default Theme via `configure`

You can also set a library-level default theme through `configure`. When a chart does not specify `options.theme`, this configured theme will be used.

```ts
import { configure } from '@bndynet/icharts';

configure({
  theme: {
    name: 'ocean',
    colorMode: 'dark',
    colors: {
      background: '#0c1a2e',
      textPrimary: '#ccd6f6',
    },
    palette: ['#64ffda', '#00b4d8', '#48cae4'],
  },
});
```

`options.theme` still takes precedence over the global config for that specific chart.

### Consistent Colors Across Charts

When building dashboards with multiple charts, enable `consistentColors` so that the same name always gets the same color — regardless of which chart it appears in or how many series that chart has.

```ts
import { configure } from '@bndynet/icharts';

configure({ consistentColors: true });
```

With this enabled, if "Revenue" is palette color #1 in a line chart, it will also be #1 in a pie chart, a bar chart, or any other chart on the page.

**Pre-register specific name → color mappings (sticky pins):**

```ts
import { setColorMap } from '@bndynet/icharts';

// Apply to all themes
setColorMap({
  'Revenue':  '#ff6384',
  'Expenses': '#36a2eb',
  'Profit':   '#4bc0c0',
});

// Apply only to the dark theme
setColorMap({ 'Revenue': '#ff8fab' }, 'dark');
```

Pins set via `setColorMap` are **sticky**: they survive `switchTheme()` and
`resetColorMap()`, so a single call at app startup is enough. The auto-
assigned palette slots get wiped by SPA navigation, but your pinned colors
do not.

**Between-page state — usually automatic:**

`switchTheme(name)` now clears the target theme's auto-assigned color
slots as part of the switch, so most SPA pages do not need to call
`resetColorMap()` directly — mounting a page that calls
`switchTheme(currentTheme)` automatically restarts palette consumption
at index 0, while preserving any `setColorMap` pins.

```ts
import { resetColorMap } from '@bndynet/icharts';

// Use these only if a page doesn't call switchTheme on mount, or to wipe
// state mid-page without changing theme:
resetColorMap();          // every theme — auto entries cleared, pins kept
resetColorMap('dark');    // single theme — auto entries cleared, pins kept
```

Per-chart `colors` and `colorMap` options always take highest priority regardless of the global setting.

---

## Global API

| Function | Description |
|----------|-------------|
| `configure(opts)` | Set global options (e.g. `{ consistentColors: true }` or `{ theme: { name, colors, palette } }`) |
| `switchTheme(name)` | Switch all charts to a registered theme |
| `registerTheme(config)` | Register a custom theme |
| `setColorMap(map, themeName?)` | Pre-register name → color mappings (all themes or one) |
| `resetColorMap(themeName?)` | Clear accumulated color assignments (all themes or one) |
| `getSeriesColor(name)` | Get the assigned color (with hover/active/disabled states) for a name |
| `getCurrentTheme()` | Get the active theme object |
| `getThemeColors()` | Get the active theme's UI color tokens |
| `registerAdapter(type, adapter)` | Register a custom chart type adapter |

---

## Instance API

`createChart()` returns an instance with these methods:

| Method | Description |
|--------|-------------|
| `update(data?, options?)` | Re-render with new data / options |
| `setTheme(name)` | Switch to a registered theme without re-creating the instance |
| `resize()` | Trigger resize (e.g. after container size change) |
| `dispose()` | Destroy the chart and free memory. Called automatically when the container leaves the DOM (idempotent — safe to call again). |
| `getEChartsInstance()` | Access the underlying ECharts instance |

---

## Extensibility

Custom chart types can be registered via `registerAdapter`. Each adapter implements a `validate` guard and a `resolve` function that returns a full ECharts option object.

```ts
import { registerAdapter, type ChartAdapter } from '@bndynet/icharts';

const myAdapter: ChartAdapter = {
  validate(data) {
    return Array.isArray(data) && data.every(d => 'x' in d && 'y' in d);
  },
  resolve(data, options) {
    return {
      option: {
        xAxis: { type: 'value' },
        yAxis: { type: 'value' },
        series: [{ type: 'scatter', data: (data as any[]).map(d => [d.x, d.y]) }],
      },
    };
  },
};

registerAdapter('scatter', myAdapter);

// Use just like any built-in type
createChart(el, 'scatter', [{ x: 1, y: 2 }, { x: 3, y: 5 }]);
```

The optional `onInit` hook in the returned object receives the ECharts instance after the first `setOption` call, which is useful for attaching event listeners.

---

## Development

```bash
npm install
npm run dev        # Watch mode
npm run build      # Build all formats
npm run typecheck  # Type check
```

## License

MIT
