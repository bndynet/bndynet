# Common chart options

Cross-cutting `ChartOptions` shared by every chart type. `legend` and `grid` live on chart-specific interfaces — see each chart doc.

### `ChartOptions` (cross-cutting, base for every chart)

```ts
{
  // Appearance
  theme?: string;                    // 'light' (default) | 'dark' | custom
  /**
   * Chart title. Pass a plain string as shorthand, or a TitleOptions object
   * for full control over alignment, font size, and padding.
   */
  title?: string | {
    text: string;
    align?: 'left' | 'center' | 'right';  // default: 'center'
    fontSize?: number;                     // default: 16
    padding?: number;                      // vertical whitespace above/below, default: 8
  };
  /**
   * Outer whitespace (px) between chart content and all canvas edges.
   * Applies to title, legend, and the plot area. Default: 12.
   */
  padding?: number;
  colors?: string[];                 // override color palette
  colorMap?: Record<string, string>; // pin series/node names to specific colors

  /**
   * Global font size (px) for data labels and edge labels across every
   * chart type that renders them.
   *
   * Applies to:
   *   - line / bar / area `series.label` (when `showLabel: true`) +
   *     line-race tracking labels (`endLabel`) + bar-race value labels
   *   - pie slice labels
   *   - sankey / chord / tree node labels (parent + leaf for tree)
   *   - network node `series.label` and `series.edgeLabel` (when
   *     `showLinkLabel: true`)
   *
   * Does NOT apply to:
   *   - gauge `title` / `detail` inner text (container auto-sized by
   *     the `percentage` variant)
   *   - radar `axisName` (indicator names, not data labels)
   *   - `markPoint.label`
   *
   * Default: 12.
   */
  labelFontSize?: number;

  // Tooltip
  tooltip?: {
    enabled?: boolean;
    /** Format the tooltip header when using a time x-axis (line/bar/area). */
    dateFormat?: string;
    /** Format each rendered value (axis-mode, pie slice, sankey/chord node/edge). */
    formatValue?: (value: number | string, name: string) => string;
    /**
     * Replace the chart's default synchronous tooltip body with custom
     * asynchronously loaded HTML. The user-supplied function fully owns the
     * tooltip body — the built-in name / value / percent / axis row is
     * NOT rendered when this hook is set. Use `appendHtml` instead when you
     * want to keep the default body and add extras below it.
     *
     * Receives a normalized TooltipContext — narrow with `ctx.kind`:
     *   - 'axis' for line / bar / area
     *   - 'item' for pie slice, sankey/chord/network/tree node, word in word-cloud
     *   - 'edge' for sankey/chord/network link
     *
     * ctx fields by kind:
     *   - axis: axisValueLabel, dataIndex, rawAxisValue,
     *           series: [{ name, value, marker?, color? }]
     *   - item: name, value, dataIndex, marker?, color?,
     *           percent? (pie only)
     *   - edge: source, target, value, dataIndex,
     *           sourceColor?, targetColor?
     *
     * Color semantics:
     *   - `color` / `series[i].color` is the resolved hex/rgb of that
     *     slice / series / node, respecting `options.colors` /
     *     `options.colorMap` / `node.color` / theme palette.
     *   - `sourceColor` / `targetColor` (edge) are looked up from the
     *     source/target node names (NOT ECharts' `params.color`, which
     *     is the literal string "gradient" for sankey/chord links by
     *     default). They report the source/target NODE color and do
     *     not reflect per-link `lineStyle.color` overrides on
     *     `data.links[i]`.
     *
     * Can be combined with `appendHtml`: customHtml provides the body,
     * appendHtml is rendered below it with a thin separator.
     *
     * Not applied to spark variants or when `tooltip.enabled === false`.
     */
    customHtml?: (ctx: TooltipContext) => Promise<string>;
    /**
     * Append asynchronously loaded HTML below the synchronous tooltip body.
     *
     * The "synchronous body" is whichever of these the chart resolves to:
     *   - the chart's built-in default sync row (when `customHtml` is not
     *     set), or
     *   - the HTML returned by `customHtml` (when it is set).
     *
     * appendHtml's output is rendered below that body, separated by a thin
     * dashed rule. This is the option to reach for when you want to keep
     * the default tooltip layout and just **add extras** (latency, owner,
     * last-updated timestamp, …) — unlike `customHtml` which fully replaces
     * the default body.
     *
     * Receives the same normalized TooltipContext as `customHtml` and
     * shares the same `placeholder` while pending. Not applied to spark
     * variants or when `tooltip.enabled === false`.
     */
    appendHtml?: (ctx: TooltipContext) => Promise<string>;
    /** Shown while `customHtml` / `appendHtml` is pending. Default: 'Loading…' */
    placeholder?: string;
    /**
     * Attach the tooltip DOM to `<body>` so it escapes ancestors with
     * `overflow: hidden` (card / KPI / dialog containers).
     *
     * Auto-decided when omitted:
     *   - Light DOM (`createChart(divEl, ...)`)  → true
     *   - Shadow DOM (`<i-chart>` web component) → false
     *
     * Set explicitly only for edge cases — e.g. `<i-chart>` rendered
     * inside a Vue `<Teleport>` where you want the tooltip in `<body>`
     * regardless of shadow, or a light-DOM chart whose tooltip should
     * stay glued to the host stacking context.
     */
    appendToBody?: boolean;
    /**
     * Pixel gap between the cursor and the nearest edge of the tooltip
     * box.
     *
     * Defaults:
     *   - `variant: 'spark'` (line / area / bar)  → 6 px
     *     (tight default for KPI-card-sized charts; 20 px is too
     *     much for a 96×48 box)
     *   - all other charts                         → ECharts' built-in
     *     20 px (existing charts keep original spacing)
     *
     * Pass any number to override either default. `0` is meaningful —
     * the tooltip sits right at the cursor.
     *
     * Implementation: the library translates this into a `position`
     * callback that mirrors ECharts' built-in edge-flip logic with
     * your gap substituted for 20. `echarts.tooltip.position`
     * (passthrough) still wins via the final deep merge.
     */
    cursorGap?: number;
  };

  // Advanced passthrough — for anything not covered above
  echarts?: Record<string, unknown>;
}
```

> `legend` and `grid` are intentionally **not** on the base — only chart types
> that actually render them expose the field. `legend` lives on `XYChartOptions`,
> `PieChartOptions`, and `RadarChartOptions`; `grid` lives on `XYChartOptions`.
> Gauge, sankey, and chord render neither.
>
> The legend defaults to `type: 'scroll'` — long series lists paginate with
> arrows instead of wrapping onto a second row. This keeps the chart-body
> layout reserve (a single legend-row height) accurate regardless of how many
> series are present. Pass `legend: { type: 'plain' }` to opt back into
> native ECharts wrapping; you'll then need to bump `padding` (or move the
> legend to a side edge) so wrapped rows don't overlap the plot area.
>
> Customize each entry's text via `legend.formatLabel: (name, index) => string`.
> Maps to ECharts' native `legend.formatter` and is the typed entry point
> for "show more info next to each entry" use cases — appending values,
> units, status, or rich-text segments. Returns plain strings or ECharts
> rich-text (`{key|text}`); paired with `echarts.legend.textStyle.rich`
> when you want multi-style labels. Side-edge legends (`position: 'left'`
> / `'right'`) automatically re-measure with the formatted text so long
> values don't bleed into the chart body. See the **Custom Legend**
> page in the demo site for runnable examples across line / bar / pie /
> radar / network.
