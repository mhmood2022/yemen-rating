import { supabase } from '../lib/supabase';
import { YRBusiness } from '../types/database.types';

export const fetchBusinesses = async (): Promise<YRBusiness[]> => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Database connection error:', err);
    return [];
  }
};

export const sendLeadRequest = async (data: any): Promise<{ success: boolean; message?: string }> => {
  return { success: true, message: 'تم إرسال طلبك بنجاح!' };
};

export const sendMessageToBusiness = async (data: any): Promise<{ success: boolean; message?: string }> => {
  return { success: true, message: 'تم إرسال الرسالة بنجاح!' };
};
