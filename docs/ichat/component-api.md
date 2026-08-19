# `<i-chat>` API

Properties, methods, and events of the `<i-chat>` shell, plus slots and per-message avatars.

- [Properties, methods, events](#i-chat--properties-methods-events)
- [Optional virtual scrolling](#optional-virtual-scrolling)
- [Markdown extension API](#markdown-extension-api)
- [Composer confirmations](#composer-confirmations)
- [Custom composer interactions](#custom-composer-interactions)
- [Slots on `<i-chat>`](#slots-on-i-chat)
- [Per-message `avatar`](#per-message-avatar)

## `<i-chat>` — properties, methods, events

| Property                    | Type                                                              | Default          | Description                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------- | ----------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `messages`                  | `ExtendedChatMessage<TExtraParts>[]` (`ChatMessage[]` by default) | `[]`             | The authoritative message array. Write directly (`chat.messages = [...]`) to replace all messages, or use imperative methods (`addMessage`, etc.) for incremental updates. When using the generic `Chat<TExtraParts>` type (see [Generic type support](#generic-type-support)), `parts` carry fully typed custom `x-*` extensions that narrow on `part.type`. |
| `config`                    | `ChatConfig`                                                      | `{}`             | Avatars, `locale`, `labels` (all UI strings — see [Localization](./localization.md)), date separators, `virtualScroll` (see [Optional virtual scrolling](#optional-virtual-scrolling)), etc.                                                                                                                                                                  |
| `emptyText`                 | `string`                                                          | `''`             | Plain text when there are no messages and no `empty` slot                                                                                                                                                                                                                                                                                                     |
| `placeholder`               | `string`                                                          | `''`             | Default `<i-chat-input>` placeholder (ignored when using `slot="input"`). Empty → localized default from `config.locale` / `config.labels.composer.placeholder`                                                                                                                                                                                               |
| `disabled`                  | `boolean`                                                         | `false`          | Disables the default composer                                                                                                                                                                                                                                                                                                                                 |
| `busy`                      | `boolean` (readonly)                                              | `false`          | `true` while a submission is passing through `beforeSend` middleware or an assistant message is streaming. Reflected as the `busy` and `aria-busy` host attributes; new sends are blocked while the textarea remains available for the next draft.                                                                                                            |
| `activeComposerInteraction` | `ChatComposerInteractionResolvedRequest \| null` (readonly)       | `null`           | Snapshot of the active item in the shared confirmation/custom FIFO. Read this after `composer-interaction-change`; do not mutate it.                                                                                                                                                                                                                          |
| `ready`                     | `Promise<void>` (readonly)                                        | —                | Resolves after the first render when child elements are queryable. Data methods are safe before `ready`; DOM methods may `await chat.ready`.                                                                                                                                                                                                                  |
| `messageMode`               | `'uncontrolled'` \| `'controlled'`                                | `'uncontrolled'` | Message ownership mode. `uncontrolled`: component owns messages (default). `controlled`: host owns messages — imperative methods emit a cancelable `messages-change` proposal with `committed: false`; host may write `event.detail.messages` back synchronously or asynchronously and may reject with `preventDefault()`.                                    |
| `showVoiceInput`            | `boolean`                                                         | `true`           | Enables/disables the default composer voice button; even when `true`, the button is rendered only if the browser supports speech recognition                                                                                                                                                                                                                  |
| `voiceLang`                 | `string`                                                          | `''`             | Forwarded to the default `<i-chat-input>` — BCP 47 tag for speech recognition (e.g. `zh-CN`; empty uses `navigator.language`)                                                                                                                                                                                                                                 |
| `voiceListeningLabel`       | `string`                                                          | `''`             | Forwarded to the default `<i-chat-input>` — text on the listening overlay. Empty → localized default from `config.locale` / `config.labels.composer.voiceListening`                                                                                                                                                                                           |
| `voiceDiagnostics`          | `boolean`                                                         | `false`          | Forwarded to the default `<i-chat-input>` — enables `console.debug` for speech-recognition steps                                                                                                                                                                                                                                                              |

**Methods:** `requestConfirmation`, `clearConfirmations`, `requestComposerInteraction`, `completeComposerInteraction`, `cancelComposerInteraction`, `clearComposerInteractions`, `addMessage`, `updateMessage`, `appendPart`, `tryUpdatePart`, `updatePart`, `tryUpdateToolCall`, `tryUpdateTodoItem`, `tryApplyMessagePartUpdateEvent`, `tryApplyTodoItemUpdateEvent`, `removeMessage`, `replyMessage`, `clearReplyMessage`, `clear`, `cancel`, `cancelMessage`, `showError`, `dismissError`, `updateProgressStep`, `addErrorMessage`, `scrollToMessage`, `scrollToPart`, `focusInput`

**Events on `<i-chat>`:**

| Event                         | Detail                                                                                             | Notes                                                                                                                                                                                                         |
| ----------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `send`                        | `{ content: string }`                                                                              | User submitted the default input (or your control inside `slot="input"` must dispatch the same event if you mimic the built-in)                                                                               |
| `cancel`                      | —                                                                                                  | User cancelled during streaming (default input)                                                                                                                                                               |
| `messages-change`             | `MessagesChangeDetail`                                                                             | Emitted after an uncontrolled mutation commits or a controlled mutation is proposed. Controlled events are cancelable with `preventDefault()`. Direct external `messages = […]` does **not** emit this event. |
| `streaming-change`            | `{ streaming: boolean }`                                                                           | Any assistant message is streaming                                                                                                                                                                            |
| `busy-change`                 | `{ busy: boolean }`                                                                                | Effective busy state changed. Useful for disabling a custom `slot="input"` composer.                                                                                                                          |
| `message-action`              | `{ action: string, message: ChatMessage }`                                                         | From `message-actions` slot / `data-action` buttons                                                                                                                                                           |
| `part-action`                 | `{ kind, action, messageId, message, partId?, partType?, part?, payload }`                         | Unified event for rendered part interactions. `kind` is `'form'`, `'todo'`, or `'tool-call'`.                                                                                                                 |
| `link-click`                  | `{ href, rawHref, protocol, text, messageId, message, partId?, partType?, target, originalEvent }` | Cancelable event from rendered message links. Call `preventDefault()` to handle a link yourself                                                                                                               |
| `chat-renderer-error`         | `RendererErrorDetail`                                                                              | A block or string-part renderer failed during matching, sync rendering, or async rendering. The message has already fallen back safely; use this event for logging/observability.                             |
| `confirmation-change`         | `{ active, queue, queueLength }`                                                                   | Confirmation-only view changed. A custom active item is reported as `active: null`; custom items are omitted from this event's queue.                                                                         |
| `confirmation-decision`       | `ChatConfirmationResult`                                                                           | User confirmed or cancelled the active composer confirmation                                                                                                                                                  |
| `composer-interaction-change` | `ChatComposerInteractionChangeDetail`                                                              | Active item or waiting queue changed in the shared confirmation/custom FIFO. `queueLength` excludes `active`.                                                                                                 |
| `composer-interaction-result` | `ChatComposerInteractionResult`                                                                    | Any shared interaction completed or was cancelled, including `kind: 'confirmation'`.                                                                                                                          |

Events that originate on inner rows (e.g. `message-complete` on `<i-chat-message>`) use `bubbles` + `composed` so you can listen on `<i-chat>` or `document`.

## Optional virtual scrolling

Long histories can be virtualized so that only the visible rows plus a small buffer stay in the DOM. `config.virtualScroll` accepts:

| Value              | Behaviour                                       |
| ------------------ | ----------------------------------------------- |
| `'auto'` (default) | Virtualizes once the message count exceeds 500  |
| `true`             | Always virtualizes, regardless of message count |
| `false`            | Always uses the regular keyed list              |

```ts
chat.config = { ...chat.config, virtualScroll: true };
```

`@lit-labs/virtualizer` is imported lazily the first time it is needed, so short conversations never pay for it. If that import fails, the regular keyed list is used and a warning is logged — the fallback needs no configuration.

### Trade-offs

Off-screen rows do not exist in the DOM while virtualization is active. That is what makes it fast, and it has consequences worth deciding on deliberately:

- Browser find-in-page (Ctrl/Cmd+F) only matches the rendered range.
- Text selection and copy cannot span the whole history.
- Printing and "save as PDF" capture only the rendered range.
- Custom parts must keep durable state in message data rather than in private DOM state, because their elements are recycled.

Set `virtualScroll: false` when these matter more than large-history performance.

### Scrolling to off-screen content

`scrollToMessage(id)` and `scrollToPart(partId)` reach rows that are not mounted. When the target is already rendered they scroll immediately; otherwise they return `true` meaning _scheduled_, and the scroll completes over the next few frames as the virtualizer materializes the row and replaces its estimated height with a measured one. They return `false` only when the id does not exist, or when the row is unmounted and virtualization is not active.

## Terminal part statuses

A part carries its own lifecycle in `part.status` (`'pending' | 'streaming' | 'complete' | 'error' | 'cancelled'`), independent of the message-level `streaming` flag. Only `'streaming'` selects the light render path, which skips the terminal sanitization pass, leaves async block renderers unresolved, and bypasses the Markdown cache.

`run.complete()`, `run.fail()`, `run.cancel()`, and `chat.cancelMessage()` therefore move every part still at `'pending'` or `'streaming'` to `'complete'`, `'error'`, and `'cancelled'` respectively, in the same mutation that clears the message flag — so a controlled host sees one `messages-change` proposal per terminal transition. Parts that already hold a terminal status are left untouched, array reference included.

Driving the lifecycle by hand instead (`updatePart` / `updateMessage`) means doing this yourself; `normalizeHistoryMessages()` applies the same rule to histories loaded from a backend. `finalizeMessageParts(parts, status)` is exported if you need it directly.

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
- **Conflict detection** — registering a different object under an already-used `id` warns and keeps the first registration.
- **CSS auto-injection** — the `styles` string is automatically injected into every `<i-chat-messages>`, `<i-chat-message>`, `<i-chat-reasoning>`, and `<i-chat-tool-call>` shadow root via a shared constructable stylesheet.
- **Cache invalidation** — the markdown render cache is flushed so re-renders pick up the extension.
- For fenced-code-block renderers (chart, Mermaid, form, etc.), use the module-level `registerCodeRenderer` function. See [Renderers](./renderers.md).

> Block Renderers, Part Renderers, and Markdown Plugins use global module-level registries and may be registered at runtime. New registrations affect subsequent renders without automatically refreshing existing content. Re-registering the same object is an idempotent no-op; a different object with the same name/id produces a warning and keeps the first registration.

### Generic type support

`<i-chat>` is generic over custom part types, enabling full type-checking and autocomplete for host-defined `x-*` extensions.

```typescript
import type {
  Chat,
  CustomPartOf,
  PartOf,
  ExtendedChatMessage,
} from "@bndynet/ichat";

// 1. Describe your custom part data as a **type alias**, not an interface.
//    An interface has no implicit index signature, so it does not satisfy the
//    `Record<`x-${string}`, unknown>` constraint that `Chat<TExtraParts>` imposes.
type MyParts = {
  "x-weather": { temp: number; humidity: number; unit: "C" | "F" };
  "x-map": { lat: number; lng: number; zoom: number };
};

// 2. Cast the element to Chat<YourParts>
const chat = document.querySelector("i-chat") as Chat<MyParts>;

// 3. Custom parts are now fully typed and narrow on `part.type`
chat.messages.forEach((msg) => {
  msg.parts.forEach((part) => {
    if (part.type === "x-weather") {
      part.data.temp; // ✅ number (autocompleted)
      part.data.unit; // ✅ 'C' | 'F'
    }
    if (part.type === "x-map") {
      part.data.lat; // ✅ number
      part.data.zoom; // ✅ number
    }
    if (part.type === "x-unknown") {
      // ❌ compile error — 'x-unknown' is not declared in MyParts
    }
  });
});
```

Once you supply a mapping, the open-ended `CustomPart` (whose `data` is `unknown`) is
removed from the part union and replaced by `CustomPartOf<MyParts>`. That is what makes
`part.data` narrow to a concrete shape instead of staying `unknown`. The trade-off is
deliberate: a `Chat<MyParts>` promises that every `x-*` part it carries is one you
declared. If you also handle parts outside the mapping, add them to `MyParts` (use
`unknown` as the data type for the ones you do not care about) or work with the
non-generic `Chat`.

**Type helpers:**

| Helper                   | Signature                              | Description                                                                                       |
| ------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `Chat<TExtraParts>`      | `Chat<{ 'x-*': Data }>`                | The generic `<i-chat>` element type; defaults to `Chat<{}>` (plain `ChatMessage[]`).              |
| `ExtendedChatMessage<T>` | `ExtendedChatMessage<{ 'x-*': Data }>` | `ChatMessage` whose `parts` carry typed custom parts. This is the element's `messages` item type. |
| `ExtendedMessagePart<T>` | `ExtendedMessagePart<{ 'x-*': Data }>` | The built-in `MessagePart` union with the untyped `CustomPart` swapped for `CustomPartOf<T>`.     |
| `CustomPartOf<T>`        | `CustomPartOf<{ 'x-*': Data }>`        | Produces a typed `CustomPart` discriminated union from a mapping.                                 |
| `PartOf<M, T>`           | `PartOf<ChatMessage, 'text'>`          | Extracts the part(s) matching a given type string from a message.                                 |

With no mapping, `ExtendedChatMessage` and `ExtendedMessagePart` collapse back to plain
`ChatMessage` and `MessagePart`, so the non-generic surface is unchanged.

```typescript
// CustomPartOf example
type WeatherPart = CustomPartOf<MyParts>;
//   = CustomPart & { type: 'x-weather'; data: { temp: number; humidity: number; unit: 'C' | 'F' } }
//   | CustomPart & { type: 'x-map'; data: { lat: number; lng: number; zoom: number } }

// ExtendedChatMessage example — assignable to plain ChatMessage
declare const typed: ExtendedChatMessage<MyParts>;
const plain: ChatMessage = typed; // ✅ widening always works

// PartOf example (works with plain ChatMessage too)
type TextParts = PartOf<ChatMessage, "text">; // TextPart
type ToolParts = PartOf<ChatMessage, "tool-call">; // ToolCallPart
```

> **Note:** The generic parameter is purely a TypeScript-level feature — there is zero runtime cost. When `TExtraParts` is omitted (the default `{}`), all types resolve to the standard non-generic `ChatMessage` / `MessagePart` / `CustomPart`, fully backward-compatible.

### Part actions

`part-action` is the unified event for interactions that originate inside a rendered message part. `kind` names the part domain (`'form'`, `'todo'`, or `'tool-call'`), while `action` names the specific intent (`'submit'`, `'change-status'`, `'approve'`, `'reject'`).

```javascript
chat.addEventListener("part-action", (event) => {
  const { kind, action, messageId, partId, part, payload } = event.detail;
  if (kind === "todo") {
    const result = chat.tryUpdateTodoItem(messageId, partId, payload.itemId, {
      status: payload.status,
    });
    if (!result.ok) console.warn("Todo update ignored:", result.reason);
  }
  if (kind === "tool-call" && action === "approve") {
    const result = chat.tryUpdateToolCall(messageId, partId, {
      approval: "approved",
    });
    if (!result.ok) console.warn("Tool update ignored:", result.reason);
  }
});
```

All mutation methods now return diagnostic results via `try*` variants (`tryUpdateTodoItem`, `tryUpdateToolCall`, `tryApplyMessagePartUpdateEvent`, `tryApplyTodoItemUpdateEvent`), providing structured failure reasons (`message-not-found`, `part-not-found`, `part-type-mismatch`, `stale-revision`, `invalid-status`, `invalid-state`).

### Link clicks and protocols

Rendered message links emit a cancelable `link-click` event. By default, built-in rendered links allow `http`, `https`, `mailto`, and `tel`, plus relative URLs and fragment links. Custom app protocols such as `myapp:` must be explicitly opted into with `config.allowedLinkProtocols`. A non-empty list replaces the default protocol list, and values may include or omit the trailing colon.

```javascript
chat.config = {
  ...chat.config,
  allowedLinkProtocols: ["https", "mailto", "myapp"],
};

chat.addEventListener("link-click", (e) => {
  const { rawHref, protocol } = e.detail;
  if (protocol === "myapp:") {
    e.preventDefault();
    routeInsideApp(rawHref);
  }
});
```

### Syntax highlighting

By default, code blocks render as plain escaped `<pre><code>` without language-based highlighting. To enable highlighting, pass your own `highlight.js` instance via `config.highlightJs`. This keeps the bundle small — only the languages you register are included.

```typescript
import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";

hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);

chat.config = {
  ...chat.config,
  highlightJs: hljs,
};
```

If `highlightJs` is not set, code blocks fall back to plain escaped text — no errors, no missing imports.

## Composer confirmations

Use `requestConfirmation(request)` when an AI or host action must pause for user approval before continuing. The confirmation panel is a composer state: while it is active, it visually replaces the default `<i-chat-input>` in the footer. If you provide a custom `slot="input"`, that slotted composer is also hidden until the active confirmation is resolved. The composer stays mounted behind `hidden` / `inert`, so its draft survives the confirmation.

```javascript
const result = await chat.requestConfirmation({
  title: "Delete this file?",
  description: "This will remove /tmp/cache.db.",
  details: { path: "/tmp/cache.db", source: "cleanup tool" },
  confirmLabel: "Delete",
  variant: "danger",
});

if (result.confirmed) {
  await deleteFile("/tmp/cache.db");
}
```

`ChatConfirmationRequest` fields:

| Field                          | Type                    | Description                                                                  |
| ------------------------------ | ----------------------- | ---------------------------------------------------------------------------- |
| `id`                           | `string?`               | Optional stable id. Generated when omitted                                   |
| `title`                        | `string`                | Main prompt shown to the user                                                |
| `description`                  | `string?`               | Short supporting text                                                        |
| `details`                      | `unknown?`              | String or structured data; objects render in a collapsible details block     |
| `requiredLabel`                | `string?`               | Per-request eyebrow above the title. Set to `''` to hide it for this request |
| `confirmLabel` / `cancelLabel` | `string?`               | Per-request button labels                                                    |
| `variant`                      | `'default' \| 'danger'` | Use `danger` for destructive or high-impact actions                          |
| `payload`                      | `unknown?`              | Host data returned in `result.request`; not rendered by default              |

Multiple calls are queued FIFO and shown one at a time. `clearConfirmations()` resolves the active and queued confirmations as `{ confirmed: false, action: 'cancel' }`.

Generate `title` / `description` in your application from validated action or tool schemas. Model-provided text can be included as supporting context, but the primary confirmation copy should come from trusted business logic.

The small eyebrow above the title comes from `config.labels.confirmation.required`. Set that label to an empty string to hide it globally, or set `request.requiredLabel = ''` to hide it for one confirmation.

## Custom composer interactions

Use `requestComposerInteraction()` for temporary host-rendered UI that belongs in the composer area: an address form, a single-choice selector, a date picker, or another short workflow. It is not a general page modal and it does not reuse the message-level `<i-chat-form>` lifecycle.

### Request and result types

```typescript
interface ChatComposerInteractionRequest {
  id?: string;
  kind: `x-${string}`;
  payload?: unknown;
  ariaLabel?: string;
  signal?: AbortSignal;
}

interface ChatComposerInteractionResolvedRequest {
  id: string;
  kind: "confirmation" | `x-${string}`;
  payload?: unknown;
  ariaLabel?: string;
}

type ChatComposerInteractionCancelReason =
  "cancelled" | "aborted" | "cleared" | "disconnected";

type ChatComposerInteractionResult =
  | {
      id: string;
      status: "completed";
      value: unknown;
      request: ChatComposerInteractionResolvedRequest;
    }
  | {
      id: string;
      status: "cancelled";
      reason: ChatComposerInteractionCancelReason;
      request: ChatComposerInteractionResolvedRequest;
    };
```

Custom request kinds must start with `x-`; continue to use `requestConfirmation()` for built-in confirmations. An omitted or blank `id` is generated. A request whose ID is already active or queued is rejected rather than replacing the pending request.

Requests and payloads are data only. Do not pass HTML, Lit templates, DOM nodes, callbacks, or framework component instances in `payload`. Validate the payload for each supported `kind`, render it through normal framework escaping, and keep passwords, tokens, and other secrets out of payloads and logs.

```javascript
const result = await chat.requestComposerInteraction({
  kind: "x-address-form",
  ariaLabel: "Shipping address form",
  payload: {
    title: "Shipping address",
    defaults: { city: "London", country: "United Kingdom" },
  },
});

if (result.status === "completed") {
  await saveAddress(result.value);
}
```

### Public methods

| API                                                   | Behaviour                                                                                                                          |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `requestComposerInteraction(request)`                 | Enqueues a custom request and resolves once with a completed or cancelled result.                                                  |
| `completeComposerInteraction(id, value)`              | Completes only the matching **active custom** request. Returns `false` for stale IDs, queued IDs, confirmations, or an idle queue. |
| `cancelComposerInteraction(id, reason = 'cancelled')` | Cancels a matching active or queued custom request. Returns `false` for stale IDs and confirmations.                               |
| `clearComposerInteractions(reason = 'cleared')`       | Cancels the active request and the full shared queue; returns the number cancelled.                                                |
| `activeComposerInteraction`                           | Read-only active snapshot. Its kind may be `confirmation` or a custom `x-*` kind.                                                  |

Passing an `AbortSignal` cancels an active or queued request with `reason: 'aborted'`. Removing `<i-chat>` cancels unresolved requests with `reason: 'disconnected'`.

### Render through `slot="composer-interaction"`

The host owns the renderer. Track the active request from `composer-interaction-change`, and assign the slot only for kinds the host understands. Key stateful renderer roots by request ID so a FIFO transition starts with fresh local form state.

```vue
<section
  v-if="active?.kind === 'x-address-form'"
  :key="active.id"
  slot="composer-interaction"
  :aria-label="active.ariaLabel"
>
  <form @submit.prevent="completeAddress">
    <!-- Host-rendered, validated fields. -->
  </form>
</section>
```

Do not leave a catch-all `composer-interaction` slot assigned for unknown kinds. An assigned node tells `<i-chat>` that a renderer exists; conditionally assigning the slot lets the safe missing-renderer fallback appear when a kind is unsupported.

The slotted renderer can call the public methods directly, or dispatch one of these events from inside the assigned slot:

| Event                           | Required detail | Requirements                                                                         |
| ------------------------------- | --------------- | ------------------------------------------------------------------------------------ |
| `composer-interaction-complete` | `{ id, value }` | `bubbles: true`, `composed: true`, and `id` must equal the active custom request ID. |
| `composer-interaction-cancel`   | `{ id }`        | `bubbles: true`, `composed: true`, and `id` must equal the active custom request ID. |

```javascript
form.dispatchEvent(
  new CustomEvent("composer-interaction-complete", {
    detail: { id: active.id, value: formValue },
    bubbles: true,
    composed: true,
  }),
);
```

Events from the message body, events that do not bubble/cross the shadow boundary, and events carrying a stale or mismatched ID are ignored. This prevents a late renderer event from settling the next FIFO item.

### Shared FIFO and lifecycle

Confirmations and custom requests share one FIFO, so calls are displayed in request order:

```javascript
void chat.requestConfirmation({ title: "Review the order?" });
void chat.requestComposerInteraction({ kind: "x-delivery-selector" });
void chat.requestConfirmation({ title: "Place the order?" });
```

- `composer-interaction-change` reports the complete shared `active`, `queue`, and active-excluded `queueLength` snapshots.
- `composer-interaction-result` reports every completion/cancellation in the shared queue. Existing `confirmation-change` and `confirmation-decision` events remain available for confirmation-only consumers.
- `clearConfirmations()` cancels only confirmation items and leaves custom requests pending. `clearComposerInteractions()` cancels everything.
- Settling an item emits its result before the subsequent queue-change event, then automatically activates the next item.

An active interaction blocks ordinary Send even when `busy === false`. Opening or closing an interaction does not change `busy`; that property continues to represent submission middleware or assistant streaming. A custom interaction may still complete while `busy === true`.

The default `<i-chat-input>` and custom `slot="input"` content remain mounted while temporarily hidden and inert, so drafts survive the full queue. Stateful interaction UI is different: reset it for each request, normally with `key={active.id}` / `:key="active.id"`.

### Focus, accessibility, and fallback

The host renderer is responsible for focusing its first useful control, applying `active.ariaLabel` (or an equivalent accessible name), keyboard order, validation feedback, and any Escape or focus-trap behaviour its UI requires. Custom interactions do not receive the confirmation component's automatic focus trap. When the queue finishes, `<i-chat>` restores focus to the default composer when applicable.

If a custom request is active and no `composer-interaction` renderer is assigned, `<i-chat>` displays a localized “This interaction cannot be displayed” fallback with a Cancel action. The fallback never renders or stringifies `payload`, preventing an unsupported interaction from becoming permanently stuck or exposing its data.

## Slots on `<i-chat>`

Message-related slots are **forwarded** with declarative `<slot name="…" slot="…">` under the inner components so your nodes **stay direct children of `<i-chat>`** (page / framework styles still apply). Put **`slot="…"`** on direct children of `<i-chat>` (same names as on a standalone `<i-chat-messages>`).

| Slot                   | Description                                                                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `self-avatar`          | Avatar template for `role: 'self'`                                                                                                                 |
| `peer-avatar`          | Avatar for `role: 'peer'`                                                                                                                          |
| `assistant-avatar`     | Avatar for assistant / system                                                                                                                      |
| `message-actions`      | Row shown on assistant messages (e.g. buttons with `data-action`)                                                                                  |
| `reasoning-header`     | Custom header for reasoning / “thinking” blocks                                                                                                    |
| `empty`                | Content when there are no messages                                                                                                                 |
| `actions`              | Bottom-left toolbar **inside** the default `<i-chat-input>` (attach, model picker, etc.)                                                           |
| `input`                | **Replaces** the entire default `<i-chat-input>` — supply your own footer; dispatch `send` and mirror `busy-change` / `streaming-change` as needed |
| `composer-interaction` | Host-rendered content for a recognized active custom `x-*` request. Assign conditionally by kind and settle with the matching request ID.          |

When a confirmation or custom composer interaction is active, its panel temporarily replaces both the default composer and any custom `slot="input"` content. The composer content remains mounted but hidden/inert so its draft survives.

### Slots example

```html
<i-chat id="chat" placeholder="Message…">
  <div slot="self-avatar">
    <img
      src="user.png"
      style="width:100%;height:100%;border-radius:50%;object-fit:cover"
      alt=""
    />
  </div>
  <div slot="assistant-avatar">
    <div
      style="background:linear-gradient(135deg,#f093fb,#f5576c);width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;"
    >
      AI
    </div>
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
import { textPart } from "@bndynet/ichat";

chat.addMessage({
  id: "u1",
  role: "self",
  parts: [textPart("Hello")],
  timestamp: Date.now(),
  avatar: "https://example.com/avatar.png",
});
```
