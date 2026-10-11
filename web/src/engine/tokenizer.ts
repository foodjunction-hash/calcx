export type TokenType =
  | "number"
  | "operator"
  | "lparen"
  | "rparen"
  | "func"
  | "constant"
  | "postfix";

export interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

const FUNCS = new Set([
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "log",
  "ln",
  "sqrt",
]);
const CONSTANTS = new Set(["pi", "e"]);

export class TokenizeError extends Error {
  pos: number;
  constructor(message: string, pos: number) {
    super(message);
    this.name = "TokenizeError";
    this.pos = pos;
  }
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = input.replace(/\s+/g, "");

  while (i < s.length) {
    const c = s[i];

    // Number literal (with optional scientific notation)
    if (/[0-9.]/.test(c)) {
      let j = i;
      let seenDot = false;
      while (j < s.length && /[0-9.]/.test(s[j])) {
        if (s[j] === ".") {
          if (seenDot) throw new TokenizeError("Multiple decimal points", j);
          seenDot = true;
        }
        j++;
      }
      if (s[j] === "e" || s[j] === "E") {
        j++;
        if (s[j] === "+" || s[j] === "-") j++;
        if (!/[0-9]/.test(s[j] ?? "")) {
          throw new TokenizeError("Malformed exponent", j);
        }
        while (j < s.length && /[0-9]/.test(s[j])) j++;
      }
      const raw = s.slice(i, j);
      if (raw === ".") throw new TokenizeError("Bare decimal point", i);
      tokens.push({ type: "number", value: raw, pos: i });
      i = j;
      continue;
    }

    // Identifier (function or constant)
    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
      const word = s.slice(i, j).toLowerCase();
      if (FUNCS.has(word)) tokens.push({ type: "func", value: word, pos: i });
      else if (CONSTANTS.has(word))
        tokens.push({ type: "constant", value: word, pos: i });
      else throw new TokenizeError(`Unknown identifier: ${word}`, i);
      i = j;
      continue;
    }

    // Operators
    if ("+-*/^".includes(c)) {
      tokens.push({ type: "operator", value: c, pos: i });
      i++;
      continue;
    }

    // Parentheses
    if (c === "(") {
      tokens.push({ type: "lparen", value: c, pos: i });
      i++;
      continue;
    }
    if (c === ")") {
      tokens.push({ type: "rparen", value: c, pos: i });
      i++;
      continue;
    }

    // Postfix
    if (c === "!" || c === "%") {
      tokens.push({ type: "postfix", value: c, pos: i });
      i++;
      continue;
    }

    throw new TokenizeError(`Unexpected character: ${c}`, i);
  }

  return tokens;
}