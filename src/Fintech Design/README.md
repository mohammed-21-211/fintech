# Fintech Design System

A dark-themed, lime-accented design system for **Fintech** — a bilingual (English / Arabic, RTL+LTR) personal-finance web app built with React 18, Vite, TypeScript and Supabase.

This package is a re-export of the design language already living in the production codebase (`fintech/src/index.css` + `src/components`). Everything here is lifted verbatim from that source — no invented tokens, no speculative components.

---

## Sources

| Source | Where | Access |
|---|---|---|
| **Codebase** | `fintech/` (mounted via File System Access API) | Read-only, attached to this project |
| **Live tokens** | `fintech/src/index.css` | Mirrored in `colors_and_type.css` |
| **Components** | `fintech/src/components/{ui,layout,landing,dashboard,auth}/` | Re-implemented in `ui_kits/fintech-app/` |
| **Translations** | `fintech/src/i18n/locales/{en,ar}.json` | Copy tone / casing reference |
| **Figma** | _Not provided._ The repo references "pixel-accurate implementation of the Figma design" but no link was attached. |

> If you have a Figma URL or font files, attach them and ask for an update — see **Caveats** at the bottom of this file.

---

## What this product is

**Fintech** is a personal-finance dashboard. Users sign in with email, see a balance / income / expenses / savings-rate overview, log transactions, set budgets, view cashflow analytics, and switch the entire UI between English (LTR) and Arabic (RTL) on the fly.

Two distinct surfaces share the same token set but use it very differently:

1. **Landing page** — public marketing site. Dark hero, lime accent, glassy floating cards, generous whitespace. The "Features" section uniquely flips to a `#F8F8F8` light background — the only light-mode moment in the product.
2. **Dashboard** — authenticated app. Fixed sidebar (collapsible to 72px), topbar with breadcrumb + language toggle, content cards on `--color-bg-surface`. The Balance card on the Overview screen is the only place lime fills an entire surface; every other card stays dark.

The visual hierarchy is mostly delivered through **weight and scale**, not color. Lime is a precious resource — it marks the brand, the focus ring, the primary CTA, the focused input, the active sidebar item, the eyebrow text, the focused balance card. That's the whole list.

---

## Content fundamentals

The product copy is **direct, second-person, optimistic, and very short**. Pulled from `i18n/locales/en.json`:

- **"Maximize Your Money Flow."** — hero headline. Title-case, terminal period, no exclamation.
- **"Trusted by 50,000+ users worldwide"** — social proof as a statement, not a slogan.
- **"Take control of your finances"** — login-screen pull quote.
- **"Add your first transaction to get started"** — empty-state hint.
- **"Good morning, [Name] 👋"** — dashboard greeting (one of the rare emoji moments).

### Rules

- **Person:** "you" / "your" throughout. The product addresses the user; it doesn't talk about itself in the third person.
- **Casing:** Title Case on big headings and button labels ("Get Started", "Add Transaction", "View All"). Sentence case on descriptions and helper text ("Sign in to manage your finances", "Track all transactions instantly with real-time balance updates"). Never ALL CAPS in body — uppercase is reserved for eyebrows / labels / kbd-style tags and is always paired with 2px letter-spacing.
- **Length:** Headlines max ~5 words ("Maximize Your Money Flow."). Subtitles max ~20 words. Stat labels are 1–3 words ("Total Balance", "Monthly Savings", "Transactions/day").
- **Punctuation:** Headlines end with a period when they're statements, no period when they're verbs/CTAs. No em-dashes in product copy. Use ` — ` only in marketing prose.
- **Numbers:** Always formatted ("$24,563", "50,000+", "2M+", "99.9%", "+12.5%"). Currency symbol always precedes the number. Use `+` and `↑` for positive deltas, `−` / `↓` for negative. Percent deltas always include a sign.
- **Emoji:** Sparingly. Only as **content** — a category icon (🍕 food, 🚗 transport, 🏠 housing), a greeting wave (👋), an empty-state focal point (🎯). **Never as decoration in body copy or as bullet points.** Inline emoji never appears in titles, buttons, or alongside Lucide icons.
- **Tone:** Confident, calm, no jargon, no exclamation marks. The product never says "Awesome!" or "Oops!". Toasts say "Profile updated successfully" / "Failed to update profile" — flat, factual, low-drama.
- **Bilingual:** Every string lives in `en.json` and `ar.json`. The brand name "Fintech" stays Latin in both languages. When designing, mirror layout in RTL — the codebase already inverts margins/borders via `[dir='rtl']` selectors; preserve that convention.

---

## Visual foundations

### Color

A near-monochrome dark palette with one accent.

- **Backgrounds form a 6-step scale** from `#0A0A0A` (base) → `#1E1E1E` (overlay). Each step is ~3–7 units lighter; the eye reads them as depth even though the contrast is tiny.
- **Borders are the structural cue.** `#262626` for default, `#2E2E2E` on hover. Cards rarely have shadows — they have borders. The whole product is built on hairline rectangles separated by 1px borders, not floating elevation.
- **Lime `#D4F03C` is the ONLY accent.** No second brand color. No purple, no blue, no pink. The semantic colors (success-green, error-red, warning-yellow, info-blue) exist but are always shown at low saturation against tinted backgrounds (`rgba(…, 0.12)`).
- **Orange `#FF6B2B`** is declared but barely used — reserved for footer CTAs / secondary callouts. Avoid unless you find it in the source.
- **Selection highlight** is `--color-lime-glow` with lime text — a tiny but characterful detail.

### Type

- **Montserrat** for English (the official brand font, shipped as a variable font in `fonts/`), **Noto Sans Arabic** for Arabic. Both swap automatically via `[dir='rtl']`.
- **Brand decision overrides the codebase.** `fintech/src/index.css` declares `Inter`, but the brand actually uses Montserrat — we override here. When porting back to the codebase, swap the `--font-family` value to `'Montserrat'` and ship the two TTFs.
- **Weight bias is extreme.** Body is 400. Buttons / labels are 600. **Every heading is 900 (black).** There is no 800. Skipping straight from regular to black is the entire personality. Montserrat's variable axis supports the full 100–900 range; we use 400 / 500 / 600 / 700 / 900.
- **Italic** is available (Montserrat Italic variable), reserved for inline emphasis in prose — never for headings, buttons, or labels.
- **Negative letter-spacing on large type.** `-0.5px` on h1, `-1px` on h2, `-2px` on the display hero. This is non-negotiable — without it the black weight looks chunky.
- **Eyebrow micro-type** is uppercase, 12px, weight 700, **2px letter-spacing**, often lime. Found above every section title on landing.

### Spacing & layout

- **4px grid.** All spacing tokens are multiples of 4.
- **Generous section padding.** Landing sections use `--space-24` (96px) vertical padding. Dashboard cards use `--space-5` (20px) padding internally.
- **Content max-width 1280px**, centered.
- **Inputs are 48px tall, buttons are 36/44/52/60px.** Both groups are pill-shaped — `--radius-full`.

### Cards

The dominant primitive. Three variants:

1. **Standard card** — `background: #1A1A1A`, `border: 1px solid #262626`, `border-radius: 24px (--radius-2xl)`, `padding: 24px`. On hover the border lightens to `#2E2E2E`. No shadow.
2. **Surface card** (more common in dashboard) — same recipe but `background: #161616`.
3. **Lime card** (special) — `background: var(--color-lime)`, no border, dark text. Only used for the Balance card on Overview and the credit-card mockup in Hero.

Cards never have a colored left-border accent. They never have shadow-only-no-border treatment. Border-then-radius-then-padding, in that order.

### Buttons

All buttons are full pills (`--radius-full`). Five variants — primary (lime fill, dark text), secondary (dark surface, light border), ghost (transparent, secondary text), danger (red-tinted), outline (lime border + lime text). Four sizes — sm 36px, md 44px, lg 52px, xl 60px. Always `font-weight-semibold`.

### Hover & press

- **Hover on primary buttons:** background darkens to `--color-lime-dark`, gains `box-shadow: var(--shadow-lime)` (a lime glow), translates up 1px.
- **Hover on cards:** border lightens. That's it. No transform, no shadow.
- **Hover on nav links:** color shifts from secondary → primary text.
- **Hover on ghost buttons:** background becomes surface gray.
- **Press on buttons:** translateY back to 0. No darken.

### Focus

Universal: `outline: 2px solid var(--color-lime); outline-offset: 2px;`. Inputs additionally get a 3px `--color-lime-muted` box-shadow ring.

### Animation

Mostly understated. Built-in keyframes:

- `fadeIn` — 8px translateY + opacity, 400ms
- `slideUp` — 24px translateY + opacity, 500ms
- `slideInRight` — toast entry
- `scaleIn` — modal entry, 0.95 → 1, 300ms
- `pulse` — opacity 1 ↔ 0.5 (used on the lime status dot in the hero badge)
- `float` — `-10px` translateY, 4s ease-in-out infinite (used on hero floating cards + CTA blobs)
- `spin` — for loaders and the payment-system orbit (20s linear)

Transitions use three durations: 150ms (color shifts), 250ms (most things), 400ms (modals / layout). Easing is `ease`, not `cubic-bezier`. No bounce, no spring.

### Backgrounds & texture

- **No images, no gradients on most surfaces.** The product is flat-dark.
- **Two exceptions:**
  - The Hero `::before` pseudo paints a soft radial glow at the top (`rgba(212,240,60,0.08)`) and a smaller one on the right — gives the page a subtle ambient light without using imagery.
  - The CTA section uses three animated blob shapes (lime, dark, lime-glow) as decorative abstract art.
- **Glassmorphism** is used in exactly two places: the scrolled navbar (`backdrop-filter: blur(20px)` on `rgba(10,10,10,0.92)`) and the toast container. Don't overuse it.
- **Grain / noise:** none. The "noise texture" comment in `Hero.css` is a misnomer — it's just radial gradients.

### Charts

Recharts area charts on dashboards. Income series uses lime; expenses use red. The Hero/Login/Features mockups fake bar charts with `<div>`s — same lime color, rounded top corners only (`3px 3px 0 0`).

### Iconography

See **[Iconography](#iconography)** below.

---

## Iconography

The product is committed to a **single icon system: [Lucide React](https://lucide.dev/) v0.316**.

- Stroke icons (1px stroke, 2px on smaller sizes), 16–18px in component contexts, 12–14px in dense rows.
- Always rendered inline with text — never decorative-only. Common icons in use: `ArrowRight`, `Play`, `Plus`, `Trash2`, `Eye`, `EyeOff`, `Mail`, `Lock`, `Globe`, `LayoutDashboard`, `ArrowLeftRight`, `Target`, `BarChart2`, `Settings`, `LogOut`, `ChevronLeft`, `ChevronRight`, `TrendingUp`, `TrendingDown`, `Wallet`, `PiggyBank`, `ArrowUpRight`, `Download`.
- Icons inside circular "pill" tiles (36×36, `--radius-lg`) sit on tinted semantic backgrounds (`--color-success-bg` etc.) with the matching text color.
- **No custom SVG illustrations.** The codebase ships no `.svg` files. All "icons" are either Lucide components or — for transaction categories — **emoji glyphs** treated as content (🍕 🚗 🏠 🛒 💡 💼 🎭 ❤️ 📚 ✈️ 📌 🎯 💰 💸 📊). These come from `Overview.tsx` and `BudgetList.tsx`.
- **Brand mark** is a typographic lockup: a 28–32px square (`--radius-md`, lime fill, dark "F" centered, weight 900) followed by the word "Fintech" in 18–20px black. This is rebuilt in markup wherever it appears — there is no PNG/SVG logo file.
- **Unicode used as icons:** `✓` (checkmarks in feature lists), `↑` `↓` `←` `→` (deltas, arrows in stat cards), `✦` (tag glyph in CTA: "✦ Get Started Today"), `•` (card-number obfuscation in the hero mockup), `₿` (center of the Payment System orbit diagram). These are intentional and should be kept.
- **CDN strategy for this design system:** Lucide is loaded from `https://unpkg.com/lucide@latest` in the UI kit's `index.html`. If you're working offline, install `lucide-react` and import named icons.

### Font files

- **Latin: `Montserrat` (variable) — shipped.** `fonts/Montserrat-VariableFont_wght.ttf` + `fonts/Montserrat-Italic-VariableFont_wght.ttf`. Loaded via `@font-face` in `colors_and_type.css`.
- **Arabic: `Noto Sans Arabic` — substituted.** Loaded from Google Fonts. No Arabic brand font was provided; if/when one arrives, drop it into `fonts/` and replace the `@import` with `@font-face` rules. **(Flagged.)**

---

## Index

```
.
├── README.md                          ← you are here
├── SKILL.md                           ← Agent-Skill manifest (Claude Code-compatible)
├── colors_and_type.css                ← all design tokens, ready to import
├── assets/
│   └── logo.svg                       ← the "F" lockup as an inline SVG
├── preview/                           ← Design-System-tab cards
│   ├── colors-brand.html
│   ├── colors-surfaces.html
│   ├── colors-text.html
│   ├── colors-semantic.html
│   ├── type-scale.html
│   ├── type-headings.html
│   ├── type-eyebrows.html
│   ├── spacing-scale.html
│   ├── radii.html
│   ├── shadows.html
│   ├── components-buttons.html
│   ├── components-inputs.html
│   ├── components-cards.html
│   ├── components-badges.html
│   ├── components-stat-cards.html
│   ├── components-budget-card.html
│   ├── components-sidebar-nav.html
│   ├── components-toasts.html
│   └── brand-logo.html
└── ui_kits/
    └── fintech-app/
        ├── README.md
        ├── index.html                 ← interactive click-through prototype
        ├── tokens.css
        ├── components.jsx             ← Button, Input, Card, Badge, Stat, …
        ├── Landing.jsx                ← Hero + Features + CTA recreated
        ├── Dashboard.jsx              ← Sidebar + Overview + Budgets
        └── Auth.jsx                   ← LoginForm with right-rail mockup
```

---

## Caveats & open questions

- **No Arabic brand font.** Noto Sans Arabic is loaded from Google Fonts as a substitute. If you have a licensed Arabic typeface, drop it into `fonts/` and update `colors_and_type.css`.
- **The production codebase still declares `Inter`.** This design system has switched to the brand's actual font (Montserrat). When pushing back to `fintech/src/index.css`, swap the `--font-family` value and bundle the TTFs.
- **No Figma link provided.** All design context comes from the codebase. If a Figma file exists, sharing it would let us cross-check Hero floating-card positions and the credit-card mockup colors against the source of truth.
- **No `.svg` or `.png` brand assets in the repo.** The "F" mark is recreated in CSS/SVG here. If a real logo file exists, swap `assets/logo.svg`.
- **Light theme is partial.** Only the landing Features section uses a light background (`#F8F8F8`) — there's no full light-mode token set. If the product needs full light-mode support later, this system would need to grow.
