# Eduki — base React + Vite + Tailwind v4

## Démarrage
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Déploiement GitHub Pages
1) Active **Pages** sur la repo (source: GitHub Actions).
2) Pousse sur `main`, le workflow va:
   - builder avec `BASE_PATH=/<nom-du-repo>/`
   - déployer `dist/` sur Pages.

> Pas besoin de `tailwind.config.js` en v4. Si tu en crées un, ajoute `@config "./tailwind.config.js";` en tête de `src/index.css`.
