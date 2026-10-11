import { useEffect, useState, useCallback } from "react";
import { evaluate, CalcError } from "../engine/evaluator";
import { formatNumber } from "../engine/format";
import { Display } from "./Display";
import { Keypad } from "./Keypad";
import { History } from "./History";
import { Settings } from "./Settings";
import { Privacy } from "./Privacy";
import { loadHistory, addHistoryEntry } from "../storage/history";
import type { HistoryEntry } from "../storage/history";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
} from "../storage/settings";
import type { Settings as SettingsType } from "../storage/settings";
import styles from "./Calculator.module.css";

const ERROR_MESSAGES: Record<string, string> = {
  DIV_ZERO: "Cannot divide by zero",
  DOMAIN: "Out of range",
  UNDEFINED: "Undefined",
  OVERFLOW: "Number too large",
  SYNTAX: "Invalid expression",
  INCOMPLETE: "Incomplete",
};

const MEMORY_KEY = "calcx.memory";

type ResolvedTheme = "dark" | "light";

function resolveTheme(pref: SettingsType["theme"]): ResolvedTheme {
  if (pref === "light" || pref === "dark") return pref;
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "dark";
}

export function Calculator() {
  const [input, setInput] = useState("");
  const [display, setDisplay] = useState("0");
  const [isError, setIsError] = useState(false);
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [scientific, setScientific] = useState(false);
  const [activeOp, setActiveOp] = useState<string | null>(null);
  const [memory, setMemory] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // --- Load persisted state on mount ---
  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    setScientific(s.defaultMode === "scientific");
    setHistory(loadHistory());
    setResolvedTheme(resolveTheme(s.theme));

    try {
      const rawMem = localStorage.getItem(MEMORY_KEY);
      if (rawMem !== null) {
        const n = Number(rawMem);
        if (Number.isFinite(n)) setMemory(n);
      }
    } catch {
      // ignore
    }
  }, []);

  // --- React to theme preference changes ---
  useEffect(() => {
    setResolvedTheme(resolveTheme(settings.theme));
    if (settings.theme === "system" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => setResolvedTheme(resolveTheme("system"));
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [settings.theme]);

  // --- Persist settings ---
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // --- Persist memory ---
  useEffect(() => {
    try {
      if (memory === null) localStorage.removeItem(MEMORY_KEY);
      else localStorage.setItem(MEMORY_KEY, String(memory));
    } catch {
      // ignore
    }
  }, [memory]);

  // --- Live preview ---
  useEffect(() => {
    if (input.trim() === "") {
      setDisplay("0");
      setIsError(false);
      return;
    }
    try {
      const v = evaluate(input, { angleMode: settings.angleMode });
      setDisplay(
        formatNumber(v, {
          precision: settings.precision,
          useThousands: settings.thousandsSeparator,
        })
      );
      setIsError(false);
    } catch (e) {
      if (e instanceof CalcError) {
        if (e.code === "INCOMPLETE") {
          setIsError(false);
          return;
        }
        setDisplay(ERROR_MESSAGES[e.code] ?? "Error");
        setIsError(true);
      } else {
        setDisplay("Error");
        setIsError(true);
      }
    }
  }, [
    input,
    settings.angleMode,
    settings.precision,
    settings.thousandsSeparator,
  ]);

  const handleKey = useCallback(
    (action: string) => {
      setIsError(false);
      setActiveOp(null);

      // Haptic feedback
      if (
        settings.hapticFeedback &&
        typeof navigator !== "undefined" &&
        "vibrate" in navigator
      ) {
        try {
          navigator.vibrate(8);
        } catch {
          // ignore
        }
      }

      // Sound feedback
      if (settings.soundFeedback && typeof AudioContext !== "undefined") {
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = 880;
          gain.gain.value = 0.03;
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.04);
          setTimeout(() => ctx.close(), 100);
        } catch {
          // ignore
        }
      }

      if (action.startsWith("digit:")) {
        const d = action.slice(6);
        setInput((s) => s + d);
        return;
      }

      if (action === "dot") {
        setInput((s) => {
          const last = s.split(/[\+\-\*\/\(\)\^]/).pop() ?? "";
          if (last.includes(".")) return s;
          if (last === "" || last === "-") return s + "0.";
          return s + ".";
        });
        return;
      }

      if (action.startsWith("op:")) {
        const op = action.slice(3);
        setInput((s) => {
          if (s === "" && op !== "-") return s;
          const trimmed = s.replace(/[\+\-\*\/]$/, "");
          return trimmed + op;
        });
        setActiveOp(op);
        return;
      }

      if (action === "equals") {
        if (input.trim() === "") return;
        try {
          const v = evaluate(input, { angleMode: settings.angleMode });
          const formatted = formatNumber(v, {
            precision: settings.precision,
            useThousands: settings.thousandsSeparator,
          });
          setInput(formatNumber(v, { useThousands: false }));
          setDisplay(formatted);
          setIsError(false);
          setHistory(addHistoryEntry(input, formatted));
        } catch (e) {
          if (e instanceof CalcError) {
            setDisplay(ERROR_MESSAGES[e.code] ?? "Error");
            setIsError(true);
          }
        }
        return;
      }

      if (action === "clear") {
        setInput("");
        setDisplay("0");
        setIsError(false);
        return;
      }

      if (action === "sign") {
        setInput((s) => {
          if (s === "") return "-";
          const m = s.match(/(\d+\.?\d*|\.\d+)$/);
          if (!m) return s + "-";
          const last = m[0];
          const before = s.slice(0, -last.length);
          const prev = before.endsWith("-")
            ? before.slice(0, -1)
            : before + "-";
          return prev + last;
        });
        return;
      }

      if (action === "percent") {
        setInput((s) => s + "%");
        return;
      }

      if (action === "mc") {
        setMemory(null);
        return;
      }
      if (action === "mr") {
        if (memory !== null) {
          setInput(formatNumber(memory, { useThousands: false }));
        }
        return;
      }
      if (action === "m+" || action === "m-") {
        let current: number;
        try {
          current =
            input.trim() === ""
              ? 0
              : evaluate(input, { angleMode: settings.angleMode });
        } catch {
          return;
        }
        const delta = action === "m+" ? current : -current;
        const base = memory ?? 0;
        setMemory(base + delta);
        return;
      }
      if (action === "backspace") {
        setInput((s) => s.slice(0, -1));
        return;
      }
    },
    [input, memory, settings]
  );

  // Keyboard
  useEffect(() => {
    if (showHistory || showSettings || showPrivacy) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if (/^[0-9]$/.test(e.key)) {
        handleKey(`digit:${e.key}`);
        e.preventDefault();
      } else if (e.key === ".") {
        handleKey("dot");
        e.preventDefault();
      } else if (["+", "-", "*", "/"].includes(e.key)) {
        handleKey(`op:${e.key}`);
        e.preventDefault();
      } else if (e.key === "Enter" || e.key === "=") {
        handleKey("equals");
        e.preventDefault();
      } else if (e.key === "Backspace") {
        handleKey("backspace");
        e.preventDefault();
      } else if (e.key === "Escape") {
        handleKey("clear");
        e.preventDefault();
      } else if (e.key === "%") {
        handleKey("percent");
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey, showHistory, showSettings, showPrivacy]);

  const toggleAngle = () => {
    const next = settings.angleMode === "RAD" ? "DEG" : "RAD";
    setSettings({ ...settings, angleMode: next });
  };

  const handleReuseFromHistory = (entry: HistoryEntry) => {
    setInput(entry.result.replace(/,/g, ""));
    setDisplay(entry.result);
    setIsError(false);
    setShowHistory(false);
  };

  const handleDataCleared = () => {
    setHistory([]);
    setMemory(null);
    setSettings(DEFAULT_SETTINGS);
    setInput("");
    setDisplay("0");
  };

  return (
    <div className={styles.app} data-theme={resolvedTheme}>
      <div className={styles.calculator}>
        <div className={styles.header}>
          <span className={styles.title}>CALCX</span>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => setShowHistory(true)}
              aria-label="Open history"
              title="History"
            >
              🕐
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => setScientific((s) => !s)}
              aria-label="Toggle scientific mode"
              aria-pressed={scientific}
            >
              ƒ(x)
            </button>
            <button
              type="button"
              className={
                settings.angleMode === "DEG"
                  ? `${styles.iconBtn} ${styles.active}`
                  : styles.iconBtn
              }
              onClick={toggleAngle}
              aria-label={`Angle mode: ${settings.angleMode}`}
            >
              {settings.angleMode}
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => setShowSettings(true)}
              aria-label="Open settings"
              title="Settings"
            >
              ⚙
            </button>
          </div>
        </div>

        <Display
          expression={input}
          result={display}
          isError={isError}
          memoryActive={memory !== null}
          styles={styles}
        />

        {scientific && (
          <div
            className={styles.scientificRow}
            role="group"
            aria-label="Scientific functions"
          >
            {[
              { l: "√", a: "sqrt(" },
              { l: "x²", a: "^2" },
              { l: "xʸ", a: "^" },
              { l: "π", a: "pi" },
              { l: "e", a: "e" },
              { l: "sin", a: "sin(" },
              { l: "cos", a: "cos(" },
              { l: "tan", a: "tan(" },
              { l: "log", a: "log(" },
              { l: "ln", a: "ln(" },
            ].map((item) => (
              <button
                key={item.l}
                type="button"
                className={styles.sciBtn}
                onClick={() => setInput((s) => s + item.a)}
                aria-label={item.l}
              >
                {item.l}
              </button>
            ))}
          </div>
        )}

        <MemoryRow
          onKey={handleKey}
          hasMemory={memory !== null}
          styles={styles}
        />

        <Keypad onKey={handleKey} activeOp={activeOp} styles={styles} />
      </div>

      {showHistory && (
        <History
          entries={history}
          onClose={() => setShowHistory(false)}
          onEntriesChange={setHistory}
          onReuse={handleReuseFromHistory}
          theme={resolvedTheme}
        />
      )}

      {showSettings && (
        <Settings
          settings={settings}
          onChange={setSettings}
          onClose={() => setShowSettings(false)}
          onDataCleared={handleDataCleared}
          onOpenPrivacy={() => {
            setShowSettings(false);
            setShowPrivacy(true);
          }}
          theme={resolvedTheme}
        />
      )}

      {showPrivacy && (
        <Privacy
          onClose={() => setShowPrivacy(false)}
          theme={resolvedTheme}
        />
      )}
    </div>
  );
}

interface MemoryRowProps {
  onKey: (action: string) => void;
  hasMemory: boolean;
  styles: Record<string, string>;
}

function MemoryRow({ onKey, hasMemory, styles }: MemoryRowProps) {
  return (
    <div
      className={styles.memoryRow}
      role="group"
      aria-label="Memory functions"
    >
      <button
        type="button"
        className={styles.memBtn}
        onClick={() => onKey("mc")}
        disabled={!hasMemory}
        aria-label="Memory clear"
      >
        MC
      </button>
      <button
        type="button"
        className={styles.memBtn}
        onClick={() => onKey("mr")}
        disabled={!hasMemory}
        aria-label="Memory recall"
      >
        MR
      </button>
      <button
        type="button"
        className={styles.memBtn}
        onClick={() => onKey("m+")}
        aria-label="Memory add"
      >
        M+
      </button>
      <button
        type="button"
        className={styles.memBtn}
        onClick={() => onKey("m-")}
        aria-label="Memory subtract"
      >
        M−
      </button>
    </div>
  );
}
