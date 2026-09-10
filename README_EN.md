# Make Up a Story

[中文](README.md)

A lightweight, mobile-first fill-in-the-blank storytelling game built for delightfully unexpected results. It is designed for the Xiaohongshu Mini Tool container and also runs as a standalone web app.

**Development:** This project was built and iterated with Codex. Multiple versions were developed, tested, and released through the REDnote Mini Tool platform before this GitHub repository was created. As a result, the number of commits in this repository does not represent the project's full development and iteration history.

## How it works

Players answer one short prompt at a time without seeing the full story. Once every blank has been filled, the game inserts the answers into a randomly selected story and reveals the result as a receipt-style printout.

- 365 locally stored story templates
- Equal-probability, no-repeat story selection within each full cycle
- One-question-at-a-time mobile input flow
- Typewriter-style story reveal
- Save the finished story as an image
- No account, backend, cloud database, or real-time AI generation

## Run locally

Requirements: Node.js and pnpm.

```bash
pnpm install
pnpm dev
```

## Build the web app

```bash
pnpm build
```

The production files are generated in `dist/`.

## Build and validate the Xiaohongshu Mini Tool package

```bash
pnpm build:minitool
pnpm check:minitool
```

The packaged Mini Tool files are generated locally and are excluded from version control.

## Project structure

- `src/App.jsx` — game flow and interaction logic
- `src/styles.css` — responsive visual design
- `src/data/` — story templates and the generated story library
- `scripts/generate-final-stories.mjs` — generates the reviewed runtime library
- `scripts/build-minitool.mjs` — creates the Mini Tool package
- `scripts/check-minitool.mjs` — validates the packaged output

Story content is kept separate from the interface. The app reads its runtime catalog from `src/data/finalStories.js`.
