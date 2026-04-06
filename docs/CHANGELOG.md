# CHANGELOG — Suivi Arbitres Handball

Toutes les modifications notables de l'application sont documentées ici.  

## [0.3.5] — 2026-04-06

### Refonte majeure — Mode Quick Notes

Remplacement complet du formulaire d'observation par un système de saisie tactile rapide conçu pour une utilisation en match sans quitter le terrain des yeux.

#### Nouveau système de saisie (Quick Notes)
- **Grille compacte 6 colonnes** : les catégories sont groupées par paires sur chaque ligne (nom ✘ ✔ | nom ✘ ✔), divisant la hauteur de la grille par deux par rapport à l'ancienne disposition.
- **Deux zones A1/A2 toujours visibles** côte à côte en mode tablette paysage.
- **Tap = popup obligatoire** : chaque tap (rouge ou vert) ouvre une bottom sheet avec tags prédéfinis + note libre optionnelle. Plus de tap court pour éviter les annotations accidentelles.
- **Tags spécifiques par catégorie** : chaque catégorie a ses propres tags contextuels (ex : SPA → Retient, Pousse, Ceinturage...), affichés en premier dans la popup, suivis des tags généraux (Bonne décision, Hésitation, Retard...).
- **Tags conditionnés à la couleur** : certains tags n'apparaissent que sur rouge ou vert (ex : « Bonne verbale » uniquement sur SPP vert, « Manque CJ » uniquement sur SPP rouge).
- **Compteurs en temps réel** sur chaque bouton et totaux par arbitre (xR · xV).
- **Flash visuel + vibration haptique** à chaque enregistrement.
- **Commentaire optionnel** : la note libre et les tags sont optionnels, contrairement à l'ancien commentaire obligatoire.
- **Bouton « + A2 aussi »** dans la popup pour ajouter l'autre arbitre à l'observation.

#### Nouvelles catégories
- **JF** (Jet Franc) ajouté aux décisions techniques, avec tags : Pas au bon endroit, Sortir des 9m, Pied hors du terrain.
- **EJ** (Exécution du jet) ajouté aux décisions techniques, avec tags : Engagement, Jet Franc, J7M, Renvoi, Remise en jeu.
- **Gestion du sifflet** ajouté au positionnement, avec tags : Croissant, Décroissant, Coup de sifflet brefs, Arrêt du temps.

#### Tags par catégorie (liste complète)
- **SPP** : rouge → Verbale retard, Manque CJ, Manque explication, Pas CJ après but · vert → Bonne verbale
- **SPA** : Retient, Pousse, Ceinturage, Dépassée, Ferme en retard, Contre-attaque, Neutralise par derrière, Tête visage gorge, Amène au sol, Ne retient pas
- **J7M** : Défense en zone, OMB, Équilibré, Retient, Retard
- **Protocole** : rouge → Manque protocole · vert → Bon protocole
- **PF** : Pas d'intervalle, Raffut, Épaule en avant
- **MB** : Hors cylindre (bras), Hors cylindre (fesses), Écran illégal
- **JF** : Pas au bon endroit, Sortir des 9m, Pied hors du terrain
- **EJ** : Engagement, Jet Franc, J7M, Renvoi, Remise en jeu
- **Jeu Passif** : rouge → Trop tôt, Trop tard, Non cohérent · vert → Bon avertissement · les deux → 2-3 passes après JF
- **Marcher** : Piétine
- **Reprise de dribble** : Pas de maîtrise ballon
- **Zone** : Passage en zone, Dribble en zone, Appui zone, Gardien non maître de son équilibre ET du ballon
- **Continuité** : Bras libre + équilibrée, Irrégularité + perd la balle, Pas de faute
- **Communication** : Bonne comm., Gestuelle floue, Manque comm. binôme
- **Placement** : Trop loin, Trop proche, Latéralité, Profondeur, Angle de vue
- **Déplacement** : Jaillissement, Contre-attaque trop lent, Changement de zone, Permutation, Latéral, Profondeur
- **Zone d'influence** : Regarde le pivot en AZ, Pas ta zone
- **Gestion du sifflet** : Croissant, Décroissant, Coup de sifflet brefs, Arrêt du temps
- **Tags généraux** (toutes catégories) : Bonne décision, Hésitation, Retard, Anticipé, Sifflet tardif, Modulation

#### Radar de synthèse (remplace le tableau)
- **Radar SVG dynamique** remplaçant l'ancien tableau de synthèse par catégorie.
- **Cercles concentriques arrondis** pour l'échelle (0%, 25%, 50%, 75%, 100%).
- **Deux polygones individuels superposés** en mode « Les deux » : A1 en bleu continu (#185FA5), A2 en ambre pointillé (#BA7517). Chaque polygone représente la performance individuelle de l'arbitre (pas une moyenne).
- **Calcul du point** : V / (V + R) × 100% par catégorie et par arbitre.
- **Axes sautés** : quand un arbitre n'a pas d'observation sur une catégorie, son polygone relie directement les axes adjacents sans point intermédiaire.
- **Compteurs xR - xV** positionnés sur chaque rayon avec carré de couleur indicateur (bleu A1, ambre A2), R en rouge et V en vert.
- **Scores individuels au centre** : pourcentage global de chaque arbitre affiché dans sa couleur.
- **Taille des labels pondérée** : de 9px (1 obs.) à 20px (13+ obs.) avec couleur atténuée pour les catégories peu observées.
- **Noms abrégés** sur le radar (mêmes abréviations que la grille de saisie).
- **Filtres Arbitre** (Les deux / A1 / A2) : en mode individuel, seules les catégories observées par cet arbitre apparaissent, un seul polygone, un seul score au centre.
- **Filtres Période** (Tout / MT1 / MT2) : recalcule le radar pour la période sélectionnée.
- **Panneau détail** à droite du radar avec mini-barres empilées rouge/vert, compteurs et pourcentages, triés par nombre d'observations décroissant.
- Filtres Type (Non conf. / Conformes) et Tri (Points faibles / Points forts / A-Z) supprimés car non pertinents pour un radar.

#### Autres modifications
- **Authentification retirée** : accès direct sans login. L'authentification sera réintégrée ultérieurement quand l'application sera stable.
- **Export PDF** : préchargement de jsPDF via `<link rel="preload">` et pré-cache dans le Service Worker pour fiabiliser le premier export. Message d'erreur amélioré si le CDN est inaccessible.
- **PDF adapté** : le commentaire dans le PDF combine désormais les tags sélectionnés + la note libre (format : « tag1, tag2 · note libre »).
- Le tableau des observations et tout l'écran de fin de match (score, contexte, évaluation, commentaire global, export PDF) restent inchangés.

### Fichiers modifiés
- `js/state.js` — catégories JF, EJ, Gestion du sifflet ajoutées ; `CAT_TAGS` et `TAGS_GENERAUX` remplacent `TAGS` ; `synFilters` simplifié (arb + per uniquement).
- `js/observations.js` — entièrement réécrit : grille compacte 6 colonnes, tap obligatoire via popup, tags contextuels par catégorie.
- `js/synthesis.js` — entièrement réécrit : radar SVG dynamique avec deux polygones individuels, panneau détail, labels abrégés et pondérés.
- `js/match.js` — adapté au Quick Notes (`buildQuickNotes` au lieu de `buildCats`), synFilters simplifié.
- `js/storage.js` — suppression de la couche auth/backend, compatibilité arrière pour les tags.
- `js/main.js` — suppression de l'auth, exposition des nouvelles fonctions Quick Notes.
- `js/pdf.js` — commentaire combine tags + note libre, message d'erreur amélioré.
- `js/version.js` — version 0.3.5.
- `index.html` — formulaire remplacé par Quick Notes, section synthèse remplacée par radar, auth/admin supprimés, preload jsPDF.
- `styles.css` — styles Quick Notes (grille compacte, boutons tap, popup), styles radar, suppression des styles du tableau synthèse.
- `sw.js` — pré-cache des CDN jsPDF, version du cache v0.3.5.

---

## [0.3.4] — 2026-04-04

### Corrigé
- `js/observations.js` — **tri chronologique corrigé** : la fonction `sorted()` prend désormais en compte la période (MT1 < MT2 < Prol.1 < Prol.2) en plus du temps écoulé. Avant, une observation à 25:00 en MT1 apparaissait au-dessus d'une observation à 5:00 en MT2 (tri uniquement sur `elapsed`). Un poids par période (`PERIOD_WEIGHT`) garantit l'ordre chronologique réel du match.
- `js/main.js` — **tri de fin de match réparé** : les fonctions `renderTable()` et `renderEndTable()` n'étaient pas exposées sur `window`, ce qui rendait les `onchange` des `<select>` de tri inopérants (erreur silencieuse). Ajout de `window.renderTable` et `window.renderEndTable`.
- `sw.js` — version du cache passée à `v26`.

---

## [0.3.3] — 2026-04-03

### Ajouté
- Bouton **Thème clair/sombre** sur tous les écrans où il était absent (Connexion, Setup, Historique, Admin, Synthèse) — le bouton d'origine sur l'écran Match est conservé.
- Bouton **Mot de passe oublié** sur la page de connexion
  - Modale en deux étapes : saisie email → confirmation d'envoi
  - Appel API `POST /auth/forgot-password` (endpoint backend à implémenter)
  - Sécurité : réponse identique que l'adresse existe ou non (anti-énumération de comptes)
- `js/auth.js` — fonctions `requestPasswordReset()` et `resetPasswordWithToken()`
- `js/main.js` — fonctions `openForgotPassword()`, `closeForgotPassword()`, `submitForgotPassword()`
- `docs/backend_reset_password.js` — code Express/Nodemailer à intégrer côté serveur

---

## [0.3.2] — 2026-03-29

### Ajouté
- `main.js` — **politique de mot de passe centralisée** avec 5 critères : 8 caractères minimum, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial.
- **Coches dynamiques en temps réel** : indicateur visuel (○ gris → ✓ vert) à chaque frappe.

### Modifié
- `main.js` — le nouveau mot de passe doit obligatoirement être différent de l'actuel.
- `sw.js` — version du cache passée à `v25`.

---

## [0.3.1] — 2026-03-29

### Ajouté
- `auth.js` — fonction `changePassword(currentPassword, newPassword)`.
- `main.js` — modale de changement de mot de passe.
- `index.html` — bouton **Mot de passe** dans la barre utilisateur.
- `sw.js` — version du cache passée à `v24`.

---

## [0.3.0] — 2026-03-29

### Ajouté
- **Communication** dans les catégories de décisions techniques.
- **Multi-sélection des arbitres** : cocher un ou deux arbitres sur la même observation.
- **Multi-sélection des catégories** : cocher plusieurs catégories sur la même observation.

### Modifié
- **Panneau gauche fixe** (sticky) lors du défilement vertical.
- `selArb` et `selCat` passent de valeur unique à tableaux.
- `sw.js` — version du cache passée à `v23`.

---

## [0.2.4] — 2026-03-29

### Corrigé
- Écran de connexion mal positionné.
- `submitLogin()` : message d'erreur explicite si serveur injoignable.
- `sw.js` — version du cache passée à `v20`.

---

## [0.2.3] — 2026-03-29

### Corrigé
- Tous les écrans masqués par défaut au chargement pour éviter l'affichage simultané.
- `sw.js` — version du cache passée à `v19`.

---

## [0.2.2] — 2026-03-28

### Corrigé
- URL API passée de `http://` à `https://` (mixed content).
- Backend Node.js en HTTPS + Nginx reverse proxy.
- `sw.js` — version du cache passée à `v18`.

---

## [0.2.1] — 2026-03-28

### Modifié
- Accès fermé sans connexion. Rôles utilisateurs (user/admin) dans le JWT.

### Ajouté
- **Espace administrateur** : liste utilisateurs, création, suppression, réinitialisation mot de passe.
- `sw.js` — version du cache passée à `v17`.

---

## [0.2.0] — 2026-03-28

### Ajouté
- **Authentification utilisateur** via backend MySQL. Tokens JWT.
- **Synchronisation de l'historique** sur le serveur.
- `sw.js` — version du cache passée à `v16`.

---

## [0.1.3] — 2026-03-27

### Ajouté
- **Synthèse par catégorie** unifiée avec filtres croisés (arbitre, période, type, tri).
- Score global de conformité avec code couleur.
- `sw.js` — version du cache passée à `v15`.

---

## [0.1.2] — 2026-03-27

### Modifié
- Champs Date/Heure convertis en `type="text"` avec `inputmode="numeric"`.
- `sw.js` — version du cache passée à `v13`.

---

## [0.1.1] — 2026-03-27

### Corrigé
- Grille `.g3` : largeur minimale Safari sur inputs date/time.
- `sw.js` — version du cache passée à `v12`.

---

## [0.1.0] — 2026-03-27

### Modifié
- Grille Date/Heure/Compétition rééquilibrée (1fr 1fr 1.4fr).
- `sw.js` — version du cache passée à `v11`.

---

## [0.0.9] — 2026-03-27

### Corrigé
- Grille `.g3` responsive mobile.
- `sw.js` — version du cache passée à `v10`.

---

## [0.0.8] — 2026-03-27

### Modifié
- Dossier interne du ZIP nommé proprement.
- Format du copyright mis à jour.
- `sw.js` — version du cache passée à `v9`.

---

## [0.0.7] — 2026-03-27

### Corrigé
- `cancelTime` non exposée sur `window` global.
- `sw.js` — version du cache passée à `v8`.

---

## [0.0.6] — 2026-03-27

### Corrigé
- `pdf.js` — erreur de syntaxe JS critique avec l'opérateur spread.
- `sw.js` — version du cache passée à `v7`.

---

## [0.0.5] — 2026-03-27

### Corrigé
- Import inutile dans `storage.js`.
- Version corrigée dans `version.js`.
- `sw.js` — version du cache passée à `v6`.

---

## [0.0.4] — 2026-03-27

### Corrigé
- Déplacement CHANGELOG et README dans `docs/`.

---

## [0.0.3] — 2026-03-27

### Ajouté
- **Versioning** : `js/version.js` comme source unique de vérité.
- Affichage dynamique de la version dans les pieds de page.
- `sw.js` — version du cache passée à `v5`.

---

## [0.0.2] — 2026-03-27

### Ajouté
- **Système de logs structurés JSON** exportable.
- Instrumentation complète de tous les modules.
- `sw.js` — version du cache passée à `v4`.

---

## [0.0.1] — 2026-03-27

### Ajouté
- Fichier `README.md`.

---

## [0.0.0] — Version initiale

Première version fonctionnelle : configuration match, chronomètre, score, TME, observations horodatées, synthèse, export PDF, historique, thème clair/sombre, PWA.
