"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle, Printer } from "lucide-react";
import styles from "./Factura.module.css";

/* ─── Datos mock por mesa ─── */
const PEDIDOS_MOCK: Record<string, { nombre: string; precio: number; cantidad: number; emoji: string }[]> = {
  "1":  [
    { nombre: "Filete de res",       precio: 68000, cantidad: 2, emoji: "🥩" },
    { nombre: "Limonada de coco",    precio: 12000, cantidad: 3, emoji: "🥤" },
    { nombre: "Bruschetta",          precio: 18000, cantidad: 1, emoji: "🍞" },
  ],
  "3":  [
    { nombre: "Bandeja paisa",       precio: 45000, cantidad: 4, emoji: "🍲" },
    { nombre: "Cerveza artesanal",   precio: 16000, cantidad: 4, emoji: "🍺" },
    { nombre: "Tiramisú",            precio: 18000, cantidad: 2, emoji: "🍰" },
  ],
  "12": [
    { nombre: "Salmón al limón",     precio: 58000, cantidad: 2, emoji: "🐟" },
    { nombre: "Vino copa",           precio: 22000, cantidad: 3, emoji: "🍷" },
    { nombre: "Cheesecake de frutos",precio: 20000, cantidad: 1, emoji: "🍓" },
  ],
};

const METODOS_PAGO = [
  { id: "efectivo",     label: "Efectivo",      emoji: "💵" },
  { id: "tarjeta",      label: "Tarjeta",        emoji: "💳" },
  { id: "transferencia",label: "Transferencia", emoji: "📲" },
  { id: "mixto",        label: "Mixto",          emoji: "🔀" },
];

const MESAS_INFO: Record<string, { numero: number; zona: string; mesero: string }> = {
  "1":  { numero: 1,  zona: "Salón",   mesero: "Carlos R." },
  "3":  { numero: 3,  zona: "Salón",   mesero: "Laura M."  },
  "12": { numero: 12, zona: "Barra",   mesero: "Carlos R." },
};

const IVA_PCT = 0.19;

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

export default function FacturaPage() {
  const params = useParams();
  const mesaId = params?.id as string ?? "1";
  const mesa = MESAS_INFO[mesaId] ?? { numero: Number(mesaId), zona: "—", mesero: "—" };
  const items = PEDIDOS_MOCK[mesaId] ?? PEDIDOS_MOCK["1"];

  const [descuentoPct, setDescuentoPct] = useState(0);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [efectivoIngresado, setEfectivoIngresado] = useState("");
  const [pagado, setPagado] = useState(false);

  const subtotal  = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const descuento = subtotal * (descuentoPct / 100);
  const baseIva   = subtotal - descuento;
  const iva       = baseIva * IVA_PCT;
  const total     = baseIva + iva;
  const cambio    = (parseFloat(efectivoIngresado) || 0) - total;

  const handlePagar = () => {
    if (metodoPago === "efectivo" && parseFloat(efectivoIngresado) < total) return;
    setPagado(true);
  };

  /* Pantalla de éxito */
  if (pagado) {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <CheckCircle size={72} />
          </div>
          <h2 className={styles.successTitle}>¡Pago exitoso!</h2>
          <p className={styles.successSub}>Mesa {mesa.numero} · {mesa.zona}</p>
          <div className={styles.successTotal}>{formatCOP(total)}</div>
          <p className={styles.successMetodo}>Método: {METODOS_PAGO.find((m) => m.id === metodoPago)?.label}</p>
          {metodoPago === "efectivo" && cambio > 0 && (
            <p className={styles.successCambio}>Cambio: {formatCOP(cambio)}</p>
          )}
          <div className={styles.successBtns}>
            <button className={styles.btnImprimir} onClick={() => window.print()}>
              <Printer size={16} /> Imprimir recibo
            </button>
            <Link href="/dashboard/pos" className={styles.btnVolver}>
              Volver a mesas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Cabecera */}
      <div className={styles.topBar}>
        <Link href={`/dashboard/pos/mesa/${mesaId}`} className={styles.backBtn}>
          <ArrowLeft size={18} /> Volver al pedido
        </Link>
        <span className={styles.mesaTag}>
          Mesa {mesa.numero} · {mesa.zona} · {mesa.mesero}
        </span>
      </div>

      <div className={styles.layout}>
        {/* ── Resumen pedido ── */}
        <div className={styles.resumenPanel}>
          <h2 className={styles.panelTitle}>Resumen del pedido</h2>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Artículo</th>
                <th>Cant.</th>
                <th>Precio unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td>
                    <span className={styles.itemEmoji}>{item.emoji}</span>
                    {item.nombre}
                  </td>
                  <td className={styles.tdCenter}>{item.cantidad}</td>
                  <td>{formatCOP(item.precio)}</td>
                  <td className={styles.tdBold}>{formatCOP(item.precio * item.cantidad)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Descuento */}
          <div className={styles.descuentoSection}>
            <label className={styles.fieldLabel}>Descuento (%)</label>
            <div className={styles.descuentoBtns}>
              {[0, 5, 10, 15, 20].map((pct) => (
                <button
                  key={pct}
                  className={`${styles.descBtn} ${descuentoPct === pct ? styles.descBtnActive : ""}`}
                  onClick={() => setDescuentoPct(pct)}
                >
                  {pct === 0 ? "Sin desc." : `${pct}%`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Panel de pago ── */}
        <div className={styles.pagoPanel}>
          <h2 className={styles.panelTitle}>Cobro</h2>

          {/* Desglose */}
          <div className={styles.desglose}>
            <div className={styles.desgloseRow}>
              <span>Subtotal</span><span>{formatCOP(subtotal)}</span>
            </div>
            {descuento > 0 && (
              <div className={`${styles.desgloseRow} ${styles.desgloseDescuento}`}>
                <span>Descuento ({descuentoPct}%)</span>
                <span>− {formatCOP(descuento)}</span>
              </div>
            )}
            <div className={styles.desgloseRow}>
              <span>IVA (19%)</span><span>{formatCOP(iva)}</span>
            </div>
            <div className={`${styles.desgloseRow} ${styles.desgloseTotal}`}>
              <span>TOTAL</span><span>{formatCOP(total)}</span>
            </div>
          </div>

          {/* Método de pago */}
          <div className={styles.metodoSection}>
            <label className={styles.fieldLabel}>Método de pago</label>
            <div className={styles.metodoGrid}>
              {METODOS_PAGO.map((m) => (
                <button
                  key={m.id}
                  className={`${styles.metodoBtn} ${metodoPago === m.id ? styles.metodoBtnActive : ""}`}
                  onClick={() => setMetodoPago(m.id)}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Campo efectivo */}
          {metodoPago === "efectivo" && (
            <div className={styles.efectivoSection}>
              <label className={styles.fieldLabel}>Efectivo recibido</label>
              <input
                className={styles.efectivoInput}
                type="number"
                placeholder="0"
                value={efectivoIngresado}
                onChange={(e) => setEfectivoIngresado(e.target.value)}
              />
              {parseFloat(efectivoIngresado) >= total && (
                <div className={styles.cambioRow}>
                  Cambio: <strong>{formatCOP(cambio)}</strong>
                </div>
              )}
              {parseFloat(efectivoIngresado) > 0 && parseFloat(efectivoIngresado) < total && (
                <div className={styles.faltaRow}>
                  Falta: <strong>{formatCOP(total - parseFloat(efectivoIngresado))}</strong>
                </div>
              )}
            </div>
          )}

          <button
            className={styles.btnPagar}
            onClick={handlePagar}
            disabled={metodoPago === "efectivo" && parseFloat(efectivoIngresado) < total}
          >
            ✅ Confirmar pago · {formatCOP(total)}
          </button>
        </div>
      </div>
    </div>
  );
}
