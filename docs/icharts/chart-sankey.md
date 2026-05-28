# Sankey

## Data format (`SankeyData`)

```ts
{
  nodes: [
    { name: 'Coal' },
    { name: 'Solar' },
    { name: 'Electricity' },
    { name: 'Heat' },
  ],
  links: [
    { source: 'Coal',  target: 'Electricity', value: 120 },
    { source: 'Solar', target: 'Electricity', value: 80 },
    { source: 'Coal',  target: 'Heat',        value: 60 },
  ],
}
```

Each node accepts an optional `color` field to pin it to a specific color. The `colorMap` option can also be used to assign colors by node name.

## Options (`SankeyChartOptions`)

### `SankeyChartOptions` (extends `ChartOptions`)

```ts
{
  variant?: 'default' | 'vertical';
}
```
