# Liquid Progress

## Data format (`LiquidProgressData`)

```ts
{ value: 72, max: 100, label: 'Storage' }
```

`LiquidProgressData` matches gauge's single-metric shape and supports the same
partial update merge behavior: `chart.update({ value })` keeps `max`/`label`
from the previous frame unless explicitly provided.

## Options (`LiquidProgressChartOptions`)

### `LiquidProgressChartOptions` (extends `ChartOptions`)

```ts
{
  variant?: 'default';
  radius?: string | number;           // default: '70%'
  waveCount?: number;                 // default: 3
  borderWidth?: number;               // default: 2
}
```
