# Handling Data Drift Against a Live Production Stream

This POC uses a mock engine that always produces schema-valid data. A real
production stream will not be this well-behaved — upstream services change
field names, add optional fields, silently change units, or start sending
nulls where numbers used to be. Here's how I'd extend this architecture to
handle that.

## 1. Treat the Zod schemas as a contract, not a formality

The schemas in `backend/src/types/schemas.ts` already double as runtime
validators. Against a live stream, every inbound payload gets parsed with
`safeParse` before it's forwarded to the frontend:

- **Success** → forward as-is.
- **Failure** → don't crash the endpoint. Log the Zod error (which field,
  what was expected vs received) to a drift-monitoring channel, and either
  (a) serve the last known-good cached value for that widget with a
  "stale data" flag, or (b) apply a best-effort coercion (e.g. a stringified
  number) if the drift is minor and well understood.

This is the same pattern already used in `buildWidgetResponse` — it just
currently validates *our own generator's* output; against a real stream it
validates *someone else's* output, which is the actual point of having the
schema at all.

## 2. Version the schema, not just the endpoint

When a producer team changes their payload shape, the contract should be
versioned explicitly (`/api/widgets/temporal?schemaVersion=2` or a version
field in the payload itself) rather than the backend silently trying to
support two shapes forever. Old widget instances persisted in a user's
localStorage layout should keep working against the version they were built
against; new widgets default to the latest.

## 3. Detect drift before it reaches the UI

Two complementary techniques:

- **Structural drift** (fields added/removed/retyped): caught immediately by
  the Zod `safeParse` above — this is cheap and deterministic.
- **Statistical drift** (the shape is still valid, but the *distribution*
  changed — e.g. a "categorical" value field that used to range 0–100
  suddenly ranges 0–100,000): this needs a lightweight rolling stats check
  per widget type (mean/stddev or percentile tracking) that flags outliers
  for review. This wouldn't block the request, but would surface a "data
  looks unusual" badge on the widget — genuinely useful signal for a
  dashboard, not just a defensive measure.

## 4. Keep the frontend defensive regardless

The widget components already guard against empty/malformed arrays
(`CategoricalWidget`, `RelationalWidget`) and unparseable dates
(`TemporalWidget`). Against live data this same defensiveness extends to:
partial payloads (render what parsed, badge what didn't), and the existing
per-widget `WidgetErrorBoundary` means a drift-induced render crash in one
widget never takes the rest of the dashboard down — this is why the
boundary is scoped per-widget rather than once at the app root.

## 5. Contract tests between producer and consumer

For a real production system, I'd add consumer-driven contract tests (e.g.
Pact) so the team producing the stream gets a CI failure *before* shipping a
breaking change, rather than the dashboard discovering it at runtime. The
Zod schemas here are already the natural source of truth to generate those
contracts from.
