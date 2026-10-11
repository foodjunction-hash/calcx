import { useEffect, useState } from "react";
import {
  deleteHistoryEntry,
  clearHistory,
  formatTimestamp,
} from "../storage/history";
import type { HistoryEntry } from "../storage/history";
import styles from "./History.module.css";

interface HistoryProps {
  entries: HistoryEntry[];
  onClose: () => void;
  onEntriesChange: (entries: HistoryEntry[]) => void;
  onReuse: (entry: HistoryEntry) => void;
  theme: "dark" | "light";
}

export function History({
  entries,
  onClose,
  onEntriesChange,
  onReuse,
  theme,
}: HistoryProps) {
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmingClear) {
          setConfirmingClear(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, confirmingClear]);

  // Auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteHistoryEntry(id);
    onEntriesChange(updated);
  };

  const handleCopy = async (
    text: string,
    label: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setToast(`${label} copied`);
    } catch {
      setToast("Copy failed");
    }
  };

  const handleClearConfirm = () => {
    clearHistory();
    onEntriesChange([]);
    setConfirmingClear(false);
    setToast("History cleared");
  };

  return (
    <div className={styles.overlay} data-theme={theme} role="dialog" aria-modal="true" aria-label="Calculation history">
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>History</h2>
        <div className={styles.headerActions}>
          {entries.length > 0 && (
            <button
              type="button"
              className={`${styles.iconBtn} ${styles.danger}`}
              onClick={() => setConfirmingClear(true)}
              aria-label="Clear all history"
              title="Clear all"
            >
              🗑
            </button>
          )}
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onClose}
            aria-label="Close history"
          >
            ✕
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🕐</div>
          <h3 className={styles.emptyTitle}>No history yet</h3>
          <p className={styles.emptyHint}>
            Your calculations will appear here.
            <br />
            Press <strong>=</strong> to save one.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={styles.entry}
              onClick={() => onReuse(entry)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onReuse(entry);
                }
              }}
              aria-label={`Reuse calculation: ${entry.expression} = ${entry.result}`}
            >
              <div className={styles.entryTop}>
                <span className={styles.expression}>{entry.expression}</span>
                <span className={styles.result}>= {entry.result}</span>
              </div>
              <div className={styles.entryBottom}>
                <span className={styles.timestamp}>
                  {formatTimestamp(entry.timestamp)}
                </span>
                <div className={styles.entryActions}>
                  <button
                    type="button"
                    className={styles.miniBtn}
                    onClick={(e) =>
                      handleCopy(entry.expression, "Expression", e)
                    }
                    aria-label="Copy expression"
                    title="Copy expression"
                  >
                    ⧉
                  </button>
                  <button
                    type="button"
                    className={styles.miniBtn}
                    onClick={(e) => handleCopy(entry.result, "Result", e)}
                    aria-label="Copy result"
                    title="Copy result"
                  >
                    #
                  </button>
                  <button
                    type="button"
                    className={`${styles.miniBtn} ${styles.danger}`}
                    onClick={(e) => handleDelete(entry.id, e)}
                    aria-label="Delete entry"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmingClear && (
        <div className={styles.confirmBar}>
          <span className={styles.confirmText}>
            Delete all {entries.length} entries?
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
            onClick={handleClearConfirm}
          >
            Delete all
          </button>
        </div>
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}