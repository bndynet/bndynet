# @bndynet/layout

> Lightweight, headless, **framework-agnostic** layout library.

One unified layout schema, three layout engines (**grid**, **flex**, **absolute**), computed into
plain style objects you can apply with any framework or vanilla DOM. No React, no Vue, no
drag-and-drop dependencies — just a tiny, type-safe core.

## Install

```bash
npm install @bndynet/layout
```

## Quick start

Mount a layout directly into the DOM:

```ts
import { mountLayout, type GridLayout } from '@bndynet/layout';

const layout: GridLayout = {
  type: 'grid',
  cols: 12,
  rowHeight: 40,
  gap: 12,
  items: [
    { id: 'revenue', x: 0, y: 0, w: 6, h: 4 },
    { id: 'traffic', x: 6, y: 0, w: 6, h: 4 },
    { id: 'table', x: 0, y: 4, w: 12, h: 8 },
  ],
};

mountLayout(document.getElementById('app')!, {
  layout,
  content: {
    revenue: 'Revenue',
    traffic: 'Traffic',
    table: (item) => {
      const node = document.createElement('div');
      node.textContent = `Widget: ${item.id}`;
      return node;
    },
  },
});
```

Or compute styles headlessly and apply them however you like:

```ts
import { computeLayout } from '@bndynet/layout';

const { containerStyle, itemStyles, rects } = computeLayout(layout, { width: 1200 });
```

## Features

- **Unified schema**, three engines: `grid` / `flex` / `absolute`.
- **Headless**: engines are pure functions returning `containerStyle` / `itemStyles` / `rects`.
- **Framework-agnostic**: use it in React, Vue, Svelte, or plain HTML.
- **Responsive** breakpoints with id-based override merging.
- **Nested** layouts (a layout inside a layout item).
- **Type-safe**: full TypeScript types, no `any` in the public API.
- **Extensible**: register custom engines via the registry.

For the full API reference and more examples, see
[`packages/layout/README.md`](packages/layout/README.md).

## Develop in this repo

This is an npm workspaces monorepo containing the library (`packages/layout`) and a live demo
(`apps/demo`).

```bash
npm install      # install all workspace dependencies
npm start        # run the demo site in dev mode
npm run test:run # run the library tests
npm run build    # build the library and the demo
```

## License

MIT
