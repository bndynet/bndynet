# Optimization Plan — Remaining Work

> **Implementation supplement to [roadmap.md](./roadmap.md).** All completed items live in the roadmap's "Completed" section. This file retains only the detailed implementation guidance for work that isn't done yet.

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

---

## Current Priority

```
🔴 Phase 2.1 Virtual scroll          (performance critical path)
```
