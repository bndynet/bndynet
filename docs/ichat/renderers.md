# Custom renderers (markdown fences)

Extend the markdown pipeline with custom fenced-code-block renderers, including the built-in chart / KPI / form / Mermaid renderers from `@bndynet/ichat-renderers`.

- [Custom renderers](#custom-renderers)
- [Charts, KPI, form, and Mermaid (`@bndynet/ichat-renderers`)](#charts-kpi-form-and-mermaid-bndynetichat-renderers)

> Looking for top-level `parts[]` types (`file`, `source`, `x-*`) instead of markdown fences? See [Parts](./parts.md#vs-registercoderenderer-markdown-fences) for the difference between the two extension points.

## Custom renderers

> `registerCodeRenderer` and `registerMarkdownPlugin` support runtime registration. A new extension affects subsequent renders, including newly added and updated messages, but does not automatically refresh content that is already displayed.

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

Renderer HTML is **safe by default**: during streaming, an untrusted renderer
shows the escaped fenced source; when the message completes, its HTML is passed
through DOMPurify before insertion. This requires no configuration.

If a renderer must produce rich HTML while tokens are still streaming, it may
opt into the trusted fast path:

```typescript
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);

const trustedRenderer: BlockRenderer = {
  name: 'my-safe-widget',
  mode: 'trusted',
  test: (lang) => lang === 'my-safe-widget',
  render: (code) => `<my-safe-widget data-code="${escapeHtml(code)}"></my-safe-widget>`,
};
```

Only set `mode: 'trusted'` (or the deprecated `trusted: true` for backward
compatibility) when every model-controlled value (`code`, `lang`, and `info`) is escaped for its HTML context. Trusted output bypasses DOMPurify. The
official chart, KPI, form, details, and Mermaid renderers are audited and opt in
internally, so they continue to render live without user configuration. An
untrusted async renderer is not started repeatedly during streaming; it starts
on the terminal render and its resolved HTML is sanitised.

Async renderers are resolved automatically by `<i-chat-text-part>`. They receive
an optional lifecycle signal that is aborted when the part is rendered again or
removed, so network work can stop without additional host bookkeeping:

```typescript
const remoteRenderer: BlockRenderer = {
  name: 'remote-card',
  test: (lang) => lang === 'remote-card',
  renderAsync: async (code, _lang, _info, context) => {
    const response = await fetch(`/api/cards/${encodeURIComponent(code.trim())}`, {
      signal: context?.signal,
    });
    return response.text();
  },
};
```

Renderer failures never fail the whole message. Sync failures, rejected async
work, and throwing `test()` functions fall back to the escaped fenced source.
Older async results cannot replace a newer render pass. For diagnostics, listen
for the bubbling `chat-renderer-error` event on `<i-chat>` or
`<i-chat-messages>`:

```typescript
import type { RendererErrorDetail } from '@bndynet/ichat';

chat.addEventListener('chat-renderer-error', (event) => {
  const { renderer, phase, error, partId } =
    (event as CustomEvent<RendererErrorDetail>).detail;
  reportToObservability({ renderer, phase, error, partId });
});
```

The event is observational; consumers do not need to handle it for the fallback
behavior to work.

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

> These packages may be imported at startup or lazy-loaded by a route before that route renders matching content.

If you need custom options (e.g. disabling code toggles), use the manual API:

```typescript
import { registerCodeRenderer } from '@bndynet/ichat';
import { createChartRenderer } from '@bndynet/ichat-renderer-chart';
registerCodeRenderer(createChartRenderer({ codeToggle: false }));
```

If you use **`@bndynet/ichat-messages`** without **`@bndynet/ichat`**, the same auto-registration works — just `import` the renderer packages.

## Markdown-it Extensions (Inline / Block Plugins)

For plugins that operate at the **markdown-it** level (inline rules, block rules, renderer overrides) — as opposed to fenced-code-block renderers — use **`registerMarkdownPlugin`**. This API also handles **CSS injection** into the Shadow DOM automatically.

Markdown plugins execute as trusted application code. Renderer rules installed
by a plugin must escape any model-controlled values they place into HTML.

> Runtime registration is supported. The shared parser, Markdown cache, and plugin CSS are updated so subsequent renders use the new plugin, including inside components that are already mounted.

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

For simple markdown-it plugins that don't need CSS, `registerMarkdownPlugin` is still the recommended approach — it updates the shared `markdown-it` singleton idempotently and flushes the Markdown cache for subsequent renders.

> **Legacy**: Direct access to the `md` instance via `import { md } from '@bndynet/ichat-messages'` still works. For example, `@bndynet/ichat-renderers` ships a `chartPlugin` that you can register directly:
>
> ```typescript
> import { md } from '@bndynet/ichat-messages';
> import { chartPlugin } from '@bndynet/ichat-renderers';
> md.use(chartPlugin);
> ```
>
> Direct `md.use()` installs the parser rule but bypasses registration idempotency, cache invalidation, and plugin CSS management. Prefer `registerMarkdownPlugin()`.

Fenced block in markdown:

````markdown
```chart
{"type":"bar","title":"Sales","labels":["Q1","Q2","Q3"],"values":[100,150,200]}
```
````
