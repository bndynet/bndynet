# Treemap

A treemap renders hierarchical data as nested rectangles whose area is proportional to each node's value. Click any node to drill into its sub-tree; click the breadcrumb to navigate back.

Inspired by the [ECharts `treemap-disk` example](https://echarts.apache.org/examples/en/editor.html?c=treemap-disk).

## Data format (`TreemapData`)

An array of one or more roots. Each node carries a `name`, an optional `value` (required on leaves; auto-summed on internal nodes), and an optional `children` array. Per-node `color` overrides the resolved palette for that rectangle.

```ts
const data: TreemapData = [
  {
    name: 'flare',
    children: [
      {
        name: 'analytics',
        children: [
          { name: 'cluster', value: 3938 },
          { name: 'graph',   value: 1234 },
        ],
      },
      { name: 'data', value: 4170 },
      { name: 'display', value: 760, color: '#ef4444' },
    ],
  },
];
```

- `value` is required on **leaves**; ECharts uses it to size the rectangle.
- Internal nodes may omit `value` — ECharts sums the descendants automatically.
- `colorMap` works by **root-level** node name. Children inherit ECharts' built-in tinting (each descendant level is a lighter shade of its parent's color) unless individually pinned via `node.color`.

## Quick example

```ts
import { createChart } from '@bndynet/icharts';

createChart(el, 'treemap', data, {
  title: 'Disk Usage',
});
```

## Options (`TreemapChartOptions`)

### `TreemapChartOptions` (extends `ChartOptions`)

```ts
{
  showBreadcrumb?: boolean;   // default: true  — drill-down trail at the bottom
  showNodeLabel?: boolean;    // default: true  — text inside each rectangle
  leafDepth?: number;         // default: undefined (render all levels)
  drilldown?: boolean;        // default: true  — click a node to zoom into it
  enableRoam?: boolean;       // default: false — wheel zoom + drag pan inside a node
}
```

All fields are optional. Common cross-cutting fields (`theme`, `title`, `padding`, `colors`, `colorMap`, `labelFontSize`, `tooltip`, `echarts`) live on the base `ChartOptions` — see [chart-options-common.md](chart-options-common.md).

### Notes

- **Tooltips.** The default sync tooltip prints `<marker> <name>: <value>`. Wire `tooltip.customHtml` (or `tooltip.appendHtml`) for a custom body — the `ctx.kind === 'item'` shape gives you `name`, `value`, and the painted `color`.
- **Drill-down.** With `drilldown: true` (default) the user can click a non-leaf rectangle to zoom in, then use the breadcrumb to step back out. The breadcrumb's first cell is labelled from `options.title` (so the path always starts with the chart name); set `title` to whatever should appear there, or override via `options.echarts.series[0].name`. Set `drilldown: false` for a static treemap (useful for snapshot exports).
- **Initial collapse.** Pass `leafDepth: 2` to render only the first two levels and reveal deeper levels on drill-down. Useful for very deep hierarchies (`-1` / `undefined` renders every level at once).
- **Escape hatch.** Every ECharts treemap knob (e.g. `levels`, `visualDimension`, `visualMin`, custom `colorMappingBy`) remains reachable through `options.echarts.series[0]` — the adapter only assigns the structural defaults documented above.
