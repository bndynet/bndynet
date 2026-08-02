# Project Roadmap

Project-level follow-up work for `@bndynet/ichat`. Keep this checklist current: when an item lands, mark or move it in the same change. Add new sections as other areas grow.

> **For cross-cutting architecture, performance, and DX improvements see the [Optimization Plan](./optimization-plan.md).**

## Completed

### Testing & CI

- [x] Unit tests for pure helpers — `message-part-state`, `todo-state`, `tool-call-state`, `message-part-events`, `date-separator`, `duration-format`, `update-results`. 24 tests, all passing. (Phase 1.1)
- [x] CI pipeline — GitHub Actions with Node.js 18/20/22 matrix, test + coverage on push/PR to `main`/`v3`. (Phase 1.2)
- [x] 🟢 **Coverage thresholds** ✅ (completed 2026-07-31)
- [x] 🟢 **SSE integration tests** ✅ (completed 2026-07-31) — ChatRunController + stream parser → `tryApplyMessagePartUpdateEvent` / `tryApplyTodoItemUpdateEvent` end-to-end. (Phase 1.1)
- [x] 🟢 **ChatRunController integration tests** ✅ (completed 2026-07-31) — Full lifecycle: start → appendText → updatePart → complete / fail / cancel. (Phase 1.1)

### Message Body & Parts

- [x] Centralize todo state updates in pure helpers. `patchTodoItem()` owns todo item validation, revision checks, immutable updates, and lifecycle status updates. `updateTodoItem()` and backend event handling route through the same reducer.
- [x] Centralize tool-call state updates in a pure helper. `patchToolCallPart()` validates tool-call state and preserves stable identity fields.
- [x] Add runtime guards for structured parts. `isTodoPart()`, `isTodoItemStatus()`, `isToolCallPart()`, and `isToolCallState()` protect update paths that receive external data.
- [x] Normalize todo backend updates. `normalizeTodoItemUpdateEvent()` accepts parsed objects, JSON strings, and MessageEvent-like payloads before applying `updateTodoItem()`.
- [x] Document deprecated compatibility surfaces. Legacy event/API surfaces are kept for existing integrations and should only be removed in a future major version.
- [x] Add diagnostic update results. `tryUpdateTodoItem()`, `tryUpdateToolCall()`, and `tryApplyTodoItemUpdateEvent()` return structured failure reasons while the older boolean methods remain compatible.
- [x] Extract message part collection updates into pure helpers. `appendMessagePart()`, `findMessagePart()`, `patchMessagePart()`, and `replaceMessagePart()` now cover collection updates outside the DOM.
- [x] Generalize backend event normalization. `message.part.updated` now covers text, tool-call, file/source metadata, and custom `x-*` part patches while `todo.item.updated` remains item-specific.
- [x] Add component-level event tests. The suite now covers child todo/tool events, `i-chat-part-host` event enrichment, unified `part-action`, deprecated compatibility events, and invalid backend events that must not mutate state.
- [x] Clean up `part-action` kind names before adoption. Unified events now use semantic domains (`'form'`, `'todo'`, `'tool-call'`) while deprecated compatibility events keep their original event names.
- [x] Modernize demo action examples. Demo pages now listen to `part-action` and use `tryUpdateTodoItem()` / `tryUpdateToolCall()` for interactive todo and tool-call updates.
- [x] Extract text part rendering. `i-chat-text-part` now owns markdown rendering, morphdom caching, and typing cursor state while `i-chat-part-host` stays focused on part routing and event enrichment.
- [x] Share markdown morphing between text and reasoning. `renderMarkdownInto()` now centralizes markdown rendering, morphdom patching, and HTML cache checks for both `i-chat-text-part` and `i-chat-reasoning`.
- [x] Align backend event envelopes with OpenAI Responses style. Canonical events now document `event` + matching `data.type` + `sequence_number`, while normalizers continue accepting legacy payloads without `data.type`.
- [x] 🟡 **`scrollToMessage()` / `scrollToPart()` public API** ✅ (completed 2026-08-01) — Expose methods on `<i-chat-messages>` to scroll a message or part into view by ID, and proxy them on `<i-chat>` as the primary consumer-facing API. DOM already has `data-message-id` / `data-part-id` attributes.

### Performance

- [x] Markdown cache — Two-level cache (raw content + HTML comparison) in `renderMarkdownInto()`. Skips markdown-it + DOMPurify when raw content unchanged; skips morphdom when HTML unchanged. (Phase 2.2)
- [x] highlight.js configurable — `ChatConfig.highlightJs` optional injection. When omitted, code blocks fall back to plain escaped `<pre><code>`. Threaded through full component chain. (Phase 2.3)
- [x] Memoized computed properties — `_messageRenderItems()` cached by collection shape (length + first/last id + timestamp). `_labels` cached by locale + labels reference. (Phase 2.4)
- [x] 🟡 **Markdown streaming light mode** — During active streaming in `i-chat-text-part`, skip DOMPurify (trusted backend source) and morphdom diff (use `innerHTML` — every token grows the full text, so incremental diff has zero reuse value). Added `renderMarkdownLight()` for the streaming path; full pipeline (DOMPurify + morphdom) runs on terminal render. No new config. (Phase 2.2)

### Backend Integration

- [x] SSE client removed — removed in v3. Use `ChatRunController` + manual stream handling. Formerly `createChatSSEClient()` at `@bndynet/ichat/sse`. (Phase 3.1)

### Developer Experience

- [x] AbortController in ChatRunController — `run.signal` for fetch integration. Auto-aborted on `complete()` / `fail()` / `cancel()`. (Phase 3.5)
- [x] Middleware chain — `ChatMiddleware` with `beforeSend`, `afterMessageAdded`, `beforeAppendPart`, `onError` hooks. FIFO execution, null short-circuits. (Phase 3.2)
- [x] 🟢 **Generic type support** — Made `<i-chat>` generic over custom part types (`Chat<TExtraArgs>`). Added `CustomPartOf<T>`, `PartOf<M, T>`, and `ExtendedMessagePart<T>` type helpers. (Phase 3.4)

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

- [x] README updated — ChatRunController, highlight.js, middleware/plugin examples, test scripts. (Phase 7)
- [x] `component-api.md` — Syntax highlighting section with usage example. (Phase 7)
- [x] `implementation-review.md` — Codebase architecture review. (Phase 7)

## Backlog

### Performance

- [ ] 🔴 **Virtual scrolling** — Integrate `@lit-labs/virtualizer` into `<i-chat-messages>`. Replace `repeat` with `<lit-virtualizer>`, keep date separators outside the virtual range, and ensure `scrollToBottom()` + `ResizeObserver` auto-scroll still work. Add `virtualScroll` config toggle (default on) and perf benchmarks for 100/1000/10000 messages. (Phase 2.1)
- [x] 🟡 **Remove `noExternal` bundling** ✅ (completed 2026-07-26) — `chat-messages` 524KB → 177KB, `chat-input` similar. Third-party deps now externalized; consumers' bundlers handle tree-shaking. Peer dependency migration deferred to v3. (Phase 2.3 step 1)

### Testing

- [x] 🟡 **Component tests for `<i-chat-input>`** ✅ — Module import, element registration, constructor, default property values. (Phase 1.1)
- [x] 🟡 **Component tests for `<i-chat>`** ✅ — Import, registration, constructor, property defaults, method signatures, `ready` promise. (Phase 1.1)

### Architecture (v3)

- [x] 🟡 **`<i-chat>` decomposition** ✅ (completed 2026-07-26) — Extracted `CommandQueue`, `ConfirmationController`, `SlotForwardingController`. chat.ts: 1200 → 1102 lines. (Phase 6.1)
- [x] 🔵 **Remove deprecated APIs** ✅ (completed 2026-07-30) — Removed `createStreamingController()`, `patchTodoItemInPart`, `form-submit`/`todo-action`/`tool-action` events, `config.dateSeparatorLabels`, boolean-return wrappers. (Phase 6.2)

## Compatibility & Deprecation

All deprecated APIs listed in prior versions have been removed in v3. See the [v2→v3 migration guide](./migration-v2-to-v3.md) for replacements.
