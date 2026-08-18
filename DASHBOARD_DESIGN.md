# Dashboard Design System — Reference Analysis

## Reference Image Overview

Dark glassmorphism dashboard with sidebar (icon-only) + main content + right info panel.

---

## Layout

```
┌─────────┬────────────────────────────────┬──────────────┐
│         │  Topbar (search + profile)     │              │
│         ├────────────────────────────────┤              │
│ Sidebar │  Greeting (serif italic)       │              │
│ (icons) ├──────────────────┬─────────────┤  Right       │
│         │  Storage         │  Spaces     │  Panel       │
│         │  (big number)    │  (mini cards│  (team)      │
│         ├──────────────────┴─────────────┤              │
│         │  Uploading Files │ Storage     │              │
│         │  (progress bars) │ Access      │              │
│         │                  │ (table)     │              │
└─────────┴────────────────────────────────┴──────────────┘
```

---

## Topbar

- **Left**: Blue gradient logo + "Dashboard" (serif italic)
- **Center**: Search bar with magnifying glass + "Search space, folder, file etc" + `alt+k` shortcut badge
- **Right**: Monitor icon + Bell icon (red dot) + User avatar + Name + Email
- **Height**: 64px
- **Border-bottom**: 1px solid rgba(255,255,255,0.06)
- **Background**: rgba(11,17,32,0.8) + backdrop-blur-xl
- **Search**: Rounded-full, bg rgba(255,255,255,0.05), border rgba(255,255,255,0.08), height 40px
- **Shortcut badge**: `alt+k` — font-size 11px, bg rgba(255,255,255,0.08), rounded 6px, monospace

---

## Greeting

- Small label: "Good Morning," — font-size 14px, color rgba(255,255,255,0.55)
- Display name: "Georg Johnson" — font-size 32-36px, serif italic, color white
- No icons, no date, just text
- Margin-bottom: 24px

---

## Card System

### Glass Card
```
background: rgba(255,255,255,0.04)
border: 1px solid rgba(255,255,255,0.08)
border-radius: 16px
backdrop-filter: blur(12px)
padding: 24px
```

### Hover State
```
background: rgba(255,255,255,0.06)
border-color: rgba(59,130,246,0.15)
box-shadow: 0 0 30px rgba(59,130,246,0.06)
```

---

## Storage Card

- **Top row**: "Used per month" label (11px, uppercase, tracking-wider) + Month dropdown pill
- **Big number**: "650 GB" — font-size 40px, font-weight 700
- **Bottom row**: "Your Storage" label + "50GB left" right-aligned
- **Progress bar**: height 8px, rounded-full, gradient (red → yellow → green)

---

## Spaces Card

- **Header**: "Spaces" title + description + "Add Space +" button (outline pill)
- **Grid**: 2 columns of mini cards
- **Mini card**:
  - Icon (colored circle) + title + 3-dot menu
  - 3 stat rows: Total / Used / Available
  - Each: value (14px bold white) + label (11px muted)

---

## Uploading Files Card

- **Header**: "Uploading Files" + X close button
- **Items**: File icon (colored) + filename + size + status (checkmark or %)
- **Bottom**: Blue gradient progress bar + "73%" label

---

## Storage Access Card

- **Header**: "Storage Access" + description
- **Table**: File name | Files count | Size | Overlapping avatars | "Share access" button
- **Row separator**: 1px solid rgba(255,255,255,0.06)

---

## Right Panel — Team Structure

- **Width**: ~240px
- **Title**: "Team Structure" — 14px, uppercase, tracking-wider, muted
- **Items**: Avatar (40px circle) + Name (14px bold) + Role (12px, colored)
- **Role colors**: Pink, green, blue, purple
- **Gap**: 16px

---

## Typography

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| "Dashboard" logo | Serif Italic | 18px | 400 | white |
| Greeting label | Sans | 14px | 400 | rgba(255,255,255,0.55) |
| Greeting name | Serif Italic | 32-36px | 400 | white |
| Big stat number | Sans | 40px | 700 | white |
| Card heading | Sans | 16px | 600 | white |
| Stat label | Sans | 11px | 500 | rgba(255,255,255,0.35) |
| Stat value | Sans | 14px | 600 | white |
| Description | Sans | 13px | 400 | rgba(255,255,255,0.55) |
| Button text | Sans | 13px | 500 | varies |

---

## Gradients

```css
/* Card glow border */
background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.05));

/* Progress bar */
background: linear-gradient(90deg, #ef4444, #f59e0b, #22c55e);

/* Hover accent */
background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1));

/* Topbar line */
background: linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent);
```

---

## Shadows & Glows

```css
/* Card outer */
box-shadow: 0 4px 24px rgba(0,0,0,0.2), 0 0 40px rgba(59,130,246,0.04);

/* Card inner highlight */
box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);

/* Hover glow */
box-shadow: 0 0 30px rgba(59,130,246,0.08);
```

---

## Interactive Elements

| Element | Style |
|---------|-------|
| Search bar | Rounded-full, bg rgba(255,255,255,0.05), focus ring blue |
| Shortcut badge | `alt+k` — monospace, bg rgba(255,255,255,0.08) |
| Month dropdown | Rounded pill, bg rgba(255,255,255,0.06), chevron icon |
| "Add Space +" | Outline pill, dashed/solid border, + icon |
| "Share access" | Outline pill, blue text, blue border |
| 3-dot menu | Ghost icon, rgba(255,255,255,0.4) |
| Close (X) | Ghost icon, rgba(255,255,255,0.3) |
| Bell icon | Ghost icon, optional red dot |
| Avatar | Circle, 40px, border 2px solid rgba(255,255,255,0.1) |

---

## Key Design Principles

1. **Glass morphism** — semi-transparent cards with backdrop-blur
2. **Big display numbers** — serif italic for display, sans for body
3. **Gradient accents** — on progress bars, hover states, glows
4. **Right info panel** — for team/contacts context
5. **Search in topbar** — with keyboard shortcut badge
6. **User profile in topbar** — avatar + name + email
7. **Mini stat cards** — label/value pairs inside larger cards
8. **Soft glows** — blue/purple outer glow on hover
9. **Thin separator lines** — between table rows
10. **Overlapping avatars** — with overflow badge for shared items
