# Message model

How messages are shaped: roles, the common `ChatMessage` fields, and the structured `parts[]` body.

- [Message roles (`ChatMessageRole`)](#message-roles-chatmessagerole)
- [Message body — `parts[]`](#message-body--parts)

## Message roles (`ChatMessageRole`)

Each `ChatMessage` has `role: 'self' | 'peer' | 'assistant' | 'system'`.

| Role | Meaning |
|------|---------|
| `self` | Message from the **current user** (viewer); aligned to the end side (typically right). |
| `peer` | Message from **another human** (e.g. DM or group); aligned to the start side (typically left), distinct from the assistant bubble until you theme it. |
| `assistant` | **AI / bot**; streaming typewriter, optional `reasoning`, duration, and `message-actions` apply only here. |
| `system` | System or informational line; same default alignment as assistant. |

**Breaking migration from earlier releases:** use `role: 'self'` instead of `'user'`. Rename `config.userAvatar` → `config.selfAvatar`, slot `user-avatar` → `self-avatar`, and add optional `peerAvatar` / slot `peer-avatar` for `role: 'peer'`. For CSS, prefer `--chat-self-*`; legacy `--chat-user-*` is still honored via fallbacks inside the components.

### `ChatMessage` fields (common)

| Field | Description |
|-------|-------------|
| `id`, `role` | Required row identity |
| `parts` | **Required.** Ordered, typed body parts — the single source of truth for the body (see [Message body](#message-body--parts)). May be an empty array (e.g. an error-only or streaming-placeholder row). |
| `timestamp` | Row time (used by date separators / footer) |
| `avatar` | Per-row avatar override (see [Per-message `avatar`](./component-api.md#per-message-avatar)) |
| `streaming`, `error`, `cancelled`, `duration` | Assistant streaming / errors / timing |
| `parentId` | When set on a message in `messages[]`, that row renders as a **compact quote** (avatar + body only; no footer or `message-actions`). Use for reply rows you store in the thread. Distinct from **`replyMessage`**, which renders quote blocks **under** a parent without adding them to `messages[]` (see [Reply blocks](./composer.md#reply-blocks)). |

## Message body — `parts[]`

A message body is **always** an ordered array of typed parts. This mirrors modern AI chat protocols (Anthropic content blocks, Vercel AI SDK message parts): text, reasoning, tool calls, files, sources, and host‑defined `x-*` parts all sit side by side and stream/update independently. There is no plain `content` / `reasoning` string on `ChatMessage`.

### Part types (`MessagePart`)

Every part has a stable **`id`** (used for keyed rendering + targeted updates) and an optional **`status`** (`'pending' | 'streaming' | 'complete' | 'error' | 'cancelled'`).

| `type` | Shape (besides `id` / `status`) | Rendered as |
|--------|---------------------------------|-------------|
| `text` | `text: string` | Markdown bubble (typewriter while `status: 'streaming'`; charts/Mermaid/forms fences still render) |
| `reasoning` | `text: string` | Collapsible “thinking” block (`<i-chat-reasoning>`) |
| `tool-call` | `toolCallId`, `toolName`, `title?`, `args?`, `state`, `result?`, `resultParts?`, `error?`, `approval?`, `durationMs?` | Tool-call card (`<i-chat-tool-call>`) — see [Tool calls](./parts.md#tool-calls) |
| `file` | `mediaType`, `url?` \| `data?` (base64), `name?`, `size?` | Inline image or download link — see [File, source, and custom parts](./parts.md#file-source-and-custom-parts) |
| `source` | `url`, `title?`, `snippet?` | Citation link with optional snippet — see [File, source, and custom parts](./parts.md#file-source-and-custom-parts) |
| `x-*` (custom) | `data: unknown` | Readable JSON dump — see [File, source, and custom parts](./parts.md#file-source-and-custom-parts) |

### Factories

Import helpers so you don’t have to hand-write `id`s:

```javascript
import { textPart, reasoningPart, nextPartId, getMessageText } from '@bndynet/ichat';

chat.addMessage({
  id: 'a1',
  role: 'assistant',
  parts: [
    reasoningPart('Let me work through this…'),
    textPart('The answer is **42**.'),
  ],
  timestamp: Date.now(),
});

// Plain-text view (copy / search / persistence) — joins all text parts:
const plain = getMessageText(chat.messages.find((m) => m.id === 'a1'));
```

- `textPart(text, opts?)` / `reasoningPart(text, opts?)` — `opts` accepts `{ id?, status?, metadata? }`; an `id` is generated when omitted.
- `nextPartId(prefix?)` — collision-resistant id generator (`part-<n>`).
- `getMessageText(message)` — concatenates all `text` parts.

### Streaming & updating parts

Append and patch parts by id instead of rewriting the whole message:

| Method (on `<i-chat>` / `<i-chat-messages>`) | Description |
|----------------------------------------------|-------------|
| `appendPart(messageId, part)` | Push a new part (e.g. start a streaming `text` part, add a `tool-call`). |
| `updatePart(messageId, partId, patch)` | Shallow-merge `patch` into the matching part (e.g. grow `text`, flip `status`). Keyed by `id`, so stateful elements survive. |
| `updateToolCall(messageId, partId, patch)` | Convenience wrapper around `updatePart` for `tool-call` parts. |

```javascript
const id = 'a2';
chat.addMessage({ id, role: 'assistant', parts: [], streaming: true, timestamp: Date.now() });

// Stream a text part:
chat.appendPart(id, textPart('', { id: 'body', status: 'streaming' }));
let acc = '';
for await (const chunk of stream) {
  acc += chunk;
  chat.updatePart(id, 'body', { text: acc });
}
chat.updatePart(id, 'body', { status: 'complete' });
chat.updateMessage(id, { streaming: false });
```
