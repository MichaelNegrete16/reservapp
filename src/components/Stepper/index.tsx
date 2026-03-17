"use client";

import styles from "./Stepper.module.css";

interface Step {
  num: number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  current: number;
}

export default function Stepper({ steps, current }: StepperProps) {
  return (
    <div className={styles.stepper}>
      {steps.map(({ num, label }, i) => (
        <div key={num} className={styles.stepWrapper}>
          <div
            className={`${styles.stepCircle} ${
              current >= num ? styles.stepActive : ""
            }`}
          >
            {num}
          </div>
          <span
            className={`${styles.stepLabel} ${
              current >= num ? styles.stepLabelActive : ""
            }`}
          >
            {label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={`${styles.stepLine} ${
                current > num ? styles.stepLineActive : ""
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
