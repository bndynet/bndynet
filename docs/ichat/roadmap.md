# Project Roadmap

Project-level follow-up work for `@bndynet/ichat`. Keep this checklist current: when an item lands, mark or move it in the same change. Add new sections as other areas grow.

> **For cross-cutting architecture, performance, and DX improvements see the [Optimization Plan](./optimization-plan.md).**
>
> **Current focus (2026-08-18): finish the release gates for the Composer Interaction MVP.** The generic queue, public API, host-rendered slot, demo, and framework documentation are complete. A possible built-in composer form remains a separate, deferred change.

## Completed

### Testing & CI

- [x] Unit and component test foundations — the comprehensive test suites for `@bndynet/ichat-messages` (16 files, ~255 test blocks), `@bndynet/ichat` (Node + browser), and `@bndynet/ichat-input` pass on Node.js 20/22. Pure reducers, component contracts, renderer isolation, streaming safety, run-controller flows, middleware hooks, plugin lifecycle, ownership matrix, and event contracts are covered. (Phase 1.1)
- [x] Coverage commands — package-level coverage scripts are available for the messages and input packages. Enforced thresholds and repository-local PR CI remain P0 work below.
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
- [x] 🟡 **Markdown streaming light mode** — During active streaming in `i-chat-text-part`, skip DOMPurify and morphdom diff (use `innerHTML` — every token grows the full text, so incremental diff has zero reuse value). The light path disables raw HTML, validates URI protocols, and defers untrusted renderer output; the full pipeline (DOMPurify + morphdom) runs on terminal render. No user config is required. (Phase 2.2)
- [x] 🟡 **Virtual scrolling** — `config.virtualScroll` defaults to `'auto'`
      (enables at > 500 messages). Supports `true`/`false`/`'auto'`, lazily loads
      `@lit-labs/virtualizer`, preserves the regular keyed-list fallback, supports
      variable heights and off-screen message/part navigation, and includes
      100/1,000/10,000-message browser benchmarks. (Phase 2.1)

### Backend Integration

- [x] SSE client removed — removed in v3. Use `ChatRunController` + manual stream handling. Formerly `createChatSSEClient()` at `@bndynet/ichat/sse`. (Phase 3.1)

### Developer Experience

- [x] AbortController in ChatRunController — `run.signal` for fetch integration. Auto-aborted on `complete()` / `fail()` / `cancel()`. (Phase 3.5)
- [x] Middleware chain primitives — `ChatMiddleware` and FIFO execution helpers exist. `beforeSend` is integrated; closing the public contract for `afterMessageAdded`, `beforeAppendPart`, and `onError` is P0 work below. (Phase 3.2 foundation)
- [x] 🟢 **Generic type support** — Made `<i-chat>` generic over custom part types (`Chat<TExtraArgs>`). Added `CustomPartOf<T>`, `PartOf<M, T>`, and `ExtendedMessagePart<T>` type helpers. (Phase 3.4)

### Extensibility

- [x] Generic Composer Interaction API ✅ (completed 2026-08-18) — Host applications can queue data-only `x-*` forms, selectors, and other temporary composer UI through a shared confirmation/custom FIFO, render recognized kinds through `slot="composer-interaction"`, and settle only the matching active request ID. Existing confirmation APIs and events remain compatible; interactions do not alter `busy`; default and custom composer drafts remain mounted and survive the queue. The message-level `<i-chat-form>` renderer and its submitted-summary lifecycle are unchanged.
- [x] Plugin API foundation — `ChatPlugin` exposes `install(chat)` + optional teardown, and `chat.use()` accepts both middleware and plugins. Unified lifecycle ownership, duplicate-name handling, and disconnect cleanup remain P0 work below. (Phase 4.3 foundation)
- [x] Async BlockRenderer — `renderAsync()` for fenced blocks. Placeholder on first render, swapped when promise resolves. `resolveAsyncBlocks()` exported. (Phase 4.2)
- [x] Renderer runtime isolation — block and string-part renderer failures fall
      back safely, async work is terminal-only and lifecycle-cancellable, stale
      results cannot overwrite newer content, and `chat-renderer-error` provides
      optional observability. Official Chart and Mermaid compatibility is covered
      in the browser regression benchmark.

### Accessibility

- [x] ARIA roles & labels — Phase 5.1 complete. Added `role="log" aria-live="polite"` to `<i-chat-messages>`, `role="article"` to assistant messages, `aria-expanded` + button labels to `<i-chat-tool-call>`, `role="list"/listitem" + aria-checked` to `<i-chat-todo>`, `role="alertdialog" aria-modal` to confirmation panel. (Phase 5.1)
- [x] Keyboard navigation — Phase 5.2 complete. Confirmation dialog: Escape → cancel, Tab/Shift+Tab focus trap, auto-focus confirm button. Tool-call/todo already handled by native `<details>` + `<button>`. (Phase 5.2)
- [x] Screen reader announcements — Phase 5.3 complete. New messages via `aria-live="polite"` on wrapper, tool-call state via sr-only live region, errors via `role="alert"` on banner. (Phase 5.3)

### Testing

- [x] Component tests for `<i-chat-input>` ✅ — Module import, custom element registration, constructor, default property values. (Phase 1.1)
- [x] Component tests for `<i-chat>` ✅ — Module import, registration, constructor, default properties, method signatures, `ready` promise contract. (Phase 1.1)

### Documentation

- [x] README updated — ChatRunController, highlight.js, middleware/plugin examples, test scripts. (Phase 7)
- [x] `component-api.md` — Syntax highlighting section with usage example. (Phase 7)
- [x] `implementation-review.md` — Codebase architecture review. (Phase 7)

### Code Quality & Lightweightness (v3.1)

- [x] 🟡 **Deduplicate renderer utils** ✅ (completed 2026-08-03) — Three identical copies of `utils.ts` (+ `icons.ts`/`version.ts`) across `chat-renderers`, `chat-renderer-chart`, `chat-renderer-mermaid` merged into single `renderer-utils.ts` in `chat-messages`. Net: ~540 lines removed.
- [x] 🟡 **highlight.js → optional peerDep** ✅ (completed 2026-08-03) — Moved from hard dependency to optional peer. Added self-contained `HighlightJs` interface so consumers' TypeScript never needs the package. Without highlight.js: plain `<pre><code>`, no error. `chat-messages` hard deps: 5 → 4.
- [x] 🟡 **Inline register-\*.ts thin wrappers** ✅ (completed 2026-08-03) — Two 10-line files that merely delegated to `@bndynet/ichat-messages` merged into `chat/src/index.ts`. Public API unchanged.
- [x] 🟡 **Extract confirmation dialog** ✅ (completed 2026-08-03) — `i-chat-confirmation` standalone Lit component with own shadow DOM, styles, and keyboard nav. `chat.ts`: 1088 → 966 lines (-122), `chat.scss`: 202 → 40 lines (-162).
- [x] 🟡 **Split chat-message.scss** ✅ (completed 2026-08-03) — 707-line monolith split into 3 files: `_chat-message-content.scss` (248), `_chat-message-meta.scss` (211), main file (252). Each partial is self-contained.
- [x] 🟡 **Extract buildMessagesChangeDetail** ✅ (completed 2026-08-03) — Pure helper in `messages-change-types.ts` shared by both `chat.ts` and `chat-messages.ts`. Eliminates ~25 lines of duplicated detail-building logic.

## Professional Library Readiness Backlog

Initial review (2026-08-04): **7.2/10 overall**. Post-refactor verification (2026-08-05): **6.9/10 current release readiness** identified `messages` / `messageMode` synchronization regressions. The state-architecture P0 work was completed later that day; refresh the readiness score after the remaining P0 verification and release gates. The target is **8.5/10** after P0 and the core P1 items. Work is grouped by category; within each category, items are ordered **P0 → P1 → P2 → Deferred**. Priorities are based on consumer impact and public-contract risk, not source-file length.

### Architecture & State Management

- [x] 🔴 **[P0] Complete one authoritative `ChatMessageStore`** ✅ (completed 2026-08-05) — `chat.messages` is the sole committed source of truth. The state-layer Store has no committed `_messages` copy; it reads through a synchronous host snapshot port and emits plain change data through a commit port. External history assignment is immediately visible to all imperative mutations.
  - **Done when:** initial and runtime external `messages` assignments are immediately visible to every imperative method and `ChatRunController`; adding/updating/removing after an external assignment preserves the full history; parent and standalone child share the same mutation/commit rules; the state core emits plain change data and does not construct DOM `CustomEvent`s.
- [x] 🔴 **[P0] Make controlled ownership and mode transitions framework-safe** ✅ (completed 2026-08-05) — Controlled changes use a deterministic pending-proposal contract. Sequential mutations and `ChatRunController` streaming build on the latest accepted proposal while framework state propagates asynchronously; exact host write-back reconciles queued versions, unrelated external history replaces them, and `preventDefault()` rejects a proposal. Mode is read live before connection and after runtime changes.
  - **Done when:** setting controlled mode before connection affects pre-`ready` data methods; runtime mode changes take effect on the next mutation; controlled write-back updates the store snapshot; sequential controlled updates remain correct with asynchronous host state propagation; controlled/uncontrolled behavior shares the same store tests.
- [x] 🔴 **[P0] Keep `ChatRunController` consistent with rejected proposals** ✅ (completed 2026-08-06) — Store mutations report a `ChatMutationOutcome` (`changed` / `accepted`), and the run only advances its lifecycle on an accepted proposal: a rejected `start()` stays `idle` and a rejected `complete()` / `fail()` / `cancel()` stays `streaming` with the signal open and `onCancel` unfired. A no-op is explicitly not a rejection, so a run whose message was removed still reaches a terminal state.
  - **Done when:** `start`, `complete`, `fail`, and `cancel` each have rejection coverage; a no-op regression test proves runs are never stranded in `streaming`; `run.signal` is aborted when first read after a terminal transition; ports written against the older `void` signature still work.
- [x] 🟡 **[P1] Decompose components by responsibility** ✅ (completed 2026-08-04) — All three targets extracted: `ChatMessageStore` (state mutation boundary), `ChatFormElement` (521 lines from `form-renderer.ts`, which shrank 622→93), `ScrollController` (160 lines) + `ErrorBannerController` (67 lines) as Lit ReactiveControllers from `chat-messages.ts` (893→793).
- [x] 🟡 **[P1] Make extracted ReactiveController state observable** ✅ (completed 2026-08-05) — `ScrollController` now uses a private `_applyState()` helper that diffs `autoScroll` / `hasNewContent` and calls `host.requestUpdate()` only when observable state actually changes. `handleScroll()`, `handleScrollToBottom()`, `scrollToBottom()`, `notifyContentChanged()`, `reset()`, and the `ResizeObserver` callback all route through `_applyState()`. The scroll-to-latest button and `hasNewContent` indicator now update immediately without waiting for an unrelated render. Browser tests verify initial defaults, idempotent reset, and public API surface.
  - **Done when:** scrolling back to the bottom, clicking the scroll button, clearing, and content-resize transitions update the button immediately; controller behavior is covered by browser/component tests rather than private-field assertions.

### Extensibility

- [x] 🔴 **[P0] Close the Middleware and Plugin contracts** ✅ (completed 2026-08-05) — Routed `afterMessageAdded`, `beforeAppendPart`, and `onError` through the same authoritative mutation/error paths as `beforeSend`. Removed the dead `PluginManager`/`createPluginManager`; `chat.use()` is now the single lifecycle owner with duplicate-name guard for plugins, `removePlugin(name)`, and automatic teardown on `disconnectedCallback`. Added contract tests for every documented hook and lifecycle transition.
  - **Done when:** every public hook has at least one integration test; a plugin teardown runs exactly once; documentation contains no declared-but-unwired extension points.
- [x] 🟡 **[P1] Make global extension registration deterministic** ✅ (completed 2026-08-05) — Keep one intentionally global registration model without adding per-instance contexts. Remove misleading instance registration methods; allow Block Renderer, Part Renderer, and Markdown Plugin registration at runtime, consistently applying new extensions to subsequent renders. Same-object registration is idempotent, while same-name/id different-object registration warns and keeps the first definition.
  - **Done when:** all three extension mechanisms share the same runtime timing and conflict rules; Markdown caches and mounted plugin style roots react to later registration; existing rendered content is not refreshed implicitly; public documentation exposes only module-level registration; duplicate bundles do not replace working registrations.
- [x] 🟡 **[P1] Harden the Renderer result contract** ✅ (completed 2026-08-05) — Replaced the primary `trusted?: boolean` + raw HTML string convention with explicit `BlockRenderMode` (`'sanitized'` | `'trusted'`). The deprecated `trusted` boolean is still accepted for backward compatibility; `mode` takes precedence when both are set. Internal helper `isRendererTrusted()` resolves the effective mode. All official renderers (chat-details, chart, mermaid, form, kpi, kpis) use `mode: 'trusted'`. Added custom-element name validation in `PartRendererRegistry.register()` to reject invalid element names at registration time.
  - **Done when:** third-party renderers cannot bypass sanitization with an accidental boolean; sync/async/element renderers share one documented lifecycle and error contract.
- [x] 🟡 **[P1] Validate renderer input schemas at runtime** ✅ (completed 2026-08-05) — Added minimal defensive `typeof` + null checks after `JSON.parse` in chart and form renderers to prevent `TypeError` on `JSON.parse("null")` / `JSON.parse("123")`. KPI/KPIs renderers are already covered by their existing `try/catch` blocks. Deep structural validation is left to consumers; this library only guards against runtime crashes from non-object parse results.
  - **Done when:** malformed-but-valid JSON is covered by tests and cannot throw from an official renderer.

### Testing & Release Quality

- [x] 🔴 **[P0] Add a Store × ownership × lifecycle behavior matrix** ✅ (completed 2026-08-05) — Node-level component regressions cover every imperative mutation (removeMessage, clear, cancelMessage, cancel, updatePart, appendPart, tryUpdatePart, tryUpdateToolCall, tryUpdateTodoItem, tryApplyMessagePartUpdateEvent, tryApplyTodoItemUpdateEvent) in both ownership modes, plus sequential chaining, event cancelability contracts, and `messages-change` previousMessages accuracy. Browser-level rendered tests (`test/browser/`) verify DOM state, child-component synchronisation, busy-state reflection, data attributes, and event bubbling in a real browser DOM via Vite dev server.
  - **Done when:** the verified history-loss and pre-connect mode regressions fail before the fix and pass after it; tests exercise rendered `<i-chat>` behavior in a browser-capable environment.
- [x] 🔴 **[P0] Add repository-local CI and release gates** ✅ (completed 2026-08-05) — CI runs type-check → test (Node 20/22) → coverage (≥85% threshold) → `npm pack` validation → browser smoke build. Added `typecheck` and `validate:pack` root scripts. Publish workflow has a mandatory `gate` job that runs the full CI suite before the external publish job can execute; release cannot publish when type-check, tests, coverage, pack validation, or browser smoke builds fail.
  - **Done when:** required PR checks block regressions; release cannot publish when tests, browser smoke tests, type exports, or `npm pack` validation fail; documentation no longer references a missing workflow.
- [x] 🟢 **[P2] Complete distribution metadata** ✅ (completed 2026-08-05) — Added `engines: { node: ">=20" }` to all 7 publishable packages. License already present.

### Developer Experience & Package API

- [x] 🟡 **[P1] Define intentional package and API boundaries** ✅ (wontfix 2026-08-05) — Evaluated and determined no action needed. Single-entry barrel with full re-exports is sufficient for the current consumer profile; tree-shaking already removes unused exports. Subpath exports, `sideEffects` metadata, and Custom Elements Manifest would add complexity without measurable benefit given that consumers always need custom-element registration.
- [x] 🟢 **[P2] Fix labels-cache reference invalidation** ✅ (completed 2026-08-05) — Changed cache key from `${locale}|${!!labelsRef}` (boolean, never invalidates when one truthy object replaces another) to identity comparison (`===`) on the `labelsRef` object reference. Replacing `{ empty: 'A' }` with `{ empty: 'B' }` under the same locale now correctly invalidates the cache and renders the updated text.
- [x] 🟢 **[P2] Make documentation reflect runtime behavior** ✅ (completed 2026-08-05) — Updated test counts across roadmap, implementation-review, and README. Fixed CI pipeline description (added typecheck/pack/browser-smoke jobs, dropped Node 18). Removed obsolete SSE client risk row. Updated middleware example to show all 4 hooks. Changed `renderers.md` from deprecated `trusted: true` to `mode: 'trusted'`. Marked completed SSE/run-controller integration tests in Next Steps.

### Performance & Security

- [ ] 🔵 **[P2] Evaluate morphdom only with evidence** — Keep the current implementation unless a benchmarked Lit-native replacement improves size or maintainability without regressing cursor stability, async renderer replacement, or terminal rendering.
- [x] 🟢 **[P2] Retain DOMPurify as the security boundary** ✅ (decision 2026-08-04) — Do not replace the audited sanitizer with a custom allow-list implementation merely to save bundle size. Revisit only if there is a measured blocker and equivalent security coverage.
- [x] 🟢 **[Completed] Virtual scrolling** — Now defaults to `'auto'` (enables at > 500 messages). Full benchmarks for 100/1,000/10,000 messages, date separator, auto-scroll, `ResizeObserver`, and imperative scroll API compatibility verified. (Former Phase 2.1)

### Maintenance & Internal Consistency

- [x] 🟢 **[P2] Remove duplicate and unused internal paths** ✅ (completed 2026-08-05) — The unused `markdown-extensions.ts` implementation was removed with the global registration-contract cleanup. The dead `PluginManager`/`createPluginManager`/`installPlugin` path was removed when consolidating plugin lifecycle ownership into `chat.ts`.

### Previously Completed Architecture and Bundle Work

- [x] 🟡 **Remove `noExternal` bundling** ✅ (completed 2026-07-26) — `chat-messages` 524KB → 177KB, `chat-input` similar. Third-party dependencies are externalized for consumer bundlers. (Phase 2.3 step 1)
- [x] 🟡 **`<i-chat>` decomposition** ✅ (completed 2026-07-26) — Extracted `CommandQueue`, `ConfirmationController`, and `SlotForwardingController`. (Phase 6.1)
- [x] 🟡 **Further structural decomposition** ✅ (completed 2026-08-04) — Extracted the initial `ChatMessageStore` class, `ScrollController` and `ErrorBannerController` ReactiveControllers, and `ChatFormElement`, plus earlier `ChatConfirmation`, inlined registration wrappers, and deduplicated renderer utilities. State synchronization and controller behavior remain open items above; this completion records file/responsibility extraction only.
- [x] 🔵 **Remove deprecated APIs** ✅ (completed 2026-07-30) — Removed v2 compatibility APIs scheduled for the v3 major release. (Phase 6.2)

## Compatibility & Deprecation

All deprecated APIs listed in prior versions have been removed in v3.
