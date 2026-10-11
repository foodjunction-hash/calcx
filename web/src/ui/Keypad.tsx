export type KeyDef = {
  label: string;
  aria: string;
  kind: "num" | "fn" | "op";
  action: string;
  span?: 2;
  active?: boolean;
};

export const STANDARD_KEYS: KeyDef[] = [
  { label: "AC", aria: "Clear all", kind: "fn", action: "clear" },
  { label: "+/−", aria: "Toggle sign", kind: "fn", action: "sign" },
  { label: "%", aria: "Percent", kind: "fn", action: "percent" },
  { label: "÷", aria: "Divide", kind: "op", action: "op:/" },

  { label: "7", aria: "7", kind: "num", action: "digit:7" },
  { label: "8", aria: "8", kind: "num", action: "digit:8" },
  { label: "9", aria: "9", kind: "num", action: "digit:9" },
  { label: "×", aria: "Multiply", kind: "op", action: "op:*" },

  { label: "4", aria: "4", kind: "num", action: "digit:4" },
  { label: "5", aria: "5", kind: "num", action: "digit:5" },
  { label: "6", aria: "6", kind: "num", action: "digit:6" },
  { label: "−", aria: "Subtract", kind: "op", action: "op:-" },

  { label: "1", aria: "1", kind: "num", action: "digit:1" },
  { label: "2", aria: "2", kind: "num", action: "digit:2" },
  { label: "3", aria: "3", kind: "num", action: "digit:3" },
  { label: "+", aria: "Add", kind: "op", action: "op:+" },

  { label: "0", aria: "0", kind: "num", action: "digit:0", span: 2 },
  { label: ".", aria: "Decimal point", kind: "num", action: "dot" },
  { label: "=", aria: "Equals", kind: "op", action: "equals" },
];

interface KeypadProps {
  onKey: (action: string) => void;
  activeOp: string | null;
  styles: Record<string, string>;
}

export function Keypad({ onKey, activeOp, styles }: KeypadProps) {
  return (
    <div className={styles.keypad} role="group" aria-label="Calculator keypad">
      {STANDARD_KEYS.map((k) => {
        const kindClass =
          k.kind === "num"
            ? styles.keyNum
            : k.kind === "fn"
            ? styles.keyFn
            : styles.keyOp;
        const isActive =
          k.kind === "op" &&
          activeOp !== null &&
          k.action === `op:${activeOp}`;
        const classes = [
          styles.key,
          kindClass,
          k.span === 2 ? styles.keyZero : "",
          isActive ? styles.active : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={k.action}
            type="button"
            className={classes}
            onClick={() => onKey(k.action)}
            aria-label={k.aria}
          >
            {k.label}
          </button>
        );
      })}
    </div>
  );
}