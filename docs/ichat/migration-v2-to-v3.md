# Migration Guide: v2 → v3

> **Status:** Work in progress. v3 is not yet released — this document tracks planned breaking changes as they land on the `v3` branch.

---

## Summary

v3 focuses on reducing bundle size by externalizing heavy third-party dependencies. Most consumers will need no changes; those using `highlight.js` features should verify their setup.

---

## Breaking Changes

### 1. `noExternal` removed — third-party deps now external

**What changed:** `@bndynet/ichat-messages` and `@bndynet/ichat-input` no longer bundle `markdown-it`, `dompurify`, `highlight.js`, `lit`, and `morphdom` into their output.

**Impact:**
- Bundle size reduced: `ichat-messages` ESM from **524KB → 177KB**
- Your bundler (Vite, webpack, etc.) now resolves these dependencies from `node_modules` instead of using inlined copies
- No duplicate copies of `markdown-it` / `lit` / etc. between your app and `ichat`

**Migration:** None required. These packages remain in `dependencies` so npm installs them automatically. Your bundler handles the rest.

### 2. Peer dependency migration (future)

The following will move from `dependencies` → `peerDependencies` in a future v3 release:

| Package | Reason |
|---------|--------|
| `markdown-it` | Consumers may already have it for their own markdown |
| `dompurify` | Consumers may already have it for sanitization |
| `highlight.js` | Already config-injectable via `config.highlightJs` |

When this lands, consumers will need to explicitly install these packages. Migration notes will be added here.

---

## Deprecated APIs (removal planned for v3)

These surfaces remain in 2.x but will be removed in v3:

| Deprecated | Replacement | Notes |
|------------|-------------|-------|
| `createStreamingController()` | `createRunController()` | Full run lifecycle vs animation-only |
| `form-submit` event | `part-action` with `kind: 'form'` | Unified event system |
| `todo-action` event | `part-action` with `kind: 'todo'` | Unified event system |
| `tool-action` event | `part-action` with `kind: 'tool-call'` | Unified event system |
| `patchTodoItemInPart()` | `patchTodoItem()` | Alias, no behavior difference |
| `updateTodoItem()` (boolean) | `tryUpdateTodoItem()` (diagnostic) | Structured error reasons |
| `updateToolCall()` (boolean) | `tryUpdateToolCall()` (diagnostic) | Structured error reasons |
| `applyMessagePartUpdateEvent()` (boolean) | `tryApplyMessagePartUpdateEvent()` | Structured error reasons |
| `applyTodoItemUpdateEvent()` (boolean) | `tryApplyTodoItemUpdateEvent()` | Structured error reasons |
| `config.dateSeparatorLabels` | `config.labels.dateSeparator` | Unified labels config |

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
