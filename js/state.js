/* ═══ STATE — État partagé et constantes ══════════════════════════════════
   vbeta.2 — Tags spécifiques par catégorie, Gestion du sifflet ajoutée
════════════════════════════════════════════════════════════════════════════ */

/* ── Catégories d'observations ── */
export const CA = [
  'SPP','SPA','J7M','Protocole','PF','MB','JF','EJ',
  'Jeu Passif','Marcher','Pied','Reprise de dribble','Zone','Continuite',
  'Communication'
];
export const CP = ["Placement","Deplacement","Zone d'influence","Gestion du sifflet"];
export const CAU = 'Autres';

/* ═══ TAGS SPÉCIFIQUES PAR CATÉGORIE ═════════════════════════════════════
   red   → tags affichés uniquement sur appui long rouge
   green → tags affichés uniquement sur appui long vert
   both  → tags affichés quelle que soit la couleur
═══════════════════════════════════════════════════════════════════════════ */
export const CAT_TAGS = {
  'SPP': {
    red:   ['Verbale retard', 'Manque CJ', 'Manque explication', 'Pas CJ après but'],
    green: ['Bonne verbale'],
    both:  []
  },
  'SPA': {
    red:   [],  green: [],
    both:  ['Retient', 'Pousse', 'Ceinturage', 'Dépassée', 'Ferme en retard', 'Contre-attaque', 'Neutralise par derrière', 'Tête visage gorge', 'Amène au sol', 'Ne retient pas']
  },
  'J7M': {
    red:   [],  green: [],
    both:  ['Défense en zone', 'OMB', 'Équilibré', 'Retient', 'Retard']
  },
  'Protocole': {
    red:   ['Manque protocole'],
    green: ['Bon protocole'],
    both:  []
  },
  'PF': {
    red:   [],  green: [],
    both:  ["Pas d'intervalle", 'Raffut', 'Épaule en avant']
  },
  'MB': {
    red:   [],  green: [],
    both:  ['Hors cylindre (bras)', 'Hors cylindre (fesses)', 'Écran illégal']
  },
  'JF': {
    red:   [],  green: [],
    both:  ['Pas au bon endroit', 'Sortir des 9m', 'Pied hors du terrain']
  },
  'EJ': {
    red:   [],  green: [],
    both:  ['Engagement', 'Jet Franc', 'J7M', 'Renvoi', 'Remise en jeu']
  },
  'Jeu Passif': {
    red:   ['Trop tôt', 'Trop tard', 'Non cohérent'],
    green: ['Bon avertissement'],
    both:  ['2-3 passes après JF']
  },
  'Marcher': {
    red:   [],  green: [],
    both:  ['Piétine']
  },
  'Reprise de dribble': {
    red:   [],  green: [],
    both:  ['Pas de maîtrise ballon']
  },
  'Zone': {
    red:   [],  green: [],
    both:  ['Passage en zone', 'Dribble en zone', 'Appui zone', 'Gardien non maître de son équilibre ET du ballon']
  },
  'Continuite': {
    red:   [],  green: [],
    both:  ['Bras libre + équilibrée', 'Irrégularité + perd la balle', 'Pas de faute']
  },
  'Communication': {
    red:   [],  green: [],
    both:  ['Bonne comm.', 'Gestuelle floue', 'Manque comm. binôme']
  },
  'Placement': {
    red:   [],  green: [],
    both:  ['Trop loin', 'Trop proche', 'Latéralité', 'Profondeur', 'Angle de vue']
  },
  'Deplacement': {
    red:   [],  green: [],
    both:  ['Jaillissement', 'Contre-attaque trop lent', 'Changement de zone', 'Permutation', 'Latéral', 'Profondeur']
  },
  "Zone d'influence": {
    red:   [],  green: [],
    both:  ['Regarde le pivot en AZ', 'Pas ta zone']
  },
  'Gestion du sifflet': {
    red:   [],  green: [],
    both:  ['Croissant', 'Décroissant', 'Coup de sifflet brefs', 'Arrêt du temps']
  }
};

/* ── Tags généraux (après les spécifiques dans l'appui long) ── */
export const TAGS_GENERAUX = [
  'Bonne décision', 'Hésitation', 'Retard', 'Anticipé',
  'Sifflet tardif', 'Modulation'
];

/* ── Durées (secondes) ── */
export const PL  = 30 * 60;
export const PLR =  5 * 60;

/* ── Questions d'évaluation générale ── */
export const QS = [
  { id: 'esprit',  lbl: "Bon etat d'esprit" },
  { id: 'engage',  lbl: 'Engagement physique acceptable' },
  { id: 'niveau',  lbl: 'Niveaux de jeu equilibres' }
];

/* ── Clés localStorage ── */
export const KEY_CURRENT = 'arbitres_hb_current';
export const KEY_HISTORY = 'arbitres_hb_history';

/* ── Réponses aux questions (mutable) ── */
export const ans = { esprit: null, engage: null, niveau: null };

/* ── Filtres tableau de synthèse (mutable) ── */
export const synFilters = { arb: 'all', per: 'all' };

/* ── Durée appui long (ms) ── */
export const LONG_PRESS_MS = 400;

/* ── État principal du match (mutable) ── */
export const S = {
  tA: 'Equipe A', tB: 'Equipe B',
  a1: 'Arb 1',    a2: 'Arb 2',
  mDate: '', mTime: '', mComp: '',

  run: false, elapsed: 0, period: 'MT1',
  timer: null, tick: null,

  sA: 0, sB: 0,
  htA: null, htB: null,

  tme: { A: [null, null, null], B: [null, null, null] },

  obs: [],
  detailPending: null,
  pauseTme: false
};
