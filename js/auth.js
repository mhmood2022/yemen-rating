// ═══════════════════════════════════════════════════════════════
// YEMEN RATING - Real Supabase Authentication Engine (Production)
// ═══════════════════════════════════════════════════════════════

const Auth = {
  async getClient() {
    return await getSB();
  },

  // الحصول على الجلسة الحالية
  async getSession() {
    try {
      const client = await this.getClient();
      const { data: { session }, error } = await client.auth.getSession();
      if (error || !session) return null;
      return session;
    } catch (e) {
      console.error('Session retrieval error:', e);
      return null;
    }
  },

  // الحصول على ملف المستخدم ودوره
  async getCurrentUser() {
    try {
      const session = await this.getSession();
      if (!session || !session.user) return null;

      const client = await this.getClient();
      const { data: profile, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.warn('Profile fetch error, fallback to session user:', error);
        return {
          id: session.user.id,
          email: session.user.email,
          role: 'user',
          full_name: session.user.user_metadata?.full_name || session.user.email
        };
      }

      return {
        ...session.user,
        ...profile
      };
    } catch (e) {
      console.error('Error fetching current user:', e);
      return null;
    }
  },

  // تسجيل الدخول
  async login(email, password) {
    try {
      const client = await this.getClient();
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        return { success: false, error: error.message || 'فشل تسجيل الدخول، تحقق من البيانات.' };
      }

      // جلب الملف والدور
      const { data: profile } = await client
        .from('profiles')
        .select('role, full_name')
        .eq('id', data.user.id)
        .single();

      return { 
        success: true, 
        user: data.user,
        profile: profile,
        role: profile?.role || 'user'
      };
    } catch (e) {
      return { success: false, error: e.message || 'خطأ غير متوقع أثناء الاتصال' };
    }
  },

  // تسجيل حساب جديد
  async register(name, email, password, role = 'user') {
    try {
      const client = await this.getClient();
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: name.trim(),
            role: role
          }
        }
      });

      if (error) {
        return { success: false, error: error.message || 'فشل إنشاء الحساب' };
      }

      // تحديث أو التأكد من إدراج الـ Role في profiles
      if (data.user) {
        await client.from('profiles').upsert({
          id: data.user.id,
          email: email.trim(),
          full_name: name.trim(),
          role: role
        });
      }

      return { success: true, user: data.user };
    } catch (e) {
      return { success: false, error: e.message || 'خطأ أثناء إنشاء الحساب' };
    }
  },

  // تسجيل الخروج
  async logout(redirectUrl = 'index.html') {
    try {
      const client = await this.getClient();
      await client.auth.signOut();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      window.location.href = redirectUrl;
    }
  },

  // فحص صلاحية الأدمن
  async isAdmin() {
    const user = await this.getCurrentUser();
    return user && (user.role === 'admin' || user.role === 'super_admin');
  },

  // حماية صفحات الإدارة
  async requireAdmin(redirectUrl = 'index.html') {
    const isAdm = await this.isAdmin();
    if (!isAdm) {
      alert('⛔ غير مصرح لك بالدخول إلى لوحة التحكم الإدارية.');
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }
};

window.Auth = Auth;
