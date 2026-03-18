# CLAUDE.md — Contexte projet Eduki

## Qu'est-ce qu'Eduki ?

Site web d'exercices éducatifs sur mesure créé pour **Matija**, un enfant accompagné par un AESH/animateur en milieu scolaire. Le site doit être simple, bienveillant, et adapté aux besoins spécifiques de l'enfant.

- **Site** : https://ncl63.github.io/eduki/
- **Repo** : https://github.com/ncl63/eduki

## Public cible

- Un enfant (Matija) avec des besoins éducatifs particuliers
- Exercices centrés sur la lecture : reconnaissance de lettres et de mots
- Interface pensée pour être utilisée avec ou sans aide de l'adulte accompagnateur

## Commandes

```bash
npm install       # Installer les dépendances
npm run dev       # Serveur de développement (Vite)
npm run build     # Build de production (output: dist/)
npm run preview   # Prévisualiser le build
```

Pas de commande de test ni de lint configurée.

## Stack technique

- **React 18** + **Vite 5** + **Tailwind CSS v4** (sans `tailwind.config.js`)
- **React Router DOM 7** pour le routage côté client
- Déploiement automatique sur **GitHub Pages** via GitHub Actions (push sur `main`)
- Site 100% statique, pas de backend, pas de base de données
- Compatible tablette et mobile en priorité
- `BASE_PATH` injecté en CI pour le sous-répertoire GitHub Pages

## Architecture du projet

```
src/
├── main.jsx                  # Point d'entrée React
├── App.jsx                   # Routeur principal + ErrorBoundary
├── index.css                 # Styles globaux + animations Tailwind v4
├── components/
│   ├── EnTete.jsx            # Header avec navigation et toggle dark mode
│   ├── CarteExercice.jsx     # Carte d'exercice sur la page d'accueil
│   └── ErrorBoundary.jsx     # Capture les crashs avec UI de fallback
├── contexts/
│   └── ThemeContext.jsx       # Dark mode (localStorage + prefers-color-scheme)
├── data/
│   └── exercises.js           # Registre des 5 exercices (id, titre, niveau, description)
├── exercises/                 # Composants autonomes — chacun gère ses propres settings
│   ├── LetterFind.jsx         # Trouve la lettre (recherche visuelle)
│   ├── LetterSound.jsx        # Écoute la lettre (audio m4a + Web Audio API)
│   ├── WordRecompose.jsx      # Recompose le mot (séquencement de lettres)
│   ├── FeedRabbit.jsx         # Nourrir le lapin (numération 1-3, Web Speech API)
│   └── NumberMatch.jsx        # Correspondance de quantités (1-3)
├── pages/
│   ├── Home.jsx               # Page d'accueil (bibliothèque d'exercices)
│   ├── ExerciseRunner.jsx     # Routeur dynamique vers le bon exercice
│   ├── LettersSettings.jsx    # Réglages de LetterFind
│   ├── LetterSoundSettings.jsx
│   ├── WordRecomposeSettings.jsx
│   ├── FeedRabbitSettings.jsx
│   └── NumberMatchSettings.jsx
├── utils/
│   └── storage.js             # Utilitaires partagés (localStorage, clamp, shuffle, etc.)
└── Lettersound/               # 26 fichiers audio A-Z (.m4a)
```

## Patterns et conventions

### Code
- **Français** pour les noms de composants utilisateur (EnTete, CarteExercice), les commentaires, les labels
- **Anglais** pour les noms techniques (state, props, hooks, fonctions utilitaires)
- Pas de TypeScript — tout en JSX
- Imports explicites avec extension `.jsx` / `.js`

### Exercices — pattern commun
Chaque exercice dans `src/exercises/` suit le même pattern :
1. **Constantes** : `SETTINGS_KEY`, `DEFAULT_SETTINGS`
2. **Sanitize** : fonction `sanitize*Settings(raw)` qui valide et normalise les entrées
3. **Load/Save** : fonctions `load*Settings()` / `save*Settings()` utilisant `src/utils/storage.js`
4. **buildRound()** : génère un nouveau round aléatoire
5. **Composant principal** : gère le state du round, le feedback, et les transitions
6. Chaque exercice est autonome et reçoit `{ meta }` en prop depuis ExerciseRunner

### Persistance
- **localStorage** pour tous les réglages et la progression
- Utilitaires mutualisés dans `src/utils/storage.js` : `loadJSON`, `saveJSON`, `loadInt`, `saveInt`, `clamp`, `clampInt`, `clampRatio`, `shuffle`, `shuffleInPlace`, `randomPick`
- Toujours passer par les fonctions `sanitize*` avant de lire/écrire

### Styles
- **Tailwind CSS v4** — pas de fichier `tailwind.config.js`
- Dark mode via classe `.dark` sur `<html>`, géré par `ThemeContext`
- Variante dark : `@variant dark (.dark &)` dans `index.css`
- Animations personnalisées dans `index.css` (pas d'inline `<style>`)
- Toujours respecter `prefers-reduced-motion: reduce` pour les animations
- Couleur principale : indigo. Secondaire : green (succès), red (erreur), amber (avertissement)

## Principes de design & UX

- Interface très claire, épurée, sans surcharge visuelle
- Grosses polices lisibles (minimum 20px)
- Boutons larges et faciles à cliquer / toucher
- Couleurs douces et contrastées (accessibilité WCAG AA minimum)
- Feedback positif et encourageant (sons, animations légères)
- Pas de minuterie stressante sauf si demandé explicitement
- Navigation simple : jamais plus de 2 niveaux de profondeur

## Pièges connus

- **Audio iOS/PWA** : l'audio nécessite une interaction utilisateur pour se débloquer. `LetterSound.jsx` recrée l'élément Audio à chaque playback et gère le bfcache Safari.
- **Tailwind v4** : pas de `tailwind.config.js`. Si tu en crées un, ajoute `@config "./tailwind.config.js"` en tête de `index.css`.
- **GitHub Pages** : le build utilise `BASE_PATH=/<nom-du-repo>/` pour les assets. Le routeur utilise `import.meta.env.BASE_URL` comme basename.

## Règles de développement

### Ce que tu dois faire
1. Identifier et corriger les bugs existants en priorité
2. Ne pas casser ce qui fonctionne déjà
3. Proposer des améliorations progressives, une à la fois
4. Commenter le code en français
5. Toujours expliquer ce que tu modifies et pourquoi
6. Vérifier que le build passe (`npm run build`) après toute modification

### Ce que tu ne dois PAS faire
- Refactoriser entièrement sans accord explicite
- Ajouter des dépendances externes sans demander
- Supprimer des exercices existants
- Ajouter du code complexe ou sur-ingénieré — garder les solutions simples

## Rôles d'analyse

Avant chaque action significative, considérer ces perspectives :

- **@pedagogie** — L'exercice est-il adapté au niveau et aux besoins de Matija ? Le feedback est-il bienveillant et non anxiogène ? La consigne est-elle claire ?
- **@ui** — Le contraste est-il suffisant (WCAG AA) ? Les zones cliquables sont-elles assez grandes ? L'interface est-elle claire sans surcharge ?
- **@code** — Y a-t-il des bugs ? Le site reste-t-il compatible mobile/tablette ? Rien d'existant n'est cassé ?

Format attendu si les rôles sont explicités :
```
@pedagogie ✓ — [observation courte]
@ui ✓ — [observation courte]
@code ✓ — [observation courte]
```
