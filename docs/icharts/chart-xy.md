# Line / Bar / Area

Shared `XYData` shape (aliases: `LineData`, `BarData`, `AreaData`). Options: `XYChartOptions` plus per-type variants.

## Data format (`XYData`)

```ts
{
  categories: ['Jan', 'Feb', 'Mar'],   // x-axis labels or time values
  series: [
    { name: 'Revenue', data: [120, 200, 150] },
    { name: 'Cost',    data: [90,  170, 130] },
  ],
}
```

Line, bar, and area share the same runtime shape. The library exports `LineData`, `BarData`, and `AreaData` aliases for `XYData` so call sites and adapters can declare intent explicitly.

### Time axis

Pass date strings or timestamps as `categories` — the axis switches to time mode automatically. Supported formats: `YYYY-MM-DD`, `YYYY/MM/DD`, `YYYY-MM-DD HH:mm`, ISO 8601, Unix timestamps (ms or s).

## Options

### `XYChartOptions` (shared by line / bar / area, extends `ChartOptions`)

```ts
{
  stacked?: boolean;                 // stack series (line / bar / area)

  xAxis?: {
    name?: string;
    dateFormat?: string;              // e.g. 'MM/DD', 'YYYY-MM-DD'
    cursorFormat?: string;            // axis-pointer label; falls back to dateFormat
    formatLabel?: (value: string | number, index: number) => string | RichTextSpec;
    min?: number | string;            // pin lower bound (value/time axes; also 'dataMin')
    max?: number | string;            // pin upper bound (value/time axes; also 'dataMax')
  };
  yAxis?: {
    name?: string;
    formatLabel?: (value: string | number, index: number) => string | RichTextSpec;
    min?: number | string;
    max?: number | string;
  };

  // Per-series overrides (keyed by series name, '*' applies to all)
  series?: Record<string, {
    type?: 'line' | 'bar';
    smooth?: boolean | number;        // true, false, or 0–1 curveness
    lineWidth?: number;
    lineStyle?: 'solid' | 'dashed' | 'dotted';
    showLabel?: boolean;
    labelPosition?: 'inside' | 'outside' | 'center';
    showPoints?: boolean;
    yAxisIndex?: number;              // dual-axis: 0 (left) or 1 (right)
    markLines?: ('average' | 'max' | 'min')[];
    markPoints?: ('max' | 'min')[];
  }>;
}
```

> **Axis tick rich-text** — `xAxis.formatLabel` / `yAxis.formatLabel` accept
> the same `string | RichTextSpec` return as `legend.formatLabel`. Use
> `RichTextSpec` to inject icons, images, or styled segments next to tick
> labels (flag icons after country names, status pills, multi-style values).
> The library compiles each segment into ECharts' `{key|text}` rich-text
> markup and registers the matching styles on `axisLabel.rich` automatically.
>
> RichText support is currently limited to **category axes** — vertical
> bar / line / area x-axis with named `data.categories`, horizontal-bar
> y-axis, and bar-race y-axis. Value and time axes pick their tick values
> at runtime, so the per-segment style map cannot be pre-registered;
> `RichTextSpec` returns there are flattened to plain text. Plain string
> returns work everywhere. See the **Population by Country** chart in the
> Dynamic Data demo for a runnable example (country name + flag SVG via
> `RichTextStyle.backgroundImage`).

### `LineChartOptions` (extends `XYChartOptions`)

```ts
{
  variant?: 'default' | 'spark' | 'race';

  // Variant-specific sub-namespace — only consulted when `variant === 'race'`.
  race?: {
    frameDuration?: number;   // override the auto-measured tick interval; clamped to [80, 3000] ms
    showValueLabel?: boolean; // animated end-of-line label, default: true
  };
}
```

### `BarChartOptions` (extends `XYChartOptions`)

```ts
{
  variant?: 'default' | 'horizontal' | 'spark' | 'race';

  // Bar sizing + per-bar coloring — apply to every variant, flat on the subtype.
  barWidth?: number | string;       // bar thickness, e.g. 24 or '60%'
  barMaxWidth?: number | string;    // cap on bar thickness
  barMinWidth?: number | string;    // floor on bar thickness
  barGap?: number | string;         // gap between bars of different series, default: '30%'
  barCategoryGap?: number | string; // gap between bar groups, default: '20%'
  colorByCategory?: boolean;        // color each bar by category name (auto-hides legend)

  // Variant-specific sub-namespace — only consulted when `variant === 'race'`.
  race?: {
    topN?: number;            // visible bars; maps to yAxis.max = topN - 1
    frameDuration?: number;   // override the auto-measured tick interval; clamped to [80, 3000] ms
    showValueLabel?: boolean; // animated value label at bar end, default: true
  };
}
```

### `AreaChartOptions` (extends `XYChartOptions`)

```ts
{
  variant?: 'default' | 'spark';
}
```

### Bar race (`variant: \"race\"`)

### Bar Race (Dynamic Sorting Bar Chart)

`variant: 'race'` renders one ranked snapshot per call. You drive the animation by calling `chart.update(nextFrame)` on your own interval — the library handles the smooth value/position transitions in between.

```ts
const racers = ['USA', 'China', 'India', 'Brazil', 'Japan'];

function frameFor(year: number) {
  return {
    categories: racers,                       // stable across frames — defines bar identity
    series: [{
      name: 'Population (M)',
      data: populationLookup[year],           // current values, unsorted
    }],
  };
}

const chart = createChart(el, 'bar', frameFor(1950), {
  variant: 'race',
  race: { topN: 10 },             // frameDuration auto-measured (see below)
  title: 'Population — 1950',
});

let year = 1950;
const timer = setInterval(() => {
  year++;
  if (year > 2023) { clearInterval(timer); return; }
  chart.update(frameFor(year), { title: `Population — ${year}` });
}, 1000);
```

Rules for the data you feed each frame:

- `categories` defines the racer set — keep its **order and contents stable** across frames. ECharts uses the index to match bars between frames, so any reorder will scramble the animation.
- Do **not** pre-sort. `realtimeSort: true` is on by default; just supply raw values for each racer in their registered order.
- For racers that are absent in a given frame, use `0` (or `null`) rather than removing them from `categories`.
- Use only `series[0]` — bar race shows a single ranked metric. Additional series are ignored.
- **Don't repeat your tick interval.** The library auto-measures the gap between `chart.update()` calls and uses it as the per-frame animation duration; just call `update()` on your own `setInterval` and the animation paces itself. Pass `race.frameDuration` only to override that (e.g. to deliberately slow a fast stream for readability).
- **Right-side label headroom is automatic.** The plot area's `grid.right` is sized to the widest value string in the current frame (canvas-measured) and grows monotonically across frames so digit flips don't jitter the layout. Set `grid.right` explicitly to opt out, or `race.showValueLabel: false` to skip the reserve entirely.

Race-specific options live under `race`:

```ts
{
  variant: 'race',
  race: {
    topN?: number;            // visible bars (omit to show all); maps to yAxis.max = topN - 1
    frameDuration?: number;   // override the auto-measured tick interval; clamped to [80, 3000] ms
    showValueLabel?: boolean; // animated value label at bar end (default: true)
  },
}
```

Add `colorByCategory: true` to give every racer its own color (matches the look of the official ECharts country-race demo). The library auto-hides the legend in that mode.

### Line race (`variant: \"race\"`)

### Line Race (Animated Multi-Line Trail Chart)

`variant: 'race'` on a line chart turns repeated `chart.update(nextFrame)` calls into a smooth animation: each line extends with the new tail point and a tracking label at the line's leading edge ticks to the latest value.

```ts
const racers = ['China', 'India', 'USA', 'Nigeria', 'Pakistan'];

function frameFor(year: number) {
  const years = range(START_YEAR, year);            // [1960, 1961, …, year]
  return {
    categories: years,                              // grows by one each frame
    series: racers.map((name) => ({
      name,                                         // stable across frames
      data: years.map((y) => historyLookup[name][y]), // trail up to `year`
    })),
  };
}

const chart = createChart(el, 'line', frameFor(1960), {
  variant: 'race',                // frameDuration auto-measured from setInterval
  title: 'Population — 1960',
});

let year = 1960;
const timer = setInterval(() => {
  year++;
  if (year > 2030) { clearInterval(timer); return; }
  chart.update(frameFor(year), { title: `Population — ${year}` });
}, 500);
```

Rules for the data you feed each frame:

- `series[i].name` is the racer identity — keep names **stable across frames**. ECharts diffs series by name to animate transitions; renaming a series will reset its trail.
- Each frame typically carries the **full trail** (categories + each series's data extended by one point). Don't ship just the latest point — the chart needs the history to render the line.
- **Don't repeat your tick interval.** The library auto-measures the gap between `chart.update()` calls and uses it as the per-frame animation duration; just call `update()` on your own `setInterval` and the animation paces itself. Pass `race.frameDuration` only when you want to override the measured cadence.
- **Right-side end-label headroom is automatic.** The plot area's `grid.right` is sized to the widest `<seriesName> <value>` string in the current frame and grows monotonically as labels widen, so digit flips don't jitter the lines. Set `grid.right` explicitly to opt out, or `race.showValueLabel: false` to skip the reserve entirely.
- A reasonable racer count is 3–8 lines. More lines work but end-labels start overlapping.

Race-specific options live under `race`:

```ts
{
  variant: 'race',
  race: {
    frameDuration?: number;   // override the auto-measured tick interval; clamped to [80, 3000] ms
    showValueLabel?: boolean; // animated end-of-line label (default: true)
  },
}
```

#### Smooth streaming feel (axis pinning)

By default, line race auto-pins `xAxis.min` to the first category **only when the categories are timestamps** (10-digit unix seconds, 13-digit unix ms, or ISO date strings). On a category axis (e.g. `[1960, 1961, …]` as plain 4-digit numbers, or strings like `'Q1'`), ECharts re-lays out the axis every frame and existing points slide horizontally — the line appears to "compress" instead of extend.

For a truly smooth, ticker-style stream, do both:

1. Pass categories as **timestamps** so the time-axis path kicks in.
2. Pin `xAxis.max` yourself (the adapter only auto-pins `min`). With both edges fixed, existing points never move pixel-wise — only the new tail slides in.

```ts
const START = Date.UTC(1960, 0, 1);
const END   = Date.UTC(2031, 0, 1);

createChart(el, 'line', frameAt(1960), {
  variant: 'race',
  xAxis: { min: START, max: END, dateFormat: 'YYYY' },
});
```

For **live streaming** with an unknown end-time, use a **sliding window**: keep a growing buffer of points, and update `xAxis.min` / `xAxis.max` to `[now - windowMs, now]` on every frame. Both edges slide in lock-step so points keep their absolute timestamp positions — that's the canonical heart-rate-monitor look. See the "Live Streaming" card on the Dynamic Data demo page for a full example.

> **Trap — don't `shift()` per tick.** ECharts diffs line series by array **index**, not by timestamp. If you prune one point at the head every tick (e.g. `data.shift()` to keep the array bounded), every remaining index shifts by one, which morphs each point to its right neighbor's old position and fights the axis-slide animation. The visible symptom is a "shudder" at the leftmost edge once the line has filled the window. Fix: keep a generous buffer (e.g. 5× the visible window) and prune in rare, large batches — the dropped points are far off-screen by then, so the visible portion stays index-stable.

### Mixed line + bar

### Mixed Line + Bar

```ts
createChart(el, 'line', data, {
  series: {
    'Revenue': { type: 'bar' },
    'Trend':   { type: 'line', smooth: true, lineStyle: 'dashed' },
  },
});
```
