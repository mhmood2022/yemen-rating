// === YEMEN RATING - SB Sync (Bridge between YR_DB and Supabase) ===
// This file initializes YR_DB and ensures the homepage loads properly

(function() {
  'use strict';
  
  console.log('[SB-Sync] Starting initialization...');
  
  // Initialize YR_DB when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSync);
  } else {
    initSync();
  }
  
  function initSync() {
    // Initialize the local database
    if (typeof YR_DB !== 'undefined') {
      YR_DB.init().then(function() {
        console.log('[SB-Sync] YR_DB initialized successfully');
        console.log('[SB-Sync] Companies count:', YR_DB.get('companies').length);
        console.log('[SB-Sync] Banks count:', YR_DB.get('banks').length);
        
        // Dispatch event to notify main.js that data is ready
        window.dispatchEvent(new Event('yr-data-ready'));
      }).catch(function(err) {
        console.error('[SB-Sync] YR_DB initialization failed:', err);
      });
    } else {
      console.warn('[SB-Sync] YR_DB not found, skipping initialization');
    }
  }
  
  // Also try to sync with Supabase if available
  if (typeof window.sb !== 'undefined' || typeof window.yrSupabase !== 'undefined') {
    console.log('[SB-Sync] Supabase client detected, will sync in background');
  }
  
  console.log('[SB-Sync] Script loaded');
})();
