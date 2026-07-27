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
- [ ] **Integration tests** — SSE event stream → `tryApplyMessagePartUpdateEvent` / `tryApplyTodoItemUpdateEvent` end-to-end

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

- [ ] During active streaming, render plain text only; run full markdown-it + DOMPurify pass once streaming stops
  - Controlled by `config.markdownMode: 'full' | 'streaming-light'`
  - Reduces jank during high-frequency token delivery

### 2.3 Bundle size: peerDependencies + tree-shaking

- [ ] Move `markdown-it`, `dompurify`, `highlight.js` from `dependencies` → `peerDependencies`
  - `highlight.js` is already config-injectable via `config.highlightJs`; this completes the split
- [ ] Remove `noExternal: [/.*/]` from `chat-messages/tsup.config.ts`
- [ ] Provide both an ESM build (for tree-shaking consumers) and a full IIFE bundle
- [ ] Document bundle size in README with badges

---

## Phase 3 — Developer Experience (remaining)

### 3.1 Type system cleanup

- [ ] Split `packages/chat/src/index.ts` into `index.ts` (user-facing) + `internals.ts` (diagnostics)
  - Keep ~20 core types in main export
  - Move 40+ diagnostic types (`*FailureReason`, `*Result`) to subpath export
- [ ] Add `@bndynet/ichat/messages` re-export path for direct messages package access
- [ ] Document the public API surface in `docs/public-api.md`

### 3.2 Generic type support

- [ ] Make `<i-chat>` generic over custom part types:

  ```typescript
  interface ChatMessageExtraParts {
    [type: `x-${string}`]: unknown;
  }

  class Chat<TExtraParts extends Record<string, unknown> = {}> extends LitElement {
    messages: Array<ChatMessage & { parts: Array<MessagePart | CustomPart<TExtraParts>> }>;
  }
  ```

- [ ] Provide type helpers: `CustomPartOf<T>`, `PartOf<M, T>`

---

## Phase 4 — Extensibility (remaining)

### 4.1 Overridable built-in part renderers

- [ ] Extend `PartRenderer` lookup to allow replacing built-in types (`text`, `tool-call`) via the custom registry:

  ```typescript
  interface PartRenderer {
    test: (type: string) => boolean; // already accepts any string
    // ...
  }
  ```

- [ ] `<i-chat-part-host>` lookup order: custom registry → built-in renderers
  - Currently the registry only handles custom `x-*` types; built-in types always use the default components
- [ ] Allow consumers to replace the markdown-based `text` part renderer entirely

### 4.2 Built-in plugins

- [ ] Ship pre-built plugins so consumers don't need to write their own:
  - `MarkdownPlugin` — markdown-it config (linkify, typographer, custom fences)
  - `HighlightPlugin` — highlight.js injection with language registration
- [ ] User-land examples: KaTeX math plugin, link preview plugin, code copy button plugin

---

## Phase 5 — Accessibility

> **Status: ~15% complete.** Only `<i-chat-reasoning>` `aria-expanded` and `<i-chat-input>` partial labels exist.

### 5.1 ARIA & roles

- [ ] `<i-chat-messages>` — `role="log"`, `aria-live="polite"`, `aria-label`
- [ ] `<i-chat-message>` — `role="article"` for assistant messages
- [ ] `<i-chat-tool-call>` — `aria-expanded` on collapsible body, `aria-label` on approve/reject buttons
- [ ] `<i-chat-todo>` — `role="list"`, `role="listitem"` with `aria-checked`
- [ ] confirmation panel — `role="alertdialog"` or `role="dialog"`

### 5.2 Keyboard navigation

- [ ] `<i-chat-tool-call>` — Enter/Space to toggle collapse, Tab to approve/reject
- [ ] `<i-chat-todo>` — Enter/Space to cycle status on interactive items
- [ ] confirmation panel — Escape to cancel, Enter to confirm, focus trap

### 5.3 Screen reader announcements

- [ ] Announce new messages (especially streaming completion) via `aria-live` region
- [ ] Announce tool-call state transitions
- [ ] Announce errors

---

## Phase 6 — Architecture Cleanup (v3 prep)

### 6.1 `<i-chat>` decomposition

- [ ] Extract `ConfirmationController` (ReactiveController pattern, similar to `ChatRunController`)
- [ ] Extract `SlotForwardingController`
- [ ] Replace `_pendingCommands` array with a `CommandQueue` class (typed, testable)
- [ ] Target: `<i-chat>` component file ≤ 300 lines

### 6.2 Remove deprecated APIs

- [ ] Remove `createStreamingController()` — use `createRunController()`
- [ ] Remove `form-submit`, `todo-action`, `tool-action` compatibility events — use `part-action`
- [ ] Remove `patchTodoItemInPart` alias — use `patchTodoItem`
- [ ] Remove boolean-return wrappers: `updateTodoItem`, `updateToolCall`, `applyMessagePartUpdateEvent`, `applyTodoItemUpdateEvent` — use `try*` variants
- [ ] Remove `config.dateSeparatorLabels` — use `config.labels.dateSeparator`

---

## Phase 7 — Documentation & Showcase (remaining)

### 7.1 Migration guides

- [ ] v1 → v2 migration guide (`docs/migration-v1-to-v2.md`)
- [ ] v2 → v3 migration guide (planned breaking changes)

### 7.2 Storybook

- [ ] Set up Storybook 8+ with Lit support
- [ ] Stories for each component: `<i-chat>`, `<i-chat-input>`, `<i-chat-message>`, `<i-chat-tool-call>`, `<i-chat-todo>`, `<i-chat-reasoning>`
- [ ] Configurable knobs: locale, dark/light, message count, streaming simulation
- [ ] Deploy to Chromatic for visual regression testing

### 7.3 Interactive playground

- [ ] Embed a live `<i-chat>` playground on the docs site (iframe + demo code)
- [ ] Show the same demo with different framework wrappers (Vue, React, plain HTML)

---

## Current Priority

```
🔴 Phase 5   Accessibility           (largest gap, compliance risk)
🔴 Phase 2.1 Virtual scroll          (performance critical path)
🟡 Phase 2.3 Bundle size            (small change, big impact)
🟡 Phase 1.1 Component tests        (regression safety net)
🟡 Phase 6.1 Decomposition          (maintainability)
🟢 Phase 3   Type system + generics (nice to have)
🟢 Phase 4   Overridable renderers + built-in plugins
🔵 Phase 6.2 Remove deprecated      (v3 only)
🔵 Phase 7   Storybook + playground (pre-release)
```
