# Parts: reasoning, tool calls, files, sources, custom

Beyond plain `text`, a message body can carry reasoning blocks, tool-call cards, attachments, citations, and host-defined `x-*` widgets — all as top-level entries in [`message.parts`](./message-model.md#message-body--parts).

- [Reasoning](#reasoning)
- [Tool calls](#tool-calls)
- [File, source, and custom parts](#file-source-and-custom-parts)
- [vs. `registerRenderer` (markdown fences)](#vs-registerrenderer-markdown-fences)

## Reasoning

Reasoning is a **`reasoning` part** rendered as a collapsible “thinking” block, separate from the answer `text` part — useful when your backend streams reasoning and answer on different tracks. To show the “Thinking…” state before the first reasoning token, add a streaming reasoning part with empty text. If you have tagged reasoning inside a single string, use `extractReasoning()` from `@bndynet/ichat-messages` to split it, then build the parts yourself.

```javascript
import { textPart, reasoningPart } from '@bndynet/ichat';

// `chat` is your `<i-chat>` element
chat.addMessage({
  id: '1',
  role: 'assistant',
  parts: [
    reasoningPart('Let me calculate step by step…'),
    textPart('The answer is 42.'),
  ],
  streaming: true,
});
```

While streaming, grow the reasoning and answer parts independently via `updatePart` (give them fixed ids, e.g. `reasoning` / `body`), then set each part’s `status` to `'complete'` and clear `streaming` on the message when done.

## Tool calls

Tool / function invocations are **`tool-call` parts**, rendered as an expandable card (`<i-chat-tool-call>`) with arguments, result, and status. The `state` field follows the Vercel AI SDK vocabulary so adapters map cleanly from OpenAI `tool_calls` / Anthropic `tool_use`:

`'input-streaming'` → `'input-available'` → `'executing'` → `'output-available'` \| `'output-error'`.

```javascript
const msgId = 'a3';
chat.addMessage({ id: msgId, role: 'assistant', parts: [], streaming: true, timestamp: Date.now() });

// Add the call, then advance its state machine:
chat.appendPart(msgId, {
  id: 'tc-1',
  type: 'tool-call',
  toolCallId: 'call_1',
  toolName: 'search_web',
  args: { q: 'lit web components' },
  state: 'input-available',
});
chat.updateToolCall(msgId, 'tc-1', { state: 'executing' });
chat.updateToolCall(msgId, 'tc-1', {
  state: 'output-available',
  durationMs: 1100,
  // `result` (string / JSON) renders as a code block, or use `resultParts`
  // for rich nested output (text + file + custom …):
  resultParts: [{ id: 'r1', type: 'text', text: 'Found **3 results**.' }],
});
```

**Human-in-the-loop approval:** set `approval: 'required'` on a `tool-call` part to render Approve / Reject buttons. The card emits a bubbling `tool-action` event (`{ action, toolCallId, part }`); respond by patching the part:

```javascript
chat.addEventListener('tool-action', (e) => {
  const { action, part } = e.detail;
  if (action === 'approve') {
    chat.updateToolCall(messageId, part.id, { approval: 'approved', state: 'executing' });
    // …run the tool, then attach the result via updateToolCall(… { state: 'output-available', result })
  } else {
    chat.updateToolCall(messageId, part.id, { approval: 'rejected' });
  }
});
```

## File, source, and custom parts

Attachments, citations, and host-defined payloads are first-class **`parts[]` entries** — not markdown fences. Mix them with `text`, `reasoning`, and `tool-call` parts in the same message; stream or patch them by `id` via `appendPart` / `updatePart` like any other part.

### `file` — attachments

Images (`mediaType` starts with `image/`) render inline. Everything else becomes a download link (`name` or `url` as the label). Supply either **`url`** (HTTP(S) or `data:` URL) or raw **`data`** (base64 without the `data:` prefix).

```javascript
import { textPart, nextPartId } from '@bndynet/ichat';

chat.addMessage({
  id: 'a4',
  role: 'assistant',
  parts: [
    textPart('Here is the diagram and the spec:'),
    {
      id: nextPartId('file'),
      type: 'file',
      mediaType: 'image/png',
      url: 'https://example.com/chart.png',
      name: 'chart.png',
    },
    {
      id: nextPartId('file'),
      type: 'file',
      mediaType: 'application/pdf',
      url: 'https://example.com/spec.pdf',
      name: 'spec.pdf',
      size: 245760,
    },
  ],
  timestamp: Date.now(),
});
```

### `source` — citations (RAG / search)

Each `source` part renders a link (`title` if set, otherwise `url`) and an optional **`snippet`**. Typical for web-search or retrieval citations returned alongside an answer.

```javascript
chat.addMessage({
  id: 'a5',
  role: 'assistant',
  parts: [
    textPart('Based on the docs:'),
    {
      id: nextPartId('source'),
      type: 'source',
      url: 'https://lit.dev/docs/components/overview/',
      title: 'Lit – Overview',
      snippet: 'Lit is a library for building fast, lightweight web components.',
    },
  ],
  timestamp: Date.now(),
});
```

### `x-*` — custom extension parts

When built-in part types are not enough — e.g. a vendor-specific block from your AI SDK, a product card, or a structured widget — use a **custom part**: `type` must start with `x-` (e.g. `x-weather`, `x-product-card`); payload lives in **`data`** (any JSON-serialisable shape).

```javascript
chat.addMessage({
  id: 'a6',
  role: 'assistant',
  parts: [
    textPart('Current conditions:'),
    {
      id: nextPartId('x'),
      type: 'x-weather',
      data: { city: 'Shanghai', temp: 22, unit: '°C', condition: 'Cloudy' },
    },
  ],
  timestamp: Date.now(),
});
```

**Default rendering:** unregistered custom parts are shown as a formatted JSON dump inside the message bubble (`<pre class="part-custom">`).

**Registering a renderer:** give `x-*` parts rich UI with **`registerPartRenderer`** (from `@bndynet/ichat`, or `partRendererRegistry` from `@bndynet/ichat` / `@bndynet/ichat-messages` for lower-level control). A `PartRenderer` matches a part `type` via `test(type)` and renders it in one of two modes:

- **Element mode** (`element`, recommended) — name a custom element; the library renders `<your-tag .data=${part.data} .part=${part}>`. The element instance is preserved across `updatePart`, so streaming updates patch properties without rebuilding the DOM (the same approach `tool-call` uses). You define the Web Component, so it works with any framework or vanilla HTML.
- **String mode** (`render`) — return an HTML string; it is sanitised with DOMPurify and patched in place via morphdom (the same channel as `text` parts). Use inline `style="…"` rather than `<style>` blocks, which DOMPurify strips.

Provide at least one of `element` / `render`; when both are present, `element` wins.

```javascript
import { registerPartRenderer } from '@bndynet/ichat';

// Element mode: you own the Web Component, the library passes `data` as a property.
class WeatherCard extends HTMLElement {
  set data(v) { this._d = v; this.innerHTML = `<div class="wx">${v.city} ${v.temp}${v.unit}</div>`; }
}
customElements.define('x-weather-card', WeatherCard);

registerPartRenderer({
  name: 'weather',
  test: (type) => type === 'x-weather',
  element: 'x-weather-card',
});

// String mode alternative:
registerPartRenderer({
  name: 'weather-html',
  test: (type) => type === 'x-weather-html',
  render: (part) => `<div style="font-weight:600">${part.data.city}: ${part.data.temp}${part.data.unit}</div>`,
});
```

The library ships only the `registerPartRenderer` capability — you define and register your own `x-*` renderers. The demo app includes a working example under **Custom part (x-\*)**.

### vs. `registerRenderer` (markdown fences)

These are **two different extension points**:

| | **`parts[]` types** (`file`, `source`, `x-*`) | **`registerRenderer`** ([Custom renderers](./renderers.md#custom-renderers)) |
|--|--|--|
| **Where it lives** | Top-level entries in `message.parts` | Inside a **`text`** part’s markdown (fenced code block) |
| **Registration** | Built-in renderers for `file` / `source`; `x-*` via `registerPartRenderer({ name, test, element \| render })` (falls back to JSON when unregistered) | `registerRenderer({ name, test, render })` on the markdown pipeline |
| **Streaming / updates** | Each part has its own `id` — patch with `updatePart` | Grows with the surrounding `text` part’s markdown stream |
| **Good for** | Protocol-aligned blocks (files, citations, vendor parts), tool `resultParts` | Charts, KPI cards, forms, Mermaid — content authored as markdown |

Use **`registerRenderer`** when the assistant’s answer is markdown and you want a fenced block (e.g. ` ```chart `). Use **`file` / `source` / `x-*` parts** when your backend already emits structured part arrays (Anthropic content blocks, Vercel AI SDK message parts, etc.) or when a block should update independently of the markdown body.

The demo app includes a **Custom part (x-\*)** page under Renderers showing both modes plus the JSON fallback, and a **File & source** page for `file` / `source` parts.
