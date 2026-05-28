# Word Cloud

## Data format (`WordCloudData`)

```ts
[
  { name: 'TypeScript', value: 120 },
  { name: 'ECharts', value: 100 },
  { name: 'Lit', value: 80, color: '#00b4d8' }, // optional per-word color pin
]
```

`WordCloudData` uses `{ name, value }[]` like pie, but render behavior is selected by `type: 'wordcloud'`. Words are sorted by value descending by default (`autoSort: true`) and placed via the ECharts custom word-cloud series.

## Options (`WordCloudChartOptions`)

### `WordCloudChartOptions` (extends `ChartOptions`)

```ts
{
  variant?: 'default' | 'diamond' | 'poster';

  // Layout + typography
  autoSort?: boolean;                // default: true (sort words by value desc)
  sizeRange?: [number, number];      // px font-size mapping range, default: [12, 60]
  shape?: 'circle' | 'cardioid' | 'diamond' | 'triangle-forward' | 'triangle' | 'pentagon' | 'star';
  rotationRange?: [number, number];  // degrees, default: [-90, 90]
  rotationStep?: number;             // degrees, default: 45
  gridSize?: number;                 // px, default: 8

  // Boundary behavior
  keepAspect?: boolean;              // keep mask-image ratio, default: false
  drawOutOfBound?: boolean;          // allow overflow draw, default: false
  shrinkToFit?: boolean;             // shrink words to fit dense layouts, default: false
  layoutAnimation?: boolean;         // default: true

  // Optional custom shape mask
  maskImage?: HTMLImageElement | HTMLCanvasElement;
}
```

Built-in presets:

- `diamond`: compact diamond composition (`shape: 'diamond'`, `rotationRange: [0, 0]`, `sizeRange: [14, 48]`, `gridSize: 10`)
- `poster`: headline-heavy hero style (`shape: 'star'`, `rotationRange: [-45, 45]`, `sizeRange: [16, 72]`, `rotationStep: 15`, `gridSize: 12`)

Any explicit field you pass still overrides the selected preset.
