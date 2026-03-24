"use client";

import { X, Crown, AlertTriangle } from "lucide-react";
import styles from "./PlanLimitModal.module.css";

interface Props {
  message: string;
  onClose: () => void;
  onUpgrade?: () => void;
}

export default function PlanLimitModal({ message, onClose, onUpgrade }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>

        <div className={styles.iconWrap}>
          <AlertTriangle size={36} />
        </div>

        <h2 className={styles.title}>Límite de plan alcanzado</h2>
        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button className={styles.btnUpgrade} onClick={onUpgrade ?? onClose}>
            <Crown size={16} /> Actualizar plan
          </button>
          <button className={styles.btnClose} onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
