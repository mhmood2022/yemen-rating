// ═══ Supabase Client ═══
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://wkdqeghotlipciqiytuj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper: check if user is authenticated
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Helper: sign up
export async function signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
    });
    return { data, error };
}

// Helper: sign in
export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
}

// Helper: sign out
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

// Helper: get profile
export async function getProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return { data, error };
}

// Helper: update profile
export async function updateProfile(userId, updates) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    return { data, error };
}

// Helper: log audit
export async function logAudit(action, entity, entityId, oldValue, newValue) {
    const user = await getCurrentUser();
    const { error } = await supabase.from('audit_logs').insert({
        user_id: user?.id || null,
        action,
        entity,
        entity_id: entityId,
        old_value: oldValue,
        new_value: newValue
    });
    return { error };
}
