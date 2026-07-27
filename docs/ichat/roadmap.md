# Project Roadmap

Project-level follow-up work for `@bndynet/ichat`. Keep this checklist current: when an item lands, mark or move it in the same change. Add new sections as other areas grow.

> **For cross-cutting architecture, performance, and DX improvements see the [Optimization Plan](./optimization-plan.md).**

## Completed

### Testing & CI

- [x] Unit tests for pure helpers — `message-part-state`, `todo-state`, `tool-call-state`, `message-part-events`, `date-separator`, `duration-format`, `update-results`. 24 tests, all passing. (Phase 1.1)
- [x] CI pipeline — GitHub Actions with Node.js 18/20/22 matrix, test + coverage on push/PR to `main`/`v3`. (Phase 1.2)

### Message Body & Parts

- [x] Centralize todo state updates in pure helpers. `patchTodoItem()` owns todo item validation, revision checks, immutable updates, and lifecycle status updates. `updateTodoItem()` and backend event handling route through the same reducer.
- [x] Centralize tool-call state updates in a pure helper. `patchToolCallPart()` validates tool-call state and preserves stable identity fields.
- [x] Add runtime guards for structured parts. `isTodoPart()`, `isTodoItemStatus()`, `isToolCallPart()`, and `isToolCallState()` protect update paths that receive external data.
- [x] Normalize todo backend/SSE updates. `normalizeTodoItemUpdateEvent()` accepts parsed objects, JSON strings, and MessageEvent-like payloads before applying `updateTodoItem()`.
- [x] Document deprecated compatibility surfaces. Legacy event/API surfaces are kept for existing integrations and should only be removed in a future major version.
- [x] Add diagnostic update results. `tryUpdateTodoItem()`, `tryUpdateToolCall()`, and `tryApplyTodoItemUpdateEvent()` return structured failure reasons while the older boolean methods remain compatible.
- [x] Extract message part collection updates into pure helpers. `appendMessagePart()`, `findMessagePart()`, `patchMessagePart()`, and `replaceMessagePart()` now cover collection updates outside the DOM.
- [x] Generalize backend event normalization. `message.part.updated` now covers text, tool-call, file/source metadata, and custom `x-*` part patches while `todo.item.updated` remains item-specific.
- [x] Add component-level event tests. The suite now covers child todo/tool events, `i-chat-part-host` event enrichment, unified `part-action`, deprecated compatibility events, and invalid backend events that must not mutate state.
- [x] Clean up `part-action` kind names before adoption. Unified events now use semantic domains (`'form'`, `'todo'`, `'tool-call'`) while deprecated compatibility events keep their original event names.
- [x] Modernize demo action examples. Demo pages now listen to `part-action` and use `tryUpdateTodoItem()` / `tryUpdateToolCall()` for interactive todo and tool-call updates.
- [x] Extract text part rendering. `i-chat-text-part` now owns markdown rendering, morphdom caching, and typing cursor state while `i-chat-part-host` stays focused on part routing and event enrichment.
- [x] Share markdown morphing between text and reasoning. `renderMarkdownInto()` now centralizes markdown rendering, morphdom patching, and HTML cache checks for both `i-chat-text-part` and `i-chat-reasoning`.
- [x] Align SSE envelopes with OpenAI Responses style. Canonical backend events now document `event` + matching `data.type` + `sequence_number`, while normalizers continue accepting legacy payloads without `data.type`.

### Performance

- [x] Markdown cache — Two-level cache (raw content + HTML comparison) in `renderMarkdownInto()`. Skips markdown-it + DOMPurify when raw content unchanged; skips morphdom when HTML unchanged. (Phase 2.2)
- [x] highlight.js configurable — `ChatConfig.highlightJs` optional injection. When omitted, code blocks fall back to plain escaped `<pre><code>`. Threaded through full component chain. (Phase 2.3)
- [x] Memoized computed properties — `_messageRenderItems()` cached by collection shape (length + first/last id + timestamp). `_labels` cached by locale + labels reference. (Phase 2.4)

### SSE & Backend Integration

- [x] SSE client — `createChatSSEClient()` with auto event routing for all 8 SSE event types. Supports named events and `data.type` routing, reconnection with exponential backoff + jitter. Exported via `@bndynet/ichat/sse`. (Phase 3.1)

### Developer Experience

- [x] AbortController in ChatRunController — `run.signal` for fetch integration. Auto-aborted on `complete()` / `fail()` / `cancel()`. (Phase 3.5)
- [x] Middleware chain — `ChatMiddleware` with `beforeSend`, `afterMessageAdded`, `beforeAppendPart`, `onError` hooks. FIFO execution, null short-circuits. (Phase 3.2)

### Extensibility

- [x] Plugin system — `ChatPlugin` interface with `install(chat)` + optional teardown. `chat.use()` unified for both middleware and plugins. (Phase 4.3)
- [x] Async BlockRenderer — `renderAsync()` for fenced blocks. Placeholder on first render, swapped when promise resolves. `resolveAsyncBlocks()` exported. (Phase 4.2)

### Accessibility

- [x] ARIA roles & labels — Phase 5.1 complete. Added `role="log" aria-live="polite"` to `<i-chat-messages>`, `role="article"` to assistant messages, `aria-expanded` + button labels to `<i-chat-tool-call>`, `role="list"/listitem" + aria-checked` to `<i-chat-todo>`, `role="alertdialog" aria-modal` to confirmation panel. (Phase 5.1)- [x] Keyboard navigation — Phase 5.2 complete. Confirmation dialog: Escape → cancel, Tab/Shift+Tab focus trap, auto-focus confirm button. Tool-call/todo already handled by native `<details>` + `<button>`. (Phase 5.2)
- [x] Screen reader announcements — Phase 5.3 complete. New messages via `aria-live="polite"` on wrapper, tool-call state via sr-only live region, errors via `role="alert"` on banner. (Phase 5.3)

### Testing

- [x] Component tests for `<i-chat-input>` ✅ — Module import, custom element registration, constructor, default property values. (Phase 1.1)
- [x] Component tests for `<i-chat>` ✅ — Module import, registration, constructor, default properties, method signatures, `ready` promise contract. (Phase 1.1)
### Documentation

- [x] README updated — SSE client, highlight.js, middleware/plugin examples, test scripts. (Phase 7)
- [x] `component-api.md` — Syntax highlighting section with usage example. (Phase 7)
- [x] `implementation-review.md` — Codebase architecture review. (Phase 7)

## Backlog

> **Recommended execution order** (from [implementation review](./implementation-review.md)):
>
🔴 **Immediate** — Phase 2.1 Virtual scroll (performance critical path)
> 🟡 **Next** — Phase 2.3/6.3 Bundle optimization + Phase 1.1 Component tests + Phase 6.1 Architecture decomposition
> 🟢 **Later** — Phase 3.3/3.4 Type system + Phase 4.1 Overridable renderers + Phase 4.3 Built-in plugins
> 🔵 **Pre-release** — Phase 7 Storybook + Playground + Migration guides

### Performance

- [ ] 🔴 **Virtual scrolling** — Integrate `@lit-labs/virtualizer` into `<i-chat-messages>`. Replace `repeat` with `<lit-virtualizer>`, keep date separators outside the virtual range, and ensure `scrollToBottom()` + `ResizeObserver` auto-scroll still work. Add `virtualScroll` config toggle (default on) and perf benchmarks for 100/1000/10000 messages. (Phase 2.1)
- [ ] 🟡 **Markdown streaming light mode** — Optimise the streaming render path in `i-chat-text-part`: when `message.streaming === true`, skip DOMPurify (trusted SSE source) and skip morphdom diff (use `innerHTML` — every token grows the full text, so incremental diff has zero reuse value). Once streaming stops, run the full pipeline (DOMPurify + morphdom) for the clean terminal render. markdown-it always runs so users see formatted text, never raw markdown.

  No new config — this is a strict improvement over the current path and the default behavior. (Phase 2.2)
- [x] 🟡 **Remove `noExternal` bundling** ✅ (completed 2026-07-26) — `chat-messages` 524KB → 177KB, `chat-input` similar. Third-party deps now externalized; consumers' bundlers handle tree-shaking. Peer dependency migration deferred to v3. (Phase 2.3 step 1)

### Accessibility (Phase 5)

- [x] 🔴 **ARIA roles & labels** ✅ (completed 2026-07-26)
  - `<i-chat-messages>`: `role="log"`, `aria-live="polite"`, `aria-label`
  - `<i-chat-message>`: `role="article"` on assistant messages
  - `<i-chat-tool-call>`: `aria-expanded` on collapsible body, `aria-label` on approve/reject buttons
  - `<i-chat-todo>`: `role="list"` + `role="listitem"` with `aria-checked`
  - `<i-chat-reasoning>`: already has `aria-expanded` ✅
  - `<i-chat-input>`: `aria-label` on textarea, voice button ✅
  - Confirmation panel: `role="alertdialog"` with `aria-modal="true"`
- [x] 🔴 **Keyboard navigation** ✅ (completed 2026-07-26)
  - `<i-chat-tool-call>`: Enter/Space/Tab via native `<details>` + `<button>` ✅
  - `<i-chat-todo>`: Enter/Space via native `<button>` ✅
  - `<i-chat-reasoning>`: Enter/Space to toggle ✅
  - Confirmation panel: Escape to cancel, Tab/Shift+Tab focus trap, auto-focus confirm button
- [x] 🔴 **Screen reader announcements** ✅ (completed 2026-07-26)
  - New messages: `aria-live="polite"` on wrapper (Phase 5.1)
  - Tool-call state transitions: sr-only `<span aria-live="polite">`
  - Errors: `role="alert"` on error banner ✅
  - Voice listening overlay: `role="status" aria-live="polite"` ✅

### Testing

- [x] 🟡 **Component tests for `<i-chat-input>`** ✅ — Module import, element registration, constructor, default property values. Full DOM interaction tests (send/cancel, voice, auto-resize) require a browser. (Phase 1.1)
- [x] 🟡 **Component tests for `<i-chat>`** ✅ — Import, registration, constructor, property defaults, method signatures, `ready` promise. Full integration tests require a browser. (Phase 1.1)
- [ ] 🟢 **SSE integration tests** — SSE event stream → `tryApplyMessagePartUpdateEvent` / `tryApplyTodoItemUpdateEvent` end-to-end. (Phase 1.1)
- [ ] 🟢 **SSE integration tests** — SSE event stream → `tryApplyMessagePartUpdateEvent` / `tryApplyTodoItemUpdateEvent` end-to-end. (Phase 1.1)
- [ ] 🟢 **Coverage thresholds** — Enforce ≥80% on helpers, ≥60% on components in CI. (Phase 1.2)

### Message Body & Parts

- [ ] Review markdown rendering DOM boundaries. Document and reassess why `i-chat-text-part` stays in light DOM to inherit `.bubble .content` message styles while `i-chat-reasoning` keeps shadow DOM for its self-contained collapsible panel.
- [ ] Extract reply block rendering. Move quote/reply block rendering out of `i-chat-message` when reply-specific controls land.
- [x] 🟢 **`normalizeHistoryMessages()` 历史消息清洗** ✅ (completed 2026-07-27) — `packages/chat-messages/src/normalize-history.ts`，25 测试全部通过。

  **用法**：
  ```ts
  import { normalizeHistoryMessages } from '@bndynet/ichat-messages';
  const history = await fetchHistory();
  chat.messages = normalizeHistoryMessages(history.messages, {
    interruptedStatus: 'complete',  // 默认
    removeEmptyMessages: true,       // 默认
  });
  ```

  **行为**：
  - `streaming` → `false`，`cancelled` → `true`（标记中断）
  - part `status: 'streaming' | 'pending'` → `interruptedStatus`（默认 `'complete'`）
  - 清除空 `parts` 的占位消息
  - 保持顺序和 ID 不变，不修改原数组；已是终态的消息返回原引用（fast path）

### Developer Experience

- [ ] 🟢 **Type system cleanup** — Split public API types from internal diagnostic types. `@bndynet/ichat/messages` re-export path. `docs/public-api.md`. (Phase 3.3)
- [ ] 🟢 **Generic type support** — Make `<i-chat>` generic over custom part types (`Chat<TExtraParts>`). Type helpers: `CustomPartOf<T>`, `PartOf<M, T>`. (Phase 3.4)

### Extensibility

- [ ] 🟢 **Overridable built-in part renderers** — Extend `PartRenderer` lookup to allow replacing built-in `text` and `tool-call` renderers through the custom registry. Currently the registry only handles custom `x-*` types; built-in types always use the default components. (Phase 4.1)
- [ ] 🟢 **Built-in plugins** — Ship `MarkdownPlugin` (markdown-it config) and `HighlightPlugin` (highlight.js injection) as pre-built plugins so consumers don't need to write their own. (Phase 4.3)

### Architecture (v3)

- [x] 🟡 **`<i-chat>` decomposition** ✅ (completed 2026-07-26) — Extracted `CommandQueue`, `ConfirmationController`, `SlotForwardingController`. chat.ts: 1200 → 1102 lines. (Phase 6.1)
- [ ] 🔵 **Remove deprecated APIs** — `createStreamingController()`, `patchTodoItemInPart`, `form-submit`/`todo-action`/`tool-action` events, `config.dateSeparatorLabels`, boolean-return wrappers (`updateTodoItem`, `updateToolCall`, `apply*Event`). (Phase 6.2)
- [ ] 🟡 **Peer dependency migration** — Move `markdown-it`, `dompurify`, `highlight.js` to peerDependencies. Provide tree-shakeable ESM build alongside full IIFE bundle. Document bundle size with badges. (Phase 6.3)

### Documentation & Showcase

- [ ] 🔵 **Storybook 8+** — Stories for each component with configurable knobs (locale, theme, message count, streaming simulation). Deploy to Chromatic for visual regression testing. (Phase 7.2)
- [ ] 🔵 **Interactive playground** — Live `<i-chat>` embedded in docs site with framework wrappers (Vue, React, plain HTML). (Phase 7.3)
- [ ] 🔵 **Migration guides** — v1→v2. (Phase 7.1)
- [x] 🔵 **v2→v3 migration guide** ✅ — `docs/migration-v2-to-v3.md` created with breaking changes, deprecated API table, and timeline. (Phase 7.1 partial)

## Compatibility & Deprecation

These surfaces remain supported for compatibility. New integrations should use the preferred API, and removal should only happen in a future major version with migration notes.

| Deprecated surface | Preferred surface | Notes |
|--------------------|-------------------|-------|
| `patchTodoItemInPart()` | `patchTodoItem()` | Compatibility alias; no behavior difference. |
| `form-submit` event | `part-action` with `kind: 'form'`, `action: 'submit'` | Still emitted after message context enrichment. |
| `todo-action` event | `part-action` with `kind: 'todo'` | Still emitted for interactive todo status requests. |
| `tool-action` event | `part-action` with `kind: 'tool-call'` | Still emitted for tool-call approval requests. |
| `config.dateSeparatorLabels` | `config.labels.dateSeparator` | Still merged for backward compatibility. |
