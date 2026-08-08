# Backend quickstart

Paste-and-run adapters for popular AI providers — each is a drop-in replacement for the `streamAssistantReply` stub in the [quick start](../README.md#quick-start-es-modules).

Every recipe follows the same contract with `<i-chat>`:

```typescript
async function* streamAssistantReply(
  prompt: string,
  context: { signal: AbortSignal },
): AsyncGenerator<string>
```

---

## OpenAI

```bash
npm install openai
```

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-…",
  // Required in the browser so the SDK does not throw.
  dangerouslyAllowBrowser: true,
});

// In production, proxy through your own backend instead of exposing the API key:
//   const client = new OpenAI({ baseURL: '/api/openai' });

async function* streamAssistantReply(prompt, { signal }) {
  const stream = await client.chat.completions.create(
    {
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    },
    { signal },
  );

  for await (const chunk of stream) {
    yield chunk.choices[0]?.delta?.content ?? "";
  }
}
```

### Multi-turn

The recipe above is single-turn — it passes one prompt. Build a message history yourself and include it:

```javascript
const history = chat.messages.map((m) => ({
  role: m.role === "self" ? "user" : "assistant",
  content: getMessageText(m),
}));
history.push({ role: "user", content: prompt });

const stream = await client.chat.completions.create(
  {
    model: "gpt-4o",
    messages: history,
    stream: true,
  },
  { signal },
);
```

---

## Anthropic

```bash
npm install @anthropic-ai/sdk
```

```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: "sk-ant-…",
  // Required in the browser so the SDK does not throw.
  dangerouslyAllowBrowser: true,
});

async function* streamAssistantReply(prompt, { signal }) {
  const stream = await client.messages.stream(
    {
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    },
    { signal },
  );

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
```

---

## Ollama (local)

No API key, no network — runs entirely on your machine.

```bash
# One-time: pull a model
ollama pull llama3.2
```

```javascript
async function* streamAssistantReply(prompt, { signal }) {
  const res = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    }),
    signal,
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Ollama delivers one JSON object per line.
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line);
        yield parsed.message?.content ?? "";
      } catch {
        // Non‑JSON keepalive line — ignore.
      }
    }
  }
}
```

---

## Custom WebSocket / SSE

If your backend exposes a custom streaming endpoint, parse its protocol
directly from `fetch`:

```javascript
async function* streamAssistantReply(prompt, { signal }) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
    signal,
  });

  // Server-Sent Events (SSE) — standard `text/event-stream`.
  if (res.headers.get("content-type")?.includes("text/event-stream")) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") return;
          try {
            yield JSON.parse(data).delta ?? "";
          } catch {
            // Keepalive or comment — ignore.
          }
        }
      }
    }
    return;
  }

  // Newline-delimited JSON (NDJSON) — one JSON object per line.
  const text = await res.text();
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    try {
      yield JSON.parse(line).content ?? "";
    } catch {
      // Ignore malformed lines.
    }
  }
}
```

---

## Error handling

All recipes rely on `run.signal` to auto-cancel in-flight requests on cancel
or error — no manual `AbortController` bookkeeping is needed:

```javascript
chat.addEventListener("send", async (e) => {
  const run = chat.createRunController();
  run.start([textPart("", { id: "body", status: "streaming" })]);

  try {
    for await (const chunk of streamAssistantReply(e.detail.content, {
      signal: run.signal,
    })) {
      run.appendText("body", chunk);
    }
    run.updatePart("body", { status: "complete" });
    run.complete();
  } catch (error) {
    // AbortError from run.cancel() / run.signal is expected — do not treat it
    // as a real failure. Anything else is a genuine error.
    if (error instanceof DOMException && error.name === "AbortError") return;
    run.fail(error instanceof Error ? error.message : String(error));
  }
});
```
