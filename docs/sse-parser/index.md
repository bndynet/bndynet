# @bndynet/sse-parser

Zero-dependency TypeScript SDK for parsing **Server-Sent Events (SSE)** and **NDJSON** streams, with built-in adapters for common AI APIs.

## Features

- WHATWG-spec-compliant SSE parser (CR/LF/CRLF, BOM, multi-line data, event/id/retry)
- NDJSON parser for Ollama-style streams
- Accepts a `fetch` Response, a raw `ReadableStream`, **or** any `AsyncIterable` of bytes/text — bridged to an `AsyncGenerator` with timeout and AbortSignal support
- AI adapters that normalize vendor payloads into a unified `ChatStreamEvent`:
  - **OpenAI** — Chat Completions (`/v1/chat/completions`) and the newer Responses API (`/v1/responses`)
  - OpenAI-compatible: Azure, Groq, Together, vLLM, LiteLLM
  - **Anthropic** (Claude Messages API)
  - **Google Gemini**
  - **Ollama**
- Full TypeScript types, zero runtime dependencies

## Install

```bash
npm install @bndynet/sse-parser
```

## Quick Start

### Unified entry (`chatStream`)

If you'd rather not import a per-vendor function, use `chatStream` and pass an
explicit `provider`:

```typescript
import { chatStream } from '@bndynet/sse-parser';

for await (const event of chatStream(res, { provider: 'openai' })) {
  if (event.type === 'text') process.stdout.write(event.content);
}
```

Provider cheat sheet — pick the one matching the endpoint you call:

| API / endpoint | `provider` |
|---|---|
| OpenAI Chat Completions (`/v1/chat/completions`), Azure, Groq, Together, vLLM, LiteLLM | `'openai'` |
| OpenAI Responses (`/v1/responses`) | `'openai-responses'` |
| Anthropic Messages (`/v1/messages`) | `'anthropic'` |
| Google Gemini (`:streamGenerateContent?alt=sse`) | `'gemini'` |
| Ollama (`/api/chat`, NDJSON) | `'ollama'` |

`chatStream` accepts the same `StreamReaderOptions` (`timeoutMs`, `signal`,
`doneSentinel`) as the individual adapters.

### OpenAI

```typescript
import { openaiStream } from '@bndynet/sse-parser';

const res = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Hello' }],
    stream: true,
  }),
});

for await (const event of openaiStream(res)) {
  switch (event.type) {
    case 'text':
      process.stdout.write(event.content);
      break;
    case 'error':
      console.error(event.message);
      break;
    case 'done':
      console.log('\nUsage:', event.usage);
      break;
  }
}
```

### OpenAI Responses API

```typescript
import { openaiResponsesStream } from '@bndynet/sse-parser';

const res = await fetch('https://api.openai.com/v1/responses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    input: 'Hello',
    stream: true,
  }),
});

for await (const event of openaiResponsesStream(res)) {
  if (event.type === 'text') process.stdout.write(event.content);
  if (event.type === 'reasoning') process.stdout.write(event.content);
}
```

### Anthropic

```typescript
import { anthropicStream } from '@bndynet/sse-parser';

const res = await fetch('https://api.anthropic.com/v1/messages', { /* ... */ });

for await (const event of anthropicStream(res)) {
  if (event.type === 'text') process.stdout.write(event.content);
}
```

### Google Gemini

```typescript
import { geminiStream } from '@bndynet/sse-parser';

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
  { method: 'POST', /* ... */ }
);

for await (const event of geminiStream(res)) {
  if (event.type === 'text') process.stdout.write(event.content);
}
```

### Ollama (NDJSON)

```typescript
import { ollamaStream } from '@bndynet/sse-parser';

const res = await fetch('http://localhost:11434/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    model: 'llama3',
    messages: [{ role: 'user', content: 'Hello' }],
  }),
});

for await (const event of ollamaStream(res)) {
  if (event.type === 'text') process.stdout.write(event.content);
}
```

### Low-level SSE parsing

```typescript
import { readSSEStream } from '@bndynet/sse-parser';

const res = await fetch('/my-sse-endpoint');

for await (const sseEvent of readSSEStream(res)) {
  console.log(sseEvent.event, sseEvent.data, sseEvent.id);
}
```

## Input sources

Every reader and adapter (`readSSEStream`, `readNDJSONStream`, `openaiStream`,
`chatStream`, …) accepts a `StreamInput`:

```typescript
type StreamInput =
  | Response                              // fetch Response — HTTP status is validated
  | ReadableStream<Uint8Array>            // raw Web stream (e.g. response.body, pipeThrough output)
  | AsyncIterable<Uint8Array | string>;   // Node stream, file stream, child process, test stub…
```

A `fetch` Response is the common case in the browser. The other two unlock
non-fetch sources — useful in Angular (`HttpClient` doesn't hand you a
Response), SSR/Node (where the upstream may be a Node `http`/`undici` stream),
and tests (feed an `async function*` instead of mocking a whole Response).

> When you pass a `ReadableStream` or `AsyncIterable`, no HTTP status check is
> performed (there's no transport metadata to inspect) — the caller is
> responsible for any connection/status validation.

```typescript
import { openaiStream } from '@bndynet/sse-parser';

// 1. A raw ReadableStream (e.g. after a transform)
const stream = response.body!.pipeThrough(new DecompressionStream('gzip'));
for await (const ev of openaiStream(stream)) { /* ... */ }

// 2. Any AsyncIterable — a Node response stream, or a test stub
async function* fake() {
  yield 'data: {"choices":[{"delta":{"content":"hi"}}]}\n\n';
  yield 'data: [DONE]\n\n';
}
for await (const ev of openaiStream(fake())) { /* ... */ }
```

## Unified `ChatStreamEvent`

All AI adapters yield the same discriminated union:

```typescript
type ChatStreamEvent =
  | { type: 'text'; content: string; raw?: unknown }
  | { type: 'reasoning'; content: string; raw?: unknown }
  | { type: 'tool_call'; id: string; name: string; arguments: string; index?: number; raw?: unknown }
  | { type: 'error'; message: string; code?: string; raw?: unknown }
  | { type: 'done'; usage?: TokenUsage; finishReason?: string; raw?: unknown };
```

Every event carries an optional `raw` — the vendor's parsed JSON chunk that
produced it — so you can read provider-specific fields (logprobs, citations,
annotations, etc.) that the normalized shape omits. The terminal `done` event
also exposes the vendor's `finishReason` when available.

### Reassembling streamed tool calls

Vendors stream a tool call's `id`/`name` once and its `arguments` across many
chunks. Group fragments by `index` to rebuild each call:

```typescript
const calls = new Map<number, { id: string; name: string; arguments: string }>();

for await (const event of openaiStream(res)) {
  if (event.type === 'tool_call') {
    const i = event.index ?? 0;
    const call = calls.get(i) ?? { id: '', name: '', arguments: '' };
    if (event.id) call.id = event.id;
    if (event.name) call.name = event.name;
    call.arguments += event.arguments;
    calls.set(i, call);
  }
}
// calls now holds the fully reassembled tool calls
```

### `done` is emitted exactly once

Every adapter yields a single terminal `done` event when the stream completes
successfully, carrying the final `usage` when the vendor provides it. (Errors
surface as non-fatal `error` events or, for connection/timeout failures, throw.)

## Error Handling

The SDK provides a typed error hierarchy — all extend from `SSEError`:

```typescript
import {
  SSEError,            // base class
  SSEParseError,       // malformed SSE line or invalid JSON
  SSEConnectionError,  // network failure, HTTP non-2xx, abort
  SSETimeoutError,     // idle timeout exceeded
} from '@bndynet/sse-parser';
```

### Fatal vs non-fatal errors

| Scenario | Error type | Fatal? | Behavior |
|---|---|---|---|
| HTTP non-2xx response | `SSEConnectionError` | Yes | Thrown before any event is yielded |
| Network disconnection | `SSEConnectionError` | Yes | Generator throws, `for await` exits |
| `AbortSignal` aborted | `SSEConnectionError` | Yes | Generator throws, `for await` exits |
| Idle timeout exceeded | `SSETimeoutError` | Yes | Generator throws, `for await` exits |
| Bad JSON in one `data:` line | — | No | Adapter yields `{ type: 'error' }`, stream continues |
| API-level error (e.g. rate limit) | — | No | Adapter yields `{ type: 'error', code }`, stream continues |

### Catching fatal errors

```typescript
import {
  openaiStream,
  SSEConnectionError,
  SSETimeoutError,
} from '@bndynet/sse-parser';

try {
  for await (const event of openaiStream(res)) {
    if (event.type === 'error') {
      // Non-fatal: bad JSON or API error — stream continues
      console.warn('API error:', event.message, event.code);
    }
    if (event.type === 'text') {
      process.stdout.write(event.content);
    }
  }
} catch (err) {
  if (err instanceof SSETimeoutError) {
    console.error(`Stream timed out after ${err.timeoutMs}ms`);
  } else if (err instanceof SSEConnectionError) {
    console.error(`Connection failed (HTTP ${err.status}):`, err.message);
  }
}
```

### `SSEParseError` details

When the low-level parser encounters a malformed line, it creates an `SSEParseError` with the raw line attached:

```typescript
import { SSEParser, SSEParseError } from '@bndynet/sse-parser';

const parser = new SSEParser({
  onEvent(evt) { /* ... */ },
  onError(err) {
    if (err instanceof SSEParseError) {
      console.warn('Bad line:', err.line, '—', err.message);
    }
  },
});
```

### Reconnection hints (`retry:`)

A `retry:` field does not produce a standalone event. Its reconnection-time
hint (ms) is delivered via the optional `onRetry` callback and is also attached
to the next dispatched event's `retry` field:

```typescript
const parser = new SSEParser({
  onEvent(evt) {
    if (evt.retry !== undefined) console.log('server suggests retry in', evt.retry, 'ms');
  },
  onRetry(ms) { /* update your reconnect backoff */ },
});
```

## Options

All stream readers and adapters accept an optional `StreamReaderOptions`:

```typescript
interface StreamReaderOptions {
  /** Idle timeout in ms. Default: 60000. Set 0 to disable. */
  timeoutMs?: number;
  /** AbortSignal for external cancellation. */
  signal?: AbortSignal;
  /** Sentinel that ends the stream. Default: "[DONE]". Set null to disable. */
  doneSentinel?: string | null;
}
```

### AbortController cancellation

```typescript
const controller = new AbortController();
setTimeout(() => controller.abort(), 10_000); // cancel after 10s

try {
  for await (const ev of openaiStream(res, { signal: controller.signal })) {
    // ...
  }
} catch (err) {
  // SSEConnectionError with message "Stream aborted by caller"
}
```

### Custom timeout

```typescript
// 2 minute timeout
for await (const ev of openaiStream(res, { timeoutMs: 120_000 })) { /* ... */ }

// No timeout at all
for await (const ev of openaiStream(res, { timeoutMs: 0 })) { /* ... */ }
```

### Custom done sentinel

```typescript
// Disable [DONE] detection (e.g. for Anthropic / Gemini — adapters do this automatically)
for await (const sse of readSSEStream(res, { doneSentinel: null })) { /* ... */ }

// Use a different sentinel
for await (const sse of readSSEStream(res, { doneSentinel: '[END]' })) { /* ... */ }
```

## API

| Export | Description |
|---|---|
| `SSEParser` | Low-level push parser — call `feed(chunk)` |
| `NDJSONParser` | Low-level NDJSON push parser |
| `readSSEStream(input, opts?)` | `AsyncGenerator<SSEEvent>` from a `StreamInput` |
| `readNDJSONStream(input, opts?)` | `AsyncGenerator<T>` from a `StreamInput` |
| `chatStream(input, { provider, ...opts })` | Unified entry — dispatches to the adapter for `provider` |
| `openaiStream(res, opts?)` | OpenAI Chat Completions adapter → `AsyncGenerator<ChatStreamEvent>` |
| `openaiResponsesStream(res, opts?)` | OpenAI Responses API adapter |
| `anthropicStream(res, opts?)` | Anthropic adapter |
| `geminiStream(res, opts?)` | Gemini adapter |
| `ollamaStream(res, opts?)` | Ollama adapter |
| `SSEError` | Base error class |
| `SSEParseError` | Malformed SSE / JSON — has `.line` |
| `SSEConnectionError` | Network / HTTP / abort — has `.status?` |
| `SSETimeoutError` | Idle timeout — has `.timeoutMs` |

## License

MIT
