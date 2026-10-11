interface DisplayProps {
  expression: string;
  result: string;
  isError: boolean;
  memoryActive: boolean;
  styles: Record<string, string>;
}

export function Display({
  expression,
  result,
  isError,
  memoryActive,
  styles,
}: DisplayProps) {
  return (
    <div className={styles.display} role="region" aria-label="Calculator display">
      <div className={styles.expression} aria-live="polite">
        {expression || "\u00A0"}
      </div>
      <div
        className={
          isError ? `${styles.result} ${styles.resultError}` : styles.result
        }
        aria-live="polite"
        aria-atomic="true"
      >
        {result}
      </div>
      {memoryActive && (
        <span className={styles.memoryBadge} aria-label="Memory has a value">
          M
        </span>
      )}
    </div>
  );
}