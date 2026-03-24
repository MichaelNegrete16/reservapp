"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:3001";

interface UseReservasSocketProps {
  fecha: string;
  onNuevaReserva?: (data: unknown) => void;
  onCambioEstado?: (data: unknown) => void;
  onUpdate?: () => void;
}

export function useReservasSocket({
  fecha,
  onNuevaReserva,
  onCambioEstado,
  onUpdate,
}: UseReservasSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const fechaRef = useRef(fecha);

  const handleNueva = useCallback(
    (data: unknown) => {
      onNuevaReserva?.(data);
      onUpdate?.();
    },
    [onNuevaReserva, onUpdate]
  );

  const handleEstado = useCallback(
    (data: unknown) => {
      onCambioEstado?.(data);
      onUpdate?.();
    },
    [onCambioEstado, onUpdate]
  );

  const handleEditada = useCallback(() => {
    onUpdate?.();
  }, [onUpdate]);

  useEffect(() => {
    const socket = io(`${SOCKET_URL}/reservations`, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("reservas:subscribe", { fecha });
    });

    socket.on("reserva:nueva", handleNueva);
    socket.on("reserva:estado", handleEstado);
    socket.on("reserva:editada", handleEditada);

    return () => {
      socket.emit("reservas:unsubscribe", { fecha });
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-subscribe when fecha changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket?.connected) return;

    if (fechaRef.current !== fecha) {
      socket.emit("reservas:unsubscribe", { fecha: fechaRef.current });
      socket.emit("reservas:subscribe", { fecha });
      fechaRef.current = fecha;
    }
  }, [fecha]);
}
