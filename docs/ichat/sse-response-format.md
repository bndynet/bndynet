# SSE Response Format

Recommended Server-Sent Events (SSE) contract for backends that stream
`@bndynet/ichat` messages. The payloads below mirror the public
`ChatMessage` / `MessagePart` data model.

## Transport

Return an SSE stream from your backend:

```http
Content-Type: text/event-stream; charset=utf-8
Cache-Control: no-cache
Connection: keep-alive
```

Each frame should use a named `event` and a JSON `data` payload. The canonical
format is aligned with OpenAI Responses streaming events: repeat the event name
in `data.type` and include a monotonic `sequence_number` when the backend can
produce one. This makes each JSON payload self-describing for logs, tests,
non-SSE transports, and replay.

For compatibility, the normalizers still accept payloads without `data.type`.
When a named SSE `event` and `data.type` are both present, they must match.

```text
event: message.part.updated
id: 7
data: {"type":"message.part.updated","messageId":"assistant-1","partId":"body","patch":{"text":"Hello"},"sequence_number":7}

```

## Event Summary

| Event | Backend data payload, besides `type` / `sequence_number` | Frontend action |
|-------|--------------------------------------------------------|-----------------|
| `message.created` | `{ message: ChatMessage }` | `chat.addMessage(message)` |
| `message.updated` | `{ messageId, patch }` | `chat.updateMessage(messageId, patch)` |
| `message.part.appended` | `{ messageId, part: MessagePart }` | `chat.appendPart(messageId, part)` |
| `message.part.updated` | `{ messageId, partId, patch }` | `chat.tryApplyMessagePartUpdateEvent(event)` |
| `todo.item.updated` | `{ messageId, partId, itemId, status?, title?, description?, revision? }` | `chat.tryApplyTodoItemUpdateEvent(event)` |
| `message.completed` | `{ messageId, duration? }` | Mark the message and streaming parts complete |
| `message.error` | `{ messageId?, error }` | `chat.updateMessage(...)` or `chat.addErrorMessage(...)` |
| `stream.done` | `{ messageId? }` | Close the EventSource / request |

`message.part.updated` and `todo.item.updated` are directly normalized by the
library. The other events are a recommended host adapter layer around existing
component methods.

## Event Payload Types

Each `data` payload is a discriminated union keyed by `type`. The common event
metadata is shared, while each event carries the shape needed for that specific
operation.

```typescript
type ChatSseEventEnvelope<TType extends string> = {
  type: TType;
  sequence_number?: number;
};

type ChatSseEvent =
  | MessageCreatedEvent
  | MessageUpdatedEvent
  | MessagePartAppendedEvent
  | MessagePartUpdatedEvent
  | TodoItemUpdatedEvent
  | MessageCompletedEvent
  | MessageErrorEvent
  | StreamDoneEvent;

type MessageCreatedEvent =
  ChatSseEventEnvelope<'message.created'> & {
    message: ChatMessage;
  };

type MessageUpdatedEvent =
  ChatSseEventEnvelope<'message.updated'> & {
    messageId: string;
    patch: Partial<ChatMessage>;
  };

type MessagePartAppendedEvent =
  ChatSseEventEnvelope<'message.part.appended'> & {
    messageId: string;
    part: MessagePart;
  };

type MessagePartUpdatedEvent =
  ChatSseEventEnvelope<'message.part.updated'> & {
    messageId: string;
    partId: string;
    patch: Partial<MessagePart>;
  };

type TodoItemUpdatedEvent =
  ChatSseEventEnvelope<'todo.item.updated'> & {
    messageId: string;
    partId: string;
    itemId: string;
    status?: TodoItemStatus;
    title?: string;
    description?: string;
    revision?: number;
  };

type MessageCompletedEvent =
  ChatSseEventEnvelope<'message.completed'> & {
    messageId: string;
    duration?: number;
  };

type MessageErrorEvent =
  ChatSseEventEnvelope<'message.error'> & {
    messageId?: string;
    error: string;
  };

type StreamDoneEvent =
  ChatSseEventEnvelope<'stream.done'> & {
    messageId?: string;
  };
```

Use the event-specific fields intentionally: `message` creates a full row,
`part` appends one body part, `patch` updates an existing object, and todo item
fields update one item inside a todo part.

## Client Adapter Example

```javascript
const source = new EventSource('/api/chat/stream');

source.addEventListener('message.created', (event) => {
  const { message } = parseSseData(event);
  chat.addMessage(message);
});

source.addEventListener('message.updated', (event) => {
  const { messageId, patch } = parseSseData(event);
  chat.updateMessage(messageId, patch);
});

source.addEventListener('message.part.appended', (event) => {
  const { messageId, part } = parseSseData(event);
  chat.appendPart(messageId, part);
});

source.addEventListener('message.part.updated', (event) => {
  const result = chat.tryApplyMessagePartUpdateEvent(event);
  if (!result.ok) console.warn('Part update ignored:', result.reason);
});

source.addEventListener('todo.item.updated', (event) => {
  const result = chat.tryApplyTodoItemUpdateEvent(event);
  if (!result.ok) console.warn('Todo update ignored:', result.reason);
});

source.addEventListener('message.completed', (event) => {
  const { messageId, duration } = parseSseData(event);
  chat.updateMessage(messageId, { streaming: false, duration });
  chat.tryUpdatePart(messageId, 'reasoning', { status: 'complete' });
  chat.tryUpdatePart(messageId, 'body', { status: 'complete' });
});

source.addEventListener('message.error', (event) => {
  const { messageId, error } = parseSseData(event);
  if (messageId) chat.updateMessage(messageId, { streaming: false, error });
  else chat.addErrorMessage(error);
});

source.addEventListener('stream.done', () => {
  source.close();
});

function parseSseData(event) {
  const payload = JSON.parse(event.data);
  if (payload.type && event.type !== 'message' && payload.type !== event.type) {
    throw new Error(`SSE event mismatch: ${event.type} !== ${payload.type}`);
  }
  return payload;
}
```

## Full Stream Example

This example streams one assistant response with reasoning, a todo plan, a tool
call, citations, an attachment, and final text.

```text
event: message.created
id: 1
data: {"type":"message.created","message":{"id":"assistant-1","role":"assistant","streaming":true,"timestamp":1720000000000,"parts":[]},"sequence_number":1}

event: message.part.appended
id: 2
data: {"type":"message.part.appended","messageId":"assistant-1","part":{"type":"reasoning","id":"reasoning","status":"streaming","text":""},"sequence_number":2}

event: message.part.updated
id: 3
data: {"type":"message.part.updated","messageId":"assistant-1","partId":"reasoning","patch":{"text":"I should inspect the request, plan the response format, then produce a concise answer.","status":"streaming"},"sequence_number":3}

event: message.part.appended
id: 4
data: {"type":"message.part.appended","messageId":"assistant-1","part":{"type":"todo","id":"plan","title":"Response plan","status":"streaming","revision":0,"items":[{"id":"model","title":"Map message model","status":"active"},{"id":"events","title":"Define SSE events","status":"pending"},{"id":"example","title":"Return example stream","status":"pending"}]},"sequence_number":4}

event: todo.item.updated
id: 5
data: {"type":"todo.item.updated","messageId":"assistant-1","partId":"plan","itemId":"model","status":"done","revision":1,"sequence_number":5}

event: todo.item.updated
id: 6
data: {"type":"todo.item.updated","messageId":"assistant-1","partId":"plan","itemId":"events","status":"active","revision":2,"sequence_number":6}

event: message.part.appended
id: 7
data: {"type":"message.part.appended","messageId":"assistant-1","part":{"type":"tool-call","id":"tool-search","toolCallId":"call_search_1","toolName":"search_docs","title":"Search docs","state":"input-available","args":{"q":"ichat SSE response format"},"status":"streaming"},"sequence_number":7}

event: message.part.updated
id: 8
data: {"type":"message.part.updated","messageId":"assistant-1","partId":"tool-search","patch":{"state":"executing"},"sequence_number":8}

event: message.part.updated
id: 9
data: {"type":"message.part.updated","messageId":"assistant-1","partId":"tool-search","patch":{"state":"output-available","status":"complete","durationMs":840,"resultParts":[{"type":"text","id":"tool-search-result","text":"Found message model and part update docs."}]},"sequence_number":9}

event: todo.item.updated
id: 10
data: {"type":"todo.item.updated","messageId":"assistant-1","partId":"plan","itemId":"events","status":"done","revision":3,"sequence_number":10}

event: message.part.appended
id: 11
data: {"type":"message.part.appended","messageId":"assistant-1","part":{"type":"source","id":"source-message-model","url":"https://example.com/docs/message-model","title":"Message model","snippet":"Messages are ordered arrays of typed parts."},"sequence_number":11}

event: message.part.appended
id: 12
data: {"type":"message.part.appended","messageId":"assistant-1","part":{"type":"file","id":"file-schema","mediaType":"application/json","url":"https://example.com/schemas/ichat-sse.json","name":"ichat-sse.json","size":4096},"sequence_number":12}

event: message.part.appended
id: 13
data: {"type":"message.part.appended","messageId":"assistant-1","part":{"type":"text","id":"body","status":"streaming","text":""},"sequence_number":13}

event: message.part.updated
id: 14
data: {"type":"message.part.updated","messageId":"assistant-1","partId":"body","patch":{"text":"Use named SSE events and keep message ids plus part ids stable."},"sequence_number":14}

event: message.part.updated
id: 15
data: {"type":"message.part.updated","messageId":"assistant-1","partId":"body","patch":{"text":"Use named SSE events and keep message ids plus part ids stable. Stream text by patching the same `text` part, and update todos with `todo.item.updated`.","status":"complete"},"sequence_number":15}

event: message.part.updated
id: 16
data: {"type":"message.part.updated","messageId":"assistant-1","partId":"reasoning","patch":{"status":"complete"},"sequence_number":16}

event: todo.item.updated
id: 17
data: {"type":"todo.item.updated","messageId":"assistant-1","partId":"plan","itemId":"example","status":"done","revision":4,"sequence_number":17}

event: message.part.updated
id: 18
data: {"type":"message.part.updated","messageId":"assistant-1","partId":"plan","patch":{"status":"complete"},"sequence_number":18}

event: message.completed
id: 19
data: {"type":"message.completed","messageId":"assistant-1","duration":2450,"sequence_number":19}

event: stream.done
id: 20
data: {"type":"stream.done","messageId":"assistant-1","sequence_number":20}

```

## Part Payload Shapes

Use the same shapes as `MessagePart`.

### Text

```json
{"type":"text","id":"body","status":"streaming","text":"Partial answer"}
```

Patch text by id with `event: message.part.updated`:

```json
{"type":"message.part.updated","messageId":"assistant-1","partId":"body","patch":{"text":"Full answer","status":"complete"},"sequence_number":12}
```

### Reasoning

```json
{"type":"reasoning","id":"reasoning","status":"streaming","text":"Thinking..."}
```

Patch reasoning by id with `event: message.part.updated`:

```json
{"type":"message.part.updated","messageId":"assistant-1","partId":"reasoning","patch":{"text":"Updated reasoning","status":"complete"},"sequence_number":13}
```

### Tool Call

```json
{"type":"tool-call","id":"tool-1","toolCallId":"call_1","toolName":"search","state":"input-available","args":{"q":"query"},"approval":"required"}
```

Patch tool-call state by id with `event: message.part.updated`:

```json
{"type":"message.part.updated","messageId":"assistant-1","partId":"tool-1","patch":{"state":"output-available","result":{"ok":true},"status":"complete"},"sequence_number":14}
```

Allowed `state` values:

```text
input-streaming | input-available | executing | output-available | output-error
```

### Todo

```json
{"type":"todo","id":"plan","title":"Plan","status":"streaming","revision":0,"items":[{"id":"step-1","title":"First step","status":"pending"}]}
```

Patch one item with `event: todo.item.updated` and a monotonic `revision`:

```json
{"type":"todo.item.updated","messageId":"assistant-1","partId":"plan","itemId":"step-1","status":"done","revision":1,"sequence_number":15}
```

Allowed item status values:

```text
pending | active | done | error | skipped
```

### File

```json
{"type":"file","id":"image-1","mediaType":"image/png","url":"https://example.com/image.png","name":"image.png","size":102400}
```

Use either `url` or raw base64 `data`.

### Source

```json
{"type":"source","id":"source-1","url":"https://example.com/doc","title":"Reference","snippet":"Relevant excerpt"}
```

### Custom `x-*`

```json
{"type":"x-weather","id":"weather-1","data":{"temperature":21,"unit":"C"}}
```

Register a matching part renderer on the frontend with `registerPartRenderer()`.

## Rules

- Keep `message.id` and every `part.id` stable.
- Keep `data.type` equal to the SSE `event` name. Payloads without `data.type`
  remain supported for compatibility, but the documented format includes it.
- Use a monotonic `sequence_number` for event ordering and replay. It is
  separate from `todo.revision`, which protects todo item state from stale
  writes.
- Use `message.part.appended` to create a new part.
- Use `message.part.updated` to patch an existing part.
- Do not include `id` or `type` inside a `message.part.updated.patch`; the
  normalizer rejects identity/type changes.
- Prefer the explicit `patch` object for `message.part.updated`. Extra top-level
  fields are ignored when `patch` is present.
- Use `todo.item.updated` for individual todo item changes so revision checks
  can reject stale updates.
- For initial history loads, return completed messages over your normal JSON
  API. SSE is best for live responses.
