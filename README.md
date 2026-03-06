# Tom Owen — Portfolio

Dune-themed personal portfolio built with React + Vite + Three.js.

Live site: [tom-owen-dev.netlify.app](https://tom-owen-dev.netlify.app)

---

> **⚠️ AI-Assisted Project**
>
> This portfolio was built using **[Claude Code](https://claude.ai/claude-code)** — Anthropic's AI-powered CLI tool — with **Claude Sonnet** as the coding assistant. The design concept, written content, and ideas are Tom's own. The implementation was pair-programmed with Claude: React components, GLSL planet shaders, Three.js animations, CSS layout, and form validation were all developed through conversation with the model.
>
> Built as a learning exercise exploring AI-assisted web development. Not intended for commercial use.

---

## Stack

- **React 18** — component architecture, hooks
- **Three.js** — 3D planet with custom GLSL shaders and bump mapping
- **Vite** — build tooling
- **Netlify** — hosting + form handling (auto-deploys on push to `main`)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The `dist/` folder can be deployed to any static host (Netlify, Vercel, etc.).

## Project Structure

```
src/
  App.jsx               # Root component, navigation state
  index.css             # Global styles & CSS variables
  main.jsx              # Entry point
  components/
    About.jsx
    Beyond.jsx
    Contact.jsx         # Netlify Forms + client-side validation
    Experience.jsx
    Skills.jsx
  data/
    regions.js          # Page/region metadata (lat/lon for planet rotation)
    shaders.js          # GLSL vertex & fragment shaders
  hooks/
    useLabel.js         # Canvas location label with DPR-aware rendering
    usePlanet.js        # Three.js planet setup & animation loop
    useStars.js         # Canvas star field animation
```
