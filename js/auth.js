// === نظام المصادقة البسيط (مرحلة 1) ===
const Auth = {
    login(email, password) {
        const users = JSON.parse(localStorage.getItem('yr_users') || '[]');
        // تشفير بسيط لكلمة المرور للمقارنة
        const user = users.find(u => u.email === email && u.password === btoa(password));
        if (user) {
            localStorage.setItem('yr_session', JSON.stringify(user));
            return { success: true, user };
        }
        return { success: false, error: 'بيانات غير صحيحة' };
    },

    logout() {
        localStorage.removeItem('yr_session');
        window.location.href = 'index.html';
    },

    getSession() {
        return JSON.parse(localStorage.getItem('yr_session') || 'null');
    },

    requireRole(role) {
        const session = this.getSession();
        if (!session || session.role !== role) {
            alert('⛔ غير مصرح لك بالدخول');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    },

    register(name, email, password, role = 'user') {
        const users = JSON.parse(localStorage.getItem('yr_users') || '[]');
        if (users.find(u => u.email === email)) {
            return { success: false, error: 'البريد موجود مسبقاً' };
        }
        const newUser = { id: Date.now(), name, email, password: btoa(password), role };
        users.push(newUser);
        localStorage.setItem('yr_users', JSON.stringify(users));
        return { success: true, user: newUser };
    }
};
