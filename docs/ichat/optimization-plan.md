# Optimization Plan — Remaining Work

> **Implementation supplement to [roadmap.md](./roadmap.md).** All completed items live in the roadmap's "Completed" section. This file retains only the detailed implementation guidance for work that isn't done yet.

---

## Phase 2 — Performance (remaining)

### 2.1 Virtual scrolling

- [x] Integrate `@lit-labs/virtualizer` (Lit's official virtual scroller) into `<i-chat-messages>`
  - Keep the existing `repeat` path as the default fallback
  - Virtualize date separators and messages in one ordered keyed sequence
  - Preserve `.scrollToBottom()`, `scrollToMessage()`, and `scrollToPart()`
  - Preserve automatic bottom anchoring for variable-height virtual items
  - `virtualScroll` config: `true` (always on), `false` (always off), `'auto'` (default, enables at > 500 messages)
- [x] Add perf benchmark: 100 / 1000 / 10000 messages render time
- [x] Validate opt-in field usage and define the automatic activation threshold (500 messages)

---

## Current Priority

```
✅ Phase 2.1 Virtual scroll          (completed)
```
