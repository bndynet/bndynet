# @bndynet/ichat documentation

In-depth design and reference docs. For installation and a runnable quick start, see the [project README](../README.md).

## Core concepts

- [Message model](./message-model.md) — message roles (`ChatMessageRole`), common `ChatMessage` fields, and the structured `parts[]` body (factories, streaming/updating).
- [`<i-chat>` API](./component-api.md) — properties, methods, events, slots, and per-message avatars.

## Content & parts

- [Parts: reasoning, tool calls, files, sources, custom](./parts.md) — `reasoning` blocks, `tool-call` cards (state machine + human-in-the-loop), `file` / `source` parts, and `x-*` custom parts via `registerPartRenderer`.
- [Custom renderers](./renderers.md) — extend the markdown pipeline with `registerRenderer`; register the built-in chart / KPI / form / Mermaid renderers.
- [Timeline](./timeline.md) — `[status]` markdown lists, block IDs, programmatic updates, and SSE integration.

## Presentation

- [Theming](./theming.md) — the 12 base CSS tokens, derivation, host light/dark contract, Mermaid tokens, and the full CSS custom properties reference.
- [Localization (i18n)](./localization.md) — `config.locale` / `config.labels`, plurals (`makeDaysAgo`), and RTL.
- [Composer & interaction](./composer.md) — streaming state, reply (quote) blocks, and the default composer's voice input.
