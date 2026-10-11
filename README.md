<div align="center">

# 🧮 CALCX

**A premium iPhone-inspired calculator — available as a Progressive Web App.**

Dark/Light themes · Memory functions · Calculation history · Scientific mode · Works offline

[![Live Demo](https://img.shields.io/badge/Live%20Demo-calcx--one.vercel.app-000000?style=for-the-badge&logo=vercel)](https://calcx-one.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-foodjunction--hash%2Fcalcx-181717?style=for-the-badge&logo=github)](https://github.com/foodjunction-hash/calcx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

</div>

---

## ✨ Features

### Core Calculator
- ➕ Addition, subtraction, multiplication, division
- 📊 Percentage (context-sensitive, iOS-style rules)
- 🔢 Decimal point, sign toggle (+/−)
- 🧹 Clear all (AC) and backspace (⌫)
- ➗ Operator precedence (PEMDAS/BODMAS)
- 🧮 Parentheses support
- ⚠️ Graceful error handling (division by zero, invalid input, overflow)

### Memory Functions
- `MC` — Memory clear
- `MR` — Memory recall
- `M+` — Add current value to memory
- `M−` — Subtract current value from memory
- 🔵 Visual `M` badge when memory holds a value
- 💾 Persists across page refreshes

### Scientific Mode
- √ Square root · x² Square · xʸ Power
- sin · cos · tan · asin · acos · atan
- log · ln
- π (pi) · e (Euler's number)
- ! Factorial
- DEG/RAD angle mode toggle

### Calculation History
- 📜 Auto-saves every completed calculation
- 🔍 Shows expression, result, and timestamp
- ♻️ Tap any entry to reuse its result
- 📋 Copy expression or result
- 🗑️ Delete individual entries or clear all
- 💾 Persists locally (localStorage)

### Settings
- 🌗 Theme: System / Light / Dark
- 📐 Default mode: Standard / Scientific
- 🔢 Decimal precision: 6–15 significant digits
- 📏 Angle mode: DEG / RAD
- 💯 Thousands separator toggle
- 🔊 Sound feedback toggle
- 📳 Haptic feedback toggle (mobile)
- 🧹 Clear all data with confirmation

### Premium UX
- 🎨 iPhone-inspired design (dark + light themes)
- 🟠 Orange accent buttons
- ⚪ Circular keypad with subtle animations
- ⌨️ Full keyboard support on desktop
- 📋 Clipboard copy/paste
- ♿ Accessibility: ARIA labels, focus management, reduced-motion support
- 📱 Fully responsive: phone, tablet, desktop

### PWA (Progressive Web App)
- 📥 Installable on Android, iOS, and desktop
- 📴 Works fully offline after first load
- ⚡ Instant startup from cache
- 🎯 Standalone window (no browser chrome)
- 🔔 Auto-updates in the background

---

## 🚀 Live Demo

**👉 [https://calcx-one.vercel.app/](https://calcx-one.vercel.app/)**

Try it on your phone — install it to your home screen for the full experience.

---

## 📸 Screenshots

> Coming soon — dark theme, light theme, scientific mode, history screen

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript |
| **Build** | Vite 8 |
| **Styling** | CSS Modules |
| **State** | React Hooks + Context |
| **Storage** | localStorage (history, memory, settings) |
| **Testing** | Vitest |
| **PWA** | vite-plugin-pwa + Workbox |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
calculator-app/
├── shared-spec/              # Math behavior specification
│   └── CALCULATION_SPEC.md
├── docs/                     # Additional documentation
├── web/                      # React + TypeScript PWA
│   ├── public/
│   │   └── icons/            # PWA icons (192, 512, apple-touch, favicon)
│   ├── src/
│   │   ├── engine/           # Calculator math engine
│   │   │   ├── tokenizer.ts  # Lexer
│   │   │   ├── evaluator.ts  # Recursive descent parser
│   │   │   ├── format.ts     # Display formatting
│   │   │   └── __tests__/    # 27 unit tests
│   │   ├── storage/          # Persistence layer
│   │   │   ├── history.ts
│   │   │   └── settings.ts
│   │   ├── ui/               # React components
│   │   │   ├── Calculator.tsx
│   │   │   ├── Display.tsx
│   │   │   ├── Keypad.tsx
│   │   │   ├── History.tsx
│   │   │   └── Settings.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md
```

---

## 🧮 Math Engine

The calculation engine is a **hand-written recursive descent parser** with the following grammar:

```
expression := term (('+' | '-') term)*
term       := unary (('*' | '/') unary)*
unary      := ('-' | '+')? power
power      := postfix ('^' unary)?        # right-associative
postfix    := primary ('!' | '%')*
primary    := number | constant | '(' expression ')' | func '(' expression ')'
```

### Precision Policy
- Internal values: **IEEE-754 binary64** (JS `number`)
- Display: rounded to configured precision (default 12 significant digits)
- **Never shows floating-point artifacts** — `0.1 + 0.2` displays as `0.3`
- Scientific notation for values ≥ 1e15 or < 1e-9

### Percentage Semantics
- Standalone: `50%` → `0.5`
- Additive: `200 + 10%` → `220`
- Subtractive: `200 − 10%` → `180`
- Multiplicative: `200 × 10%` → `20`

### Error Handling
| Code | Meaning | User-Facing Message |
|------|---------|---------------------|
| `DIV_ZERO` | Division by zero | "Cannot divide by zero" |
| `DOMAIN` | Out-of-domain input | "Out of range" |
| `UNDEFINED` | Undefined operation | "Undefined" |
| `OVERFLOW` | Number too large | "Number too large" |
| `SYNTAX` | Invalid expression | "Invalid expression" |
| `INCOMPLETE` | Incomplete input | (silent) |

---

## 🧪 Testing

**27 unit tests** covering arithmetic, precedence, decimals, scientific functions, and error cases.

```bash
cd web
npm test
```

Expected output:
```
Test Files  1 passed (1)
     Tests  27 passed (27)
```

---

## 💻 Local Development

### Prerequisites
- Node.js 20+ ([download](https://nodejs.org))
- npm 10+ (comes with Node.js)

### Setup

```bash
# Clone the repo
git clone https://github.com/foodjunction-hash/calcx.git
cd calcx/web

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open **http://localhost:5173**

### Build for production

```bash
npm run build
```

Output goes to `web/dist/`.

### Preview production build

```bash
npm run preview
```

Open **http://localhost:4173**

### Run tests

```bash
npm test           # single run
npm run test:watch # watch mode
```

---

## 📦 Deployment

### Vercel (recommended)

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. **Set Root Directory to `web`** (important!)
5. Click **Deploy**

Auto-deploys on every `git push` to `main`.

### Manual Hosting

Any static host works (Netlify, Cloudflare Pages, GitHub Pages):

```bash
cd web
npm run build
# Upload contents of web/dist/ to your host
```

---

## 📱 PWA Installation

### Android (Chrome)
1. Open the site
2. Tap the **⋮** menu
3. Tap **"Install app"** or **"Add to Home screen"**

### iOS (Safari)
1. Open the site
2. Tap the **Share** button
3. Tap **"Add to Home Screen"**

### Desktop (Chrome/Edge)
1. Open the site
2. Click the **install icon** in the address bar
3. Click **"Install"**

---

## 🔒 Privacy

- **All data stays on your device.** No servers, no accounts, no tracking.
- History, memory, and settings are stored in **localStorage**.
- No analytics, no ads, no third-party requests.
- Clearing browser data removes all stored history.

---

## 🗺️ Roadmap

- [x] Standard calculator with operator precedence
- [x] Scientific mode
- [x] Memory functions (M+, M−, MR, MC)
- [x] Calculation history
- [x] Settings & persistence
- [x] PWA with offline support
- [ ] Native Android app (Kotlin + Jetpack Compose)
- [ ] Custom domain
- [ ] Theme animation transitions
- [ ] History search / filter
- [ ] Export history (CSV / JSON)

---

## 🤝 Contributing

This is a personal project. Feedback and suggestions are welcome — open an issue or start a discussion.

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

Copyright (c) 2026 CalcX

---

<div align="center">

**Built with care by [@foodjunction-hash](https://github.com/foodjunction-hash)**

⭐ If you like this project, give it a star on GitHub!

</div>