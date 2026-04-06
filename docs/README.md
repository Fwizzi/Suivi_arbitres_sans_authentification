# Suivi Arbitres Handball

Application web progressive (PWA) de suivi et d'évaluation des arbitres de handball, conçue pour une utilisation sur tablette (iPad paysage) pendant un match.

> © Vincent Guerlach — Commission Arbitres Occitanie — Tous droits réservés

---

## Présentation

**Suivi Arbitres Handball** est une application légère, fonctionnelle hors ligne, permettant à un observateur d'arbitres de handball de :

- configurer un match (équipes, arbitres, compétition, date/heure) ;
- chronométrer le match avec gestion des mi-temps et des prolongations ;
- suivre le score et les temps morts (TME) ;
- saisir des observations rapides via un système de **Quick Notes** tactile avec tags prédéfinis par catégorie ;
- visualiser la synthèse via un **radar interactif** avec comparaison des deux arbitres ;
- exporter un rapport complet au format PDF ;
- consulter l'historique des matchs précédents.

---

## Structure du projet

```
├── index.html          # Point d'entrée HTML (toutes les vues)
├── styles.css          # Feuille de styles complète (responsive, dark mode)
├── theme-init.js       # Initialisation du thème avant le rendu (évite le flash)
├── manifest.json       # Manifeste PWA
├── sw.js               # Service Worker (cache hors ligne + CDN jsPDF)
├── logo.png            # Logo FFHandball
├── docs/
│   ├── CHANGELOG.md    # Historique des modifications
│   └── README.md       # Ce fichier
└── js/
    ├── main.js         # Point d'entrée ES module — import, exposition window, init
    ├── state.js        # État partagé, constantes, catégories, tags par catégorie
    ├── match.js        # Cycle de vie du match (démarrer, terminer, retour accueil)
    ├── timer.js        # Chronomètre, gestion des périodes, prolongations, recalage
    ├── score.js        # Score et gestion des temps morts (TME)
    ├── observations.js # Quick Notes : grille tactile, popup tags, compteurs
    ├── synthesis.js    # Radar SVG de synthèse par catégorie avec filtres
    ├── pdf.js          # Export PDF (chargement lazy de jsPDF + autoTable)
    ├── storage.js      # Persistance localStorage, reprise de match, historique
    ├── ui.js           # Thème clair/sombre, alertes, questionnaire d'évaluation
    ├── utils.js        # Fonctions utilitaires (formatage temps, dates)
    ├── logger.js       # Journal structuré JSON exportable
    └── version.js      # Source unique de vérité pour la version
```

---

## Fonctionnalités détaillées

### Écran de configuration (Setup)
- Saisie de la date, heure, compétition, équipes et noms des deux arbitres.
- Détection automatique d'un match interrompu (bannière de reprise).
- Pré-remplissage de la date et heure courante.
- Accès à l'historique des matchs.

### Écran principal (Match)

**Panneau gauche (fixe) :**
- **Chronomètre** : démarrage / pause, recalage manuel (mm:ss), badge de période (MT1 / MT2 / Prolongations).
- **Score** : incrémentation/décrémentation par équipe, mémorisation du score à la mi-temps.
- **Temps morts (TME)** : tableau par équipe, ajout horodaté, pause automatique du chrono.
- **Contexte du match** : zone de texte libre.

**Panneau droit — Quick Notes :**
- **Grille compacte 6 colonnes** avec les deux zones A1/A2 côte à côte.
- **19 catégories** réparties en Décisions techniques (SPP, SPA, J7M, Protocole, PF, MB, JF, EJ, Jeu Passif, Marcher, Pied, Reprise de dribble, Zone, Continuité, Communication) et Positionnement (Placement, Déplacement, Zone d'influence, Gestion du sifflet) + Autre.
- **Tap sur ✘ ou ✔** → ouvre une popup avec tags prédéfinis spécifiques à la catégorie + tags généraux + note libre optionnelle.
- **Tags conditionnés à la couleur** : certains tags n'apparaissent que sur rouge ou vert.
- **Compteurs en temps réel** par bouton et par arbitre.
- **Tableau des observations** avec tri par heure, catégorie, arbitre ou type.

### Écran de fin de match (Synthèse)
- Score final avec rappel du score à la mi-temps.
- Contexte du match éditable.
- Questionnaire d'évaluation générale (esprit, engagement physique, niveaux équilibrés).
- **Radar de synthèse** :
  - Deux polygones individuels superposés (A1 bleu, A2 ambre pointillé).
  - Scores individuels au centre du radar.
  - Compteurs xR - xV sur chaque rayon.
  - Taille des labels pondérée par le nombre d'observations.
  - Filtres Arbitre (Les deux / A1 / A2) et Période (Tout / MT1 / MT2).
  - Panneau détail à droite avec mini-barres et pourcentages.
- Tableau complet de toutes les observations.
- Commentaire global libre.
- **Export PDF** : rapport généré côté client via jsPDF + autoTable.

### Historique
- Liste des matchs exportés avec réexport PDF possible.
- Suppression individuelle de matchs.

### Thème
- Mode clair / sombre avec détection automatique des préférences système.
- Bascule manuelle persistante (localStorage).

---

## Architecture technique

| Aspect | Détail |
|---|---|
| Type | Application web progressive (PWA) |
| Langage | HTML5, CSS3, JavaScript ES Modules (sans framework) |
| Persistance | `localStorage` (deux clés : `arbitres_hb_current` et `arbitres_hb_history`) |
| Hors ligne | Service Worker — cache des assets + pré-cache CDN jsPDF |
| Export | jsPDF 2.5.1 + jsPDF-autoTable 3.8.2 (CDN cdnjs, chargement lazy + preload) |
| Responsive | Optimisé tablette paysage (iPad), compatible mobile portrait |
| Installation | Installable sur iOS et Android |

---

## Installation et utilisation

### Déploiement sur hébergement web (O2switch, etc.)
1. Décompresser l'archive `Suivi_arbitres_v0.3.5.zip`.
2. Uploader le contenu du dossier `Suivi_arbitres_v0.3.5/` à la racine du domaine ou sous-domaine.
3. S'assurer que le serveur sert les fichiers en HTTPS (requis pour le Service Worker).

### Mise à jour depuis une version précédente
1. Uploader les nouveaux fichiers en écrasant les anciens.
2. Vider le cache du Service Worker : sur iPad → Réglages Safari → Données de sites → chercher le domaine → Supprimer.
3. Recharger la page.

### Installation PWA sur tablette
1. Ouvrir l'URL dans Safari (iOS) ou Chrome (Android).
2. Utiliser *Partager → Sur l'écran d'accueil* (iOS) ou *Installer l'application* (Android).
3. L'application est disponible hors ligne après la première visite avec connexion internet.

> **Note** : Le premier export PDF nécessite une connexion internet pour charger la librairie jsPDF depuis le CDN. Les exports suivants fonctionnent hors ligne grâce au cache du Service Worker.

---

## Catégories d'observations

### Décisions techniques
| Code | Libellé |
|---|---|
| SPP | Sanction — Pénalité Progressive |
| SPA | Sanction — Pénalité / Avertissement |
| J7M | Jet de 7 mètres |
| Protocole | Protocole arbitral |
| PF | Faute personnelle |
| MB | Mêlée / Balle disputée |
| JF | Jet Franc |
| EJ | Exécution du jet |
| Jeu Passif | Jeu passif |
| Marcher | Marcher |
| Pied | Faute de pied |
| Reprise de dribble | Reprise de dribble |
| Zone | Violation de zone |
| Continuité | Continuité du jeu |
| Communication | Communication entre arbitres |

### Positionnement
| Code | Libellé |
|---|---|
| Placement | Placement des arbitres |
| Déplacement | Déplacement des arbitres |
| Zone d'influence | Zone d'influence |
| Gestion du sifflet | Gestion du sifflet |

---

## Dépendances externes

| Bibliothèque | Version | Usage | Chargée |
|---|---|---|---|
| [jsPDF](https://github.com/parallax/jsPDF) | 2.5.1 | Génération PDF | À la demande (CDN + preload) |
| [jsPDF-autoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) | 3.8.2 | Tableaux dans le PDF | À la demande (CDN + preload) |

Aucune dépendance npm. Aucun bundler requis.

---

## Licence

© **Vincent Guerlach** — Commission Arbitres Occitanie — Tous droits réservés.  
Usage réservé à l'auteur et aux personnes expressément autorisées.
