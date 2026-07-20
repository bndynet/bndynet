# @bndynet/ichat documentation

In-depth design and reference docs. For installation and a runnable quick start, see the [project README](../README.md).

## Core concepts

- [Message model](./message-model.md) — message roles (`ChatMessageRole`), common `ChatMessage` fields, and the structured `parts[]` body (factories, streaming/updating).
- [`<i-chat>` API](./component-api.md) — properties, methods, events, slots, and per-message avatars.
- [SSE response format](./sse-response-format.md) — recommended backend event stream contract for live assistant responses.
- [Project roadmap](./roadmap.md) — completed work, backlog, and deprecated compatibility surfaces across the project.
- [`<i-chat>` message-state refactor plan](./message-state-refactor-plan.md) — staged single-store migration, impact / breaking-change analysis, status, tests, and AI execution protocol.

## Content & parts

- [Parts: reasoning, tool calls, files, sources, custom](./parts.md) — `reasoning` blocks, `tool-call` cards (state machine + human-in-the-loop), `file` / `source` parts, and `x-*` custom parts via `registerPartRenderer`.
- [Todo panel](./todo.md) — structured items, collapse behavior, status events, incremental updates, and SSE revisions.
- [Custom renderers](./renderers.md) — extend the markdown pipeline with `registerRenderer`; register the built-in chart / KPI / form / Mermaid renderers.
- [Progress](./progress.md) — `[status]` markdown lists, block IDs, programmatic updates, and SSE integration.

## Presentation

- [Theming](./theming.md) — the 12 base CSS tokens, derivation, host light/dark contract, Mermaid tokens, and the full CSS custom properties reference.
- [Localization (i18n)](./localization.md) — `config.locale` / `config.labels`, plurals (`makeDaysAgo`), and RTL.
- [Composer & interaction](./composer.md) — streaming state, reply (quote) blocks, and the default composer's voice input.
