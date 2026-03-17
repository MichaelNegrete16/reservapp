"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { setSession, MOCK_USERS } from "@/lib/auth";
import styles from "./Login.module.css";

interface Errors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const next: Errors = {};

    if (!email.trim()) {
      next.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Introduce un correo válido.";
    }

    if (!password) {
      next.password = "La contraseña es obligatoria.";
    } else if (password.length < 6) {
      next.password = "Mínimo 6 caracteres.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // Simular delay de red
    await new Promise((r) => setTimeout(r, 600));

    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      setErrors({ general: "Credenciales incorrectas. Verifica tu correo y contraseña." });
      setLoading(false);
      return;
    }

    setSession(user.role);
    window.location.href = user.role === "admin" ? "/admin" : "/dashboard";
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>🍴</div>
          <h1 className={styles.logoTitle}>ReservApp</h1>
          <p className={styles.logoSubtitle}>Gestiona tus reservas fácilmente</p>
        </div>

        {/* Credenciales demo */}
        <div className={styles.demoHint}>
          <span className={styles.demoTitle}>Cuentas de prueba</span>
          <span>👤 demo@reservapp.com / demo123</span>
          <span>🔑 admin@reservapp.com / admin123</span>
        </div>

        {errors.general && (
          <div className={styles.alertError}>
            <AlertCircle size={16} />
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>Correo electrónico</label>
            <input
              type="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
            />
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label}>Contraseña</label>
              <a href="#" className={styles.forgotLink}>¿Olvidaste tu contraseña?</a>
            </div>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <div className={styles.divider}><span>O CONTINUAR CON</span></div>

        <button className={styles.btnGoogle} type="button">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <p className={styles.signupLink}>
          ¿No tienes una cuenta?{" "}
          <Link href="/registro">Regístrate</Link>
        </p>
      </div>

      <footer className={styles.footer}>© 2024 ReservApp. Todos los derechos reservados.</footer>
    </div>
  );
}
