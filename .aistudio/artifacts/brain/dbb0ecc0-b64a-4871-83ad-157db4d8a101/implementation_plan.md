# Menswear Flat-Lay Hero Background & Animated Center Dexter Logo

Update the homepage hero section to feature the requested flat-lay menswear composition (knit sweater, wristwatch, beads, denim, woven belt, cognac wallet, and brown leather shoes on natural light oak wood), ensure responsive framing across mobile and PC viewports, and add an animated floating presentation to the centered Dexter logo.

## User Review & Critical Decisions

> [!IMPORTANT]
> The flat-lay image has a natural vertical arrangement with apparel on the left and warm wooden negative space on the right. To ensure it looks stunning on both mobile and wide PC screens:
> - **Mobile Portrait Viewport**: Framed with apparel along the left/top edge and natural wood grain in the center/right, giving the centered Dexter logo ample negative space and razor-sharp clarity.
> - **Desktop Widescreen Viewport**: Widescreen framing preserving the high-end editorial flat-lay aesthetic on the left while providing a clean wooden canvas in the center.
> - **Zero Blur Enclosure**: The logo remains directly merged onto the wooden texture with crisp specular drop shadows and subtle gold ambient glow—no artificial card or background blur container.

- **Confirmed Decision 1**: Menswear flat-lay image featuring casual luxury apparel and accessories on natural light wood.
- **Confirmed Decision 2**: Center-point animated Dexter logo with gentle floating hover, ambient gold pulse, and interactive cursor/touch tilt response.
- **Confirmed Decision 3**: Full cross-device compatibility with touch-safe and `prefers-reduced-motion` compliance.

---

## 1. Overview & Core Concept

- **What It Does**: Replaces the hero background with the flat-lay menswear lifestyle photography and animates the centered Dexter brand logo so it draws immediate focus with modern elegance.
- **Target Audience / Persona**: Style-conscious men and shoppers visiting Dexter Menswear seeking contemporary, premium menswear in Jayankondam.
- **Key Value**: Delivers an immediate, authentic lifestyle fashion aesthetic upon entering the store, conveying curated taste and tactile material quality.

---

## 2. User Experience & Visual Design

### Visual Identity & Theme
- **Background**: Curated flat-lay photography featuring textured heather grey knit sweater, minimalist watch with black strap, amber wooden beads, dark denim jeans with brass button, woven leather belt, cognac leather wallet, and rich brown leather sneakers against blonde oak timber.
- **Atmosphere & Contrast**: Natural soft vignette (`radial-gradient`) in the center to maintain 4.5:1+ contrast for the Dexter logo and CTA buttons without washing out the wood grain.
- **Logo Animation & Motion**:
  - **Floating Hover**: Infinite smooth y-axis floating wave (`y: [-6, 6, -6]`, 4s cycle, easeInOut).
  - **Breathing Glow**: Pulsing gold halo (`filter: drop-shadow(...)` with alternating 25% to 50% opacity).
  - **Dynamic Tilt**: Parallax movement responding to cursor mouse position on desktop and subtle gyroscopic tilt feel.
  - **Reduced Motion Support**: Gracefully falls back to static crisp rendering for users with `prefers-reduced-motion: reduce`.

### Responsive Layout
```
+--------------------------------------------------------------+
| Desktop (1440px): Widescreen Flat-Lay                       |
| [Sweater/Jeans/Shoes]       (DEXTER LOGO)                    |
| [Apparel on Left]        [Floating Animation]   [Wood Grain] |
|                             [CTAs / Tel]                     |
+--------------------------------------------------------------+

+------------------------------------+
| Mobile (390px): Vertical Flat-Lay  |
| [Top/Left: Apparel Elements]       |
|                                    |
|          (DEXTER LOGO)             |
|       [Floating Animation]         |
|        [Shop Collection]           |
|         [Call Button]              |
|                                    |
| [Bottom/Wood Texture Backdrop]     |
+------------------------------------+
```

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Responsive Framing Strategy (Mobile & PC)**
  - *Chosen Approach*: Use responsive CSS background positioning (`object-[left_center]` on mobile and `object-[18%_center]` on desktop) with container scaling so that the clothing items frame the edge naturally while the center remains uncluttered for the logo.
  - *Why*: Flat-lay photography contains detailed accessories that look best when anchored along the edge, leaving clear negative space for brand typography.
  - *Alternatives Considered*: Center-cropping would place clothing items directly behind the logo text, harming legibility.

- **Decision 2: Logo Animation System**
  - *Chosen Approach*: Framer Motion layered animation combining vertical floating oscillation, subtle scale breathing, and ambient gold glow bloom.
  - *Why*: Creates an ultra-premium, alive feel without distracting from readability or interfering with CTA clicks.

---

## 4. Technical Architecture & Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ Hero Section (Index.tsx)                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Responsive Background Layer                             │ │
│ │ - hero-flatlay-menswear.jpg                             │ │
│ │ - Responsive object-fit & position                      │ │
│ │ - Subtle organic contrast gradient                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Center Animated Brand Anchor                            │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ motion.div (Floating Loop: y: [-6, 6, -6])          │ │ │
│ │ │ ┌─────────────────────────────────────────────────┐ │ │ │
│ │ │ │ motion.img (dexter-logo.png)                    │ │ │ │
│ │ │ │ - Dynamic 3D mouse tilt                         │ │ │ │
│ │ │ │ - Specular drop-shadows & breathing gold glow   │ │ │ │
│ │ │ └─────────────────────────────────────────────────┘ │ │ │
│ │ │ <p> Tagline: PREMIUM MENSWEAR · JAYANKONDAM        │ │ │ │
│ │ │ <div CTA Buttons>: Shop Collection & Phone Call    │ │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Verification & Validation Plan

1. **Visual Testing**:
   - Verify on Mobile (375px - 430px) to confirm logo, buttons, and clothing accessories are clearly visible with zero overlap or awkward cropping.
   - Verify on Desktop (1280px - 1920px) to confirm widescreen flat-lay balance and wooden negative space.
2. **Animation Testing**:
   - Verify continuous smooth floating cycle (no jitter or layout reflow).
   - Verify mouse tracking tilt responds fluidly.
   - Verify accessibility fallback when reduced motion is preferred.
3. **Build & Lint Verification**:
   - Run `compile_applet` to ensure TypeScript compilation succeeds.
   - Run `lint_applet` to confirm zero lint errors.
