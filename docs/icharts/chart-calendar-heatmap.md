# Calendar Heatmap

A calendar heatmap renders a GitHub-contribution-style grid: one cell per day, colored by value, arranged by week and month. It uses ECharts' `calendar` coordinate system — a different coordinate system and data shape from the cartesian `heatmap` chart, which is why it is its own chart type (`calendarheatmap`).

Inspired by the [ECharts `calendar-heatmap` example](https://echarts.apache.org/examples/en/editor.html?c=calendar-heatmap).

## Data format (`CalendarHeatmapData`)

A flat list of `(date → value)` entries.

```ts
const data: CalendarHeatmapData = [
  { date: '2024-01-01', value: 12 },
  { date: '2024-01-02', value: 8 },
  { date: '2024-01-03', value: 25 },
  // …one entry per day; missing days render as empty cells
];
```

- `date` is any date-parseable string (`YYYY-MM-DD` recommended).
- `value` drives the visualMap color and the tooltip magnitude.

## Quick example

```ts
import { createChart } from '@bndynet/icharts';

createChart(el, 'calendarheatmap', data, {
  title: 'Commit Activity',
});
```

## Options (`CalendarHeatmapChartOptions`)

```ts
{
  range?: number | string | [string, string]; // default: year of the earliest date
  cellSize?: number | [number | 'auto', number]; // default: ['auto', 18]
  orient?: 'horizontal' | 'vertical';         // default: 'horizontal'
  dayLabel?: { firstDay?: number; show?: boolean };      // default: { firstDay: 1, show: true }
  monthLabel?: { show?: boolean; nameMap?: string | string[] }; // default: { show: true }
  showYearLabel?: boolean;                    // default: true
  visualMap?: HeatmapVisualMapOptions;        // hidden by default — set `show: true` to display the bar
}
```

All fields are optional. Common cross-cutting fields (`theme`, `title`, `padding`, `colors`, `colorMap`, `labelFontSize`, `tooltip`, `echarts`) live on the base `ChartOptions` — see [chart-options-common.md](chart-options-common.md).

### Notes

- **Range.** When `range` is omitted, the adapter uses the year of the earliest date (or the `[min, max]` span when the data crosses a year boundary), so the calendar always renders on a full grid.
- **Coloring.** Same pipeline as the cartesian heatmap: the resolved base color (via `colors` / `colorMap` / theme palette) is ramped through a continuous visualMap. The visualMap **bar is hidden by default** (cells still get their value-based color) — set `visualMap: { show: true }` to display it above the calendar. Missing days use the theme `surface` fill; cell dividers and weekday/month/year labels follow the theme.
- **Tooltips.** The default sync tooltip prints `<marker> <date>: <value>`. Wire `tooltip.customHtml` (or `tooltip.appendHtml`) for a custom body — `ctx.kind === 'item'` gives you `name` (the date), `value`, and the painted `color`.
- **Escape hatch.** Every ECharts calendar knob remains reachable through `options.echarts` (e.g. `options.echarts.calendar.splitLine`, `options.echarts.calendar.cellSize: ['auto', 20]`) — the adapter only assigns the structural defaults documented above.
