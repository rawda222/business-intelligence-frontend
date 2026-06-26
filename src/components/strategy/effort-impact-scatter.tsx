"use client";

import { useT } from "@/lib/i18n/i18n";
import { Card } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils/format";
import type { TOWSStrategy, PriorityAction } from "@/types";
import {
  CartesianGrid,
  Legend,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

interface Point {
  title: string;
  effort: number;
  impact: number;
  /** Normalized 0..1, drives bubble size via ZAxis. */
  size: number;
  confidence?: number;
  kind: "strategy" | "action";
}

const DOMAIN_MAX = 11;
const MID = 5.5;

/**
 * Effort × Impact Scatter — a Recharts ScatterChart with 4 quadrant
 * ReferenceArea backgrounds ("Quick wins", "Major projects", "Fill-ins",
 * "Thankless"). Two series are plotted: TOWS strategies (violet circles,
 * radius ∝ confidence) and priority actions (indigo diamonds, radius ∝
 * impact). Bubble size is driven by a ZAxis dataKey="size".
 */
export default function EffortImpactScatter({
  strategies,
  actions,
}: {
  strategies: TOWSStrategy[];
  actions: PriorityAction[];
}) {
  const { t, isRTL } = useT();

  const strategyData: Point[] = (strategies ?? []).map((s) => ({
    title: s.title,
    effort: s.effort,
    impact: s.impact,
    size: s.confidence,
    confidence: s.confidence,
    kind: "strategy",
  }));

  const actionData: Point[] = (actions ?? []).map((a) => ({
    title: a.title,
    effort: a.effort,
    impact: a.impact,
    size: a.impact / 10,
    kind: "action",
  }));

  const axisTickColor = "var(--muted-foreground)";
  const axisStroke = "var(--border)";
  const muted = "var(--muted-foreground)";

  return (
    <Card className="rounded-2xl glass p-4">
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart
          margin={{ top: 28, right: 24, bottom: 28, left: isRTL ? 8 : 12 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={axisStroke} />

          <XAxis
            type="number"
            dataKey="effort"
            name={t("strategy.effort")}
            domain={[0, DOMAIN_MAX]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fill: axisTickColor, fontSize: 11 }}
            stroke={axisStroke}
            label={{
              value: t("strategy.effort"),
              position: "insideBottom",
              offset: -14,
              fill: muted,
              fontSize: 11,
            }}
          />
          <YAxis
            type="number"
            dataKey="impact"
            name={t("strategy.impact")}
            domain={[0, DOMAIN_MAX]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fill: axisTickColor, fontSize: 11 }}
            stroke={axisStroke}
            orientation={isRTL ? "right" : "left"}
            label={{
              value: t("strategy.impact"),
              angle: -90,
              position: isRTL ? "insideRight" : "insideLeft",
              offset: 0,
              fill: muted,
              fontSize: 11,
            }}
          />
          <ZAxis
            type="number"
            dataKey="size"
            range={[80, 380]}
            domain={[0, 1]}
          />

          {/* Quadrant tints */}
          <ReferenceArea
            x1={0}
            x2={MID}
            y1={MID}
            y2={DOMAIN_MAX}
            fill="var(--chart-3)"
            fillOpacity={0.08}
          />
          <ReferenceArea
            x1={MID}
            x2={DOMAIN_MAX}
            y1={MID}
            y2={DOMAIN_MAX}
            fill="var(--chart-2)"
            fillOpacity={0.08}
          />
          <ReferenceArea
            x1={0}
            x2={MID}
            y1={0}
            y2={MID}
            fill="var(--chart-4)"
            fillOpacity={0.08}
          />
          <ReferenceArea
            x1={MID}
            x2={DOMAIN_MAX}
            y1={0}
            y2={MID}
            fill="var(--chart-5)"
            fillOpacity={0.08}
          />

          {/* Quadrant dividers */}
          <ReferenceLine x={MID} stroke={axisStroke} strokeDasharray="4 4" />
          <ReferenceLine y={MID} stroke={axisStroke} strokeDasharray="4 4" />

          {/* Quadrant labels */}
          <ReferenceArea
            x1={0}
            x2={MID}
            y1={MID}
            y2={DOMAIN_MAX}
            label={{
              value: t("strategy.quickWins"),
              position: "insideTopLeft",
              fill: muted,
              fontSize: 10,
              opacity: 0.7,
            }}
          />
          <ReferenceArea
            x1={MID}
            x2={DOMAIN_MAX}
            y1={MID}
            y2={DOMAIN_MAX}
            label={{
              value: t("strategy.majorProjects"),
              position: "insideTopRight",
              fill: muted,
              fontSize: 10,
              opacity: 0.7,
            }}
          />
          <ReferenceArea
            x1={0}
            x2={MID}
            y1={0}
            y2={MID}
            label={{
              value: t("strategy.fillIns"),
              position: "insideBottomLeft",
              fill: muted,
              fontSize: 10,
              opacity: 0.7,
            }}
          />
          <ReferenceArea
            x1={MID}
            x2={DOMAIN_MAX}
            y1={0}
            y2={MID}
            label={{
              value: t("strategy.thankless"),
              position: "insideBottomRight",
              fill: muted,
              fontSize: 10,
              opacity: 0.7,
            }}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ strokeDasharray: "3 3", stroke: muted }}
          />
          <Legend
            verticalAlign="top"
            align={isRTL ? "left" : "right"}
            iconType="circle"
            wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
          />

          <Scatter
            name={t("strategy.legend.strategies")}
            data={strategyData}
            fill="var(--chart-2)"
            shape="circle"
            fillOpacity={0.72}
          />
          <Scatter
            name={t("strategy.legend.actions")}
            data={actionData}
            fill="var(--chart-1)"
            shape="diamond"
            fillOpacity={0.85}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </Card>
  );
}

interface TooltipEntry {
  payload: Point;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
}) {
  const { t } = useT();
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;

  return (
    <div className="max-w-xs rounded-xl border border-border bg-popover p-3 text-xs shadow-xl">
      <p className="line-clamp-2 font-semibold leading-snug">{p.title}</p>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-muted-foreground">
        <span>
          {t("strategy.effort")}:{" "}
          <span className="font-mono font-semibold text-foreground">
            {p.effort}
          </span>
        </span>
        <span>
          {t("strategy.impact")}:{" "}
          <span className="font-mono font-semibold text-foreground">
            {p.impact}
          </span>
        </span>
        {p.confidence !== undefined && (
          <span>
            {t("common.confidence")}:{" "}
            <span className="font-mono font-semibold text-foreground">
              {formatPercent(p.confidence)}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
