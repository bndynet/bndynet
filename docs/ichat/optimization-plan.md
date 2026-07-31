# Optimization Plan — Remaining Work

> **Implementation supplement to [roadmap.md](./roadmap.md).** Completed items have been moved to the roadmap's "Completed" section. This file retains only the detailed implementation guidance for work that isn't done yet.

---

## Phase 1 — Foundations (remaining)

### 1.1 Component & integration tests

> **Goal:** add component-level regression coverage after the message-state refactor.

- [ ] **Component tests for `<i-chat-input>`** — `packages/chat-input/test/`
  - send / cancel events
  - disabled state
  - voice recognition lifecycle (mock Web Speech API)
  - auto-resize behaviour
- [ ] **Component tests for `<i-chat>`** — `packages/chat/test/`
  - controlled vs uncontrolled mode
  - slot forwarding (self-avatar, peer-avatar, assistant-avatar, empty, actions, input)
  - confirmation queue (single, FIFO, clear-all)
  - `ready` promise contract
  - pending command replay on first render
  - `createRunController()` lifecycle
- [ ] **Integration tests** — ChatRunController + stream parser → `tryApplyMessagePartUpdateEvent` / `tryApplyTodoItemUpdateEvent` end-to-end

### 1.2 Coverage thresholds

- [ ] Enforce `packages/*/test/` coverage threshold in CI (≥80% helpers, ≥60% components)

---

## Phase 2 — Performance (remaining)

### 2.1 Virtual scrolling

- [ ] Integrate `@lit-labs/virtualizer` (Lit's official virtual scroller) into `<i-chat-messages>`
  - Wrap `repeat` directive with `<lit-virtualizer>`
  - Keep date-separator logic outside the virtual range (separators render unconditionally)
  - Ensure `.scrollToBottom()` still works
  - Ensure `ResizeObserver` auto-scroll still works with virtual items
  - Add `virtualScroll` config option (default on, can disable)
- [ ] Add perf benchmark: 100 / 1000 / 10000 messages render time

### 2.2 Markdown streaming light mode

- [x] During active streaming, skip DOMPurify + morphdom; use `innerHTML` directly ✅ (completed 2026-07-31)
  - Detected via `TextPart.status === 'streaming'` — no new config needed
  - Added `renderMarkdownLight()` in `markdown-renderer.ts` for the streaming path
  - Full pipeline (DOMPurify + `renderMarkdownInto` morphing) runs on terminal render
  - markdown-it always runs so users see formatted text, never raw markdown

## Phase 3 — Developer Experience (remaining)

### 3.2 Generic type support

- [x] Make `<i-chat>` generic over custom part types ✅ (completed 2026-07-31)

  ```typescript
  // Usage:
  type MyParts = { 'x-weather': { temp: number; humidity: number } };
  const chat = document.querySelector('i-chat') as Chat<MyParts>;
  chat.messages[0].parts.forEach(p => {
    if (p.type === 'x-weather') p.data.temp; // typed as number
  });
  ```

  ```typescript
  // Internal implementation:
  class Chat<TExtraParts extends Record<`x-${string}`, unknown> = {}> extends LitElement {
    messages: Array<ChatMessage & { parts: ExtendedMessagePart<TExtraParts>[] }>;
  }
  ```

- [x] Provide type helpers: `CustomPartOf<T>`, `PartOf<M, T>`, `ExtendedMessagePart<T>` ✅

  - `CustomPartOf<T>` — Given a mapping `{ 'x-*': DataType }`, produces a typed `CustomPart` discriminated union.
  - `PartOf<M, T>` — Extract the part(s) matching a given type string from a message's parts array.
  - `ExtendedMessagePart<T>` — Extends the standard `MessagePart` union with typed custom parts.

---

## Current Priority

```
🔴 Phase 2.1 Virtual scroll          (performance critical path)
🟢 Phase 1.1 Integration tests      (regression safety net)
```
