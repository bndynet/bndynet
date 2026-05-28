# Radar

## Data format (`RadarData`)

```ts
{
  indicators: [
    { name: 'Sales',          max: 6500 },
    { name: 'Administration', max: 16000 },
    { name: 'IT',             max: 30000 },
    { name: 'Support',        max: 38000 },
    { name: 'Development',    max: 52000 },
    { name: 'Marketing',      max: 25000 },
  ],
  series: [
    { name: 'Allocated Budget', values: [4200, 3000, 20000, 35000, 50000, 18000] },
    { name: 'Actual Spending',  values: [5000, 14000, 28000, 26000, 42000, 21000] },
  ],
}
```

`series[i].values[j]` is plotted on `indicators[j]`, so both arrays must line up by index. `max` / `min` are optional — omit them to let ECharts auto-scale each axis to the data range.

## Options (`RadarChartOptions`)

### `RadarChartOptions` (extends `ChartOptions`)

```ts
{
  variant?: 'default' | 'circle';   // polygon outline (default) or circular rings
  filled?: boolean;                  // fill polygon area, default: true
  radius?: string | number;          // radar.radius, default: '65%'

  // Radar is a non-XY chart that still renders a legend (one entry per polygon).
  legend?: {
    show?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
    type?: 'scroll' | 'plain';        // default: 'scroll' (paginates instead of wrapping)
    formatLabel?: (name: string, index: number) => string; // customize legend entry text
  };
}
```
