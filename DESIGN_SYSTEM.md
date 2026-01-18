# Conductor's Companion — Design System

**A professional conductor's metronome and orchestral toolkit**
Inspired by Apple's design principles and classical mechanical metronomes

---

## Design Philosophy

### Core Principles

1. **Clarity** — Every element serves a purpose. Typography is legible, icons are precise, and controls are intuitive.
2. **Deference** — The interface recedes to let the musician focus on their work. Content is paramount.
3. **Depth** — Visual layers and realistic motion communicate hierarchy and provide context.
4. **Precision** — Musical tools demand accuracy. Every value, every beat, every note is exact.
5. **Elegance** — Beauty through restraint. Classical proportions meet modern minimalism.

---

## Color Palette

### Dark Mode (Default)
**Primary Usage:** Professional rehearsal spaces, evening practice, reduced eye strain

```
--bg-primary:        #0a0a0f    /* Deep charcoal, rich and sophisticated */
--bg-secondary:      #14141a    /* Card backgrounds, elevated surfaces */
--bg-tertiary:       #1c1c24    /* Hover states, subtle elevation */

--text-primary:      #f5f5f7    /* High contrast, maximum legibility */
--text-secondary:    #98989d    /* Supporting text, labels */
--text-tertiary:     #6e6e73    /* Subtle hints, disabled states */

--accent-gold:       #d4af37    /* Classical elegance, musical warmth */
--accent-hover:      #e8c65a    /* Interactive states */
--accent-muted:      rgba(212, 175, 55, 0.15)  /* Subtle highlights */

--surface-elevated:  rgba(255, 255, 255, 0.05) /* Frosted glass effect */
--border-subtle:     rgba(255, 255, 255, 0.08) /* Delicate separation */
--shadow-depth:      rgba(0, 0, 0, 0.4)        /* Dimensional depth */
```

### Light Mode
**Primary Usage:** Well-lit spaces, outdoor rehearsals, daytime practice

```
--bg-primary:        #ffffff    /* Pure white, clean canvas */
--bg-secondary:      #f5f5f7    /* Gentle gray, subtle depth */
--bg-tertiary:       #e8e8ed    /* Hover states, tactile feedback */

--text-primary:      #1d1d1f    /* Deep black, crisp and clear */
--text-secondary:    #6e6e73    /* Readable gray, refined */
--text-tertiary:     #98989d    /* Subtle text, gentle hierarchy */

--accent-gold:       #b8940f    /* Rich gold, maintains elegance in light */
--accent-hover:      #9a7d0c    /* Deeper gold for interaction */
--accent-muted:      rgba(184, 148, 15, 0.12)  /* Warm highlights */

--surface-elevated:  rgba(0, 0, 0, 0.03)       /* Paper-like elevation */
--border-subtle:     rgba(0, 0, 0, 0.08)       /* Clean separation */
--shadow-depth:      rgba(0, 0, 0, 0.15)       /* Softer shadows */
```

### Semantic Colors
**Applied consistently across both themes**

```
Success:  #30d158  /* Confirmation, positive states */
Warning:  #ff9f0a  /* Caution, attention needed */
Error:    #ff453a  /* Stop, critical alert */
```

---

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display',
             'Helvetica Neue', Arial, sans-serif;
```

### Type Scale
**Meticulously crafted for musical precision**

```
Hero Display:        72px / 400 weight / -0.02em tracking   /* BPM display */
Large Title:         48px / 300 weight / -0.01em tracking   /* Section headers */
Title 1:             32px / 400 weight / 0                  /* Page titles */
Title 2:             24px / 400 weight / 0                  /* Card headers */
Title 3:             20px / 500 weight / 0                  /* Subsections */
Body Large:          18px / 400 weight / 0                  /* Comfortable reading */
Body:                16px / 400 weight / 0                  /* Default body text */
Body Small:          14px / 400 weight / 0                  /* Supporting text */
Caption:             12px / 400 weight / 0.01em tracking    /* Labels, hints */
Caption 2:           11px / 500 weight / 0.02em tracking    /* Micro text */
```

### Musical Typography
**Special treatment for musical elements**

```
Italian Terms:       15px / 400 weight / italic / Palatino fallback
Tempo Marks:         13px / 600 weight / tabular-nums
Beat Indicators:     18px / 300 weight / monospace
Note Names:          16px / 500 weight / 0.05em tracking
```

---

## Spacing System

**8-point grid for perfect alignment**

```
--space-1:   4px     /* Micro spacing, icon padding */
--space-2:   8px     /* Tight spacing, compact layouts */
--space-3:   12px    /* Close relationships */
--space-4:   16px    /* Default spacing, comfortable */
--space-5:   24px    /* Section breathing room */
--space-6:   32px    /* Major separations */
--space-7:   48px    /* Dramatic spacing */
--space-8:   64px    /* Hero sections */
```

---

## The Mechanical Metronome

### Design Concept
A faithful digital recreation of the classical Maelzel pyramid metronome, honoring 200 years of musical tradition.

### Structure

```
┌──────────────┐
│   Pendulum   │  ← Animated weight with tempo indicator
│      ▼       │
│   ╱    ╲    │  ← Pyramid housing with gold accents
│  ╱      ╲   │
│ ╱  Wood  ╲  │  ← Rich wood grain texture (dark mode)
│╱  Grain   ╲ │     or Polished mahogany (light mode)
└────────────┘
│  Markings  │  ← Italian tempo terms on side panel
└────────────┘
```

### Components

**Pendulum**
- Vertical rod: 2px width, subtle metallic gradient
- Weight bob: 24px circle, gold accent color
- Tempo indicator: Small gold triangle pointing to current marking
- Smooth sinusoidal swing animation
- Swing amplitude: ±15° from center

**Housing**
- Isometric pyramid shape using CSS transform
- Dark mode: Deep walnut wood texture (#2a1810 → #4a3020)
- Light mode: Polished mahogany (#6b3410 → #8b4a1a)
- Subtle grain overlay using linear gradients
- Gold trim at base and apex

**Tempo Scale**
- Vertical track: 400px height
- Italian markings aligned to BPM values:
  - Grave (40)
  - Largo (60)
  - Adagio (76)
  - Andante (108)
  - Moderato (120)
  - Allegro (144)
  - Vivace (168)
  - Presto (184)
  - Prestissimo (208)
- Current tempo highlighted with gold glow

---

## Interactive Elements

### Buttons

**Primary (Start/Stop)**
```
Height: 56px
Padding: 0 32px
Border-radius: 28px
Background: accent-gold gradient
Font: 17px / 600 weight / uppercase / 1px letter-spacing
Shadow: 0 4px 16px rgba(accent, 0.3)

Hover: Lift 2px, increase shadow
Active: Scale 0.98, reduce shadow
Transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)
```

**Secondary (Time Signatures)**
```
Height: 48px
Padding: 0 20px
Border: 2px solid border-subtle
Border-radius: 12px
Background: transparent
Font: 16px / 600 weight

Hover: Border → accent-gold, subtle background
Active: Background → accent-gold, Text → bg-primary
```

**Ghost (Presets)**
```
Height: 40px
Padding: 0 16px
Border-radius: 20px
Background: surface-elevated
Font: 14px / 500 weight

Hover: Background → bg-tertiary
Active: Scale 0.96
```

### Sliders

**BPM Slider (Vertical)**
- Track: 400px × 4px
- Background: Gradient from accent-gold (top) to muted (bottom)
- Thumb: 32px circle, accent-gold, 4px border bg-primary
- Thumb shadow: 0 0 20px rgba(accent, 0.6)
- Active: Cursor grab → grabbing, thumb scale 1.1

---

## Animations

### Motion Principles
- **Purposeful**: Every animation conveys information
- **Natural**: Easing mimics physical motion
- **Responsive**: Immediate feedback, smooth execution
- **Restrained**: Subtle, never distracting

### Timing Functions

```css
--ease-standard:    cubic-bezier(0.4, 0.0, 0.2, 1.0)   /* Default, predictable */
--ease-decelerate:  cubic-bezier(0.0, 0.0, 0.2, 1.0)   /* Enter, settling */
--ease-accelerate:  cubic-bezier(0.4, 0.0, 1.0, 1.0)   /* Exit, quickening */
--ease-bounce:      cubic-bezier(0.68, -0.55, 0.265, 1.55)  /* Playful emphasis */
```

### Key Animations

**Pendulum Swing**
```css
@keyframes pendulumSwing {
  0%, 100%  { transform: rotate(-15deg) }
  50%       { transform: rotate(15deg) }
}
Duration: 60000ms / BPM
Timing: ease-in-out (sinusoidal)
```

**Beat Pulse**
```css
@keyframes beatPulse {
  0%    { transform: scale(1); opacity: 1; }
  50%   { transform: scale(1.3); opacity: 0.8; }
  100%  { transform: scale(1); opacity: 1; }
}
Duration: 150ms
Timing: ease-standard
```

**Fade In**
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
Duration: 300ms
Timing: ease-decelerate
```

---

## Accessibility

### Color Contrast
- Text/Background: Minimum 7:1 (AAA)
- Interactive elements: Minimum 4.5:1 (AA Large)
- Accent gold meets WCAG standards in both themes

### Touch Targets
- Minimum: 44 × 44px (Apple guidelines)
- Preferred: 48 × 48px for critical controls
- Spacing: 8px minimum between interactive elements

### Keyboard Navigation
- All controls accessible via Tab
- Visual focus indicators: 3px accent-gold outline with 2px offset
- Enter/Space activates buttons
- Arrow keys adjust sliders

### Motion
- Respect `prefers-reduced-motion`
- Disable pendulum swing animation
- Use instant transitions instead

---

## Layout Grid

### Breakpoints
```
Mobile:     320px - 767px   (Compact, stacked layout)
Tablet:     768px - 1023px  (Intermediate, flexible grid)
Desktop:    1024px+         (Spacious, multi-column)
```

### Container
```
Max-width: 800px
Margin: 0 auto
Padding: 16px (mobile) / 24px (tablet) / 32px (desktop)
```

### Metronome Layout
```
Mobile:  Single column (pendulum above, controls below)
Tablet:  Side-by-side (pendulum left, controls right)
Desktop: Centered pendulum with flanking controls
```

---

## Component Library

### Beat Indicator Dots
```
Inactive:  12px circle, border-subtle, transparent fill
Active:    16px circle, accent-gold fill, pulse animation, glow shadow
Strong:    18px circle, accent-hover fill, enhanced pulse, larger glow
```

### Time Signature Buttons
```
Grid: 3 columns × 2 rows (mobile: 2 × 3)
Gap: 8px
Aspect: Square preferred
States: Outlined → Filled (active)
```

### Tempo Markings
```
Position: Absolute, aligned to scale
Label: Italian term, italic, text-secondary
BPM: Numeric value, tabular-nums, caption size
Active state: Both elements → accent-gold, subtle glow
```

---

## Theme Toggle

### Control
- Position: Top-right header
- Icon: Sun (light) / Moon (dark)
- Size: 40px circle button
- Animation: Rotate 180° on toggle
- Persist: localStorage key `conductor-theme`

### Transition
```css
* {
  transition: background-color 0.3s ease,
              color 0.3s ease,
              border-color 0.3s ease;
}
```

---

## Implementation Notes

### CSS Architecture
```
styles.css
├── 1. CSS Variables (themes)
├── 2. Reset & Base
├── 3. Typography
├── 4. Layout (grid, container)
├── 5. Components (metronome, buttons, etc.)
├── 6. Animations
├── 7. Responsive (media queries)
└── 8. Utilities
```

### Performance
- Use `transform` and `opacity` for animations (GPU accelerated)
- Avoid layout thrashing: batch DOM reads/writes
- Lazy load non-critical assets
- Optimize SVG paths

### Progressive Enhancement
- Core functionality works without JavaScript
- CSS-only theme switching fallback
- Graceful degradation for older browsers

---

## Brand Voice

**Professional yet approachable**
"Precision for the podium, elegance for the ensemble"

**Tone:**
- Confident but not arrogant
- Helpful but not condescending
- Classical but not antiquated
- Technical but not jargon-heavy

---

*Version 1.0 — January 2026*
*Designed for musicians, by musicians*
