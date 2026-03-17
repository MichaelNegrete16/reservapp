"use client";

import styles from "./Toggle.module.css";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export default function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className={styles.toggle}>
      <div
        className={`${styles.track} ${checked ? styles.trackActive : ""}`}
        onClick={() => onChange(!checked)}
      >
        <div className={styles.thumb} />
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
