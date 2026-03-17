"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Upload, Settings, X } from "lucide-react";
import styles from "./Registro.module.css";

const STEPS = [
  { num: 1, label: "Cuenta" },
  { num: 2, label: "Restaurante" },
  { num: 3, label: "Configuración" },
];

const ZONAS_DEFAULT = ["Terraza", "Salón Principal", "Barra", "VIP", "Jardín"];

export default function RegistroPage() {
  const [step, setStep] = useState(1);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");

  const [zonas, setZonas] = useState<string[]>(["Terraza"]);
  const [turnoAlmuerzo, setTurnoAlmuerzo] = useState(true);
  const [turnoCena, setTurnoCena] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleZona = (zona: string) => {
    setZonas((prev) =>
      prev.includes(zona) ? prev.filter((z) => z !== zona) : [...prev, zona]
    );
  };

  const validateStep = (): boolean => {
    const next: Record<string, string> = {};
    if (step === 1) {
      if (!nombre.trim()) next.nombre = "El nombre es obligatorio.";
      if (!email.trim()) next.email = "El correo es obligatorio.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Correo inválido.";
      if (!password) next.password = "La contraseña es obligatoria.";
      else if (password.length < 6) next.password = "Mínimo 6 caracteres.";
      if (password !== confirmPassword) next.confirmPassword = "Las contraseñas no coinciden.";
    }
    if (step === 2) {
      if (!restaurantName.trim()) next.restaurantName = "El nombre del restaurante es obligatorio.";
    }
    if (step === 3) {
      if (zonas.length === 0) next.zonas = "Selecciona al menos una zona.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < 3) setStep(step + 1);
    else window.location.href = "/dashboard";
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>✕</span>
          <span className={styles.brand}>ReservApp</span>
        </div>
        <div className={styles.headerRight}>
          <span>¿Ya tienes una cuenta?</span>
          <Link href="/login" className={styles.signInBtn}>
            Iniciar sesión
          </Link>
        </div>
      </header>

      <div className={styles.stepper}>
        {STEPS.map(({ num, label }) => (
          <div key={num} className={styles.stepWrapper}>
            <div className={`${styles.stepCircle} ${step >= num ? styles.stepActive : ""}`}>
              {num}
            </div>
            <span className={`${styles.stepLabel} ${step >= num ? styles.stepLabelActive : ""}`}>
              {label}
            </span>
            {num < 3 && (
              <div className={`${styles.stepLine} ${step > num ? styles.stepLineActive : ""}`} />
            )}
          </div>
        ))}
      </div>

      {/* Paso 1: Cuenta */}
      {step === 1 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Crea tu cuenta</h2>
          <p className={styles.cardDesc}>
            Únete a miles de restaurantes que gestionan sus reservas con ReservApp.
          </p>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Nombre completo</label>
              <input
                className={`${styles.input} ${errors.nombre ? styles.inputError : ""}`}
                placeholder="Juan Pérez"
                value={nombre}
                onChange={(e) => { setNombre(e.target.value); setErrors((p) => ({ ...p, nombre: "" })); }}
              />
              {errors.nombre && <span className={styles.fieldError}>{errors.nombre}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Correo electrónico</label>
              <input
                className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                type="email"
                placeholder="juan@ejemplo.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
              />
              {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Contraseña</label>
              <input
                className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
              />
              {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Confirmar contraseña</label>
              <input
                className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: "" })); }}
              />
              {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword}</span>}
            </div>
          </div>
          <div className={styles.cardActions}>
            <button className={styles.btnNext} onClick={handleNext}>
              Siguiente <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Paso 2: Restaurante */}
      {step === 2 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Perfil del restaurante</h2>
              <p className={styles.cardDesc}>Datos de tu establecimiento.</p>
            </div>
            <Upload size={24} className={styles.cardIcon} />
          </div>

          <div className={styles.uploadZone}>
            <Upload size={28} className={styles.uploadIcon} />
            <p>Arrastra el logo del restaurante aquí</p>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Nombre del restaurante</label>
              <input
                className={`${styles.input} ${errors.restaurantName ? styles.inputError : ""}`}
                placeholder="La Trattoria"
                value={restaurantName}
                onChange={(e) => { setRestaurantName(e.target.value); setErrors((p) => ({ ...p, restaurantName: "" })); }}
              />
              {errors.restaurantName && <span className={styles.fieldError}>{errors.restaurantName}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Dirección</label>
              <input
                className={styles.input}
                placeholder="Calle Principal 123"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.cardActions}>
            <button className={styles.btnBack} onClick={() => setStep(step - 1)}>
              Atrás
            </button>
            <button className={styles.btnNext} onClick={handleNext}>
              Siguiente <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Paso 3: Configuración inicial */}
      {step === 3 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Configuración inicial</h2>
              <p className={styles.cardDesc}>Define tus zonas y turnos de atención.</p>
            </div>
            <Settings size={24} className={styles.cardIcon} />
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Zonas</label>
            <div className={styles.chips}>
              {ZONAS_DEFAULT.map((z) => (
                <button
                  key={z}
                  className={`${styles.chip} ${zonas.includes(z) ? styles.chipActive : ""}`}
                  onClick={() => { toggleZona(z); setErrors((p) => ({ ...p, zonas: "" })); }}
                >
                  {z}
                  {zonas.includes(z) && <X size={14} />}
                </button>
              ))}
            </div>
            {errors.zonas && <span className={styles.fieldError}>{errors.zonas}</span>}
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Turnos</label>
            <div className={styles.shifts}>
              <label className={styles.shiftToggle}>
                <input type="checkbox" checked={turnoAlmuerzo} onChange={() => setTurnoAlmuerzo(!turnoAlmuerzo)} />
                <span>Almuerzo (12:00 - 16:00)</span>
              </label>
              <label className={styles.shiftToggle}>
                <input type="checkbox" checked={turnoCena} onChange={() => setTurnoCena(!turnoCena)} />
                <span>Cena (18:00 - 23:00)</span>
              </label>
            </div>
          </div>

          <div className={styles.cardActions}>
            <button className={styles.btnBack} onClick={() => setStep(step - 1)}>Atrás</button>
            <button className={styles.btnNext} onClick={handleNext}>
              Finalizar registro <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        <p>© 2024 ReservApp. Todos los derechos reservados.</p>
        <div className={styles.footerLinks}>
          <a href="#">Política de privacidad</a>
          <a href="#">Términos de servicio</a>
          <a href="#">Centro de ayuda</a>
        </div>
      </footer>
    </div>
  );
}
