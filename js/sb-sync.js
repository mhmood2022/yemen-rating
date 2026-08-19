// === YEMEN RATING - SB Sync ===
(function() {
  'use strict';
  console.log('[SB-Sync] Starting...');
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSync);
  } else {
    initSync();
  }
  function initSync() {
    if (typeof YR_DB !== 'undefined') {
      YR_DB.init().then(function() {
        console.log('[SB-Sync] YR_DB ready');
        window.dispatchEvent(new Event('yr-data-ready'));
      }).catch(function(e) { console.error('[SB-Sync] Error:', e); });
    }
  }
})();
