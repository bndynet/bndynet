# Custom renderers (markdown fences)

Extend the markdown pipeline with custom fenced-code-block renderers, including the built-in chart / KPI / form / Mermaid renderers from `@bndynet/ichat-renderers`.

- [Custom renderers](#custom-renderers)
- [Charts, KPI, form, and Mermaid (`@bndynet/ichat-renderers`)](#charts-kpi-form-and-mermaid-bndynetichat-renderers)

> Looking for top-level `parts[]` types (`file`, `source`, `x-*`) instead of markdown fences? See [Parts](./parts.md#vs-registerrenderer-markdown-fences) for the difference between the two extension points.

## Custom renderers

> **⚠️ Important:** All Markdown extensions — both `registerCodeRenderer` (fenced-code-block renderers) and `registerMarkdownPlugin` (markdown-it plugins) — **must** be registered **before** the first `<i-chat>` or `<i-chat-messages>` component connects to the DOM. Extensions registered after a component has already connected and rendered may not take effect on existing content. Always register extensions at module-init time, before any `<i-chat>` element is inserted into the document.

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

## Charts, KPI, form, and Mermaid

**`@bndynet/ichat`** does **not** ship or auto-register renderers. Install what you need:

```bash
npm install @bndynet/ichat-renderers                     # KPI, forms
npm install @bndynet/ichat-renderer-chart                # charts via @bndynet/icharts
npm install @bndynet/ichat-renderer-mermaid              # Mermaid diagrams
npm install @bndynet/ichat-renderer-katex                # LaTeX math
```

All third-party runtimes (`@bndynet/icharts`, `mermaid`, `katex`, `markdown-it`) are auto-installed — no manual peer work.

**All renderer packages auto-register on import** — no `registerCodeRenderer` calls needed:

```typescript
import '@bndynet/ichat';
import '@bndynet/ichat-renderers';          // auto-registers kpi, kpis, form
import '@bndynet/ichat-renderer-chart';     // auto-registers chart
import '@bndynet/ichat-renderer-mermaid';   // auto-registers mermaid
import '@bndynet/ichat-renderer-katex';     // auto-registers LaTeX math
```

> **Must be imported before** the first `<i-chat>` or `<i-chat-messages>` component connects to the DOM.

If you need custom options (e.g. disabling code toggles), use the manual API:

```typescript
import { registerCodeRenderer } from '@bndynet/ichat';
import { createChartRenderer } from '@bndynet/ichat-renderer-chart';
registerCodeRenderer(createChartRenderer({ codeToggle: false }));
```

If you use **`@bndynet/ichat-messages`** without **`@bndynet/ichat`**, the same auto-registration works — just `import` the renderer packages.

## Markdown-it Extensions (Inline / Block Plugins)

For plugins that operate at the **markdown-it** level (inline rules, block rules, renderer overrides) — as opposed to fenced-code-block renderers — use **`registerMarkdownPlugin`**. This API also handles **CSS injection** into the Shadow DOM automatically.

> **⚠️ Same constraint as above:** must be registered **before** the first `<i-chat>` or `<i-chat-messages>` component connects to the DOM.

```typescript
import { registerMarkdownPlugin } from '@bndynet/ichat';

registerMarkdownPlugin({
  id: 'my-plugin',
  install: (md) => {
    // Add inline rules, block rules, or modify renderer
    md.inline.ruler.before('escape', 'my_rule', ...);
  },
  styles: '.my-class { color: red; }',  // optional: auto-injected into all Shadow DOMs
  // globalStyles: '@font-face { ... }',  // optional: injected into document.head once
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
> This is equivalent to `registerMarkdownPlugin({ id: 'chart', install: chartPlugin })`. The new API is preferred for idempotency and cache management.

Fenced block in markdown:

````markdown
```chart
{"type":"bar","title":"Sales","labels":["Q1","Q2","Q3"],"values":[100,150,200]}
```
````
