"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import styles from "./Configuracion.module.css";

type ConfigTab = "general" | "appearance" | "notifications" | "team" | "billing";

const TEAM_MEMBERS = [
  { id: "u1", name: "Sarah Jenkins", role: "ADMIN", email: "sarah@reservapp.io", initials: "SJ", added: "Propietario" },
  { id: "u2", name: "Marc Peterson", role: "STAFF", email: "marc@reservapp.io", initials: "MP", added: "Agregado hace 2 días" },
];

const COLORS = ["#e65100", "#1565c0", "#388e3c", "#7b1fa2"];

const BILLING_HISTORY = [
  { date: "1 nov, 2023", plan: "Pro mensual", amount: "$49.00", status: "Pagado" },
  { date: "1 oct, 2023", plan: "Pro mensual", amount: "$49.00", status: "Pagado" },
  { date: "1 sep, 2023", plan: "Pro mensual", amount: "$49.00", status: "Pagado" },
];

export default function ConfiguracionPage() {
  const [tab, setTab] = useState<ConfigTab>("general");
  const [primaryColor, setPrimaryColor] = useState("#e65100");
  const [font, setFont] = useState("public-sans");
  const [bgStyle, setBgStyle] = useState("Clean White");
  const [cornerRadius, setCornerRadius] = useState("Modern (8px)");

  const TABS: { id: ConfigTab; label: string }[] = [
    { id: "general", label: "General" },
    { id: "appearance", label: "Apariencia" },
    { id: "notifications", label: "Notificaciones" },
    { id: "team", label: "Equipo" },
    { id: "billing", label: "Facturación" },
  ];

  return (
    <div className={styles.page}>
      {/* Sub-nav lateral */}
      <aside className={styles.subnav}>
        <div className={styles.subnavHeader}>
          <div className={styles.subnavLogo}>🍴</div>
          <div>
            <div className={styles.subnavBrand}>ReservApp</div>
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
          <div className={styles.userAvatar}>SJ</div>
          <div>
            <div className={styles.userName}>Sarah Jenkins</div>
            <div className={styles.userEmail}>sarah@reservapp.io</div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className={styles.content}>
        {/* Top actions */}
        <div className={styles.contentHeader}>
          <h2 className={styles.contentTitle}>
            {TABS.find((t) => t.id === tab)?.label}
          </h2>
          <div className={styles.headerActions}>
            <button className={styles.btnDiscard}>Descartar</button>
            <button className={styles.btnSave}>Guardar cambios</button>
          </div>
        </div>

        {/* General */}
        {tab === "general" && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Información del restaurante</h3>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Nombre del restaurante</label>
                <input className={styles.input} defaultValue="La Trattoria" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Teléfono</label>
                <input className={styles.input} defaultValue="+57 (555) 000-0000" />
              </div>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label}>Dirección</label>
                <input className={styles.input} defaultValue="Calle Principal 123, Bogotá" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Instagram</label>
                <input className={styles.input} defaultValue="@latrattoria" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Website</label>
                <input className={styles.input} defaultValue="https://latrattoria.com" />
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
                    <button
                      key={c}
                      className={`${styles.swatch} ${primaryColor === c ? styles.swatchActive : ""}`}
                      style={{ background: c }}
                      onClick={() => setPrimaryColor(c)}
                    />
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
                  <div
                    key={f.id}
                    className={`${styles.fontCard} ${font === f.id ? styles.fontCardActive : ""}`}
                    onClick={() => setFont(f.id)}
                  >
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
              "Confirmación por correo al cliente",
              "Recordatorio SMS 24h antes",
              "Correo en caso de cancelación",
              "Alerta al equipo por nueva reserva",
              "Alerta por no presentación",
            ].map((label) => (
              <div key={label} className={styles.notifRow}>
                <span className={styles.notifLabel}>{label}</span>
                <label className={styles.toggleSwitch}>
                  <input type="checkbox" defaultChecked />
                  <span className={styles.toggleTrack} />
                </label>
              </div>
            ))}
            <h3 className={styles.sectionTitle} style={{ marginTop: 24 }}>Plantilla de correo</h3>
            <div className={styles.field}>
              <label className={styles.label}>Asunto</label>
              <input className={styles.input} defaultValue="Tu reserva en {{restaurant_name}} está confirmada" />
            </div>
            <div className={styles.field} style={{ marginTop: 12 }}>
              <label className={styles.label}>Cuerpo</label>
              <textarea className={styles.textarea} rows={4} defaultValue="Hola {{customer_name}}, tu reserva para {{guests}} personas el {{date}} a las {{time}} está confirmada." />
            </div>
          </div>
        )}

        {/* Team */}
        {tab === "team" && (
          <div className={styles.section}>
            <div className={styles.teamHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Miembros del equipo</h3>
                <p className={styles.sectionDesc}>Gestiona quién tiene acceso a este espacio de trabajo.</p>
              </div>
              <button className={styles.btnInvite}>👥 Invitar</button>
            </div>
            <div className={styles.teamTable}>
              <div className={styles.teamTableHeader}>
                <span>Miembro</span>
                <span>Rol</span>
                <span>Acción</span>
              </div>
              {TEAM_MEMBERS.map((m) => (
                <div key={m.id} className={styles.teamRow}>
                  <div className={styles.memberCell}>
                    <div className={styles.memberAvatar}>{m.initials}</div>
                    <div>
                      <div className={styles.memberName}>{m.name}</div>
                      <div className={styles.memberAdded}>{m.added}</div>
                    </div>
                  </div>
                  <span
                    className={styles.roleBadge}
                    style={{
                      color: m.role === "ADMIN" ? "#c2185b" : "#555",
                      background: m.role === "ADMIN" ? "#fce4ec" : "#f5f5f5",
                    }}
                  >
                    {m.role}
                  </span>
                  <button className={styles.moreBtn}><MoreHorizontal size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Billing */}
        {tab === "billing" && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Plan actual</h3>
            <div className={styles.planCard}>
              <div className={styles.planInfo}>
                <span className={styles.planBadge}>PRO MENSUAL</span>
                <p className={styles.planDesc}>Reservas ilimitadas, analíticas avanzadas, soporte prioritario.</p>
              </div>
              <div className={styles.planPrice}>$49<span>/mes</span></div>
              <button className={styles.btnUpgrade}>Actualizar a anual (ahorra 20%)</button>
            </div>

            <h3 className={styles.sectionTitle} style={{ marginTop: 28 }}>Historial de pagos</h3>
            <div className={styles.billingTable}>
              <div className={styles.billingHeader}>
                <span>Fecha</span>
                <span>Plan</span>
                <span>Monto</span>
                <span>Estado</span>
              </div>
              {BILLING_HISTORY.map((b) => (
                <div key={b.date} className={styles.billingRow}>
                  <span>{b.date}</span>
                  <span>{b.plan}</span>
                  <span className={styles.billingAmount}>{b.amount}</span>
                  <span className={styles.paidBadge}>{b.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
