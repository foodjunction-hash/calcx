import { useState } from "react";
import styles from "./UpdatePrompt.module.css";

interface UpdatePromptProps {
  onUpdate: () => void;
  onDismiss: () => void;
  theme: "dark" | "light";
}

export function UpdatePrompt({
  onUpdate,
  onDismiss,
  theme,
}: UpdatePromptProps) {
  const [updating, setUpdating] = useState(false);

  const handleUpdate = () => {
    setUpdating(true);
    onUpdate();
  };

  return (
    <div
      className={styles.overlay}
      data-theme={theme}
      role="dialog"
      aria-modal="true"
      aria-label="Update available"
    >
      <div className={styles.card}>
        <span className={styles.icon} aria-hidden="true">🚀</span>
        <h2 className={styles.title}>Update Available</h2>
        <p className={styles.message}>
          A new version of CALCX is ready with improvements and bug fixes.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onDismiss}
            disabled={updating}
          >
            Later
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleUpdate}
            disabled={updating}
          >
            {updating ? "Updating..." : "Update Now"}
          </button>
        </div>
      </div>
    </div>
  );
}