# Heatmap

A heatmap renders a grid of cells where each cell's color encodes a numeric value. Cells are positioned along two category axes (`xCategories` / `yCategories`) and colored through a continuous `visualMap` (auto-enabled from the data range).

Inspired by the [ECharts `heatmap-cartesian` example](https://echarts.apache.org/examples/en/editor.html?c=heatmap-cartesian).

## Data format (`HeatmapData`)

```ts
const data: HeatmapData = {
  xCategories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  yCategories: ['Morning', 'Afternoon', 'Evening'],
  data: [
    { x: 0, y: 0, value: 12 },
    { x: 1, y: 0, value: 8 },
    { x: 'Wed', y: 'Afternoon', value: 25 }, // category labels also accepted
    // …one entry per (x, y) cell; missing cells render empty
  ],
};
```

- `x` / `y` accept a **zero-based index** into `xCategories` / `yCategories`, or the **category label** itself. A number that is both a valid index and a category label is treated as an index.
- `value` drives the `visualMap` color and the tooltip magnitude. Cells may be sparse — omitted (x, y) pairs simply render as empty slots.
- `yCategories[0]` renders at the **top** of the grid (natural reading order).

## Quick example

```ts
import { createChart } from '@bndynet/icharts';

createChart(el, 'heatmap', data, {
  title: 'Weekly Activity',
});
```

## Options (`HeatmapChartOptions`)

### `HeatmapChartOptions` (extends `ChartOptions`)

```ts
{
  xAxis?: AxisOptions;         // category axis (name / show / formatLabel)
  yAxis?: AxisOptions;         // category axis (name / show / formatLabel)
  grid?: GridOptions;          // top / right / bottom / left / show
  showCellLabel?: boolean;     // default: false — draw each cell's value
  cellBorderWidth?: number;    // default: 1 — cell border stroke width (px)
  visualMap?: HeatmapVisualMapOptions; // see below
}
```

`xAxis` / `yAxis` reuse the shared [`AxisOptions`](chart-options-common.md) shape (the `formatLabel` rich-text support applies, since both axes are category axes).

### `HeatmapVisualMapOptions`

```ts
{
  show?: boolean;              // default: auto (true when cells have numeric values)
  min?: number;                // default: data minimum
  max?: number;                // default: data maximum
  orient?: 'horizontal' | 'vertical'; // default: 'vertical'
  width?: number;             // color bar width: horizontal length (120) / vertical thickness (10)
  left?: string | number;      // default: 'right' (vertical) / 'center' (horizontal)
  right?: string | number;     // alternative to `left`
  top?: string | number;       // alternative to `bottom`
  bottom?: string | number;    // default: 12 (vertical) / 8 (horizontal)
  formatter?: string | ((value: number) => string);
  pieces?: Array<{ min?: number; max?: number; label?: string; color?: string }>;
  precision?: number;          // label decimal precision
  text?: [string | null, string | null]; // explicit end labels
  inRangeColors?: string[];    // explicit continuous ramp
}
```

When `visualMap` is omitted and cells carry numeric values, the adapter auto-enables a continuous visualMap using the data min/max — vertical and right-aligned by default. Set `visualMap: { show: false }` to color every cell with a single palette color instead. With `orient: 'horizontal'` the adapter renders a horizontal gradient bar at the bottom; its min/max end labels are omitted because ECharts' rotated horizontal layout would misplace them (pass `text` explicitly to force them).

All fields are optional. Common cross-cutting fields (`theme`, `title`, `padding`, `colors`, `colorMap`, `labelFontSize`, `tooltip`, `echarts`) live on the base `ChartOptions` — see [chart-options-common.md](chart-options-common.md).

### Notes

- **Coloring.** The color ramp is derived from the library's color pipeline: the resolved base color (via `colors` / `colorMap` / theme palette) is blended over the theme `surface` at 20% for the low stop and used at full strength for the high stop. Cell **border color** follows the theme (`itemDivider`, falling back to `surface`).
- **Tooltips.** The default sync tooltip prints `<marker> <x> × <y>: <value>`. Wire `tooltip.customHtml` (or `tooltip.appendHtml`) for a custom body — the `ctx.kind === 'item'` shape gives you `name` (`"x × y"`), `value`, and the painted `color`.
- **Escape hatch.** Every ECharts heatmap knob remains reachable through `options.echarts` (e.g. `options.echarts.visualMap.itemWidth`, `options.echarts.series[0].emphasis`, custom `visualMap` styles) — the adapter only assigns the structural defaults documented above.
