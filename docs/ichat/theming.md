# Theming

All visual styles are driven by CSS custom properties. Override them on `:root`, **`<i-chat>`**, or any ancestor to customize the look and feel — no need to touch the source.

- [Host theme contract (light / dark)](#host-theme-contract-light--dark)
- [Mermaid CSS custom properties](#mermaid-css-custom-properties)
- [Token architecture](#token-architecture)
- [How derivation works](#how-derivation-works)
- [Quick example — dark theme](#quick-example--dark-theme)
- [CSS custom properties reference](#css-custom-properties-reference)
- [Minimal override set](#minimal-override-set)

## Host theme contract (light / dark)

Built-in pieces that must **track page light/dark** — fenced **`chart`** blocks (ECharts / `@bndynet/icharts`) and fenced **`mermaid`** blocks — all follow the **same** rules on the **document root** (`document.documentElement`, i.e. **`<html>`**):

| Signal | Dark mode |
|--------|-----------|
| **`class`** | `<html class="…">` **includes** the token `dark` (e.g. Tailwind / Element Plus style `class="dark"`). |
| **`data-theme`** | The attribute value **contains the substring** `dark` (e.g. `dark`, `github-dark`, `preferred-color-scheme-dark`). |

If **neither** applies, the page is treated as **light** for these integrations.

**Set the contract on `<html>`** so chart and Mermaid stay aligned with your app chrome. Example (JS):

```js
document.documentElement.setAttribute('data-theme', 'dark');
document.documentElement.classList.add('dark');
```

Toggling **only** `<body>` or a nested wrapper without updating `<html>` may leave charts/Mermaid on the previous palette.

**What the library watches:** a `MutationObserver` on **`<html>`** for **`data-theme`** and **`class`**. Charts call `@bndynet/icharts` `switchTheme('dark' | 'light')`. Mermaid re-runs `render()` with **`theme: 'base'`**, **`darkMode`** derived from the same signals, and **`themeVariables`** merged from optional **`--chat-mermaid-*`** tokens (falling back to **`--chat-*`** as in [Mermaid CSS custom properties](#mermaid-css-custom-properties)). Message bodies use **Shadow DOM**; the implementation **walks open shadow roots** to find `<i-chart>` / `<i-chat-mermaid>` so diagrams inside bubbles still update.

**CSS-only dark:** the [Quick example — dark theme](#quick-example--dark-theme) below uses `:root[data-theme="dark"] { … }`. You can instead put the `dark` **class** on `<html>` and drive `--chat-*` from `html.dark { … }` — both satisfy the contract above.

**Limitations:** Closed shadow trees or theme flags set **only** on inner nodes (never reflected on `<html>`) are invisible to this contract; use `<html>` for global theme, or supply your own `BlockRenderer` / styling.

## Mermaid CSS custom properties

Fenced **`mermaid`** blocks render inside **`<i-chat-mermaid>`**. The renderer uses Mermaid **`theme: 'base'`** and fills **`themeVariables`** from `getComputedStyle(host)` on that element: for each `--chat-mermaid-*` below, if the value is empty after `trim()`, the listed **`--chat-*`** fallbacks are read in order (still on the same host, so inherited `:root` tokens apply). You do **not** need to define `--chat-mermaid-*` unless you want diagram-only overrides.

| Property | Derives from (read order) | Description |
|----------|---------------------------|-------------|
| `--chat-mermaid-background` | `--chat-bg` | Diagram canvas / outer background |
| `--chat-mermaid-text` | `--chat-text` | Primary labels and node text |
| `--chat-mermaid-text-secondary` | `--chat-text-secondary` | Secondary labels (loops, tertiary text) |
| `--chat-mermaid-line` | `--chat-border` | Lines, borders, arrows, links |
| `--chat-mermaid-node-fill` | `--chat-surface-alt` | Primary block fill (first in the shared `node-fill` → `main-fill` → `--chat-surface-alt` chain) |
| `--chat-mermaid-cluster-fill` | `--chat-surface-alt` | Cluster / subgraph fill |
| `--chat-mermaid-main-fill` | `--chat-surface` | Second choice in the **same** block-fill chain if `node-fill` is unset (not a separate layer for flowchart nodes) |
| `--chat-mermaid-tertiary-fill` | `--chat-surface` | Tertiary fills |
| `--chat-mermaid-primary` | `--chat-primary` | Accent (primary-colored elements) |
| `--chat-mermaid-primary-contrast` | `--chat-self-text`, `--chat-user-text`, then `--chat-text` | Text on primary-colored shapes |
| `--chat-mermaid-secondary-fill` | `--chat-primary-light` | Secondary fills (e.g. activation bars) |
| `--chat-mermaid-note-fill` | `--chat-code-bg` | Note / callout background |
| `--chat-mermaid-note-text` | `--chat-code-text` | Note / callout text |
| `--chat-mermaid-edge-label-bg` | `--chat-surface` | Edge label background |

**Why `mainBkg` / `nodeBkg` / actors look the same:** Mermaid’s flowchart stylesheet uses `themeVariables.mainBkg` for `.node rect` fills, while sequence diagrams use `actorBkg`. The integration resolves one **block** color from `node-fill` → `main-fill` → `--chat-surface-alt`, assigns it to **both** `mainBkg` and `nodeBkg`, and sets `actorBkg` to that value so flowchart and sequence participant boxes stay aligned.

The TypeScript package also exports **`CHAT_MERMAID_TOKEN_NAMES`** from `@bndynet/ichat-renderers` for tooling or docs.

## Token architecture

The library uses a **12 base token** system. Every component-specific token (user bubbles, reasoning, timeline, form, input, etc.) automatically derives from these base tokens via `var()` chaining. Most apps only need to set these 12 properties to completely re-theme the UI:

| Token | Light default | Description |
|-------|---------------|-------------|
| `--chat-bg` | ![#f7f7f8](https://placehold.co/14x14/f7f7f8/f7f7f8.png) `#f7f7f8` | Container background |
| `--chat-surface` | ![#ffffff](https://placehold.co/14x14/ffffff/e5e7eb.png) `#ffffff` | Card / bubble surface |
| `--chat-surface-alt` | ![#f0f2f5](https://placehold.co/14x14/f0f2f5/f0f2f5.png) `#f0f2f5` | Alternate surface (table headers, summaries) |
| `--chat-border` | ![#e5e7eb](https://placehold.co/14x14/e5e7eb/e5e7eb.png) `#e5e7eb` | Borders and dividers |
| `--chat-text` | ![#1a1a2e](https://placehold.co/14x14/1a1a2e/1a1a2e.png) `#1a1a2e` | Primary text |
| `--chat-text-secondary` | ![#6b7280](https://placehold.co/14x14/6b7280/6b7280.png) `#6b7280` | Secondary text (labels) |
| `--chat-text-muted` | ![#9ca3af](https://placehold.co/14x14/9ca3af/9ca3af.png) `#9ca3af` | Muted text (timestamps, placeholders) |
| `--chat-primary` | ![#2563eb](https://placehold.co/14x14/2563eb/2563eb.png) `#2563eb` | Accent / brand color |
| `--chat-primary-light` | ![#dbeafe](https://placehold.co/14x14/dbeafe/dbeafe.png) `#dbeafe` | Light tint of primary |
| `--chat-error` | ![#ef4444](https://placehold.co/14x14/ef4444/ef4444.png) `#ef4444` | Error / danger color |
| `--chat-success` | ![#10b981](https://placehold.co/14x14/10b981/10b981.png) `#10b981` | Success color |
| `--chat-warning` | ![#f59e0b](https://placehold.co/14x14/f59e0b/f59e0b.png) `#f59e0b` | Warning color |

## How derivation works

Component-specific tokens chain to base tokens. You can override any component token for fine-grained control, but you don't have to:

| Component token | Derives from |
|----------------|--------------|
| `--chat-user-bg` | `--chat-primary` |
| `--chat-assistant-bg` | `--chat-surface` |
| `--chat-assistant-text` | `--chat-text` |
| `--chat-peer-bg` | `--chat-surface` |
| `--chat-reasoning-bg` | `--chat-primary-light` |
| `--chat-reasoning-text` | `--chat-primary` |
| `--chat-reasoning-border` | `color-mix(--chat-primary, --chat-border)` |
| `--chat-error-color` | `--chat-error` |
| `--chat-error-bg` | `color-mix(--chat-error, --chat-surface)` |
| `--chat-timeline-done` | `--chat-success` |
| `--chat-timeline-error` | `--chat-error` |
| `--chat-kpi-trend-up` | `--chat-success` |
| `--chat-kpi-trend-down` | `--chat-error` |
| `--chat-input-bg` | `--chat-surface` |
| `--chat-input-border` | `--chat-border` |
| `--chat-input-text` | `--chat-text` |
| `--chat-input-primary` | `--chat-primary` |
| `--chat-mermaid-background` | `--chat-bg` |
| `--chat-mermaid-text` | `--chat-text` |
| `--chat-mermaid-text-secondary` | `--chat-text-secondary` |
| `--chat-mermaid-line` | `--chat-border` |
| `--chat-mermaid-node-fill` | `--chat-surface-alt` |
| `--chat-mermaid-cluster-fill` | `--chat-surface-alt` |
| `--chat-mermaid-main-fill` | `--chat-surface`, then `--chat-surface-alt` (after `node-fill` in the shared block-fill chain) |
| `--chat-mermaid-tertiary-fill` | `--chat-surface` |
| `--chat-mermaid-primary` | `--chat-primary` |
| `--chat-mermaid-primary-contrast` | `--chat-self-text`, `--chat-user-text`, `--chat-text` |
| `--chat-mermaid-secondary-fill` | `--chat-primary-light` |
| `--chat-mermaid-note-fill` | `--chat-code-bg` |
| `--chat-mermaid-note-text` | `--chat-code-text` |
| `--chat-mermaid-edge-label-bg` | `--chat-surface` |
| `--chat-form-*` | Various `--chat-*` base tokens |

## Quick example — dark theme

With the 12-token architecture, a dark theme only needs the base tokens plus any design-constant overrides (like code block colors). Pair this selector with **`data-theme` on `<html>`** (or use **`html.dark`** tokens) so it matches the [host theme contract](#host-theme-contract-light--dark) for charts and Mermaid.

```css
:root[data-theme="dark"] {
  --chat-bg:            #16213e;
  --chat-surface:       #1e1e3a;
  --chat-surface-alt:   #2d2d44;
  --chat-border:        #404060;
  --chat-text:          #e0e0e0;
  --chat-text-secondary:#a0a0b0;
  --chat-text-muted:    #707080;
  --chat-primary:       #818cf8;
  --chat-primary-light: #312e81;
  --chat-error:         #f87171;
  --chat-success:       #10b981;
  --chat-warning:       #fbbf24;

  /* Design constants (not derived from base) */
  --chat-code-bg:       #0d1117;
  --chat-code-text:     #c9d1d9;
  --chat-shadow-sm:     0 1px 2px rgba(0, 0, 0, 0.3);
  --chat-shadow-md:     0 4px 12px rgba(0, 0, 0, 0.4);
}
```

## CSS custom properties reference

> **Naming convention:** `--chat-<category>-<detail>`. All properties have sensible light-theme defaults; you only need to override what you want to change.

For **avatar colors**, each role uses two CSS levels only: `--chat-avatar-<role>-{bg|text}` then shared `--chat-avatar-{bg|text}`, then built-in defaults. Set `--chat-avatar-bg` once to tint every role, or e.g. `--chat-avatar-user-bg` for `role: self` only.

### Typography

| Property | Default | Description |
|----------|---------|-------------|
| `--chat-font-family` | system stack | Primary font family |
| `--chat-font-mono` | `SF Mono, Consolas, …` | Monospace font for code |
| `--chat-font-size` | `0.9375rem` | Base font size |
| `--chat-font-size-sm` | `0.8125rem` | Small text (timestamps, labels, code blocks) |
| `--chat-font-size-lg` | `1rem` | Large text (empty state) |
| `--chat-line-height` | `1.6` | Base line height for message text |

### Colors — 12 Base Tokens

| Property | Default | Description |
|----------|---------|-------------|
| `--chat-bg` | `#f7f7f8` | Container background |
| `--chat-surface` | `#ffffff` | Elevated surface (bubbles, scroll button, cards) |
| `--chat-surface-alt` | `#f0f2f5` | Alternative surface (table headers, charts, action hover) |
| `--chat-border` | `#e5e7eb` | Borders, dividers, scrollbar thumb |
| `--chat-text` | `#1a1a2e` | Primary text color |
| `--chat-text-secondary` | `#6b7280` | Secondary text (labels, blockquote) |
| `--chat-text-muted` | `#9ca3af` | Muted text (timestamps, placeholders) |
| `--chat-primary` | `#2563eb` | Accent / link color, typing cursor |
| `--chat-primary-light` | `#dbeafe` | Light tint of primary (reasoning bg, highlights) |
| `--chat-error` | `#ef4444` | Error / danger color |
| `--chat-success` | `#10b981` | Success color (timeline done, KPI trend up) |
| `--chat-warning` | `#f59e0b` | Warning color |

### Colors — Self bubble (`role: self`)

| Property | Default | Description |
|----------|---------|-------------|
| `--chat-self-bg` | `= --chat-user-bg` | Self message background |
| `--chat-self-text` | `= --chat-user-text` | Self message text |
| `--chat-user-bg` | `= --chat-primary` | User bubble background (derives from primary) |
| `--chat-user-text` | `#ffffff` | User bubble text (inverted) |
| `--chat-avatar-user-bg` | chain | Self avatar ring (`--chat-avatar-bg` then default) |
| `--chat-self-code-inline-bg` | chain | Inline code inside self bubble |

### Colors — Peer bubble (`role: peer`)

| Property | Default | Description |
|----------|---------|-------------|
| `--chat-peer-bg` | `= --chat-surface` | Peer message background (via `--chat-assistant-bg`) |
| `--chat-peer-text` | `= --chat-text` | Peer message text (via `--chat-assistant-text`) |
| `--chat-avatar-peer-bg` | chain | Peer avatar ring (`--chat-avatar-bg` then default) |
| `--chat-peer-code-inline-bg` | `= --chat-code-inline-bg` | Inline code inside peer bubble |

### Colors — Assistant bubble

| Property | Default | Description |
|----------|---------|-------------|
| `--chat-assistant-bg` | `= --chat-surface` | Assistant message background |
| `--chat-assistant-text` | `= --chat-text` | Assistant message text |
| `--chat-avatar-assistant-bg` | chain | Assistant avatar (`--chat-avatar-bg` then default) |

### Colors — Avatars (system + shared)

| Property | Default | Description |
|----------|---------|-------------|
| `--chat-avatar-system-bg` | chain | System message avatar (`--chat-avatar-bg` then default) |
| `--chat-avatar-system-text` | chain | System avatar glyph color |
| `--chat-avatar-bg` | `= --chat-surface-alt` | Shared avatar background when role token is unset |
| `--chat-avatar-text` | `= --chat-text-secondary` | Shared avatar glyph color when role token is unset |

### Colors — Reasoning

| Property | Default | Description |
|----------|---------|-------------|
| `--chat-reasoning-bg` | `= --chat-primary-light` | Reasoning block background |
| `--chat-reasoning-border` | derived | Reasoning block border (mix of `--chat-primary` and `--chat-border`) |
| `--chat-reasoning-text` | `= --chat-primary` | Reasoning header text |
| `--chat-reasoning-header-hover-bg` | derived | Reasoning header hover overlay |

### Colors — Code (design constant)

| Property | Default | Description |
|----------|---------|-------------|
| `--chat-code-bg` | `#1e1e2e` | Code block background |
| `--chat-code-text` | `#cdd6f4` | Code block text |
| `--chat-code-inline-bg` | `rgba(0,0,0,0.06)` | Inline code background |
| `--chat-user-code-inline-bg` | `rgba(255,255,255,0.15)` | Inline code inside self bubble |

### Colors — Status (derived from base)

| Property | Default | Description |
|----------|---------|-------------|
| `--chat-error-color` | `= --chat-error` | Error text color |
| `--chat-error-bg` | derived | Error background (mix of `--chat-error` and `--chat-surface`) |
| `--chat-timeline-done` | `= --chat-success` | Timeline done step indicator |
| `--chat-timeline-active` | `= --chat-primary` | Timeline active step indicator |
| `--chat-timeline-error` | `= --chat-error` | Timeline error step indicator |
| `--chat-kpi-trend-up` | `= --chat-success` | KPI positive trend color |
| `--chat-kpi-trend-down` | `= --chat-error` | KPI negative trend color |

### Colors — Misc

| Property | Default | Description |
|----------|---------|-------------|
| `--chat-blockquote-bg` | `rgba(0,0,0,0.02)` | Blockquote background |
| `--chat-chart-bar-track-bg` | `rgba(0,0,0,0.04)` | Chart bar track background |

### Spacing

| Property | Default | Description |
|----------|---------|-------------|
| `--chat-spacing-xs` | `4px` | Extra-small gap |
| `--chat-spacing-sm` | `8px` | Small gap |
| `--chat-spacing-md` | `16px` | Medium gap (default padding) |
| `--chat-spacing-lg` | `24px` | Large gap (message list padding) |
| `--chat-spacing-xl` | `32px` | Extra-large gap |

### Border radius

| Property | Default | Description |
|----------|---------|-------------|
| `--chat-radius-sm` | `6px` | Small radius (bubble tail, code, images) |
| `--chat-radius` | `12px` | Medium radius (container, code blocks, reasoning) |
| `--chat-radius-lg` | `18px` | Large radius (message bubbles) |

### Shadows

| Property | Default | Description |
|----------|---------|-------------|
| `--chat-shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Assistant bubble shadow |
| `--chat-shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | Scroll-to-bottom button shadow |

### Transitions

| Property | Default | Description |
|----------|---------|-------------|
| `--chat-transition-fast` | `150ms ease` | Fast hover/press transitions |
| `--chat-transition-normal` | `250ms ease` | Normal transitions (message appear, reasoning toggle) |

### Layout

| Property | Default | Description |
|----------|---------|-------------|
| `--chat-avatar-size` | `32px` | Avatar width & height |
| `--chat-message-max-width` | `85%` | Max width of a single message row |
| `--chat-messages-max-width` | `100%` | Max width of the message list inner area (fills host; override e.g. `800px` or `min(100%, 48rem)` for a centered reading column) |
| `--chat-scrollbar-width` | `6px` | Scrollbar width (WebKit) |

## Minimal override set

For most themes you only need to set these **12 base tokens** — everything else derives from them automatically:

```css
:root {
  --chat-bg: …;
  --chat-surface: …;
  --chat-surface-alt: …;
  --chat-border: …;
  --chat-text: …;
  --chat-text-secondary: …;
  --chat-text-muted: …;
  --chat-primary: …;
  --chat-primary-light: …;
  --chat-error: …;
  --chat-success: …;
  --chat-warning: …;
}
```

For fine-grained control, override any component-specific token (e.g. `--chat-user-bg`, `--chat-reasoning-text`, `--chat-code-bg`) — these accept the same `var()` chaining pattern and fall back to the relevant base token.
