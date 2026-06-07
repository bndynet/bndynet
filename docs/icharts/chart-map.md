# Map

A map chart renders region-based values on top of a registered GeoJSON (or SVG) map resource.

## Registering the map resource

Register the map once, then reference it from `MapChartOptions.mapName`:

```ts
import { registerMap, createChart, type MapData } from '@bndynet/icharts';

registerMap('china', chinaGeoJson);

const data: MapData = [
  { name: '北京市', value: 92 },
  { name: '上海市', value: 88 },
  { name: '广东省', value: 97 },
  { name: '浙江省', value: 85 },
  { name: '四川省', value: 79 },
  { name: '湖北省', value: 76 },
];

createChart(el, 'map', data, {
  title: '中国区域评分',
  mapName: 'china',
  visualMap: { min: 60, max: 100 },
});
```

`registerMap` accepts:
- raw GeoJSON (`FeatureCollection`)
- source object (`{ geoJSON | geoJson, specialAreas? }`)
- SVG map source (`{ svg }`)

Demo note: the site example uses a real China GeoJSON saved at `site/assets/china.geo.json` (downloaded from `https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json`).

## Data format (`MapData`)

```ts
const data: MapData = [
  { name: 'Region A', value: 120 },
  { name: 'Region B', value: 95, color: '#0ea5e9' }, // per-region color override
];
```

- `name` must match the region name in the registered map.
- `value` drives tooltip and visualMap.
- `color` (optional) overrides palette / `colorMap` for that single region.

## Options (`MapChartOptions`)

### `MapChartOptions` (extends `ChartOptions`)

```ts
{
  mapName: string;                          // required: registered map name
  nameProperty?: string;                    // default: 'name'
  showLabel?: boolean;                      // default: false
  autoHideOverflowLabel?: boolean;          // default: false
  roam?: boolean | 'move' | 'scale';        // default: false
  center?: [number, number];                // optional map center (lng, lat)
  zoom?: number;                            // optional initial zoom
  visualMap?: {
    show?: boolean;                         // default: true
    min?: number;                           // default: data min
    max?: number;                           // default: data max
    orient?: 'horizontal' | 'vertical';     // default: 'vertical'
    left?: string | number;                 // default: 'right'
    top?: string | number;
    bottom?: string | number;               // default: 12
    formatter?: string | ((value: number) => string);
    pieces?: Array<{ min?: number; max?: number; label?: string; color?: string }>;
    precision?: number;
    inRangeColors?: string[];               // default: [base blended with surface @20%, base]
  };
}
```

All fields are optional except `mapName`.
If `visualMap` is omitted and data contains numeric values, the adapter auto-enables it using data min/max.
Set `visualMap: { show: false }` to force a single-color map.
Common cross-cutting fields (`theme`, `title`, `padding`, `colors`, `colorMap`, `labelFontSize`, `tooltip`, `echarts`) live on base `ChartOptions` — see [chart-options-common.md](chart-options-common.md).

## Notes

- **Tooltip context.** `tooltip.customHtml` receives `ctx.kind === 'item'` with `name`, `value`, and resolved `color`.
- **visualMap defaults.** When `visualMap.min/max` are omitted, the adapter uses the current data range.
- **Overflow labels.** Set `autoHideOverflowLabel: true` to hide labels that do not fit inside their region bounds, and also hide labels for regions without usable values.
- **Escape hatch.** Advanced map options (e.g. region style details, selectedMode, emphasis behavior) are still reachable through `options.echarts.series[0]`.
