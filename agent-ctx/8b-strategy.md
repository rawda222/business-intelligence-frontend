# Task 8b — Strategy Report Feature (TOWS + Priority Roadmap + Effort/Impact Scatter + Resource Assessment + Strategy View)

**Agent:** strategy (subagent)
**Task ID:** 8b
**Parent worklog:** `/home/z/my-project/worklog.md`
**Foundation consulted:** FOUNDATION REFERENCE section in worklog.md (imports, stores, hooks, shared components, types, visual rules).

## Files created

1. `src/components/strategy/tows-matrix.tsx` — 4-column SO/ST/WO/WT responsive grid (`lg:grid-cols-4`) of compact strategy cards. Each column header is a colored gradient strip (emerald / amber / violet / rose) with abbreviation chip + i18n label (`strategy.tows.{SO,ST,WO,WT}`). Body lists `TOWSStrategy[]` as compact `rounded-xl glass` cards: title (font-semibold), description (clamped to 3 lines), badges row (effort, impact, time_horizon, confidence via `formatPercent`), and tiny monospace chips for `leverages`. Empty column → muted `—`. Body uses `max-h-[28rem] overflow-y-auto scroll-area-custom`.

2. `src/components/strategy/priority-roadmap.tsx` — Vertical timeline. Sorts `PriorityAction[]` by `priority` rank (P0→P3 via `RANK_ORDER` map) then by `impact` desc. Each entry: left rail priority badge colored via `priorityColorClass(action.priority)` + connector line; `rounded-2xl glass` card with priority badge, `action_id` chip, title, description, meta row (`User`/`Clock`/`Target` icons + `strategy.owner`/`strategy.timeframe`/`strategy.kpi`), two mini effort/impact bars (`bg-amber-500` / `bg-emerald-500`), and dependency chips with `GitBranch` icon (`strategy.dependencies`).

3. `src/components/strategy/effort-impact-scatter.tsx` — Recharts `ScatterChart` inside `rounded-2xl glass` card, `ResponsiveContainer` height 320. X axis = effort (0..11, ticks every 2), Y axis = impact (0..11, ticks every 2). Two series: TOWS strategies (violet circles, radius ∝ confidence via `ZAxis dataKey="size"` range `[80, 380]`) and priority actions (indigo diamonds, radius ∝ `impact/10`). 4 `<ReferenceArea>` quadrants tinted with CSS var chart colors (Quick wins → chart-3 emerald, Major projects → chart-2 violet, Fill-ins → chart-4 amber, Thankless → chart-5 rose) + faint quadrant labels (`insideTopLeft` etc.) + dashed divider `ReferenceLine`s at x=5.5, y=5.5. Custom `CustomTooltip` shows title + effort + impact + confidence (`formatPercent`). Theme colors via CSS vars (`var(--chart-1..5)`, `var(--muted-foreground)`, `var(--border)`). Legend flips align (`left` for RTL, `right` for LTR). YAxis flips orientation for RTL.

4. `src/components/strategy/resource-assessment.tsx` — Summary header card: total estimated cost (sum via `formatCurrency` shown with `gradient-text`) + gap counts (low/medium/high) as colored chips using `gapColorClass`. Then a responsive grid (`sm:grid-cols-2 xl:grid-cols-3`) of resource cards. Each card: resource-type icon (`Users`/`DollarSign`/`Cpu`/`Database`/`BadgeCheck`) in a gradient-tinted tile, name + type label badge (`strategy.resourceType.*`), `current_state → required_state` with `ArrowRight` (rotates for RTL via `rtl:rotate-180`), `Separator`, then a gap badge (colored via `gapColorClass`) and `formatCurrency(estimated_cost_usd)`. Framer Motion fade/slide-up per card.

5. `src/components/views/strategy-report-view.tsx` — Main view. Reads `businessId` from `useUiStore`. Fetches `useStrategyReport(businessId)` + optional `useBusiness(businessId)` for the business name. Loading → `<ReportSkeleton />`. Error/empty → `<EmptyState icon={Target} title={t("strategy.empty.title")} description={t("strategy.empty.desc")} action={{label: t("businesses.detail.runPipeline"), onClick: navigate({view:"business-detail", businessId})}} />`. Header via `<PageHeader title subtitle icon={Target} meta=[report_id, business_type, strategic_posture, generatedAt via formatDate] actions={exportButton} />`. Export button (`FileDown` icon) calls `exportReportToPDF` with 4 sections (posture, TOWS matrix, priority plan as table, resources as table); on success toasts `toast.exported`. Strategic posture card (`rounded-2xl glass`, `Compass` icon, posture title with `gradient-text`, posture_rationale paragraph). TOWS matrix section. Then shadcn `<Tabs>` with 4 tabs: priority → `<PriorityRoadmap>`, effortImpact → `<EffortImpactScatter>` (flattens all TOWS strategies), resources → `<ResourceAssessment>`, campaigns → compact inline list of `campaign_brief_feed` (angle, pillar, source_strategy_id chip, confidence badge, needs/auto approval badge) + "View campaigns" button → `navigate({view:"campaigns", businessId})`. Wrapped in `<motion.div>` fade/slide-up. All labels via `useT()`.

## Files modified (additive only)

- `src/lib/i18n/translations.ts` — added 22 new keys under `strategy.*` (both AR + EN): `strategy.timeHorizon`, `strategy.dependencies`, `strategy.viewCampaigns`, `strategy.current`, `strategy.required`, `strategy.totalCost`, `strategy.quickWins`, `strategy.majorProjects`, `strategy.fillIns`, `strategy.thankless`, `strategy.gap.{low,medium,high}`, `strategy.resourceType.{human,capital,technology,data,brand}`, `strategy.legend.strategies`, `strategy.legend.actions`. All other pre-existing keys preserved.

## Decisions

- **Translation keys** — added the new keys to the existing `translations.ts` (foundation explicitly allows this). All new components and inline labels use `useT()`, no hardcoded strings — no placeholder text.
- **TOWS column colors** — used a clear, semantic palette: SO→emerald (offensive/use strengths), ST→amber (defensive/neutralize threats), WO→violet (improvement/fix weaknesses for opportunity), WT→rose (avoid/defensive-minimize). Matches the four-quadrant accent colors used elsewhere in the platform.
- **TOWS column body scroll** — each column has `max-h-[28rem] overflow-y-auto scroll-area-custom` so unequal column heights don't blow up the layout (the foundation's `max-h-96 overflow-y-auto` rule applied).
- **Effort/Impact scatter bubble size** — Recharts `ZAxis` `range={[80, 380]}` produces bubbles with radius ≈ 5–11px (area-based), which scales cleanly with `confidence` (0..1) for strategies and `impact/10` (0..1) for actions. Both series share the same ZAxis so the visual size is comparable.
- **Quadrant labels** — used Recharts `ReferenceArea` `label={{ position: "insideTopLeft"/"insideTopRight"/"insideBottomLeft"/"insideBottomRight", opacity: 0.7, fontSize: 10 }}` rather than absolutely-positioned divs, so labels track the chart correctly across ResponsiveContainer resizes.
- **Campaigns in this view** — per task constraint, rendered a compact inline summary list (NOT a reusable campaign card) inside the campaigns Tab + "View campaigns" button calling `navigate({view:"campaigns", businessId})`. No campaign components created.
- **PDF export sections** — built 4 sections (posture, TOWS matrix as a 2-column grid of cards, priority plan as a 5-column table with colored priority badges, resources as a 4-column table with total-cost preamble). Used the existing CSS classes from `pdf-export.ts` (`.card`, `.tag`, `.badge`, `.b-p0..p3`, `.grid`). All user-provided strings passed through `escapeHtml`.
- **RTL** — all logical CSS props (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`, `text-start`/`text-end`); icons that imply direction (ArrowRight, FileDown, GitBranch) use Tailwind `rtl:rotate-180` / `rtl:rotate-y-180` variants. Recharts `YAxis orientation` + `Legend align` flip with `isRTL`. Framer Motion `x` offsets flip with `isRTL`.
- **Empty/error/loading states** — used the shared `ReportSkeleton` and `EmptyState` components per the foundation. Error and "no report" both go through the same `EmptyState` path (since `useStrategyReport` returns undefined for both states).
- **No new app/ routes, API routes, mock data, or tests** — strictly followed the constraint.

## Verification

- `bunx eslint src/components/strategy/ src/components/views/strategy-report-view.tsx src/lib/i18n/translations.ts` → exit 0, no errors / warnings on my files.
- `bunx tsc --noEmit --skipLibCheck` → no errors on any of my files (the two initially-flagged issues — `Legend align="start"` typing and `never[]` array inference — were both fixed).
- Dev server (`bun run dev` on port 3000) responds 200 on `/` and on `/api/v1/businesses/biz_volume_cafe/reports/strategy`. Latest dev.log shows clean `✓ Compiled` lines, no module-not-found / runtime errors after my changes.
- Pre-existing lint errors in other files (`theme-toggle.tsx`, `pipeline-tracker.tsx`, `businesses-view.tsx`) are not mine and were untouched.

## Integration notes for the page.tsx / orchestrator

To wire this view into the SPA, the orchestrator needs to:
1. In `src/app/page.tsx`, switch on `useUiStore((s) => s.route.view)` and render `<StrategyReportView />` when `view === "strategy"`.
2. The view itself handles loading/error/empty states; it just needs `businessId` in the route (set by `navigate({view:"strategy", businessId})`).
3. Cross-linking: business-detail view's "Open Strategy report" button should call `navigate({view:"strategy", businessId})`. The strategy view's empty-state "Run pipeline" button calls `navigate({view:"business-detail", businessId})`, and its campaigns tab "View campaigns" button calls `navigate({view:"campaigns", businessId})`.
