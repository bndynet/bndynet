# Pie

## Data format (`PieData`)

```ts
[
  { name: 'Chrome',  value: 65 },
  { name: 'Firefox', value: 15 },
  { name: 'Safari',  value: 12 },
]
```

## Options (`PieChartOptions`)

### `PieChartOptions` (extends `ChartOptions`)

```ts
{
  variant?: 'default' | 'doughnut' | 'half-doughnut' | 'nightingale';
  innerRadius?: string | number;            // when omitted on doughnut/half-doughnut, ring width auto-sizes by container
  outerRadius?: string | number;
  autoSort?: boolean;                 // default: true (sort slices by value desc)

  // Slice styling — flat on the subtype, `slice` prefix disambiguates the
  // otherwise-generic field names at the top level.
  sliceBorderRadius?: number;
  sliceBorderColor?: string;
  sliceGap?: number;                  // gap between slices, in degrees

  centerLabels?: Array<string | RichTextSpec>; // multi-line center labels, auto-sized, themed text color
  centerLabelOffset?: [number, number];        // optional px offset for centerLabels: [x, y]

  // Pie is the only non-XY chart that renders a legend.
  legend?: {
    show?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
    type?: 'scroll' | 'plain';        // default: 'scroll' (paginates instead of wrapping)
    formatLabel?: (name: string, index: number) => string; // customize legend entry text
  };
}
```
