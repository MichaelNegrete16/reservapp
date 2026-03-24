"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle, Printer } from "lucide-react";
import { api } from "@/lib/api-client";
import styles from "./Factura.module.css";

interface BillItem {
  nombre: string;
  precio: number;
  cantidad: number;
  emoji: string;
}

interface MesaFactura {
  numero: number;
  zona: string;
  mesero: string;
}

const METODOS_PAGO = [
  { id: "efectivo",     label: "Efectivo",      emoji: "💵" },
  { id: "tarjeta",      label: "Tarjeta",        emoji: "💳" },
  { id: "transferencia",label: "Transferencia", emoji: "📲" },
  { id: "mixto",        label: "Mixto",          emoji: "🔀" },
];

const IVA_PCT = 0.19;

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

export default function FacturaPage() {
  const params = useParams();
  const mesaId = params?.id as string ?? "1";

  const [mesa, setMesa] = useState<MesaFactura>({ numero: 0, zona: "--", mesero: "--" });
  const [items, setItems] = useState<BillItem[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [descuentoPct, setDescuentoPct] = useState(0);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [efectivoIngresado, setEfectivoIngresado] = useState("");
  const [pagado, setPagado] = useState(false);
  const [paying, setPaying] = useState(false);

  const fetchBill = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First get table info to find the active order
      const tablesRes = await api.get<{ ok: boolean; data: Record<string, unknown>[] }>("/pos/tables");
      const table = (tablesRes.data ?? []).find((t) => (t.id as string) === mesaId);

      if (!table) {
        setError("Mesa no encontrada");
        return;
      }

      setMesa({
        numero: (table.number as number) ?? (table.numero as number) ?? 0,
        zona: (table.zone as string) ?? (table.zona as string) ?? "--",
        mesero: (table.waiter as string) ?? (table.mesero as string) ?? "--",
      });

      const activeOrderId = (table.orderId as string) ?? (table.activeOrderId as string) ?? null;
      if (!activeOrderId) {
        setError("No hay orden activa para esta mesa");
        return;
      }

      setOrderId(activeOrderId);

      // Get the bill
      const billRes = await api.get<{ ok: boolean; data: Record<string, unknown> }>(`/pos/orders/${activeOrderId}/bill`);
      const billData = billRes.data;

      const billItems = (billData?.items as Record<string, unknown>[]) ?? [];
      const mapped: BillItem[] = billItems.map((item) => ({
        nombre: (item.name as string) ?? (item.nombre as string) ?? "",
        precio: (item.price as number) ?? (item.unitPrice as number) ?? (item.precio as number) ?? 0,
        cantidad: (item.quantity as number) ?? (item.cantidad as number) ?? 1,
        emoji: (item.emoji as string) ?? "🍽️",
      }));

      setItems(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando factura");
    } finally {
      setLoading(false);
    }
  }, [mesaId]);

  useEffect(() => {
    fetchBill();
  }, [fetchBill]);

  const subtotal  = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const descuento = subtotal * (descuentoPct / 100);
  const baseIva   = subtotal - descuento;
  const iva       = baseIva * IVA_PCT;
  const total     = baseIva + iva;
  const cambio    = (parseFloat(efectivoIngresado) || 0) - total;

  const handlePagar = async () => {
    if (metodoPago === "efectivo" && parseFloat(efectivoIngresado) < total) return;
    if (!orderId) return;
    try {
      setPaying(true);
      await api.post(`/pos/orders/${orderId}/pay`, {
        paymentMethod: metodoPago,
        discount: descuentoPct,
        cashReceived: metodoPago === "efectivo" ? parseFloat(efectivoIngresado) : undefined,
      });
      setPagado(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error procesando pago");
    } finally {
      setPaying(false);
    }
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

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ padding: 60, textAlign: "center", color: "#999" }}>Cargando factura...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.topBar}>
          <Link href={`/dashboard/pos/mesa/${mesaId}`} className={styles.backBtn}>
            <ArrowLeft size={18} /> Volver al pedido
          </Link>
        </div>
        <div style={{ padding: 60, textAlign: "center", color: "#d32f2f" }}>{error}</div>
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
        {/* -- Resumen pedido -- */}
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

        {/* -- Panel de pago -- */}
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
                <span>- {formatCOP(descuento)}</span>
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
            disabled={(metodoPago === "efectivo" && parseFloat(efectivoIngresado) < total) || paying}
          >
            {paying ? "Procesando..." : `Confirmar pago · ${formatCOP(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
