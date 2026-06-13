# @bndynet/color-hub

A small color utility built on [colord](https://github.com/omgovich/colord). It manages multi-theme palettes, assigns colors to arbitrary keys (e.g. chart series names), and derives **default / hover / active / disabled** state colors for each base color.

## Requirements

- Node.js **≥ 18**

## Installation

```bash
npm install @bndynet/color-hub
```

## Quick start

### ESM

```ts
import { ColorHub, State } from '@bndynet/color-hub';

const hub = new ColorHub([
  {
    name: 'light',
    palette: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'],
    colorMap: {},
  },
]);

const series = hub.getColors('Series A');
console.log(series.default, series.hover, series.active, series.disabled);
```

### CommonJS

```js
const { ColorHub } = require('@bndynet/color-hub');
```

## Themes

You supply your own themes — the package ships no built-in color data, keeping it
small and unopinionated. A theme is just a `ColorTheme` object (see **Concepts**):

```ts
import { ColorHub } from '@bndynet/color-hub';

const hub = new ColorHub([
  {
    name: 'light',
    colorMode: 'light',
    palette: ['#2563eb', '#14b8a6', '#f97316', '#8b5cf6'],
    colorMap: {},
  },
]);
hub.switchTheme('light');

const sales = hub.getColors('Sales');
const profit = hub.getColors('Profit');

console.log(sales.default, profit.default);
```

### Browser (IIFE global)

The build emits `dist/index.global.js`. Include it on the page and use the global **`ch`** object (matches the `globalName` in `tsup`):

```html
<script src="./node_modules/@bndynet/color-hub/dist/index.global.js"></script>
<script>
  const hub = new ch.ColorHub([/* ... */]);
</script>
```

The IIFE bundle is also declared as the `./global` subpath export.

### Deep imports (tree-shaking)

Each feature module is published as a subpath export, so you can import just what
you need and let the bundler drop the rest:

```ts
import { harmony } from '@bndynet/color-hub/harmony';
import { createInterpolator } from '@bndynet/color-hub/interpolate';
import { simulate } from '@bndynet/color-hub/cvd';
```

Available subpaths: `./utils`, `./scale`, `./harmony`, `./css`, `./theme-factory`,
`./runtime`, `./cvd`, `./interpolate`, `./color-hub` (plus the `.` barrel and
`./global` IIFE). Every subpath ships ESM, CJS, and type declarations.

## Concepts

### `ColorHub`

The constructor takes an array of **`ColorTheme`** objects and an optional second argument **`options`** (`ColorHubOptions`); the first theme is selected by default.

- **`switchTheme(name)`**  
  Switches to the named theme. If the name is missing, it falls back to the first theme and resets the palette consumption index for the active theme.

- **`getCurrentTheme()`**  
  Returns the active **`ColorTheme`** (the same object the hub updates for `colorMap` and assignments). In **`StateRecipe`** handlers, use the second argument `hub.getCurrentTheme()`.

- **`getColors(key)`**  
  Returns the base color and four state colors for string `key` (see `StateColors` below). Resolution order:
  1. If **`colorMap[key]`** exists on the current theme, use it.
  2. Otherwise take the next unused color from **`palette`** in order.
  3. If the palette is exhausted, pick a new color: by default **golden-ratio** hue (`randomDistinctColor`); with **`options.paletteExhaustion: 'perceptual'`**, use **CIELAB ΔE76** spacing vs colors already assigned (`distinctColorPerceptual`).

- **`appendTheme(theme)`**  
  Appends a theme at runtime.

- **`appendPalette(name, palette)`**  
  Appends a new theme with only a name and palette (empty `colorMap`).

- **`onThemeChange(listener)`**  
  Subscribe to theme switches; the listener receives the new active theme after each `switchTheme`. Returns an unsubscribe function. (See `bindThemeToDOM` under **Runtime**.)

### `ColorTheme<T>`

| Field | Description |
|--------|-------------|
| `name` | Theme id for `switchTheme` |
| `colorMode?` | `'light'` or `'dark'` — semantic appearance when `name` does not encode light/dark (optional) |
| `palette?` | List of colors assigned in order to new keys |
| `colorMap?` | Established `key → color` assignments |
| `colors?` | Optional strongly typed named colors (`T`); read these in your app; `ColorHub` uses `palette` / `colorMap` for dynamic key assignment |
| `stateRecipe?` | Optional per-state overrides for hover / active / disabled / focus / selected (see **StateRecipe**); overrides hub-level `options.stateRecipe` per field |

Generic example:

```ts
interface AppColors {
  primary: string;
  background: string;
}

const hub = new ColorHub<AppColors>([
  {
    name: 'brand-a',
    colorMode: 'light',
    palette: ['#2563eb', '#16a34a'],
    colorMap: {},
    colors: {
      primary: '#2563eb',
      background: '#ffffff',
    },
  },
]);
```

### `State` and `StateColors`

Each object returned by `getColors` includes:

| Property | Meaning |
|----------|---------|
| `default` | Base color |
| `hover` | Lightened vs base (more in dark mode) |
| `active` | Darkened vs base |
| `disabled` | Same color with alpha **0.4** |
| `focus` | Same color with alpha **0.5** (focus ring/highlight) |
| `selected` | Subtle fill: lightened in light mode, darkened in dark mode |

Defaults are **`colorMode`-aware** (they read `getCurrentTheme().colorMode`): light mode uses `lighten 0.05` / `darken 0.1`, dark mode `lighten 0.1` / `darken 0.08`. All are computed with `lighten`, `darken`, and `alpha` (see Utilities) unless you supply a **StateRecipe** (which also accepts `focus` / `selected` and any custom state key).

### `StateRecipe` and `ColorHubOptions`

- **`StateRecipe`**: optional `hover` / `active` / `disabled`, each `(baseColor, hub) => string` — second argument is the **`ColorHub`** instance. Use `hub.getCurrentTheme()` for the active theme (`name`, `colorMode`, `colors`, `palette`, etc.). Omitted states keep the built-in defaults above.
- **Merge order**: built-in defaults → `new ColorHub(themes, { stateRecipe })` → current theme’s `stateRecipe` (theme wins per field).
- **`assignment`**: `'sequential'` (default) or `'hash'`. `sequential` takes the next unused palette color in request order. `hash` uses a deterministic `hash(key) → palette index`, so the **same key always maps to the same color regardless of request order** — ideal for keeping chart-series colors stable across renders/reloads (collisions may reuse a color).
- **`paletteExhaustion`**: `'golden'` (default) or `'perceptual'` — when the theme `palette` is exhausted, use golden-ratio hue or **CIELAB ΔE76** spacing (`distinctColorPerceptual`). Tune with **`perceptualMinDeltaE`** (default ~23) and **`perceptualMaxAttempts`** (default 100). (Applies to `sequential` assignment; `hash` always picks from the palette when it is non-empty.)

```ts
// Stable, order-independent colors for chart series
const hub = new ColorHub(
  [{ name: 'light', palette: ['#2563eb', '#14b8a6', '#f97316'], colorMap: {} }],
  { assignment: 'hash' },
);
hub.switchTheme('light');
hub.getColors('Sales').default; // same color no matter when 'Sales' is requested
```

```ts
import { ColorHub, lighten, darken } from '@bndynet/color-hub';

const hub = new ColorHub(
  [{ name: 'brand', colorMode: 'light', palette: ['#2563eb'], colorMap: {} }],
  {
    stateRecipe: {
      hover: (base, hub) =>
        hub.getCurrentTheme().colorMode === 'dark'
          ? darken(base, 0.08)
          : lighten(base, 0.12),
    },
  },
);
```

## Utilities (`utils`)

All transform helpers accept CSS-parseable color strings and return **hex** strings (`colord`’s `toHex()`), unless noted.

### Color adjustments

| Function | Description |
|----------|-------------|
| `alpha(color, a)` | Set alpha channel (`a` 0–1); hex may include alpha (`#rrggbbaa`) when needed |
| `lighten(color, amount)` | Lighten in HSL |
| `darken(color, amount)` | Darken in HSL |
| `saturate(color, amount)` | Increase saturation |
| `desaturate(color, amount)` | Decrease saturation |
| `invert(color)` | Mirror HSL lightness (`l → 100 - l`), keep hue/saturation — light↔dark adaptation |
| `grayscale(color)` | Same lightness, zero saturation |
| `rotateHue(color, degrees)` | Rotate hue on the wheel (e.g. `180` for complementary) |

### Mixing and ramps

| Function | Description |
|----------|-------------|
| `mix(color1, color2, ratio?)` | **sRGB channel** linear interpolation (gamma-encoded values); `ratio` 0 → `color1`, 1 → `color2` (default `0.5`). Fast and predictable; midpoints are not perceptually uniform. |
| `colorSteps(from, to, steps)` | Evenly spaced `mix` samples from `from` to `to` inclusive; `steps` ≥ 2 |
| `mixOklab(color1, color2, ratio?)` | Interpolate in **Oklab** (L, a, b linear), like CSS `color-mix(in oklab, …)`. Smoother, less “muddy gray” midpoints than sRGB `mix` or than polar OKLCH interpolation. |
| `mixOklch(color1, color2, ratio?)` | **Alias of `mixOklab`** (same implementation). |
| `colorStepsOklch(from, to, steps)` | Evenly spaced mixes using **`mixOklab`** (name kept for compatibility). |
| `colorStepsOklab(from, to, steps)` | **Alias of `colorStepsOklch`**. |

### Contrast and readability

| Function | Description |
|----------|-------------|
| `contrastRatio(foreground, background)` | WCAG 2.x contrast ratio (1–21) |
| `contrastText(background, options?)` | Returns `light` or `dark` text color (defaults `#ffffff` / `#000000`) using perceived brightness |
| `contrastThreshold(level?, size?)` | Minimum WCAG ratio for `'AA'`/`'AAA'` × `'normal'`/`'large'` (e.g. AA normal → 4.5) |
| `isAccessible(fg, bg, target?)` | Whether `fg` on `bg` meets a WCAG threshold. `target`: `{ level?, size?, ratio? }` (default AA / normal) |
| `ensureContrast(fg, bg, target?)` | Adjusts `fg` lightness (keeping hue/sat) until it meets the target ratio; falls back to black/white |
| `brightness(color)` | Perceived brightness 0–1 (colord / WCAG-derived) |
| `isDark(color)` / `isLight(color)` | Convenience wrappers around colord |

```ts
import { isAccessible, ensureContrast } from '@bndynet/color-hub';

isAccessible('#777', '#fff');                 // false (AA normal needs ≥ 4.5)
ensureContrast('#9bbcff', '#ffffff');         // darkened until ≥ 4.5:1 on white
ensureContrast('#1f3a8a', '#000', { level: 'AAA' }); // lightened until ≥ 7:1
```

### Tonal scales

| Function | Description |
|----------|-------------|
| `generateScale(base, options?)` | Build an 11-stop scale (`50`–`950`) from one color. The base anchors `500`; lighter stops blend toward white and darker stops toward black in **Oklab** (hue-stable, perceptually smooth). `options.mix` overrides per-stop blend amounts. |

```ts
import { generateScale } from '@bndynet/color-hub';

const blue = generateScale('#2563eb');
blue[50];  // very light tint
blue[500]; // ≈ '#2563eb' (the base)
blue[900]; // deep shade
```

### Color harmony

| Function | Description |
|----------|-------------|
| `harmony(base, scheme, options?)` | Dispatch by `scheme` (see below). `options`: `{ angle?, count? }` |
| `complementary(base)` | `[base, +180°]` |
| `analogous(base, angle?)` | `[base, +angle, -angle]` (default `30`) |
| `triadic(base)` | three colors 120° apart |
| `tetradic(base)` | rectangle: `[base, +60°, +180°, +240°]` |
| `splitComplementary(base)` | `[base, +150°, +210°]` |
| `monochromatic(base, count?)` | `count` shades of one hue from `generateScale` (default `5`, clamped 2–11) |

```ts
import { harmony, triadic } from '@bndynet/color-hub';

triadic('#2563eb');                 // ['#2563eb', '#eb2563', '#63eb25'] (approx)
harmony('#2563eb', 'analogous', { angle: 45 });
```

### Interpolation / continuous scales

Map a continuous value to a color over **your own** stop colors (the package ships
no built-in scales). Useful for heatmaps, choropleth maps, and value→color
mappings. Interpolation defaults to **Oklab** (perceptually smooth); pass
`{ space: 'srgb' }` for raw channel mixing.

| Function | Description |
|----------|-------------|
| `createInterpolator(stops, options?)` | Returns `(t) => hex` for `t` in `[0, 1]` (clamped), stops spread evenly. `options`: `{ space?: 'oklab' \| 'srgb' }` |
| `sample(stops, n, options?)` | `n` evenly spaced samples (inclusive endpoints); generalizes `colorSteps` to more than two stops |
| `createDivergingInterpolator(low, mid, high, options?)` | `(t) => hex` with `mid` fixed at `t = 0.5` — for signed data (e.g. -1…+1) |

```ts
import { createInterpolator, createDivergingInterpolator, sample } from '@bndynet/color-hub';

const heat = createInterpolator(['#2563eb', '#facc15', '#dc2626']);
heat(0);   // ≈ '#2563eb'
heat(0.5); // ≈ '#facc15'
heat(1);   // ≈ '#dc2626'

const corr = createDivergingInterpolator('#2563eb', '#f8fafc', '#dc2626');
corr(0.5); // ≈ '#f8fafc' (neutral midpoint)

sample(['#2563eb', '#dc2626'], 5); // 5 colors, inclusive endpoints
```

### Theme generation

| Function | Description |
|----------|-------------|
| `createThemeFromColor(base, options?)` | From one brand color, build `{ light, dark }` themes. The base anchors `palette[0]` (light); other colors spread by the golden angle. `options`: `{ name?, paletteSize?, saturation? }`. Semantic tokens are left to you. |
| `deriveDarkTheme(theme)` | Flip `colorMode` to `dark`, mirror named `colors` lightness (`invert`), and lift palette colors for dark backgrounds. Clones `colorMap`. |

```ts
import { ColorHub, createThemeFromColor } from '@bndynet/color-hub';

const { light, dark } = createThemeFromColor('#2563eb', {
  name: 'brand',
  paletteSize: 8,
});
const hub = new ColorHub([light, dark]); // 'brand-light' / 'brand-dark'
```

### CSS variables / theme output

| Function | Description |
|----------|-------------|
| `toCSSVariables(theme, options?)` | Map a theme's `colors` (camelCase → kebab-case) to `{ '--ch-grid': '#...' }`. `options`: `{ prefix?, includePalette?, includeColorMap? }` |
| `toCSSString(theme, options?)` | Render the variables as an injectable CSS rule. Adds `selector?` (default `:root`) |

```ts
import { toCSSString } from '@bndynet/color-hub';

const darkTheme = {
  name: 'dark',
  colorMode: 'dark' as const,
  colors: { background: '#020617', textPrimary: '#e2e8f0' },
  palette: ['#60a5fa', '#2dd4bf'],
};

toCSSString(darkTheme, {
  selector: '[data-theme="dark"]',
  includePalette: true,
});
// [data-theme="dark"] {
//   --ch-background: #020617;
//   --ch-text-primary: #e2e8f0;
//   --ch-palette-0: #60a5fa;
//   --ch-palette-1: #2dd4bf;
// }
```

### Runtime (browser)

Helpers to apply themes to the DOM and react to the system color scheme. All
feature-detect their globals, so importing them is safe in Node / SSR (they become
no-ops there).

| Function | Description |
|----------|-------------|
| `applyTheme(theme, options?)` | Write the theme's CSS variables on an element (default `document.documentElement`) and set `data-theme` to the theme name. `options` extend `toCSSVariables` with `{ target?, attribute? }` (`attribute: null` to skip) |
| `getSystemColorScheme()` | `'light'` / `'dark'` from `prefers-color-scheme` (`'light'` when unknown) |
| `watchSystemColorScheme(cb)` | Subscribe to OS scheme changes; returns an unsubscribe function |
| `persistThemeName(name, key?)` | Save the active theme name to `localStorage` (default key `color-hub-theme`) |
| `loadThemeName(key?)` | Read a persisted theme name, or `null` |
| `bindThemeToDOM(hub, options?)` | Apply the hub's current theme now and on every `switchTheme`; `options.persist` saves the name. Returns an unsubscribe function |

```ts
import { ColorHub, bindThemeToDOM, getSystemColorScheme } from '@bndynet/color-hub';

const hub = new ColorHub([light, dark]);
const unbind = bindThemeToDOM(hub, { persist: true });
hub.switchTheme(getSystemColorScheme() === 'dark' ? 'brand-dark' : 'brand-light');
// later: unbind();
```

### Parsing and conversion

| Function | Description |
|----------|-------------|
| `isValidColor(input)` | Whether the string/object parses as a color |
| `toRgb(color)` | `{ r, g, b, a }` for canvas/CSS (`a` 0–1) |
| `toHsl(color)` | `{ h, s, l, a }` (`h` 0–360, `s`/`l` 0–100, `a` 0–1) |
| `toHslString(color)` | CSS `hsl(...)` / `hsla(...)` string |
| `toOklab(color)` | `{ l, a, b }` OKLab coordinates (`l` ≈ 0–1) |
| `toOklch(color)` | `{ l, c, h, alpha }` OKLCH (`c` ≥ 0, `h` 0–360; achromatic → `h = 0`) |
| `toOklchString(color, precision?)` | CSS `oklch(L C H)` / `oklch(L C H / a)` (alpha omitted when opaque); modern browsers render this natively |

```ts
import { toOklchString } from '@bndynet/color-hub';

toOklchString('#ff0000');   // 'oklch(0.628 0.2577 29.2339)'
toOklchString('#ff000080'); // 'oklch(0.628 0.2577 29.2339 / 0.5)'
```

### Perceptual distance (pairwise separation)

| Function | Description |
|----------|-------------|
| `deltaE76(color1, color2)` | CIELAB ΔE76 (Euclidean in L*a*b*); no extra deps |
| `minDeltaE76ToExisting(candidate, existing[])` | Minimum ΔE76 from `candidate` to any color in `existing` |
| `deltaEOK(color1, color2)` | **OKLab** ΔEOK (Euclidean in OKLab); more perceptually uniform than ΔE76. Note the **smaller scale** — black↔white ≈ `1.0`, not ~100 |
| `minDeltaEOKToExisting(candidate, existing[])` | Minimum ΔEOK from `candidate` to any color in `existing` |
| `distinctColorPerceptual(existing[], options?)` | Sample hues until the min distance ≥ `minDeltaE` or fallback. `options.metric`: `'de76'` (default, threshold ~23) or `'deOK'` (threshold ~0.08) |

For **CIEDE2000**-based picking, use a library such as [culori](https://github.com/Evercoder/culori) in your app and pass the result into `palette` / `colorMap`. Publication-grade **colorblind-safe** palettes (e.g. Paul Tol) are best applied as explicit `palette` arrays rather than generated hues alone.

### Color-vision-deficiency (CVD) simulation

Simulate how a color is perceived under **protanopia**, **deuteranopia**, or
**tritanopia** (Machado et al. 2009 model). The intended use is a **palette
robustness check**: simulate the colors you assigned to chart series, then run
`deltaE76` / `deltaEOK` on the results to find pairs that collapse (become hard to
tell apart) and adjust your palette.

| Function | Description |
|----------|-------------|
| `simulate(color, type)` | `type`: `'protanopia' \| 'deuteranopia' \| 'tritanopia'` → simulated hex (alpha preserved) |
| `simulateAll(color)` | `{ protanopia, deuteranopia, tritanopia }` |

```ts
import { simulate, simulateAll, deltaEOK } from '@bndynet/color-hub';

simulate('#ff0000', 'deuteranopia'); // shifts toward olive/yellow

// Are two series colors still distinguishable for deuteranopes?
const a = '#d62728';
const b = '#2ca02c';
const safe = deltaEOK(simulate(a, 'deuteranopia'), simulate(b, 'deuteranopia')) > 0.1;
```

### Random helpers

| Function | Description |
|----------|-------------|
| `randomColor()` | Fully random 24-bit hex (quick prototypes) |
| `randomChartColor(saturation?, lightness?)` | Random hue with fixed S/L (good for charts) |
| `randomDistinctColor()` | Golden-ratio hue step (many distinguishable series) |

```ts
import {
  lighten,
  mix,
  mixOklab,
  mixOklch,
  colorStepsOklch,
  colorStepsOklab,
  contrastText,
  randomDistinctColor,
} from '@bndynet/color-hub';
```

## Development

```bash
npm install
npm run build       # writes dist/ (ESM, CJS, IIFE, declarations)
npm run typecheck   # tsc
npm run test        # vitest
npm run lint
```

If configured, `npm start` builds and serves the demo under `site/`.

## License

MIT
