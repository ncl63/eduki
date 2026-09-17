# Livraison — noyau et accueil Eduki

Date : 16 septembre 2026. Base exclusive : GitHub ncl63/eduki, commit 9563ab9.
Branche locale : codex/accueil-minimaliste. Aucun commit ni déploiement distant effectué.

## Résultat
Accueil responsive, filtre par domaine, quatre cartes, réglages directs, mode d’emploi au clavier, thèmes clair/sombre et police locale. Profils et suivi retirés. React conservé ; outillage Vite/Tailwind actualisé. Pages et exercices chargés à la demande.

## Vérifications effectuées
- npm run check : succès (lint, build de production, 20 tests Playwright).
- Desktop Chromium/Edge et émulation mobile iPhone 13 ; largeurs supplémentaires 320, 375, 768 et 1024 px.
- Filtres, fenêtre d’aide, fermeture Échap et restitution du focus, lien d’évitement, persistance du thème, absence de débordement horizontal, accueil sans stockage local.
- Accès aux quatre exercices, rechargement de leur lien direct, ouverture de leurs réglages, retour en haut à la navigation ; aucune erreur JavaScript dans ces parcours.
- Analyse axe : aucune violation détectée sur l’accueil clair/sombre et la fenêtre d’aide (ceci ne constitue pas une certification d’accessibilité).
- Captures ordinateur et mobile examinées visuellement, correction du contraste et du bloc d’aide mobile.
- npm audit fix : 0 vulnérabilité connue signalée après mise à jour.
- git diff --check : succès.
- Aperçu local : http://127.0.0.1:5173/eduki/ vérifié HTTP 200.

## Limites et effets
- Les exercices conservent leurs visuels et mécanismes d’origine. Les quatre fichiers ont uniquement perdu leurs appels au suivi par profil, plus un nettoyage de variables inutilisées. Leur refonte et les scénarios complets de réponse restent à traiter individuellement.
- Les anciens profils ne sont plus accessibles. Leurs données déjà présentes dans les navigateurs ne sont pas effacées.
- Les nouveaux liens d’exercice contiennent #, par exemple /eduki/#/ex/letter-find. Les anciens liens sans fragment sont à remplacer.
- L’accueil est utilisable lorsque le stockage est bloqué ; la mémorisation du thème ne peut alors pas persister.
- Safari/iPhone physique, restitution audio iOS, accompagnement réel d’un enfant et pipeline GitHub distant non testés.
- Aucun mode hors ligne ajouté.
- L’aperçu 127.0.0.1 fonctionne sur cet ordinateur uniquement.

## Vérification conseillée avant la suite
Ouvrir l’accueil, comparer les deux thèmes, filtrer les exercices, essayer le mode d’emploi puis ouvrir l’activité à refaire en premier. Avant publication, tester la navigation et l’audio sur un véritable iPhone.

## Fichiers modifiés ou ajoutés
- Accueil : src/pages/Home.jsx, src/components/EnTete.jsx, src/components/CarteExercice.jsx, src/components/Icon.jsx, src/styles/shell.css.
- Socle : src/App.jsx, src/main.jsx, src/contexts/ThemeContext.jsx, src/components/RouteEffects.jsx, src/pages/ExerciseRunner.jsx, src/data/exercises.js, index.html, public/favicon.svg.
- Retrait des branchements de profils : src/exercises/LetterFind.jsx, src/exercises/LetterSound.jsx, src/exercises/QuantitySound.jsx, src/exercises/WordRecompose.jsx.
- Outillage : package.json, package-lock.json, vite.config.js, eslint.config.js, playwright.config.js, tests/home.spec.js, .gitignore, .github/workflows/deploy.yml.
- Documentation : README.md, CLAUDE.md, LIVRAISON.md.

## Fichiers supprimés
src/components/ProfileSelector.jsx, src/contexts/ProfileContext.jsx, src/hooks/useExerciseTracking.js, src/pages/Suivi.jsx, src/utils/tracking.js.


## Mise à jour du 17 septembre — interfaces des exercices et réglages

Les quatre exercices et leurs quatre pages de réglages utilisent maintenant la palette de l’accueil : fonds, bordures, champs, liens, ombres, sélection et retours réussite/erreur, en clair et sombre. Les grilles, tailles, positions, ordres de champs, valeurs, calculs de réponses, sons et sauvegardes ne sont pas modifiés. Des noms accessibles ont été ajoutés au sélecteur de police et au curseur de l’exercice d’écoute ; les lettres activées exposent leur état aux lecteurs d’écran.

Validation : lint et build réussis ; 36 tests navigateur réussis sur ordinateur et mobile simulé, dont sauvegarde/rechargement/réinitialisation des réglages, réponses dans les quatre exercices, contrastes clair/sombre et contrôles nommés. Comparaison déterministe de 192 éléments pédagogiques sur 1280×900, 390×844 et 820×1180 : positions, dimensions et polices identiques avant/après. Captures claires et sombres examinées. Le lien HTTPS temporaire a été vérifié avec les nouvelles interfaces.

Fichiers concernés par cette étape :
- src/exercises/LetterFind.jsx, LetterSound.jsx, QuantitySound.jsx, WordRecompose.jsx : classes de présentation uniquement.
- src/pages/LettersSettings.jsx, LetterSoundSettings.jsx, QuantitySoundSettings.jsx, WordRecomposeSettings.jsx : classes de présentation et noms accessibles.
- src/styles/activities.css : palette et états communs ; aucune règle modifiant les grilles ou dimensions pédagogiques.
- src/main.jsx : import des styles.
- tests/activities.spec.js : vérifications des réglages, réponses et contrastes.
- README.md et LIVRAISON.md : mise à jour du périmètre livré.

Effets attendus : apparence plus sobre et thème sombre lisible sur toutes ces pages. La géométrie d’origine est conservée, y compris les en-têtes compacts sur petit écran. Aucun changement de stockage ni migration de données.

Limites : tests Chromium/Edge et formats mobiles simulés, pas de validation Safari/iOS physique ni d’écoute audio réelle. Avant une publication permanente, vérifier le son et les manipulations tactiles dans Safari sur iPhone/iPad. Le lien temporaire nécessite toujours que cet ordinateur reste allumé et connecté.
