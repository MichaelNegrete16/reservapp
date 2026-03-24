"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import OnboardingWizard from "@/components/Onboarding";
import PlanLimitModal from "@/components/PlanLimitModal";
import PlanEnforcement from "@/components/PlanEnforcement";
import { api } from "@/lib/api-client";
import { getPlanInfo, type PlanInfo } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checked, setChecked] = useState(false);
  const [planLimitMsg, setPlanLimitMsg] = useState<string | null>(null);
  const [showEnforcement, setShowEnforcement] = useState(true);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<{ ok: boolean; data: { config?: { onboardingCompleted?: boolean } } }>("/restaurants/me"),
      getPlanInfo(),
    ])
      .then(([restRes, plan]) => {
        const completed = restRes.data?.config?.onboardingCompleted === true;
        if (!completed) setShowOnboarding(true);
        setPlanInfo(plan);
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, []);

  // Listen for plan limit errors from api-client
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setPlanLimitMsg(detail?.message ?? "Has alcanzado el límite de tu plan.");
    };
    window.addEventListener("plan-limit-error", handler);
    return () => window.removeEventListener("plan-limit-error", handler);
  }, []);

  const handleUpgrade = useCallback(() => {
    setPlanLimitMsg(null);
    router.push("/dashboard/configuracion");
  }, [router]);

  if (!checked) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 240, background: "#f8f9fa", minHeight: "100vh" }}>
        {children}
      </main>

      {showOnboarding && (
        <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
      )}

      {planLimitMsg && (
        <PlanLimitModal
          message={planLimitMsg}
          onClose={() => setPlanLimitMsg(null)}
          onUpgrade={handleUpgrade}
        />
      )}

      {!showOnboarding && showEnforcement && (
        <PlanEnforcement onClear={() => setShowEnforcement(false)} />
      )}
    </div>
  );
}
