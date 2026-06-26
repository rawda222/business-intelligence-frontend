"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUiStore } from "@/lib/stores/ui-store";
import { AppShell } from "@/components/shared/app-shell";
import { AuthView } from "@/components/views/auth-view";
import { DashboardView } from "@/components/views/dashboard-view";
import { BusinessesView } from "@/components/views/businesses-view";
import { BusinessDetailView } from "@/components/views/business-detail-view";
import { UploadView } from "@/components/views/upload-view";
import SwotReportView from "@/components/views/swot-report-view";
import { StrategyReportView } from "@/components/views/strategy-report-view";
import { CampaignsView } from "@/components/views/campaigns-view";
import { HistoryView } from "@/components/views/history-view";
import { SettingsView } from "@/components/views/settings-view";
import { useT } from "@/lib/i18n/i18n";

function ActiveView() {
  const view = useUiStore((s) => s.route.view);
  const { isRTL } = useT();

  const node = (() => {
    switch (view) {
      case "dashboard":
        return <DashboardView />;
      case "businesses":
        return <BusinessesView />;
      case "business-detail":
        return <BusinessDetailView />;
      case "upload":
        return <UploadView />;
      case "swot":
        return <SwotReportView />;
      case "strategy":
        return <StrategyReportView />;
      case "campaigns":
        return <CampaignsView />;
      case "history":
        return <HistoryView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  })();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        initial={{ opacity: 0, x: isRTL ? -12 : 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isRTL ? 12 : -12 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {node}
      </motion.div>
    </AnimatePresence>
  );
}

export default function Page() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <AppShell>
      <ActiveView />
    </AppShell>
  );
}
