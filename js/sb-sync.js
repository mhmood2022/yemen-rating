// ═══════════════════════════════════════════════════════════════
// YEMEN RATING — Realtime Supabase Sync Engine (Production)
// ═══════════════════════════════════════════════════════════════

const SupabaseSync = {
  isSyncing: false,
  lastSyncTime: null,

  async syncAll() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    console.log('🔄 [SupabaseSync] Starting live sync...');

    try {
      const client = await getSB();
      const tablesToSync = [
        'companies', 'banks', 'jobs', 'reviews', 
        'exchange_rates', 'gold_prices', 'cities', 'categories',
        'verification_requests'
      ];

      for (const table of tablesToSync) {
        try {
          const { data, error } = await client.from(table).select('*').limit(500);
          if (!error && data && data.length > 0) {
            YR_DB._cache[table] = data;
            YR_DB._save(table);
            console.log('✅ [SupabaseSync] Synced ' + table + ': ' + data.length + ' records');
          }
        } catch (tblErr) {
          console.warn('⚠️ [SupabaseSync] Table ' + table + ' sync skipped');
        }
      }

      this.lastSyncTime = new Date();
      window.dispatchEvent(new CustomEvent('yr-data-synced', { detail: { timestamp: this.lastSyncTime } }));
      window.dispatchEvent(new Event('yr-data-ready'));
      console.log('🎉 [SupabaseSync] Full sync completed successfully');
    } catch (e) {
      console.error('❌ [SupabaseSync] Sync error:', e);
      window.dispatchEvent(new Event('yr-data-ready'));
    } finally {
      this.isSyncing = false;
    }
  },

  async syncInsert(table, record) {
    try {
      const client = await getSB();
      const { data, error } = await client.from(table).insert([record]).select();
      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (e) {
      console.error('❌ [SupabaseSync] Insert error on ' + table, e);
      return { success: false, error: e.message };
    }
  },

  async syncUpdate(table, id, updates) {
    try {
      const client = await getSB();
      const { data, error } = await client.from(table).update(updates).eq('id', id).select();
      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (e) {
      console.error('❌ [SupabaseSync] Update error on ' + table, e);
      return { success: false, error: e.message };
    }
  }
};

window.SupabaseSync = SupabaseSync;

document.addEventListener('DOMContentLoaded', () => {
  SupabaseSync.syncAll();
});
