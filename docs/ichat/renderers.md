# Custom renderers (markdown fences)

Extend the markdown pipeline with custom fenced-code-block renderers, including the built-in chart / KPI / form / Mermaid renderers from `@bndynet/ichat-renderers`.

- [Custom renderers](#custom-renderers)
- [Charts, KPI, form, and Mermaid (`@bndynet/ichat-renderers`)](#charts-kpi-form-and-mermaid-bndynetichat-renderers)

> Looking for top-level `parts[]` types (`file`, `source`, `x-*`) instead of markdown fences? See [Parts](./parts.md#vs-registerrenderer-markdown-fences) for the difference between the two extension points.

## Custom renderers

Prefer **`registerRenderer`** from **`@bndynet/ichat`** so your app does not need to import **`@bndynet/ichat-messages`** just to touch the registry:

```typescript
import { registerRenderer } from '@bndynet/ichat';
import type { BlockRenderer } from '@bndynet/ichat';

const myRenderer: BlockRenderer = {
  name: 'mylang',
  test: (lang) => lang === 'mylang',
  render: (code) => `<pre>${code}</pre>`,
};

registerRenderer(myRenderer);
```

For **`unregister`**, **`list`**, or other registry methods, import **`rendererRegistry`** from **`@bndynet/ichat`** (re-exported from **`@bndynet/ichat-messages`**).

## Charts, KPI, form, and Mermaid (`@bndynet/ichat-renderers`)

**`@bndynet/ichat`** does **not** ship or auto-register **`@bndynet/ichat-renderers`**. Install **`@bndynet/ichat-renderers`** plus its peers (**`echarts`**, **`mermaid`**, **`markdown-it`** as required by that package), then register the built-in objects (same as the Quick start snippet in the [README](../README.md#quick-start-es-modules)):

```typescript
import { registerRenderer } from '@bndynet/ichat';
import {
  chartRenderer,
  kpiRenderer,
  kpisRenderer,
  formRenderer,
  mermaidRenderer,
} from '@bndynet/ichat-renderers';

registerRenderer(chartRenderer);
registerRenderer(kpiRenderer);
registerRenderer(kpisRenderer);
registerRenderer(formRenderer);
registerRenderer(mermaidRenderer);
```

If you use **`@bndynet/ichat-messages`** without **`@bndynet/ichat`**, import **`rendererRegistry`** from **`@bndynet/ichat-messages`** and call **`rendererRegistry.register(...)`** with the same renderer objects from **`@bndynet/ichat-renderers`**.

Optional **`markdown-it`** plugin when customizing the shared `md` instance:

```typescript
import { md } from '@bndynet/ichat-messages';
import { chartPlugin } from '@bndynet/ichat-renderers';

md.use(chartPlugin);
```

Fenced block in markdown:

````markdown
```chart
{"type":"bar","title":"Sales","labels":["Q1","Q2","Q3"],"values":[100,150,200]}
```
````
