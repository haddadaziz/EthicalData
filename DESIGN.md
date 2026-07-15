# Ethical Data Security — Design System

## Colors

### Brand
| Token | Hex | Usage |
|-------|-----|-------|
| `blue-600` | `#2563eb` | Primary buttons, links, active states |
| `red-600` | `#dc2626` | Landing CTAs, hover accents |
| `slate-950` | `#020617` | Dark backgrounds, secondary CTAs |
| `slate-955` | `#020a1a` | Custom extra-dark headings |
| `indigo-600` | `#4f46e5` | Formateur mode, secondary brand |

### Neutrals
| Token | Hex | Usage |
|-------|-----|-------|
| `white` | `#ffffff` | Card backgrounds |
| `slate-50` | `#f8fafc` | Page backgrounds |
| `slate-100` | `#f1f5f9` | Dividers, secondary fills |
| `slate-200` | `#e2e8f0` | Borders |
| `slate-400` | `#94a3b8` | Icons, placeholder text |
| `slate-500` | `#64748b` | Secondary text |
| `slate-600` | `#475569` | Muted body text |
| `slate-650` | Custom | Muted text on secondary |
| `slate-700` | `#334155` | Body text |
| `slate-900` | `#0f172a` | Primary text |
| `slate-950` | `#020617` | Headings |

### Semantic
| Token | Hex | Usage |
|-------|-----|-------|
| `emerald-50/500/600/700` | Scale | Success badges, completion |
| `amber-50/500/600/700` | Scale | Warning states, intermediate |
| `rose-50/500/600` | Scale | Errors, delete, advanced level |
| `blue-50/100/200` | Scale | Info backgrounds, borders |

### Gradients
- Primary CTA: `from-blue-600 to-blue-700`
- Landing CTA: `from-red-600 to-red-700`
- Cert CTA card: `from-blue-600 to-blue-800`
- Avatar: `from-blue-600 to-indigo-500`
- Progress: `from-blue-600 to-indigo-500`

## Typography

- **Font**: Poppins via `next/font/google`
- **CSS var**: `--font-poppins` mapped to `font-sans`

| Size | Class | Usage |
|------|-------|-------|
| 8px | `text-[8px]` | Badge labels |
| 9px | `text-[9px]` | Certification badges |
| 10px | `text-[10px]` | Sub-labels, meta |
| 12px | `text-xs` | Body, buttons, nav (most common) |
| 14px | `text-sm` | Section headings |
| 18px | `text-lg` | Card titles |
| 24px | `text-2xl` | Page titles |
| 36px | `text-4xl` | Hero headings |

### Weights
- `font-semibold` (600) — body
- `font-bold` (700) — buttons, nav
- `font-extrabold` (800) — emphasis
- `font-black` (900) — **most common** for headings, buttons, nav links

### Transforms
- `uppercase` + `tracking-wider` or `tracking-widest` — all nav, buttons, labels

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `p-4` | 16px | Card padding |
| `p-5` | 20px | Modal padding |
| `p-6` | 24px | Section padding |
| `p-8` | 32px | Large card padding |
| `gap-3` | 12px | Common flex/grid gap |
| `gap-4` | 16px | Section gaps |
| `gap-6` | 24px | Large gaps |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-md` | 6px | Badge containers |
| `rounded-lg` | 8px | Small elements |
| `rounded-xl` | 12px | **Most common**: buttons, inputs, cards, nav |
| `rounded-2xl` | 16px | Cards, dropdowns, panels |
| `rounded-3xl` | 24px | Major containers, modals |
| `rounded-full` | 9999px | Pills, nav capsules |

## Shadows

| Token | Usage |
|-------|-------|
| `shadow-sm` | Most cards, inputs, nav pills |
| `shadow-md` | Primary buttons, active pagination |
| `shadow-lg` | Hover card elevation |
| `shadow-xl` | Dropdowns, modals |

## Component Patterns

### Card
```
bg-white border border-slate-200/80 rounded-2xl p-4/5/6 shadow-xs
```

### Button — Primary
```
bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider
rounded-xl px-5 py-2.5 shadow-md shadow-blue-600/20 hover:scale-105 active:scale-95
```

### Button — Secondary (dark)
```
bg-slate-950 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider
rounded-xl px-5 py-2.5 shadow-sm hover:shadow-md hover:scale-105 active:scale-95
```

### Button — Outline
```
border border-slate-200/80 rounded-xl text-xs font-bold text-slate-650
hover:text-slate-950 hover:border-slate-300 bg-white shadow-sm
```

### Input
```
w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600
focus:bg-white focus:ring-4 focus:ring-blue-600/5 rounded-xl outline-none
text-xs font-semibold placeholder-slate-400 transition-all
```

### Select/Dropdown Trigger
```
w-full flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200/80
focus:border-blue-600 rounded-xl text-xs font-bold outline-none cursor-pointer
hover:bg-slate-100 transition-all
```

### Dropdown Menu
```
absolute top-full left-0 mt-1.5 z-50 w-full bg-white border border-slate-200/80
rounded-2xl shadow-xl overflow-hidden
```

### Nav — Sidebar
```
flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600
hover:text-slate-955 hover:bg-slate-50
```
Active: `bg-blue-50 text-blue-600 border border-blue-100/90`

### Nav — Landing Pill
```
hidden md:flex items-center gap-1 bg-slate-950/[0.04] border border-slate-200/80
rounded-full px-3 py-1.5 shadow-sm backdrop-blur-xl
```

### Badge
```
bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold
uppercase tracking-wider px-2.5 py-1
```

### Level Badges
- DEBUTANT: `bg-emerald-50 text-emerald-700 border-emerald-200`
- INTERMEDIAIRE: `bg-amber-50 text-amber-700 border-amber-200`
- AVANCE: `bg-rose-50 text-rose-700 border-rose-200`

## Icons

**Library**: Font Awesome Solid via `@fortawesome/react-fontawesome`

All icons are re-exported from `@/components/icons` as React components accepting standard Font Awesome props + `className` and `size` (number).

## Animations

| Pattern | Usage |
|---------|-------|
| `hover:scale-105 active:scale-95` | Button press feedback |
| `hover:-translate-y-0.5` | Card lift |
| `group-hover:-translate-y-1` | Image lift |
| `transition-all duration-200/300` | Standard transition |
| `animate-spin` | Loading spinners |
| `--animate-marquee` | Horizontal scroll (30s) |
