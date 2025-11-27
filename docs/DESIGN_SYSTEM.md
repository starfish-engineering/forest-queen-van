# Design System

## Design Philosophy

**"Bloomberg Terminal meets Figma"**

Data-dense but beautiful. Professional enough for institutional investors, modern enough to feel like a product built this decade. The interface should feel like a powerful tool that rewards exploration.

---

## Visual Direction

### Mood

- **Sophisticated** — Not playful, not corporate-bland
- **Data-forward** — Information density is a feature
- **Confident** — Bold choices, not timid defaults
- **Dark-first** — Easier on eyes for extended analysis sessions

### Inspiration

- Bloomberg Terminal (data density, keyboard shortcuts)
- Figma (modern UI, smooth interactions)
- Linear (clean dark mode, attention to detail)
- Stripe Dashboard (data visualization excellence)
- Dark IDE themes (VS Code, Dracula)

---

## Color System

### Primary Palette

```css
:root {
  /* Background layers (darkest to lightest) */
  --bg-primary: #0a0a0f;      /* Main background */
  --bg-secondary: #12121a;     /* Cards, panels */
  --bg-tertiary: #1a1a24;      /* Elevated elements */
  --bg-hover: #22222e;         /* Hover states */
  
  /* Text hierarchy */
  --text-primary: #f0f0f5;     /* Primary text */
  --text-secondary: #a0a0b0;   /* Secondary text */
  --text-tertiary: #606070;    /* Muted text */
  --text-inverse: #0a0a0f;     /* Text on light backgrounds */
  
  /* Accent - Electric Cyan */
  --accent-primary: #00d4ff;
  --accent-primary-dim: #00d4ff33;
  --accent-primary-glow: #00d4ff66;
  
  /* Semantic colors */
  --color-success: #00e676;
  --color-warning: #ffc400;
  --color-danger: #ff5252;
  
  /* Heatmap scale */
  --heat-cold: #2c7bb6;
  --heat-cool: #abd9e9;
  --heat-neutral: #ffffbf;
  --heat-warm: #fdae61;
  --heat-hot: #d7191c;
  
  /* Border */
  --border-subtle: #ffffff10;
  --border-default: #ffffff20;
  --border-strong: #ffffff30;
}
```

### Heatmap Color Scale

```
Investment Activity: Low ─────────────────────────────── High
                     🔵    🔵    🟡    🟠    🔴
                    cold  cool  neutral warm  hot
```

---

## Typography

### Font Stack

```css
:root {
  /* Display / Headlines */
  --font-display: 'Space Mono', 'JetBrains Mono', monospace;
  
  /* UI / Body */
  --font-body: 'DM Sans', 'Satoshi', -apple-system, sans-serif;
  
  /* Data / Numbers */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Type Scale

```css
:root {
  --text-xs: 0.75rem;    /* 12px - labels, badges */
  --text-sm: 0.875rem;   /* 14px - secondary text */
  --text-base: 1rem;     /* 16px - body text */
  --text-lg: 1.125rem;   /* 18px - large body */
  --text-xl: 1.25rem;    /* 20px - card titles */
  --text-2xl: 1.5rem;    /* 24px - section headers */
  --text-3xl: 2rem;      /* 32px - page titles */
  --text-4xl: 2.5rem;    /* 40px - hero numbers */
}
```

### Usage

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Page title | Display | 2xl | 600 |
| Section header | Body | xl | 600 |
| Card title | Body | lg | 500 |
| Body text | Body | base | 400 |
| Labels | Body | sm | 500 |
| Data values | Mono | varies | 500 |
| Score numbers | Mono | 4xl | 700 |

---

## Spacing System

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.5rem;    /* 24px */
  --space-6: 2rem;      /* 32px */
  --space-8: 3rem;      /* 48px */
  --space-10: 4rem;     /* 64px */
}
```

---

## Components

### Search Bar

```
┌─────────────────────────────────────────────────────────┐
│  🔍  Enter an NYC address...                       [⌘K] │
└─────────────────────────────────────────────────────────┘

Specs:
- Height: 48px
- Background: var(--bg-secondary)
- Border: 1px solid var(--border-default)
- Border-radius: 8px
- Padding: 0 16px
- Font: var(--font-body), 16px
- Focus: border-color: var(--accent-primary), box-shadow: 0 0 0 3px var(--accent-primary-dim)
```

### Filter Panel

```
┌─────────────────────────────────────┐
│  FILTERS                       [×]  │
├─────────────────────────────────────┤
│                                     │
│  ▼ 🏗️ Building Permits        (234)│
│                                     │
│     ☑ Multifamily Housing      (89)│
│     ☑ Major Renovations        (67)│
│     ☐ Commercial TI            (45)│
│                                     │
└─────────────────────────────────────┘

Specs:
- Width: 280px
- Background: var(--bg-secondary)
- Border-radius: 12px
- Header: 48px height, border-bottom
- Padding: 16px
- Checkboxes: 20x20px, accent color when checked
```

### Time Horizon Toggle

```
┌─────────────────────────────────────┐
│  ┌─────────┬─────────┬─────────┐   │
│  │   6mo   │   1yr   │   3yr   │   │
│  │  ████   │         │         │   │
│  └─────────┴─────────┴─────────┘   │
└─────────────────────────────────────┘

Specs:
- Height: 36px
- Background: var(--bg-tertiary)
- Border-radius: 8px
- Active segment: var(--accent-primary) background, var(--text-inverse) text
- Inactive: transparent background, var(--text-secondary) text
- Transition: 150ms ease
```

### Score Display

```
┌─────────────────────────────────────┐
│                                     │
│            ╭───────╮                │
│            │  72   │                │
│            ╰───────╯                │
│        Above Average                │
│                                     │
│  ████████████████░░░░░░░░░ 72/100  │
│                                     │
└─────────────────────────────────────┘

Specs:
- Score number: var(--font-mono), 48px, bold
- Label: var(--font-body), 14px, var(--text-secondary)
- Progress bar: 8px height, var(--accent-primary) fill
- Container: var(--bg-secondary), 16px padding, 12px radius
```

### Detail Drawer

```
┌─────────────────────────────────────────────────────────┐
│                                                    [×]  │
│  🏗️ BUILDING PERMIT                                    │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  DOB-2024-001234                                        │
│  Alteration Type 1                                      │
│                                                         │
│  📍 456 Oak Avenue, Brooklyn, NY 11201                  │
│     0.3 miles from subject property                     │
│                                                         │
└─────────────────────────────────────────────────────────┘

Specs:
- Width: 400px (slides in from right)
- Background: var(--bg-secondary)
- Border-left: 1px solid var(--border-default)
- Header: 56px, border-bottom
- Content padding: 24px
- Slide animation: 200ms ease-out
- Backdrop: semi-transparent overlay on map
```

### Permit Card (List View)

```
┌─────────────────────────────────────────────────────────┐
│  🏗️ 456 Oak Ave           0.3 mi    $450K    Mar 2024  │
│     HVAC + Roof replacement                             │
└─────────────────────────────────────────────────────────┘

Specs:
- Height: 64px
- Background: var(--bg-secondary)
- Border-radius: 8px
- Padding: 12px 16px
- Hover: background var(--bg-hover)
- Icon: 24x24px
- Distance badge: var(--accent-primary-dim) background
```

---

## Map Styling

### Base Map

Use Mapbox Studio dark style as starting point, customized:

```javascript
const mapStyle = {
  version: 8,
  name: 'CapEx Scout Dark',
  sources: { /* ... */ },
  layers: [
    // Background
    { id: 'background', type: 'background', paint: { 'background-color': '#0a0a0f' } },
    
    // Water
    { id: 'water', type: 'fill', paint: { 'fill-color': '#12121a' } },
    
    // Land
    { id: 'land', type: 'fill', paint: { 'fill-color': '#0f0f15' } },
    
    // Roads
    { id: 'roads', type: 'line', paint: { 'line-color': '#1a1a24', 'line-width': 1 } },
    
    // Buildings
    { id: 'buildings', type: 'fill', paint: { 'fill-color': '#12121a', 'fill-opacity': 0.8 } },
    
    // Labels
    { id: 'labels', type: 'symbol', paint: { 'text-color': '#606070' } }
  ]
};
```

### Census Tract Styling

```javascript
// Subject tract
{
  'fill-color': '#00d4ff',
  'fill-opacity': 0.15,
  'stroke-color': '#00d4ff',
  'stroke-width': 2
}

// Adjacent tract
{
  'fill-color': '#ffffff',
  'fill-opacity': 0.05,
  'stroke-color': '#ffffff',
  'stroke-width': 1,
  'stroke-dasharray': [4, 4]
}

// Hover state
{
  'fill-opacity': 0.25
}
```

### Markers

```javascript
// Permit marker
const markerConfig = {
  building: { color: '#00d4ff', icon: 'construction' },
  business: { color: '#00e676', icon: 'store' },
  restaurant: { color: '#ffc400', icon: 'restaurant' },
  liquor: { color: '#e040fb', icon: 'wine' }
};

// Cluster styling
{
  'circle-color': '#00d4ff',
  'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 50, 40],
  'circle-stroke-color': '#00d4ff33',
  'circle-stroke-width': 4
}
```

---

## Animation & Motion

### Principles

1. **Purposeful** — Animation should guide attention, not distract
2. **Quick** — Most transitions under 200ms
3. **Smooth** — Use easing, never linear for UI elements

### Timing

```css
:root {
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  
  --ease-out: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Key Animations

| Element | Trigger | Animation |
|---------|---------|-----------|
| Drawer open | Click marker | Slide in from right, 200ms |
| Filter change | Toggle filter | Fade heatmap, 150ms |
| Time horizon | Toggle change | Crossfade data, 200ms |
| Marker hover | Mouse enter | Scale 1.2, 100ms |
| Search results | Results load | Stagger fade in, 50ms delay |
| Score change | Data update | Count up animation, 500ms |

### Page Load Sequence

```
0ms    - Map container fades in
100ms  - Base map tiles load
300ms  - Search bar slides down from top
400ms  - Filter panel fades in from left
500ms  - Heatmap layer fades in
```

---

## Responsive Behavior

### Breakpoints

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
```

### Layout Adaptations

| Viewport | Layout |
|----------|--------|
| Desktop (>1024px) | Full map, side panels |
| Tablet (768-1024px) | Full map, collapsible panels |
| Mobile (<768px) | Stacked: search top, map middle, drawer bottom sheet |

### Mobile Considerations

- Search bar fixed at top
- Filters in bottom sheet
- Detail drawer becomes bottom sheet (60% height)
- Larger touch targets (min 44px)
- Simplified heatmap (less density)

---

## Accessibility

### Color Contrast

All text meets WCAG AA standards:
- Primary text on primary bg: 15.8:1 ✓
- Secondary text on primary bg: 7.2:1 ✓
- Accent on primary bg: 8.1:1 ✓

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
```

### Screen Reader Support

- Proper heading hierarchy
- ARIA labels on interactive elements
- Alt text for map markers
- Announce filter changes
- Skip to main content link

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `/` or `⌘K` | Focus search |
| `Escape` | Close drawer/modal |
| `Tab` | Navigate focusable elements |
| `Arrow keys` | Navigate filter list |
| `Enter` | Toggle filter / select item |

