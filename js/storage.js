/* ═══ STORAGE — Persistance locale (sans auth) ═════════════════════════
   v0.3.5 — Suppression de la couche auth/backend
════════════════════════════════════════════════════════════════════════════ */
import { S, ans, KEY_CURRENT, KEY_HISTORY } from './state.js';
import { fmtDate } from './utils.js';
import { log } from './logger.js';

export function autosave() {
  try {
    const snap = {
      S:       JSON.parse(JSON.stringify(S)),
      ans:     JSON.parse(JSON.stringify(ans)),
      ctx:     document.getElementById('ctxTA') ? document.getElementById('ctxTA').value : '',
      savedAt: Date.now(),
      period:  S.period
    };
    const payload = JSON.stringify(snap);
    localStorage.setItem(KEY_CURRENT, payload);
    log.info('STORAGE', 'autosave_ok', { nbObs: S.obs.length, periode: S.period, tailleOctets: payload.length });
  } catch (e) {
    log.error('STORAGE', 'autosave_erreur', { message: e.message, name: e.name });
  }
}

export function checkResume() {
  try {
    const raw = localStorage.getItem(KEY_CURRENT);
    if (!raw) return;
    const snap = JSON.parse(raw);
    if (!snap?.S) return;
    const ageMs = Date.now() - (snap.savedAt || 0);
    log.info('STORAGE', 'match_interrompu_detecte', {
      equipeA: snap.S.tA, equipeB: snap.S.tB,
      nbObs: (snap.S.obs || []).length,
      periode: snap.S.period,
      ageMinutes: Math.round(ageMs / 60000)
    });
    const d       = new Date(snap.savedAt);
    const dateStr = d.toLocaleDateString('fr-FR') + ' à ' +
                    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const title   = (snap.S.tA || '?') + ' vs ' + (snap.S.tB || '?');
    document.getElementById('resumeTitle').textContent = title;
    document.getElementById('resumeDesc').textContent  =
      'Interrompu le ' + dateStr + ' — ' + (snap.S.obs || []).length + ' observation(s), ' + snap.S.period;
    document.getElementById('resumeBanner').classList.add('on');
  } catch (e) {
    log.error('STORAGE', 'check_resume_erreur', { message: e.message });
  }
}

export function resumeMatch() {
  try {
    const raw = localStorage.getItem(KEY_CURRENT);
    if (!raw) return;
    const snap = JSON.parse(raw);
    log.info('LIFECYCLE', 'match_repris', { equipeA: snap.S.tA, equipeB: snap.S.tB });
    Object.keys(snap.S).forEach(k => { S[k] = snap.S[k]; });
    Object.keys(snap.ans).forEach(k => { ans[k] = snap.ans[k]; });

    // Compatibilité arrière
    S.obs.forEach(o => {
      if (!Array.isArray(o.arb)) o.arb = o.arb ? [o.arb] : [];
      if (!o.cats) o.cats = [o.cat];
      if (!o.tags) o.tags = [];
    });

    document.getElementById('sTA').textContent = S.tA;
    document.getElementById('sTB').textContent = S.tB;
    document.getElementById('thA').textContent = S.tA;
    document.getElementById('thB').textContent = S.tB;
    document.getElementById('topInfo').innerHTML =
      '<strong>' + S.tA + '</strong> vs <strong>' + S.tB + '</strong> | ' + S.a1 + ' & ' + S.a2;
    const mp = [];
    if (S.mDate) mp.push(fmtDate(S.mDate));
    if (S.mTime) mp.push(S.mTime);
    if (S.mComp) mp.push(S.mComp);
    document.getElementById('topMeta').textContent = mp.join(' · ');
    const pb = document.getElementById('PBadge');
    pb.textContent = S.period;
    if      (S.period === 'MT1') pb.className = 'period-badge p-mt1';
    else if (S.period === 'MT2') pb.className = 'period-badge p-mt2';
    else                          pb.className = 'period-badge p-prol';
    S.run = false;
    document.getElementById('BSS').textContent = 'Reprendre';
    document.getElementById('BSS').className   = 'bc go';
    window.App.updateCD();
    document.getElementById('sA').textContent = S.sA;
    document.getElementById('sB').textContent = S.sB;
    if (snap.ctx) document.getElementById('ctxTA').value = snap.ctx;
    window.App.buildTme();
    window.App.buildQs();
    Object.keys(ans).forEach(id => { if (ans[id]) window.App.setAns(id, ans[id]); });
    window.App.buildQuickNotes();
    window.App.renderTable();
    document.getElementById('resumeBanner').classList.remove('on');
    document.getElementById('SS').style.display = 'none';
    document.getElementById('MS').style.display = 'flex';
  } catch (e) {
    log.error('LIFECYCLE', 'resume_match_erreur', { message: e.message });
    window.App.showAlert('Erreur lors de la reprise : ' + e.message);
  }
}

export function discardMatch() {
  if (!confirm('Supprimer le suivi interrompu ?')) return;
  log.warn('LIFECYCLE', 'match_interrompu_supprime');
  localStorage.removeItem(KEY_CURRENT);
  document.getElementById('resumeBanner').classList.remove('on');
}

export function saveToHistory() {
  try {
    const ctx = document.getElementById('ctxTA')?.value || '';
    const gc  = document.getElementById('GC')?.value    || '';
    const entry = {
      id:      Date.now(),
      savedAt: Date.now(),
      S:       JSON.parse(JSON.stringify(S)),
      ans:     JSON.parse(JSON.stringify(ans)),
      ctx, gc
    };

    const history = _loadHistory();
    history.unshift(entry);
    localStorage.setItem(KEY_HISTORY, JSON.stringify(history));
    localStorage.removeItem(KEY_CURRENT);
    log.info('STORAGE', 'match_sauvegarde_local', { nbObs: S.obs.length });
  } catch (e) {
    log.error('STORAGE', 'save_history_erreur', { message: e.message });
  }
}

export function openHistory() {
  log.info('LIFECYCLE', 'historique_ouvert');
  renderHistory();
  document.getElementById('SS').style.display    = 'none';
  document.getElementById('HistS').style.display = 'flex';
}

export function closeHistory() {
  log.info('LIFECYCLE', 'historique_ferme');
  document.getElementById('HistS').style.display = 'none';
  document.getElementById('SS').style.display    = 'flex';
}

export function renderHistory() {
  const list = document.getElementById('histList');
  const countEl = document.getElementById('histCount');

  const history = _loadHistory();
  countEl.textContent = history.length + ' match(s) sauvegardé(s)';
  if (!history.length) {
    list.innerHTML = '<div class="hist-empty">Aucun match dans l\'historique.<br>Les matchs apparaissent ici après export PDF.</div>';
    return;
  }
  list.innerHTML = history.map((m, i) => `
    <div class="hist-card">
      <div class="hist-card-info">
        <div class="hist-card-title">${m.S.tA} vs ${m.S.tB}</div>
        <div class="hist-card-meta">${m.S.a1} & ${m.S.a2} · ${m.S.mDate || ''}</div>
        <div class="hist-card-score">${m.S.sA} : ${m.S.sB}</div>
      </div>
      <div class="hist-card-actions">
        <button class="btn-act prim" onclick="window.App.reexportPDF(${i})">PDF</button>
        <button class="btn-act" onclick="window.App.deleteHistory(${m.id})">Supprimer</button>
      </div>
    </div>
  `).join('');
}

export function deleteHistory(id) {
  if (!confirm('Supprimer ce match de l\'historique ?')) return;
  const history = _loadHistory().filter(e => e.id !== id);
  log.warn('STORAGE', 'historique_match_supprime_local', { id });
  localStorage.setItem(KEY_HISTORY, JSON.stringify(history));
  renderHistory();
}

export function reexportPDF(idx) {
  const history = _loadHistory();
  if (!history[idx]) return;
  log.info('PDF', 'reexport_depuis_historique', { index: idx });
  const entry = history[idx];
  const savedS   = JSON.parse(JSON.stringify(S));
  const savedAns = JSON.parse(JSON.stringify(ans));
  const savedCtx = document.getElementById('ctxTA')?.value || '';
  const savedGC  = document.getElementById('GC')?.value    || '';
  Object.keys(entry.S).forEach(k   => { S[k]   = entry.S[k];   });
  Object.keys(entry.ans).forEach(k => { ans[k]  = entry.ans[k]; });

  // Compatibilité arrière
  S.obs.forEach(o => {
    if (!Array.isArray(o.arb)) o.arb = o.arb ? [o.arb] : [];
    if (!o.cats) o.cats = [o.cat];
    if (!o.tags) o.tags = [];
  });

  if (document.getElementById('ctxTA')) document.getElementById('ctxTA').value = entry.ctx || '';
  if (document.getElementById('GC'))    document.getElementById('GC').value    = entry.gc  || '';
  window.App.exportPDF();
  setTimeout(() => {
    Object.keys(savedS).forEach(k   => { S[k]  = savedS[k];   });
    Object.keys(savedAns).forEach(k => { ans[k] = savedAns[k]; });
    if (document.getElementById('ctxTA')) document.getElementById('ctxTA').value = savedCtx;
    if (document.getElementById('GC'))    document.getElementById('GC').value    = savedGC;
  }, 500);
}

function _loadHistory() {
  try {
    const raw = localStorage.getItem(KEY_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    log.error('STORAGE', 'load_history_erreur', { message: e.message });
    return [];
  }
}
