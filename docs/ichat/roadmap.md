# Project Roadmap

Project-level follow-up work for `@bndynet/ichat`. Keep this checklist current: when an item lands, mark or move it in the same change. Add new sections as other areas grow.

> **For cross-cutting architecture, performance, and DX improvements see the [Optimization Plan](./optimization-plan.md).**
>
> **Current focus (2026-08-04): professional-library hardening without feature expansion.** Do not add new message types, renderers, or interaction features until the P0 contract and state-architecture work below is complete.

## Completed

### Testing & CI

- [x] Unit and component test foundations — the current local suites for `@bndynet/ichat-messages` (29 tests), `@bndynet/ichat`, and `@bndynet/ichat-input` pass on Node.js 20. Pure reducers, component contracts, renderer isolation, streaming safety, and run-controller flows are covered. (Phase 1.1)
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

### Backend Integration

- [x] SSE client removed — removed in v3. Use `ChatRunController` + manual stream handling. Formerly `createChatSSEClient()` at `@bndynet/ichat/sse`. (Phase 3.1)

### Developer Experience

- [x] AbortController in ChatRunController — `run.signal` for fetch integration. Auto-aborted on `complete()` / `fail()` / `cancel()`. (Phase 3.5)
- [x] Middleware chain primitives — `ChatMiddleware` and FIFO execution helpers exist. `beforeSend` is integrated; closing the public contract for `afterMessageAdded`, `beforeAppendPart`, and `onError` is P0 work below. (Phase 3.2 foundation)
- [x] 🟢 **Generic type support** — Made `<i-chat>` generic over custom part types (`Chat<TExtraArgs>`). Added `CustomPartOf<T>`, `PartOf<M, T>`, and `ExtendedMessagePart<T>` type helpers. (Phase 3.4)

### Extensibility

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
- [x] 🟡 **Inline register-*.ts thin wrappers** ✅ (completed 2026-08-03) — Two 10-line files that merely delegated to `@bndynet/ichat-messages` merged into `chat/src/index.ts`. Public API unchanged.
- [x] 🟡 **Extract confirmation dialog** ✅ (completed 2026-08-03) — `i-chat-confirmation` standalone Lit component with own shadow DOM, styles, and keyboard nav. `chat.ts`: 1088 → 966 lines (-122), `chat.scss`: 202 → 40 lines (-162).
- [x] 🟡 **Split chat-message.scss** ✅ (completed 2026-08-03) — 707-line monolith split into 3 files: `_chat-message-content.scss` (248), `_chat-message-meta.scss` (211), main file (252). Each partial is self-contained.
- [x] 🟡 **Extract buildMessagesChangeDetail** ✅ (completed 2026-08-03) — Pure helper in `messages-change-types.ts` shared by both `chat.ts` and `chat-messages.ts`. Eliminates ~25 lines of duplicated detail-building logic.

## Professional Library Readiness Backlog

Baseline review (2026-08-04): **7.2/10 overall** — architecture 7.6, extensibility 6.8, usability 7.3. The target is **8.5/10** after P0 and the core P1 items. Work is grouped by category; within each category, items are ordered **P0 → P1 → P2 → Deferred**. Priorities are based on consumer impact and public-contract risk, not source-file length.

### Architecture & State Management

- [x] 🔴 **[P0] Create one authoritative `ChatMessageStore`** ✅ (completed 2026-08-04) — Extracted `ChatMessageStore` class (303 lines) encapsulating messages array, commit logic (controlled/uncontrolled modes), streaming-state derivation, and all pure data-mutation methods. Implements `ChatMessageStorePort` so `ChatRunController` works unchanged. `chat.ts`: 966 → 790 lines (-176).
- [ ] 🔴 **[P0] Make controlled ownership framework-safe** — Remove the requirement that hosts synchronously write `messages-change.detail.messages` back during the event handler. Define a deterministic snapshot/acceptance contract so sequential run-controller updates cannot read stale state in React-style asynchronous hosts. Preserve uncontrolled mode as the simple default and document any major-version migration required.
  - **Done when:** sequential controlled updates remain correct with asynchronous host state propagation, and controlled/uncontrolled behavior shares the same store tests.
- [x] 🟡 **[P1] Decompose components by responsibility** ✅ (completed 2026-08-04) — All three targets extracted: `ChatMessageStore` (state ownership), `ChatFormElement` (521 lines from `form-renderer.ts`, which shrank 622→93), `ScrollController` (160 lines) + `ErrorBannerController` (67 lines) as Lit ReactiveControllers from `chat-messages.ts` (893→793).

### Extensibility

- [ ] 🔴 **[P0] Close the Middleware and Plugin contracts** — Route `afterMessageAdded`, `beforeAppendPart`, and `onError` through the same authoritative mutation/error paths as `beforeSend`, or remove any hook that is not intended to be supported. Replace the parallel direct-install / `PluginManager` paths with one lifecycle owner that handles duplicate names, teardown, explicit disposal, and component disconnect. Add contract tests for every documented hook and lifecycle transition.
  - **Done when:** every public hook has at least one integration test; a plugin teardown runs exactly once; documentation contains no declared-but-unwired extension points.
- [ ] 🟡 **[P1] Introduce a scoped `ExtensionContext`** — Keep a global default for the one-line setup, but allow each chat instance/application boundary to own its block renderers, part renderers, and Markdown plugins. Remove the mismatch where an instance exposes `registerCodeRenderer()` even though the global registry may already be frozen. Registration must return an explicit result instead of silently warning and doing nothing.
  - **Done when:** two chat instances can use different extension sets; dynamic application boundaries do not depend on module import order; the global convenience path remains backward compatible.
- [ ] 🟡 **[P1] Harden the Renderer result contract** — Replace the primary `trusted?: boolean` + raw HTML string convention with explicit result modes such as element, sanitized HTML, and internal trusted HTML. Keep untrusted rendering as the default, restrict trusted bypass to audited built-ins/capabilities, validate custom-element names, and preserve renderer error observability.
  - **Done when:** third-party renderers cannot bypass sanitization with an accidental boolean; sync/async/element renderers share one documented lifecycle and error contract.
- [ ] 🟡 **[P1] Validate renderer input schemas at runtime** — Validate Form, Chart, and other JSON renderer payloads before property access or custom-element creation. Invalid data must produce a safe code fallback and a structured renderer diagnostic instead of relying on TypeScript assertions after `JSON.parse`.
  - **Done when:** malformed-but-valid JSON is covered by tests and cannot throw from an official renderer.

### Testing & Release Quality

- [ ] 🔴 **[P0] Add repository-local CI and release gates** — Run build, type generation/checks, unit/component tests, official renderer tests, browser streaming/security smoke tests, and package-validation checks on pull requests and before publish. Use supported Node.js LTS versions and enforce coverage/API thresholds in CI rather than only exposing local scripts.
  - **Done when:** required PR checks block regressions; release cannot publish when tests, browser smoke tests, type exports, or `npm pack` validation fail; documentation no longer references a missing workflow.
- [ ] 🟢 **[P2] Complete distribution metadata** — Include the repository license in published packages and add supported engines, security policy, contribution guidance, package smoke tests, and API compatibility reporting.

### Developer Experience & Package API

- [ ] 🟡 **[P1] Define intentional package and API boundaries** — Separate side-effect-free types/utilities from custom-element registration where practical; add explicit subpath exports/define entry points, accurate `sideEffects` metadata, a Custom Elements Manifest and framework typings, and automated public API/package checks. Reduce the top-level barrel to supported consumer APIs and mark internals clearly.
  - **Done when:** consumers can import types/core helpers without registering every element; bundlers and framework tooling can discover the components and events; accidental public API changes are detected.
- [ ] 🟢 **[P2] Make documentation reflect runtime behavior** — Reconcile warning-vs-throw semantics, extension registration timing, current test counts, controlled-mode behavior, and CI status. Generate API tables from declarations/Custom Elements Manifest where possible so roadmap, README, and implementation review do not drift independently.

### Performance & Security

- [ ] 🔵 **[P2] Evaluate morphdom only with evidence** — Keep the current implementation unless a benchmarked Lit-native replacement improves size or maintainability without regressing cursor stability, async renderer replacement, or terminal rendering.
- [x] 🟢 **[P2] Retain DOMPurify as the security boundary** ✅ (decision 2026-08-04) — Do not replace the audited sanitizer with a custom allow-list implementation merely to save bundle size. Revisit only if there is a measured blocker and equivalent security coverage.
- [ ] ⏸️ **[Deferred] Virtual scrolling** — Deferred until the professional-library P0/P1 work is complete and production measurements demonstrate a real need. If resumed, require benchmarks for 100/1000/10000 messages and compatibility tests for date separators, auto-scroll, `ResizeObserver`, and imperative scroll APIs. (Former Phase 2.1)

### Maintenance & Internal Consistency

- [ ] 🟢 **[P2] Remove duplicate and unused internal paths** — Delete or consolidate the unused `markdown-extensions.ts` implementation and the parallel/incomplete plugin-manager path after the selected contracts are in place. Keep one implementation per extension mechanism.

### Previously Completed Architecture and Bundle Work

- [x] 🟡 **Remove `noExternal` bundling** ✅ (completed 2026-07-26) — `chat-messages` 524KB → 177KB, `chat-input` similar. Third-party dependencies are externalized for consumer bundlers. (Phase 2.3 step 1)
- [x] 🟡 **`<i-chat>` decomposition** ✅ (completed 2026-07-26) — Extracted `CommandQueue`, `ConfirmationController`, and `SlotForwardingController`. (Phase 6.1)
- [x] 🟡 **Further decomposition** ✅ (completed 2026-08-04) — Extracted `ChatMessageStore` (state ownership, commit semantics, streaming derivation), `ScrollController` and `ErrorBannerController` (Lit ReactiveControllers from `chat-messages.ts`), `ChatFormElement` (521-line custom element from `form-renderer.ts`), plus earlier `ChatConfirmation`, inlined registration wrappers, and deduplicated renderer utilities.
- [x] 🔵 **Remove deprecated APIs** ✅ (completed 2026-07-30) — Removed v2 compatibility APIs scheduled for the v3 major release. (Phase 6.2)

## Compatibility & Deprecation

All deprecated APIs listed in prior versions have been removed in v3. See the [v2→v3 migration guide](./migration-v2-to-v3.md) for replacements.
