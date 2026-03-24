"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { getMe, getPlanInfo, type AuthUser, type PlanInfo } from "@/lib/auth";
import styles from "./Configuracion.module.css";

type ConfigTab = "general" | "appearance" | "notifications" | "team" | "billing";

const COLORS = ["#e65100", "#1565c0", "#388e3c", "#7b1fa2"];

const PLAN_LABELS: Record<string, string> = {
  free: "FREE",
  pro: "PRO MENSUAL",
  platinum: "PLATINUM",
};

const PLAN_PRICES: Record<string, string> = {
  free: "$0",
  pro: "$99.000",
  platinum: "$249.000",
};

const PLAN_DESCRIPTIONS: Record<string, string> = {
  free: "Hasta 50 reservas/mes, 2 zonas, 5 mesas, widget público.",
  pro: "Reservas ilimitadas, POS, facturación, clientes, reportes, hasta 5 usuarios.",
  platinum: "Todo sin límites, multi-sede, WhatsApp, API externa, soporte prioritario.",
};

interface GeneralForm {
  name: string;
  phone: string;
  address: string;
  instagram: string;
  website: string;
}

interface RestaurantConfig {
  appearance?: {
    primaryColor?: string;
    bgStyle?: string;
    borderRadius?: string;
    fontFamily?: string;
  };
  notifications?: Record<string, boolean>;
  emailTemplate?: { subject?: string; body?: string };
}

export default function ConfiguracionPage() {
  const [tab, setTab] = useState<ConfigTab>("general");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // General
  const [generalForm, setGeneralForm] = useState<GeneralForm>({ name: "", phone: "", address: "", instagram: "", website: "" });
  const [originalForm, setOriginalForm] = useState<GeneralForm>({ name: "", phone: "", address: "", instagram: "", website: "" });
  const [savingGeneral, setSavingGeneral] = useState(false);

  // Config (appearance, notifications, email template)
  const [config, setConfig] = useState<RestaurantConfig>({});
  const [primaryColor, setPrimaryColor] = useState("#e65100");
  const [font, setFont] = useState("public-sans");
  const [bgStyle, setBgStyle] = useState("Blanco limpio");
  const [cornerRadius, setCornerRadius] = useState("Moderno (8px)");

  // Notifications
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    confirmacion: true, recordatorio: true, cancelacion: true, nueva_reserva: true, no_asistio: false,
  });
  const [emailSubject, setEmailSubject] = useState("Tu reserva en {{restaurant_name}} está confirmada");
  const [emailBody, setEmailBody] = useState("Hola {{customer_name}}, tu reserva para {{guests}} personas el {{date}} a las {{time}} está confirmada.");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [me, plan, restRes] = await Promise.all([
          getMe(),
          getPlanInfo(),
          api.get<{ ok: boolean; data: Record<string, unknown> }>("/restaurants/me"),
        ]);
        setUser(me);
        setPlanInfo(plan);

        const d = restRes.data;
        const form: GeneralForm = {
          name: (d.name as string) ?? "",
          phone: (d.phone as string) ?? "",
          address: (d.address as string) ?? "",
          instagram: (d.instagram as string) ?? "",
          website: (d.website as string) ?? "",
        };
        setGeneralForm(form);
        setOriginalForm(form);

        // Load config
        const cfg = (d.config as RestaurantConfig) ?? {};
        setConfig(cfg);
        if (cfg.appearance?.primaryColor) setPrimaryColor(cfg.appearance.primaryColor);
        if (cfg.appearance?.fontFamily) setFont(cfg.appearance.fontFamily);
        if (cfg.appearance?.bgStyle) setBgStyle(cfg.appearance.bgStyle);
        if (cfg.appearance?.borderRadius) setCornerRadius(cfg.appearance.borderRadius);
        if (cfg.notifications) setNotifs({ ...notifs, ...cfg.notifications });
        if (cfg.emailTemplate?.subject) setEmailSubject(cfg.emailTemplate.subject);
        if (cfg.emailTemplate?.body) setEmailBody(cfg.emailTemplate.body);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const handleSaveGeneral = async () => {
    try {
      setSavingGeneral(true);
      await api.patch("/restaurants/me", generalForm);
      setOriginalForm(generalForm);
      setToast({ message: "Cambios guardados correctamente", type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Error guardando", type: "error" });
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const newConfig: RestaurantConfig = {
        ...config,
        appearance: { primaryColor, bgStyle, borderRadius: cornerRadius, fontFamily: font },
        notifications: notifs,
        emailTemplate: { subject: emailSubject, body: emailBody },
      };
      await api.patch("/restaurants/me/config", { config: newConfig });
      setConfig(newConfig);
      setToast({ message: "Configuración guardada", type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Error guardando", type: "error" });
    }
  };

  const handleDiscard = () => {
    if (tab === "general") setGeneralForm(originalForm);
  };

  const handleSave = () => {
    if (tab === "general") handleSaveGeneral();
    else handleSaveConfig();
  };

  const TABS: { id: ConfigTab; label: string }[] = [
    { id: "general", label: "General" },
    { id: "appearance", label: "Apariencia" },
    { id: "notifications", label: "Notificaciones" },
    { id: "team", label: "Equipo" },
    { id: "billing", label: "Facturación" },
  ];

  const plan = planInfo?.plan ?? "free";
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "??";

  if (loading) {
    return (
      <div className={styles.page} style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          padding: "12px 20px", borderRadius: 8,
          background: toast.type === "success" ? "#e8f5e9" : "#ffebee",
          color: toast.type === "success" ? "#2e7d32" : "#c62828",
          fontWeight: 500, fontSize: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        }}>
          {toast.message}
        </div>
      )}

      <aside className={styles.subnav}>
        <div className={styles.subnavHeader}>
          <div className={styles.subnavLogo}>🍴</div>
          <div>
            <div className={styles.subnavBrand}>{user?.restaurant?.name ?? "ReservApp"}</div>
            <div className={styles.subnavSub}>Configuración del espacio</div>
          </div>
        </div>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            className={`${styles.subnavItem} ${tab === id ? styles.subnavItemActive : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
        <div className={styles.subnavUser}>
          <div className={styles.userAvatar}>{initials}</div>
          <div>
            <div className={styles.userName}>{user?.name ?? "Usuario"}</div>
            <div className={styles.userEmail}>{user?.email ?? ""}</div>
          </div>
        </div>
      </aside>

      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <h2 className={styles.contentTitle}>{TABS.find((t) => t.id === tab)?.label}</h2>
          <div className={styles.headerActions}>
            <button className={styles.btnDiscard} onClick={handleDiscard}>Descartar</button>
            <button className={styles.btnSave} onClick={handleSave} disabled={tab === "general" && savingGeneral}>
              {tab === "general" && savingGeneral ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>

        {/* General */}
        {tab === "general" && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Link de reservas para tus clientes</h3>
            <div style={{ background: "#f8f9fa", border: "1px solid #e9ecef", borderRadius: 10, padding: "14px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20 }}>🔗</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>Comparte este enlace con tus clientes:</div>
                <code style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", wordBreak: "break-all" }}>
                  {typeof window !== "undefined" ? window.location.origin : "https://reservapp.com"}/r/{user?.restaurant?.slug ?? "tu-restaurante"}
                </code>
              </div>
              <button
                style={{ background: "#c2185b", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                onClick={() => {
                  const url = `${window.location.origin}/r/${user?.restaurant?.slug ?? ""}`;
                  navigator.clipboard.writeText(url);
                  setToast({ message: "Link copiado al portapapeles", type: "success" });
                }}
              >
                Copiar
              </button>
            </div>

            <h3 className={styles.sectionTitle}>Información del restaurante</h3>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Nombre del restaurante</label>
                <input className={styles.input} value={generalForm.name} onChange={(e) => setGeneralForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Teléfono</label>
                <input className={styles.input} value={generalForm.phone} onChange={(e) => setGeneralForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label}>Dirección</label>
                <input className={styles.input} value={generalForm.address} onChange={(e) => setGeneralForm((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Instagram</label>
                <input className={styles.input} value={generalForm.instagram} onChange={(e) => setGeneralForm((f) => ({ ...f, instagram: e.target.value }))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Website</label>
                <input className={styles.input} value={generalForm.website} onChange={(e) => setGeneralForm((f) => ({ ...f, website: e.target.value }))} />
              </div>
            </div>
            <div className={styles.uploadLogoZone}>
              <div className={styles.logoPlaceholder}>🍴</div>
              <div>
                <p className={styles.uploadTitle}>Logo del restaurante</p>
                <p className={styles.uploadDesc}>PNG, JPG hasta 2MB</p>
              </div>
              <button className={styles.btnUpload}>Subir</button>
            </div>
          </div>
        )}

        {/* Appearance */}
        {tab === "appearance" && (
          <div className={styles.appearanceGrid}>
            <div className={styles.appearanceLeft}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Identidad de marca</h3>
                <p className={styles.sectionDesc}>Define los colores principales del widget público de reservas.</p>
                <label className={styles.label}>Color principal del tema</label>
                <div className={styles.colorSwatches}>
                  {COLORS.map((c) => (
                    <button key={c} className={`${styles.swatch} ${primaryColor === c ? styles.swatchActive : ""}`} style={{ background: c }} onClick={() => setPrimaryColor(c)} />
                  ))}
                  <button className={styles.swatchAdd}>+</button>
                </div>
              </div>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Estilo de UI</h3>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label className={styles.label}>Estilo de fondo</label>
                    <select className={styles.input} value={bgStyle} onChange={(e) => setBgStyle(e.target.value)}>
                      <option>Blanco limpio</option>
                      <option>Gris suave</option>
                      <option>Modo oscuro</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Radio de esquinas</label>
                    <select className={styles.input} value={cornerRadius} onChange={(e) => setCornerRadius(e.target.value)}>
                      <option>Moderno (8px)</option>
                      <option>Redondeado (16px)</option>
                      <option>Cuadrado (0px)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Tipografía</h3>
                <p className={styles.sectionDesc}>Elige fuentes que reflejen la identidad de tu marca.</p>
                {[
                  { id: "public-sans", label: "Public Sans (Por defecto)", desc: "Altamente legible, neutral y moderno." },
                  { id: "playfair", label: "Playfair Display", desc: "Elegante y serifa tradicional." },
                ].map((f) => (
                  <div key={f.id} className={`${styles.fontCard} ${font === f.id ? styles.fontCardActive : ""}`} onClick={() => setFont(f.id)}>
                    <div className={styles.fontIcon}>A</div>
                    <div>
                      <div className={styles.fontName}>{f.label}</div>
                      <div className={styles.fontDesc}>{f.desc}</div>
                    </div>
                    {font === f.id && <span className={styles.fontCheck}>✓</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.appearanceRight}>
              <div className={styles.previewPanel}>
                <div className={styles.previewHeader}>
                  <span className={styles.previewLabel}>VISTA PREVIA</span>
                  <span className={styles.previewLive}><span className={styles.liveDot} /> ACTUALIZACIÓN EN VIVO</span>
                </div>
                <div className={styles.previewWidget} style={{ background: primaryColor }}>
                  <p className={styles.previewTitle}>Reserva una mesa</p>
                  <p className={styles.previewSub}>Selecciona la fecha y hora que prefieras.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {tab === "notifications" && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Configuración de notificaciones</h3>
            {[
              { key: "confirmacion", label: "Confirmación por correo al cliente" },
              { key: "recordatorio", label: "Recordatorio 24h antes" },
              { key: "cancelacion", label: "Correo en caso de cancelación" },
              { key: "nueva_reserva", label: "Alerta al equipo por nueva reserva" },
              { key: "no_asistio", label: "Alerta por no presentación" },
            ].map(({ key, label }) => (
              <div key={key} className={styles.notifRow}>
                <span className={styles.notifLabel}>{label}</span>
                <label className={styles.toggleSwitch}>
                  <input type="checkbox" checked={notifs[key] ?? false} onChange={(e) => setNotifs((n) => ({ ...n, [key]: e.target.checked }))} />
                  <span className={styles.toggleTrack} />
                </label>
              </div>
            ))}
            <h3 className={styles.sectionTitle} style={{ marginTop: 24 }}>Plantilla de correo</h3>
            <div className={styles.field}>
              <label className={styles.label}>Asunto</label>
              <input className={styles.input} value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
            </div>
            <div className={styles.field} style={{ marginTop: 12 }}>
              <label className={styles.label}>Cuerpo</label>
              <textarea className={styles.textarea} rows={4} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} />
            </div>
            <p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
              Variables disponibles: {"{{restaurant_name}}"}, {"{{customer_name}}"}, {"{{guests}}"}, {"{{date}}"}, {"{{time}}"}
            </p>
          </div>
        )}

        {/* Team */}
        {tab === "team" && (
          <div className={styles.section}>
            <div className={styles.teamHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Miembros del equipo</h3>
                <p className={styles.sectionDesc}>
                  Tu plan permite hasta {planInfo?.limits.maxTeamMembers === -1 ? "ilimitados" : planInfo?.limits.maxTeamMembers} miembros.
                </p>
              </div>
              <button className={styles.btnInvite}>👥 Invitar</button>
            </div>
            <div className={styles.teamTable}>
              <div className={styles.teamTableHeader}>
                <span>Miembro</span>
                <span>Rol</span>
                <span>Acción</span>
              </div>
              {/* Current user is always shown */}
              <div className={styles.teamRow}>
                <div className={styles.memberCell}>
                  <div className={styles.memberAvatar}>{initials}</div>
                  <div>
                    <div className={styles.memberName}>{user?.name ?? "Usuario"}</div>
                    <div className={styles.memberAdded}>Propietario</div>
                  </div>
                </div>
                <span className={styles.roleBadge} style={{ color: "#c2185b", background: "#fce4ec" }}>
                  {user?.role?.toUpperCase() ?? "ADMIN"}
                </span>
                <button className={styles.moreBtn}><MoreHorizontal size={16} /></button>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#999", marginTop: 16, textAlign: "center" }}>
              La gestión completa de equipo estará disponible próximamente.
            </p>
          </div>
        )}

        {/* Billing */}
        {tab === "billing" && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Plan actual</h3>
            <div className={styles.planCard}>
              <div className={styles.planInfo}>
                <span className={styles.planBadge}>{PLAN_LABELS[plan] ?? plan.toUpperCase()}</span>
                <p className={styles.planDesc}>{PLAN_DESCRIPTIONS[plan] ?? ""}</p>
              </div>
              <div className={styles.planPrice}>{PLAN_PRICES[plan] ?? "$0"}<span>/mes</span></div>
              {plan !== "platinum" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                  <a
                    href={`https://wa.me/573001234567?text=${encodeURIComponent(`Hola, quiero actualizar mi restaurante "${user?.restaurant?.name}" al plan ${plan === "free" ? "Pro" : "Platinum"}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", textAlign: "center", padding: 14, borderRadius: 10, background: "#25d366", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none" }}
                  >
                    💬 Solicitar {plan === "free" ? "Pro" : "Platinum"} por WhatsApp
                  </a>
                  <a
                    href={`mailto:admin@reservapp.com?subject=${encodeURIComponent(`Solicitud upgrade a ${plan === "free" ? "Pro" : "Platinum"}`)}&body=${encodeURIComponent(`Restaurante: ${user?.restaurant?.name}\nPlan actual: ${plan}\nPlan solicitado: ${plan === "free" ? "Pro" : "Platinum"}`)}`}
                    style={{ display: "block", textAlign: "center", padding: 12, borderRadius: 10, border: "1px solid #e0e0e0", color: "#555", fontSize: 14, textDecoration: "none" }}
                  >
                    ✉ Solicitar por correo
                  </a>
                </div>
              )}
              {plan === "platinum" && (
                <span style={{ fontSize: 13, color: "#388e3c", fontWeight: 600, marginTop: 8, display: "block" }}>✓ Plan máximo activo</span>
              )}
            </div>

            <h3 className={styles.sectionTitle} style={{ marginTop: 28 }}>Límites de tu plan</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 12 }}>
              {[
                { label: "Zonas", value: planInfo?.limits.maxZones === -1 ? "Ilimitadas" : String(planInfo?.limits.maxZones ?? 0) },
                { label: "Mesas", value: planInfo?.limits.maxTables === -1 ? "Ilimitadas" : String(planInfo?.limits.maxTables ?? 0) },
                { label: "Menú items", value: planInfo?.limits.maxMenuItems === -1 ? "Ilimitados" : String(planInfo?.limits.maxMenuItems ?? 0) },
                { label: "Reservas/mes", value: planInfo?.limits.maxReservationsPerMonth === -1 ? "Ilimitadas" : String(planInfo?.limits.maxReservationsPerMonth ?? 0) },
                { label: "Miembros equipo", value: planInfo?.limits.maxTeamMembers === -1 ? "Ilimitados" : String(planInfo?.limits.maxTeamMembers ?? 0) },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "#f8f9fa", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
                </div>
              ))}
            </div>

            <h3 className={styles.sectionTitle} style={{ marginTop: 28 }}>Funcionalidades incluidas</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {planInfo?.features.map((f) => (
                <span key={f} style={{ background: "#e8f5e9", color: "#2e7d32", padding: "4px 12px", borderRadius: 16, fontSize: 12, fontWeight: 600 }}>
                  ✓ {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
