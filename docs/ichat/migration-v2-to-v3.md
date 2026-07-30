# Migration Guide: v2 → v3

> **Status:** v3 is in active development on the `v3` branch.

---

## Summary

v3 removes all deprecated APIs introduced in v2, simplifies the event system to a single `part-action` event, and removes the `config.dateSeparatorLabels` config option. Consumers using the deprecated APIs must migrate to the replacements listed below.

---

## Breaking Changes

### 1. `noExternal` removed — third-party deps now external

**What changed:** `@bndynet/ichat-messages` and `@bndynet/ichat-input` no longer bundle `markdown-it`, `dompurify`, `highlight.js`, `lit`, and `morphdom` into their output.

**Impact:**
- Bundle size reduced: `ichat-messages` ESM from **524KB → 177KB**
- Your bundler (Vite, webpack, etc.) now resolves these dependencies from `node_modules` instead of using inlined copies
- No duplicate copies of `markdown-it` / `lit` / etc. between your app and `ichat`

**Migration:** None required. These packages remain in `dependencies` so npm installs them automatically. Your bundler handles the rest.

### 2. Removed APIs

The following APIs were deprecated in v2 and are removed in v3:

| Removed | Replacement |
|--------|-------------|
| `createStreamingController()` | `createRunController()` |
| `patchTodoItemInPart()` | `patchTodoItem()` |
| `updateTodoItem()` (boolean) | `tryUpdateTodoItem()` (diagnostic result) |
| `updateToolCall()` (boolean) | `tryUpdateToolCall()` (diagnostic result) |
| `applyMessagePartUpdateEvent()` (boolean) | `tryApplyMessagePartUpdateEvent()` |
| `applyTodoItemUpdateEvent()` (boolean) | `tryApplyTodoItemUpdateEvent()` |
| `config.dateSeparatorLabels` | `config.labels.dateSeparator` |

### 3. Deprecated events removed

The following DOM events are removed; use the unified `part-action` event instead:

| Removed event | Use instead |
|--------------|-------------|
| `form-submit` | `part-action` with `kind: 'form'`, `action: 'submit'` |
| `todo-action` | `part-action` with `kind: 'todo'` |
| `tool-action` | `part-action` with `kind: 'tool-call'` |

The `part-action` event detail always includes `messageId`, `message`, `partId`, and `partType` enriched by the component hierarchy.

### 4. Removed type exports

| Removed export | Notes |
|---------------|-------|
| `ChatFormSubmitDetail` | Access via `ChatPartActionDetail` generic |
| `TodoActionDetail` | Access via `ChatPartActionDetail` generic |
| `ToolActionDetail` | Access via `ChatPartActionDetail` generic |
| `ChatFormSubmitRequestDetail` | Internal type, no longer exported |
| `TodoActionRequestDetail` | Internal type, no longer exported |
| `ToolActionRequestDetail` | Internal type, no longer exported |

---

## New Features in v2 (already available)

If you're coming from v1, these v2 features are already available:

- **`createRunController()`** — Full response lifecycle (start/stream/complete/cancel/fail) with built-in `AbortController`
- **`messages-change` event** — Single-source message state with structured detail
- **`ready` promise** — Safe pre-render API calls
- **SSE client** — `createChatSSEClient()` at `@bndynet/ichat/sse`
- **Middleware** — `chat.use(middleware)` with `beforeSend`/`afterMessageAdded`/`beforeAppendPart`/`onError`
- **Plugin system** — `chat.use(plugin)` with `install`/teardown
- **Async BlockRenderer** — `renderAsync()` for async code block rendering
- **Configurable highlight.js** — `config.highlightJs` injection
- **Controlled mode** — `messageMode: 'controlled'` for framework integrations

---

## Timeline

| Version | Status | Key changes |
|---------|--------|-------------|
| 2.0.x | Released | Single-source message state, SSE client, middleware, plugins |
| 2.1.x | In development | Accessibility (Phase 5), bundle optimization (Phase 2.3 step 1) |
| 2.2.x | Planned | Controlled mode, ChatRunController, markdown streaming-light |
| 3.0.0 | Planned | Remove deprecated APIs, peer dependency migration |
