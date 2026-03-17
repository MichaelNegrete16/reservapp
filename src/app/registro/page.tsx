"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Upload, Settings, X } from "lucide-react";
import styles from "./Registro.module.css";

const STEPS = [
  { num: 1, label: "Account" },
  { num: 2, label: "Restaurant" },
  { num: 3, label: "Config" },
];

const ZONAS_DEFAULT = ["Terraza", "Salón Principal", "Barra", "VIP", "Jardín"];

export default function RegistroPage() {
  const [step, setStep] = useState(1);

  // Step 1
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2
  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");

  // Step 3
  const [zonas, setZonas] = useState<string[]>(["Terraza"]);
  const [turnoAlmuerzo, setTurnoAlmuerzo] = useState(true);
  const [turnoCena, setTurnoCena] = useState(true);

  const toggleZona = (zona: string) => {
    setZonas((prev) =>
      prev.includes(zona) ? prev.filter((z) => z !== zona) : [...prev, zona]
    );
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else window.location.href = "/dashboard";
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>✕</span>
          <span className={styles.brand}>ReservApp</span>
        </div>
        <div className={styles.headerRight}>
          <span>Already have an account?</span>
          <Link href="/login" className={styles.signInBtn}>
            Sign In
          </Link>
        </div>
      </header>

      {/* Stepper */}
      <div className={styles.stepper}>
        {STEPS.map(({ num, label }) => (
          <div key={num} className={styles.stepWrapper}>
            <div
              className={`${styles.stepCircle} ${
                step >= num ? styles.stepActive : ""
              }`}
            >
              {num}
            </div>
            <span
              className={`${styles.stepLabel} ${
                step >= num ? styles.stepLabelActive : ""
              }`}
            >
              {label}
            </span>
            {num < 3 && (
              <div
                className={`${styles.stepLine} ${
                  step > num ? styles.stepLineActive : ""
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Account */}
      {step === 1 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Create your account</h2>
          <p className={styles.cardDesc}>
            Join thousands of restaurants managing their bookings with ReservApp.
          </p>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <input
                className={styles.input}
                placeholder="John Doe"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <input
                className={styles.input}
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                className={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Confirm Password</label>
              <input
                className={styles.input}
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.cardActions}>
            <button className={styles.btnNext} onClick={handleNext}>
              Next Step <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Restaurant */}
      {step === 2 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Restaurant Profile</h2>
              <p className={styles.cardDesc}>
                Details about your establishment.
              </p>
            </div>
            <Upload size={24} className={styles.cardIcon} />
          </div>

          <div className={styles.uploadZone}>
            <Upload size={28} className={styles.uploadIcon} />
            <p>Drag & Drop Restaurant Logo</p>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Restaurant Name</label>
              <input
                className={styles.input}
                placeholder="La Trattoria"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Address</label>
              <input
                className={styles.input}
                placeholder="Calle Principal 123"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.cardActions}>
            <button
              className={styles.btnBack}
              onClick={() => setStep(step - 1)}
            >
              Back
            </button>
            <button className={styles.btnNext} onClick={handleNext}>
              Next Step <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Config */}
      {step === 3 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Initial Configuration</h2>
              <p className={styles.cardDesc}>
                Define your zones and shifts.
              </p>
            </div>
            <Settings size={24} className={styles.cardIcon} />
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Zones</label>
            <div className={styles.chips}>
              {ZONAS_DEFAULT.map((z) => (
                <button
                  key={z}
                  className={`${styles.chip} ${
                    zonas.includes(z) ? styles.chipActive : ""
                  }`}
                  onClick={() => toggleZona(z)}
                >
                  {z}
                  {zonas.includes(z) && <X size={14} />}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Shifts</label>
            <div className={styles.shifts}>
              <label className={styles.shiftToggle}>
                <input
                  type="checkbox"
                  checked={turnoAlmuerzo}
                  onChange={() => setTurnoAlmuerzo(!turnoAlmuerzo)}
                />
                <span>Lunch (12:00 - 16:00)</span>
              </label>
              <label className={styles.shiftToggle}>
                <input
                  type="checkbox"
                  checked={turnoCena}
                  onChange={() => setTurnoCena(!turnoCena)}
                />
                <span>Dinner (18:00 - 23:00)</span>
              </label>
            </div>
          </div>

          <div className={styles.cardActions}>
            <button
              className={styles.btnBack}
              onClick={() => setStep(step - 1)}
            >
              Back
            </button>
            <button className={styles.btnNext} onClick={handleNext}>
              Complete Setup <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        <p>© 2024 ReservApp. All rights reserved.</p>
        <div className={styles.footerLinks}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Help Center</a>
        </div>
      </footer>
    </div>
  );
}
