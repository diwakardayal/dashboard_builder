# ADR: State Management & Charting Library

## Context
The POC needs global state that spans widget configs, layout positions, and
data-source mappings, updated frequently (drag/resize) and persisted to
localStorage. It also needs to render four structurally different chart
types without the shell knowing what "categorical" or "hierarchical" mean.

## Decision 1: Zustand over Redux/Context

**Chosen: Zustand.**

- No provider wrapping, no boilerplate action types/reducers — a single
  `create()` call defines state + actions colocated, which keeps the
  "Dashboard Shell vs Widget Logic" separation clean (widgets never import
  the store directly except through the two scoped selector hooks
  `useWidgetInstance` / `useLayout`).
- Built-in `persist` middleware gives layout persistence "for free" with a
  one-line `partialize` filter — no manual `localStorage.setItem` scattered
  through the app.
- Selector-based subscriptions (`useDashboardStore(s => s.widgets[id])`) mean
  a config change on widget A re-renders **only** widget A. Redux gets you
  this too via `useSelector` + `reselect`, but at more setup cost for a POC
  of this size. React Context was rejected outright — a single context
  covering widgets+layout would re-render every consumer on every keystroke
  in a config panel or every pixel of a drag.

**Trade-off accepted:** Zustand's simplicity means less enforced structure
than Redux (no strict action log, no time-travel debugging by default). For
a production system with many contributors, Redux Toolkit or Jotai (for
even more granular atom-level subscriptions) would be reasonable
alternatives — noted for the "how would you scale this" conversation.

## Decision 2: Recharts over Nivo / visx / D3-direct

**Chosen: Recharts.**

- Covers all four required chart shapes (Bar, Line, Treemap, Scatter) with
  one dependency and consistent, declarative React component APIs — no
  imperative DOM/canvas management to reconcile with React's render cycle.
- `ResponsiveContainer` handles the "resize without layout thrash"
  requirement out of the box, which matters a lot inside a react-grid-layout
  cell that's actively being resized.
- TypeScript types are adequate (a couple of `any` escapes were needed for
  Treemap's custom `content` renderer — recharts 2.x's typings are looser
  there than the rest of the library).

**Trade-off accepted:** visx (Airbnb) or raw D3 would give more control over
non-standard visualizations (e.g. Sankey, which the spec lists as an
acceptable "Relational" alternative to Scatter) and smaller bundle size, at
the cost of writing far more layout/axis code by hand. For this POC's scope,
Recharts' batteries-included approach was the better time-to-value trade.
Recharts 3.x was available but 2.x was kept for stability during the build;
migrating is a documented, mechanical upgrade.

## Decision 3: Dynamic registry pattern for "Dashboard Shell vs Widget Logic"

The shell (`DashboardShell`, `WidgetContainer`) never imports a concrete
chart component. It only calls `getWidgetDefinition(type)` /
`listWidgetDefinitions()` against a `Map` populated by `registerWidget()`
calls. This is what makes "adding a chart type" a pure addition rather than
a modification — verified directly in `frontend/src/__tests__/registry.test.tsx`,
which registers a throwaway 5th widget type mid-test and asserts the
existing four are untouched.
