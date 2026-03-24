"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Crown, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { getPlanInfo, type PlanInfo } from "@/lib/auth";
import styles from "./PlanEnforcement.module.css";

interface ResourceItem {
  id: string;
  name: string;
}

interface Overage {
  resource: string;
  current: number;
  max: number;
  label: string;
  excess: number;
  items: ResourceItem[];
  deleteEndpoint: string;
}

interface Props {
  onClear: () => void;
}

const PLAN_PRICES: Record<string, { label: string; price: string; features: string[] }> = {
  pro: {
    label: "Pro",
    price: "$99.000 COP/mes",
    features: ["10 zonas", "50 mesas", "200 artículos", "Reservas ilimitadas", "POS + Facturación", "Clientes + Reportes"],
  },
  platinum: {
    label: "Platinum",
    price: "$249.000 COP/mes",
    features: ["Todo ilimitado", "Multi-sede", "WhatsApp", "API externa", "Soporte 24/7"],
  },
};

export default function PlanEnforcement({ onClear }: Props) {
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [overages, setOverages] = useState<Overage[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [tab, setTab] = useState<"fix" | "upgrade">("fix");

  const checkOverages = useCallback(async () => {
    try {
      const plan = await getPlanInfo();
      setPlanInfo(plan);

      const [zonesRes, tablesRes, menuRes] = await Promise.all([
        api.get<{ ok: boolean; data: { id: string; name?: string; number?: number; descripcion?: string }[] }>("/zones"),
        api.get<{ ok: boolean; data: { id: string; number?: number; name?: string }[] }>("/tables"),
        api.get<{ ok: boolean; data: { id: string; name?: string }[] }>("/menu"),
      ]);

      const checks: Overage[] = [];
      const zones = zonesRes.data ?? [];
      const tables = tablesRes.data ?? [];
      const menuItems = menuRes.data ?? [];

      if (plan.limits.maxZones !== -1 && zones.length > plan.limits.maxZones) {
        checks.push({
          resource: "zones", current: zones.length, max: plan.limits.maxZones,
          label: "Zonas", excess: zones.length - plan.limits.maxZones,
          items: zones.map((z) => ({ id: z.id, name: z.name ?? `Zona ${z.id.slice(0, 6)}` })),
          deleteEndpoint: "/zones",
        });
      }
      if (plan.limits.maxTables !== -1 && tables.length > plan.limits.maxTables) {
        checks.push({
          resource: "tables", current: tables.length, max: plan.limits.maxTables,
          label: "Mesas", excess: tables.length - plan.limits.maxTables,
          items: tables.map((t) => ({ id: t.id, name: `Mesa ${t.number ?? t.id.slice(0, 6)}` })),
          deleteEndpoint: "/tables",
        });
      }
      if (plan.limits.maxMenuItems !== -1 && menuItems.length > plan.limits.maxMenuItems) {
        checks.push({
          resource: "menuItems", current: menuItems.length, max: plan.limits.maxMenuItems,
          label: "Artículos del menú", excess: menuItems.length - plan.limits.maxMenuItems,
          items: menuItems.map((m) => ({ id: m.id, name: m.name ?? `Item ${m.id.slice(0, 6)}` })),
          deleteEndpoint: "/menu",
        });
      }

      setOverages(checks);
      if (checks.length === 0) onClear();
    } catch { /* ignore */ }
    finally { setLoading(false); setChecking(false); }
  }, [onClear]);

  useEffect(() => { checkOverages(); }, [checkOverages]);

  // Auto-clear when overages resolved via optimistic delete
  useEffect(() => {
    if (!loading && overages.length === 0) onClear();
  }, [loading, overages, onClear]);

  const handleDelete = async (endpoint: string, id: string, resource: string) => {
    setDeleting(id);
    try {
      await api.del(`${endpoint}/${id}`);
      // Optimistic: remove item from local state immediately
      setOverages((prev) =>
        prev.map((o) => {
          if (o.resource !== resource) return o;
          const newItems = o.items.filter((i) => i.id !== id);
          const newCurrent = o.current - 1;
          return { ...o, items: newItems, current: newCurrent, excess: newCurrent - o.max };
        }).filter((o) => o.excess > 0)
      );
    } catch { /* ignore */ }
    finally { setDeleting(null); }
  };

  if (loading) return null;
  if (overages.length === 0) return null;

  const plan = planInfo?.plan ?? "free";
  const nextPlan = plan === "free" ? "pro" : "platinum";
  const upgradeInfo = PLAN_PRICES[nextPlan];

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <AlertTriangle size={36} />
        </div>

        <h2 className={styles.title}>Excedes los límites de tu plan</h2>
        <p className={styles.subtitle}>
          Plan <strong>{plan.toUpperCase()}</strong> — Elimina recursos o actualiza para continuar.
        </p>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === "fix" ? styles.tabActive : ""}`} onClick={() => setTab("fix")}>
            <Trash2 size={14} /> Eliminar sobrantes
          </button>
          <button className={`${styles.tab} ${tab === "upgrade" ? styles.tabActive : ""}`} onClick={() => setTab("upgrade")}>
            <Crown size={14} /> Actualizar plan
          </button>
        </div>

        {/* Tab: Fix */}
        {tab === "fix" && (
          <div className={styles.fixContent}>
            {overages.map((o) => (
              <div key={o.resource} className={styles.overageSection}>
                <div className={styles.overageHeader}>
                  <span className={styles.overageLabel}>{o.label}</span>
                  <span className={styles.overageBadge}>
                    {o.current} / {o.max} — elimina {o.excess}
                  </span>
                </div>
                <div className={styles.itemList}>
                  {o.items.map((item) => (
                    <div key={item.id} className={styles.itemRow}>
                      <span className={styles.itemName}>{item.name}</span>
                      <button
                        className={styles.btnDelete}
                        disabled={deleting === item.id}
                        onClick={() => handleDelete(o.deleteEndpoint, item.id, o.resource)}
                      >
                        {deleting === item.id ? <Loader2 size={12} className={styles.spinning} /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              className={styles.btnVerify}
              onClick={() => { setChecking(true); checkOverages(); }}
              disabled={checking}
            >
              <RefreshCw size={14} className={checking ? styles.spinning : ""} />
              {checking ? "Verificando..." : "Verificar límites"}
            </button>
          </div>
        )}

        {/* Tab: Upgrade */}
        {tab === "upgrade" && upgradeInfo && (
          <div className={styles.upgradeContent}>
            <div className={styles.planCard}>
              <div className={styles.planHeader}>
                <Crown size={20} />
                <span className={styles.planName}>Plan {upgradeInfo.label}</span>
              </div>
              <div className={styles.planPrice}>{upgradeInfo.price}</div>
              <ul className={styles.planFeatures}>
                {upgradeInfo.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
            </div>

            <p className={styles.upgradeNote}>
              Para actualizar tu plan, contacta al administrador de la plataforma:
            </p>

            <a
              href={`https://wa.me/573001234567?text=Hola, quiero actualizar mi plan a ${upgradeInfo.label}. Mi restaurante es: ${plan}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnWhatsapp}
            >
              💬 Solicitar upgrade por WhatsApp
            </a>

            <a href="mailto:admin@reservapp.com?subject=Solicitud de upgrade de plan" className={styles.btnEmail}>
              ✉ Solicitar por correo
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
