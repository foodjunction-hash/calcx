export interface FormatOptions {
  precision?: number;      // significant digits (default 12)
  useThousands?: boolean;  // thousands separator (default true)
}

/**
 * Display formatting is intentionally separate from the internal value.
 * Never let binary64 artifacts (like 0.30000000000000004) leak to the user.
 */
export function formatNumber(value: number, opts: FormatOptions = {}): string {
  const { precision = 12, useThousands = true } = opts;

  if (value === 0) return "0";
  if (!Number.isFinite(value)) return "Error";

  const abs = Math.abs(value);
  const useSci = abs >= 1e15 || abs < 1e-9;

  let str: string;
  if (useSci) {
    str = value.toExponential(Math.min(precision - 1, 15));
    str = str.replace(/\.?0+e/, "e");
  } else {
    const rounded = Number(value.toPrecision(precision));
    str = String(rounded);
    if (str.includes("e")) {
      str = rounded.toExponential(precision - 1).replace(/\.?0+e/, "e");
    }
  }

  if (useThousands && !str.includes("e")) {
    const [intPart, decPart] = str.split(".");
    const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decPart !== undefined ? `${withSep}.${decPart}` : withSep;
  }
  return str;
}