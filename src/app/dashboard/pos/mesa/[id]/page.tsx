"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { api } from "@/lib/api-client";
import styles from "./Orden.module.css";

/* --- Tipos --- */
interface Articulo {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  emoji: string;
}

interface ItemPedido {
  id?: string;        // backend item id (for existing items)
  articulo: Articulo;
  cantidad: number;
  notas: string;
}

interface MesaInfo {
  numero: number;
  zona: string;
  personas: number;
}

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

export default function TomarOrdenPage() {
  const params = useParams();
  const router = useRouter();
  const mesaId = params?.id as string ?? "1";

  const [mesaInfo, setMesaInfo] = useState<MesaInfo>({ numero: 0, zona: "Salón", personas: 0 });
  const [orderId, setOrderId] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState("");
  const [pedido, setPedido] = useState<ItemPedido[]>([]);
  const [notaAbierta, setNotaAbierta] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Prompt for waiter/people when opening a free table
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [openForm, setOpenForm] = useState({ waiter: "", people: 2 });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch menu
      const menuRes = await api.get<{ ok: boolean; data: Record<string, unknown>[] }>("/menu");
      const items: Articulo[] = (menuRes.data ?? [])
        .filter((item) => (item.available as boolean) !== false)
        .map((item) => ({
          id: item.id as string,
          nombre: (item.name as string) ?? (item.nombre as string) ?? "",
          descripcion: (item.description as string) ?? (item.descripcion as string) ?? "",
          precio: (item.price as number) ?? (item.precio as number) ?? 0,
          categoria: (item.category as string) ?? (item.categoria as string) ?? "Otros",
          emoji: (item.emoji as string) ?? "🍽️",
        }));
      setArticulos(items);

      const cats = [...new Set(items.map((i) => i.categoria))];
      setCategorias(cats);
      if (cats.length > 0) setCategoriaActiva(cats[0]);

      // Fetch table info to get active order
      const tablesRes = await api.get<{ ok: boolean; data: Record<string, unknown>[] }>("/pos/tables");
      const table = (tablesRes.data ?? []).find((t) => (t.id as string) === mesaId);

      if (table) {
        setMesaInfo({
          numero: (table.number as number) ?? (table.numero as number) ?? 0,
          zona: (table.zone as string) ?? (table.zona as string) ?? "Salón",
          personas: (table.people as number) ?? (table.personas as number) ?? 0,
        });

        const activeOrderId = (table.orderId as string) ?? (table.activeOrderId as string) ?? null;
        const status = (table.status as string) ?? "libre";

        if (activeOrderId && status !== "libre") {
          setOrderId(activeOrderId);
          // Fetch current order items
          try {
            const orderRes = await api.get<{ ok: boolean; data: Record<string, unknown> }>(`/pos/orders/${activeOrderId}`);
            const orderItems = (orderRes.data?.items as Record<string, unknown>[]) ?? [];
            const mapped: ItemPedido[] = orderItems.map((oi) => {
              const menuItem = items.find((a) => a.id === ((oi.menuItemId as string) ?? (oi.menuItem as Record<string, unknown>)?.id));
              return {
                id: oi.id as string,
                articulo: menuItem ?? {
                  id: (oi.menuItemId as string) ?? "",
                  nombre: (oi.name as string) ?? "",
                  descripcion: "",
                  precio: (oi.price as number) ?? (oi.unitPrice as number) ?? 0,
                  categoria: "",
                  emoji: "🍽️",
                },
                cantidad: (oi.quantity as number) ?? 1,
                notas: (oi.notes as string) ?? "",
              };
            });
            setPedido(mapped);
          } catch {
            // Order might not have items yet
          }
        } else if (status === "libre") {
          // Table is free, show open modal
          setShowOpenModal(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando datos");
    } finally {
      setLoading(false);
    }
  }, [mesaId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenTable = async () => {
    if (!openForm.waiter.trim()) return;
    try {
      const res = await api.post<{ ok: boolean; data: Record<string, unknown> }>(
        `/pos/tables/${mesaId}/open`,
        { waiter: openForm.waiter, people: openForm.people }
      );
      const newOrderId = (res.data?.orderId as string) ?? (res.data?.id as string) ?? null;
      if (newOrderId) setOrderId(newOrderId);
      setMesaInfo((prev) => ({ ...prev, personas: openForm.people }));
      setShowOpenModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error abriendo mesa");
    }
  };

  const agregarAlPedido = async (articulo: Articulo) => {
    // Add locally first for responsiveness
    setPedido((prev) => {
      const existe = prev.find((i) => i.articulo.id === articulo.id);
      if (existe) {
        return prev.map((i) =>
          i.articulo.id === articulo.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { articulo, cantidad: 1, notas: "" }];
    });

    // If we have an active order, sync with backend
    if (orderId) {
      try {
        const res = await api.post<{ ok: boolean; data: Record<string, unknown> }>(
          `/pos/orders/${orderId}/items`,
          { menuItemId: articulo.id, quantity: 1, notes: "" }
        );
        // Update the item id from backend
        const itemId = res.data?.id as string;
        if (itemId) {
          setPedido((prev) =>
            prev.map((i) =>
              i.articulo.id === articulo.id && !i.id ? { ...i, id: itemId } : i
            )
          );
        }
      } catch {
        /* handled globally */
      }
    }
  };

  const cambiarCantidad = async (articuloId: string, delta: number) => {
    const item = pedido.find((i) => i.articulo.id === articuloId);
    if (!item) return;

    const newQty = item.cantidad + delta;

    if (newQty <= 0) {
      // Remove item
      setPedido((prev) => prev.filter((i) => i.articulo.id !== articuloId));
      if (orderId && item.id) {
        try {
          await api.del(`/pos/orders/${orderId}/items/${item.id}`);
        } catch {
          /* handled globally */
        }
      }
    } else {
      setPedido((prev) =>
        prev.map((i) => i.articulo.id === articuloId ? { ...i, cantidad: newQty } : i)
      );
      if (orderId && item.id) {
        try {
          await api.patch(`/pos/orders/${orderId}/items/${item.id}`, { quantity: newQty });
        } catch {
          /* handled globally */
        }
      }
    }
  };

  const actualizarNota = (id: string, nota: string) => {
    setPedido((prev) =>
      prev.map((i) => i.articulo.id === id ? { ...i, notas: nota } : i)
    );
  };

  const enviarACocina = async () => {
    if (!orderId || pedido.length === 0) return;
    try {
      setSending(true);
      await api.post(`/pos/orders/${orderId}/send-kitchen`);
      alert("Comanda enviada a cocina");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error enviando a cocina");
    } finally {
      setSending(false);
    }
  };

  const subtotal = pedido.reduce((s, i) => s + i.articulo.precio * i.cantidad, 0);
  const totalItems = pedido.reduce((s, i) => s + i.cantidad, 0);

  const articulosFiltrados = articulos.filter((a) => a.categoria === categoriaActiva);

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ padding: 60, textAlign: "center", color: "#999" }}>Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div style={{ padding: 60, textAlign: "center", color: "#d32f2f" }}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Cabecera */}
      <div className={styles.topBar}>
        <Link href="/dashboard/pos" className={styles.backBtn}>
          <ArrowLeft size={18} /> Volver a mesas
        </Link>
        <div className={styles.mesaTag}>
          🍴 Mesa {mesaInfo.numero} · {mesaInfo.zona}
          {mesaInfo.personas > 0 && ` · ${mesaInfo.personas} personas`}
        </div>
      </div>

      <div className={styles.layout}>
        {/* -- MENU (izquierda) -- */}
        <div className={styles.menuPanel}>
          <div className={styles.categorias}>
            {categorias.map((cat) => (
              <button
                key={cat}
                className={`${styles.catBtn} ${categoriaActiva === cat ? styles.catBtnActive : ""}`}
                onClick={() => setCategoriaActiva(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.articulosGrid}>
            {articulosFiltrados.map((art) => {
              const enPedido = pedido.find((i) => i.articulo.id === art.id);
              return (
                <div key={art.id} className={styles.articuloCard}>
                  <div className={styles.articuloEmoji}>{art.emoji}</div>
                  <div className={styles.articuloInfo}>
                    <span className={styles.articuloNombre}>{art.nombre}</span>
                    <span className={styles.articuloDesc}>{art.descripcion}</span>
                    <span className={styles.articuloPrecio}>{formatCOP(art.precio)}</span>
                  </div>
                  <button
                    className={`${styles.btnAgregar} ${enPedido ? styles.btnAgregado : ""}`}
                    onClick={() => agregarAlPedido(art)}
                  >
                    {enPedido ? `+${enPedido.cantidad}` : <Plus size={16} />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* -- PEDIDO (derecha) -- */}
        <div className={styles.pedidoPanel}>
          <div className={styles.pedidoHeader}>
            <h3 className={styles.pedidoTitulo}>
              <ShoppingBag size={18} /> Pedido actual
            </h3>
            {totalItems > 0 && (
              <span className={styles.pedidoBadge}>{totalItems} items</span>
            )}
          </div>

          <div className={styles.pedidoLista}>
            {pedido.length === 0 ? (
              <div className={styles.pedidoVacio}>
                <span>🛒</span>
                <p>Agrega artículos del menú</p>
              </div>
            ) : (
              pedido.map((item) => (
                <div key={item.articulo.id} className={styles.pedidoItem}>
                  <div className={styles.pedidoItemTop}>
                    <span className={styles.pedidoEmoji}>{item.articulo.emoji}</span>
                    <div className={styles.pedidoItemInfo}>
                      <span className={styles.pedidoItemNombre}>{item.articulo.nombre}</span>
                      <span className={styles.pedidoItemPrecio}>{formatCOP(item.articulo.precio * item.cantidad)}</span>
                    </div>
                    <div className={styles.cantidadControl}>
                      <button className={styles.cantBtn} onClick={() => cambiarCantidad(item.articulo.id, -1)}>
                        {item.cantidad === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
                      </button>
                      <span className={styles.cantNum}>{item.cantidad}</span>
                      <button className={styles.cantBtn} onClick={() => cambiarCantidad(item.articulo.id, 1)}>
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  <button
                    className={styles.notaToggle}
                    onClick={() => setNotaAbierta(notaAbierta === item.articulo.id ? null : item.articulo.id)}
                  >
                    📝 {item.notas ? "Nota: " + item.notas : "Agregar nota"}
                  </button>
                  {notaAbierta === item.articulo.id && (
                    <input
                      className={styles.notaInput}
                      placeholder="Sin cebolla, sin sal, alérgico a..."
                      value={item.notas}
                      onChange={(e) => actualizarNota(item.articulo.id, e.target.value)}
                      onBlur={() => setNotaAbierta(null)}
                      autoFocus
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Totales y acciones */}
          <div className={styles.pedidoFooter}>
            <div className={styles.subtotalRow}>
              <span>Subtotal ({totalItems} items)</span>
              <span className={styles.subtotalVal}>{formatCOP(subtotal)}</span>
            </div>

            <div className={styles.pedidoBtns}>
              <button
                className={styles.btnCocina}
                disabled={pedido.length === 0 || sending}
                onClick={enviarACocina}
              >
                🍳 {sending ? "Enviando..." : "Enviar a cocina"}
              </button>
              <Link
                href={pedido.length > 0 ? `/dashboard/pos/factura/${mesaId}` : "#"}
                className={`${styles.btnCobrar} ${pedido.length === 0 ? styles.btnDisabled : ""}`}
              >
                💳 Cobrar
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal abrir mesa */}
      {showOpenModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "#fff", borderRadius: 12, padding: 24, width: 380, maxWidth: "90vw",
          }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 18 }}>Abrir Mesa {mesaInfo.numero}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>Mesero *</label>
                <input
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }}
                  value={openForm.waiter}
                  onChange={(e) => setOpenForm((f) => ({ ...f, waiter: e.target.value }))}
                  placeholder="Nombre del mesero"
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>Personas</label>
                <input
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }}
                  type="number"
                  min={1}
                  value={openForm.people}
                  onChange={(e) => setOpenForm((f) => ({ ...f, people: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button
                style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
                onClick={() => router.push("/dashboard/pos")}
              >
                Cancelar
              </button>
              <button
                style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#e65100", color: "#fff", cursor: "pointer", fontWeight: 600 }}
                onClick={handleOpenTable}
              >
                Abrir mesa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
