# `<i-chat>` API

Properties, methods, and events of the `<i-chat>` shell, plus slots and per-message avatars.

- [Properties, methods, events](#i-chat--properties-methods-events)
- [Markdown extension API](#markdown-extension-api)
- [Composer confirmations](#composer-confirmations)
- [Slots on `<i-chat>`](#slots-on-i-chat)
- [Per-message `avatar`](#per-message-avatar)

## `<i-chat>` — properties, methods, events

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `messages` | `ChatMessage[]` | `[]` | The authoritative message array. Write directly (`chat.messages = [...]`) to replace all messages, or use imperative methods (`addMessage`, etc.) for incremental updates. When using the generic `Chat<TExtraParts>` type (see [Generic type support](#generic-type-support)), `parts` carry fully typed custom `x-*` extensions. |
| `config` | `ChatConfig` | `{}` | Avatars, `locale`, `labels` (all UI strings — see [Localization](./localization.md)), date separators, etc. |
| `emptyText` | `string` | `''` | Plain text when there are no messages and no `empty` slot |
| `placeholder` | `string` | `''` | Default `<i-chat-input>` placeholder (ignored when using `slot="input"`). Empty → localized default from `config.locale` / `config.labels.composer.placeholder` |
| `disabled` | `boolean` | `false` | Disables the default composer |
| `ready` | `Promise<void>` (readonly) | — | Resolves after the first render when child elements are queryable. Data methods are safe before `ready`; DOM methods may `await chat.ready`. |
| `messageMode` | `'uncontrolled'` \| `'controlled'` | `'uncontrolled'` | Message ownership mode. `uncontrolled`: component owns messages (default). `controlled`: host owns messages — imperative methods emit `messages-change` with `committed: false`; host must synchronously write `event.detail.messages` back. |
| `showVoiceInput` | `boolean` | `true` | Enables/disables the default composer voice button; even when `true`, the button is rendered only if the browser supports speech recognition |
| `voiceLang` | `string` | `''` | Forwarded to the default `<i-chat-input>` — BCP 47 tag for speech recognition (e.g. `zh-CN`; empty uses `navigator.language`) |
| `voiceListeningLabel` | `string` | `''` | Forwarded to the default `<i-chat-input>` — text on the listening overlay. Empty → localized default from `config.locale` / `config.labels.composer.voiceListening` |
| `voiceDiagnostics` | `boolean` | `false` | Forwarded to the default `<i-chat-input>` — enables `console.debug` for speech-recognition steps |

**Methods:** `requestConfirmation`, `clearConfirmations`, `addMessage`, `updateMessage`, `appendPart`, `tryUpdatePart`, `updatePart`, `tryUpdateToolCall`, `tryUpdateTodoItem`, `tryApplyMessagePartUpdateEvent`, `tryApplyTodoItemUpdateEvent`, `removeMessage`, `replyMessage`, `clearReplyMessage`, `clear`, `cancel`, `cancelMessage`, `showError`, `dismissError`, `updateProgressStep`, `addErrorMessage`, `scrollToMessage`, `scrollToPart`, `registerCodeRenderer`, `registerMarkdownPlugin`, `focusInput`

**Events on `<i-chat>`:**

| Event | Detail | Notes |
|-------|--------|--------|
| `send` | `{ content: string }` | User submitted the default input (or your control inside `slot="input"` must dispatch the same event if you mimic the built-in) |
| `cancel` | — | User cancelled during streaming (default input) |
| `messages-change` | `MessagesChangeDetail` | Emitted after any imperative message-collection mutation commits. Direct external `messages = […]` does **not** emit this event. |
| `streaming-change` | `{ streaming: boolean }` | Any assistant message is streaming |
| `message-action` | `{ action: string, message: ChatMessage }` | From `message-actions` slot / `data-action` buttons |
| `part-action` | `{ kind, action, messageId, message, partId?, partType?, part?, detail }` | Unified event for rendered part interactions. `kind` is `'form'`, `'todo'`, or `'tool-call'`. |
| `link-click` | `{ href, rawHref, protocol, text, messageId, message, partId?, partType?, target, originalEvent }` | Cancelable event from rendered message links. Call `preventDefault()` to handle a link yourself |
| `chat-renderer-error` | `RendererErrorDetail` | A block or string-part renderer failed during matching, sync rendering, or async rendering. The message has already fallen back safely; use this event for logging/observability. |
| `confirmation-change` | `{ active, queue, queueLength }` | Active composer confirmation or FIFO queue changed |
| `confirmation-decision` | `ChatConfirmationResult` | User confirmed or cancelled the active composer confirmation |

Events that originate on inner rows (e.g. `message-complete` on `<i-chat-message>`) use `bubbles` + `composed` so you can listen on `<i-chat>` or `document`.

## Markdown Extension API

Register markdown-it plugins (inline rules, block rules, renderer overrides) with automatic CSS injection into the Shadow DOM.

```typescript
import { registerMarkdownPlugin } from '@bndynet/ichat';
// or from '@bndynet/ichat-messages' if using the messages component standalone

registerMarkdownPlugin({
  id: 'my-emoji',                      // unique id
  install: (md) => {                   // markdown-it plugin function
    md.inline.ruler.before('escape', 'emoji', ...);
  },
  styles: '.emoji { font-size: 1.2em; }', // optional: auto-injected into all Shadow DOMs
  // globalStyles: '@font-face { ... }',  // optional: injected into document.head once
});
```

- **Idempotent** — registering the same object reference with the same `id` is a no-op.
- **Conflict detection** — registering a different object under an already-used `id` throws a clear error.
- **CSS auto-injection** — the `styles` string is automatically injected into every `<i-chat-messages>`, `<i-chat-message>`, `<i-chat-reasoning>`, and `<i-chat-tool-call>` shadow root via a shared constructable stylesheet.
- **Cache invalidation** — the markdown render cache is flushed so re-renders pick up the extension.
- For fenced-code-block renderers (chart, Mermaid, form, etc.), use `registerRenderer` instead. See [Renderers](./renderers.md).

> **⚠️ Important:** All Markdown extensions — both `registerMarkdownPlugin` and `registerCodeRenderer` — **must** be registered **before** the first `<i-chat>` or `<i-chat-messages>` component connects to the DOM. Extensions registered after a component has already connected and rendered may not take effect on existing content. Always register extensions at module-init time, before any `<i-chat>` element is inserted into the document.

### Generic type support

`<i-chat>` is generic over custom part types, enabling full type-checking and autocomplete for host-defined `x-*` extensions.

```typescript
import type { Chat, CustomPartOf, PartOf, ExtendedMessagePart } from '@bndynet/ichat';

// 1. Define your custom part data types
interface MyParts {
  'x-weather': { temp: number; humidity: number; unit: 'C' | 'F' };
  'x-map': { lat: number; lng: number; zoom: number };
}

// 2. Cast the element to Chat<YourParts>
const chat = document.querySelector('i-chat') as Chat<MyParts>;

// 3. Custom parts are now fully typed
chat.messages.forEach((msg) => {
  msg.parts.forEach((part) => {
    if (part.type === 'x-weather') {
      part.data.temp;    // ✅ number (autocompleted)
      part.data.unit;    // ✅ 'C' | 'F'
    }
    if (part.type === 'x-map') {
      part.data.lat;     // ✅ number
      part.data.zoom;    // ✅ number
    }
  });
});
```

**Type helpers:**

| Helper | Signature | Description |
|--------|-----------|-------------|
| `Chat<TExtraParts>` | `Chat<{ 'x-*': Data }>` | The generic `<i-chat>` element type; defaults to `Chat<{}>` (plain `ChatMessage[]`). |
| `CustomPartOf<T>` | `CustomPartOf<{ 'x-*': Data }>` | Produces a typed `CustomPart` discriminated union from a mapping. |
| `PartOf<M, T>` | `PartOf<ChatMessage, 'text'>` | Extracts the part(s) matching a given type string from a message. |
| `ExtendedMessagePart<T>` | `ExtendedMessagePart<{ 'x-*': Data }>` | `MessagePart` union extended with typed custom parts. |

```typescript
// CustomPartOf example
type WeatherPart = CustomPartOf<MyParts>;
//   = CustomPart & { type: 'x-weather'; data: { temp: number; humidity: number; unit: 'C' | 'F' } }
//   | CustomPart & { type: 'x-map'; data: { lat: number; lng: number; zoom: number } }

// PartOf example (works with plain ChatMessage too)
type TextParts = PartOf<ChatMessage, 'text'>;      // TextPart
type ToolParts = PartOf<ChatMessage, 'tool-call'>; // ToolCallPart
```

> **Note:** The generic parameter is purely a TypeScript-level feature — there is zero runtime cost. When `TExtraParts` is omitted (the default `{}`), all types resolve to the standard non-generic `ChatMessage` / `MessagePart` / `CustomPart`, fully backward-compatible.

### Part actions

`part-action` is the unified event for interactions that originate inside a rendered message part. `kind` names the part domain (`'form'`, `'todo'`, or `'tool-call'`), while `action` names the specific intent (`'submit'`, `'change-status'`, `'approve'`, `'reject'`).

```javascript
chat.addEventListener('part-action', (event) => {
  const { kind, action, messageId, partId, part, detail } = event.detail;
  if (kind === 'todo') {
    const result = chat.tryUpdateTodoItem(
      messageId,
      partId,
      detail.itemId,
      { status: detail.status },
    );
    if (!result.ok) console.warn('Todo update ignored:', result.reason);
  }
  if (kind === 'tool-call' && action === 'approve') {
    const result = chat.tryUpdateToolCall(messageId, partId, {
      approval: 'approved',
    });
    if (!result.ok) console.warn('Tool update ignored:', result.reason);
  }
});
```

All mutation methods now return diagnostic results via `try*` variants (`tryUpdateTodoItem`, `tryUpdateToolCall`, `tryApplyMessagePartUpdateEvent`, `tryApplyTodoItemUpdateEvent`), providing structured failure reasons (`message-not-found`, `part-not-found`, `part-type-mismatch`, `stale-revision`, `invalid-status`, `invalid-state`).

### Link clicks and protocols

Rendered message links emit a cancelable `link-click` event. By default, built-in rendered links allow `http`, `https`, `mailto`, and `tel`, plus relative URLs and fragment links. Custom app protocols such as `myapp:` must be explicitly opted into with `config.allowedLinkProtocols`. A non-empty list replaces the default protocol list, and values may include or omit the trailing colon.

```javascript
chat.config = {
  ...chat.config,
  allowedLinkProtocols: ['https', 'mailto', 'myapp'],
};

chat.addEventListener('link-click', (e) => {
  const { rawHref, protocol } = e.detail;
  if (protocol === 'myapp:') {
    e.preventDefault();
    routeInsideApp(rawHref);
  }
});
```

### Syntax highlighting

By default, code blocks render as plain escaped `<pre><code>` without language-based highlighting. To enable highlighting, pass your own `highlight.js` instance via `config.highlightJs`. This keeps the bundle small — only the languages you register are included.

```typescript
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);

chat.config = {
  ...chat.config,
  highlightJs: hljs,
};
```

If `highlightJs` is not set, code blocks fall back to plain escaped text — no errors, no missing imports.

## Composer confirmations

Use `requestConfirmation(request)` when an AI or host action must pause for user approval before continuing. The confirmation panel is a composer state: while it is active, it replaces the default `<i-chat-input>` in the footer. If you provide a custom `slot="input"`, that slotted composer is also hidden until the active confirmation is resolved.

```javascript
const result = await chat.requestConfirmation({
  title: 'Delete this file?',
  description: 'This will remove /tmp/cache.db.',
  details: { path: '/tmp/cache.db', source: 'cleanup tool' },
  confirmLabel: 'Delete',
  variant: 'danger',
});

if (result.confirmed) {
  await deleteFile('/tmp/cache.db');
}
```

`ChatConfirmationRequest` fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string?` | Optional stable id. Generated when omitted |
| `title` | `string` | Main prompt shown to the user |
| `description` | `string?` | Short supporting text |
| `details` | `unknown?` | String or structured data; objects render in a collapsible details block |
| `requiredLabel` | `string?` | Per-request eyebrow above the title. Set to `''` to hide it for this request |
| `confirmLabel` / `cancelLabel` | `string?` | Per-request button labels |
| `variant` | `'default' \| 'danger'` | Use `danger` for destructive or high-impact actions |
| `payload` | `unknown?` | Host data returned in `result.request`; not rendered by default |

Multiple calls are queued FIFO and shown one at a time. `clearConfirmations()` resolves the active and queued confirmations as `{ confirmed: false, action: 'cancel' }`.

Generate `title` / `description` in your application from validated action or tool schemas. Model-provided text can be included as supporting context, but the primary confirmation copy should come from trusted business logic.

The small eyebrow above the title comes from `config.labels.confirmation.required`. Set that label to an empty string to hide it globally, or set `request.requiredLabel = ''` to hide it for one confirmation.

## Slots on `<i-chat>`

Message-related slots are **forwarded** with declarative `<slot name="…" slot="…">` under the inner components so your nodes **stay direct children of `<i-chat>`** (page / framework styles still apply). Put **`slot="…"`** on direct children of `<i-chat>` (same names as on a standalone `<i-chat-messages>`).

| Slot | Description |
|------|-------------|
| `self-avatar` | Avatar template for `role: 'self'` |
| `peer-avatar` | Avatar for `role: 'peer'` |
| `assistant-avatar` | Avatar for assistant / system |
| `message-actions` | Row shown on assistant messages (e.g. buttons with `data-action`) |
| `reasoning-header` | Custom header for reasoning / “thinking” blocks |
| `empty` | Content when there are no messages |
| `actions` | Bottom-left toolbar **inside** the default `<i-chat-input>` (attach, model picker, etc.) |
| `input` | **Replaces** the entire default `<i-chat-input>` — supply your own footer; dispatch `send` / handle streaming as needed |

When a composer confirmation is active, the confirmation panel temporarily replaces both the default composer and any custom `slot="input"` content.

### Slots example

```html
<i-chat id="chat" placeholder="Message…">
  <div slot="self-avatar">
    <img src="user.png" style="width:100%;height:100%;border-radius:50%;object-fit:cover" alt="" />
  </div>
  <div slot="assistant-avatar">
    <div style="background:linear-gradient(135deg,#f093fb,#f5576c);width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;">AI</div>
  </div>
  <div slot="message-actions">
    <button type="button" data-action="copy">Copy</button>
    <button type="button" data-action="reply">Reply</button>
    <button type="button" data-action="like">👍</button>
    <button type="button" data-action="dislike">👎</button>
  </div>
  <div slot="empty">
    <h2>Welcome!</h2>
    <p>Start a conversation below.</p>
  </div>
  <div slot="actions" style="display:flex;gap:8px;align-items:center">
    <button type="button">+</button>
    <span>Tools</span>
  </div>
</i-chat>
```

**Custom composer (`slot="input"`):** put a single root with `slot="input"`; the default `<i-chat-input>` is not rendered. Vue/Svelte apps that add slotted nodes after mount are supported via a `MutationObserver` on `<i-chat>`.

## Per-message `avatar`

Pass `avatar` on each `ChatMessage` when calling `addMessage` / assigning `messages`. If `avatar` is non-empty, it is used for that row instead of the matching `config` defaults (`selfAvatar`, `peerAvatar`, `assistantAvatar`) and instead of the `self-avatar` / `peer-avatar` / `assistant-avatar` slots.

Supported values: image URL, `data:image/…;base64,…`, raw base64 (defaults to PNG in the component), inline `<svg>…</svg>`, or plain text / emoji. Per-message inline SVG is sanitized before rendering; use a role-specific avatar slot when the application needs fully trusted custom DOM.

```javascript
import { textPart } from '@bndynet/ichat';

chat.addMessage({
  id: 'u1',
  role: 'self',
  parts: [textPart('Hello')],
  timestamp: Date.now(),
  avatar: 'https://example.com/avatar.png',
});
```
