# Design System

## Direction

Apple-inspired minimal product UI with a literary thermal-receipt reveal. Pale neutral beige surrounds an almost-white paper artifact; typography, whitespace, and precise motion carry the experience.

## Color

- Background: `oklch(0.955 0.012 82)`
- Paper: `oklch(0.985 0.006 82)`
- Ink: `oklch(0.145 0.006 70)`
- Secondary ink: `oklch(0.43 0.008 70)`
- Quiet line: `oklch(0.78 0.008 80)`
- Focus: `oklch(0.59 0.19 254)` (accessibility state only)

## Typography

- Interface: system Chinese sans-serif stack with Apple system fonts first.
- Receipt: system monospace stack for metadata and body rhythm.
- Scale: 0.75rem metadata, 1rem body, 1.25rem lead, 2rem question, 3rem title.

## Layout

- 4px spacing foundation; primary rhythm uses 8, 12, 16, 24, 32, 48, 64 and 96px.
- Mobile-first single-column layout; content width 560px, receipt width 440px.
- Respect safe-area insets and preserve generous vertical whitespace.

## Components

- Buttons are rectangular, black, and compact with subtle 2px corners.
- Inputs are borderless except for a single underline.
- Receipt is the only card-like surface, with restrained paper texture and torn edges.

## Motion

- Screen transitions: 220ms ease-out fade/translate.
- Story typewriter: 45ms per character, one pass, visible cursor.
- Reduced motion: instant screen changes and immediate full story rendering.
