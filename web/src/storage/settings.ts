export interface Settings {
  theme: "system" | "light" | "dark";
  defaultMode: "standard" | "scientific";
  precision: number; // 6-15
  angleMode: "DEG" | "RAD";
  thousandsSeparator: boolean;
  soundFeedback: boolean;
  hapticFeedback: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  defaultMode: "standard",
  precision: 12,
  angleMode: "RAD",
  thousandsSeparator: true,
  soundFeedback: false,
  hapticFeedback: true,
};

const STORAGE_KEY = "calcx.settings.v1";

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

export function clearAllData(): void {
  try {
    localStorage.removeItem("calcx.history.v1");
    localStorage.removeItem("calcx.memory");
    localStorage.removeItem("calcx.theme");
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}