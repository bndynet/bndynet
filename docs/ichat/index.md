# @bndynet/ichat

Monorepo of npm packages for a **Lit 3** chat UI: markdown, optional fenced-block renderers (charts, KPI, forms, Mermaid), reasoning blocks, and streaming. **Recommended:** install **`@bndynet/ichat`** and use **`<i-chat>`** — one tag bundles the message list and default composer (`<i-chat-input>`). Chart/KPI/form/Mermaid fences come from **`@bndynet/ichat-renderers`**; register them once with **`registerCodeRenderer`** from **`@bndynet/ichat`** (see [Custom renderers](./renderers.md)). Lower-level packages exist if you compose the list and input yourself.

> **Looking for the full design & reference docs?** They live in [`docs/`](./README.md) — see the [Documentation](#documentation) section below.

## Packages

| Package                                                             | Description                                                                                                                                                                                   |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@bndynet/ichat`](packages/chat)                                   | **Default.** `<i-chat>` — messages + input. Exports **`registerCodeRenderer`**, re-exports **`rendererRegistry`**, **`StreamingController`**, types, and **`ChatMessages`** for advanced use. |
| [`@bndynet/ichat-messages`](packages/chat-messages)                 | Message list only (`<i-chat-messages>`, markdown pipeline, `BlockRenderer`, streaming). Use if you do **not** want `<i-chat>`.                                                                |
| [`@bndynet/ichat-input`](packages/chat-input)                       | Composer only (`<i-chat-input>`).                                                                                                                                                             |
| [`@bndynet/ichat-renderers`](packages/chat-renderers)               | Lightweight fenced-block renderers: KPI cards, interactive forms. No heavy deps.                                                                                                              |
| [`@bndynet/ichat-renderer-chart`](packages/chat-renderer-chart)     | Chart fences (bar, line, area, pie, gauge) via `@bndynet/icharts`.                                                                                                                            |
| [`@bndynet/ichat-renderer-katex`](packages/chat-renderer-katex)     | LaTeX math: `$inline$` and `$$display$$` via KaTeX.                                                                                                                                           |
| [`@bndynet/ichat-renderer-mermaid`](packages/chat-renderer-mermaid) | Mermaid diagram fences with theme-aware dark/light mode.                                                                                                                                      |

> **Zero-config install:** all third-party deps (`lit`, `markdown-it`, `dompurify`, `highlight.js`, `morphdom`, `katex`, `mermaid`, `@bndynet/icharts`) are auto-installed by npm — no manual peer-dependency hunting.

---

## Install

**Chat + all optional renderers:**

```bash
npm install @bndynet/ichat @bndynet/ichat-renderers @bndynet/ichat-renderer-chart @bndynet/ichat-renderer-katex @bndynet/ichat-renderer-mermaid
```

**Chat only** (markdown + highlighting, no chart/KPI/form/Mermaid):

```bash
npm install @bndynet/ichat
```

**Message list only** (custom composer):

```bash
npm install @bndynet/ichat-messages
```

## Quick start (ES modules)

Drop in `<i-chat>` and wire one streaming response with **`createRunController()`**. The controller owns the assistant message for you: it creates the streaming placeholder, takes the deltas, and moves the message to its terminal state.

```html
<script type="module">
  import "@bndynet/ichat";
</script>

<i-chat id="chat"></i-chat>

<script type="module">
  import { textPart } from "@bndynet/ichat";

  const chat = document.getElementById("chat");
  let run = null;

  chat.addEventListener("send", async (e) => {
    chat.addMessage({
      id: crypto.randomUUID(),
      role: "self",
      parts: [textPart(e.detail.content)],
      timestamp: Date.now(),
    });

    run = chat.createRunController();
    run.start([textPart("", { id: "body", status: "streaming" })]);

    try {
      // Replace with your AI provider — paste-and-run quickstart:
      // https://github.com/bndynet/ichat/blob/main/docs/backend-quickstart.md
      for await (const chunk of streamAssistantReply(e.detail.content, {
        signal: run.signal,
      })) {
        run.appendText("body", chunk);
      }
      run.updatePart("body", { status: "complete" });
      run.complete();
    } catch (error) {
      run.fail(error instanceof Error ? error.message : String(error));
    }
  });

  chat.addEventListener("cancel", () => run?.cancel("*— Response stopped —*"));
</script>
```

That is the whole integration. `run.signal` is aborted as soon as the run ends, and `complete()` / `fail()` / `cancel()` are no-ops once the run is terminal — a cancelled run whose request then throws stays cancelled, so you never need `finally` bookkeeping to unlock the composer. See the [`ChatRunController` API](./component-api.md#chatruncontroller) for the full lifecycle, or [Manual streaming](#manual-streaming-without-chatruncontroller) if you prefer to drive the message store yourself.

`<i-chat>` also emits `streaming-change` (`e.detail.streaming`) and `busy-change` (`e.detail.busy`) if another part of your UI needs to mirror the assistant streaming state or the composer's submission lock.

### Optional renderers

Chart, KPI, form, Mermaid, and math fences live in separate packages. Import them at startup or lazily when their UI is first needed:

```js
import "@bndynet/ichat-renderers";
import "@bndynet/ichat-renderer-chart";
import "@bndynet/ichat-renderer-mermaid";
```

Extension registration is global and remains available after components mount.
Block Renderers, Part Renderers, and Markdown Plugins registered later affect
newly added or subsequently updated content; existing rendered content is not
refreshed automatically. Registering the same object again is a no-op; a
different object with the same name/id produces a warning and keeps the first
registration.

Custom fenced renderers are sanitised by default. The official renderer
packages opt into the audited `trusted: true` streaming path internally, so no
extra security or performance configuration is required for normal use.

### Loading history

When the user first opens a chat, load historical messages as completed content:

```js
import { normalizeHistoryMessages } from "@bndynet/ichat";

const history = await fetchHistory();
chat.messages = normalizeHistoryMessages(history.messages);
```

`normalizeHistoryMessages()` (from `@bndynet/ichat-messages`, re-exported by `@bndynet/ichat`) sanitises messages loaded from your backend — it sets `streaming: false`, marks interrupted messages as `cancelled`, converts any persisted `status: 'streaming' | 'pending'` parts to `'complete'`, and removes empty placeholder messages. Pass `interruptedStatus` / `removeEmptyMessages` options to customise the behaviour.

A message body is an ordered array of typed **`parts`** (there is no plain `content` string — see [Message model](./message-model.md#message-body--parts)). Use **`addMessage`**, **`updateMessage`**, **`appendPart`**, **`updatePart`**, **`tryUpdateToolCall`**, **`tryUpdateTodoItem`**, **`removeMessage`**, **`replyMessage`**, **`clearReplyMessage`**, **`clear`**, and **`updateProgressStep`** on the same `<i-chat>` element (see the [`<i-chat>` API](./component-api.md)).

### Framework integration (Vue / React)

**React users:** see the dedicated [React integration guide](./react.md) — ref binding, props on React 19 vs ≤ 18, event listening, controlled mode, TypeScript declaration merging, and Next.js/SSR.

By default **`<i-chat>` owns its own message state**. Listen to `messages-change` for side effects like logging or persistence:

```js
chat.addEventListener("messages-change", (e) => {
  console.log(e.detail.reason, e.detail.messages);
});
```

When you need a **single source of truth** shared across multiple components (e.g. a chat panel + a sidebar + an export view all reading the same message list), use **controlled mode**:

```js
// Vue example — messages lives in a reactive store
chat.messageMode = "controlled";
chat.addEventListener("messages-change", (e) => {
  if (e.detail.committed) return;
  messages.value = e.detail.messages; // framework propagation may be async
});
```

Controlled `messages-change` events are cancelable proposals. Unless the host
calls `e.preventDefault()`, sequential imperative updates continue from the
latest proposal while Vue, React, or another framework propagates the new
property asynchronously. Assign `e.detail.messages` directly when accepting a
proposal; cloning an older queued proposal is treated as an intentional external
history replacement. Call `e.preventDefault()` in the handler to reject a
proposal.

Rejecting a proposal also holds back the `ChatRunController` that produced it: a
rejected `start()` leaves the run `idle` and a rejected
`complete()` / `fail()` / `cancel()` leaves it `streaming`, so the run never
disagrees with your message array. Inspect the returned `ChatMutationOutcome`
(`{ changed, accepted }`) if you want to retry or report the rejection — see
[Rejected proposals](./component-api.md#rejected-proposals) for when rejecting
is the right tool and when to undo an accepted write instead.

In uncontrolled mode `chat.messages` is immediately up-to-date after any mutation — just read it. Controlled mode is opt-in and only needed when an external framework must own the array.

### Backend integration

**Method mapping** — parse your backend stream into these calls. Event names are yours to define; the lib only provides the methods:

| Scenario                                       | Method                                                                |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| Start assistant response                       | `run.start([textPart('', { status: 'streaming' })])`                  |
| Append text delta                              | `run.appendText(partId, delta)`                                       |
| Append structured part (tool-call, reasoning…) | `run.appendPart(part)`                                                |
| Update an existing part                        | `run.updatePart(partId, patch)`                                       |
| Apply a raw part-update payload                | `chat.tryApplyMessagePartUpdateEvent(rawEvent)`                       |
| Apply a raw todo-update payload                | `chat.tryApplyTodoItemUpdateEvent(rawEvent)`                          |
| Stream completed                               | `run.complete()`                                                      |
| Stream error                                   | `run.fail(error)`                                                     |
| Cancel (abort fetch)                           | `run.cancel(hint)` → aborts `run.signal`, marks the message cancelled |

#### Manual streaming without `ChatRunController`

`ChatRunController` is a thin wrapper over the message store — you can drive the same lifecycle with `addMessage` / `updatePart` / `updateMessage` directly. Reach for this when you need something the controller deliberately keeps out of its terminal transitions, such as per-part `'cancelled'` / `'error'` statuses, or when your own object already owns the abort and cleanup logic. You then take over two rules the controller enforces for you:

1. Create the assistant placeholder **before** the first network `await`, not after the first token arrives.
2. Always clear `streaming` — on success, error, **and** cancellation. Skipping it in any branch leaves the composer locked for good.

<details>
<summary>Full hand-written streaming loop</summary>

```js
import { textPart } from "@bndynet/ichat";

const chat = document.getElementById("chat");
let activeStream = null;

chat.addEventListener("send", async (e) => {
  const text = e.detail.content;
  const assistantId = crypto.randomUUID();
  const bodyPartId = "body";
  const stream = {
    assistantId,
    bodyPartId,
    abort: new AbortController(),
    cancelled: false,
  };

  activeStream = stream;

  chat.addMessage({
    id: crypto.randomUUID(),
    role: "self",
    parts: [textPart(text)],
    timestamp: Date.now(),
  });

  // `chat.busy` starts while the submission is preprocessed, then
  // `streaming: true` keeps the composer locked and switches Send -> Cancel
  // until the response finishes.
  chat.addMessage({
    id: assistantId,
    role: "assistant",
    parts: [textPart("", { id: bodyPartId, status: "streaming" })],
    streaming: true,
    timestamp: Date.now(),
  });

  let answer = "";
  try {
    // TODO: Replace this with your fetch/SSE/WebSocket/SDK adapter.
    // It should yield text chunks and respect the AbortSignal when possible.
    for await (const chunk of streamAssistantReply(text, {
      signal: stream.abort.signal,
    })) {
      if (stream.abort.signal.aborted) break;
      answer += chunk;
      chat.updatePart(assistantId, bodyPartId, {
        text: answer,
        status: "streaming",
      });
    }

    if (stream.abort.signal.aborted) {
      chat.updatePart(assistantId, bodyPartId, { status: "cancelled" });
      chat.updateMessage(assistantId, { cancelled: true });
    } else {
      chat.updatePart(assistantId, bodyPartId, { status: "complete" });
    }
  } catch (error) {
    if (stream.abort.signal.aborted) {
      chat.updatePart(assistantId, bodyPartId, { status: "cancelled" });
      chat.updateMessage(assistantId, { cancelled: true });
    } else {
      chat.updatePart(assistantId, bodyPartId, { status: "error" });
      chat.updateMessage(assistantId, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  } finally {
    chat.updateMessage(assistantId, { streaming: false });
    if (activeStream === stream) {
      activeStream = null;
    }
  }
});

chat.addEventListener("cancel", () => {
  if (!activeStream || activeStream.cancelled) return;
  activeStream.cancelled = true;
  activeStream.abort.abort();
  chat.cancelMessage(activeStream.assistantId, "*— Response stopped —*");
});
```

</details>

### Syntax highlighting

`highlight.js` is **not bundled** — install it separately if you need code highlighting:

```bash
npm install highlight.js
```

Pass your own pre-configured instance via `config.highlightJs` (only the languages you register are included):

```js
import hljs from "highlight.js/lib/core";
import ts from "highlight.js/lib/languages/typescript";
hljs.registerLanguage("typescript", ts);

chat.config = { ...chat.config, highlightJs: hljs };
```

When `config.highlightJs` is not set, code blocks render as plain `<pre><code>` without syntax highlighting — no error, no crash.

### Middleware & plugins

Intercept or transform messages with middleware, or package reusable logic as plugins:

```js
// Middleware — transform content before send
chat.use({
  name: "trim",
  beforeSend: (content) => content.trim(),
});

// Plugin — packaged logic with install/teardown
chat.use({
  name: "logger",
  install(chat) {
    const onSend = (e) => console.log("send:", e.detail.content);
    chat.addEventListener("send", onSend);
    return () => chat.removeEventListener("send", onSend);
  },
});
```

## Script tag (global build)

For pages without a bundler, use the **`@bndynet/ichat`** global IIFE build — it bundles all dependencies (`lit`, `markdown-it`, `dompurify`, `highlight.js`, `morphdom`, `ichat-messages`, `ichat-input`) into one self-contained file (~623KB). The global object is **`iChat`** (e.g. **`iChat.Chat`**, **`iChat.registerCodeRenderer`**, …).

```html
<script src="https://unpkg.com/@bndynet/ichat/dist/ichat.global.js"></script>
```

> **Note:** renderer packages (`ichat-renderer-chart`, `ichat-renderer-katex`, `ichat-renderer-mermaid`, `ichat-renderers`) do not ship global builds. For script-tag usage with renderers, use an import map or a bundler.

The demo app registers **`@bndynet/ichat-renderers`** in **`apps/demo/bootstrap.ts`**. When developing this monorepo, run **`npm run dev`** from the repo root: it starts watchers for all packages and the **`chat-demo`** app under `apps/demo/`. The dev server URL and port are printed in the terminal (Vite defaults, often `http://localhost:5173/`).

## Features

- **`<i-chat>` shell** — default textarea + send/cancel, or replace the footer with **`slot="input"`** ([`<i-chat>` API](./component-api.md))
- **`ChatRunController`** — Full response lifecycle (start/stream/complete/fail/cancel) with built-in `AbortController`
- **Middleware & plugins** — `chat.use()` for `ChatMiddleware` hooks and `ChatPlugin` lifecycle ([`<i-chat>` API](./component-api.md))
- **Configurable syntax highlighting** — optional `config.highlightJs` injection; falls back to plain `<pre><code>` when omitted
- **Voice input (default composer)** — microphone button uses Web Speech API when available; hidden automatically on unsupported browsers ([Composer & interaction](./composer.md#default-composer-voice-input))
- **Lit 3 Web Components** — works with any framework or vanilla HTML
- **Markdown** — `markdown-it` + `highlight.js`, sanitized with DOMPurify
- **Extensible fenced blocks** — **`registerCodeRenderer`** from **`@bndynet/ichat`**, or **`rendererRegistry`** + **`BlockRenderer`** for lower-level control ([Custom renderers](./renderers.md))
- **Extensible `x-*` parts** — **`registerPartRenderer`** maps custom part types to a Web Component or HTML string; pair with generic **`Chat<TExtraParts>`** for full type-checking of custom part data ([Parts](./parts.md#x--custom-extension-parts))
- **Structured `parts[]` body** — every message body is an ordered list of typed parts (`text`, `reasoning`, `tool-call`, `todo`, `file`, `source`, custom `x-*`); parts stream and update independently ([Message model](./message-model.md#message-body--parts))
- **Reasoning parts** — collapsible “thinking” UI + streaming ([Parts](./parts.md#reasoning))
- **Tool calls** — first-class `tool-call` parts with a state machine, rich nested results, and human-in-the-loop approval ([Parts](./parts.md#tool-calls))
- **Streaming typewriter** — progressive reveal and cursor state on streaming `text` parts ([Composer & interaction](./composer.md#busy-and-streaming))
- **Reply blocks** — quote previews under a message via **`replyMessage`** / **`clearReplyMessage`** ([Composer & interaction](./composer.md#reply-blocks))
- **Slots** — avatars, actions, empty state ([`<i-chat>` API](./component-api.md#slots-on-i-chat))
- **Progress** — `[status]` markdown lists rendered as vertical progress blocks ([Progress](./progress.md))
- **Todo panel** — structured, collapsible plans with item IDs, live status updates, and user actions ([Todo panel](./todo.md))
- **Theming** — 12 base CSS custom properties; all components derive from them automatically ([Theming](./theming.md))
- **Localization & RTL** — single `config.labels` dictionary, plurals, and automatic RTL mirroring ([Localization](./localization.md))
- **TypeScript** — declaration files for public API

## Documentation

Detailed design and reference docs live in [`docs/`](./README.md):

| Doc                                              | Covers                                                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| [React integration](./react.md)               | Ref binding, props (React 19 vs ≤ 18), event listening, controlled mode, TS declaration merging, Next.js/SSR |
| [Backend quickstart](./backend-quickstart.md) | Copy-paste adapters for OpenAI, Anthropic, Ollama, and custom SSE/WebSocket backends                         |
| [Message model](./message-model.md)           | Roles (`ChatMessageRole`), `ChatMessage` fields, the `parts[]` body, factories, streaming/updating           |
| [`<i-chat>` API](./component-api.md)          | Properties, methods, events, slots, confirmations, highlight.js, ChatRunController, middleware               |
| [Parts](./parts.md)                           | `reasoning`, `tool-call`, `file`, `source`, and `x-*` custom parts                                           |
| [Custom renderers](./renderers.md)            | `registerCodeRenderer` + built-in chart / KPI / form / Mermaid renderers                                     |
| [Progress](./progress.md)                     | `[status]` lists, block IDs, programmatic updates                                                            |
| [Todo panel](./todo.md)                       | Structured items, collapse behavior, status events, updates                                                  |
| [Theming](./theming.md)                       | 12 base tokens, derivation, light/dark contract, Mermaid tokens, full CSS reference                          |
| [Localization (i18n)](./localization.md)      | `config.locale` / `config.labels`, plurals (`makeDaysAgo`), RTL                                              |
| [Composer & interaction](./composer.md)       | Streaming, reply blocks, voice input                                                                         |

## Development

Clone, install, build, run the static demo:

```bash
npm install
npm run build    # workspace order: chat-messages, chat-input, chat-renderers, chat, apps/demo
npm run test     # 24 unit tests (pure helpers)
npm run dev      # concurrent watch on all packages + chat-demo dev server (see root `package.json`)
```

| Script                  | Description                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| `npm run build`         | Builds all workspaces in dependency order (ends with `apps/demo`) |
| `npm run test`          | Runs 24 unit tests for pure helpers                               |
| `npm run test:coverage` | Runs tests with Node.js coverage report                           |
| `npm run dev`           | Watch mode for packages and the Vue demo app (`chat-demo`)        |
| `npm run start`         | Alias for `npm run dev` (see root `package.json`)                 |

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
