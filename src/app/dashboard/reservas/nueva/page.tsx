"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, X } from "lucide-react";
import Stepper from "@/components/Stepper";
import styles from "./NuevaReserva.module.css";

const STEPS = [
  { num: 1, label: "Schedule" },
  { num: 2, label: "Zone" },
  { num: 3, label: "Details" },
  { num: 4, label: "Confirm" },
];

const TIME_SLOTS = [
  "18:30", "19:00", "19:30", "20:00", "20:30", "21:00",
];

const ZONES = [
  { id: "main", name: "Main Dining Hall", desc: "Indoor, lively atmosphere, near the bar." },
  { id: "terrace", name: "Garden Terrace", desc: "Outdoor, quiet, pet friendly area." },
  { id: "vip", name: "VIP Room", desc: "Private and exclusive dining." },
  { id: "bar", name: "Bar Lounge", desc: "Casual high-top seating." },
];

const MOTIVOS = ["Casual Dinner", "Birthday", "Anniversary", "Business", "Other"];

export default function NuevaReservaPage() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("19:00");
  const [selectedZone, setSelectedZone] = useState("main");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [documento, setDocumento] = useState("");
  const [motivo, setMotivo] = useState("Casual Dinner");
  const [personas, setPersonas] = useState(2);
  const [success, setSuccess] = useState(false);

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const monthName = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const handleComplete = () => {
    setSuccess(true);
  };

  if (success) {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <CheckCircle size={64} />
          </div>
          <h2>Reservation Confirmed!</h2>
          <p>
            {nombre} · {personas} people · {selectedTime}
          </p>
          <p className={styles.successZone}>
            {ZONES.find((z) => z.id === selectedZone)?.name}
          </p>
          <a href="/dashboard/reservas" className={styles.btnBack}>
            Back to Reservations
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLogo}>🍴 ReservApp</div>
        <a href="/dashboard/reservas" className={styles.closeBtn}>
          <X size={20} />
        </a>
      </div>

      <Stepper steps={STEPS} current={step} />

      <div className={styles.content}>
        {/* Step 1: Schedule */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <div className={styles.twoCol}>
              <div>
                <h3 className={styles.sectionTitle}>Select Date</h3>
                <div className={styles.calendar}>
                  <div className={styles.calendarHeader}>
                    <button className={styles.calNavBtn}>&lt;</button>
                    <span className={styles.calMonth}>{monthName}</span>
                    <button className={styles.calNavBtn}>&gt;</button>
                  </div>
                  <div className={styles.calGrid}>
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                      <span key={d + i} className={styles.calDayLabel}>{d}</span>
                    ))}
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <span key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const isSelected = selectedDate === dateStr;
                      const isPast = day < today.getDate();
                      return (
                        <button
                          key={day}
                          className={`${styles.calDay} ${isSelected ? styles.calDaySelected : ""} ${isPast ? styles.calDayPast : ""}`}
                          onClick={() => !isPast && setSelectedDate(dateStr)}
                          disabled={isPast}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <h3 className={styles.sectionTitle} style={{ marginTop: 24 }}>
                  Arrival Time
                </h3>
                <div className={styles.timeSlots}>
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t}
                      className={`${styles.timeChip} ${selectedTime === t ? styles.timeChipActive : ""}`}
                      onClick={() => setSelectedTime(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className={styles.sectionTitle}>Select Seating Zone</h3>
                <div className={styles.zoneCards}>
                  {ZONES.map((z) => (
                    <div
                      key={z.id}
                      className={`${styles.zoneCard} ${selectedZone === z.id ? styles.zoneCardActive : ""}`}
                      onClick={() => setSelectedZone(z.id)}
                    >
                      <div className={styles.zoneImgPlaceholder} />
                      <div className={styles.zoneInfo}>
                        <span className={styles.zoneName}>{z.name}</span>
                        <span className={styles.zoneDesc}>{z.desc}</span>
                        {selectedZone === z.id && (
                          <span className={styles.zoneSelected}>✓ SELECTED</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Customer Details */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <h3 className={styles.sectionTitle}>Customer Information</h3>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>FULL NAME</label>
                <input
                  className={styles.input}
                  placeholder="John Doe"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>PHONE NUMBER</label>
                <input
                  className={styles.input}
                  placeholder="+1 (555) 000-0000"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label}>EMAIL ADDRESS</label>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>DOCUMENT ID</label>
                <input
                  className={styles.input}
                  placeholder="ID / Passport"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>MOTIVE</label>
                <select
                  className={styles.input}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                >
                  {MOTIVOS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <h3 className={styles.sectionTitle} style={{ marginTop: 24 }}>
              Party Size
            </h3>
            <div className={styles.personasSelector}>
              <button
                className={styles.personasBtn}
                onClick={() => setPersonas(Math.max(1, personas - 1))}
              >
                −
              </button>
              <span className={styles.personasCount}>{personas}</span>
              <button
                className={styles.personasBtn}
                onClick={() => setPersonas(Math.min(20, personas + 1))}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <h3 className={styles.sectionTitle}>Reservation Summary</h3>
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Date</span>
                <span className={styles.summaryValue}>
                  {selectedDate || "Not selected"}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Time</span>
                <span className={styles.summaryValue}>{selectedTime}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Zone</span>
                <span className={styles.summaryValue}>
                  {ZONES.find((z) => z.id === selectedZone)?.name}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Party Size</span>
                <span className={styles.summaryValue}>{personas} people</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Guest</span>
                <span className={styles.summaryValue}>
                  {nombre || "Not provided"}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Phone</span>
                <span className={styles.summaryValue}>
                  {telefono || "Not provided"}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Email</span>
                <span className={styles.summaryValue}>
                  {email || "Not provided"}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Motive</span>
                <span className={styles.summaryValue}>{motivo}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        {step > 1 ? (
          <button className={styles.btnBackNav} onClick={() => setStep(step - 1)}>
            <ArrowLeft size={16} /> Back
          </button>
        ) : (
          <div />
        )}
        {step < 3 ? (
          <button className={styles.btnNext} onClick={() => setStep(step + 1)}>
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button className={styles.btnComplete} onClick={handleComplete}>
            Complete Reservation <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
