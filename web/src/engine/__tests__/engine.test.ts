import { describe, it, expect } from "vitest";
import { evaluate, CalcError } from "../evaluator";
import { formatNumber } from "../format";

const RAD = { angleMode: "RAD" as const };
const DEG = { angleMode: "DEG" as const };

describe("basic arithmetic", () => {
  it.each([
    ["2 + 3", 5],
    ["9 - 4", 5],
    ["6 * 7", 42],
    ["8 / 2", 4],
  ])("%s = %i", (expr, expected) => {
    expect(evaluate(expr, RAD)).toBe(expected);
  });
});

describe("operator precedence", () => {
  it("2 + 3 * 4 = 14", () => expect(evaluate("2 + 3 * 4", RAD)).toBe(14));
  it("(2 + 3) * 4 = 20", () => expect(evaluate("(2 + 3) * 4", RAD)).toBe(20));
  it("2 ^ 3 ^ 2 = 512 (right-assoc)", () =>
    expect(evaluate("2 ^ 3 ^ 2", RAD)).toBe(512));
  it("-2 ^ 2 = -4", () => expect(evaluate("-2 ^ 2", RAD)).toBe(-4));
});

describe("decimal and float display policy", () => {
  it("0.1 + 0.2 displays 0.3", () => {
    const v = evaluate("0.1 + 0.2", RAD);
    expect(formatNumber(v, { precision: 12 })).toBe("0.3");
  });
  it("1/3 is displayed rounded (not raw float)", () => {
    const v = evaluate("1 / 3", RAD);
    const s = formatNumber(v, { precision: 12 });
    expect(s.startsWith("0.3333333333")).toBe(true);
  });
});

describe("scientific", () => {
  it("sqrt(81) = 9", () => expect(evaluate("sqrt(81)", RAD)).toBe(9));
  it("5 ^ 2 = 25", () => expect(evaluate("5 ^ 2", RAD)).toBe(25));
  it("log(100) ~= 2", () =>
    expect(evaluate("log(100)", RAD)).toBeCloseTo(2, 12));
  it("ln(e) ~= 1", () => expect(evaluate("ln(e)", RAD)).toBeCloseTo(1, 12));
  it("sin(30 deg) ~= 0.5", () =>
    expect(evaluate("sin(30)", DEG)).toBeCloseTo(0.5, 12));
  it("sin(pi/6 rad) ~= 0.5", () =>
    expect(evaluate("sin(pi/6)", RAD)).toBeCloseTo(0.5, 12));
  it("5! = 120", () => expect(evaluate("5!", RAD)).toBe(120));
});

describe("errors", () => {
  const cases: [string, string][] = [
    ["1 / 0", "DIV_ZERO"],
    ["sqrt(-1)", "DOMAIN"],
    ["log(0)", "DOMAIN"],
    ["ln(-1)", "DOMAIN"],
    ["asin(2)", "DOMAIN"],
    ["(-1)!", "DOMAIN"],
    ["171!", "OVERFLOW"],
    ["2 +", "INCOMPLETE"],
    ["(2 + 3", "SYNTAX"],
    ["1..2", "SYNTAX"],
  ];

  it.each(cases)("%s throws %s", (expr, code) => {
    let caught: CalcError | undefined;
    try {
      evaluate(expr, RAD);
    } catch (e) {
      caught = e as CalcError;
    }
    expect(caught).toBeDefined();
    expect(caught!.code).toBe(code);
  });
});