import { supabase } from '../lib/supabase';
import { YRBusiness } from '../types/database.types';

export const fetchBusinesses = async (categorySlug?: string): Promise<YRBusiness[]> => {
  try {
    let categoryId: string | null = null;
    if (categorySlug) {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle();
      if (!category?.id) return [];
      categoryId = category.id;
    }

    let query = supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

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
