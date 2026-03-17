import styles from "./Badge.module.css";

interface BadgeProps {
  label: string;
  color?: string;
  bg?: string;
}

export default function Badge({ label, color = "#333", bg = "#f0f0f0" }: BadgeProps) {
  return (
    <span className={styles.badge} style={{ color, background: bg }}>
      {label}
    </span>
  );
}
