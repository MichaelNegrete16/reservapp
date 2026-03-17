"use client";

interface CustomDatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}

export default function CustomDatePicker({
  label,
  value,
  onChange,
  min,
  max,
}: CustomDatePickerProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && (
        <label
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#555",
          }}
        >
          {label}
        </label>
      )}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        style={{
          padding: "8px 12px",
          border: "1px solid #ddd",
          borderRadius: 8,
          fontSize: 14,
          fontFamily: "inherit",
          outline: "none",
          background: "#fff",
        }}
      />
    </div>
  );
}
