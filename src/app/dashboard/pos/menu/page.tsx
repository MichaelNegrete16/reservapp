"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import styles from "./Menu.module.css";

/* ─── Tipos ─── */
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

const ARTICULOS_INICIALES: Articulo[] = [
  { id: "e1", nombre: "Tabla de quesos",       descripcion: "Selección de quesos artesanales con mermeladas",    precio: 28000, categoria: "Entradas",          emoji: "🧀", disponible: true  },
  { id: "e2", nombre: "Ceviche de camarón",    descripcion: "Camarón tigre, limón, cilantro y ají",             precio: 32000, categoria: "Entradas",          emoji: "🍤", disponible: true  },
  { id: "e3", nombre: "Bruschetta",             descripcion: "Pan tostado, tomate, albahaca y mozzarella",       precio: 18000, categoria: "Entradas",          emoji: "🍞", disponible: true  },
  { id: "e4", nombre: "Sopa del día",           descripcion: "Consultar disponibilidad con el mesero",           precio: 15000, categoria: "Entradas",          emoji: "🥣", disponible: false },
  { id: "p1", nombre: "Filete de res",          descripcion: "Término a elección, papas y ensalada",             precio: 68000, categoria: "Platos principales", emoji: "🥩", disponible: true  },
  { id: "p2", nombre: "Pasta carbonara",        descripcion: "Espagueti, panceta, huevo y parmesano",            precio: 42000, categoria: "Platos principales", emoji: "🍝", disponible: true  },
  { id: "p3", nombre: "Pollo a la plancha",     descripcion: "Pechuga, verduras salteadas y arroz integral",     precio: 38000, categoria: "Platos principales", emoji: "🍗", disponible: true  },
  { id: "p4", nombre: "Salmón al limón",        descripcion: "Salmón fresco, salsa de alcaparras y puré",        precio: 58000, categoria: "Platos principales", emoji: "🐟", disponible: true  },
  { id: "p5", nombre: "Risotto de hongos",      descripcion: "Arroz arbóreo, hongos silvestres y trufa",         precio: 48000, categoria: "Platos principales", emoji: "🍄", disponible: false },
  { id: "b1", nombre: "Limonada de coco",       descripcion: "Limonada natural con coco fresco",                 precio: 12000, categoria: "Bebidas",           emoji: "🥤", disponible: true  },
  { id: "b2", nombre: "Jugo natural",            descripcion: "Naranja, mango, mora o maracuyá",                 precio: 10000, categoria: "Bebidas",           emoji: "🧃", disponible: true  },
  { id: "b3", nombre: "Agua mineral",            descripcion: "Con o sin gas 600ml",                             precio: 6000,  categoria: "Bebidas",           emoji: "💧", disponible: true  },
  { id: "b4", nombre: "Cerveza artesanal",       descripcion: "Rubia, roja o negra 330ml",                       precio: 16000, categoria: "Bebidas",           emoji: "🍺", disponible: true  },
  { id: "b5", nombre: "Vino copa",               descripcion: "Tinto o blanco, selección del sommelier",         precio: 22000, categoria: "Bebidas",           emoji: "🍷", disponible: true  },
  { id: "b6", nombre: "Café espresso",           descripcion: "Grano origen Colombia, doble extracción",         precio: 8000,  categoria: "Bebidas",           emoji: "☕", disponible: true  },
  { id: "d1", nombre: "Tiramisú",                descripcion: "Clásico italiano con café y mascarpone",          precio: 18000, categoria: "Postres",           emoji: "🍰", disponible: true  },
  { id: "d2", nombre: "Brownie caliente",        descripcion: "Con helado de vainilla y salsa de caramelo",      precio: 16000, categoria: "Postres",           emoji: "🍫", disponible: true  },
  { id: "d3", nombre: "Cheesecake de frutos",    descripcion: "Base de galleta, crema y coulis de frutos rojos", precio: 20000, categoria: "Postres",           emoji: "🍓", disponible: true  },
  { id: "s1", nombre: "Bandeja paisa",           descripcion: "Plato típico completo: carne, frijoles y más",   precio: 45000, categoria: "Especiales",        emoji: "🍲", disponible: true  },
  { id: "s2", nombre: "Menú ejecutivo",          descripcion: "Entrada + plato + bebida + postre",              precio: 52000, categoria: "Especiales",        emoji: "⭐", disponible: true  },
];

const EMOJIS = ["🍕","🍔","🥩","🍝","🍗","🐟","🥗","🍜","🍣","🥘","🍤","🧀","🍞","🥣","🍄","🥤","🧃","💧","🍺","🍷","☕","🍰","🍫","🍓","🍲","⭐"];

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

const VACIO: Omit<Articulo, "id"> = {
  nombre: "", descripcion: "", precio: 0, categoria: "Entradas", emoji: "🍽️", disponible: true,
};

export default function GestorMenuPage() {
  const [articulos, setArticulos] = useState<Articulo[]>(ARTICULOS_INICIALES);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState<"nuevo" | "editar" | null>(null);
  const [form, setForm] = useState<Omit<Articulo, "id">>(VACIO);
  const [editId, setEditId] = useState<string | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const filtrados = articulos.filter((a) => {
    const matchCat = categoriaActiva === "Todas" || a.categoria === categoriaActiva;
    const matchBus = !busqueda || a.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBus;
  });

  const toggleDisponible = (id: string) => {
    setArticulos((prev) =>
      prev.map((a) => a.id === id ? { ...a, disponible: !a.disponible } : a)
    );
  };

  const eliminar = (id: string) => {
    if (confirm("¿Eliminar este artículo?")) {
      setArticulos((prev) => prev.filter((a) => a.id !== id));
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

  const guardar = () => {
    if (!validar()) return;
    if (modal === "nuevo") {
      const nuevoId = `custom-${Date.now()}`;
      setArticulos((prev) => [...prev, { id: nuevoId, ...form }]);
    } else if (editId) {
      setArticulos((prev) =>
        prev.map((a) => a.id === editId ? { ...a, ...form } : a)
      );
    }
    setModal(null);
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
              <button className={styles.btnGuardar} onClick={guardar}>
                {modal === "nuevo" ? "Agregar artículo" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
