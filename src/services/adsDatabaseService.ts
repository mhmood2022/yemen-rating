import { supabase } from '../lib/supabase';
import { PublishedAd } from '../pages/admin/ads/AdGeneratorStudio';
import { LEGACY_PLACEMENT_TO_SECTION } from '../utils/adGeneratorEngine';

export interface ExtendedAdRecord extends PublishedAd {
  adKind?: 'banner' | 'sponsor';
  targetSections?: string[];
  slotKey?: string;
  priority?: number;
  startDate?: string;
  contractExpiry?: string;
  lastServedAt?: string;
  sponsorTag?: string;
  advertiserName?: string;
  title?: string;
  accentColor?: string;
  textColor?: string;
  customHeight?: number;
  animationEffect?: string;
}

export const isAdCurrentlyValid = (adData: any): boolean => {
  if (!adData) return false;
  const todayStr = new Date().toISOString().split('T')[0];

  const startDate = adData.startDate || adData.start_date;
  if (startDate && startDate > todayStr) {
    return false;
  }

  const endDate =
    adData.endDate ||
    adData.end_date ||
    adData.contractExpiry ||
    adData.contract_expiry;
  if (endDate && endDate < todayStr) {
    return false;
  }

  return true;
};

const isSponsorRow = (row: any): boolean => {
  const d = row?.data || {};
  return (
    row?.ad_kind === 'sponsor' ||
    row?.placement_id === 'home_sponsor' ||
    row?.is_sponsor === true ||
    d?.adKind === 'sponsor' ||
    Boolean(d?.isSponsor) ||
    Boolean(d?.sponsorTag)
  );
};

const resolveSections = (row: any): string[] => {
  const d = row?.data || {};
  if (Array.isArray(row?.target_sections) && row.target_sections.length > 0) {
    return row.target_sections;
  }
  if (Array.isArray(d?.targetSections) && d.targetSections.length > 0) {
    return d.targetSections;
  }
  const mapped = LEGACY_PLACEMENT_TO_SECTION[String(row?.placement_id || '')];
  return mapped ? [mapped] : ['all'];
};

export const mapRowToPublishedAd = (item: any): ExtendedAdRecord => {
  const d = item?.data || {};
  const adKind: 'banner' | 'sponsor' = isSponsorRow(item) ? 'sponsor' : 'banner';
  return {
    ...d,
    id: item.id,
    placementId: String(item.placement_id || d.placementId || '1'),
    status: item.status || d.status || 'active',
    views: item.views ?? d.views ?? 0,
    clicks: item.clicks ?? d.clicks ?? 0,
    createdAt: item.created_at || d.createdAt || new Date().toISOString(),
    adKind,
    targetSections: resolveSections(item),
    slotKey: item.slot_key || d.slotKey || (adKind === 'sponsor' ? 'header_sponsor' : 'all'),
    priority: Number(item.priority ?? d.priority ?? 1) || 1,
    startDate: item.start_date || d.startDate || '',
    endDate: item.end_date || d.endDate || d.contractExpiry || '',
    contractExpiry: item.end_date || d.contractExpiry || d.endDate || '',
    lastServedAt: item.last_served_at || d.lastServedAt || '1970-01-01T00:00:00Z',
  };
};

const matchesSectionAndSlot = (
  ad: ExtendedAdRecord,
  section: string,
  slot: string,
  adKind: 'banner' | 'sponsor'
): boolean => {
  if ((ad.adKind || 'banner') !== adKind) return false;
  const sections = ad.targetSections || ['all'];
  const sectionOk = sections.includes('all') || sections.includes(section);
  if (!sectionOk) return false;
  const adSlot = ad.slotKey || 'all';
  return slot === 'all' || adSlot === 'all' || adSlot === slot;
};

export const adsDatabaseService = {
  async getAdById(adId: string): Promise<ExtendedAdRecord | null> {
    try {
      const { data, error } = await supabase
        .from('published_ads')
        .select('*')
        .eq('id', adId)
        .maybeSingle();

      if (error || !data) return null;
      return mapRowToPublishedAd(data);
    } catch (err) {
      console.error('Error fetching ad by id:', err);
      return null;
    }
  },

  async getAllAds(adKind?: 'banner' | 'sponsor'): Promise<ExtendedAdRecord[]> {
    try {
      const { data, error } = await supabase
        .from('published_ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      const mapped = data.map(mapRowToPublishedAd);
      return adKind ? mapped.filter((a) => a.adKind === adKind) : mapped;
    } catch (err) {
      console.error('Error fetching all ads:', err);
      return [];
    }
  },

  async getActiveAds(placementId?: string): Promise<ExtendedAdRecord[]> {
    try {
      let query = supabase
        .from('published_ads')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (placementId) {
        query = query.eq('placement_id', String(placementId));
      }

      const { data, error } = await query;
      if (error || !data) return [];

      return data
        .map(mapRowToPublishedAd)
        .filter((ad) => isAdCurrentlyValid(ad));
    } catch (err) {
      console.error('Ads fetch exception:', err);
      return [];
    }
  },

  async getEligibleAdForSlot(
    section: string,
    slot: string = 'all',
    adKind: 'banner' | 'sponsor' = 'banner',
    excludeIds: string[] = []
  ): Promise<ExtendedAdRecord | null> {
    try {
      const { data, error } = await supabase.rpc('get_eligible_ad_for_slot', {
        p_section: section,
        p_slot: slot,
        p_ad_kind: adKind,
        p_exclude_ids: excludeIds,
      });

      if (!error && Array.isArray(data) && data.length > 0) {
        const chosen = mapRowToPublishedAd(data[0]);
        if (chosen && !chosen.mediaUrl?.startsWith('blob:')) {
          return chosen;
        }
      }
    } catch (_) {
      // Fallback handled below if RPC not yet applied
    }

    try {
      const all = await this.getAllAds(adKind);
      const eligible = all.filter(
        (ad) =>
          ad.status === 'active' &&
          isAdCurrentlyValid(ad) &&
          !ad.mediaUrl?.startsWith('blob:') &&
          matchesSectionAndSlot(ad, section, slot, adKind)
      );
      if (eligible.length === 0) return null;

      const pool = eligible.filter((a) => !excludeIds.includes(a.id));
      if (pool.length === 0) return null;
      const scored = pool
        .map((ad) => ({
          ad,
          weight: -Math.log(Math.max(Math.random(), 0.0001)) / Math.max(ad.priority || 1, 1),
        }))
        .sort((a, b) => a.weight - b.weight);
      const chosen = scored[0].ad;
      this.recordImpression(chosen.id);
      return chosen;
    } catch (err) {
      console.error('Fallback eligible ad error:', err);
      return null;
    }
  },

  async getEligibleAdsForSlot(
    section: string,
    adKind: 'sponsor' | 'banner' = 'sponsor',
    limit: number = 4
  ): Promise<ExtendedAdRecord[]> {
    try {
      const { data, error } = await supabase.rpc('get_eligible_ads_for_slot', {
        p_section: section,
        p_slot: adKind === 'sponsor' ? 'header_sponsor' : 'all',
        p_ad_kind: adKind,
        p_limit: limit,
      });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data
          .map(mapRowToPublishedAd)
          .filter((a) => !a.mediaUrl?.startsWith('blob:'));
      }
    } catch (_) {
      // Fallback handled below
    }

    try {
      const all = await this.getAllAds(adKind);
      const eligible = all.filter(
        (ad) =>
          ad.status === 'active' &&
          isAdCurrentlyValid(ad) &&
          !ad.mediaUrl?.startsWith('blob:') &&
          matchesSectionAndSlot(ad, section, adKind === 'sponsor' ? 'header_sponsor' : 'all', adKind)
      );
      return eligible
        .map((ad) => ({
          ad,
          weight: -Math.log(Math.max(Math.random(), 0.0001)) / Math.max(ad.priority || 1, 1),
        }))
        .sort((a, b) => a.weight - b.weight)
        .slice(0, limit)
        .map((x) => x.ad);
    } catch {
      return [];
    }
  },

  async publishAd(ad: ExtendedAdRecord): Promise<boolean> {
    const adKind = ad.adKind || (ad.placementId === 'home_sponsor' ? 'sponsor' : 'banner');
    const sections =
      Array.isArray(ad.targetSections) && ad.targetSections.length > 0
        ? ad.targetSections
        : [LEGACY_PLACEMENT_TO_SECTION[String(ad.placementId || '1')] || 'all'];
    const slotKey = ad.slotKey || (adKind === 'sponsor' ? 'header_sponsor' : 'all');
    const priority = Math.max(1, Number(ad.priority || 1));
    const startDate = ad.startDate || null;
    const endDate = ad.endDate || ad.contractExpiry || null;

    const fullPayload: any = {
      id: ad.id,
      placement_id: String(ad.placementId || '1'),
      status: ad.status || 'active',
      data: {
        ...ad,
        adKind,
        targetSections: sections,
        slotKey,
        priority,
        startDate: startDate || '',
        endDate: endDate || '',
      },
      views: ad.views || 0,
      clicks: ad.clicks || 0,
      ad_kind: adKind,
      target_sections: sections,
      slot_key: slotKey,
      priority,
      start_date: startDate,
      end_date: endDate,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('published_ads').upsert(fullPayload);
      if (!error) return true;

      // Fallback if migration columns haven't been added yet
      const basePayload = {
        id: ad.id,
        placement_id: String(ad.placementId || '1'),
        status: ad.status || 'active',
        data: fullPayload.data,
        views: ad.views || 0,
        clicks: ad.clicks || 0,
        updated_at: new Date().toISOString(),
      };
      const { error: err2 } = await supabase.from('published_ads').upsert(basePayload);
      if (err2) {
        console.error('خطأ في رفع الإعلان إلى Supabase:', err2);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Ads publish exception:', err);
      return false;
    }
  },

  async updateAdStatus(adId: string, status: 'active' | 'paused'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('published_ads')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', adId);

      return !error;
    } catch (err) {
      console.error('فشل تحديث حالة الإعلان:', err);
      return false;
    }
  },

  async deleteAd(adId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('published_ads').delete().eq('id', adId);
      return !error;
    } catch {
      return false;
    }
  },

  async recordImpression(adId: string) {
    try {
      const { error } = await supabase.rpc('record_ad_impression', { p_ad_id: adId });
      if (!error) return;
      const { data } = await supabase
        .from('published_ads')
        .select('views')
        .eq('id', adId)
        .maybeSingle();
      await supabase
        .from('published_ads')
        .update({ views: (data?.views || 0) + 1 })
        .eq('id', adId);
    } catch (err) {
      console.error('Error recording impression:', err);
    }
  },

  async recordClick(adId: string) {
    try {
      const { error } = await supabase.rpc('record_ad_click', { p_ad_id: adId });
      if (!error) return;
      const { data } = await supabase
        .from('published_ads')
        .select('clicks')
        .eq('id', adId)
        .maybeSingle();
      await supabase
        .from('published_ads')
        .update({ clicks: (data?.clicks || 0) + 1 })
        .eq('id', adId);
    } catch (err) {
      console.error('Error recording click:', err);
    }
  },
};
