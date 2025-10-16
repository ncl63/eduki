# travail-matija


## Structure (v2 – nettoyage)

```
src/
  app/
    App.jsx            # Wrapper et futur router/menu
  games/
    letters/
      LettersGame.jsx  # Code actuel du jeu (déplacé)
  components/          # (à remplir) UI réutilisable: Button, Toggle, Slider, etc.
  hooks/
    useLocalStorage.js # Hook LS générique
  lib/                 # Helpers utilitaires partagés
```

### Prochaine étape
- Découper `LettersGame.jsx` en composants (HUD, SettingsPane, Bubble, etc.).
- Extraire la config des lettres dans un JSON (ou JS) pour créer des "packs d'exercices".
- Ajouter un sélecteur d'exercice sur l'écran d'accueil.
- Ajouter des tests légers (Vitest) sur les fonctions utilitaires (placement, collisions).
