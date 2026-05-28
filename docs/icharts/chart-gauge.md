# Gauge

## Data format (`GaugeData`)

```ts
{ value: 72, max: 100, label: 'Score' }
```

`chart.update()` on a gauge chart merges into the previous frame: omit
`max` / `label` to keep them, include the key to override (`label: ''`
clears the caption; `max: undefined` drops a custom max so the default
`100` applies).

## Options (`GaugeChartOptions`)

### `GaugeChartOptions` (extends `ChartOptions`)

```ts
{
  variant?: 'default' | 'percentage';
  gaugeWidth?: number;                // arc thickness in px
}
```

For the `percentage` variant, omitting `gaugeWidth` enables auto-sizing:
the ring thickness and the inner number / label font sizes are derived
from the rendered container — `min(width, height)` — so the gauge keeps
balanced proportions across small KPI tiles and large hero cards, and
re-flows when the chart resizes. An explicit `gaugeWidth` always wins.
The `default` variant keeps fixed defaults regardless of container size.
