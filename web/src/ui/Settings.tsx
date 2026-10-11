import { useEffect, useState } from "react";
import { clearAllData } from "../storage/settings";
import type { Settings as SettingsType } from "../storage/settings";
import styles from "./Settings.module.css";

interface SettingsProps {
  settings: SettingsType;
  onChange: (s: SettingsType) => void;
  onClose: () => void;
  onDataCleared: () => void;
  onOpenPrivacy: () => void;
  theme: "dark" | "light";
}

export function Settings({
  settings,
  onChange,
  onClose,
  onDataCleared,
  onOpenPrivacy,
  theme,
}: SettingsProps) {
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmingClear) setConfirmingClear(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, confirmingClear]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1500);
    return () => clearTimeout(t);
  }, [toast]);

  const update = <K extends keyof SettingsType>(
    key: K,
    value: SettingsType[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const handleClearAll = () => {
    clearAllData();
    onDataCleared();
    setConfirmingClear(false);
    setToast("All data cleared");
    setTimeout(() => onClose(), 800);
  };

  return (
    <div
      className={styles.overlay}
      data-theme={theme}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>Settings</h2>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onClose}
          aria-label="Close settings"
        >
          ✕
        </button>
      </div>

      <div className={styles.body}>
        {/* ---------- Appearance ---------- */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Appearance</h3>

          <div className={styles.row}>
            <div className={styles.rowLabel}>
              <span className={styles.rowTitle}>Theme</span>
              <span className={styles.rowHint}>Choose your look</span>
            </div>
            <div className={styles.segmented} role="group" aria-label="Theme">
              {(["system", "light", "dark"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={
                    settings.theme === t
                      ? `${styles.segment} ${styles.active}`
                      : styles.segment
                  }
                  onClick={() => update("theme", t)}
                  aria-pressed={settings.theme === t}
                >
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.rowLabel}>
              <span className={styles.rowTitle}>Default mode</span>
              <span className={styles.rowHint}>When app opens</span>
            </div>
            <div className={styles.segmented}>
              {(["standard", "scientific"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={
                    settings.defaultMode === m
                      ? `${styles.segment} ${styles.active}`
                      : styles.segment
                  }
                  onClick={() => update("defaultMode", m)}
                  aria-pressed={settings.defaultMode === m}
                >
                  {m === "standard" ? "Standard" : "Scientific"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ---------- Calculation ---------- */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Calculation</h3>

          <div className={styles.row}>
            <div className={styles.rowLabel}>
              <span className={styles.rowTitle}>Decimal precision</span>
              <span className={styles.rowHint}>
                Significant digits shown
              </span>
            </div>
            <select
              className={styles.select}
              value={settings.precision}
              onChange={(e) => update("precision", Number(e.target.value))}
              aria-label="Decimal precision"
            >
              {[6, 8, 10, 12, 15].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.row}>
            <div className={styles.rowLabel}>
              <span className={styles.rowTitle}>Angle mode</span>
              <span className={styles.rowHint}>For sin, cos, tan</span>
            </div>
            <div className={styles.segmented}>
              {(["DEG", "RAD"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={
                    settings.angleMode === m
                      ? `${styles.segment} ${styles.active}`
                      : styles.segment
                  }
                  onClick={() => update("angleMode", m)}
                  aria-pressed={settings.angleMode === m}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.rowLabel}>
              <span className={styles.rowTitle}>Thousands separator</span>
              <span className={styles.rowHint}>1,234,567 vs 1234567</span>
            </div>
            <button
              type="button"
              className={
                settings.thousandsSeparator
                  ? `${styles.toggle} ${styles.on}`
                  : styles.toggle
              }
              onClick={() =>
                update("thousandsSeparator", !settings.thousandsSeparator)
              }
              aria-pressed={settings.thousandsSeparator}
              aria-label="Thousands separator"
            />
          </div>
        </div>

        {/* ---------- Feedback ---------- */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Feedback</h3>

          <div className={styles.row}>
            <div className={styles.rowLabel}>
              <span className={styles.rowTitle}>Sound</span>
              <span className={styles.rowHint}>Click sound on tap</span>
            </div>
            <button
              type="button"
              className={
                settings.soundFeedback
                  ? `${styles.toggle} ${styles.on}`
                  : styles.toggle
              }
              onClick={() =>
                update("soundFeedback", !settings.soundFeedback)
              }
              aria-pressed={settings.soundFeedback}
              aria-label="Sound feedback"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.rowLabel}>
              <span className={styles.rowTitle}>Haptic feedback</span>
              <span className={styles.rowHint}>Vibration on tap (mobile)</span>
            </div>
            <button
              type="button"
              className={
                settings.hapticFeedback
                  ? `${styles.toggle} ${styles.on}`
                  : styles.toggle
              }
              onClick={() =>
                update("hapticFeedback", !settings.hapticFeedback)
              }
              aria-pressed={settings.hapticFeedback}
              aria-label="Haptic feedback"
            />
          </div>
        </div>

        {/* ---------- Data ---------- */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Data</h3>
          <button
            type="button"
            className={styles.dangerBtn}
            onClick={() => setConfirmingClear(true)}
          >
            Clear all data
          </button>
        </div>

        {/* ---------- About ---------- */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>About</h3>
          <div className={styles.about}>
            <div className={styles.aboutLogo}>CALCX</div>
            <div>Version 1.0.1</div>
            <div style={{ marginTop: 8 }}>
              An iPhone-inspired calculator.
            </div>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              All data stays on your device.
              <br />
              No account, no tracking, no ads.
            </div>
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                className={styles.aboutLink}
                onClick={onOpenPrivacy}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  font: "inherit",
                  padding: 0,
                }}
              >
                Privacy Policy
              </button>
            </div>
            <div style={{ marginTop: 8 }}>
              <a
                className={styles.aboutLink}
                href="https://github.com/foodjunction-hash/calcx"
                target="_blank"
                rel="noopener noreferrer"
              >
                Source & Licenses
              </a>
            </div>
            <div style={{ marginTop: 16, fontSize: 12, opacity: 0.7 }}>
              Devloped by <strong>Shubham CalcX </strong>
              <br />
              © 2026 CalcX
            </div>
          </div>
        </div>
      </div>

      {confirmingClear && (
        <div className={styles.confirmBar}>
          <span className={styles.confirmText}>
            Delete all history, memory and settings?
          </span>
          <button
            type="button"
            className={`${styles.confirmBtn} ${styles.cancel}`}
            onClick={() => setConfirmingClear(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`${styles.confirmBtn} ${styles.danger}`}
            onClick={handleClearAll}
          >
            Delete
          </button>
        </div>
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
