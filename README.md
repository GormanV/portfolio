# Tom Owen — Portfolio

Dune-themed personal portfolio built with React + Vite + Three.js.

## Stack

- **React 18** — component architecture, hooks
- **Three.js** — 3D planet with custom GLSL shaders
- **Vite** — build tooling

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
    Contact.jsx
    Experience.jsx
    Skills.jsx
  data/
    regions.js          # Page/region metadata
    shaders.js          # GLSL vertex & fragment shaders
  hooks/
    useLabel.js         # Canvas location label animation
    usePlanet.js        # Three.js planet setup & animation
    useStars.js         # Canvas star field animation
```
