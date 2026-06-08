# `<i-chat>` API

Properties, methods, and events of the `<i-chat>` shell, plus slots and per-message avatars.

- [Properties, methods, events](#i-chat--properties-methods-events)
- [Slots on `<i-chat>`](#slots-on-i-chat)
- [Per-message `avatar`](#per-message-avatar)

## `<i-chat>` — properties, methods, events

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `messages` | `ChatMessage[]` | `[]` | Bound to the inner list (also writable; prefer `addMessage` / `updateMessage` to avoid overwriting streamed state) |
| `config` | `ChatConfig` | `{}` | Avatars, `locale`, `labels` (all UI strings — see [Localization](./localization.md)), date separators, etc. |
| `emptyText` | `string` | `''` | Plain text when there are no messages and no `empty` slot |
| `placeholder` | `string` | `''` | Default `<i-chat-input>` placeholder (ignored when using `slot="input"`). Empty → localized default from `config.locale` / `config.labels.composer.placeholder` |
| `disabled` | `boolean` | `false` | Disables the default composer |
| `showVoiceInput` | `boolean` | `true` | Enables/disables the default composer voice button; even when `true`, the button is rendered only if the browser supports speech recognition |
| `voiceLang` | `string` | `''` | Forwarded to the default `<i-chat-input>` — BCP 47 tag for speech recognition (e.g. `zh-CN`; empty uses `navigator.language`) |
| `voiceListeningLabel` | `string` | `''` | Forwarded to the default `<i-chat-input>` — text on the listening overlay. Empty → localized default from `config.locale` / `config.labels.composer.voiceListening` |
| `voiceDiagnostics` | `boolean` | `false` | Forwarded to the default `<i-chat-input>` — enables `console.debug` for speech-recognition steps |

**Methods (forwarded to the inner message list):** `addMessage`, `updateMessage`, `appendPart`, `updatePart`, `updateToolCall`, `removeMessage`, `replyMessage`, `clearReplyMessage`, `clear`, `cancel`, `cancelMessage`, `showError`, `dismissError`, `updateTimeline`, `addErrorMessage`, `registerRenderer`, `createStreamingController`, `focusInput`

**Events on `<i-chat>`:**

| Event | Detail | Notes |
|-------|--------|--------|
| `send` | `{ content: string }` | User submitted the default input (or your control inside `slot="input"` must dispatch the same event if you mimic the built-in) |
| `cancel` | — | User cancelled during streaming (default input) |
| `streaming-change` | `{ streaming: boolean }` | Any assistant message is streaming |
| `message-action` | `{ action: string, message: ChatMessage }` | From `message-actions` slot / `data-action` buttons |
| `tool-action` | `{ action: 'approve' \| 'reject', toolCallId: string, part: ToolCallPart }` | From a `tool-call` part’s human-in-the-loop buttons (when `approval === 'required'`) |
| `form-submit` | `{ formId, title, values, messageId, message }` | From an embedded `form` fenced block inside a `text` part |

Events that originate on inner rows (e.g. `message-complete` on `<i-chat-message>`) use `bubbles` + `composed` so you can listen on `<i-chat>` or `document`.

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

Supported values: image URL, `data:image/…;base64,…`, raw base64 (defaults to PNG in the component), inline `<svg>…</svg>`, or plain text / emoji.

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
