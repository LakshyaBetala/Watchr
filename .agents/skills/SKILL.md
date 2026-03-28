---
name: dashboard-ui-style
description: >
  A design language skill for building sleek, modern, information-dense dashboards
  that are beautiful, readable, and feel premium. Use this skill whenever the user
  is building a dashboard, analytics page, admin panel, SaaS product UI, health/HR/CRM
  interface, or any data-heavy layout. Captures the aesthetic of top-tier Dribbble/Figma
  dashboard designs: dark or light themes, bold KPI cards, minimal yet expressive charts,
  pill navigation, heatmap patterns, and neon accent pops. Trigger this when the user
  mentions "dashboard", "analytics UI", "admin panel", "data cards", "KPI layout",
  "chart design", or wants their frontend to look "clean, modern, sexy".
---

# Dashboard UI Style Skill

A complete design system extracted from four world-class dashboard references.
Use this to build dashboards that are **information-dense yet effortless to read** —
the kind that feel like a premium SaaS product, not a Bootstrap template.

---

## Core Design Philosophy

> **Simple to read. Impossible to ignore.**

These dashboards share one DNA: every pixel earns its place. No decorative fluff.
Instead, visual delight comes from *precision* — perfect spacing, intentional color pops,
type scale that guides the eye without screaming.

**The three rules:**
1. **One accent color per theme.** Everything else is neutral. The accent = the brand.
2. **Numbers are the hero.** Big, bold KPI numbers. Labels are small and muted.
3. **Cards breathe.** Never crowd them. Padding is generous. Borders are subtle.

---

## Color Palettes

### Dark Theme (Images 1 & 2)
```css
:root {
  --bg-base:       #151515;  /* page background */
  --bg-card:       #1e1e1e;  /* card surface */
  --bg-card-hover: #252525;
  --border:        rgba(255,255,255,0.07);
  --text-primary:  #f0f0f0;
  --text-muted:    #6b6b6b;
  --text-subtle:   #3f3f3f;

  /* Pick ONE accent and commit */
  --accent:        #c6f135;  /* neon lime (Image 1 & 4) */
  /* --accent:     #b87fff;  purple-violet (Image 1 charts) */
  /* --accent:     #7ff0b4;  mint green (Image 2) */
  /* --accent:     #f07fbe;  pink/rose (Image 2 secondary) */

  --accent-dim:    color-mix(in srgb, var(--accent) 15%, transparent);
  --positive:      #4ade80;
  --negative:      #f87171;
}
```

### Light Theme (Images 3 & 4)
```css
:root {
  --bg-base:       #f5f5f2;  /* warm off-white */
  --bg-card:       #ffffff;
  --bg-card-hover: #fafafa;
  --border:        rgba(0,0,0,0.07);
  --text-primary:  #111111;
  --text-muted:    #888888;
  --text-subtle:   #cccccc;

  --accent:        #f5c842;  /* golden yellow (Image 3) */
  /* --accent:     #c6f135;  neon lime (Image 4) */

  --accent-dim:    color-mix(in srgb, var(--accent) 18%, transparent);
  --positive:      #22c55e;
  --negative:      #ef4444;
}
```

---

## Typography Scale

Use a **geometric sans** for display numbers (Geist, DM Sans, Sora, Outfit).
Use a **neutral sans** for body/labels (Inter is acceptable here, but match to the display font).

```css
/* KPI Number — the biggest, boldest element on a card */
.kpi-value {
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--text-primary);
}

/* Card Title / Section Label */
.card-title {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}

/* Trend Badge (+42.8%) */
.trend {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--positive);   /* or --negative */
}

/* Body / Supporting text */
.body-sm {
  font-size: 0.8125rem;
  color: var(--text-muted);
}
```

---

## Card Anatomy

Cards are the base unit. Every widget lives inside one.

```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;           /* 12–20px. Never less than 12. */
  padding: 20px 24px;
  position: relative;
  overflow: hidden;
  transition: background 0.2s ease;
}

.card:hover {
  background: var(--bg-card-hover);
}

/* Accent variant — highlighted card (like the yellow "Company" card in Image 1) */
.card--accent {
  background: var(--accent);
  color: #000;                   /* always dark text on bright accent */
}

/* Glass variant — for dark overlays */
.card--glass {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(12px);
  border-color: rgba(255,255,255,0.1);
}
```

### KPI Card Structure (HTML)
```html
<div class="card">
  <div class="card-header">
    <span class="card-icon">👤</span>
    <span class="card-title">With no title</span>
    <button class="card-action">↗</button>
  </div>
  <div class="kpi-value">975,124</div>
  <div class="trend">+42.8% from previous week</div>
</div>
```

### Card Header Row Pattern
```css
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.card-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--accent-dim);
  display: grid;
  place-items: center;
  font-size: 0.875rem;
}

.card-action {
  margin-left: auto;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-base);
  border: 1px solid var(--border);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 0.75rem;
}
```

---

## Navigation Bar

The top nav is a **horizontal pill tab bar**. Active state = filled pill.

```css
.nav-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 99px;
  padding: 4px;
}

.nav-item {
  padding: 6px 16px;
  border-radius: 99px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.nav-item:hover { color: var(--text-primary); }

.nav-item--active {
  background: var(--accent);
  color: #000;                  /* or #fff if accent is dark */
  font-weight: 600;
}

/* Badge on nav items (like the "7" on Analytics in Image 1) */
.nav-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  border-radius: 99px;
  background: var(--accent);
  color: #000;
  font-size: 0.65rem;
  font-weight: 700;
  margin-left: 4px;
  padding: 0 4px;
}
```

---

## Filter / Toggle Pills (Sub-nav)

Below the main nav, use a lighter row of filter pills.

```css
.filter-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-pill {
  padding: 5px 14px;
  border-radius: 99px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-pill:hover { border-color: var(--accent); color: var(--text-primary); }

.filter-pill--active {
  background: var(--accent);
  border-color: var(--accent);
  color: #000;
}
```

---

## Grid Layout System

Dashboard grids use **CSS Grid** with named areas. No Bootstrap.

```css
/* Full dashboard wrapper */
.dashboard {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minmax(0, auto);
  gap: 16px;
  padding: 24px;
  height: 100vh;
  box-sizing: border-box;
}

/* Common column spans */
.col-3  { grid-column: span 3; }
.col-4  { grid-column: span 4; }
.col-6  { grid-column: span 6; }
.col-8  { grid-column: span 8; }
.col-12 { grid-column: span 12; }

/* Responsive collapse */
@media (max-width: 1024px) {
  .col-3, .col-4 { grid-column: span 6; }
  .col-8 { grid-column: span 12; }
}
```

### Typical Layout Zones (Image 1 pattern)
```
[  KPI card  ] [ KPI card ] [ KPI card (accent) ]   ← top row, 3 equal cols
[ Bar chart  ]  [ Heatmap  ]   [ Message panel  ]   ← bottom row, 3 equal cols
```

---

## Charts & Data Visualizations

### Bar Chart Style
- Bars: rounded tops (`border-radius: 6px 6px 0 0`)
- Width: 60–70% of column width
- Color: Use accent for highlighted bar, muted tone for others
- Hatch/diagonal stripes for secondary bars (Image 1 & 2 style)
- Tooltip: floating dark card with big number + date

```css
/* Hatch pattern on bars */
.bar--striped {
  background-image: repeating-linear-gradient(
    -45deg,
    var(--accent) 0,
    var(--accent) 2px,
    transparent 0,
    transparent 50%
  );
  background-size: 8px 8px;
  background-color: var(--accent-dim);
}

/* Active/highlighted bar */
.bar--active {
  background: var(--accent);
  box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 40%, transparent);
}
```

### Chart Tooltip
```css
.chart-tooltip {
  position: absolute;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 0.75rem;
  color: var(--text-muted);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  pointer-events: none;
}

.chart-tooltip .value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
}
```

### Heatmap / Activity Grid (Image 1 Time Visit panel)
```css
.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);  /* days of week */
  gap: 4px;
}

.heatmap-cell {
  aspect-ratio: 1;
  border-radius: 4px;
  background: var(--bg-base);
}

/* Intensity levels */
.heatmap-cell[data-level="1"] { background: color-mix(in srgb, var(--accent) 20%, transparent); }
.heatmap-cell[data-level="2"] { background: color-mix(in srgb, var(--accent) 45%, transparent); }
.heatmap-cell[data-level="3"] { background: color-mix(in srgb, var(--accent) 70%, transparent); }
.heatmap-cell[data-level="4"] { background: var(--accent); }
```

### Donut / Gauge (Image 2 bed occupancy)
```css
/* SVG-based circular gauge */
/* Use stroke-dasharray + stroke-dashoffset for fill percentage */
.gauge-svg {
  transform: rotate(-90deg);
}

.gauge-track {
  fill: none;
  stroke: var(--border);
  stroke-width: 12;
}

.gauge-fill {
  fill: none;
  stroke: var(--accent);
  stroke-width: 12;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Line / Area Chart (Image 4 analytics)
- Very thin line (`stroke-width: 2`)
- Gradient fill below line (opacity 0.1 → 0)
- Dots at data points: small filled circles, accent color
- No heavy grid lines — use dotted or very faint `rgba` lines

---

## Trend Indicators

```html
<!-- Positive -->
<span class="trend trend--up">↑ +42.8%</span>
<!-- Negative -->
<span class="trend trend--down">↓ -18.4%</span>
```

```css
.trend { font-size: 0.72rem; font-weight: 600; display: inline-flex; align-items: center; gap: 3px; }
.trend--up   { color: var(--positive); }
.trend--down { color: var(--negative); }

/* Badge style (for inside a bright accent card) */
.trend-badge {
  background: rgba(0,0,0,0.15);
  border-radius: 99px;
  padding: 2px 8px;
}
```

---

## Progress / Loading Bars

```css
.progress-bar-track {
  height: 6px;
  border-radius: 99px;
  background: var(--bg-base);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 99px;
  background: var(--accent);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Segmented variant (Image 3 onboarding bar) */
.progress-segmented {
  display: grid;
  grid-template-columns: 30% 25% 45%;
  gap: 4px;
  height: 8px;
}
.progress-segmented > div {
  border-radius: 99px;
}
```

---

## Circular Timer Widget (Image 3)

```css
.timer-ring {
  width: 100px;
  height: 100px;
  position: relative;
}

.timer-ring svg {
  transform: rotate(-90deg);
}

.timer-track { stroke: var(--border); fill: none; stroke-width: 8; }
.timer-fill  {
  stroke: var(--accent);
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  /* Use stroke-dasharray: circumference; stroke-dashoffset: (1 - pct) * circumference */
}

.timer-label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-primary);
}
```

---

## Avatar & Profile Elements

```css
/* Stacked avatars (Image 3 meeting attendees) */
.avatar-stack {
  display: flex;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--bg-card);
  object-fit: cover;
  margin-left: -8px;
}

.avatar:first-child { margin-left: 0; }

/* Single avatar with status dot */
.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.avatar-status {
  position: absolute;
  bottom: 0; right: 0;
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--positive);
  border: 2px solid var(--bg-card);
}
```

---

## Message / List Panel (Image 1 right column)

```css
.message-list { display: flex; flex-direction: column; gap: 2px; }

.message-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.message-item:hover { background: var(--bg-base); }

.message-item .meta {
  margin-left: auto;
  font-size: 0.7rem;
  color: var(--text-muted);
}

.message-item .preview {
  font-size: 0.78rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}
```

---

## Search Bar

```css
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 14px;
}

.search-bar input {
  background: none;
  border: none;
  outline: none;
  font-size: 0.8125rem;
  color: var(--text-primary);
  width: 100%;
}

.search-bar input::placeholder { color: var(--text-muted); }

.search-icon { color: var(--text-muted); font-size: 0.875rem; }
```

---

## Dropdown / Selector Pills

```css
/* Like the "Follower ▾" and "Monthly ▾" toggles in Image 1 */
.selector-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 99px;
  background: var(--bg-base);
  border: 1px solid var(--border);
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
}

.selector-pill::after {
  content: '▾';
  font-size: 0.65rem;
  color: var(--text-muted);
}
```

---

## Icon Buttons & Action Row

```css
/* Round icon button — top-right of sections */
.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--bg-base);
  border: 1px solid var(--border);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.icon-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* Add (+) button — right of section titles */
.icon-btn--add {
  background: var(--accent);
  border-color: var(--accent);
  color: #000;
  font-size: 1rem;
  font-weight: 700;
}
```

---

## Micro-interactions & Transitions

```css
/* Every interactive element uses this base transition */
* { transition-property: background, border-color, color, box-shadow, opacity, transform; }

/* Hover lift on cards */
.card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

/* Accent glow on focus/active */
.card--accent:hover {
  box-shadow: 0 0 32px color-mix(in srgb, var(--accent) 30%, transparent);
}

/* Subtle pulse for live data dots */
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.6; transform: scale(1.4); }
}

.live-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--positive);
  animation: pulse 2s ease-in-out infinite;
}
```

---

## Scrollbars (Dark theme)

```css
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 99px;
}
::-webkit-scrollbar-thumb:hover { background: var(--text-subtle); }
```

---

## React Implementation Checklist

When building in React (JSX):

- [ ] Set CSS variables in `:root` via a `<style>` tag or a `globals.css`
- [ ] Use `recharts` for bar/line/area charts — minimal config, thin lines
- [ ] Use `lucide-react` for icons — consistent, clean SVG icons
- [ ] Grid layout via CSS Grid, not flex-only
- [ ] KPI value animation: `useEffect` + `useState` counter from 0 → final value
- [ ] All chart colors pull from CSS variables (use `getComputedStyle` in recharts `<Cell>`)
- [ ] No borders with opacity > 0.1 on dark backgrounds
- [ ] Sidebar (if present): fixed width 60–80px, icon-only, accent dot for active

---

## Common Anti-Patterns to Avoid

| ❌ Don't | ✅ Do instead |
|---|---|
| Use 4+ accent colors | Pick 1 accent, use opacity variants |
| Use card `box-shadow` as the only depth cue | Combine subtle border + background contrast |
| Cram numbers at small font sizes | Make KPIs huge, shrink the label |
| Use `border-radius: 4px` on everything | Use 12–20px on cards, 99px on pills |
| Use `opacity: 0.5` for muted text | Use a proper muted color var |
| Use grid lines in charts | Use faint dotted or remove entirely |
| Make all cards the same visual weight | Use 1 accent card to draw the eye |
| Animate everything constantly | Animate only on mount + hover |

---

## Quick Reference: Image-Specific Patterns

### Image 1 — Social Analytics (Dark + Lime)
- Top KPI row: 3 cards, third one uses `--accent` background
- Chart section labels: monthly/annually toggle = two pills, active = lime
- Message panel: search bar + list, no separate border between items

### Image 2 — Healthcare (Dark + Mint + Pink)
- Two-column layout: left = metrics, right = satisfaction + mood + department
- Donut chart: two concentric rings showing 75% and 64%
- Mood row: emoji array as mini-calendar — use `font-size: 1.2rem` emojis in grid

### Image 3 — HR/People Ops (Light + Yellow)
- Background gradient: very light warm off-white → light yellow in corner
- Profile card: photo takes full height of card, name + role + salary overlaid
- Time tracker: circular SVG ring + digital time display (monospace font)
- Calendar: minimal, show only `Wed` as active column with event cards

### Image 4 — Health Records (White + Neon Lime)
- Navigation: horizontal icon row at top, not pill-based
- Charts: tall bar chart, highlighted bar in lime, rest in dark/black
- Workout section: photograph thumbnail inside a card
- Body visualization: anatomical illustration — use for health/fitness contexts only
