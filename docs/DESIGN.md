# Design System Document: High-End AI Career Intelligence

## 1. Overview & Creative North Star

### Creative North Star: "The Forensic Architect"
In the world of recruitment, data is often noisy and overwhelming. This design system moves away from the "generic dashboard" aesthetic toward an editorial, high-precision interface—**The Forensic Architect**. It is designed to feel like a high-end investigative tool: clinical, authoritative, and deeply technical, yet sophisticated.

Instead of traditional grids and boxy layouts, we utilize **intentional asymmetry** and **tonal depth**. We break the "template" feel by allowing evidence panels to overlap or sit at varying depths, creating a UI that feels constructed rather than just populated. This system prioritizes high information density without sacrificing the breathing room required for critical decision-making.

---

## 2. Colors & Surface Philosophy

The palette is rooted in deep, obsidian neutrals to minimize eye strain and maximize the "pop" of technical data points.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections or regions. Boundaries must be established through background color shifts or tonal transitions. Use `surface-container-low` against `surface` to create a boundary. Contrast is our architect, not lines.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of smoked glass. 
- **Base Layer:** `surface` (#121315)
- **Primary Layout Blocks:** `surface-container-low` (#1b1c1e)
- **Nested Content/Cards:** `surface-container-highest` (#343537)

### Glassmorphism & Signature Textures
To escape the "flat" feel of standard dark modes, use Glassmorphism for floating elements (e.g., Modals, Hover Tooltips). 
- **Effect:** Apply `surface` at 60% opacity with a 12px-20px `backdrop-blur`.
- **Gradients:** Use a subtle linear gradient on primary CTAs—transitioning from `primary` (#8ed5ff) to `primary-container` (#38bdf8)—to give buttons a tactile, "lit-from-within" quality.

---

## 3. Typography: The Narrative of Accuracy

We use a dual-typeface system to distinguish between **Human Intelligence** and **Machine Evidence**.

- **Primary UI & Headings (Inter):** Clean, neutral, and highly legible. This represents the system's "voice" and navigation.
- **Data & Evidence (JetBrains Mono):** Used for RAG (Retrieval-Augmented Generation) snippets, confidence scores, and technical metadata. This monospace font signals clinical accuracy and "raw" data processing.

**Editorial Scale:**
- **Display-LG (3.5rem):** Use for hero statistics (e.g., "98% Match").
- **Title-SM (1rem, Inter Bold):** Use for section headers.
- **Label-SM (0.6875rem, JetBrains Mono):** Use for source badges and timestamps.

---

## 4. Elevation & Depth: Tonal Layering

Depth is achieved through "Tonal Stacking" rather than structural shadows.

1.  **The Layering Principle:** Place a `surface-container-lowest` (#0d0e10) card inside a `surface-container-low` (#1b1c1e) section to create a soft, "sunken" effect. Conversely, use `surface-container-high` to "lift" a component.
2.  **Ambient Shadows:** For floating elements, use extra-diffused shadows.
    *   *Specs:* `0px 16px 32px rgba(0, 0, 0, 0.4)`. The shadow should feel like a soft glow rather than a dark smear.
3.  **The Ghost Border Fallback:** If a border is required for accessibility, use the `outline-variant` token at 15% opacity. Never use 100% opaque borders.

---

## 5. Components

### Minimalist Evidence Cards
- **Radius:** `lg` (0.5rem).
- **Background:** `surface-container-low`.
- **Interaction:** On hover, shift background to `surface-container-high`. No border change.
- **Spacing:** Use `spacing-4` (0.9rem) for internal padding.

### Float Value Progress Bars (0.0 - 1.0)
- **Track:** `surface-container-highest` (height: 4px).
- **Indicator:** `secondary` (#44e2cd) for positive values, `tertiary` (#ffc176) for warnings.
- **Aesthetic:** No rounded caps on the bar; use a sharp `none` or `sm` radius to maintain a technical "meter" look.

### RAG Evidence Panels
- **Container:** `surface-container-lowest` with a "Ghost Border" left-accent of 2px `primary`.
- **Typography:** Content in `body-sm` (JetBrains Mono).
- **Source Badges:** Pill-shaped (`full` radius) using `on-secondary-container` text on a `secondary_container` background.

### Buttons
- **Primary:** Gradient from `primary` to `primary_container`. Text: `on_primary` (Bold).
- **Secondary:** Transparent background with a `Ghost Border`. Text: `primary`.
- **Tertiary:** Text-only, JetBrains Mono, all-caps, `label-md` sizing.

---

## 6. Do's and Don'ts

### Do
*   **Do** use `spacing-8` (1.75rem) or `spacing-10` (2.25rem) to separate major sections.
*   **Do** use asymmetry—for example, a wide Evidence Panel on the left paired with a slim Data Sidebar on the right.
*   **Do** ensure all data visualizations (charts/bars) meet WCAG AA contrast against their specific container background.

### Don't
*   **Don't** use 1px dividers. Use a 2px `surface-container-highest` strip or vertical whitespace.
*   **Don't** use generic "Drop Shadows." Use the Tonal Layering principle first.
*   **Don't** use Inter for raw data. If it’s a value from the AI, it belongs in JetBrains Mono.
*   **Don't** use bright white (#FFFFFF). Use `on_surface` (#e3e2e5) to maintain the premium dark-mode aesthetic.

---

## 7. Spacing & Geometry

This system is built on a **4px base scale**. All margins, paddings, and component heights must be multiples of this base.

*   **Nano-spacing:** `0.5` (0.1rem) to `1.5` (0.3rem) for tight label grouping.
*   **Layout-spacing:** `6` (1.3rem) to `12` (2.75rem) for container gutters.

**Radius Scale:**
- `sm` (0.125rem) for checkboxes and small badges.
- `lg` (0.5rem) for primary cards and modal containers.