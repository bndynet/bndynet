# Project Roadmap

Project-level follow-up work for `@bndynet/ichat`. Keep this checklist current: when an item lands, mark or move it in the same change. Add new sections as other areas grow.

## Completed

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

## Backlog

### Message Body & Parts

- [ ] Run an accessibility pass over interactive parts. Recheck todo status controls, collapsible headers, tool approval buttons, keyboard behavior, and aria labels.
- [ ] Review markdown rendering DOM boundaries. Document and reassess why `i-chat-text-part` stays in light DOM to inherit `.bubble .content` message styles while `i-chat-reasoning` keeps shadow DOM for its self-contained collapsible panel. If this becomes hard to maintain, consider a shared markdown render helper/controller first, then evaluate whether a tiny shared markdown content component can preserve both styling boundaries without changing public DOM expectations.
- [ ] Extract reply block rendering. Move quote/reply block rendering out of `i-chat-message` when reply-specific controls such as remove, collapse, or richer quote styling land.

## Compatibility & Deprecation

These surfaces remain supported for compatibility. New integrations should use the preferred API, and removal should only happen in a future major version with migration notes.

| Deprecated surface | Preferred surface | Notes |
|--------------------|-------------------|-------|
| `patchTodoItemInPart()` | `patchTodoItem()` | Compatibility alias; no behavior difference. |
| `form-submit` event | `part-action` with `kind: 'form'`, `action: 'submit'` | Still emitted after message context enrichment. |
| `todo-action` event | `part-action` with `kind: 'todo'` | Still emitted for interactive todo status requests. |
| `tool-action` event | `part-action` with `kind: 'tool-call'` | Still emitted for tool-call approval requests. |
| `config.dateSeparatorLabels` | `config.labels.dateSeparator` | Still merged for backward compatibility. |
