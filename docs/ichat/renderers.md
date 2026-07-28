# Custom renderers (markdown fences)

Extend the markdown pipeline with custom fenced-code-block renderers, including the built-in chart / KPI / form / Mermaid renderers from `@bndynet/ichat-renderers`.

- [Custom renderers](#custom-renderers)
- [Charts, KPI, form, and Mermaid (`@bndynet/ichat-renderers`)](#charts-kpi-form-and-mermaid-bndynetichat-renderers)

> Looking for top-level `parts[]` types (`file`, `source`, `x-*`) instead of markdown fences? See [Parts](./parts.md#vs-registerrenderer-markdown-fences) for the difference between the two extension points.

## Custom renderers

Prefer **`registerCodeRenderer`** from **`@bndynet/ichat`** so your app does not need to import **`@bndynet/ichat-messages`** just to touch the registry:

```typescript
import { registerCodeRenderer } from '@bndynet/ichat';
import type { BlockRenderer } from '@bndynet/ichat';

const myRenderer: BlockRenderer = {
  name: 'mylang',
  test: (lang) => lang === 'mylang',
  render: (code) => `<pre>${code}</pre>`,
};

registerCodeRenderer(myRenderer);
```

For **`unregister`**, **`list`**, or other registry methods, import **`rendererRegistry`** from **`@bndynet/ichat`** (re-exported from **`@bndynet/ichat-messages`**).

## Charts, KPI, form, and Mermaid (`@bndynet/ichat-renderers`)

**`@bndynet/ichat`** does **not** ship or auto-register **`@bndynet/ichat-renderers`**. Install **`@bndynet/ichat-renderers`** plus its peers (**`echarts`**, **`mermaid`**, **`markdown-it`** as required by that package), then register the built-in objects (same as the Quick start snippet in the [README](../README.md#quick-start-es-modules)):

```typescript
import { registerCodeRenderer } from '@bndynet/ichat';
import {
  chartRenderer,
  kpiRenderer,
  kpisRenderer,
  formRenderer,
  mermaidRenderer,
} from '@bndynet/ichat-renderers';

registerCodeRenderer(chartRenderer);
registerCodeRenderer(kpiRenderer);
registerCodeRenderer(kpisRenderer);
registerCodeRenderer(formRenderer);
registerCodeRenderer(mermaidRenderer);
```

If you use **`@bndynet/ichat-messages`** without **`@bndynet/ichat`**, import **`rendererRegistry`** from **`@bndynet/ichat-messages`** and call **`rendererRegistry.register(...)`** with the same renderer objects from **`@bndynet/ichat-renderers`**.

## Markdown-it Extensions (Inline / Block Plugins)

For plugins that operate at the **markdown-it** level (inline rules, block rules, renderer overrides) — as opposed to fenced-code-block renderers — use **`registerMarkdownPlugin`**. This API also handles **CSS injection** into the Shadow DOM automatically.

```typescript
import { registerMarkdownPlugin } from '@bndynet/ichat';

registerMarkdownPlugin({
  name: 'my-plugin',
  plugin: (md) => {
    // Add inline rules, block rules, or modify renderer
    md.inline.ruler.before('escape', 'my_rule', ...);
  },
  css: '.my-class { color: red; }',  // optional: auto-injected into all components
  cleanup: () => { /* optional teardown */ },
});
```

For simple markdown-it plugins that don't need CSS, `registerMarkdownPlugin` is still the recommended approach — it guarantees the shared `markdown-it` singleton is modified before any rendering occurs and flushes the markdown cache.

> **Legacy**: Direct access to the `md` instance via `import { md } from '@bndynet/ichat-messages'` still works. For example, `@bndynet/ichat-renderers` ships a `chartPlugin` that you can register directly:
>
> ```typescript
> import { md } from '@bndynet/ichat-messages';
> import { chartPlugin } from '@bndynet/ichat-renderers';
> md.use(chartPlugin);
> ```
>
> This is equivalent to `registerMarkdownPlugin({ name: 'chart', plugin: chartPlugin })`. The new API is preferred for idempotency and cache management.

Fenced block in markdown:

````markdown
```chart
{"type":"bar","title":"Sales","labels":["Q1","Q2","Q3"],"values":[100,150,200]}
```
````
