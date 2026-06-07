# @bndynet/ichat

Monorepo of npm packages for a **Lit 3** chat UI: markdown, optional fenced-block renderers (charts, KPI, forms, Mermaid), reasoning blocks, and streaming. **Recommended:** install **`@bndynet/ichat`** and use **`<i-chat>`** — one tag bundles the message list and default composer (`<i-chat-input>`). Chart/KPI/form/Mermaid fences come from **`@bndynet/ichat-renderers`**; register them once with **`registerRenderer`** from **`@bndynet/ichat`** (see [Custom renderers](docs/renderers.md)). Lower-level packages exist if you compose the list and input yourself.

> **Looking for the full design & reference docs?** They live in [`docs/`](docs/README.md) — see the [Documentation](#documentation) section below.

## Packages

| Package | Description |
|--------|-------------|
| [`@bndynet/ichat`](packages/chat) | **Default.** `<i-chat>` — messages + input. Exports **`registerRenderer`**, re-exports **`rendererRegistry`**, **`StreamingController`**, types, and **`ChatMessages`** for advanced use. |
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

Load **`@bndynet/ichat`** and, if you want chart / KPI / form / Mermaid fences, register **`@bndynet/ichat-renderers`** once **before** the first message that uses them (see `apps/demo/bootstrap.ts` in this repo):

```html
<script type="module">
  import '@bndynet/ichat';
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
</script>

<i-chat id="chat"></i-chat>

<script type="module">
  import { textPart } from '@bndynet/ichat';

  const chat = document.getElementById('chat');

  chat.addEventListener('send', (e) => {
    const text = e.detail.content;
    chat.addMessage({
      id: Date.now().toString(),
      role: 'self',
      parts: [textPart(text)],
      timestamp: Date.now(),
    });
    // …call your API, then add assistant messages with addMessage / updateMessage / appendPart
  });

  chat.addEventListener('streaming-change', (e) => {
    // Optional: e.detail.streaming mirrors assistant streaming state
  });
</script>
```

A message body is an ordered array of typed **`parts`** (there is no plain `content` string — see [Message model](docs/message-model.md#message-body--parts)). Use **`addMessage`**, **`updateMessage`**, **`appendPart`**, **`updatePart`**, **`updateToolCall`**, **`removeMessage`**, **`replyMessage`**, **`clearReplyMessage`**, **`clear`**, and **`updateTimeline`** on the same `<i-chat>` element (see the [`<i-chat>` API](docs/component-api.md)). **`createStreamingController()`** returns a helper bound to the inner list.

## Script tag (IIFE bundles)

For pages without a bundler, load the **`@bndynet/ichat`** IIFE build. The global object is **`iChat`** (e.g. **`iChat.Chat`**, **`iChat.registerRenderer`**, **`iChat.rendererRegistry`**, …). Optional renderers still come from the **`@bndynet/ichat-renderers`** IIFE (global **`iChatRenderers`**) — after both scripts load, call **`iChat.registerRenderer(iChatRenderers.chartRenderer)`** (and **`kpiRenderer`**, **`kpisRenderer`**, **`formRenderer`**, **`mermaidRenderer`** as needed).

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

- **`<i-chat>` shell** — default textarea + send/cancel, or replace the footer with **`slot="input"`** ([`<i-chat>` API](docs/component-api.md))
- **Voice input (default composer)** — microphone button uses Web Speech API when available; hidden automatically on unsupported browsers ([Composer & interaction](docs/composer.md#default-composer-voice-input))
- **Lit 3 Web Components** — works with any framework or vanilla HTML
- **Markdown** — `markdown-it` + `highlight.js`, sanitized with DOMPurify
- **Extensible fenced blocks** — **`registerRenderer`** from **`@bndynet/ichat`**, or **`rendererRegistry`** + **`BlockRenderer`** for lower-level control ([Custom renderers](docs/renderers.md))
- **Extensible `x-*` parts** — **`registerPartRenderer`** maps custom part types to a Web Component or HTML string ([Parts](docs/parts.md#x--custom-extension-parts))
- **Structured `parts[]` body** — every message body is an ordered list of typed parts (`text`, `reasoning`, `tool-call`, `file`, `source`, custom `x-*`); parts stream and update independently ([Message model](docs/message-model.md#message-body--parts))
- **Reasoning parts** — collapsible “thinking” UI + streaming ([Parts](docs/parts.md#reasoning))
- **Tool calls** — first-class `tool-call` parts with a state machine, rich nested results, and human-in-the-loop approval ([Parts](docs/parts.md#tool-calls))
- **Streaming typewriter** — progressive reveal and cursor state on streaming `text` parts ([Composer & interaction](docs/composer.md#streaming))
- **Reply blocks** — quote previews under a message via **`replyMessage`** / **`clearReplyMessage`** ([Composer & interaction](docs/composer.md#reply-blocks))
- **Slots** — avatars, actions, empty state ([`<i-chat>` API](docs/component-api.md#slots-on-i-chat))
- **Timeline** — `[status]` markdown lists rendered as vertical timelines ([Timeline](docs/timeline.md))
- **Theming** — 12 base CSS custom properties; all components derive from them automatically ([Theming](docs/theming.md))
- **Localization & RTL** — single `config.labels` dictionary, plurals, and automatic RTL mirroring ([Localization](docs/localization.md))
- **TypeScript** — declaration files for public API

## Documentation

Detailed design and reference docs live in [`docs/`](docs/README.md):

| Doc | Covers |
|-----|--------|
| [Message model](docs/message-model.md) | Roles (`ChatMessageRole`), `ChatMessage` fields, the `parts[]` body, factories, streaming/updating |
| [`<i-chat>` API](docs/component-api.md) | Properties, methods, events, slots, per-message avatar |
| [Parts](docs/parts.md) | `reasoning`, `tool-call`, `file`, `source`, and `x-*` custom parts |
| [Custom renderers](docs/renderers.md) | `registerRenderer` + built-in chart / KPI / form / Mermaid renderers |
| [Timeline](docs/timeline.md) | `[status]` lists, block IDs, programmatic updates, SSE integration |
| [Theming](docs/theming.md) | 12 base tokens, derivation, light/dark contract, Mermaid tokens, full CSS reference |
| [Localization (i18n)](docs/localization.md) | `config.locale` / `config.labels`, plurals (`makeDaysAgo`), RTL |
| [Composer & interaction](docs/composer.md) | Streaming, reply blocks, voice input |

## Development

Clone, install, build, run the static demo:

```bash
npm install
npm run build    # workspace order: chat-messages, chat-input, chat-renderers, chat, apps/demo
npm run dev      # concurrent watch on all packages + chat-demo dev server (see root `package.json`)
```

| Script | Description |
|--------|----------------|
| `npm run build` | Builds all workspaces in dependency order (ends with `apps/demo`) |
| `npm run dev` | Watch mode for packages and the Vue demo app (`chat-demo`) |
| `npm run start` | Alias for `npm run dev` (see root `package.json`) |

To run **only** the demo app (after a successful `npm run build`): `npm run dev -w chat-demo`. Preview production build: `npm run preview -w chat-demo`.

Layout:

```text
apps/demo/
docs/                     # Design & reference docs
packages/chat-messages/
packages/chat-input/
packages/chat/            # @bndynet/ichat — <i-chat> shell (messages + input); registerRenderer API
packages/chat-renderers/  # Optional fenced blocks; consumed by apps that call registerRenderer
```

## License

MIT
