/* ═══ SYNTHESIS — Radar SVG + panneau détail vbeta.6 ═════════════════════
   • Radar avec polygones individuels A1 (bleu) / A2 (ambre) superposés
   • Compteurs xR - xV sur chaque rayon (rouge/vert)
   • Axes sautés si l'arbitre n'a pas d'obs sur cette catégorie
   • Scores individuels au centre du radar
   • Taille des labels pondérée par le nombre d'observations
   • Cercles concentriques (pas de polygones) pour l'échelle
   • Panneau détail avec mini-barres à droite
   • Filtres : Arbitre (les deux / A1 / A2) + Période (Tout / MT1 / MT2)
════════════════════════════════════════════════════════════════════════════ */
import { S, synFilters } from './state.js';

/* ── Abréviations des catégories (même logique que observations.js) ── */
const SHORT = {
  'Protocole': 'Proto.', 'Jeu Passif': 'Passif',
  'Reprise de dribble': 'R.drib.', 'Continuite': 'Contin.',
  'Communication': 'Comm.', 'Deplacement': 'Déplac.',
  "Zone d'influence": "Z.infl.",
  'Gestion du sifflet': 'Sifflet',
  'Placement': 'Placem.'
};
function shortName(cat) { return SHORT[cat] || cat; }

const COL_A1   = '#185FA5';
const COL_A2   = '#BA7517';
const COL_RED  = '#A32D2D';
const COL_GRN  = '#3B6D11';
const FILL_A1  = 'rgba(24,95,165,0.12)';
const FILL_A2  = 'rgba(186,117,23,0.10)';
const RADIUS   = 140;
const CX       = 220;
const CY       = 220;
const SVG_SIZE = 480;
const LABEL_R  = RADIUS + 35;
const RV_R     = RADIUS * 0.78;

/* ── Mettre à jour un filtre et reconstruire ── */
export function setSynFilter(key, val) {
  synFilters[key] = val;
  document.querySelectorAll('.syn-fb').forEach(btn => {
    const id = btn.id;
    if (!id) return;
    const parts = id.replace('sf', '').split('-');
    if (parts.length < 2) return;
    const fKey = parts[0].toLowerCase();
    const fVal = parts.slice(1).join('-');
    const keyMap = { arb: 'arb', per: 'per' };
    const mapped = keyMap[fKey];
    if (mapped) btn.classList.toggle('active', synFilters[mapped] === fVal);
  });
  buildSynTable();
}

/* ── Point d'entrée principal ── */
export function buildSynTable() {
  /* Noms réels sur les boutons arbitres */
  const btnA1 = document.getElementById('sfArb-A1');
  const btnA2 = document.getElementById('sfArb-A2');
  if (btnA1 && !btnA1.dataset.labeled) { btnA1.textContent = S.a1; btnA1.dataset.labeled = '1'; }
  if (btnA2 && !btnA2.dataset.labeled) { btnA2.textContent = S.a2; btnA2.dataset.labeled = '1'; }

  /* Filtrer les observations par période */
  const allObs = S.obs.filter(o => {
    if (synFilters.per !== 'all' && o.period !== synFilters.per) return false;
    return true;
  });

  /* Séparer par arbitre */
  const obsA1 = allObs.filter(o => { const a = Array.isArray(o.arb) ? o.arb : [o.arb]; return a.includes('A1'); });
  const obsA2 = allObs.filter(o => { const a = Array.isArray(o.arb) ? o.arb : [o.arb]; return a.includes('A2'); });

  /* Stats par catégorie et par arbitre */
  const statsA1 = _buildStats(obsA1);
  const statsA2 = _buildStats(obsA2);

  /* Union des catégories observées par au moins un arbitre */
  const allCats = [...new Set([...Object.keys(statsA1), ...Object.keys(statsA2)])];

  /* Déterminer quelles catégories afficher selon le filtre */
  let cats;
  if (synFilters.arb === 'A1') cats = Object.keys(statsA1);
  else if (synFilters.arb === 'A2') cats = Object.keys(statsA2);
  else cats = allCats;

  /* Trier par nombre total d'observations décroissant */
  cats.sort((a, b) => {
    const tA = (statsA1[a]?.total || 0) + (statsA2[a]?.total || 0);
    const tB = (statsA1[b]?.total || 0) + (statsA2[b]?.total || 0);
    return tB - tA;
  });

  const radarEl = document.getElementById('synRadar');
  const detailEl = document.getElementById('synDetail');

  if (!cats.length) {
    radarEl.innerHTML = '<div style="text-align:center;color:var(--text-hint);padding:2rem;">Aucune observation pour ces filtres</div>';
    detailEl.innerHTML = '';
    return;
  }

  /* Scores globaux individuels */
  const scoreA1 = obsA1.length ? Math.round(obsA1.filter(o => o.col === 'green').length / obsA1.length * 100) : null;
  const scoreA2 = obsA2.length ? Math.round(obsA2.filter(o => o.col === 'green').length / obsA2.length * 100) : null;

  /* Tailles de police : interpolation linéaire entre 9px (min obs) et 20px (max obs) */
  const maxObs = Math.max(...cats.map(c => (statsA1[c]?.total || 0) + (statsA2[c]?.total || 0)));
  const minObs = Math.min(...cats.map(c => (statsA1[c]?.total || 0) + (statsA2[c]?.total || 0)));
  function fontSize(cat) {
    const t = (statsA1[cat]?.total || 0) + (statsA2[cat]?.total || 0);
    if (maxObs === minObs) return 13;
    return Math.round(9 + (t - minObs) / (maxObs - minObs) * 11);
  }

  /* ═══ Construire le SVG du radar ═══ */
  const n = cats.length;
  const angleStep = (2 * Math.PI) / n;

  function polar(i, pct) {
    const angle = angleStep * i - Math.PI / 2;
    return {
      x: Math.round((CX + RADIUS * (pct / 100) * Math.cos(angle)) * 10) / 10,
      y: Math.round((CY + RADIUS * (pct / 100) * Math.sin(angle)) * 10) / 10
    };
  }
  function labelPos(i) {
    const angle = angleStep * i - Math.PI / 2;
    return {
      x: Math.round((CX + LABEL_R * Math.cos(angle)) * 10) / 10,
      y: Math.round((CY + LABEL_R * Math.sin(angle)) * 10) / 10,
      anchor: Math.abs(Math.cos(angle)) < 0.15 ? 'middle' : (Math.cos(angle) > 0 ? 'start' : 'end')
    };
  }
  function rvPos(i) {
    const angle = angleStep * i - Math.PI / 2;
    return {
      x: Math.round((CX + RV_R * Math.cos(angle)) * 10) / 10,
      y: Math.round((CY + RV_R * Math.sin(angle)) * 10) / 10,
      anchor: Math.abs(Math.cos(angle)) < 0.15 ? 'middle' : (Math.cos(angle) > 0 ? 'start' : 'end'),
      side: Math.cos(angle) >= 0 ? 1 : -1
    };
  }

  let svg = '<svg viewBox="0 0 ' + SVG_SIZE + ' ' + SVG_SIZE + '" width="100%" style="max-width:480px;">';

  /* Cercles concentriques */
  [35, 70, 105, 140].forEach(r => {
    svg += '<circle cx="' + CX + '" cy="' + CY + '" r="' + r + '" fill="none" stroke="#eae9e5" stroke-width="0.5"/>';
  });

  /* Légendes des cercles */
  svg += '<text x="' + (CX + 4) + '" y="' + (CY - 143) + '" font-size="7" fill="#ccc">100%</text>';
  svg += '<text x="' + (CX + 4) + '" y="' + (CY - 108) + '" font-size="7" fill="#ccc">75%</text>';
  svg += '<text x="' + (CX + 4) + '" y="' + (CY - 73) + '" font-size="7" fill="#ccc">50%</text>';
  svg += '<text x="' + (CX + 4) + '" y="' + (CY - 38) + '" font-size="7" fill="#ccc">25%</text>';

  /* Rayons */
  for (let i = 0; i < n; i++) {
    const end = polar(i, 100);
    svg += '<line x1="' + CX + '" y1="' + CY + '" x2="' + end.x + '" y2="' + end.y + '" stroke="#e0e0dc" stroke-width="0.4"/>';
  }

  /* Polygone A1 */
  const showA1 = synFilters.arb === 'all' || synFilters.arb === 'A1';
  const showA2 = synFilters.arb === 'all' || synFilters.arb === 'A2';

  if (showA1) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const s = statsA1[cats[i]];
      if (s) {
        const pct = s.total > 0 ? Math.round(s.g / s.total * 100) : 0;
        const p = polar(i, pct);
        pts.push(p.x + ',' + p.y);
      }
      /* Pas d'obs → pas de point, on saute */
    }
    if (pts.length >= 2) {
      svg += '<polygon points="' + pts.join(' ') + '" fill="' + FILL_A1 + '" stroke="' + COL_A1 + '" stroke-width="1.8"/>';
    }
    /* Points */
    for (let i = 0; i < n; i++) {
      const s = statsA1[cats[i]];
      if (s) {
        const pct = s.total > 0 ? Math.round(s.g / s.total * 100) : 0;
        const p = polar(i, pct);
        svg += '<circle cx="' + p.x + '" cy="' + p.y + '" r="3" fill="' + COL_A1 + '"/>';
      }
    }
  }

  /* Polygone A2 */
  if (showA2) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const s = statsA2[cats[i]];
      if (s) {
        const pct = s.total > 0 ? Math.round(s.g / s.total * 100) : 0;
        const p = polar(i, pct);
        pts.push(p.x + ',' + p.y);
      }
    }
    if (pts.length >= 2) {
      svg += '<polygon points="' + pts.join(' ') + '" fill="' + FILL_A2 + '" stroke="' + COL_A2 + '" stroke-width="1.8" stroke-dasharray="5,3"/>';
    }
    for (let i = 0; i < n; i++) {
      const s = statsA2[cats[i]];
      if (s) {
        const pct = s.total > 0 ? Math.round(s.g / s.total * 100) : 0;
        const p = polar(i, pct);
        svg += '<circle cx="' + p.x + '" cy="' + p.y + '" r="3" fill="' + COL_A2 + '"/>';
      }
    }
  }

  /* Labels + compteurs R/V sur les rayons */
  for (let i = 0; i < n; i++) {
    const cat = cats[i];
    const lp = labelPos(i);
    const rv = rvPos(i);
    const fs = fontSize(cat);
    const totalObs = (statsA1[cat]?.total || 0) + (statsA2[cat]?.total || 0);
    const fillColor = totalObs <= 1 ? 'var(--text-hint)' : (totalObs <= 2 ? 'var(--text-muted)' : 'var(--text-main)');

    /* Nom catégorie */
    svg += '<text x="' + lp.x + '" y="' + lp.y + '" text-anchor="' + lp.anchor + '" font-size="' + fs + '" font-weight="500" fill="' + fillColor + '">' + shortName(cat) + '</text>';

    /* Compteurs R/V — positionnés sur le rayon */
    const sA1 = statsA1[cat];
    const sA2 = statsA2[cat];
    const xOff = rv.anchor === 'start' ? 6 : (rv.anchor === 'end' ? -6 : 0);
    let lineY = rv.y;

    if (showA1 && sA1) {
      /* Carré indicateur A1 + compteurs */
      const bx = rv.anchor === 'end' ? rv.x + xOff - 46 : rv.x + xOff;
      svg += '<rect x="' + bx + '" y="' + (lineY - 4) + '" width="4" height="4" rx="1" fill="' + COL_A1 + '"/>';
      svg += '<text x="' + (bx + 6) + '" y="' + lineY + '" font-size="9" font-weight="500" fill="' + COL_RED + '">' + sA1.r + 'R</text>';
      svg += '<text x="' + (bx + 19) + '" y="' + lineY + '" font-size="9" fill="var(--text-hint)">-</text>';
      svg += '<text x="' + (bx + 24) + '" y="' + lineY + '" font-size="9" font-weight="500" fill="' + COL_GRN + '">' + sA1.g + 'V</text>';
      lineY += 10;
    }

    if (showA2 && sA2) {
      const bx = rv.anchor === 'end' ? rv.x + xOff - 46 : rv.x + xOff;
      svg += '<rect x="' + bx + '" y="' + (lineY - 4) + '" width="4" height="4" rx="1" fill="' + COL_A2 + '"/>';
      svg += '<text x="' + (bx + 6) + '" y="' + lineY + '" font-size="9" font-weight="500" fill="' + COL_RED + '">' + sA2.r + 'R</text>';
      svg += '<text x="' + (bx + 19) + '" y="' + lineY + '" font-size="9" fill="var(--text-hint)">-</text>';
      svg += '<text x="' + (bx + 24) + '" y="' + lineY + '" font-size="9" font-weight="500" fill="' + COL_GRN + '">' + sA2.g + 'V</text>';
    }
  }

  /* Scores au centre */
  if (showA1 && showA2 && scoreA1 !== null && scoreA2 !== null) {
    svg += '<text x="' + (CX - 18) + '" y="' + (CY - 4) + '" text-anchor="end" font-size="22" font-weight="500" fill="' + COL_A1 + '">' + scoreA1 + '%</text>';
    svg += '<text x="' + (CX - 18) + '" y="' + (CY + 10) + '" text-anchor="end" font-size="9" fill="' + COL_A1 + '">' + S.a1 + '</text>';
    svg += '<text x="' + (CX + 18) + '" y="' + (CY - 4) + '" text-anchor="start" font-size="22" font-weight="500" fill="' + COL_A2 + '">' + scoreA2 + '%</text>';
    svg += '<text x="' + (CX + 18) + '" y="' + (CY + 10) + '" text-anchor="start" font-size="9" fill="' + COL_A2 + '">' + S.a2 + '</text>';
  } else if (showA1 && scoreA1 !== null) {
    svg += '<text x="' + CX + '" y="' + (CY - 4) + '" text-anchor="middle" font-size="26" font-weight="500" fill="' + COL_A1 + '">' + scoreA1 + '%</text>';
    svg += '<text x="' + CX + '" y="' + (CY + 12) + '" text-anchor="middle" font-size="10" fill="' + COL_A1 + '">' + S.a1 + '</text>';
  } else if (showA2 && scoreA2 !== null) {
    svg += '<text x="' + CX + '" y="' + (CY - 4) + '" text-anchor="middle" font-size="26" font-weight="500" fill="' + COL_A2 + '">' + scoreA2 + '%</text>';
    svg += '<text x="' + CX + '" y="' + (CY + 12) + '" text-anchor="middle" font-size="10" fill="' + COL_A2 + '">' + S.a2 + '</text>';
  }

  svg += '</svg>';
  radarEl.innerHTML = svg;

  /* ═══ Panneau détail ═══ */
  const totalAll = allObs.length;
  const perLabel = synFilters.per === 'all' ? 'MT1 + MT2' : synFilters.per;

  /* Stats combinées pour le détail */
  const combined = {};
  cats.forEach(c => {
    const a1 = statsA1[c] || { r: 0, g: 0, total: 0 };
    const a2 = statsA2[c] || { r: 0, g: 0, total: 0 };
    combined[c] = { r: a1.r + a2.r, g: a1.g + a2.g, total: a1.total + a2.total };
  });

  let html = '<div class="syn-legend">';
  if (showA1 && showA2) {
    html += '<div class="syn-leg"><span style="width:14px;height:3px;background:' + COL_A1 + ';display:inline-block;border-radius:1px;"></span>' + S.a1 + '</div>';
    html += '<div class="syn-leg"><span style="width:14px;height:3px;background:' + COL_A2 + ';display:inline-block;border-radius:1px;border-bottom:1px dashed ' + COL_A2 + ';"></span>' + S.a2 + '</div>';
  }
  html += '</div>';
  html += '<div class="syn-det-title">Detail par categorie</div>';
  html += '<div class="syn-det-sub">' + totalAll + ' observations · ' + perLabel + '</div>';
  html += '<div class="syn-det-list">';

  cats.forEach(c => {
    const cb = combined[c];
    const pct = cb.total > 0 ? Math.round(cb.g / cb.total * 100) : 0;
    const pctColor = pct >= 70 ? COL_GRN : pct >= 40 ? '#854F0B' : COL_RED;
    const fs = fontSize(c);
    const nameFs = Math.max(9, Math.min(14, fs));
    const fillC = fs <= 9 ? 'var(--text-hint)' : 'var(--text-muted)';
    const rPct = cb.total > 0 ? Math.round(cb.r / cb.total * 100) : 0;
    const gPct = cb.total > 0 ? Math.round(cb.g / cb.total * 100) : 0;

    html += '<div class="syn-det-row">' +
      '<span class="syn-det-name" style="font-size:' + nameFs + 'px;color:' + fillC + ';">' + shortName(c) + '</span>' +
      '<div class="syn-det-bar"><div style="width:' + rPct + '%;background:#F09595;"></div><div style="width:' + gPct + '%;background:#97C459;"></div></div>' +
      '<span class="syn-det-counts"><span style="color:' + COL_RED + ';font-weight:500;">' + cb.r + 'R</span> · <span style="color:' + COL_GRN + ';font-weight:500;">' + cb.g + 'V</span></span>' +
      '<span style="font-size:11px;font-weight:500;color:' + pctColor + ';">' + pct + '%</span>' +
      '</div>';
  });

  html += '</div>';
  detailEl.innerHTML = html;
}

/* ── Calcul des stats par catégorie pour un ensemble d'observations ── */
function _buildStats(obs) {
  const map = {};
  obs.forEach(o => {
    const indivCats = Array.isArray(o.cats) ? o.cats : [o.cat];
    indivCats.forEach(c => {
      if (!map[c]) map[c] = { r: 0, g: 0, total: 0 };
      if (o.col === 'red') map[c].r++;
      else                 map[c].g++;
      map[c].total++;
    });
  });
  return map;
}
