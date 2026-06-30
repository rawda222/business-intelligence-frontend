import type { Locale } from "@/lib/i18n/translations";

export function formatCurrency(usd: number | null | undefined, locale: Locale = "en"): string {
  if (usd == null || isNaN(usd)) return "$0.00";
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  if (usd < 1) return `$${usd.toFixed(3)}`;
  return `$${usd.toFixed(2)}`;
}

export function formatMs(ms: number, locale: Locale = "en"): string {
  if (ms < 1000) return `${ms} ms`;
  const s = ms / 1000;
  if (s < 60) return locale === "ar" ? `${s.toFixed(1)} ث` : `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const rest = Math.round(s % 60);
  return locale === "ar" ? `${m} د ${rest} ث` : `${m}m ${rest}s`;
}

export function formatDate(iso: string, locale: Locale = "en"): string {
  try {
    return new Date(iso).toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatRelative(iso: string, locale: Locale = "en"): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return locale === "ar" ? "الآن" : "just now";
  if (mins < 60) return locale === "ar" ? `قبل ${mins} دقيقة` : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return locale === "ar" ? `قبل ${hrs} ساعة` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return locale === "ar" ? `قبل ${days} يوم` : `${days}d ago`;
  return formatDate(iso, locale);
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/** 0..1 score → color token (indigo/emerald/amber/rose scales). */
export function scoreColorClass(value: number): string {
  if (value >= 0.75) return "text-emerald-500";
  if (value >= 0.5) return "text-chart-2";
  if (value >= 0.3) return "text-amber-500";
  return "text-rose-500";
}

export function scoreBarClass(value: number): string {
  if (value >= 0.75) return "bg-emerald-500";
  if (value >= 0.5) return "bg-violet-500";
  if (value >= 0.3) return "bg-amber-500";
  return "bg-rose-500";
}

export function gapColorClass(gap: "low" | "medium" | "high"): string {
  switch (gap) {
    case "low":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
    case "medium":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
    case "high":
      return "bg-rose-500/15 text-rose-600 dark:text-rose-400";
  }
}

export function priorityColorClass(priority: "P0" | "P1" | "P2" | "P3"): string {
  switch (priority) {
    case "P0":
      return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
    case "P1":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
    case "P2":
      return "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30";
    case "P3":
      return "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30";
  }
}

/** Heuristic sentiment color for an evidence quote (Arabic + English aware). */
export function quoteSentiment(text: string): "positive" | "negative" | "neutral" {
  const positive = [
    "excellent", "great", "amazing", "love", "best", "delicious", "friendly",
    "recommend", "perfect", "fast", "clean", "ممتاز", "رائع", "أفضل", "لذيذ",
    "سريع", "نظيف", "ودود", "أنصح", "حلو", "جميل", "مذهل",
  ];
  const negative = [
    "slow", "bad", "terrible", "worst", "rude", "dirty", "expensive", "cold",
    "disappointed", "never", "بطيء", "سيء", "أسوأ", "وقح", "متسخ", "غالي",
    "بارد", "محبط", "أبدا", "قبيح",
  ];
  const lower = text.toLowerCase();
  let pos = 0;
  let neg = 0;
  for (const w of positive) if (lower.includes(w)) pos++;
  for (const w of negative) if (lower.includes(w)) neg++;
  if (pos > neg) return "positive";
  if (neg > pos) return "negative";
  return "neutral";
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}
