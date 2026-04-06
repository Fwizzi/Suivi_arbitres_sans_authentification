/* ═══ OBSERVATIONS — Mode Quick Notes vbeta.3 ════════════════════════════
   • Tap = ouvre obligatoirement la popup tags (plus de tap court)
   • Layout compact 7 colonnes : [cat ✘ ✔] [cat ✘ ✔] ...
   • Tags spécifiques par catégorie + tags généraux
   • Gestion du sifflet dans Positionnement
════════════════════════════════════════════════════════════════════════════ */
import { S, CA, CP, CAU, CAT_TAGS, TAGS_GENERAUX } from './state.js';
import { fmt } from './utils.js';
import { log } from './logger.js';

/* ── Abréviations pour les boutons ── */
const SHORT = {
  'Protocole': 'Proto', 'Jeu Passif': 'Passif',
  'Reprise de dribble': 'R.drib.', 'Continuite': 'Contin.',
  'Communication': 'Comm.', 'Deplacement': 'Déplac.',
  "Zone d'influence": "Z.infl.",
  'Gestion du sifflet': 'Sifflet',
  'Placement': 'Placem.'
};
function shortName(cat) { return SHORT[cat] || cat; }

/* ═══ Construction de la grille Quick Notes (layout compact 7 col) ═════ */
export function buildQuickNotes() {
  const wrap = document.getElementById('quickNotesWrap');
  if (!wrap) return;
  wrap.innerHTML = '';

  ['A1', 'A2'].forEach(arb => {
    const zone = document.createElement('div');
    zone.className = 'qn-zone qn-' + arb.toLowerCase();
    zone.id = 'qnZone_' + arb;

    const nameLabel = arb === 'A1' ? S.a1 : S.a2;

    /* En-tête de zone */
    zone.innerHTML =
      '<div class="qn-header">' +
        '<span class="qn-name">' + arb + ' — ' + nameLabel + '</span>' +
        '<span class="qn-stats" id="qnStats_' + arb + '">0R · 0V</span>' +
      '</div>' +
      '<div class="qn-grid" id="qnGrid_' + arb + '"></div>';
    wrap.appendChild(zone);

    const grid = document.getElementById('qnGrid_' + arb);

    /* Décisions techniques — grille compacte 7 colonnes :
       [catName] [✘] [✔]  [catName] [✘] [✔]  (+ 1 col vide si impair)
       On regroupe les catégories par paires sur une même ligne */
    _addSectionLabel(grid, 'Décisions techniques');
    _addCompactRows(grid, arb, CA);

    /* Positionnement */
    _addSectionLabel(grid, 'Positionnement');
    _addCompactRows(grid, arb, CP);

    /* Autre — toujours sur sa propre ligne */
    const autreRow = document.createElement('div');
    autreRow.className = 'qn-compact-row';

    const autreNameEl = document.createElement('div');
    autreNameEl.className = 'qn-cname';
    autreNameEl.style.fontStyle = 'italic';
    autreNameEl.style.color = '#999';
    autreNameEl.textContent = 'Autre';

    const btnAutreR = _makeTapBtn(arb, 'Autre', 'red');
    btnAutreR.style.borderStyle = 'dashed';
    btnAutreR.style.background = 'transparent';
    btnAutreR.style.color = '#aaa';

    const btnAutreG = _makeTapBtn(arb, 'Autre', 'green');
    btnAutreG.style.borderStyle = 'dashed';
    btnAutreG.style.background = 'transparent';
    btnAutreG.style.color = '#aaa';

    autreRow.appendChild(autreNameEl);
    autreRow.appendChild(btnAutreR);
    autreRow.appendChild(btnAutreG);
    /* Remplir les 3 colonnes restantes */
    for (let i = 0; i < 3; i++) {
      const spacer = document.createElement('div');
      autreRow.appendChild(spacer);
    }
    grid.appendChild(autreRow);
  });

  refreshCounters();
}

/* ── Ajoute un label de section (occupe toute la largeur) ── */
function _addSectionLabel(grid, text) {
  const lbl = document.createElement('div');
  lbl.className = 'qn-section-label';
  lbl.textContent = text;
  grid.appendChild(lbl);
}

/* ── Ajoute les catégories par paires dans une grille 7 colonnes ── */
function _addCompactRows(grid, arb, cats) {
  for (let i = 0; i < cats.length; i += 2) {
    const row = document.createElement('div');
    row.className = 'qn-compact-row';

    /* Première catégorie de la paire */
    const name1 = document.createElement('div');
    name1.className = 'qn-cname';
    name1.textContent = shortName(cats[i]);
    row.appendChild(name1);
    row.appendChild(_makeTapBtn(arb, cats[i], 'red'));
    row.appendChild(_makeTapBtn(arb, cats[i], 'green'));

    /* Deuxième catégorie (si elle existe) */
    if (i + 1 < cats.length) {
      const name2 = document.createElement('div');
      name2.className = 'qn-cname';
      name2.textContent = shortName(cats[i + 1]);
      row.appendChild(name2);
      row.appendChild(_makeTapBtn(arb, cats[i + 1], 'red'));
      row.appendChild(_makeTapBtn(arb, cats[i + 1], 'green'));
    } else {
      /* Impair : remplir les colonnes vides */
      for (let j = 0; j < 3; j++) {
        const spacer = document.createElement('div');
        row.appendChild(spacer);
      }
    }

    grid.appendChild(row);
  }
}

/* ═══ Bouton tap — ouvre TOUJOURS la popup (plus de tap court) ═════════ */
function _makeTapBtn(arb, cat, col) {
  const btn = document.createElement('button');
  btn.className = 'qn-tap ' + col;
  const safeId = 'qnCnt_' + arb + '_' + cat.replace(/[^a-zA-Z0-9]/g, '') + '_' + col;
  btn.innerHTML = (col === 'red' ? '✘' : '✔') +
    '<span class="qn-count" id="' + safeId + '"></span>';

  /* Simple tap → ouvre la popup obligatoirement */
  btn.addEventListener('touchstart', e => { e.preventDefault(); }, { passive: false });
  btn.addEventListener('touchend', e => {
    e.preventDefault();
    _flashBtn(btn);
    _openDetail(arb, cat, col);
  });

  /* Fallback souris (desktop) */
  btn.addEventListener('click', e => {
    e.preventDefault();
    _flashBtn(btn);
    _openDetail(arb, cat, col);
  });

  return btn;
}

function _flashBtn(btn) {
  btn.classList.remove('qn-flash');
  void btn.offsetWidth;
  btn.classList.add('qn-flash');
  if (navigator.vibrate) navigator.vibrate(15);
}

/* ═══ Popup détail (obligatoire à chaque tap) ══════════════════════════ */
function _openDetail(arb, cat, col) {
  S.detailPending = {
    arb: [arb], cat, col,
    time: fmt(S.elapsed),
    el: S.elapsed,
    period: S.period
  };

  const colLabel = col === 'red' ? 'Non conforme' : 'Conforme';
  document.getElementById('detailTitle').textContent = cat + ' — ' + colLabel;
  document.getElementById('detailMeta').textContent =
    arb + ' · ' + fmt(S.elapsed) + ' · ' + S.period;

  /* Construire les tags */
  const tagsWrap = document.getElementById('detailTags');
  tagsWrap.innerHTML = '';

  /* Tag spécial pour ajouter l'autre arbitre */
  const otherArb = arb === 'A1' ? 'A2' : 'A1';
  const tagBoth = document.createElement('button');
  tagBoth.className = 'qn-tag';
  tagBoth.textContent = '+ ' + otherArb + ' aussi';
  tagBoth.style.borderStyle = 'dashed';
  tagBoth.onclick = () => {
    tagBoth.classList.toggle('selected');
    if (tagBoth.classList.contains('selected')) {
      S.detailPending.arb = [arb, otherArb];
    } else {
      S.detailPending.arb = [arb];
    }
  };
  tagsWrap.appendChild(tagBoth);

  /* Tags spécifiques à la catégorie (filtrés par couleur) */
  const catDef = CAT_TAGS[cat];
  if (catDef) {
    const specific = [
      ...(col === 'red' ? catDef.red : catDef.green),
      ...catDef.both
    ];
    specific.forEach(t => {
      const tag = document.createElement('button');
      tag.className = 'qn-tag';
      tag.textContent = t;
      tag.onclick = () => tag.classList.toggle('selected');
      tagsWrap.appendChild(tag);
    });
  }

  /* Séparateur visuel si des tags spécifiques existent */
  if (catDef && (catDef.both.length || catDef.red.length || catDef.green.length)) {
    const sep = document.createElement('div');
    sep.style.cssText = 'width:100%;height:0;border-top:1px dashed var(--border-input);margin:4px 0;';
    tagsWrap.appendChild(sep);
  }

  /* Tags généraux */
  TAGS_GENERAUX.forEach(t => {
    const tag = document.createElement('button');
    tag.className = 'qn-tag';
    tag.textContent = t;
    tag.onclick = () => tag.classList.toggle('selected');
    tagsWrap.appendChild(tag);
  });

  document.getElementById('detailNote').value = '';
  document.getElementById('detailOverlay').classList.add('on');
}

export function closeDetail() {
  document.getElementById('detailOverlay').classList.remove('on');
  S.detailPending = null;
}

export function saveDetail() {
  if (!S.detailPending) return;

  const selectedTags = [];
  document.querySelectorAll('#detailTags .qn-tag.selected').forEach(t => {
    if (!t.textContent.startsWith('+')) selectedTags.push(t.textContent);
  });
  const cmt = document.getElementById('detailNote').value.trim();

  const d = S.detailPending;
  const arbNames = d.arb.map(a => a === 'A1' ? S.a1 : S.a2);

  S.obs.push({
    time: d.time, el: d.el, period: d.period,
    arb: [...d.arb],
    an: arbNames.join(' + '),
    cat: d.cat,
    cats: [d.cat],
    col: d.col,
    tags: selectedTags,
    cmt: cmt
  });

  log.info('OBS', 'observation_enregistree', {
    arbitres: arbNames.join(' + '), categorie: d.cat,
    type: d.col === 'red' ? 'non_conforme' : 'conforme',
    tags: selectedTags.join(', '),
    temps: d.time, periode: d.period,
    totalObservations: S.obs.length
  });

  closeDetail();
  refreshCounters();
  renderTable();
  window.App.autosave();
}

/* ═══ Compteurs ════════════════════════════════════════════════════════ */
export function refreshCounters() {
  ['A1', 'A2'].forEach(arb => {
    let totalR = 0, totalG = 0;
    [...CA, ...CP, CAU].forEach(cat => {
      const safeKey = arb + '_' + cat.replace(/[^a-zA-Z0-9]/g, '') + '_';
      const cR = S.obs.filter(o => o.arb.includes(arb) && o.cat === cat && o.col === 'red').length;
      const cG = S.obs.filter(o => o.arb.includes(arb) && o.cat === cat && o.col === 'green').length;
      totalR += cR; totalG += cG;
      const elR = document.getElementById('qnCnt_' + safeKey + 'red');
      const elG = document.getElementById('qnCnt_' + safeKey + 'green');
      if (elR) elR.textContent = cR || '';
      if (elG) elG.textContent = cG || '';
    });
    const stats = document.getElementById('qnStats_' + arb);
    if (stats) stats.textContent = totalR + 'R · ' + totalG + 'V';
  });

  const oc = document.getElementById('OC');
  if (oc) oc.textContent = S.obs.length + ' obs.';
}

/* ═══ Tableau des observations ═════════════════════════════════════════ */
const PERIOD_WEIGHT = { 'MT1': 0, 'MT2': 1, 'Prol.1': 2, 'Prol.2': 3 };

function chronoKey(obs) {
  const pw = (PERIOD_WEIGHT[obs.period] ?? 0) * 10000;
  return pw + (obs.el || 0);
}

export function sorted(by) {
  const o = [...S.obs];
  if      (by === 'cat')      o.sort((a, b) => a.cat.localeCompare(b.cat));
  else if (by === 'arb')      o.sort((a, b) => a.an.localeCompare(b.an));
  else if (by === 'col')      o.sort((a, b) => a.col.localeCompare(b.col));
  else if (by === 'time_asc') o.sort((a, b) => chronoKey(a) - chronoKey(b));
  else                        o.sort((a, b) => chronoKey(b) - chronoKey(a));
  return o;
}

export function oRow(o) {
  const rc = o.col === 'red' ? 'rr' : 'rg';
  const tl = o.col === 'red' ? 'Non conf./manquante' : 'Conforme';
  const cmtParts = [];
  if (o.tags && o.tags.length) cmtParts.push(o.tags.join(', '));
  if (o.cmt) cmtParts.push(o.cmt);
  const cmtText = cmtParts.join(' · ') || '';

  return '<tr class="' + rc + '">' +
    '<td style="white-space:nowrap;font-variant-numeric:tabular-nums;">' + o.time + '</td>' +
    '<td style="white-space:nowrap;">' + o.period + '</td>' +
    '<td><span class="badge ba">' + o.an + '</span></td>' +
    '<td style="font-weight:700;white-space:nowrap;">' + o.cat + '</td>' +
    '<td><span class="lc">' + tl + '</span></td>' +
    '<td>' + cmtText + '</td></tr>';
}

export function renderTable() {
  const sel = document.getElementById('sortSel');
  const o = sorted(sel ? sel.value : 'time_desc');
  const tb = document.getElementById('OTB');
  if (tb) {
    tb.innerHTML = o.length
      ? o.map(oRow).join('')
      : '<tr><td colspan="6" class="empty">Aucune observation</td></tr>';
  }
  refreshCounters();
}

export function renderEndTable() {
  const sel = document.getElementById('sortSelE');
  const etb = document.getElementById('EETB');
  if (etb) {
    etb.innerHTML = sorted(sel ? sel.value : 'time_desc').map(oRow).join('');
  }
}
