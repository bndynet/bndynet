# icharts — Engine Lifecycle & Adapter Contract

> Internal design guide for the **runtime** half of `@bndynet/icharts`: the
> `IChart` engine in `src/core.ts`, the adapter contract in
> `src/adapters/index.ts`, and the boundary between them.
>
> Companion to [COLORS.md](COLORS.md) (color pipeline) and
> [LAYOUT.md](LAYOUT.md) (title/legend layout). Those two cover what an
> adapter *builds*; this one covers *when* it runs, *what side effects it may
> own*, and *who cleans them up*.
>
> Two audiences:
>
> 1. **Contributors / AI agents** adding a built-in chart type or extending
>    the engine — so per-type behavior lands on the adapter, never as a
>    `this._type === ChartType.Xxx` branch in `core.ts`.
> 2. **Users** writing custom adapters via `registerAdapter()` that need to
>    wire side effects (observers, listeners, timers) and tear them down
>    correctly.

---

## 1. Design goals

- **The engine is type-agnostic.** `core.ts` knows nothing about `gauge`,
  `wordcloud`, or `pie`. Every per-type behavior is a capability *declared on
  the adapter* and consulted via `getAdapter(type)`. Adding a chart type must
  never require editing the engine.
- **Adapters own their side effects; the engine owns their lifecycle.** An
  adapter decides *what* to observe/listen to inside `onInit`; the engine
  decides *when* to tear it down (before the next render, and on dispose).
  Adapters never stash state on the chart instance and never poll
  `isDisposed()`.
- **One render path.** Construction, `update`, `setTheme`, and `resize` all
  funnel through a single private `_apply()`. Cross-cutting concerns
  (font-family injection, container-dim sampling, `RenderContext` threading,
  cleanup) are wired once there, not duplicated per entry point.
- **Idempotent teardown.** `dispose()` is safe to call twice; adapter
  teardowns are run at most once each and a throwing teardown can never wedge
  a render or leak the chart.
- **SSR-safe by construction.** Nothing on the `core.ts` → adapter import
  graph touches a browser global at module load. Browser-only effects live
  inside `onInit` (a callback, never module top-level) behind `typeof`
  guards. See [§7](#7-ssr--module-load-safety).

---

## 2. Render lifecycle

Every public entry point on `IChart` (other than `dispose`) ends in a single
`_apply()` call. `_apply()` is the heartbeat of a chart.

```
createChart(el, type, data, options)
        │
        ▼
  new IChart(...)                  ── constructor
        │  echarts.init(container, theme)
        │  chartRegistry.add(this)
        ├──► _apply()                       (initial render)
        └──► installSentinel(...)           (auto-dispose on DOM detach)

  chart.update(data?, options?)    ── adapter.mergeData? folds data
        └──► _apply({ observedFrameMs, maxRaceGridRight })

  chart.setTheme(name)             ── adapter.clearOnThemeChange? clears first
        └──► _apply()

  chart.resize()                   ── ecInstance.resize(), then re-resolve so
        └──► _apply()                 container-aware sizing re-flows

  chart.dispose()                  ── DOES NOT call _apply()
        ├── sentinel.remove()
        ├── _runApplyCleanup()             (final adapter teardown)
        ├── releaseColorOwner(this)        (release consistentColors name lease;
        │                                   recycle auto slots this chart last held)
        ├── chartRegistry.delete(this)
        └── ecInstance.dispose()
```

### What one `_apply()` does, in order

```
1. Sample container dims + flags → RenderContext
     (inShadowDom, containerWidth/Height; undefined when 0 / non-finite)
2. beginColorRender(this, theme) … resolveEChartsOption(...) … endColorRender(this)
     (try/finally — brackets the resolve in a color render session so the names
      it resolves under `consistentColors` become this chart's refcounted lease)
     → { option, onInit?, notMerge? }
3. applyConfiguredFontFamilyToOption(option, fontFamily)
4. _observeGridRight(option)                         (race grid.right high-water mark)
5. ecInstance.setOption(option, notMerge ?? true)
6. _rebindAsyncTooltipDismiss(option)   (off prev `hideTip` listener → on new)
7. _rebindEvents()                       (off prev options.events wrappers → on new)
8. _runApplyCleanup()        ← tear down the PREVIOUS pass's onInit effect
9. cleanup = onInit?.(instance)
10. _applyCleanup = (typeof cleanup === 'function') ? cleanup : null
```

Steps 8–10 are the cleanup lifecycle covered in [§4](#4-oninit-teardown-lifecycle).

Step 2's `beginColorRender` / `endColorRender` bracket is the engine half of
the **consistentColors name lease**: the names an adapter resolves (via
`resolveColors`) during the session become a refcounted lease owned by this
chart, and `dispose()`'s `releaseColorOwner(this)` recycles any auto palette
slot the chart was the last holder of. This is what lets a fully-unmounted page
restart at `palette[0]` without the disconnect-sentinel sweep — see
[docs/COLORS.md §4 "Name leases & dispose-release recycling"](COLORS.md). The
session wraps **only** the resolve (not `onInit` / `setOption`), so a
re-entrant render triggered from `onInit` can't nest sessions.

Steps 6–7 are **engine-owned, type-agnostic** event wiring: the async-tooltip
`hideTip` dismiss and the typed `options.events` handlers (`onClick` /
`onDoubleClick` / `onMouseOver` / `onMouseOut`). Both follow the same
detach-then-attach discipline — the previous pass's listeners are removed
before the new ones bind, so re-renders never stack listeners. Event `params`
are normalized into a `ChartEventContext` (reusing the tooltip item/edge
shapes) via `buildChartEventContext`. **Adapters never wire interaction
events** — they belong to the engine so every chart type gets them uniformly;
an adapter that needs a bespoke listener uses its `onInit` teardown instead.

---

## 3. The adapter contract

An adapter is the only place per-type knowledge lives. It satisfies
`ChartAdapter` (`src/adapters/index.ts`):

```ts
interface ChartAdapter {
  validate(data: ChartData): boolean;
  resolve(data: ChartData, options: ChartOptions, ctx?: RenderContext): ChartSetupResult;
  mergeData?(prev: ChartData, next: ChartData): ChartData;   // optional
  clearOnThemeChange?: boolean;                              // optional
}

interface ChartSetupResult {
  option: Record<string, unknown>;
  onInit?: (instance: echarts.ECharts) => void | ChartTeardown;  // ChartTeardown = () => void
  notMerge?: boolean;
}
```

| Field | Owner | When the engine uses it | Purpose |
|-------|-------|-------------------------|---------|
| `validate(data)` | adapter | every `resolve`, and as a guard before `mergeData` | Confirm the data shape; gate cross-frame merge. |
| `resolve(...)` | adapter | every `_apply()` | Build the full ECharts `option` (+ optional `onInit` / `notMerge`). Pure: no `echarts.init`, no side effects. |
| `onInit(instance)` | adapter | after `setOption`, **every** `_apply()` | Side effects on the live instance (listeners, observers, post-init `setOption` merges). May return a `ChartTeardown`. |
| `notMerge` | adapter | step 5 of `_apply()` | `setOption(option, notMerge ?? true)`. Default `true` (full replace); set `false` to let ECharts animate across successive frames (bar/line `race`). |
| `mergeData(prev, next)` | adapter | `update()` only, when **both** frames pass `validate` | Fold a partial patch into the prior frame (gauge / liquid-progress carry `max`/`label` forward). Omitted ⇒ replace wholesale. |
| `clearOnThemeChange` | adapter | `setTheme()` only | When `true`, engine calls `instance.clear()` before repainting (wordcloud's custom-series renderer needs it). |

**Engine-vs-adapter boundary:**

```
        ┌───────────────────────────── core.ts (IChart) ─────────────────────────────┐
        │  type-agnostic engine: render loop, dims sampling, font guard,              │
        │  cleanup bookkeeping, registry/sentinel wiring                              │
        │                                                                             │
        │   update() ─ getAdapter(type).mergeData? ──┐                                │
        │   setTheme() ─ getAdapter(type).clearOnThemeChange? ──┐                     │
        │   _apply() ─ resolveEChartsOption(type, ...) ─────────┼───┐                 │
        └───────────────────────────────────────────────────────┼───┼─────────────────┘
                                                                 │   │
                          getAdapter(type) ─────────────────────►│   │
                                                                 ▼   ▼
        ┌──────────────────────────── adapter (per type) ────────────────────────────┐
        │  validate · resolve · onInit(+teardown) · notMerge · mergeData ·            │
        │  clearOnThemeChange   ── ALL per-type knowledge lives here                  │
        └─────────────────────────────────────────────────────────────────────────────┘
```

> **Rule.** Never add a `this._type === ChartType.Xxx` branch to `core.ts`.
> If the engine needs to behave differently for a type, that's a missing
> *capability* on the adapter contract — add the capability (like `mergeData`
> / `clearOnThemeChange`) and consult it via `getAdapter(type)`.

---

## 4. `onInit` teardown lifecycle

`onInit` fires after `setOption` on **every** render pass — not just the
first. The historical name is a slight misnomer kept for compatibility; treat
it as "post-render effect". Because it re-fires, any side effect it creates
(a `ResizeObserver`, a DOM listener, a `setInterval`) would stack and leak
without a teardown.

The engine solves this with a **React-effect-style** model: `onInit` may
return a `ChartTeardown` (`() => void`). The engine keeps exactly one pending
teardown and runs it at two moments.

```
render pass N            render pass N+1                 dispose()
─────────────            ───────────────                 ─────────
setOption                setOption
_runApplyCleanup()       _runApplyCleanup()  ◄─ runs N's teardown
  (no-op first pass)     onInit() → teardownₙ₊₁
onInit() → teardownₙ                                      _runApplyCleanup()  ◄─ runs the last teardown
store teardownₙ          store teardownₙ₊₁                (final)
```

Guarantees:

- **At most one active effect per chart at any time.** Pass N's observer is
  disconnected before pass N+1 creates its own.
- **Deterministic final cleanup.** The last pending teardown runs in
  `dispose()`, before `ecInstance.dispose()`.
- **Crash-safe.** `_runApplyCleanup()` wraps the call in try/catch and drops
  its reference *first*, so a throwing teardown can neither break the render/
  dispose path nor run twice.
- **Returning nothing is fine.** `void` ⇒ the engine stores `null`; there's
  simply nothing to clean up that pass.

### Canonical implementation — `src/adapters/pie.ts`

Pie's adaptive layout reads the live canvas size and re-flows on container
resize. Before the teardown contract it stashed the observer on the chart via
a symbol and polled `isDisposed()`. Now:

```ts
function attachResizeObserver(chart, recompute): (() => void) | void {
  if (typeof ResizeObserver === 'undefined') return;          // SSR / old browsers
  const dom = chart.getDom() as HTMLElement | undefined;
  if (!dom) return;
  const observer = new ResizeObserver(() => {
    if (chart.isDisposed()) { observer.disconnect(); return; } // belt-and-suspenders
    recompute();
  });
  observer.observe(dom);
  return () => observer.disconnect();                          // ← engine owns the lifecycle
}
```

`onInit` returns this teardown; the engine disconnects the old observer before
each re-render (so a theme change yields a fresh observer bound to the new
theme's closure) and on dispose. No instance state, no polling.

---

## 5. Side-effect & cleanup rules

**Do**

- Create observers / listeners / timers inside `onInit`.
- `return () => { /* disconnect / removeEventListener / clearInterval */ }`.
- Guard every browser global with `typeof X !== 'undefined'` and early-return
  a `void` teardown on the server.
- Call `applyConfiguredFontFamilyToOption(payload, getConfig().fontFamily)`
  before any **runtime** `chart.setOption(payload, ...)` you issue from inside
  `onInit` / an observer callback — the engine only injects font-family on the
  static path (step 3), so runtime payloads bypass it.

**Don't**

- Don't stash effect state on the chart instance (`chart.__myObserver = …`).
  The engine's one-teardown-at-a-time guarantee replaces that pattern.
- Don't poll `isDisposed()` as your primary cleanup mechanism — the engine
  calls your teardown on dispose. (A defensive `isDisposed()` check *inside* an
  async observer callback is fine as belt-and-suspenders.)
- Don't create side effects in `resolve()`. `resolve` must stay pure so SSR
  (`renderChartToSVGString`) and tests can call it without a live instance.
- Don't assume `onInit` runs once. It runs every pass; make it idempotent or
  rely on the teardown to reset.

---

## 6. Registry contract

`src/adapters/index.ts` is the single registry. Surface:

| Function | Purpose |
|----------|---------|
| `registerAdapter(type, adapter)` | Register/replace a type. Warns when shadowing a built-in (see below). |
| `getAdapter(type)` | The adapter or `undefined` — how the engine consults `mergeData` / `clearOnThemeChange`. |
| `hasAdapter(type)` | Cheap pre-flight before `createChart` (avoids a try/catch around the engine throw). |
| `listAdapters()` | All registered type strings (built-in + custom), in registration order. |
| `unregisterAdapter(type)` | Remove a type; returns whether one existed. For tests / hot-reload. |

All are re-exported from `src/index-core.ts` (the SSR-safe entry).

### Two guardrails — and why they live here, not in `core.ts`

1. **Override warning.** `registerAdapter` logs a `console.warn` when a
   consumer overrides a **built-in** type (the override still applies — it's a
   warning, not a block). Built-in type strings are snapshotted into
   `builtinTypes` at the *bottom* of the module, after all built-in
   registrations, so:
   - built-in registration itself never warns (snapshot is `null` during load), and
   - re-registering a *custom* type is silent (tests re-register custom stubs
     in `beforeEach` without noise).

   > Keep the snapshot below the built-in `registerAdapter` calls. Moving it up
   > would make every built-in warn on load.

2. **Actionable, value-free errors** from `resolveEChartsOption`:
   - Unknown type → lists the registered types and points at
     `registerAdapter`.
   - Invalid data → reports the payload's *shape* via `describeDataShape`
     (`an object with keys [a, b]` / `an array of length N`), **never the
     values**. Echoing user data into an error message risks leaking secrets
     and enables log injection.

   > When editing these messages, keep the `Unsupported chart type` /
   > `Invalid data for chart type` prefixes — tests match on them.

---

## 7. SSR / module-load safety

The lifecycle contract is what keeps `@bndynet/icharts/core` SSR-safe:

- `resolve()` is pure and synchronous — `renderChartToSVGString` runs the full
  adapter pipeline headlessly with no DOM.
- All browser-touching work is deferred into `onInit` (a callback that only
  runs against a live instance) and guarded with `typeof`. On the server
  `onInit` either isn't invoked (SSR render disposes immediately) or its
  guards early-return a `void` teardown.
- Nothing reachable from `core.ts` references `window` / `document` /
  `ResizeObserver` / etc. at module top level.

See the **SSR / module-load safety** section in [AGENTS.md](../AGENTS.md) for
the full import-graph rules and the dual-entry (`index.ts` vs `index-core.ts`)
contract.

---

## 8. Adding per-type runtime behavior — checklist

When a chart type needs the engine to do something special at runtime:

- [ ] Is it a **side effect on the live instance** (listener, observer,
      timer, post-init merge)? → wire it in `onInit`, return a teardown.
      Nothing changes in `core.ts`.
- [ ] Is it **data folding across `update()`**? → implement `mergeData(prev,
      next)` on the adapter. The engine calls it when both frames pass
      `validate`.
- [ ] Is it **a pre-repaint clear on theme switch**? → set
      `clearOnThemeChange: true` on the adapter.
- [ ] Is it **cross-frame animation**? → return `notMerge: false` from
      `resolve`.
- [ ] None of the above fit and you're tempted to branch on `type` in
      `core.ts`? → **stop.** Add a new capability field to `ChartAdapter`,
      document it here, and consult it via `getAdapter(type)`.

Reference implementations: `src/adapters/pie.ts` (`onInit` teardown),
`src/adapters/index.ts` gauge / liquid-progress (`mergeData`) and wordcloud
(`clearOnThemeChange`), `src/adapters/bar.ts` / `line.ts` (`notMerge: false`).
