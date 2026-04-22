# Design System Specification: The Empathetic Guardian

## 1. Overview & Creative North Star
The design system is built upon the **"Empathetic Guardian"** Creative North Star. In the context of medical pre-consultation for middle-aged and elderly users, "standard" UI often feels clinical and cold. This system moves beyond the template-driven look to create a **High-End Editorial** experience that feels like a premium, personalized health journal rather than a digital form.

We achieve this through **Organic Structure**: breaking the rigid grid with intentional white space, asymmetrical headers, and layered surfaces that guide the eye naturally. The goal is to reduce cognitive load while projecting an image of quiet authority and unwavering trustworthiness.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
The color palette centers on **Medical Cyan (#2C7DA0)**, but is applied through a lens of sophisticated layering rather than flat blocks.

### The "No-Line" Rule
To maintain a premium, editorial feel, **1px solid borders are strictly prohibited** for sectioning. Boundaries must be defined through background color shifts or tonal transitions.
- Use `surface_container_low` for the page background.
- Use `surface_container_lowest` (Pure White) for primary interactive cards.
- Use `surface_container_high` to define header regions or subtle "wells" for secondary data.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of "fine paper." 
- **The Base:** `surface` (#f6fafc).
- **The Content Layer:** `surface_container_lowest` (#ffffff) for card elements. This provides a "lift" through contrast rather than lines.
- **The Glass & Gradient Rule:** For floating action buttons or hero headers, use a subtle linear gradient from `primary` (#006485) to `primary_container` (#2C7DA0) at a 135-degree angle. This adds "soul" and prevents the medical cyan from looking stagnant.

---

## 3. Typography: Editorial Authority
We utilize two distinct families to balance readability with high-end aesthetics. 

- **Display & Headlines (Lexend):** A geometric sans-serif chosen for its exceptional clarity and friendly, open counters. Perfect for elderly users who need immediate visual anchors.
- **Body & Labels (Public Sans):** A neutral, strong sans-serif that ensures medical data remains legible even at smaller scales.

### Hierarchy for Accessibility
- **The "Lead-In" Style:** Large headlines (`headline-lg`) should be used for section titles to provide clear orientation. 
- **The "Data Hero" Style:** Important medical status or numbers should use `display-sm` to ensure they are the first thing a user sees.
- **Line Height:** All body text must maintain a minimum line-height of 1.5x the font size to prevent "text crowding" for users with declining vision.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often "dirty." This system uses **Ambient Light** and **Tonal Stacking**.

- **The Layering Principle:** Depth is achieved by placing a `surface_container_lowest` card on top of a `surface_container_low` background. The slight shift in brightness creates a natural "edge."
- **Ambient Shadows:** When a card must float (e.g., an urgent notification), use a shadow color tinted with the primary hue: `rgba(0, 102, 136, 0.06)` with a 32px blur and 8px Y-offset.
- **The "Ghost Border" Fallback:** If a boundary is strictly required for accessibility in forms, use `outline_variant` at **15% opacity**. It should be felt, not seen.
- **Glassmorphism:** Navigation bars should utilize `surface` at 80% opacity with a `20px` backdrop-blur. This allows content to bleed through softly, preventing the UI from feeling "boxed in."

---

## 5. Components: Tactile & Accessible

### Buttons (Large Touch Targets)
- **Primary:** High-contrast `primary` fill with `on_primary` text. Minimum height: **56px** (Optimized for motor-skill accessibility). Corner radius: `xl` (1.5rem).
- **Secondary:** `secondary_container` fill. Provides a softer "action" for less critical tasks.
- **Tertiary:** No fill; `primary` text. Used for "Cancel" or "Back" to reduce visual noise.

### Informative Status Cards
- **Structure:** Forbid divider lines. Separate "Heading," "Value," and "Trend" using vertical white space (1rem).
- **Background:** Use `surface_container_lowest` with a `lg` (1rem) corner radius.
- **Visual Cue:** Use a vertical "Intent Bar" (4px wide) on the left side of the card using `primary` (for normal) or `error` (for urgent) to signal status without words.

### Input Fields (The "Soft Well")
- **Style:** Avoid the "box" look. Use a `surface_container_highest` background with no border. 
- **Active State:** On focus, the background shifts to `surface_container_lowest` with a 2px `primary` ghost-border (20% opacity).
- **Labels:** Always persistent. Never use floating labels that disappear, as they tax short-term memory.

### Accessibility Chips
- Used for selecting symptoms. Minimum height: **48px**. 
- Selected state: `primary_container` with `on_primary_container` text.
- Unselected: `surface_container_highest`.

---

## 6. Do's and Don'ts

### Do:
- **Do** use `xl` (1.5rem) rounded corners for main container cards to convey "Softness" and "Care."
- **Do** leave generous "breathing room" (32px+) between major sections to prevent user overwhelm.
- **Do** use `tertiary` (#84500b) for non-critical warnings—it provides a sophisticated alternative to harsh oranges.

### Don't:
- **Don't** use pure black (#000000) for text. Use `on_surface` (#181c1e) to reduce eye strain.
- **Don't** use 1px dividers between list items. Use an 8px vertical gap and a subtle background shift instead.
- **Don't** use "Center Alignment" for long medical descriptions. Always left-align for easier scanning and "Anchor Point" reading.
- **Don't** hide critical actions behind "More" or "Hamburger" menus. Keep the primary navigation visible and tactile.