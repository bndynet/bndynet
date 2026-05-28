# Chord

## Data format (`ChordData`)

```ts
{
  nodes: [
    { name: 'Engineering' },
    { name: 'Design' },
    { name: 'Marketing' },
  ],
  links: [
    { source: 'Engineering', target: 'Design',    value: 30 },
    { source: 'Engineering', target: 'Marketing', value: 20 },
    { source: 'Design',      target: 'Marketing', value: 15 },
  ],
}
```

Each node accepts optional `color` and `value` fields. When `value` is omitted, the arc size is derived from the sum of connected link values.

## Options (`ChordChartOptions`)

### `ChordChartOptions` (extends `ChartOptions`)

No chord-specific knobs today; reuses every field on the base `ChartOptions`.
