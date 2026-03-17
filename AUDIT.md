# Audit du dépôt Eduki — 2026-03-17

## Vue d'ensemble

**Eduki** est une application éducative React pour enfants (Maternelle → CE2) avec 5 exercices interactifs.

**Stack :** React 18 + Vite 5 + Tailwind CSS v4 + React Router 7, déployé sur GitHub Pages.

## Structure du projet

| Dossier | Contenu |
|---|---|
| `src/exercises/` | 5 exercices (LetterFind, LetterSound, WordRecompose, FeedRabbit, NumberMatch) |
| `src/pages/` | Home, ExerciseRunner, 5 pages de réglages |
| `src/components/` | EnTete, CarteExercice, BarreRecherche, FiltreNiveau |
| `src/contexts/` | ThemeContext (dark mode) |
| `src/data/` | Registre des exercices |
| `src/Lettersound/` | 26 fichiers audio .m4a (A-Z) |
| `.github/workflows/` | CI/CD deploy sur GitHub Pages |

## Bugs critiques

### 1. Fuite mémoire — LetterSound.jsx

Les event listeners (`pointerdown`, `keydown`, `touchstart`) pour débloquer l'audio sont ajoutés sans nettoyage au démontage du composant. Chaque remontage accumule de nouveaux listeners.

**Correction :** Ajouter un `return` dans le `useEffect` pour appeler `removeEventListener` sur chaque listener.

### 2. Boucle potentiellement infinie — LetterFind.jsx

L'algorithme `placePointsNoOverlap()` réduit progressivement la tolérance de distance (`currentMin * 0.92`) sans seuil de sortie robuste pour les grandes valeurs de `count` (30 items).

**Correction :** Ajouter un compteur de réductions maximal ou un seuil plancher plus élevé.

## Problèmes importants

### 3. Code mort

`BarreRecherche.jsx` et `FiltreNiveau.jsx` sont importés dans `Home.jsx` mais jamais rendus.

### 4. Duplication de code

Les fonctions utilitaires (`loadJSON`, `saveJSON`, sanitization) sont dupliquées dans chaque exercice au lieu d'être mutualisées dans un module `src/utils/`.

### 5. Styles inline dupliqués

`FeedRabbit.jsx` contient un tag `<style>` inline avec l'animation `carrotShake`, déjà définie dans `index.css` (violation DRY).

### 6. Pas de Error Boundary

Aucun composant de fallback en cas de crash d'un exercice.

### 7. Aucun test

Pas de tests unitaires ni d'intégration. Le pipeline CI/CD ne fait que builder.

## Points positifs

- Architecture composants bien structurée
- Dark mode complet avec persistence localStorage
- Excellent support `prefers-reduced-motion` pour l'accessibilité
- Validation robuste des réglages avec fonctions `sanitize*()`
- Gestion sophistiquée de l'audio iOS/PWA dans LetterSound
- Bonne UX des pages de réglages avec descriptions claires
- CI/CD fonctionnel avec GitHub Pages
- Pas de vulnérabilité XSS détectée (échappement React natif)

## Recommandations par priorité

| Priorité | Action |
|---|---|
| 🔴 Critique | Corriger la fuite mémoire des event listeners dans `LetterSound.jsx` |
| 🔴 Critique | Ajouter un garde-fou à la boucle de placement dans `LetterFind.jsx` |
| 🟠 Haute | Supprimer ou implémenter BarreRecherche et FiltreNiveau |
| 🟠 Haute | Extraire les utilitaires partagés dans `src/utils/` |
| 🟠 Haute | Ajouter un Error Boundary dans `App.jsx` |
| 🟡 Moyenne | Ajouter des tests pour les fonctions de sanitization |
| 🟡 Moyenne | Lazy-load des exercices dans ExerciseRunner |
| 🟡 Moyenne | Ajouter des `aria-label` sur les éléments emoji |
| 🔵 Basse | Implémenter la recherche/filtre sur la page d'accueil |

## Note globale : 7.5/10

L'application est bien conçue et fonctionnelle. Les deux bugs critiques doivent être corrigés avant mise en production. La qualité du code gagnerait en maintenabilité avec une mutualisation des utilitaires et l'ajout de tests.
