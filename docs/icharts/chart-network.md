# Network

## Data format (`NetworkData`)

```ts
{
  nodes: [
    { name: 'Alice',   category: 'Frontend', value: 8 },
    { name: 'Bob',     category: 'Frontend', value: 5 },
    { name: 'Carol',   category: 'Backend',  value: 12 },
    { name: 'Dan',     category: 'Backend',  value: 6 },
  ],
  links: [
    { source: 'Alice', target: 'Carol', value: 4 },
    { source: 'Bob',   target: 'Carol', value: 2 },
    { source: 'Carol', target: 'Dan',   value: 6 },
  ],
  // Optional — explicit category ordering for the legend; otherwise
  // derived from unique `node.category` values in input order.
  categories: ['Frontend', 'Backend'],
}
```

Categories drive the legend and the default per-node color (every node in the same category shares a palette slot). Each node accepts optional `color`, `size`, `x` / `y`, and `fixed` overrides. When `value` is set and `size` is omitted, the adapter scales the marker size from the data range into `nodeSizeRange` (default `[10, 30]`). When neither is set, the adapter auto-sizes nodes from the rendered container: `min(width, height) / sqrt(nodeCount) * 0.10` clamped to `[8, 40]` px — sparse graphs in big cards get noticeable markers and dense graphs shrink automatically. Pin `options.nodeSize` to opt out.

The same √n heuristic also drives the **force-layout edge length**, with one twist: it's standardised against the **body** (the area outside title, legend, and padding) instead of the raw container. When `options.edgeLength` is omitted (and `variant` is `default`), the adapter computes `min(bodyWidth, bodyHeight) / sqrt(nodeCount) * 0.6` clamped to `[30, 250]` px, where `bodyWidth/Height = container − title − legend − padding` — exactly the same insets that drive `series.top/bottom/left/right`. The cluster therefore fills the area outside title and legend automatically: add a title and the springs shrink, move the legend to the side and the horizontal body shrinks, etc. Without this auto-sizing a 5-node graph in a 1100×460 card huddles in the middle (gravity pulls everything to center until the 60-px springs balance), wasting 80 % of the canvas. The 0.6 multiplier is calibrated so the canonical 16-node demo (body ≈ 394 px after subtracting title + 5-cat top legend + padding) lands exactly on the legacy 60-px default, keeping existing demos pixel-identical while sparse graphs and chrome-less cards fan out to use the available space. SSR / hidden containers fall back to 60 px. Pin `options.edgeLength` to opt out.

Each link accepts an optional `curveness?: number` (same scale as `options.edgeCurveness`: `0` straight, `0.3` ≈ gently curved). Per-link curveness wins over the chart-wide value, so you can flatten or bend individual edges without retuning the whole graph. **Bidirectional edges**: give `A → B` a positive curveness and `B → A` an equal *negative* one — the two arcs separate cleanly instead of overlapping into a single line:

```ts
links: [
  { source: 'A', target: 'B', curveness:  0.2 },
  { source: 'B', target: 'A', curveness: -0.2 },
]
```

In the `default` (force) layout, `x` / `y` are used as initial positions and `fixed: true` locks a node in place while the simulation settles around it — useful for "anchor a few nodes, let the rest auto-layout". Need fully manual positions (no algorithm at all)? Use the `echarts` escape hatch: `options.echarts = { series: [{ layout: 'none' }] }` and provide `x` / `y` on every node.

**Label density** — three orthogonal switches handle node-label clutter, each tackling a different failure mode:

| Option | Default | What it does |
|---|---|---|
| `showNodeLabel` | `true` | Master toggle. Set `false` to render no node labels at all. |
| `showAllLabels` | `false` | When `false`, the adapter applies the two label-pruning strategies below; when `true`, every node label renders unconditionally (escape hatch for small graphs, screenshots, presentations). |
| `labelMinNodeSize` | `14` | Hides the label on any node whose resolved marker size is below this threshold (px). Compared against the **resolved** per-node size, regardless of whether it came from an explicit `node.size`, value-scaling into `nodeSizeRange`, or the container-aware no-value fallback. Set `0` to disable the threshold. |

When `showAllLabels: false` (the default), the adapter combines two strategies:

1. **Overlap culling** — sets `labelLayout: { hideOverlap: true }` so ECharts walks every label's bounding box and hides the colliding ones, leaving the most-spread-out subset visible. This is what keeps dense **force** layouts readable.
2. **Size threshold** — hides labels on any node smaller than `labelMinNodeSize`. This is what `hideOverlap` *can't* do for **circular** layouts: with `rotateLabel: true` the labels radiate outward from the ring and rarely physically overlap, so `hideOverlap` does nothing and every name shows by default — including the ones that hover over a 10-px dot and look like noise. The size threshold trims those out.

Setting `showAllLabels: true` bypasses **both** strategies in one shot — equivalent to "I want every label, accept the overlap and the noise".

Independently, the `circular` variant reserves body-edge space for label overflow (akin to radar's `axisName` overflow). With `rotateLabel: true` ECharts renders each label tangent to the ring and the text extends *outward* radially past the ring radius — the worst-case overflow per edge equals the widest label's pixel width. The adapter measures the actual data via canvas `measureText` and reserves `max(node.name.length) + 8 px` on every side (capped at 200 px so a single freakishly long node name can't shrink the ring to a dot). This composes on top of the title + legend reserves, so circular labels never bleed into the title bar or legend slot regardless of which corner each node ends up at.

## Options (`NetworkChartOptions`)

### `NetworkChartOptions` (extends `ChartOptions`)

```ts
{
  // 'default' = force-directed simulation, 'circular' = nodes on a ring.
  variant?: 'default' | 'circular';

  // Interaction
  enablePan?: boolean;              // drag-to-pan, default: true
  enableZoom?: boolean;             // mouse-wheel zoom, default: false
  draggable?: boolean;             // drag individual nodes, default: true for 'default', false for 'circular'

  // Node rendering
  showNodeLabel?: boolean;         // master toggle for node labels, default: true
  nodeSize?: number;               // pinned size for nodes without `value`. Omit (default) to auto-size from container.
  nodeSizeRange?: [number, number]; // value-driven scaling range, default: [10, 30]

  // Label density (see "Label density" above for the full priority table)
  showAllLabels?: boolean;         // default: false. When false, the two strategies
                                   // below are active. Set true to bypass both and
                                   // force every node + edge label to render.
  labelMinNodeSize?: number;       // hide labels for nodes smaller than this many
                                   // resolved px, default: 14. Set 0 to disable.

  // Edge rendering
  showLinkLabel?: boolean;         // render `link.value` near each edge, default: false
  edgeCurveness?: number;          // 0 (straight) … 0.3 (gentle curve)
                                   // default: 0 for 'default', 0.3 for 'circular'
                                   // override per-edge via `link.curveness` (negative
                                   // values bend the other way → bidirectional pairs)

  // Force-layout tuning (only consulted when variant === 'default')
  repulsion?: number;              // node-node repulsion, default: 100
  edgeLength?: number;             // pinned spring length for force layout. Omit (default) to
                                   // auto-size from container so sparse graphs in big cards spread.
  gravity?: number;                // pull toward center, default: 0.1

  // Network renders a category legend (one entry per category).
  legend?: {
    show?: boolean;                // default: true iff data has categories
    position?: 'top' | 'bottom' | 'left' | 'right';
    type?: 'scroll' | 'plain';
    formatLabel?: (name: string, index: number) => string; // customize category text
  };
}
```
