# Business Intelligence Platform — Frontend Worklog

Project: Production Next.js 16 SPA frontend for a multi-agent AI SaaS (SWOT Agent v7 + Strategy Agent v1).
Backend contract: FastAPI at port 8000 (via gateway `?XTransformPort=8000`). Schemas match the spec's Pydantic models exactly.
Constraint: Only `/` route is user-visible → built as a polished SPA with client-side view switching (Zustand `ui-store`).
Mock layer: Local Next.js API routes under `/api/v1/...` faithfully implement the schemas with realistic AR+EN mixed evidence, so the app is fully functional. Flip `USE_REAL_BACKEND` in `src/lib/api/client.ts` (appends `XTransformPort=8000`) to point at the real FastAPI backend.

---
Task ID: 1
Agent: main (orchestrator)
Task: Foundation setup — theme, fonts, providers, layout

Work Log:
- Installed `axios`, `react-dropzone`, `server-only`.
- Wrote `src/app/globals.css` — indigo/violet primary, glassmorphism (`.glass`, `.glass-strong`), gradient-mesh, `.gradient-primary`, `.gradient-text`, custom scrollbar (`.scroll-area-custom`), shimmer/pulse animations, RTL typography (Cairo font).
- Wrote `src/app/layout.tsx` + `src/components/providers.tsx` — Geist + Cairo fonts, ThemeProvider (next-themes, default dark), QueryClientProvider, I18nProvider, TooltipProvider, Sonner toaster.
- Wrote `src/types/index.ts` — exact Pydantic mirrors: User, Auth, Business, Pipeline (9 stages incl. `queued`), SWOTItem/Report/Envelope, TOWSStrategy/PriorityAction/ResourceItem/CampaignBrief, StrategyReport/Envelope, CampaignsReportEnvelope, HistoryEntry. Envelopes add `report_id`/`business_id`/`created_at` (Mongo).
- Wrote `src/lib/i18n/translations.ts` (AR+EN dict, ~180 keys) + `src/lib/i18n/i18n.tsx` — `useT()` returns `{locale, dir, isRTL, t(key, vars?)}`; `I18nProvider` syncs `<html dir/lang>`. Persisted locale.
- Wrote stores: `src/lib/stores/auth-store.ts` (JWT persisted), `src/lib/stores/ui-store.ts` (SPA router: `route:{view, businessId?}`, `navigate`, `back`, `sidebarOpen`).
- Wrote `src/lib/api/client.ts` — axios instance, baseURL `/api/v1`, JWT interceptor, refresh-on-401, `USE_REAL_BACKEND` flag appends `?XTransformPort=8000`. Plus `src/lib/api/{auth,businesses,reports}.ts` and hooks `use-businesses.ts`, `use-reports.ts`.
- Wrote `src/lib/utils/format.ts` (currency/ms/date/percent/score colors/sentiment) + `src/lib/utils/pdf-export.ts` (dependency-free print-to-PDF via new window).
- Wrote mock layer: `src/lib/api/mock-db.ts` (3 businesses w/ full SWOT+Strategy+Campaigns: Volume Cafe, Layali Restaurant, Glow Salon; 1 draft business: Pulse Gym) + `src/lib/api/mock-auth.ts`. Wrote ALL route handlers under `src/app/api/v1/...`.
- Wrote shared components: `dashboard/sidebar-pro.tsx`, `dashboard/top-navbar.tsx`, `dashboard/theme-toggle.tsx`, `dashboard/language-switcher.tsx`, `shared/page-header.tsx`, `shared/kpi-card.tsx`, `shared/empty-state.tsx`, `shared/skeletons.tsx`, `shared/pipeline-tracker.tsx` (animated 9-stage), `shared/file-uploader.tsx` (react-dropzone + progress), `shared/app-shell.tsx` (sticky footer).
- Wrote `src/components/views/auth-view.tsx` (login/register w/ react-hook-form + zod).

Stage Summary:
- Foundation complete. Auth gate, SPA router, API layer, mock data, and shared UI all in place.
- Remaining: build the feature views (Dashboard, Businesses, Business detail, Upload, SWOT, Strategy, Campaigns, History, Settings) + report-specific components, then wire `src/app/page.tsx`.

---

## FOUNDATION REFERENCE (for subagents)

### Constraints
- ONLY the `/` route is user-visible. Do NOT create new `app/` routes. All "pages" are components in `src/components/views/*-view.tsx`, switched by `useUiStore`.
- The Next.js project uses **Tailwind CSS v4** (`@import "tailwindcss"` in globals.css). Theme tokens are defined as CSS vars + `@theme inline`. shadcn UI components live in `src/components/ui/*` and are already installed — USE them, do not recreate.
- Indigo/violet primary is intentional (design system). Use `gradient-primary`, `glass`, `gradient-mesh` utilities from globals.css.
- All views are `"use client"` components. They read `businessId` from `useUiStore((s) => s.route.businessId)`.
- Use Framer Motion for transitions, Recharts for charts. Import lucide-react icons.
- DO NOT write tests. DO NOT create mock data (it already exists in mock-db). DO NOT create new API routes.
- Append your work record to THIS file (`/home/z/my-project/worklog.md`) with a `---` separator + Task ID header when done.

### Navigation
```ts
import { useUiStore } from "@/lib/stores/ui-store";
const { navigate, back } = useUiStore();
navigate({ view: "dashboard" });
navigate({ view: "business-detail", businessId: "biz_x" });
navigate({ view: "swot", businessId: "biz_x" });
navigate({ view: "strategy", businessId: "biz_x" });
navigate({ view: "campaigns", businessId: "biz_x" });
navigate({ view: "upload", businessId: "biz_x" }); // optional preselect
navigate({ view: "businesses" });
navigate({ view: "history" });
navigate({ view: "settings" });
```

### i18n
```ts
import { useT } from "@/lib/i18n/i18n";
const { t, locale, isRTL, dir } = useT();
t("swot.strengths");            // returns AR or EN string
t("swot.count", { count: 5 });  // {count} interpolation
```
Translation keys are in `src/lib/i18n/translations.ts`. Add new keys there if needed (both `en` and `ar`).

### Data hooks (React Query)
```ts
import { useBusinesses, useBusiness, useCreateBusiness, useRunFullPipeline, useUploadReviews } from "@/lib/hooks/use-businesses";
import { useSwotReport, useStrategyReport, useCampaignsReport, useHistory } from "@/lib/hooks/use-reports";
// direct API (for upload with progress):
import { businessesApi } from "@/lib/api/businesses";
businessesApi.uploadReviews(businessId, file) // returns Promise<PipelineResult>
```
On mutation success, invalidate via the hook (already wired) — but the mock data is in-memory on the server; queries refetch automatically.

### Shared components (import from `@/components/...`)
- `@/components/shared/page-header` → `<PageHeader title subtitle icon meta={[{label,value}]} actions={<...>} />`
- `@/components/shared/kpi-card` → `<KpiCard label value icon accent="indigo"|"violet"|"emerald"|"amber"|"rose" trend={{value,up}} hint />`
- `@/components/shared/empty-state` → `<EmptyState icon title description action={{label,onClick}} />`
- `@/components/shared/skeletons` → `<ReportSkeleton />`, `<ListSkeleton rows={4} />`
- `@/components/shared/pipeline-tracker` → `<PipelineTracker run={PipelineResult} onComplete={()=>{}} />` (animated 9 stages; replays on `run.run_id` change)
- `@/components/shared/file-uploader` → `<FileUploader status progress fileName fileSize onFile onClear disabled />` (`status: "idle"|"uploading"|"done"|"error"`)
- shadcn UI: `Card, Button, Badge, Input, Label, Textarea, Select, Tabs, Dialog, Sheet, ScrollArea, Progress, Avatar, Table, Tooltip, Separator, Skeleton, Switch, DropdownMenu, Toast`(sonner) — all in `@/components/ui/*`.

### Toasts
```ts
import { toast } from "sonner";
toast.success("msg"); toast.error("msg");
```

### Types — import from `@/types`
Key shapes: `Business, BusinessListResponse, CreateBusinessRequest, PipelineResult, PipelineStage, SWOTReportEnvelope, SWOTItem, Scoring, SwotQuadrant, StrategyReportEnvelope, TOWSStrategy, TOWSCategory, PriorityAction, ResourceItem, CampaignBrief, CampaignsReportEnvelope, HistoryEntry, ReportKind`. Also `PIPELINE_STAGES` const.

### Format helpers — `@/lib/utils/format`
`formatCurrency, formatMs, formatDate, formatRelative, formatPercent, scoreColorClass, scoreBarClass, gapColorClass, priorityColorClass, quoteSentiment, truncate`.

### PDF export — `@/lib/utils/pdf-export`
`exportReportToPDF({ title, subtitle, meta:[{label,value}], sections:[{heading, html}] })`. Build `html` strings from report data (use `escapeHtml`).

### Report headers must show (requirement #10 + meta)
`report_id` (Mongo), `engine_version`, `llm_model_used`, `provider`, `processing_time_ms`, `cost_estimate_usd`, `fallback_used`, `created_at`. Use `<PageHeader meta={[...]} />`.

### Brand/visual rules
- Cards: `rounded-2xl glass` (or `Card className="rounded-2xl glass"`).
- Accent gradients: `gradient-primary` (indigo→violet). Section icons in `rounded-2xl gradient-primary`.
- RTL: use logical props (`ms-auto`, `me-2`, `ps-`, `pe-`, `text-start/end`). Framer Motion x-offsets should flip with `isRTL`.
- Loading: show skeletons (`ReportSkeleton`/`ListSkeleton`). Empty: `EmptyState`. Errors: `EmptyState` + toast.
- SWOT evidence_refs MUST render as quote cards with sentiment color (`quoteSentiment`).

---

Task ID: 8a
Agent: swot-report-builder
Task: Build the SWOT Report feature — 4 client components (evidence quote card, SWOT item card, SWOT quadrant panel, SWOT report view)

Work Log:
- Read FOUNDATION REFERENCE contract from worklog.md; confirmed all imports (`useT`, `useUiStore`, `useSwotReport`, `useBusiness`, `PageHeader`, `EmptyState`, `ReportSkeleton`, format helpers, `exportReportToPDF`/`escapeHtml`, `Collapsible`, shadcn Badge/Button) exist and did NOT recreate any of them.
- Inspected `src/lib/api/mock-db.ts` to confirm real Arabic + English mixed evidence quotes are present in `evidence_refs` (so the quote cards visibly render bilingual content).
- Created `src/components/swot/evidence-quote-card.tsx`:
  - Default export `EvidenceQuoteCard({ quote })`.
  - Uses `quoteSentiment(quote)` → `positive` (emerald) / `negative` (rose) / `neutral` (violet).
  - Glass card (`rounded-xl glass p-3.5 ps-4 border-s-2`) with sentiment-tinted logical left accent bar.
  - `Quote` lucide icon in sentiment color, italic quote text with `dir="auto"` for proper Arabic+English mixed rendering, and a small sentiment Badge (locale-aware label: Positive/Negative/Neutral ↔ إيجابي/سلبي/محايد).
  - Framer Motion fade + x-slide-in, flipped with `isRTL`.
- Created `src/components/swot/swot-item-card.tsx`:
  - Default export `SwotItemCard({ item }: { item: SWOTItem })`.
  - Header row: title (`font-semibold`, `dir="auto"`), secondary Badge with `{frequency} {t("businesses.reviews")}`, and an outline monospace Badge for `source_theme`.
  - Reasoning paragraph (`text-sm text-muted-foreground leading-relaxed`, `dir="auto"`).
  - Scoring section: 3-col grid (`grid-cols-1 sm:grid-cols-3`) with three mini bars for `swot.importance` / `swot.impact` / `common.confidence`. Track `bg-muted h-1.5 rounded-full`, fill animated width `value*100%` using `scoreBarClass(value)`, percent label via `formatPercent(value)` tinted with `scoreColorClass(value)`.
  - Evidence section: shadcn `Collapsible` with a header button (`{t("swot.evidenceQuotes")} (N)`), animated chevron rotation, and a vertical stack (`space-y-2`) of `<EvidenceQuoteCard />` when open.
- Created `src/components/swot/swot-quadrant.tsx`:
  - Default export `SwotQuadrant({ quadrant, items })` (type `SwotQuadrant` from `@/types` — value/type share name OK).
  - Theme map: strengths→emerald+TrendingUp+`swot.strengths`, weaknesses→rose+TrendingDown+`swot.weaknesses`, opportunities→violet+Sparkles+`swot.opportunities`, threats→amber+AlertTriangle+`swot.threats`.
  - `motion.section` with `rounded-2xl glass border-s-2` + quadrant accent color. Header: icon in colored `rounded-xl` square, title, subtitle line (`swot.count`), and a count Badge. Body: `scroll-area-custom max-h-[32rem] overflow-y-auto` with `space-y-3` of `SwotItemCard`. Empty quadrant renders a muted em-dash.
- Created `src/components/views/swot-report-view.tsx`:
  - Default export `SwotReportView()` (no props). Reads `businessId` from `useUiStore((s) => s.route.businessId)`.
  - Data: `useSwotReport(businessId)` + `useBusiness(businessId)` for the business name.
  - `isLoading` → `<ReportSkeleton />`. `isError || !report` → `<EmptyState icon={Grid3x3} title={t("swot.empty.title")} description={t("swot.empty.desc")} action={{ label: t("businesses.detail.runPipeline"), onClick: navigate({ view: "business-detail", businessId }) }} />`.
  - `PageHeader` with `title=t("swot.title")`, `subtitle=t("swot.subtitle")`, `icon=Grid3x3`, the 7-entry `meta` array (report_id, business_type, engine_version, llm_model_used, processing_time_ms via `formatMs(...,locale)`, cost via `formatCurrency`, generated_at via `formatDate(...,locale)`), and `actions` = rose "Fallback used" Badge (only when `report.meta.fallback_used`) + Export PDF Button (`FileDown` icon, `t("common.export")`).
  - `handleExport`: builds `exportReportToPDF` with title `${businessName} — ${t("swot.title")}`, subtitle = `strategic_summary.main_advantage`, the 7 meta entries, and one section per quadrant (heading = `t("swot.<quadrant>")`, html = grid of cards each with `source_theme` tag, title, reasoning, and `quote`-classed evidence refs — all `escapeHtml`-escaped). On success calls `toast.success(t("toast.exported"))`.
  - Strategic summary: 3 glass cards in `grid gap-4 md:grid-cols-3` — `main_advantage` (emerald, Grid3x3), `most_critical_risk` (rose, AlertTriangle), `best_growth_opportunity` (violet, Sparkles). Each: icon in tinted square, label (`swot.summary.mainAdvantage` / `criticalRisk` / `bestOpportunity`), text with `dir="auto"`.
  - SWOT grid: `grid gap-4 lg:grid-cols-2` of 4 `<SwotQuadrantPanel>` in order strengths → weaknesses → opportunities → threats, fed by `report.swot_report[q] ?? []`.
  - Strategic summary + SWOT grid wrapped in `<motion.div>` fade/slide-up. All labels via `useT()`.
- Ran `bunx eslint` on the 4 new files → 0 errors / 0 warnings. (Pre-existing lint errors in `theme-toggle.tsx` and `dashboard-view.tsx` are unrelated to this task.)

Stage Summary:
- SWOT report feature complete: 4 polished, glassmorphic, fully i18n'd (AR+EN) client components wired into the existing SPA routing/data layer. Evidence quote cards visibly render the bilingual real-customer quotes from `mock-db`, sentiment-tinted via the shared `quoteSentiment` heuristic.
- Decisions:
  • Used `dir="auto"` on all bilingual text nodes (title, reasoning, quotes, summary text) so Arabic and English mix renders with correct per-paragraph direction regardless of UI locale.
  • For the strategic summary icon mapping, followed the spec's literal icon order `Grid3x3, AlertTriangle, Sparkles` → `main_advantage, most_critical_risk, best_growth_opportunity` (Grid3x3 is reused on the PageHeader per spec).
  • PDF export title uses `${businessName} — ${t("swot.title")}` instead of the literal English "SWOT Report" so the doc title respects the active locale.
  • Quadrant panel uses a numeric count Badge in the header in addition to the `swot.count` subtitle line for at-a-glance density.
- The 4 files are production-ready and only need to be imported by `src/app/page.tsx` (or a parent switch) to be reachable in the SPA.

---

## Task ID: 8d
Agent: subagent (Campaigns + History + Settings feature builder)

Task: Build the Campaigns, History and Settings features (4 files) on top of the foundation. No new app routes; only the four files below.

Files created (exactly 4):
1. `src/components/campaigns/campaign-brief-card.tsx` — `export default CampaignBriefCard({ brief }: { brief: CampaignBrief })`
2. `src/components/views/campaigns-view.tsx` — `export function CampaignsView()` (also default-exported)
3. `src/components/views/history-view.tsx` — `export function HistoryView()` (also default-exported)
4. `src/components/views/settings-view.tsx` — `export function SettingsView()` (also default-exported)

Foundation touch (allowed per foundation reference "Add new keys there if needed (both en and ar)"):
- Appended ~24 bilingual (AR+EN) translation keys to `src/lib/i18n/translations.ts` covering: `settings.backend.note`, `settings.account.memberSince`, `settings.account.role[.owner|.analyst|.viewer]`, `campaigns.confidence.{high|medium|low}`, `campaigns.filters[.approval|.confidence]`, `campaigns.count`, `history.summary.{total|cost|fallbacks}`, `history.{reportId|engine|model|fallback|time|generated|copyReportId}`, `common.{copy|copied|total|off|on}`. All keys are inside the existing `as const` translations object, so `TranslationKey` is extended automatically.

Implementation notes & decisions:

### campaign-brief-card.tsx
- `rounded-2xl glass` Card with Framer Motion entrance + `whileHover={{ y: -4 }}` lift.
- Top row: confidence badge (emerald/amber/rose by `parseConfidence(brief.confidence)`) + approval badge (`ShieldAlert`/`ShieldCheck`).
  - `requires_human_approval === true` → amber/rose "Needs human approval" (`campaigns.needsApproval`) with `ShieldAlert`.
  - else → emerald "Auto-approved" (`campaigns.autoApproved`) with `ShieldCheck`.
- Title: `brief.campaign_angle` (text-base font-semibold), `dir` flips with RTL.
- Subtitle: `brief.messaging_pillar` rendered italic muted with `Lightbulb` icon (MessageSquare is used in the channels label).
- Channels: each chip has a per-channel icon resolved by regex matchers (Instagram/TikTok/Email/LinkedIn/In-store/WhatsApp/SMS/Delivery apps/Google/Direct → fallback `Radio`).
- Footer: `source_strategy_id` as a monospace chip with `campaigns.sourceStrategy` label.
- Confidence parser is permissive: handles literal "high/medium/low", fractions 0..1, percents 0..100, defaulting to medium.

### campaigns-view.tsx
- Reads `businessId` from `useUiStore`; calls `useCampaignsReport(businessId)` and (optionally) `useBusiness(businessId)` for the subtitle name.
- Loading → `<ReportSkeleton />`. Error/empty → `<EmptyState>` with action that navigates to `business-detail` to run the pipeline.
- `<PageHeader>` with meta = [report_id, business_type, engine_version, llm_model_used, cost_estimate_usd, generated_at].
- Filter bar (rounded-2xl glass card): two `ToggleGroup type="single"` controls — Approval (All / Auto-approved / Needs approval) and Confidence (All / High / Medium / Low). Client-side filter on the campaigns array. Live "showing N briefs" count + active-filter chip.
- Grid: `grid gap-4 md:grid-cols-2 xl:grid-cols-3` with Framer Motion parent `staggerChildren: 0.05` and per-card variants — proper staggered entrance.
- Empty filter result renders an `<EmptyState>` with a reset-to-All action.
- RTL aware (`text-right` on grid container; the card itself uses `dir` flipping on the title).

### history-view.tsx
- Reads `useHistory()` (returns `{entries, total}`).
- Loading → `<ListSkeleton rows={5} />`. Empty → `<EmptyState>` action that navigates to `businesses`.
- `<PageHeader>` with `History` icon.
- Summary bar (3 mini glass cards above the table): total reports, total spend (`formatCurrency` sum), fallback count (accent color flips rose if any fallback, emerald otherwise).
- Desktop (`md:block`): shadcn `Table` inside a `rounded-2xl glass` Card wrapped with `scroll-area-custom max-h-[28rem] overflow-y-auto`. Sticky header (`sticky top-0 z-10 bg-muted/80 backdrop-blur`). Columns: Kind (badge with `Grid3x3`/`Target`/`Megaphone` icon, indigo/violet/amber), Business (name + type), Report ID (monospace truncated + copy button → `navigator.clipboard` + sonner toast), Engine (mono), Model (mono), Fallback (rose badge if true), Time (`formatMs`), Cost (`formatCurrency`), Generated (`formatRelative`). Rows: `motion.tr` with cursor-pointer + hover highlight, click navigates to `entry.kind` view (which is a valid ViewName) with `businessId`.
- Mobile (`md:hidden`): stacked cards with the same data, click handler, and per-card copy button — no horizontal scroll needed.
- Tooltip on the copy button uses the existing shadcn TooltipProvider (already wired in providers.tsx).

### settings-view.tsx
- `<PageHeader>` with `Settings` icon.
- 5 `rounded-2xl glass` sections rendered in a `lg:grid-cols-2` masonry, each with a Framer Motion section reveal (stagger by index, capped delay 0.4s). Custom `SettingsSection` shell with gradient-primary icon chip + title/description header.
  1. **Appearance** — three theme buttons (Light/Dark/System) bound to `useTheme()` from next-themes. Active button gets `gradient-primary` background + `ShieldCheck` check. SSR-safe mount detection uses `useSyncExternalStore` (NOT `useEffect(setState)`) to avoid the strict `react-hooks/set-state-in-effect` lint rule that flags the existing `theme-toggle.tsx` pattern.
  2. **Language** — two buttons (English / العربية) bound to `useI18nStore().setLocale`. Active button uses `gradient-primary`. Native names render LTR/RTL appropriately.
  3. **Account** — shows current user from `useAuthStore` (avatar with initial in gradient-primary, full name, email, role badge, member-since badge). Destructive "Sign out" button calls `clearAuth()` + sonner toast. Renders empty state if no user.
  4. **AI Engine** — three read-only info cards: Provider `vertex_ai` (Cpu, indigo), Model `gemini-2.5-flash` (Brain, violet), Active agents "SWOT Agent v7 · Strategy Agent v1" (Bot, amber).
  5. **Backend connection** — shows API base URL (flips `/api/v1` ↔ `http://localhost:8000/api/v1` based on local switch state). Switch labeled `settings.backend.realMode` (default off). Enabling it animates an info note (`Info` icon, sky accent) explaining `?XTransformPort=8000` + `USE_REAL_BACKEND=true` + reload required. Visual only — does NOT mutate `client.ts` (per task instruction). Mention is included in the note + the "Off → On · USE_REAL_BACKEND" hint line.

Quality:
- All 4 files `"use client"` and TypeScript-strict clean.
- `bun run lint` reports zero new errors/warnings for the 4 new files. (Pre-existing errors in `theme-toggle.tsx`, `dashboard-view.tsx`, and warnings in `businesses-view.tsx`/`pipeline-tracker.tsx` are untouched and out of scope.)
- Dev server (`bun run dev`) compiles cleanly after the new files (`✓ Compiled` in dev.log).
- All visible labels are AR+EN via `useT()`; RTL honored via logical CSS props (`ps-`/`pe-`/`ms-auto`/`me-`/`text-start`/`text-end`/`rounded-s`/`rounded-e`), `dir` attributes on monospace codes and the card title.

Consumers: these views are not yet wired into `src/app/page.tsx` (the SPA switch). The orchestrator/main agent will import `CampaignsView`, `HistoryView`, `SettingsView` and `CampaignBriefCard` when assembling the view router.

---

Task ID: 8c
Agent: operational-views
Task: Build the 4 operational views — Dashboard, Businesses, Business-detail, Upload

Files Created (exactly 4):
- `src/components/views/dashboard-view.tsx` → `DashboardView()`
- `src/components/views/businesses-view.tsx` → `BusinessesView()`
- `src/components/views/business-detail-view.tsx` → `BusinessDetailView()`
- `src/components/views/upload-view.tsx` → `UploadView()`

Pre-existing Bug Fixed (necessary, one line):
- `src/components/providers.tsx` was importing `I18nProvider` from a non-existent module `@/lib/i18n/i18n-provider` (the actual provider lives in `@/lib/i18n/i18n`). Fixed the import path. Without this the entire `/` route was returning HTTP 500 (compile error) and none of the views could render.

Work Log:
- DashboardView: PageHeader (LayoutDashboard icon) → 4 KpiCard row (businesses count indigo/Building2, reports generated violet/FileText, reviews analyzed emerald/MessageSquare, LLM spend amber/DollarSign via formatCurrency) → 2-col grid: left lg:col-span-2 is a Recharts AreaChart of "Reports over time" grouped by day (locale-aware), right is a Quick Actions card with New business / Upload reviews / Run pipeline buttons (→ businesses / upload / businesses). Below: 2-col grid of Recent businesses (up to 4 list rows, click → business-detail) + Recent reports (up to 5 history entries, click → matching report view, kind badge, relative time via formatRelative). Empty state (no businesses) → EmptyState with New business action. Staggered Framer Motion fade-up. RTL-aware chart axis reversal. Skeletons during loading.
- BusinessesView: PageHeader with New Business button (gradient-primary). Search Input filters client-side by name/type/location. Grid of business cards (rounded-2xl glass) showing name+status badge, type badge, clamped description, location+review_count meta, 3 report-availability dots with Tooltips (filled when has_*, outline otherwise), hover-lift via Framer Motion. Click anywhere → business-detail. New Business Dialog with react-hook-form + zod: name (required), business_type (Select with 6 options), description (Textarea optional), location (Input optional). On submit → useCreateBusiness().mutateAsync → toast.businessCreated → close dialog → navigate to business-detail with created.business_id. Uses `useWatch({control, name})` (not `watch(name)`) to satisfy React Compiler. Loading → ListSkeleton rows=3. Empty → EmptyState with action opening dialog.
- BusinessDetailView: reads `businessId` from useUiStore. If no businessId or business not found → EmptyState with back-to-businesses action. PageHeader with name/description/Building2 icon + 4-meta badge row (business type, location, reviews count, generated-at relative) + actions (Upload review file outline + Run full pipeline gradient). Run pipeline calls useRunFullPipeline().mutateAsync(businessId), sets local `pipelineRun` state, toast.pipelineStarted. While pending, button shows spinner and is disabled. `<PipelineTracker run={pipelineRun} onComplete={…}>` shows the 9-stage animation; onComplete fires toast.success(toast.pipelineDone) and re-invalidates the business detail query so `has_*` flags refresh and report buttons enable. Status banner Card with status dot + last-pipeline-run relative time + 3 report chips. Reports section: if NONE of has_swot/has_strategy/has_campaigns → EmptyState with run-pipeline CTA; else 3 report cards (Grid3x3 SWOT, Target Strategy, Megaphone Campaigns) each with title/desc/CTA button — enabled if has_* (navigate to report view), disabled with "No reports yet" tooltip otherwise. Back-to-businesses ghost link at bottom.
- UploadView: reads optional preselect `businessId` from useUiStore().route.businessId (synced via useEffect). PageHeader (UploadCloud icon). Layout: 2-col grid. Left (lg:col-span-2) = Card with business Select (preselects presetId, disabled while uploading), FileUploader (status/progress/fileName/fileSize wired to local state, disabled if no business selected or busy), Run-after toggle (Switch, default ON), Submit button "Upload & process" (disabled if no business or no file, shows spinner + progress % while uploading). Right = side info Card with 4-step guide. Submit: validates .json (toast.upload.invalidType otherwise), calls `api.post<PipelineResult>(`/businesses/${businessId}/pipeline/upload`, form, { headers, onUploadProgress })` directly to capture real upload progress. On success → status done, toast.uploaded, set pipelineRun if runAfter ON. On error → status error, toast.error. After upload with runAfter ON → reveals `<PipelineTracker run onComplete>` and a Card with two buttons: View SWOT report / View Strategy report (navigate to swot/strategy with businessId). RTL-aware.

Quality bar met:
- All 4 view files compile cleanly (0 TypeScript errors via `npx tsc --noEmit`).
- All 4 view files pass ESLint (0 errors, 0 warnings — the only remaining lint errors are pre-existing in `theme-toggle.tsx` and `pipeline-tracker.tsx`, owned by the foundation agent).
- Production-grade polish: staggered Framer Motion fade-up on every section, gradient-primary accents on primary CTAs, glass cards, hover-lift on grid items, RTL-aware via logical CSS props (`ms-auto`, `ps-`, `pe-`, `text-start`, `rtl:rotate-180`/`rtl:rotate-90` for directional arrows), AR+EN labels via useT() everywhere, locale-aware number/date formatting.
- Dashboard feels alive (4 KPIs + animated AreaChart + 2 list columns + quick actions).
- Business-detail shows animated PipelineTracker and enables report buttons after pipeline completion (via query invalidation).
- Upload shows real axios progress % + the pipeline animation + post-complete navigation buttons.

Notes for orchestrator:
- These 4 views expose default exports ready for the SPA switch in `src/app/page.tsx`. They are NOT yet wired — that's the orchestrator's job. Suggested switch cases: `dashboard` → `<DashboardView/>`, `businesses` → `<BusinessesView/>`, `business-detail` → `<BusinessDetailView/>`, `upload` → `<UploadView/>`.
- Detailed work record also written to `/agent-ctx/8c-operational-views.md`.

---

Task ID: 8b
Agent: strategy (subagent)
Task: Strategy Report feature — TOWS matrix, priority roadmap, effort×impact scatter, resource assessment, and Strategy report view.

Work Log:
- Read FOUNDATION REFERENCE in worklog.md as the contract. Verified `StrategyReport`/`TOWSCategory`/`TOWSStrategy`/`PriorityAction`/`ResourceItem`/`CampaignBrief` types in `@/types`, format helpers in `@/lib/utils/format`, `exportReportToPDF`+`escapeHtml` in `@/lib/utils/pdf-export`, `useT`/`useI18nStore` in `@/lib/i18n/i18n`, `useUiStore` (route + navigate), `useStrategyReport` in `@/lib/hooks/use-reports`, `useBusiness` in `@/lib/hooks/use-businesses`, and the shared `PageHeader`/`EmptyState`/`ReportSkeleton` components. Confirmed `recharts`, `framer-motion`, `lucide-react`, and the full shadcn UI set (incl. `Tabs`, `Card`, `Badge`, `Button`, `Separator`, `Tooltip`, `Progress`, `Table`, `ScrollArea`) are installed.
- Added 22 new AR+EN translation keys to `src/lib/i18n/translations.ts` under `strategy.*` (timeHorizon, dependencies, viewCampaigns, current, required, totalCost, quickWins, majorProjects, fillIns, thankless, gap.{low,medium,high}, resourceType.{human,capital,technology,data,brand}, legend.strategies, legend.actions). All other keys preserved.
- Created `src/components/strategy/tows-matrix.tsx` — default export `TowsMatrix({matrix})`. Responsive `grid gap-4 lg:grid-cols-4` with one column per category SO/ST/WO/WT. Each column header is a colored gradient strip (emerald/amber/violet/rose) with the abbreviation + i18n label (`strategy.tows.{SO,ST,WO,WT}`). Each body lists `TOWSStrategy[]` as compact `rounded-xl glass` cards: title (font-semibold), description (`line-clamp-3`, text-xs muted), badge row (effort, impact, time_horizon, confidence via `formatPercent`), and `leverages` rendered as tiny monospace chips. Empty column → `—`. Body uses `max-h-[28rem] overflow-y-auto scroll-area-custom`. Framer Motion fade/slide-up per column.
- Created `src/components/strategy/priority-roadmap.tsx` — default export `PriorityRoadmap({actions})`. Sorts `PriorityAction[]` by priority rank (P0→P3) then impact desc. Vertical timeline: left rail with priority badges colored via `priorityColorClass`, connected by a vertical gradient line. Each entry card (`rounded-2xl glass`) shows priority badge + `action_id` chip, title, description, meta row (`User`/`Clock`/`Target` icons + `strategy.owner`/`strategy.timeframe`/`strategy.kpi`), two mini effort/impact bars (amber/emerald), and `dependencies` as small monospace chips with a `GitBranch` icon (`strategy.dependencies` label).
- Created `src/components/strategy/effort-impact-scatter.tsx` — default export `EffortImpactScatter({strategies, actions})`. Recharts `ScatterChart` inside `rounded-2xl glass` card with `ResponsiveContainer` height 320. X axis = effort (0..11), Y axis = impact (0..11), both labeled via i18n. ZAxis `dataKey="size"` range `[80,380]` varies bubble size. Two series: TOWS strategies (violet `var(--chart-2)` circles, size ∝ confidence) and priority actions (indigo `var(--chart-1)` diamonds, size ∝ impact/10). 4 `<ReferenceArea>` quadrants tinted with `var(--chart-3/2/4/5)` (Quick wins emerald / Major projects violet / Fill-ins amber / Thankless rose) + faint quadrant labels via `ReferenceArea label={{position, fill, opacity:0.7}}` + dashed `ReferenceLine` dividers at x=5.5/y=5.5. Custom `CustomTooltip` shows title + effort + impact + confidence (`formatPercent`). `Legend` align flips with `isRTL`; YAxis orientation flips with `isRTL`. All colors via CSS vars.
- Created `src/components/strategy/resource-assessment.tsx` — default export `ResourceAssessment({resources})`. Summary header card: total estimated cost (`formatCurrency` sum, shown with `gradient-text`) + count by gap (low/medium/high) as chips colored via `gapColorClass`. Then a responsive grid (`sm:grid-cols-2 xl:grid-cols-3`) of resource cards: resource-type icon (`Users`/`DollarSign`/`Cpu`/`Database`/`BadgeCheck`) in a gradient-tinted tile, name + type label badge, current_state → required_state (with `ArrowRight` that rotates for RTL via `rtl:rotate-180`), `Separator`, gap badge (colored via `gapColorClass`), and `formatCurrency(estimated_cost_usd)`. Framer Motion fade/slide-up per card.
- Created `src/components/views/strategy-report-view.tsx` — default export `StrategyReportView()` (named export). Reads `businessId` from `useUiStore`. Fetches `useStrategyReport(businessId)` + optional `useBusiness(businessId)`. States: loading → `<ReportSkeleton />`; error/empty → `<EmptyState icon={Target} title={t("strategy.empty.title")} description={t("strategy.empty.desc")} action={{label: t("businesses.detail.runPipeline"), onClick: navigate({view:"business-detail", businessId})}} />`. Header via `<PageHeader title subtitle icon={Target} meta=[report_id (Mongo), business_type, strategic_posture, generatedAt→formatDate] actions={export PDF button} />`. Export uses `exportReportToPDF` with 4 sections (posture, TOWS matrix as grid of cards, priority plan as table, resources as table) — all user strings passed through `escapeHtml`. On success toasts `toast.exported` (`sonner`). Strategic posture card (`rounded-2xl glass`, `Compass` icon, posture title with `gradient-text`, posture_rationale paragraph). TOWS matrix section. Then shadcn `<Tabs>` with 4 tabs: priority → `<PriorityRoadmap>`, effortImpact → `<EffortImpactScatter>` (flattens all TOWS via `useMemo`), resources → `<ResourceAssessment>`, campaigns → compact inline list of `campaign_brief_feed` (angle, pillar, source_strategy_id chip, confidence badge, needs/auto approval badge) + "View campaigns" button → `navigate({view:"campaigns", businessId})`. Wrapped in `<motion.div>` fade/slide-up. All labels via `useT()`.
- Constraints honored: NO new app/ routes, NO new API routes, NO tests, NO mock data, NO campaign components (just inline list + button). All 5 components are `"use client"` and use Tailwind v4 + shadcn UI + Framer Motion + Recharts + lucide-react. `gradient-primary`, `glass`, `gradient-text`, `scroll-area-custom` utilities used. RTL handled via logical CSS props (`ps-`, `pe-`, `start-`, `end-`, `text-start`/`text-end`) + `rtl:rotate-180` icon variants + Recharts axis/legend orientation flips. Indigo/violet primary preserved.

Quality verification:
- `bunx eslint src/components/strategy/ src/components/views/strategy-report-view.tsx src/lib/i18n/translations.ts` → exit 0, no errors/warnings on my files.
- `bunx tsc --noEmit --skipLibCheck` → no errors on any of my files (fixed 2 initial issues: Recharts `Legend align` typing and `never[]` array inference in `useMemo`).
- Dev server (`bun run dev`) responds 200 on `/` and on `/api/v1/businesses/biz_volume_cafe/reports/strategy`; latest dev.log shows clean `✓ Compiled` lines after my changes.
- Pre-existing lint errors in `theme-toggle.tsx`/`pipeline-tracker.tsx`/`businesses-view.tsx` were untouched.

Stage Summary:
- Strategy Report feature complete. 5 production-grade files delivered (4 strategy components + 1 view) plus 22 i18n additions to translations.ts.
- To integrate: orchestrator must wire `<StrategyReportView />` into `src/app/page.tsx` for `view === "strategy"` (the foundation SPA pattern). Cross-linking already wired: business-detail "Open Strategy" → `navigate({view:"strategy", businessId})`; strategy empty-state "Run pipeline" → `navigate({view:"business-detail", businessId})`; strategy campaigns tab "View campaigns" → `navigate({view:"campaigns", businessId})`.
- Full agent work record (decisions + integration notes) at `/home/z/my-project/agent-ctx/8b-strategy.md`.

---
Task ID: 9 (orchestrator verification + fixes)
Agent: main (orchestrator)
Task: Lint, dev server, end-to-end Agent Browser verification, bug fixes

Work Log:
- Wired SPA router in `src/app/page.tsx` (auth gate + view switch with AnimatePresence).
- Fixed lint: `react-hooks/set-state-in-effect` in `theme-toggle.tsx` (useSyncExternalStore) and `pipeline-tracker.tsx` (moved prop-change reset to render-time derived-state pattern; ref write back into effect).
- Fixed `providers.tsx` import path (subagent 8c caught it).
- CRITICAL FIX: mock state was not persisting across requests in Next.js dev (multiple module instances per route-handler segment) — POST /pipeline/full mutated one instance, GET /businesses read another. Refactored `mock-db.ts` to hold `businesses`/`swotReports`/`strategyReports` on a `globalThis.__BIP_MOCK__` singleton (same pattern as the Prisma client in `src/lib/db.ts`).
- Added `ensureReports(b)` generator in mock-db: running the pipeline on any business (incl. draft Pulse Fitness + newly created businesses) now produces real, viewable SWOT + Strategy + Campaign reports. Type-aware: gym template (Pulse Fitness) + generic local-business template.
- Fixed `file-uploader.tsx`: native `<input type=file>` was visible — now overlaid invisibly (opacity-0 absolute) over the custom dropzone (standard react-dropzone pattern); added `data-testid="dropzone"`.

Agent Browser verification (all passed, 0 console/runtime errors):
- Auth: demo login (any email + 6+ char pw) → dashboard, success toast.
- Dashboard: 4 KPI cards, Recharts area chart, recent businesses + recent reports, quick actions, empty state.
- Businesses: searchable grid, status/type badges, report-availability dots, New Business dialog (react-hook-form + zod) creates + navigates.
- Business detail: meta header, Run pipeline / Upload actions, status banner, 3 report cards (enabled by has_*), empty state for draft.
- Pipeline tracker: animated all 9 stages (queued→uploading→parsing→themes→swot→strategy→campaigns→mongo→done), completion toast, reports enabled after.
- SWOT report: 4 quadrants (S/W/O/T) with item cards (title, reasoning, scoring bars for importance/impact/confidence, frequency, source_theme), collapsible evidence quote cards showing real AR+EN mixed quotes with sentiment colors, strategic summary (3 highlight cards), report_id + meta in header, Export PDF opens print window.
- Strategy report: strategic posture (gradient-text), 4-column TOWS matrix (SO/ST/WO/WT), tabs: Priority roadmap (P0–P3 timeline), Effort×Impact Recharts scatter with quadrant backgrounds (Quick wins/Major projects/Fill-ins/Thankless), Resource assessment, Campaign briefs tab + "View campaigns".
- Campaigns: approval + confidence filter toggle groups, 4 brief cards (angle, messaging pillar, channel chips w/ icons, confidence + approval badges, source_strategy_id).
- Upload: business Select (preserves preselect), dropzone (verified via synthetic drop event → onDrop fired → submit enabled), progress bar, pipeline tracker, post-completion View SWOT/Strategy links. Upload API verified 200.
- History: table with kind badges, report_id (mono + copy-to-clipboard), model, fallback, time, cost, relative date; row click → report view. Generated PULSE_GYM_GEN reports appear.
- Settings: Appearance (Light/Dark/System — verified theme class switches), Language (EN/AR — verified dir/lang switch), Account (sign out), AI Engine (vertex_ai / gemini-2.5-flash / agents), Backend connection (real-mode switch).
- RTL Arabic: dir=rtl, lang=ar, all labels translated, Arabic-Indic numerals (١٬٢٨٤), sidebar flipped to right, framer-motion x-offsets flip.
- Mobile (375×812): hamburger → Sheet sidebar, no horizontal overflow (scrollW==clientW==375).
- Sticky footer: on long pages footer pushed to end of content (verified at 3182px on 812px viewport), never overlays.
- Export PDF: opens new tab with print-ready HTML (title "Volume Cafe — SWOT Report"), triggers window.print().

Stage Summary:
- Production frontend COMPLETE and browser-verified end-to-end. ESLint clean. Dev server healthy (all routes 200).
- All 10 non-negotiable requirements met. Real schemas, real endpoints (local mock faithfully implements them; flip USE_REAL_BACKEND to hit FastAPI on :8000 via gateway).
