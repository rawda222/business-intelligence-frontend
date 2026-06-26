# Task ID 8c — Operational Views (Dashboard, Businesses, Business-Detail, Upload)

**Agent:** operational-views
**Scope:** Create exactly 4 view files under `src/components/views/` for the BI Platform SPA.

## Files Created
1. `src/components/views/dashboard-view.tsx` — `DashboardView()`
2. `src/components/views/businesses-view.tsx` — `BusinessesView()`
3. `src/components/views/business-detail-view.tsx` — `BusinessDetailView()`
4. `src/components/views/upload-view.tsx` — `UploadView()`

## Pre-existing Bug Fixed (Necessary)
- `src/components/providers.tsx` had a broken import `@/lib/i18n/i18n-provider` — the module did not exist. The actual `I18nProvider` lives in `@/lib/i18n/i18n`. One-line edit to fix the import path; without it the entire app was returning 500 on `/`. This was blocking my views from rendering.

## Foundation components reused
- `PageHeader`, `KpiCard`, `EmptyState`, `ListSkeleton`, `ReportSkeleton`, `PipelineTracker`, `FileUploader`
- shadcn UI: `Card, Button, Badge, Input, Label, Textarea, Select, Dialog, Switch, Tooltip`
- Hooks: `useBusinesses, useBusiness, useCreateBusiness, useRunFullPipeline, useHistory`
- Stores: `useUiStore` (route + navigate), `useT()` (i18n)
- Direct: `api` from `@/lib/api/client` for upload with `onUploadProgress`
- Format helpers: `formatCurrency, formatRelative`
- Recharts: `AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip`

## Key Decisions
- **Dashboard chart**: chose `AreaChart` (gradient fill) over `BarChart` for a more "alive" feel. Grouped history by day (locale-aware), took the last 12 buckets. RTL-aware via `reversed` XAxis and YAxis orientation swap.
- **KPI trends**: added subtle `trend` strings (not real percentages — mock data has no historical baseline) where sensible (businesses count, reports generated).
- **Recent reports click → report view**: clicking a history entry navigates to the corresponding `swot | strategy | campaigns` view with `businessId` from the entry.
- **New-business form**: react-hook-form + zod, used `useWatch({control, name})` instead of `watch(name)` to satisfy React Compiler (avoids the incompatible-library warning). 6 business types: cafe/restaurant/retail/salon/gym/clinic.
- **Business card report-availability dots**: 3 small icon chips (Grid3x3/Target/Megaphone) — filled primary tint when `has_*`, muted outline otherwise. Each has a Tooltip.
- **Business-detail empty state**: if NONE of has_swot/has_strategy/has_campaigns is true → show EmptyState with run-pipeline CTA (per spec). Otherwise show the 3 report cards; unavailable ones are disabled with tooltip "No reports yet" using `t("businesses.detail.noReports")`.
- **Pipeline tracker refresh**: `useRunFullPipeline` mutation already invalidates both the list and detail query on success. The `PipelineTracker.onComplete` callback additionally re-invalidates the detail query as a safety net (the animation completes ~5s after the mutation resolves, by which point the new `has_*` flags should already be reflected in the cached business).
- **Upload progress**: uses `api.post` directly with `onUploadProgress` per spec. Validation that the file ends in `.json` happens both in the FileUploader dropzone (accept prop) and again in `onFile` for safety (toast `upload.invalidType` if not).
- **Run-after toggle**: default ON. When OFF, the upload still succeeds and toast.uploaded fires, but the PipelineTracker is not revealed.
- **Post-upload navigation buttons**: View SWOT / View Strategy (per spec; Campaigns not in the spec list — those two only).
- **Framer Motion variants**: every view uses `as const` on the variants objects so TypeScript accepts the `ease: "easeOut"` literal (Framer Motion v12 widened `Easing` to a union that requires literal types).
- **Staggered fade-up**: all major sections wrapped in `motion.div` with `variants={itemVariants}` under a parent `containerVariants` that staggers children.

## ESLint Status
- All 4 view files: **0 errors, 0 warnings**.
- Remaining project lint issues are pre-existing in OTHER agents' files (`theme-toggle.tsx`, `pipeline-tracker.tsx`) — out of scope.

## TypeScript Status
- All 4 view files: **0 errors** (`npx tsc --noEmit` reports no issues for these files).
- Remaining project TS errors are in `sidebar-pro.tsx`, `effort-impact-scatter.tsx`, `strategy-report-view.tsx` (other agents) and `examples/`, `skills/` (out of scope).

## How to render
These views are NOT yet wired into `src/app/page.tsx` — that's the orchestrator's job. They expose default exports ready for the SPA switch:

```tsx
import { DashboardView } from "@/components/views/dashboard-view";
import { BusinessesView } from "@/components/views/businesses-view";
import { BusinessDetailView } from "@/components/views/business-detail-view";
import { UploadView } from "@/components/views/upload-view";
// route.view === "dashboard"      → <DashboardView/>
// route.view === "businesses"     → <BusinessesView/>
// route.view === "business-detail"→ <BusinessDetailView/>
// route.view === "upload"         → <UploadView/>
```
