"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import styles from "./Orden.module.css";

/* ─── Tipos ─── */
interface Articulo {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  emoji: string;
}

interface ItemPedido {
  articulo: Articulo;
  cantidad: number;
  notas: string;
}

/* ─── Datos mock ─── */
const CATEGORIAS = ["Entradas", "Platos principales", "Bebidas", "Postres", "Especiales"];

const ARTICULOS: Articulo[] = [
  // Entradas
  { id: "e1", nombre: "Tabla de quesos",      descripcion: "Selección de quesos artesanales con mermeladas",    precio: 28000, categoria: "Entradas",         emoji: "🧀" },
  { id: "e2", nombre: "Ceviche de camarón",   descripcion: "Camarón tigre, limón, cilantro y ají",             precio: 32000, categoria: "Entradas",         emoji: "🍤" },
  { id: "e3", nombre: "Bruschetta",            descripcion: "Pan tostado, tomate, albahaca y mozzarella",       precio: 18000, categoria: "Entradas",         emoji: "🍞" },
  { id: "e4", nombre: "Sopa del día",          descripcion: "Consultar disponibilidad con el mesero",           precio: 15000, categoria: "Entradas",         emoji: "🥣" },
  // Platos principales
  { id: "p1", nombre: "Filete de res",         descripcion: "Término a elección, papas y ensalada",             precio: 68000, categoria: "Platos principales",emoji: "🥩" },
  { id: "p2", nombre: "Pasta carbonara",       descripcion: "Espagueti, panceta, huevo y parmesano",            precio: 42000, categoria: "Platos principales",emoji: "🍝" },
  { id: "p3", nombre: "Pollo a la plancha",    descripcion: "Pechuga, verduras salteadas y arroz integral",     precio: 38000, categoria: "Platos principales",emoji: "🍗" },
  { id: "p4", nombre: "Salmón al limón",       descripcion: "Salmón fresco, salsa de alcaparras y puré",        precio: 58000, categoria: "Platos principales",emoji: "🐟" },
  { id: "p5", nombre: "Risotto de hongos",     descripcion: "Arroz arbóreo, hongos silvestres y trufa",         precio: 48000, categoria: "Platos principales",emoji: "🍄" },
  // Bebidas
  { id: "b1", nombre: "Limonada de coco",      descripcion: "Limonada natural con coco fresco",                 precio: 12000, categoria: "Bebidas",          emoji: "🥤" },
  { id: "b2", nombre: "Jugo natural",           descripcion: "Naranja, mango, mora o maracuyá",                 precio: 10000, categoria: "Bebidas",          emoji: "🧃" },
  { id: "b3", nombre: "Agua mineral",           descripcion: "Con o sin gas 600ml",                             precio: 6000,  categoria: "Bebidas",          emoji: "💧" },
  { id: "b4", nombre: "Cerveza artesanal",      descripcion: "Rubia, roja o negra 330ml",                       precio: 16000, categoria: "Bebidas",          emoji: "🍺" },
  { id: "b5", nombre: "Vino copa",              descripcion: "Tinto o blanco, selección del sommelier",         precio: 22000, categoria: "Bebidas",          emoji: "🍷" },
  { id: "b6", nombre: "Café espresso",          descripcion: "Grano origen Colombia, doble extracción",         precio: 8000,  categoria: "Bebidas",          emoji: "☕" },
  // Postres
  { id: "d1", nombre: "Tiramisú",               descripcion: "Clásico italiano con café y mascarpone",          precio: 18000, categoria: "Postres",          emoji: "🍰" },
  { id: "d2", nombre: "Brownie caliente",       descripcion: "Con helado de vainilla y salsa de caramelo",      precio: 16000, categoria: "Postres",          emoji: "🍫" },
  { id: "d3", nombre: "Cheesecake de frutos",   descripcion: "Base de galleta, crema y coulis de frutos rojos", precio: 20000, categoria: "Postres",          emoji: "🍓" },
  // Especiales
  { id: "s1", nombre: "Bandeja paisa",          descripcion: "Plato típico completo: carne, frijoles y más",   precio: 45000, categoria: "Especiales",       emoji: "🍲" },
  { id: "s2", nombre: "Menú ejecutivo",         descripcion: "Entrada + plato + bebida + postre",              precio: 52000, categoria: "Especiales",       emoji: "⭐" },
];

const MESAS_INFO: Record<string, { numero: number; zona: string; personas: number }> = {
  "1":  { numero: 1,  zona: "Salón",   personas: 3 },
  "2":  { numero: 2,  zona: "Salón",   personas: 0 },
  "3":  { numero: 3,  zona: "Salón",   personas: 4 },
  "4":  { numero: 4,  zona: "Salón",   personas: 5 },
  "5":  { numero: 5,  zona: "Salón",   personas: 0 },
  "6":  { numero: 6,  zona: "Salón",   personas: 0 },
  "7":  { numero: 7,  zona: "Terraza", personas: 2 },
  "8":  { numero: 8,  zona: "Terraza", personas: 0 },
  "9":  { numero: 9,  zona: "Terraza", personas: 4 },
  "10": { numero: 10, zona: "Terraza", personas: 0 },
  "11": { numero: 11, zona: "Barra",   personas: 1 },
  "12": { numero: 12, zona: "Barra",   personas: 3 },
};

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

export default function TomarOrdenPage() {
  const params = useParams();
  const mesaId = params?.id as string ?? "1";
  const mesaInfo = MESAS_INFO[mesaId] ?? { numero: Number(mesaId), zona: "Salón", personas: 0 };

  const [categoriaActiva, setCategoriaActiva] = useState("Entradas");
  const [pedido, setPedido] = useState<ItemPedido[]>([]);
  const [notaAbierta, setNotaAbierta] = useState<string | null>(null);

  const articulosFiltrados = ARTICULOS.filter((a) => a.categoria === categoriaActiva);

  const agregarAlPedido = (articulo: Articulo) => {
    setPedido((prev) => {
      const existe = prev.find((i) => i.articulo.id === articulo.id);
      if (existe) {
        return prev.map((i) =>
          i.articulo.id === articulo.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { articulo, cantidad: 1, notas: "" }];
    });
  };

  const cambiarCantidad = (id: string, delta: number) => {
    setPedido((prev) =>
      prev
        .map((i) => i.articulo.id === id ? { ...i, cantidad: i.cantidad + delta } : i)
        .filter((i) => i.cantidad > 0)
    );
  };

  const actualizarNota = (id: string, nota: string) => {
    setPedido((prev) =>
      prev.map((i) => i.articulo.id === id ? { ...i, notas: nota } : i)
    );
  };

  const subtotal = pedido.reduce((s, i) => s + i.articulo.precio * i.cantidad, 0);
  const totalItems = pedido.reduce((s, i) => s + i.cantidad, 0);

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
        {/* ── MENÚ (izquierda) ── */}
        <div className={styles.menuPanel}>
          <div className={styles.categorias}>
            {CATEGORIAS.map((cat) => (
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

        {/* ── PEDIDO (derecha) ── */}
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
                disabled={pedido.length === 0}
                onClick={() => alert("✅ Comanda enviada a cocina")}
              >
                🍳 Enviar a cocina
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
    </div>
  );
}
