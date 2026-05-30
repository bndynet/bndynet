# @bndynet/sse-parser

Zero-dependency TypeScript SDK for parsing **Server-Sent Events (SSE)** and **NDJSON** streams, with built-in adapters for common AI APIs.

## Features

- WHATWG-spec-compliant SSE parser (CR/LF/CRLF, BOM, multi-line data, event/id/retry)
- NDJSON parser for Ollama-style streams
- `fetch` Response → `AsyncGenerator` bridge with timeout and AbortSignal support
- AI adapters that normalize vendor payloads into a unified `ChatStreamEvent`:
  - **OpenAI** (and compatible: Azure, Groq, Together, vLLM, LiteLLM)
  - **Anthropic** (Claude Messages API)
  - **Google Gemini**
  - **Ollama**
- Full TypeScript types, zero runtime dependencies

## Install

```bash
npm install @bndynet/sse-parser
```

## Quick Start

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

## Unified `ChatStreamEvent`

All AI adapters yield the same discriminated union:

```typescript
type ChatStreamEvent =
  | { type: 'text'; content: string }
  | { type: 'reasoning'; content: string }
  | { type: 'tool_call'; id: string; name: string; arguments: string }
  | { type: 'error'; message: string; code?: string }
  | { type: 'done'; usage?: TokenUsage };
```

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
| `readSSEStream(res, opts?)` | `AsyncGenerator<SSEEvent>` from fetch Response |
| `readNDJSONStream(res, opts?)` | `AsyncGenerator<T>` from fetch Response |
| `openaiStream(res, opts?)` | OpenAI adapter → `AsyncGenerator<ChatStreamEvent>` |
| `anthropicStream(res, opts?)` | Anthropic adapter |
| `geminiStream(res, opts?)` | Gemini adapter |
| `ollamaStream(res, opts?)` | Ollama adapter |
| `SSEError` | Base error class |
| `SSEParseError` | Malformed SSE / JSON — has `.line` |
| `SSEConnectionError` | Network / HTTP / abort — has `.status?` |
| `SSETimeoutError` | Idle timeout — has `.timeoutMs` |

## License

MIT
