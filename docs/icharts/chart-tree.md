# Tree

## Data format (`TreeData`)

A single hierarchical root node — the simplest possible structure. Internal nodes carry `children`; leaves omit it. `value` is optional metadata surfaced in tooltips (the tree adapter does not size nodes by value).

```ts
{
  name: 'flare',
  children: [
    {
      name: 'analytics',
      children: [
        { name: 'cluster',  children: [{ name: 'AgglomerativeCluster' }] },
        { name: 'graph',    children: [{ name: 'BetweennessCentrality' }] },
      ],
    },
    {
      name: 'data',
      children: [{ name: 'DataField', value: 1759 }],
    },
  ],
}
```

Each node accepts an optional `color` to pin it (and its marker) to a specific hue, and an optional `collapsed: true` to render that sub-tree closed (the user can click to expand). The `colorMap` option works by node name, exactly like every other chart type.

**Direction.** The chart grows in one of four orientations, controlled by `options.direction` (default `'LR'`):

| Direction | Root edge | Leaf edge |
|-----------|-----------|-----------|
| `'LR'` (default) | left   | right  |
| `'RL'`           | right  | left   |
| `'TB'`           | top    | bottom |
| `'BT'`           | bottom | top    |

The adapter automatically flips the node label `position` so labels always point *outward* (parents toward the root edge, leaves toward the opposite edge) and reserves a label-width strip on **both** the root and leaf edges of the active axis so neither end clips. For vertical layouts (`'TB'`, `'BT'`) labels are additionally rotated 90° so the reading direction tracks the tree's growth: `'TB'` rotates labels clockwise (`-90`) so text reads top-to-bottom alongside a downward-growing tree; `'BT'` rotates counter-clockwise (`+90`) so text reads bottom-to-top alongside an upward-growing tree. This keeps long node names from competing for horizontal space with their siblings while keeping every label legible in the direction of the tree. Set `disableLabelRotate: true` to force horizontal labels even in vertical directions if your dataset uses very short names.

**Other knobs** (all optional): `nodeSize` (px, default 7), `enablePan` (drag-to-pan, default `true`), `enableZoom` (mouse-wheel zoom, default `false`), `expandAndCollapse` (click an internal node to collapse / expand its subtree, default `true`), `initialTreeDepth` (start with this many levels visible, default `-1` = fully expanded — useful for large trees: pass `2` to render only the root + one level), `showNodeLabel` (default `true`), `lineStyle` (`'curve' | 'polyline'`, default `'polyline'`, smooth vs elbow connectors), `disableLabelRotate` (default `false`; set `true` to force `rotate: 0` even in vertical directions), `formatNodeLabel` (customize each node label with plain text or `RichTextSpec`), `formatNodeIcon` (replace node markers with per-node avatar/icon images; accepts URL string or icon spec).

```ts
createChart(el, 'tree', orgData, {
  title: 'Org Chart',
  direction: 'TB',
  initialTreeDepth: 2,
  formatNodeLabel: ({ name, depth, isLeaf }) => ({
    segments: [
      {
        text: `${isLeaf ? 'Leaf' : 'Node'} D${depth} `,
        style: {
          width: 92,
          align: 'right',
          color: '#64748b',
        },
      },
      {
        text: name,
        style: 'name',
      },
    ],
    styles: {
      name: { fontWeight: 700 },
    },
  }),
});
```

## Options (`TreeChartOptions`)

### `TreeChartOptions` (extends `ChartOptions`)

```ts
{
  direction?: 'LR' | 'RL' | 'TB' | 'BT'; // default: 'LR'
  initialTreeDepth?: number;        // default: -1 (fully expanded)
  enableZoom?: boolean;             // default: false
  enablePan?: boolean;              // default: true
  showNodeLabel?: boolean;          // default: true
  lineStyle?: 'curve' | 'polyline'; // default: 'polyline' (smooth vs elbow connectors)
  nodeSize?: number;                // default: 7
  expandAndCollapse?: boolean;      // default: true
  disableLabelRotate?: boolean;     // default: false; force rotate=0 even for TB/BT
  formatNodeLabel?: (ctx: {
    node: TreeNode;
    name: string;
    depth: number;                  // root = 0
    isLeaf: boolean;
  }) => RichTextInput;              // string | RichTextSpec
  formatNodeIcon?: (ctx: {
    node: TreeNode;
    name: string;
    depth: number;
    isLeaf: boolean;
  }) =>
    | string                         // image URL
    | { image: string; width?: number; height?: number; shape?: 'square' | 'circle' }
    | null
    | undefined;
}
```
