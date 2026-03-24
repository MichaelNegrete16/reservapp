"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { api } from "@/lib/api-client";
import styles from "./Menu.module.css";

/* --- Tipos --- */
interface Articulo {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  emoji: string;
  disponible: boolean;
}

const CATEGORIAS = ["Todas", "Entradas", "Platos principales", "Bebidas", "Postres", "Especiales"];

const EMOJIS = ["🍕","🍔","🥩","🍝","🍗","🐟","🥗","🍜","🍣","🥘","🍤","🧀","🍞","🥣","🍄","🥤","🧃","💧","🍺","🍷","☕","🍰","🍫","🍓","🍲","⭐"];

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

const VACIO: Omit<Articulo, "id"> = {
  nombre: "", descripcion: "", precio: 0, categoria: "Entradas", emoji: "🍽️", disponible: true,
};

export default function GestorMenuPage() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState<"nuevo" | "editar" | null>(null);
  const [form, setForm] = useState<Omit<Articulo, "id">>(VACIO);
  const [editId, setEditId] = useState<string | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{ ok: boolean; data: Record<string, unknown>[] }>("/menu");
      const mapped: Articulo[] = (res.data ?? []).map((item) => ({
        id: item.id as string,
        nombre: (item.name as string) ?? (item.nombre as string) ?? "",
        descripcion: (item.description as string) ?? (item.descripcion as string) ?? "",
        precio: (item.price as number) ?? (item.precio as number) ?? 0,
        categoria: (item.category as string) ?? (item.categoria as string) ?? "Otros",
        emoji: (item.emoji as string) ?? "🍽️",
        disponible: (item.available as boolean) ?? (item.disponible as boolean) ?? true,
      }));
      setArticulos(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando menú");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const filtrados = articulos.filter((a) => {
    const matchCat = categoriaActiva === "Todas" || a.categoria === categoriaActiva;
    const matchBus = !busqueda || a.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBus;
  });

  const toggleDisponible = async (id: string) => {
    // Optimistic update
    setArticulos((prev) =>
      prev.map((a) => a.id === id ? { ...a, disponible: !a.disponible } : a)
    );
    try {
      await api.patch(`/menu/${id}/availability`);
    } catch (err) {
      // Revert on error
      setArticulos((prev) =>
        prev.map((a) => a.id === id ? { ...a, disponible: !a.disponible } : a)
      );
      alert(err instanceof Error ? err.message : "Error cambiando disponibilidad");
    }
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar este artículo?")) return;
    try {
      await api.del(`/menu/${id}`);
      setArticulos((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error eliminando artículo");
    }
  };

  const abrirEditar = (art: Articulo) => {
    setEditId(art.id);
    setForm({ nombre: art.nombre, descripcion: art.descripcion, precio: art.precio, categoria: art.categoria, emoji: art.emoji, disponible: art.disponible });
    setModal("editar");
    setErrores({});
  };

  const abrirNuevo = () => {
    setForm(VACIO);
    setEditId(null);
    setModal("nuevo");
    setErrores({});
  };

  const validar = () => {
    const next: Record<string, string> = {};
    if (!form.nombre.trim()) next.nombre = "El nombre es obligatorio.";
    if (!form.precio || form.precio <= 0) next.precio = "El precio debe ser mayor a 0.";
    setErrores(next);
    return Object.keys(next).length === 0;
  };

  const guardar = async () => {
    if (!validar()) return;
    try {
      setSaving(true);
      const payload = {
        name: form.nombre,
        description: form.descripcion,
        price: form.precio,
        category: form.categoria,
        emoji: form.emoji,
        available: form.disponible,
      };

      if (modal === "nuevo") {
        const res = await api.post<{ ok: boolean; data: Record<string, unknown> }>("/menu", payload);
        const newItem: Articulo = {
          id: res.data.id as string,
          nombre: form.nombre,
          descripcion: form.descripcion,
          precio: form.precio,
          categoria: form.categoria,
          emoji: form.emoji,
          disponible: form.disponible,
        };
        setArticulos((prev) => [...prev, newItem]);
      } else if (editId) {
        await api.patch(`/menu/${editId}`, payload);
        setArticulos((prev) =>
          prev.map((a) => a.id === editId ? { ...a, ...form } : a)
        );
      }
      setModal(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error guardando artículo");
    } finally {
      setSaving(false);
    }
  };

  const disponibles = articulos.filter((a) => a.disponible).length;
  const noDisponibles = articulos.length - disponibles;

  return (
    <div className={styles.page}>
      {/* Encabezado */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gestión de Menú</h1>
          <p className={styles.subtitle}>
            {articulos.length} artículos · {disponibles} disponibles · {noDisponibles} no disponibles
          </p>
        </div>
        <div className={styles.headerActions}>
          <a href="/dashboard/pos" className={styles.btnOutline}>← Volver a mesas</a>
          <button className={styles.btnPrimary} onClick={abrirNuevo}>
            <Plus size={16} /> Agregar artículo
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        <div className={styles.cats}>
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              className={`${styles.catBtn} ${categoriaActiva === c ? styles.catBtnActive : ""}`}
              onClick={() => setCategoriaActiva(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          className={styles.buscador}
          placeholder="🔍 Buscar artículo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#999" }}>Cargando menú...</div>
        ) : error ? (
          <div style={{ padding: 40, textAlign: "center", color: "#d32f2f" }}>{error}</div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Artículo</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Disponible</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((art) => (
                  <tr key={art.id}>
                    <td>
                      <div className={styles.articuloCell}>
                        <span className={styles.articuloEmoji}>{art.emoji}</span>
                        <div>
                          <div className={styles.articuloNombre}>{art.nombre}</div>
                          <div className={styles.articuloDesc}>{art.descripcion}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.catBadge}>{art.categoria}</span>
                    </td>
                    <td className={styles.tdPrecio}>{formatCOP(art.precio)}</td>
                    <td>
                      <button
                        className={`${styles.toggleBtn} ${art.disponible ? styles.toggleOn : styles.toggleOff}`}
                        onClick={() => toggleDisponible(art.id)}
                      >
                        {art.disponible ? "✓ Disponible" : "✗ No disponible"}
                      </button>
                    </td>
                    <td>
                      <div className={styles.acciones}>
                        <button className={styles.btnEditar} onClick={() => abrirEditar(art)}>
                          <Pencil size={14} />
                        </button>
                        <button className={styles.btnEliminar} onClick={() => eliminar(art.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtrados.length === 0 && (
              <div className={styles.vacio}>No se encontraron artículos.</div>
            )}
          </>
        )}
      </div>

      {/* Modal agregar/editar */}
      {modal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{modal === "nuevo" ? "Agregar artículo" : "Editar artículo"}</h3>
              <button className={styles.closeBtn} onClick={() => setModal(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Emoji selector */}
              <div className={styles.emojiRow}>
                <span className={styles.emojiActual}>{form.emoji}</span>
                <div className={styles.emojiGrid}>
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      className={`${styles.emojiBtn} ${form.emoji === e ? styles.emojiBtnActive : ""}`}
                      onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Nombre del artículo *</label>
                <input
                  className={`${styles.input} ${errores.nombre ? styles.inputError : ""}`}
                  value={form.nombre}
                  onChange={(e) => { setForm((f) => ({ ...f, nombre: e.target.value })); setErrores((p) => ({ ...p, nombre: "" })); }}
                  placeholder="Ej: Filete de res"
                />
                {errores.nombre && <span className={styles.fieldError}>{errores.nombre}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Descripción</label>
                <input
                  className={styles.input}
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Descripción breve del artículo"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Precio (COP) *</label>
                  <input
                    className={`${styles.input} ${errores.precio ? styles.inputError : ""}`}
                    type="number"
                    value={form.precio || ""}
                    onChange={(e) => { setForm((f) => ({ ...f, precio: Number(e.target.value) })); setErrores((p) => ({ ...p, precio: "" })); }}
                    placeholder="0"
                  />
                  {errores.precio && <span className={styles.fieldError}>{errores.precio}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Categoría</label>
                  <select
                    className={styles.input}
                    value={form.categoria}
                    onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                  >
                    {CATEGORIAS.filter((c) => c !== "Todas").map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className={styles.toggleField}>
                <input
                  type="checkbox"
                  checked={form.disponible}
                  onChange={(e) => setForm((f) => ({ ...f, disponible: e.target.checked }))}
                />
                <span>Disponible para venta</span>
              </label>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={() => setModal(null)}>Cancelar</button>
              <button className={styles.btnGuardar} onClick={guardar} disabled={saving}>
                {saving ? "Guardando..." : modal === "nuevo" ? "Agregar artículo" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
