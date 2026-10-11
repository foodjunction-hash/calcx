import { tokenize, TokenizeError } from "./tokenizer";
import type { Token } from "./tokenizer";

export type CalcErrorCode =
  | "DIV_ZERO"
  | "DOMAIN"
  | "UNDEFINED"
  | "OVERFLOW"
  | "SYNTAX"
  | "INCOMPLETE";

export class CalcError extends Error {
  code: CalcErrorCode;
  constructor(code: CalcErrorCode, message?: string) {
    super(message ?? code);
    this.name = "CalcError";
    this.code = code;
  }
}

export type AngleMode = "DEG" | "RAD";

export interface EvalContext {
  angleMode: AngleMode;
}

const MAX_FACTORIAL = 170;

function toRadians(x: number, mode: AngleMode): number {
  return mode === "DEG" ? (x * Math.PI) / 180 : x;
}

function fromRadians(x: number, mode: AngleMode): number {
  return mode === "DEG" ? (x * 180) / Math.PI : x;
}

function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new CalcError("DOMAIN", "Factorial domain");
  }
  if (n > MAX_FACTORIAL) {
    throw new CalcError("OVERFLOW", "Factorial too large");
  }
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

class Parser {
  private i = 0;
  private tokens: Token[];
  private ctx: EvalContext;
  constructor(tokens: Token[], ctx: EvalContext) {
    this.tokens = tokens;
    this.ctx = ctx;
  }
  private peek(): Token | undefined {
    return this.tokens[this.i];
  }

  private next(): Token | undefined {
    return this.tokens[this.i++];
  }

  private expect(type: Token["type"], value?: string): Token {
    const t = this.peek();
    if (!t || t.type !== type || (value !== undefined && t.value !== value)) {
      throw new CalcError("SYNTAX", `Expected ${value ?? type}`);
    }
    this.i++;
    return t;
  }

  parse(): number {
    if (this.tokens.length === 0) {
      throw new CalcError("INCOMPLETE", "Empty expression");
    }
    const v = this.parseExpression();
    if (this.i < this.tokens.length) {
      throw new CalcError("SYNTAX", `Unexpected token at ${this.peek()!.pos}`);
    }
    if (!Number.isFinite(v)) {
      throw new CalcError("OVERFLOW", "Result not finite");
    }
    return v;
  }

  // expression := term (('+' | '-') term)*
  private parseExpression(): number {
    let left = this.parseTerm();
    while (true) {
      const t = this.peek();
      if (t?.type === "operator" && (t.value === "+" || t.value === "-")) {
        this.next();
        const right = this.parseTerm();
        left = t.value === "+" ? left + right : left - right;
      } else {
        return left;
      }
    }
  }

  // term := unary (('*' | '/') unary)*
  private parseTerm(): number {
    let left = this.parseUnary();
    while (true) {
      const t = this.peek();
      if (t?.type === "operator" && (t.value === "*" || t.value === "/")) {
        this.next();
        const right = this.parseUnary();
        if (t.value === "*") {
          left = left * right;
        } else {
          if (right === 0) throw new CalcError("DIV_ZERO", "Division by zero");
          left = left / right;
        }
      } else {
        return left;
      }
    }
  }

  // unary := ('-' | '+')? power
  // Unary minus has LOWER precedence than '^':
  //   -2 ^ 2  parses as  -(2 ^ 2) = -4
  private parseUnary(): number {
    const t = this.peek();
    if (t?.type === "operator" && (t.value === "-" || t.value === "+")) {
      this.next();
      const v = this.parseUnary(); // right-associative unary
      return t.value === "-" ? -v : v;
    }
    return this.parsePower();
  }

  // power := postfix ('^' unary)?   (right-associative)
  private parsePower(): number {
    const base = this.parsePostfix();
    const t = this.peek();
    if (t?.type === "operator" && t.value === "^") {
      this.next();
      // Right side is `unary` so that 2 ^ -3 works
      const exp = this.parseUnary();
      return Math.pow(base, exp);
    }
    return base;
  }

  // postfix := primary ('!' | '%')*
  private parsePostfix(): number {
    let v = this.parsePrimary();
    while (true) {
      const t = this.peek();
      if (t?.type === "postfix") {
        this.next();
        if (t.value === "!") v = factorial(v);
        else if (t.value === "%") v = v / 100;
        else throw new CalcError("SYNTAX", "Unknown postfix");
      } else {
        return v;
      }
    }
  }

  // primary := number | constant | '(' expr ')' | func '(' expr ')'
  private parsePrimary(): number {
    const t = this.next();
    if (!t) throw new CalcError("INCOMPLETE", "Unexpected end");

    if (t.type === "number") {
      const n = Number(t.value);
      if (!Number.isFinite(n)) throw new CalcError("SYNTAX", "Bad number");
      return n;
    }

    if (t.type === "constant") {
      return t.value === "pi" ? Math.PI : Math.E;
    }

    if (t.type === "lparen") {
      const v = this.parseExpression();
      this.expect("rparen");
      return v;
    }

    if (t.type === "func") {
      this.expect("lparen");
      const arg = this.parseExpression();
      this.expect("rparen");
      return this.applyFunc(t.value, arg);
    }

    throw new CalcError("SYNTAX", `Unexpected token: ${t.value}`);
  }

  private applyFunc(name: string, x: number): number {
    switch (name) {
      case "sin":
        return Math.sin(toRadians(x, this.ctx.angleMode));
      case "cos":
        return Math.cos(toRadians(x, this.ctx.angleMode));
      case "tan": {
        const r = toRadians(x, this.ctx.angleMode);
        const c = Math.cos(r);
        if (Math.abs(c) < 1e-15) {
          throw new CalcError("UNDEFINED", "tan undefined");
        }
        return Math.tan(r);
      }
      case "asin": {
        if (x < -1 || x > 1) throw new CalcError("DOMAIN", "asin domain");
        return fromRadians(Math.asin(x), this.ctx.angleMode);
      }
      case "acos": {
        if (x < -1 || x > 1) throw new CalcError("DOMAIN", "acos domain");
        return fromRadians(Math.acos(x), this.ctx.angleMode);
      }
      case "atan":
        return fromRadians(Math.atan(x), this.ctx.angleMode);
      case "sqrt": {
        if (x < 0) throw new CalcError("DOMAIN", "sqrt domain");
        return Math.sqrt(x);
      }
      case "log": {
        if (x <= 0) throw new CalcError("DOMAIN", "log domain");
        return Math.log10(x);
      }
      case "ln": {
        if (x <= 0) throw new CalcError("DOMAIN", "ln domain");
        return Math.log(x);
      }
      default:
        throw new CalcError("SYNTAX", `Unknown function: ${name}`);
    }
  }
}

export function evaluate(
  expr: string,
  ctx: EvalContext = { angleMode: "RAD" }
): number {
  let tokens: Token[];
  try {
    tokens = tokenize(expr);
  } catch (e) {
    if (e instanceof TokenizeError) throw new CalcError("SYNTAX", e.message);
    throw e;
  }
  return new Parser(tokens, ctx).parse();
}