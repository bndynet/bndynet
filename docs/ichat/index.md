# @bndynet/ichat

Monorepo of npm packages for a **Lit 3** chat UI: markdown, optional fenced-block renderers (charts, KPI, forms, Mermaid), reasoning blocks, and streaming. **Recommended:** install **`@bndynet/ichat`** and use **`<i-chat>`** — one tag bundles the message list and default composer (`<i-chat-input>`). Chart/KPI/form/Mermaid fences come from **`@bndynet/ichat-renderers`**; register them once with **`registerCodeRenderer`** from **`@bndynet/ichat`** (see [Custom renderers](./renderers.md)). Lower-level packages exist if you compose the list and input yourself.

> **Looking for the full design & reference docs?** They live in [`docs/`](./README.md) — see the [Documentation](#documentation) section below.

## Packages

| Package | Description |
|--------|-------------|
| [`@bndynet/ichat`](packages/chat) | **Default.** `<i-chat>` — messages + input. Exports **`registerCodeRenderer`**, re-exports **`rendererRegistry`**, **`StreamingController`**, types, and **`ChatMessages`** for advanced use. |
| [`@bndynet/ichat-messages`](packages/chat-messages) | Message list only (`<i-chat-messages>`, markdown pipeline, `BlockRenderer`, streaming). Use if you do **not** want `<i-chat>`. |
| [`@bndynet/ichat-input`](packages/chat-input) | Composer only (`<i-chat-input>`). |
| [`@bndynet/ichat-renderers`](packages/chat-renderers) | Optional fenced-block implementations (chart, KPI, form, Mermaid). Depends on **`@bndynet/ichat-messages`**; pair with **`@bndynet/ichat`** or use directly with **`chat-messages`** only. |

**Peers (when you use renderers):** **`@bndynet/ichat-renderers`** expects **`echarts` ≥ 6**, **`mermaid` ≥ 11**, and **`markdown-it` ≥ 14** (see that package’s `package.json`). **`@bndynet/ichat`** itself does not list those peers — install them next to **`@bndynet/ichat-renderers`** in your app.

---

## Install

**Shell + optional fenced blocks (recommended when you want charts / KPI / forms / Mermaid):**

```bash
npm install @bndynet/ichat @bndynet/ichat-renderers echarts mermaid
```

**Shell only** (markdown + code highlighting; no chart/KPI/form/Mermaid fences unless you add your own renderers):

```bash
npm install @bndynet/ichat
```

**Message list only** (custom composer elsewhere):

```bash
npm install @bndynet/ichat-messages
```

## Quick start (ES modules)

Load **`@bndynet/ichat`** and, if you want chart / KPI / form / Mermaid fences, register **`@bndynet/ichat-renderers`** once **before** the first `<i-chat>` component connects to the DOM (see `apps/demo/bootstrap.ts` in this repo). All Markdown extensions — both `registerCodeRenderer` and `registerMarkdownPlugin` — must be registered at module-init time, before any `<i-chat>` or `<i-chat-messages>` element is inserted into the document:

```html
<script type="module">
  import '@bndynet/ichat';
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
</script>

<i-chat id="chat"></i-chat>

<script type="module">
  import { textPart, normalizeHistoryMessages } from '@bndynet/ichat';

  const chat = document.getElementById('chat');
  let idSeq = 0;
  const nextId = () =>
    globalThis.crypto?.randomUUID?.() ?? `msg-${Date.now().toString(36)}-${++idSeq}`;

  let activeStream = null;

  // TODO: Replace with your history loader, or use [] when there is no history.
  const history = await fetchHistory();
  chat.messages = normalizeHistoryMessages(history.messages);

  chat.addEventListener('send', async (e) => {
    const text = e.detail.content;
    const assistantId = nextId();
    const bodyPartId = 'body';
    const stream = {
      assistantId,
      bodyPartId,
      abort: new AbortController(),
      cancelled: false,
    };

    activeStream = stream;

    chat.addMessage({
      id: nextId(),
      role: 'self',
      parts: [textPart(text)],
      timestamp: Date.now(),
    });

    // Important: create the assistant placeholder before starting fetch/SSE,
    // not after the first token arrives. The built-in composer uses
    // `streaming: true` to switch Send -> Cancel and block duplicate sends
    // while the network request is waiting for the first chunk.
    chat.addMessage({
      id: assistantId,
      role: 'assistant',
      parts: [textPart('', { id: bodyPartId, status: 'streaming' })],
      streaming: true,
      timestamp: Date.now(),
    });

    let answer = '';
    try {
      // TODO: Replace this with your fetch/SSE/WebSocket/SDK adapter.
      // It should yield text chunks and respect the AbortSignal when possible.
      for await (const chunk of streamAssistantReply(text, { signal: stream.abort.signal })) {
        if (stream.abort.signal.aborted) break;
        answer += chunk;
        chat.updatePart(assistantId, bodyPartId, {
          text: answer,
          status: 'streaming',
        });
      }

      if (stream.abort.signal.aborted) {
        chat.updatePart(assistantId, bodyPartId, { status: 'cancelled' });
        chat.updateMessage(assistantId, { cancelled: true });
      } else {
        chat.updatePart(assistantId, bodyPartId, { status: 'complete' });
      }
    } catch (error) {
      if (stream.abort.signal.aborted) {
        chat.updatePart(assistantId, bodyPartId, { status: 'cancelled' });
        chat.updateMessage(assistantId, { cancelled: true });
      } else {
        chat.updatePart(assistantId, bodyPartId, { status: 'error' });
        chat.updateMessage(assistantId, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    } finally {
      // Important: always release streaming, including success, error, and
      // cancellation. If this is skipped, the composer will remain locked.
      chat.updateMessage(assistantId, { streaming: false });
      if (activeStream === stream) {
        activeStream = null;
      }
    }
  });

  chat.addEventListener('cancel', () => {
    if (!activeStream || activeStream.cancelled) return;
    activeStream.cancelled = true;
    activeStream.abort.abort();
    chat.cancelMessage(activeStream.assistantId, '*— Response stopped —*');
  });

  chat.addEventListener('streaming-change', (e) => {
    // Optional: e.detail.streaming mirrors assistant streaming state
  });
</script>
```

A message body is an ordered array of typed **`parts`** (there is no plain `content` string — see [Message model](./message-model.md#message-body--parts)). Use **`addMessage`**, **`updateMessage`**, **`appendPart`**, **`updatePart`**, **`updateToolCall`**, **`updateTodoItem`**, **`removeMessage`**, **`replyMessage`**, **`clearReplyMessage`**, **`clear`**, and **`updateProgressStep`** on the same `<i-chat>` element (see the [`<i-chat>` API](./component-api.md)). **`createStreamingController()`** returns a helper bound to the inner list.

### Framework integration (Vue / React)

By default **`<i-chat>` owns its own message state**. Listen to `messages-change` for side effects like logging or persistence:

```js
chat.addEventListener('messages-change', (e) => {
  console.log(e.detail.reason, e.detail.messages);
});
```

When you need a **single source of truth** shared across multiple components (e.g. a chat panel + a sidebar + an export view all reading the same message list), use **controlled mode**:

```js
// Vue example — messages lives in a reactive store
chat.messageMode = 'controlled';
chat.addEventListener('messages-change', (e) => {
  if (e.detail.committed) return;          // skip external assignments
  messages.value = e.detail.messages;       // one source, many consumers
});
```

In uncontrolled mode `chat.messages` is immediately up-to-date after any mutation — just read it. Controlled mode is opt-in and only needed when an external framework must own the array.

When the user first opens a chat, load historical messages as completed content. Use `normalizeHistoryMessages()` from `@bndynet/ichat-messages` (re-exported by `@bndynet/ichat`) to sanitise messages loaded from your backend — it sets `streaming: false`, marks interrupted messages as `cancelled`, converts any persisted `status: 'streaming' | 'pending'` parts to `'complete'`, and removes empty placeholder messages. Pass `interruptedStatus` / `removeEmptyMessages` options to customise the behaviour.

### SSE client (built-in)

When your backend follows the [SSE response format](./sse-response-format.md), use the built-in SSE client instead of hand-writing a streaming loop:

```js
import { createChatSSEClient } from '@bndynet/ichat/sse';

const sse = createChatSSEClient('/api/chat/stream', chat, {
  onError: (err) => chat.showError(err),
});

chat.addEventListener('send', (e) => {
  sse.start();  // auto-creates assistant placeholder, routes all SSE events
});

chat.addEventListener('cancel', () => {
  sse.abort();
});
```

The SSE client automatically handles `message.created`, `message.part.updated`, `todo.item.updated`, `message.completed`, and `stream.done` events — no manual parsing needed. For custom backends, the manual `addMessage` / `updatePart` approach shown above still works.

### Syntax highlighting

By default code blocks render as plain escaped `<pre><code>`. Pass your own `highlight.js` instance to keep the bundle small:

> **Bundle size:** `@bndynet/ichat-messages` ESM is **~177KB** (third-party deps like `markdown-it`, `dompurify`, `highlight.js`, `lit` are resolved by your bundler — no duplicates).

```js
import hljs from 'highlight.js/lib/core';
import ts from 'highlight.js/lib/languages/typescript';
hljs.registerLanguage('typescript', ts);

chat.config = { ...chat.config, highlightJs: hljs };
```

### Middleware & plugins

Intercept or transform messages with middleware, or package reusable logic as plugins:

```js
// Middleware — transform content before send
chat.use({
  name: 'trim',
  beforeSend: (content) => content.trim(),
});

// Plugin — packaged logic with install/teardown
chat.use({
  name: 'logger',
  install(chat) {
    const onSend = (e) => console.log('send:', e.detail.content);
    chat.addEventListener('send', onSend);
    return () => chat.removeEventListener('send', onSend);
  },
});
```

## Script tag (IIFE bundles)

For pages without a bundler, load the **`@bndynet/ichat`** IIFE build. The global object is **`iChat`** (e.g. **`iChat.Chat`**, **`iChat.registerCodeRenderer`**, **`iChat.rendererRegistry`**, …). Optional renderers still come from the **`@bndynet/ichat-renderers`** IIFE (global **`iChatRenderers`**) — after both scripts load, call **`iChat.registerCodeRenderer(iChatRenderers.chartRenderer)`** (and **`kpiRenderer`**, **`kpisRenderer`**, **`formRenderer`**, **`mermaidRenderer`** as needed).

```html
<script src="/path/to/chat/dist/index.global.js"></script>
```

**Other packages (split IIFE):** if you load lower-level builds without `@bndynet/ichat`, each bundle exposes its own global — load scripts in dependency order and match peers (`echarts`, `markdown-it`, etc. per package `package.json`):

| Package | Global (IIFE) | Typical artifact |
|---------|---------------|------------------|
| `@bndynet/ichat-messages` | `iChatMessages` | `…/chat-messages/dist/index.global.js` |
| `@bndynet/ichat-input` | `iChatInput` | `…/chat-input/dist/index.global.js` |
| `@bndynet/ichat-renderers` | `iChatRenderers` | `…/chat-renderers/dist/index.global.js` |

The demo app registers **`@bndynet/ichat-renderers`** in **`apps/demo/bootstrap.ts`**. When developing this monorepo, run **`npm run dev`** from the repo root: it starts watchers for all packages and the **`chat-demo`** app under `apps/demo/`. The dev server URL and port are printed in the terminal (Vite defaults, often `http://localhost:5173/`).

## Features

- **`<i-chat>` shell** — default textarea + send/cancel, or replace the footer with **`slot="input"`** ([`<i-chat>` API](./component-api.md))
- **Built-in SSE client** — `createChatSSEClient()` auto-routes backend streaming events ([SSE response format](./sse-response-format.md))
- **Middleware & plugins** — `chat.use()` for `ChatMiddleware` hooks and `ChatPlugin` lifecycle ([`<i-chat>` API](./component-api.md))
- **Configurable syntax highlighting** — optional `config.highlightJs` injection; falls back to plain `<pre><code>` when omitted
- **Voice input (default composer)** — microphone button uses Web Speech API when available; hidden automatically on unsupported browsers ([Composer & interaction](./composer.md#default-composer-voice-input))
- **Lit 3 Web Components** — works with any framework or vanilla HTML
- **Markdown** — `markdown-it` + `highlight.js`, sanitized with DOMPurify
- **Extensible fenced blocks** — **`registerCodeRenderer`** from **`@bndynet/ichat`**, or **`rendererRegistry`** + **`BlockRenderer`** for lower-level control ([Custom renderers](./renderers.md))
- **Extensible `x-*` parts** — **`registerPartRenderer`** maps custom part types to a Web Component or HTML string ([Parts](./parts.md#x--custom-extension-parts))
- **Structured `parts[]` body** — every message body is an ordered list of typed parts (`text`, `reasoning`, `tool-call`, `todo`, `file`, `source`, custom `x-*`); parts stream and update independently ([Message model](./message-model.md#message-body--parts))
- **Reasoning parts** — collapsible “thinking” UI + streaming ([Parts](./parts.md#reasoning))
- **Tool calls** — first-class `tool-call` parts with a state machine, rich nested results, and human-in-the-loop approval ([Parts](./parts.md#tool-calls))
- **Streaming typewriter** — progressive reveal and cursor state on streaming `text` parts ([Composer & interaction](./composer.md#streaming))
- **Reply blocks** — quote previews under a message via **`replyMessage`** / **`clearReplyMessage`** ([Composer & interaction](./composer.md#reply-blocks))
- **Slots** — avatars, actions, empty state ([`<i-chat>` API](./component-api.md#slots-on-i-chat))
- **Progress** — `[status]` markdown lists rendered as vertical progress blocks ([Progress](./progress.md))
- **Todo panel** — structured, collapsible plans with item IDs, live status updates, and user actions ([Todo panel](./todo.md))
- **Theming** — 12 base CSS custom properties; all components derive from them automatically ([Theming](./theming.md))
- **Localization & RTL** — single `config.labels` dictionary, plurals, and automatic RTL mirroring ([Localization](./localization.md))
- **TypeScript** — declaration files for public API

## Documentation

Detailed design and reference docs live in [`docs/`](./README.md):

| Doc | Covers |
|-----|--------|
| [Message model](./message-model.md) | Roles (`ChatMessageRole`), `ChatMessage` fields, the `parts[]` body, factories, streaming/updating |
| [SSE response format](./sse-response-format.md) | Recommended backend event stream contract for live assistant responses |
| [`<i-chat>` API](./component-api.md) | Properties, methods, events, slots, confirmations, highlight.js, SSE client, middleware |
| [Parts](./parts.md) | `reasoning`, `tool-call`, `file`, `source`, and `x-*` custom parts |
| [Custom renderers](./renderers.md) | `registerCodeRenderer` + built-in chart / KPI / form / Mermaid renderers |
| [Progress](./progress.md) | `[status]` lists, block IDs, programmatic updates, SSE integration |
| [Todo panel](./todo.md) | Structured items, collapse behavior, status events, updates, SSE revisions |
| [Theming](./theming.md) | 12 base tokens, derivation, light/dark contract, Mermaid tokens, full CSS reference |
| [Localization (i18n)](./localization.md) | `config.locale` / `config.labels`, plurals (`makeDaysAgo`), RTL |
| [Composer & interaction](./composer.md) | Streaming, reply blocks, voice input |
| [Migration: v2 → v3](./migration-v2-to-v3.md) | Breaking changes, deprecated API table, upgrade timeline |

## Development

Clone, install, build, run the static demo:

```bash
npm install
npm run build    # workspace order: chat-messages, chat-input, chat-renderers, chat, apps/demo
npm run test     # 24 unit tests (pure helpers)
npm run dev      # concurrent watch on all packages + chat-demo dev server (see root `package.json`)
```

| Script | Description |
|--------|----------------|
| `npm run build` | Builds all workspaces in dependency order (ends with `apps/demo`) |
| `npm run test` | Runs 24 unit tests for pure helpers |
| `npm run test:coverage` | Runs tests with Node.js coverage report |
| `npm run dev` | Watch mode for packages and the Vue demo app (`chat-demo`) |
| `npm run start` | Alias for `npm run dev` (see root `package.json`) |

To run **only** the demo app (after a successful `npm run build`): `npm run dev -w chat-demo`. Preview production build: `npm run preview -w chat-demo`.

Layout:

```text
apps/demo/
docs/                     # Design & reference docs
packages/chat-messages/
packages/chat-input/
packages/chat/            # @bndynet/ichat — <i-chat> shell (messages + input); registerCodeRenderer API
packages/chat-renderers/  # Optional fenced blocks; consumed by apps that call registerCodeRenderer
```

## License

MIT
