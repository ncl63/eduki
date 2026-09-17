# Eduki

Site d’exercices éducatifs, repris depuis `ncl63/eduki`, commit `9563ab9`.
Le socle, l’accueil et la présentation des exercices et réglages sont harmonisés. Les dispositions, dimensions pédagogiques, contrôles et comportements des exercices du dépôt sont conservés.

## Démarrer

Node.js 22.12 ou plus récent et npm sont nécessaires.

```sh
npm ci
npm run dev
```

Ouvrir http://localhost:5173/eduki/ dans un navigateur. Ne pas ouvrir index.html directement.

## Vérifier

```sh
npm run check
```

Cette commande lance ESLint, construit le site puis exécute les tests Playwright sur le build de production, avec le sous-chemin GitHub Pages.
Sur Windows, les tests utilisent Microsoft Edge installé. Sur Linux, installer Chromium avant les tests :

```sh
npx playwright install --with-deps chromium
```

Le rapport est dans `playwright-report/index.html` et les captures dans `test-results/`.
Les tests de format iPhone utilisent une émulation Chromium : ils ne remplacent pas une vérification sur Safari iOS réel.

## Architecture

- React 18 conservé ; Vite 7 et Tailwind 4 actualisés.
- `src/App.jsx` : routes et chargement différé des pages.
- `src/data/exercises.js` : catalogue unique des quatre exercices.
- `src/pages/Home.jsx` : accueil, filtres et mode d’emploi.
- `src/components/EnTete.jsx`, `CarteExercice.jsx`, `Icon.jsx` : composants de l’accueil.
- `src/styles/shell.css` : tokens visuels, composants et adaptations mobile de l’accueil.
- `src/index.css` : Tailwind et styles existants des exercices.
- `src/contexts/ThemeContext.jsx` : thème système initial et préférence locale, utilisable même si le stockage est bloqué.
- `src/exercises/` et pages de réglages : fonctionnalités d’origine, sans dépendance aux profils.

La police est servie localement. L’accueil ne charge pas les fichiers audio ni les modules des exercices avant leur ouverture. Aucun compte, profil ou suivi personnel n’est proposé. Les anciennes données de profils stockées sur un appareil ne sont pas effacées automatiquement.

## Navigation et hébergement

Les routes utilisent le fragment d’URL, par exemple `/eduki/#/ex/letter-find`, pour permettre les rechargements et liens directs sur un hébergement statique sans réécriture serveur. Les anciens liens sans `#` doivent être remplacés.

Le sous-chemin par défaut est `/eduki/`. La variable `BASE_PATH` peut le remplacer lors du build pour un autre hébergement. Aucun service worker ni mode hors ligne n’est ajouté.

Le workflow GitHub Actions contrôle les changements avant le déploiement de `main` et sur les pull requests. Il installe les dépendances avec `npm ci`, exécute lint/build/tests et conserve le rapport. Le site publié est accessible sur https://ncl63.github.io/eduki/.

## Périmètre restant

Les interfaces des exercices utilisent la palette partagée de src/styles/activities.css. Elles conservent leur disposition et certains mécanismes ludiques d’origine. Ils seront traités un par un. Les tests actuels couvrent le nouveau socle et l’accès aux exercices ; ils ne certifient ni tous les scénarios pédagogiques, ni le son sur iPhone réel.
