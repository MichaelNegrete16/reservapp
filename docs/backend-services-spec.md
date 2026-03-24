# Backend Services Specification — ReservApp

> Documento para el equipo de backend. NestJS + Arquitectura Hexagonal.
> Generado el 2026-03-23.

---

## Arquitectura Hexagonal Propuesta

```
src/
  modules/
    auth/
      domain/           # Entities, Value Objects, Ports (interfaces)
      application/      # Use Cases / Services
      infrastructure/   # Controllers, Repositories (TypeORM/Prisma), Guards
    restaurants/
    reservations/
    tables/
    zones/
    schedules/
    clients/
    pos/
    menu/
    invoicing/
    reports/
    admin/
    notifications/
  shared/
    domain/             # Base entities, shared VOs
    infrastructure/     # Database config, middleware, pipes, interceptors
```

---

## 1. AUTH MODULE

### 1.1 Registro de Restaurante (signup)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registro de cuenta + restaurante |
| POST | `/auth/login` | Login con email/password |
| POST | `/auth/logout` | Cerrar sesión (invalidar token) |
| POST | `/auth/refresh` | Refresh token |
| GET | `/auth/me` | Datos del usuario autenticado |
| POST | `/auth/forgot-password` | Enviar email de recuperación |
| POST | `/auth/reset-password` | Restablecer contraseña con token |

**Register payload:**
```json
{
  "step1_account": {
    "name": "string",
    "email": "string",
    "password": "string"
  },
  "step2_restaurant": {
    "name": "string",
    "address": "string",
    "logo": "file (optional)"
  },
  "step3_config": {
    "zones": ["Terraza", "Salón Principal", "Barra"],
    "shifts": {
      "almuerzo": true,
      "cena": true,
      "brunch": false
    }
  }
}
```

**Login response:**
```json
{
  "accessToken": "JWT",
  "refreshToken": "JWT",
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "admin | staff | superadmin",
    "restaurantId": "uuid",
    "restaurant": {
      "id": "uuid",
      "name": "string",
      "slug": "string",
      "plan": "free | pro | platinum"
    }
  }
}
```

**Roles:**
- `superadmin` — Admin de la plataforma (ve todos los restaurantes)
- `admin` — Dueño/administrador del restaurante
- `staff` — Personal del restaurante (meseros, host, etc.)

---

## 2. RESTAURANTS MODULE

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/restaurants/me` | Datos del restaurante del usuario |
| PATCH | `/restaurants/me` | Actualizar datos del restaurante |
| PATCH | `/restaurants/me/logo` | Subir/actualizar logo (multipart) |
| GET | `/restaurants/me/config` | Obtener configuración general |
| PATCH | `/restaurants/me/config` | Actualizar configuración |
| GET | `/restaurants/me/appearance` | Configuración de apariencia (widget) |
| PATCH | `/restaurants/me/appearance` | Actualizar apariencia |

**Config fields:**
```json
{
  "name": "string",
  "phone": "string",
  "address": "string",
  "instagram": "string",
  "website": "string",
  "logoUrl": "string",
  "appearance": {
    "primaryColor": "#e65100",
    "bgStyle": "white | gray | dark",
    "borderRadius": "sm | md | lg",
    "fontFamily": "Public Sans | Playfair Display"
  },
  "notifications": {
    "confirmacion": true,
    "recordatorio": true,
    "cancelacion": true,
    "lista_espera": true,
    "no_asistio": false
  },
  "emailTemplate": {
    "subject": "string (con variables {{restaurant_name}}, etc.)",
    "body": "string (HTML con variables)"
  }
}
```

---

## 3. TEAM MODULE (dentro de restaurants)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/restaurants/me/team` | Listar miembros del equipo |
| POST | `/restaurants/me/team/invite` | Invitar miembro (envía email) |
| PATCH | `/restaurants/me/team/:userId` | Cambiar rol de miembro |
| DELETE | `/restaurants/me/team/:userId` | Eliminar miembro |

**Invite payload:**
```json
{
  "email": "string",
  "role": "admin | staff",
  "name": "string"
}
```

---

## 4. ZONES MODULE

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/zones` | Listar zonas del restaurante |
| POST | `/zones` | Crear zona |
| PATCH | `/zones/:id` | Actualizar zona |
| DELETE | `/zones/:id` | Eliminar zona |
| PATCH | `/zones/:id/toggle` | Activar/desactivar zona |

**Zone entity:**
```json
{
  "id": "uuid",
  "restaurantId": "uuid",
  "name": "string",
  "description": "string",
  "type": "interior | exterior | eventos | vip",
  "capacity": "number",
  "floor": "string (Piso 1, Terraza, etc.)",
  "active": "boolean",
  "order": "number",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

---

## 5. TABLES MODULE

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/tables` | Listar mesas del restaurante |
| POST | `/tables` | Crear mesa |
| PATCH | `/tables/:id` | Actualizar mesa (posición, capacidad, etc.) |
| DELETE | `/tables/:id` | Eliminar mesa |
| POST | `/tables/bulk-update` | Actualizar posiciones en lote (drag & drop) |
| POST | `/tables/floor-plan` | Subir imagen del plano (multipart) |

**Table entity:**
```json
{
  "id": "uuid",
  "restaurantId": "uuid",
  "number": "number",
  "shape": "round | square",
  "capacity": "number (2-12)",
  "zoneId": "uuid",
  "x": "number (posición en canvas)",
  "y": "number",
  "active": "boolean",
  "createdAt": "datetime"
}
```

---

## 6. SCHEDULES MODULE

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/schedules` | Obtener configuración completa de horarios |
| PATCH | `/schedules` | Actualizar configuración completa |
| GET | `/schedules/shifts` | Listar turnos (bloques de reserva) |
| POST | `/schedules/shifts` | Crear turno |
| PATCH | `/schedules/shifts/:id` | Actualizar turno |
| DELETE | `/schedules/shifts/:id` | Eliminar turno |
| GET | `/schedules/holidays` | Listar festivos/cierres |
| POST | `/schedules/holidays` | Agregar festivo |
| DELETE | `/schedules/holidays/:id` | Eliminar festivo |
| GET | `/schedules/availability?date=YYYY-MM-DD` | Disponibilidad para una fecha (usado por widget público) |

**Shift entity:**
```json
{
  "id": "uuid",
  "restaurantId": "uuid",
  "name": "string (Turno almuerzo, Turno cena)",
  "startTime": "HH:mm",
  "endTime": "HH:mm",
  "interval": "number (minutos: 15, 30, 60)",
  "maxReservations": "number (por slot)",
  "active": "boolean"
}
```

**Weekly availability:**
```json
{
  "monday": true,
  "tuesday": true,
  "wednesday": true,
  "thursday": true,
  "friday": true,
  "saturday": true,
  "sunday": false
}
```

**Holiday entity:**
```json
{
  "id": "uuid",
  "restaurantId": "uuid",
  "date": "YYYY-MM-DD",
  "name": "string (Navidad, Año nuevo, etc.)",
  "closed": "boolean"
}
```

---

## 7. RESERVATIONS MODULE

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/reservations/list` | Listar reservas (paginado, filtros) |
| GET | `/reservations/:id` | Obtener reserva por ID |
| POST | `/reservations` | Crear reserva (desde dashboard) |
| PATCH | `/reservations/:id` | Actualizar reserva |
| PATCH | `/reservations/:id/status` | Cambiar estado |
| POST | `/reservations/:id/assign-tables` | Asignar mesas |
| DELETE | `/reservations/:id` | Eliminar reserva |
| GET | `/reservations/kpis?date=YYYY-MM-DD` | KPIs del día (total, confirmadas, pendientes, personas) |
| POST | `/reservations/export` | Exportar a Excel (fecha o rango) |

**Reservation entity:**
```json
{
  "id": "uuid",
  "restaurantId": "uuid",
  "fecha": "YYYY-MM-DD",
  "hora": "HH:mm",
  "nombre": "string",
  "telefono": "string",
  "correo": "string",
  "personas": "number",
  "zoneId": "uuid",
  "zoneName": "string",
  "estado": "pendiente | confirmada | cancelada | sentada | finalizada | no_asistio | lista_espera",
  "mesas": "number[]",
  "motivo": "string? (Cena casual, Cumpleaños, Aniversario, etc.)",
  "notas": "string?",
  "origen": "web | telefono | widget | manual",
  "tipoDocumento": "string?",
  "numeroDocumento": "string?",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

**Status transitions:**
```
pendiente → confirmada → sentada → finalizada
pendiente → cancelada
confirmada → cancelada
confirmada → no_asistio
cualquiera → lista_espera (si no hay disponibilidad)
```

**List filters:**
```json
{
  "fecha": "YYYY-MM-DD (required)",
  "estado": "string? (filtro por estado)",
  "zoneId": "uuid?",
  "search": "string? (busca en nombre, teléfono, correo)",
  "page": "number",
  "limit": "number"
}
```

---

## 8. PUBLIC WIDGET (sin autenticación, por slug)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/public/:slug/info` | Info del restaurante para el widget (nombre, logo, colores) |
| GET | `/public/:slug/availability?date=YYYY-MM-DD&people=N` | Horarios y zonas disponibles |
| POST | `/public/:slug/book` | Crear reserva desde widget público |

**Availability response:**
```json
{
  "date": "2026-03-23",
  "slots": [
    { "time": "19:00", "available": true },
    { "time": "19:30", "available": true },
    { "time": "20:00", "available": false }
  ],
  "zones": [
    { "id": "uuid", "name": "Salón principal", "available": true },
    { "id": "uuid", "name": "Terraza", "available": true }
  ]
}
```

**Book payload:**
```json
{
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "people": "number",
  "zoneId": "uuid",
  "name": "string",
  "phone": "string",
  "email": "string",
  "notes": "string?"
}
```

---

## 9. CLIENTS MODULE

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/clients/list` | Listar clientes (paginado, búsqueda, filtros) |
| GET | `/clients/:id` | Detalle de cliente + historial reservas |
| POST | `/clients` | Crear cliente manual |
| PATCH | `/clients/:id` | Actualizar cliente |
| DELETE | `/clients/:id` | Eliminar cliente |
| PATCH | `/clients/:id/tags` | Actualizar tags (VIP, Frecuente, Lista negra, Leal) |
| PATCH | `/clients/:id/notes` | Actualizar notas del equipo |

**Client entity:**
```json
{
  "id": "uuid",
  "restaurantId": "uuid",
  "name": "string",
  "phone": "string",
  "email": "string?",
  "birthday": "YYYY-MM-DD?",
  "tags": ["VIP", "Frecuente", "Leal", "Lista negra"],
  "notes": "string?",
  "visits": "number (calculado)",
  "lastVisit": "datetime? (calculado)",
  "totalSpent": "number (calculado desde POS)",
  "createdAt": "datetime"
}
```

**List filters:**
```json
{
  "search": "string? (nombre, email, teléfono)",
  "tag": "string? (VIP, Frecuente, etc.)",
  "page": "number",
  "limit": "number"
}
```

---

## 10. MENU MODULE (POS)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/menu` | Listar artículos del menú |
| GET | `/menu/categories` | Listar categorías |
| POST | `/menu` | Crear artículo |
| PATCH | `/menu/:id` | Actualizar artículo |
| DELETE | `/menu/:id` | Eliminar artículo |
| PATCH | `/menu/:id/availability` | Toggle disponibilidad |

**Menu item entity:**
```json
{
  "id": "uuid",
  "restaurantId": "uuid",
  "name": "string",
  "description": "string?",
  "price": "number (COP)",
  "category": "Entradas | Platos principales | Bebidas | Postres | Especiales",
  "emoji": "string (1 char)",
  "available": "boolean",
  "order": "number",
  "createdAt": "datetime"
}
```

---

## 11. POS MODULE (Punto de Venta)

### 11.1 Mesas/Órdenes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pos/tables` | Estado actual de todas las mesas (libre, ocupada, cuenta-pendiente) |
| POST | `/pos/tables/:tableId/open` | Abrir mesa (asignar mesero, personas) |
| GET | `/pos/tables/:tableId/order` | Obtener orden actual de la mesa |
| POST | `/pos/tables/:tableId/order/items` | Agregar items a la orden |
| PATCH | `/pos/tables/:tableId/order/items/:itemId` | Actualizar cantidad/notas de un item |
| DELETE | `/pos/tables/:tableId/order/items/:itemId` | Eliminar item de la orden |
| POST | `/pos/tables/:tableId/send-kitchen` | Enviar pedido a cocina |
| POST | `/pos/tables/:tableId/request-bill` | Solicitar cuenta (cambia estado a cuenta-pendiente) |

**Table POS state:**
```json
{
  "id": "uuid",
  "number": "number",
  "zone": "string",
  "capacity": "number",
  "status": "libre | ocupada | cuenta-pendiente",
  "waiter": "string?",
  "people": "number?",
  "openedAt": "datetime?",
  "total": "number?",
  "items": [
    {
      "id": "uuid",
      "menuItemId": "uuid",
      "name": "string",
      "emoji": "string",
      "price": "number",
      "quantity": "number",
      "notes": "string?",
      "sentToKitchen": "boolean",
      "sentAt": "datetime?"
    }
  ]
}
```

### 11.2 Facturación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pos/tables/:tableId/bill` | Obtener cuenta de la mesa (subtotal, IVA, descuento, total) |
| POST | `/pos/tables/:tableId/pay` | Procesar pago y cerrar mesa |
| GET | `/pos/invoices/:id` | Obtener factura generada |
| POST | `/pos/invoices/:id/print` | Generar PDF de factura |

**Pay payload:**
```json
{
  "paymentMethod": "efectivo | tarjeta | transferencia | mixto",
  "discount": "number (0-20, porcentaje)",
  "cash": "number? (monto recibido en efectivo)",
  "mixtoDetails": {
    "efectivo": "number?",
    "tarjeta": "number?",
    "transferencia": "number?"
  }
}
```

**Bill response:**
```json
{
  "tableId": "uuid",
  "tableNumber": "number",
  "items": [
    { "name": "string", "emoji": "string", "qty": "number", "unitPrice": "number", "total": "number" }
  ],
  "subtotal": "number",
  "discount": "number",
  "discountAmount": "number",
  "iva": "number (19%)",
  "ivaAmount": "number",
  "total": "number"
}
```

### 11.3 Caja (Cierre)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pos/register/current` | Resumen del turno actual (ventas, por método de pago) |
| GET | `/pos/register/transactions` | Historial de transacciones del turno |
| POST | `/pos/register/close` | Cerrar caja (genera reporte) |
| GET | `/pos/register/history` | Historial de cierres anteriores |

**Register summary:**
```json
{
  "totalSales": "number",
  "transactionCount": "number",
  "byPaymentMethod": {
    "efectivo": { "total": "number", "count": "number", "percentage": "number" },
    "tarjeta": { "total": "number", "count": "number", "percentage": "number" },
    "transferencia": { "total": "number", "count": "number", "percentage": "number" }
  },
  "transactions": [
    {
      "id": "uuid",
      "time": "HH:mm",
      "tableNumber": "number",
      "waiter": "string",
      "itemCount": "number",
      "paymentMethod": "string",
      "total": "number"
    }
  ]
}
```

---

## 12. INVOICING MODULE (Facturación Electrónica Colombia)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/invoicing/config` | Obtener configuración de facturación |
| PATCH | `/invoicing/config` | Actualizar configuración |
| POST | `/invoicing/emit` | Emitir factura electrónica |
| GET | `/invoicing/status/:invoiceId` | Consultar estado de factura |

**Config entity (soporta Siigo y MisFacturas):**
```json
{
  "provider": "siigo | misfacturas | none",
  "siigo": {
    "apiKey": "string",
    "username": "string",
    "accountId": "string",
    "testMode": "boolean"
  },
  "misfacturas": {
    "apiKey": "string",
    "nit": "string",
    "resolucion": "string",
    "prefijo": "string",
    "rangoDesde": "number",
    "rangoHasta": "number",
    "testMode": "boolean"
  },
  "company": {
    "nit": "string",
    "razonSocial": "string",
    "tipoContribuyente": "string",
    "regimenFiscal": "string",
    "direccion": "string",
    "ciudad": "string",
    "telefono": "string",
    "email": "string"
  }
}
```

---

## 13. REPORTS MODULE

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/reports/reservations?from=&to=` | Reservas en rango de fechas (para gráfica de barras) |
| GET | `/reports/status-distribution?from=&to=` | Distribución por estado (para donut chart) |
| GET | `/reports/zone-occupancy?from=&to=` | Ocupación por zona (porcentajes) |
| GET | `/reports/heatmap?from=&to=` | Mapa de calor (día × hora) |
| GET | `/reports/no-show-rate?from=&to=` | Tasa de no presentación con tendencia |
| GET | `/reports/top-clients?from=&to=&limit=10` | Top clientes por valor |
| GET | `/reports/pos-summary?from=&to=` | Resumen POS (ventas, métodos de pago) |

---

## 14. NOTIFICATIONS MODULE

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/notifications/send` | Enviar notificación manual |

**Tipos de notificación automática (emitidas por el sistema):**
- `confirmacion` — Al confirmar reserva → email al cliente
- `recordatorio` — X horas antes de la reserva → email al cliente
- `cancelacion` — Al cancelar → email al cliente
- `lista_espera` — Cuando se libera espacio → email al cliente
- `no_asistio` — Al marcar no asistió → email al restaurante

**Canales:** Email (mandatorio), SMS (futuro), WhatsApp (futuro)

---

## 15. ADMIN MODULE (Superadmin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/admin/restaurants/list` | Listar restaurantes (paginado, búsqueda) |
| GET | `/admin/restaurants/:id` | Detalle de restaurante |
| PATCH | `/admin/restaurants/:id/status` | Activar/suspender restaurante |
| DELETE | `/admin/restaurants/:id` | Eliminar restaurante |
| GET | `/admin/kpis` | KPIs globales (total restaurantes, activos, reservas totales) |
| GET | `/admin/registrations?period=weekly` | Registros por semana (para gráfica) |

---

## 16. WEBSOCKET EVENTS

**Namespace:** `/reservations`

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `reservas:subscribe` | Client → Server | Suscribirse a fecha |
| `reservas:unsubscribe` | Client → Server | Desuscribirse |
| `reserva:nueva` | Server → Client | Nueva reserva creada |
| `reserva:estado` | Server → Client | Cambio de estado |
| `reserva:editada` | Server → Client | Reserva editada |

**Namespace:** `/pos`

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `pos:subscribe` | Client → Server | Suscribirse al POS |
| `mesa:actualizada` | Server → Client | Mesa cambió de estado |
| `orden:enviada_cocina` | Server → Client | Pedido enviado a cocina |
| `factura:emitida` | Server → Client | Factura procesada |

---

## Resumen de Endpoints

| Módulo | Endpoints | Prioridad |
|--------|-----------|-----------|
| Auth | 7 | Alta |
| Restaurants + Config | 7 | Alta |
| Team | 4 | Media |
| Zones | 5 | Alta |
| Tables | 6 | Alta |
| Schedules | 9 | Alta |
| Reservations | 9 | Alta |
| Public Widget | 3 | Alta |
| Clients | 7 | Media |
| Menu | 6 | Alta |
| POS Tables/Orders | 8 | Alta |
| POS Billing | 4 | Alta |
| POS Register | 4 | Media |
| Invoicing (Siigo/MisFacturas) | 4 | Media |
| Reports | 7 | Media |
| Notifications | 1 | Baja |
| Admin | 6 | Baja |
| WebSocket | 9 eventos | Alta |
| **TOTAL** | **~106 endpoints** | |

---

## Base de Datos (Entidades principales)

```
users
restaurants
restaurant_configs
team_members
zones
tables
schedules (shifts)
weekly_availability
holidays
reservations
reservation_table (M2M)
clients
client_tags
menu_items
pos_orders
pos_order_items
invoices
invoice_items
register_closings
transactions
notifications_log
```

---

## Variables de Entorno Sugeridas

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/reservapp

# Auth
JWT_SECRET=...
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d

# App
APP_PORT=3001
APP_URL=https://api.reservapp.com
FRONTEND_URL=https://reservapp.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# Facturación
SIIGO_API_URL=https://api.siigo.com/v1
MISFACTURAS_API_URL=https://api.misfacturas.com.co/v1

# Storage (logos, planos)
S3_BUCKET=reservapp-uploads
S3_REGION=us-east-1
AWS_ACCESS_KEY=...
AWS_SECRET_KEY=...

# WebSocket
SOCKET_PORT=3001
```
