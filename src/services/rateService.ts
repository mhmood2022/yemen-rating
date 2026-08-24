import { supabase } from '../lib/supabaseClient';
import { ExchangeRate } from '../types/database.types';

export const rateService = {
  // جلب أسعار الصرف الحية مع المقارنة بالسعر السابق
  async getLiveRates(market: 'sanaa' | 'aden' = 'sanaa'): Promise<ExchangeRate[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('exchange_rates')
          .select('*')
          .eq('market', market)
          .order('currency_code', { ascending: true });
        if (!error && data && data.length > 0) return data as ExchangeRate[];
      } catch (err) {
        console.warn('Rates fetch fallback:', err);
      }
    }

    if (market === 'sanaa') {
      return [
        { id: '1', market: 'sanaa', currency_code: 'USD', buy_price: 535, sell_price: 532, previous_buy_price: 535, previous_sell_price: 532, source_name: 'سوق صنعاء', created_at: new Date().toISOString() },
        { id: '2', market: 'sanaa', currency_code: 'SAR', buy_price: 140.5, sell_price: 139.8, previous_buy_price: 140.5, previous_sell_price: 139.8, source_name: 'سوق صنعاء', created_at: new Date().toISOString() },
        { id: '3', market: 'sanaa', currency_code: 'GOLD21', buy_price: 32000, sell_price: 34500, previous_buy_price: 31800, previous_sell_price: 34200, source_name: 'سوق الصاغة', created_at: new Date().toISOString() }
      ];
    } else {
      return [
        { id: '4', market: 'aden', currency_code: 'USD', buy_price: 1540, sell_price: 1530, previous_buy_price: 1535, previous_sell_price: 1525, source_name: 'سوق عدن', created_at: new Date().toISOString() },
        { id: '5', market: 'aden', currency_code: 'SAR', buy_price: 410, sell_price: 408, previous_buy_price: 409, previous_sell_price: 407, source_name: 'سوق عدن', created_at: new Date().toISOString() },
        { id: '6', market: 'aden', currency_code: 'GOLD21', buy_price: 92000, sell_price: 98000, previous_buy_price: 91500, previous_sell_price: 97500, source_name: 'سوق الصاغة', created_at: new Date().toISOString() }
      ];
    }
  },

  // تحويل العملات اللحظي
  calculateConversion(amount: number, fromCurrency: string, market: 'sanaa' | 'aden'): { total: number; rate: number } {
    let rate = 1540;
    if (fromCurrency === 'USD') rate = (market === 'aden') ? 1540 : 535;
    if (fromCurrency === 'SAR') rate = (market === 'aden') ? 410 : 140.5;
    if (fromCurrency === 'AED') rate = (market === 'aden') ? 419 : 145;
    if (fromCurrency === 'EUR') rate = (market === 'aden') ? 1670 : 580;
    return { total: Math.round(amount * rate), rate };
  }
};
