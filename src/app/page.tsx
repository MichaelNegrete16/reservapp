"use client";

import Link from "next/link";
import {
  Clock,
  LayoutGrid,
  Globe,
  BarChart3,
  Bell,
  Users,
  Check,
} from "lucide-react";
import styles from "./Landing.module.css";

const FEATURES = [
  {
    icon: Clock,
    title: "Gestión en tiempo real",
    desc: "Controla tus reservas al instante desde cualquier dispositivo. Sincronización total para evitar overbooking.",
    color: "#c2185b",
  },
  {
    icon: LayoutGrid,
    title: "Mapa de mesas interactivo",
    desc: "Diseña y gestiona tu sala de forma visual. Arrastra y suelta para organizar a tus comensales de forma eficiente.",
    color: "#1565c0",
  },
  {
    icon: Globe,
    title: "Widget web personalizado",
    desc: "Recibe reservas 24/7 directamente desde tu web o redes sociales con un widget que se adapta a tu marca.",
    color: "#e65100",
  },
  {
    icon: BarChart3,
    title: "Informes detallados",
    desc: "Analiza el rendimiento de tu negocio con datos precisos sobre ocupación, tickets medios y clientes frecuentes.",
    color: "#c2185b",
  },
  {
    icon: Bell,
    title: "Notificaciones SMS/Email",
    desc: "Recordatorios automáticos para reducir cancelaciones y confirmaciones instantáneas para tus clientes.",
    color: "#6a1b9a",
  },
  {
    icon: Users,
    title: "Multi-usuario",
    desc: "Asigna roles y permisos personalizados a todo tu equipo. Controla quién accede a qué información sensible.",
    color: "#e65100",
  },
];

const PLAN_FREE = [
  "Hasta 50 reservas/mes",
  "2 zonas, 5 mesas",
  "15 artículos en el menú",
  "Widget de reservas público",
  "Gestión de horarios y turnos",
  "1 usuario",
];

const PLAN_PRO = [
  "Reservas ilimitadas",
  "10 zonas, 50 mesas, 200 artículos",
  "Punto de Venta (POS) completo",
  "Facturación electrónica (Siigo / MisFacturas)",
  "Base de clientes + tags VIP",
  "Reportes y analytics",
  "Notificaciones email",
  "Personalizar widget",
  "Hasta 5 usuarios",
];

const PLAN_PLATINUM = [
  "Todo lo de Pro, sin límites",
  "Zonas, mesas y menú ilimitados",
  "Usuarios ilimitados",
  "Notificaciones WhatsApp",
  "Multi-sede (varios restaurantes)",
  "Acceso a API externa",
  "Soporte prioritario 24/7",
];

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <span className={styles.navLogo}>✕</span>
          <span className={styles.navBrand}>ReservApp</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features">Funciones</a>
          <a href="#pricing">Precios</a>
          <a href="#contact">Contacto</a>
        </div>
        <div className={styles.navRight}>
          <Link href="/login" className={styles.navLogin}>
            Iniciar sesión
          </Link>
          <Link href="/registro" className={styles.navCta}>
            Empieza gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            El sistema de reservas que tu{" "}
            <span className={styles.heroHighlight}>restaurante</span> necesita
          </h1>
          <p className={styles.heroDesc}>
            Optimiza tu sala, reduce el no-show y mejora la experiencia de tus
            clientes con la plataforma de gestión más intuitiva del mercado.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/registro" className={styles.btnPrimary}>
              Empieza gratis
            </Link>
            <Link href="/dashboard" className={styles.btnSecondary}>
              Ver demo
            </Link>
          </div>
          <div className={styles.heroSocial}>
            <div className={styles.heroAvatars}>
              <span className={styles.heroAvatar} style={{ background: "#e3f2fd" }} />
              <span className={styles.heroAvatar} style={{ background: "#f3e5f5" }} />
              <span className={styles.heroAvatar} style={{ background: "#e8f5e9" }} />
            </div>
            <span className={styles.heroTrust}>
              Más de 500 restaurantes confían en nosotros
            </span>
          </div>
        </div>
        <div className={styles.heroMockup}>
          <div className={styles.mockupCard}>
            <div className={styles.mockupHeader}>
              <div className={styles.mockupDot} />
              <div className={styles.mockupDot} />
              <div className={styles.mockupDot} />
            </div>
            <div className={styles.mockupBody}>
              <div className={styles.mockupLine} style={{ width: "80%" }} />
              <div className={styles.mockupLine} style={{ width: "60%" }} />
              <div className={styles.mockupGrid}>
                <div className={styles.mockupBlock} />
                <div className={styles.mockupBlock} />
                <div className={styles.mockupBlock} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features} id="features">
        <p className={styles.sectionLabel}>CARACTERÍSTICAS</p>
        <h2 className={styles.sectionTitle}>
          Todo lo que necesitas para gestionar tu restaurante
        </h2>
        <div className={styles.featuresGrid}>
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className={styles.featureCard}>
              <div
                className={styles.featureIcon}
                style={{ background: `${color}15`, color }}
              >
                <Icon size={22} />
              </div>
              <h3 className={styles.featureTitle}>{title}</h3>
              <p className={styles.featureDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.pricing} id="pricing">
        <h2 className={styles.sectionTitle}>Planes diseñados para crecer</h2>
        <p className={styles.sectionSubtitle}>
          Sin costes ocultos. Sin letra pequeña.
        </p>
        <div className={styles.pricingGrid}>
          {/* FREE */}
          <div className={styles.pricingCard}>
            <h3 className={styles.planName}>Free</h3>
            <p className={styles.planDesc}>
              Para locales que están empezando a digitalizarse.
            </p>
            <div className={styles.planPrice}>
              <span className={styles.priceAmount}>$0</span>
              <span className={styles.pricePeriod}>/mes</span>
            </div>
            <ul className={styles.planFeatures}>
              {PLAN_FREE.map((f) => (
                <li key={f}>
                  <Check size={16} className={styles.checkGreen} /> {f}
                </li>
              ))}
            </ul>
            <Link href="/registro" className={styles.btnOutline}>
              Empezar gratis
            </Link>
          </div>

          {/* PRO */}
          <div className={`${styles.pricingCard} ${styles.pricingCardPro}`}>
            <span className={styles.planBadge}>RECOMENDADO</span>
            <h3 className={styles.planName}>Pro</h3>
            <p className={styles.planDesc}>
              Para restaurantes que quieren operar al máximo.
            </p>
            <div className={styles.planPrice}>
              <span className={`${styles.priceAmount} ${styles.priceAmountPro}`}>
                $99.000
              </span>
              <span className={styles.pricePeriod}>COP/mes</span>
            </div>
            <ul className={styles.planFeatures}>
              {PLAN_PRO.map((f) => (
                <li key={f}>
                  <Check size={16} className={styles.checkPink} /> {f}
                </li>
              ))}
            </ul>
            <Link href="/registro" className={styles.btnPrimary}>
              Probar 14 días gratis
            </Link>
          </div>

          {/* PLATINUM */}
          <div className={`${styles.pricingCard} ${styles.pricingCardPlatinum}`}>
            <span className={styles.planBadgePlatinum}>ENTERPRISE</span>
            <h3 className={styles.planName}>Platinum</h3>
            <p className={styles.planDesc}>
              Multi-sede, sin límites, soporte dedicado.
            </p>
            <div className={styles.planPrice}>
              <span className={`${styles.priceAmount} ${styles.priceAmountPlatinum}`}>
                $249.000
              </span>
              <span className={styles.pricePeriod}>COP/mes</span>
            </div>
            <ul className={styles.planFeatures}>
              {PLAN_PLATINUM.map((f) => (
                <li key={f}>
                  <Check size={16} className={styles.checkPurple} /> {f}
                </li>
              ))}
            </ul>
            <Link href="/registro" className={styles.btnPlatinum}>
              Contactar ventas
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta} id="contact">
        <h2 className={styles.ctaTitle}>
          ¿Listo para transformar tu restaurante?
        </h2>
        <p className={styles.ctaDesc}>
          Únete a cientos de establecimientos que ya han optimizado su operativa
          con ReservApp.
        </p>
        <div className={styles.ctaButtons}>
          <Link href="/registro" className={styles.btnCtaPrimary}>
            Empieza tu prueba gratuita
          </Link>
          <a href="#contact" className={styles.btnCtaSecondary}>
            Hablar con ventas
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <span className={styles.navLogo}>✕</span>
              <span className={styles.navBrand}>ReservApp</span>
            </div>
            <p className={styles.footerDesc}>
              La solución integral de reservas diseñada por y para
              restauradores. Potencia tu negocio con tecnología de vanguardia.
            </p>
          </div>
          <div className={styles.footerCol}>
            <h4>Producto</h4>
            <a href="#features">Funciones</a>
            <a href="#pricing">Precios</a>
            <Link href="/dashboard">Dashboard</Link>
            <a href="#contact">Seguridad</a>
          </div>
          <div className={styles.footerCol}>
            <h4>Compañía</h4>
            <a href="#contact">Sobre nosotros</a>
            <a href="#contact">Blog</a>
            <a href="#contact">Clientes</a>
            <a href="#contact">Contacto</a>
          </div>
          <div className={styles.footerCol}>
            <h4>Legal</h4>
            <a href="#contact">Privacidad</a>
            <a href="#contact">Términos</a>
            <a href="#contact">Cookies</a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2024 ReservApp SaaS. Todos los derechos reservados.</span>
          <span>Español (España)</span>
        </div>
      </footer>
    </div>
  );
}
