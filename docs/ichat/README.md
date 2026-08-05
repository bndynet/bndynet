# @bndynet/ichat documentation

In-depth design and reference docs. For installation and a runnable quick start, see the [project README](../README.md).

## Core concepts

- [Message model](./message-model.md) — message roles (`ChatMessageRole`), common `ChatMessage` fields, and the structured `parts[]` body (factories, streaming/updating).
- [`<i-chat>` API](./component-api.md) — properties, methods, events, slots, and per-message avatars.
- [Backend integration](./streaming-integration.md) — streaming patterns using `ChatRunController`: fetch, SSE, WebSocket, NDJSON.
- [Project roadmap](./roadmap.md) — completed work, backlog, and deprecated compatibility surfaces across the project.
- [Optimization plan](./optimization-plan.md) — phased plan for performance, DX, extensibility, accessibility, and architecture improvements.
- [`<i-chat>` message-state refactor plan](./message-state-refactor-plan.md) — staged single-store migration, impact / breaking-change analysis, status, tests, and AI execution protocol.

## Content & parts

- [Parts: reasoning, tool calls, files, sources, custom](./parts.md) — `reasoning` blocks, `tool-call` cards (state machine + human-in-the-loop), `file` / `source` parts, and `x-*` custom parts via `registerPartRenderer`.
- [Todo panel](./todo.md) — structured items, collapse behavior, status events, and incremental updates.
- [Custom renderers](./renderers.md) — extend the markdown pipeline with `registerCodeRenderer`; register the built-in chart / KPI / form / Mermaid renderers.
- [Progress](./progress.md) — `[status]` markdown lists, block IDs, programmatic updates.

## Presentation

- [Theming](./theming.md) — the 12 base CSS tokens, derivation, host light/dark contract, Mermaid tokens, and the full CSS custom properties reference.
- [Localization (i18n)](./localization.md) — `config.locale` / `config.labels`, plurals (`makeDaysAgo`), and RTL.
- [Composer & interaction](./composer.md) — busy/streaming state, draft editing, reply blocks, and the default composer's voice input.
