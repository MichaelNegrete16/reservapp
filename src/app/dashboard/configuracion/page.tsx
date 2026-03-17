"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import styles from "./Configuracion.module.css";

type ConfigTab = "general" | "appearance" | "notifications" | "team" | "billing";

const TEAM_MEMBERS = [
  { id: "u1", name: "Sarah Jenkins", role: "ADMIN", email: "sarah@reservapp.io", initials: "SJ", added: "Owner" },
  { id: "u2", name: "Marc Peterson", role: "STAFF", email: "marc@reservapp.io", initials: "MP", added: "Added 2d ago" },
];

const COLORS = ["#e65100", "#1565c0", "#388e3c", "#7b1fa2"];

const BILLING_HISTORY = [
  { date: "Nov 1, 2023", plan: "Pro Monthly", amount: "$49.00", status: "Paid" },
  { date: "Oct 1, 2023", plan: "Pro Monthly", amount: "$49.00", status: "Paid" },
  { date: "Sep 1, 2023", plan: "Pro Monthly", amount: "$49.00", status: "Paid" },
];

export default function ConfiguracionPage() {
  const [tab, setTab] = useState<ConfigTab>("general");
  const [primaryColor, setPrimaryColor] = useState("#e65100");
  const [font, setFont] = useState("public-sans");
  const [bgStyle, setBgStyle] = useState("Clean White");
  const [cornerRadius, setCornerRadius] = useState("Modern (8px)");

  const TABS: { id: ConfigTab; label: string }[] = [
    { id: "general", label: "General" },
    { id: "appearance", label: "Appearance" },
    { id: "notifications", label: "Notifications" },
    { id: "team", label: "Team" },
    { id: "billing", label: "Billing" },
  ];

  return (
    <div className={styles.page}>
      {/* Sub-nav lateral */}
      <aside className={styles.subnav}>
        <div className={styles.subnavHeader}>
          <div className={styles.subnavLogo}>🍴</div>
          <div>
            <div className={styles.subnavBrand}>ReservApp</div>
            <div className={styles.subnavSub}>Workspace Settings</div>
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
            <button className={styles.btnDiscard}>Discard</button>
            <button className={styles.btnSave}>Save Changes</button>
          </div>
        </div>

        {/* General */}
        {tab === "general" && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Restaurant Information</h3>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Restaurant Name</label>
                <input className={styles.input} defaultValue="La Trattoria" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Phone</label>
                <input className={styles.input} defaultValue="+1 (555) 000-0000" />
              </div>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label}>Address</label>
                <input className={styles.input} defaultValue="123 Main St, New York, NY 10001" />
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
                <p className={styles.uploadTitle}>Restaurant Logo</p>
                <p className={styles.uploadDesc}>PNG, JPG up to 2MB</p>
              </div>
              <button className={styles.btnUpload}>Upload</button>
            </div>
          </div>
        )}

        {/* Appearance */}
        {tab === "appearance" && (
          <div className={styles.appearanceGrid}>
            <div className={styles.appearanceLeft}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Brand Identity</h3>
                <p className={styles.sectionDesc}>Define the core colors for your public booking widget.</p>
                <label className={styles.label}>Primary Theme Color</label>
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
                <h3 className={styles.sectionTitle}>Accent & UI Styling</h3>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label className={styles.label}>Background Style</label>
                    <select className={styles.input} value={bgStyle} onChange={(e) => setBgStyle(e.target.value)}>
                      <option>Clean White</option>
                      <option>Soft Gray</option>
                      <option>Dark Mode</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Corner Radius</label>
                    <select className={styles.input} value={cornerRadius} onChange={(e) => setCornerRadius(e.target.value)}>
                      <option>Modern (8px)</option>
                      <option>Rounded (16px)</option>
                      <option>Sharp (0px)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Typography</h3>
                <p className={styles.sectionDesc}>Select fonts that match your brand&apos;s voice.</p>
                {[
                  { id: "public-sans", label: "Public Sans (Default)", desc: "Highly readable, neutral, and modern." },
                  { id: "playfair", label: "Playfair Display", desc: "Elegant and traditional serif." },
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
                  <span className={styles.previewLabel}>LIVE PREVIEW</span>
                  <span className={styles.previewLive}><span className={styles.liveDot} /> LIVE UPDATE ENABLED</span>
                </div>
                <div className={styles.previewWidget} style={{ background: primaryColor }}>
                  <p className={styles.previewTitle}>Book a Consultation</p>
                  <p className={styles.previewSub}>Select a date and time that works for you.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {tab === "notifications" && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Notification Settings</h3>
            {[
              "Email confirmation to customer",
              "SMS reminder 24h before",
              "Email on cancellation",
              "Staff alert on new booking",
              "No-show alert",
            ].map((label) => (
              <div key={label} className={styles.notifRow}>
                <span className={styles.notifLabel}>{label}</span>
                <label className={styles.toggleSwitch}>
                  <input type="checkbox" defaultChecked />
                  <span className={styles.toggleTrack} />
                </label>
              </div>
            ))}
            <h3 className={styles.sectionTitle} style={{ marginTop: 24 }}>Email Template</h3>
            <div className={styles.field}>
              <label className={styles.label}>Subject</label>
              <input className={styles.input} defaultValue="Your reservation at {{restaurant_name}} is confirmed!" />
            </div>
            <div className={styles.field} style={{ marginTop: 12 }}>
              <label className={styles.label}>Body</label>
              <textarea className={styles.textarea} rows={4} defaultValue="Hi {{customer_name}}, your reservation for {{guests}} on {{date}} at {{time}} is confirmed." />
            </div>
          </div>
        )}

        {/* Team */}
        {tab === "team" && (
          <div className={styles.section}>
            <div className={styles.teamHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Team Members</h3>
                <p className={styles.sectionDesc}>Manage who has access to this workspace.</p>
              </div>
              <button className={styles.btnInvite}>👥 Invite</button>
            </div>
            <div className={styles.teamTable}>
              <div className={styles.teamTableHeader}>
                <span>Member</span>
                <span>Role</span>
                <span>Action</span>
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
            <h3 className={styles.sectionTitle}>Current Plan</h3>
            <div className={styles.planCard}>
              <div className={styles.planInfo}>
                <span className={styles.planBadge}>PRO MONTHLY</span>
                <p className={styles.planDesc}>Unlimited reservations, advanced analytics, priority support.</p>
              </div>
              <div className={styles.planPrice}>$49<span>/mo</span></div>
              <button className={styles.btnUpgrade}>Upgrade to Annual (Save 20%)</button>
            </div>

            <h3 className={styles.sectionTitle} style={{ marginTop: 28 }}>Payment History</h3>
            <div className={styles.billingTable}>
              <div className={styles.billingHeader}>
                <span>Date</span>
                <span>Plan</span>
                <span>Amount</span>
                <span>Status</span>
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
