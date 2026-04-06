/* ═══ MAIN — Point d'entrée v0.3.5 (sans auth, Quick Notes) ═════════════ */
import { applyTheme, toggleTheme, showAlert, closeAlert, buildQs, setAns } from './ui.js';
import { updateCD, toggleChrono, resumeTme, tickC, advPeriod, activerProlong, resetChrono, applyRecal } from './timer.js';
import { chgScore, buildTme, refreshTme, addTme, deleteTme, tmeVal } from './score.js';
import { buildQuickNotes, closeDetail, saveDetail, refreshCounters, renderTable, renderEndTable, sorted } from './observations.js';
import { setSynFilter, buildSynTable } from './synthesis.js';
import { exportPDF } from './pdf.js';
import { autosave, checkResume, resumeMatch, discardMatch, saveToHistory, openHistory, closeHistory, renderHistory, deleteHistory, reexportPDF } from './storage.js';
import { startMatch, endMatch, backMatch, goHome } from './match.js';
import { pad } from './utils.js';
import { log, exportLogs } from './logger.js';
import { APP_VERSION, APP_YEAR, APP_AUTHOR } from './version.js';

/* ── Registre central ── */
window.App = {
  showAlert, closeAlert, buildQs, setAns, applyTheme, toggleTheme,
  updateCD, toggleChrono, resumeTme, advPeriod, activerProlong, resetChrono, applyRecal,
  chgScore, buildTme, refreshTme, addTme, deleteTme,
  buildQuickNotes, closeDetail, saveDetail, refreshCounters, renderTable, renderEndTable,
  setSynFilter, buildSynTable,
  exportPDF,
  autosave, checkResume, resumeMatch, discardMatch, saveToHistory,
  openHistory, closeHistory, renderHistory, deleteHistory, reexportPDF,
  startMatch, endMatch, backMatch, goHome,
  exportLogs
};

/* ── Exposition window ── */
window.startMatch          = startMatch;
window.endMatch            = endMatch;
window.backMatch           = backMatch;
window.goHome              = goHome;
window.toggleChrono        = toggleChrono;
window.resumeTme           = resumeTme;
window.applyRecal          = applyRecal;
window.activerProlong      = activerProlong;
window.resetChrono         = resetChrono;
window.chgScore            = chgScore;
window.addTme              = (t, i) => window.App.addTme(t, i);
window.deleteTme           = (t, i) => window.App.deleteTme(t, i);
window.setSynFilter        = setSynFilter;
window.exportPDF           = exportPDF;
window.resumeMatch         = resumeMatch;
window.discardMatch        = discardMatch;
window.openHistory         = openHistory;
window.closeHistory        = closeHistory;
window.deleteHistory       = deleteHistory;
window.reexportPDF         = reexportPDF;
window.toggleTheme         = toggleTheme;
window.closeAlert          = closeAlert;
window.setAns              = setAns;
window.exportLogs          = exportLogs;
window.renderTable         = renderTable;
window.renderEndTable      = renderEndTable;
window.closeDetail         = closeDetail;
window.saveDetail          = saveDetail;

/* ── Erreurs globales ── */
window.addEventListener('error', e => {
  log.error('GLOBAL', 'js_erreur_non_geree', { message: e.message, source: e.filename, ligne: e.lineno });
});
window.addEventListener('unhandledrejection', e => {
  log.error('GLOBAL', 'promise_rejetee_non_geree', { message: e.reason?.message || String(e.reason) });
});

/* ── Initialisation ── */
window.addEventListener('load', () => {
  log.info('LIFECYCLE', 'app_initialisee', { version: APP_VERSION });

  document.querySelectorAll('.copyright-bar').forEach(el => {
    const btn = el.querySelector('button');
    el.innerHTML =
      '\u00a9 ' + APP_YEAR + ' <strong>' + APP_AUTHOR + '</strong>' +
      ' \u2014 Tous droits r\u00e9serv\u00e9s \u2014 <span style="opacity:.6;font-size:.9em;">v' + APP_VERSION + '</span>';
    if (btn) el.appendChild(btn);
  });
  document.querySelectorAll('.copyright-bar-inline').forEach(el => {
    el.style.cssText = 'font-size:10px;color:#bbb;text-align:center;padding:4px 0;';
    el.innerHTML =
      '\u00a9 ' + APP_YEAR + ' <strong style="color:#999;">' + APP_AUTHOR + '</strong>' +
      ' \u2014 <span style="opacity:.6;">v' + APP_VERSION + '</span>';
  });

  const saved       = localStorage.getItem('arbitres_hb_theme');
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const isDark      = saved === 'dark' || (!saved && prefersDark);
  applyTheme(isDark, false);
  document.documentElement.classList.remove('dark-init');

  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('arbitres_hb_theme')) applyTheme(e.matches, false);
  });

  document.getElementById('rMin').addEventListener('input', function () {
    if (this.value.length >= 2) document.getElementById('rSec').focus();
  });

  /* Pas d'auth : afficher directement l'écran setup */
  document.getElementById('SS').style.display = 'flex';
  checkResume();

  /* Fermer l'overlay détail en cliquant en dehors de la sheet */
  document.getElementById('detailOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('detailOverlay')) closeDetail();
  });

  const now = new Date();
  document.getElementById('mDate').value = pad(now.getDate()) + '/' + pad(now.getMonth()+1) + '/' + now.getFullYear();
  document.getElementById('mTime').value = pad(now.getHours()) + ':' + pad(now.getMinutes());
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(() => log.info('SW', 'service_worker_enregistre'))
    .catch(e  => log.error('SW', 'service_worker_erreur', { message: e.message }));
}
