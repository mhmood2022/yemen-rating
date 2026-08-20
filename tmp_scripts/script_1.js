
        const YRA = {
            init() {
                YR_DB.init().then(() => {
                    this.checkAuth();
                });
            },

            checkAuth() {
                const session = YR_DB.getSession();
                if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
                    document.getElementById('adminLogin').classList.remove('hidden');
                    document.getElementById('adminWrapper').classList.add('hidden');
                    this.bindLogin();
                    return;
                }
                document.getElementById('adminLogin').classList.add('hidden');
                document.getElementById('adminWrapper').classList.remove('hidden');
                document.getElementById('adminName').textContent = session.name;
                this.renderDashboard();
                this.updateBadges();
            },

            bindLogin() {
                const self = this;
                document.getElementById('adminLoginForm').addEventListener('submit', async function(e) {
                    e.preventDefault();
                    const email = e.target.email.value;
                    const password = e.target.password.value;
                    
                    // محاولة تسجيل الدخول من Supabase أولاً
                    try {
                        const module = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
                        const sb = module.createClient('https://wkdqeghotlipciqiytuj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE');
                        const { data, error } = await sb.auth.signInWithPassword({ email, password });
                        
                        if (!error && data.user) {
                            const { data: profile } = await sb.from('profiles').select('*').eq('id', data.user.id).single();
                            if (profile && (profile.role === 'admin' || profile.role === 'super_admin')) {
                                YR_DB.setSession({
                                    id: profile.id,
                                    name: profile.full_name || 'الإدارة',
                                    email: profile.email,
                                    role: profile.role
                                });
                                location.reload();
                                return;
                            }
                        }
                    } catch (err) {
                        console.warn('Supabase login failed:', err.message);
                    }
                    
                    // fallback إلى localStorage
                    const users = YR_DB.get('users');
                    const user = users.find(u =>
                        u.email === email &&
                        u.password === YR_DB.hash(password) &&
                        u.role === 'admin'
                    );
                    if (user) {
                        YR_DB.setSession(user);
                        location.reload();
                    } else {
                        self.showToast('بيانات الدخول غير صحيحة', 'error');
                    }
                });
            },

            switchTab(tab, el) {
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                if (el) el.classList.add('active');
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                document.getElementById('panel-' + tab).classList.add('active');
                document.getElementById('adminSidebar').classList.remove('open');

                const titles = {
                    dashboard: 'الرئيسية', companies: 'الشركات', banks: 'البنوك',
                    jobs: 'الوظائف', verification: 'طلبات التوثيق',
                    applications: 'طلبات التوظيف', reviews: 'التقييمات', users: 'المستخدمون'
                };
                document.getElementById('pageTitle').textContent = titles[tab] || '';

                if (tab === 'companies') this.renderCompanies();
                if (tab === 'banks') this.renderBanks();
                if (tab === 'jobs') this.renderJobs();
                if (tab === 'verification') this.renderVerification();
                if (tab === 'applications') this.renderApplications();
                if (tab === 'reviews') this.renderReviews();
                if (tab === 'ads') this.renderAds();
                if (tab === 'notifications') this.renderNotifications();
                if (tab === 'users') this.renderUsers();
            },

            renderDashboard() {
                const stats = YR_DB.getStats();
                const verifCount = YR_DB.where('verification_requests', 'status', 'pending').length;
                const pendingJobs = YR_DB.get('jobs').filter(j => j.status === 'pending').length;
                const pendingUsers = YR_DB.where('profiles', 'status', 'PENDING')?.length || 0;
                const notifs = YR_DB.get('notifications').slice(0, 5);
                
                document.getElementById('dashStats').innerHTML =
                    '<div class="stat-card"><div class="icon" style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;"><i class="fas fa-building"></i></div><div><div class="num">' + stats.companies + '</div><div class="lbl">شركة</div></div></div>' +
                    '<div class="stat-card"><div class="icon" style="background:linear-gradient(135deg,#f093fb,#f5576c);color:#fff;"><i class="fas fa-landmark"></i></div><div><div class="num">' + stats.banks + '</div><div class="lbl">بنك</div></div></div>' +
                    '<div class="stat-card"><div class="icon" style="background:linear-gradient(135deg,#4facfe,#00f2fe);color:#fff;"><i class="fas fa-briefcase"></i></div><div><div class="num">' + stats.jobs + '</div><div class="lbl">وظيفة</div></div></div>' +
                    '<div class="stat-card"><div class="icon" style="background:linear-gradient(135deg,#43e97b,#38f9d7);color:#fff;"><i class="fas fa-users"></i></div><div><div class="num">' + stats.users + '</div><div class="lbl">مستخدم</div></div></div>' +
                    '<div class="stat-card"><div class="icon" style="background:linear-gradient(135deg,#fa709a,#fee140);color:#fff;"><i class="fas fa-star"></i></div><div><div class="num">' + stats.reviews + '</div><div class="lbl">تقييم</div></div></div>' +
                    '<div class="stat-card"><div class="icon" style="background:linear-gradient(135deg,#30cfd0,#330867);color:#fff;"><i class="fas fa-bullhorn"></i></div><div><div class="num">' + stats.ads + '</div><div class="lbl">إعلان نشط</div></div></div>' +
                    (pendingJobs > 0 ? '<div class="stat-card" style="border:2px solid var(--warning);"><div class="icon" style="background:var(--warning);color:#fff;"><i class="fas fa-hourglass-half"></i></div><div><div class="num">' + pendingJobs + '</div><div class="lbl">وظيفة بانتظار القبول</div></div></div>' : '') +
                    (verifCount > 0 ? '<div class="stat-card" style="border:2px solid var(--info);"><div class="icon" style="background:var(--info);color:#fff;"><i class="fas fa-circle-check"></i></div><div><div class="num">' + verifCount + '</div><div class="lbl">طلب توثيق معلق</div></div></div>' : '');
                
                // آخر الإشعارات
                const recentNotifs = document.getElementById('recentNotifications');
                if (recentNotifs) {
                    if (notifs.length === 0) {
                        recentNotifs.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">لا توجد إشعارات جديدة</p>';
                    } else {
                        recentNotifs.innerHTML = '<h3 style="margin-bottom:12px;">آخر الإشعارات</h3>' + notifs.map(n => 
                            '<div style="padding:12px;border-right:3px solid var(--gold-500);margin-bottom:8px;background:var(--bg-card);border-radius:6px;">' +
                            '<strong>' + this.esc(n.title) + '</strong><br>' +
                            '<small style="color:var(--text-muted);">' + this.esc(n.message) + ' • ' + new Date(n.createdAt).toLocaleString('ar-YE') + '</small></div>'
                        ).join('');
                    }
                }
            },

            updateBadges() {
                const verifCount = YR_DB.where('verification_requests', 'status', 'pending').length;
                document.getElementById('verifBadge').textContent = verifCount;
                const notifCount = YR_DB.get('notifications').filter(n => !n.read).length;
                const notifBadge = document.getElementById('notifBadge');
                if (notifBadge) {
                    if (notifCount > 0) {
                        notifBadge.textContent = notifCount;
                        notifBadge.style.display = 'inline-block';
                    } else {
                        notifBadge.style.display = 'none';
                    }
                }
            },

            renderCompanies() {
                const body = document.getElementById('companiesBody');
                const companies = YR_DB.get('companies');
                body.innerHTML = companies.map(c => {
                    const status = c.status || (c.verified ? 'active' : 'pending');
                    return '<tr>' +
                    '<td><strong>' + this.esc(c.name) + '</strong><br><small style="color:var(--text-muted);">' + this.esc(c.email || '') + '</small></td>' +
                    '<td>' + this.esc(this.getCityName(c.city)) + '</td>' +
                    '<td><span class="status-badge status-' + status + '">' + this.statusLabel(status) + '</span></td>' +
                    '<td>' + (c.verified ? '<span style="color:var(--success);">✓ موثق</span>' : '<span style="color:var(--text-muted);">غير موثق</span>') + '</td>' +
                    '<td>' + (c.package || 'free') + '</td>' +
                    '<td style="white-space:nowrap;">' +
                    (status === 'pending' ? '<button class="btn btn-sm btn-success" onclick="YRA.approveCompany(\'' + c.id + '\')" title="قبول"><i class="fas fa-check"></i></button> ' : '') +
                    '<button class="btn btn-sm btn-outline" onclick="YRA.editCompany(\'' + c.id + '\')" title="تعديل"><i class="fas fa-edit"></i></button> ' +
                    '<button class="btn btn-sm btn-gold" onclick="YRA.toggleVerify(\'' + c.id + '\',\'companies\')" title="توثيق"><i class="fas fa-certificate"></i></button> ' +
                    '<button class="btn btn-sm btn-danger" onclick="YRA.deleteItem(\'companies\',\'' + c.id + '\')" title="حذف"><i class="fas fa-trash"></i></button>' +
                    '</td></tr>';
                }).join('');
            },

            renderBanks() {
                const body = document.getElementById('banksBody');
                const banks = YR_DB.get('banks');
                body.innerHTML = banks.map(b =>
                    '<tr><td><strong>' + this.esc(b.name) + '</strong></td>' +
                    '<td>' + this.esc(this.getCityName(b.city)) + '</td>' +
                    '<td>' + (b.verified ? '<span style="color:var(--success);">✓ موثق</span>' : '<span style="color:var(--text-muted);">غير موثق</span>') + '</td>' +
                    '<td style="white-space:nowrap;">' +
                    '<button class="btn btn-sm btn-outline" onclick="YRA.editBank(\'' + b.id + '\')" title="تعديل"><i class="fas fa-edit"></i></button> ' +
                    '<button class="btn btn-sm btn-gold" onclick="YRA.toggleVerify(\'' + b.id + '\',\'banks\')" title="توثيق"><i class="fas fa-certificate"></i></button> ' +
                    '<button class="btn btn-sm btn-danger" onclick="YRA.deleteItem(\'banks\',\'' + b.id + '\')" title="حذف"><i class="fas fa-trash"></i></button>' +
                    '</td></tr>'
                ).join('');
            },

            renderJobs() {
                const body = document.getElementById('jobsBody');
                const jobs = YR_DB.get('jobs');
                body.innerHTML = jobs.map(j => {
                    const company = YR_DB.findById('companies', j.companyId);
                    const status = j.status || 'pending';
                    const statusAr = {active:'نشطة',pending:'بانتظار القبول',rejected:'مرفوضة',closed:'مغلقة'}[status] || status;
                    return '<tr>' +
                    '<td><strong>' + this.esc(j.title) + '</strong><br><small style="color:var(--text-muted);">' + this.esc(j.type || '') + '</small></td>' +
                    '<td>' + (company ? this.esc(company.name) : '-') + '</td>' +
                    '<td>' + this.esc(j.salary || '-') + '</td>' +
                    '<td><span class="status-badge status-' + status + '">' + statusAr + '</span></td>' +
                    '<td style="white-space:nowrap;">' +
                    (status === 'pending' ? '<button class="btn btn-sm btn-success" onclick="YRA.approveJob(\'' + j.id + '\')" title="قبول"><i class="fas fa-check"></i></button> ' +
                    '<button class="btn btn-sm btn-danger" onclick="YRA.rejectJob(\'' + j.id + '\')" title="رفض"><i class="fas fa-times"></i></button> ' : '') +
                    '<button class="btn btn-sm btn-outline" onclick="YRA.editJob(\'' + j.id + '\')" title="تعديل"><i class="fas fa-edit"></i></button> ' +
                    '<button class="btn btn-sm btn-danger" onclick="YRA.deleteItem(\'jobs\',\'' + j.id + '\')" title="حذف"><i class="fas fa-trash"></i></button>' +
                    '</td></tr>';
                }).join('');
            },

            renderVerification() {
                const list = document.getElementById('verificationList');
                const requests = YR_DB.get('verification_requests');
                if (requests.length === 0) {
                    list.innerHTML = '<div class="empty-state"><i class="fas fa-circle-check"></i><p>لا توجد طلبات توثيق</p></div>';
                    return;
                }
                list.innerHTML = requests.map(r =>
                    '<div style="background:var(--bg-card);border-radius:var(--radius-md);padding:20px;margin-bottom:12px;border:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
                    '<div><h4 style="color:var(--text-main);">' + this.esc(r.companyName) + '</h4>' +
                    '<p style="color:var(--text-muted);font-size:0.85rem;">' + this.esc(r.phone || '') + ' • ' + this.esc(this.getCityName(r.city)) + '</p>' +
                    '<p style="color:var(--text-muted);font-size:0.85rem;">المستندات: ' + (r.docsCount || 0) + ' ملف</p></div>' +
                    '<div style="display:flex;gap:8px;align-items:center;">' +
                    '<span class="status-badge status-' + r.status + '">' + this.statusLabel(r.status) + '</span>' +
                    (r.status === 'pending' ?
                        '<button class="btn btn-sm btn-gold" onclick="YRA.approveVerif(\'' + r.id + '\')"><i class="fas fa-check"></i> قبول</button>' +
                        '<button class="btn btn-sm btn-outline" onclick="YRA.rejectVerif(\'' + r.id + '\')"><i class="fas fa-times"></i> رفض</button>' : '') +
                    '</div></div>'
                ).join('');
            },

            approveVerif(id) {
                const req = YR_DB.findById('verification_requests', id);
                YR_DB.update('verification_requests', id, { status: 'approved' }).then(() => {
                    // ابحث عن الشركة ووثقها
                    const companies = YR_DB.get('companies');
                    const company = companies.find(c => c.name === req.companyName);
                    if (company) {
                        YR_DB.update('companies', company.id, { verified: true });
                    }
                    this.renderVerification();
                    this.updateBadges();
                    this.showToast('✅ تم قبول التوثيق', 'success');
                });
            },

        // ═══ إدارة المستخدمين ═══
        async approveUser(id) {
          if (!confirm('هل تريد قبول هذا الحساب وتفعيله؟')) return;
          try {
            const module = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            const sb = module.createClient('https://wkdqeghotlipciqiytuj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE');
            const { error } = await sb.from('profiles').update({ status: 'ACTIVE' }).eq('id', id);
            if (error) throw error;
            this.showToast('✅ تم قبول الحساب بنجاح', 'success');
            this.renderUsers();
          } catch (e) {
            this.showToast('❌ خطأ: ' + e.message, 'error');
          }
        },

        async editUser(id, currentStatus) {
          const newStatus = prompt('اختر الحالة الجديدة:\n1. ACTIVE (نشط)\n2. PENDING (معلق)\n3. SUSPENDED (موقوف)\n4. BLOCKED (محظور)', currentStatus);
          if (!newStatus) return;
          const validStatuses = ['ACTIVE', 'PENDING', 'SUSPENDED', 'BLOCKED'];
          if (!validStatuses.includes(newStatus)) {
            this.showToast('⚠️ حالة غير صحيحة', 'error');
            return;
          }
          try {
            const module = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            const sb = module.createClient('https://wkdqeghotlipciqiytuj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE');
            const { error } = await sb.from('profiles').update({ status: newStatus }).eq('id', id);
            if (error) throw error;
            this.showToast('✅ تم تحديث حالة الحساب', 'success');
            this.renderUsers();
          } catch (e) {
            this.showToast('❌ خطأ: ' + e.message, 'error');
          }
        },

        async deleteUser(id) {
          if (!confirm('⚠️ هل أنت متأكد من حذف هذا الحساب؟ هذا الإجراء لا يمكن التراجع عنه!')) return;
          try {
            const module = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            const sb = module.createClient('https://wkdqeghotlipciqiytuj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE');
            const { error } = await sb.from('profiles').delete().eq('id', id);
            if (error) throw error;
            this.showToast('✅ تم حذف الحساب', 'success');
            this.renderUsers();
          } catch (e) {
            this.showToast('❌ خطأ: ' + e.message, 'error');
          }
        },


            
        // ═══ قبول الشركة ═══
        async approveCompany(id) {
            if (!confirm('قبول هذه الشركة وتفعيلها؟')) return;
            await YR_DB.update('companies', id, { status: 'active', verified: true });
            this.notify('تم قبول شركة', 'تم تفعيل شركة جديدة بنجاح');
            this.renderCompanies();
            this.showToast('✅ تم قبول الشركة', 'success');
        },

        // ═══ تعديل شركة ═══
        async editCompany(id) {
            const c = YR_DB.findById('companies', id);
            if (!c) return;
            const name = prompt('اسم الشركة:', c.name) ?? c.name;
            const desc = prompt('الوصف:', c.description || '') ?? c.description;
            const phone = prompt('الهاتف:', c.phone || '') ?? c.phone;
            const email = prompt('البريد:', c.email || '') ?? c.email;
            const pkg = prompt('الباقة (free/silver/gold):', c.package || 'free') ?? c.package;
            await YR_DB.update('companies', id, { name, description: desc, phone, email, package: pkg });
            this.renderCompanies();
            this.showToast('✅ تم تعديل الشركة', 'success');
        },

        // ═══ تعديل بنك ═══
        async editBank(id) {
            const b = YR_DB.findById('banks', id);
            if (!b) return;
            const name = prompt('اسم البنك:', b.name) ?? b.name;
            const desc = prompt('الوصف:', b.description || '') ?? b.description;
            const phone = prompt('الهاتف:', b.phone || '') ?? b.phone;
            await YR_DB.update('banks', id, { name, description: desc, phone });
            this.renderBanks();
            this.showToast('✅ تم تعديل البنك', 'success');
        },

        // ═══ قبول/رفض وظيفة ═══
        async approveJob(id) {
            if (!confirm('قبول هذه الوظيفة ونشرها؟')) return;
            await YR_DB.update('jobs', id, { status: 'active' });
            this.notify('تم قبول وظيفة', 'تم نشر وظيفة جديدة');
            this.renderJobs();
            this.showToast('✅ تم قبول الوظيفة', 'success');
        },

        async rejectJob(id) {
            if (!confirm('رفض هذه الوظيفة؟')) return;
            await YR_DB.update('jobs', id, { status: 'rejected' });
            this.renderJobs();
            this.showToast('تم رفض الوظيفة', 'success');
        },

        // ═══ تعديل وظيفة ═══
        async editJob(id) {
            const j = YR_DB.findById('jobs', id);
            if (!j) return;
            const title = prompt('عنوان الوظيفة:', j.title) ?? j.title;
            const salary = prompt('الراتب:', j.salary || '') ?? j.salary;
            const type = prompt('نوع الدوام:', j.type || '') ?? j.type;
            const desc = prompt('الوصف:', j.description || '') ?? j.description;
            await YR_DB.update('jobs', id, { title, salary, type, description: desc });
            this.renderJobs();
            this.showToast('✅ تم تعديل الوظيفة', 'success');
        },

        // ═══ طلبات التوظيف ═══
        async approveApp(id) {
            if (!confirm('قبول هذا الطلب؟')) return;
            await YR_DB.update('job_applications', id, { status: 'approved' });
            this.renderApplications();
            this.showToast('✅ تم قبول الطلب', 'success');
        },

        async rejectApp(id) {
            if (!confirm('رفض هذا الطلب؟')) return;
            await YR_DB.update('job_applications', id, { status: 'rejected' });
            this.renderApplications();
            this.showToast('تم رفض الطلب', 'success');
        },

        async viewApp(id) {
            const a = YR_DB.findById('job_applications', id);
            if (!a) return;
            alert('👤 ' + a.name + '\n📞 ' + (a.phone || '-') + '\n📧 ' + (a.email || '-') + '\n\n📝 ' + (a.coverLetter || 'لا يوجد رسالة'));
        },

        // ═══ الإعلانات ═══
        renderAds() {
            const list = document.getElementById('adsList');
            const ads = YR_DB.get('ads');
            if (ads.length === 0) {
                list.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-bullhorn"></i><p>لا توجد إعلانات بعد</p></div>';
                return;
            }
            list.innerHTML = ads.map(a =>
                '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px;position:relative;">' +
                (a.active ? '' : '<div style="position:absolute;top:8px;left:8px;background:var(--danger);color:#fff;padding:2px 8px;border-radius:12px;font-size:0.75rem;">مخفي</div>') +
                '<h4 style="color:var(--gold-500);margin-bottom:8px;">' + this.esc(a.title) + '</h4>' +
                '<p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:12px;">' + this.esc(a.subtitle || '') + '</p>' +
                '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
                '<button class="btn btn-sm btn-outline" onclick="YRA.editAd(\'' + a.id + '\')"><i class="fas fa-edit"></i></button>' +
                '<button class="btn btn-sm btn-gold" onclick="YRA.toggleAd(\'' + a.id + '\')"><i class="fas fa-' + (a.active ? 'eye-slash' : 'eye') + '"></i></button>' +
                '<button class="btn btn-sm btn-danger" onclick="YRA.deleteAd(\'' + a.id + '\')"><i class="fas fa-trash"></i></button>' +
                '</div></div>'
            ).join('');
        },

        openAdModal() {
            const title = prompt('عنوان الإعلان:');
            if (!title) return;
            const subtitle = prompt('النص الفرعي:') || '';
            const link = prompt('الرابط (اختياري):') || '#';
            YR_DB.add('ads', { title, subtitle, link, priority: 1, active: true });
            this.notify('إعلان جديد', 'تم إضافة: ' + title);
            this.renderAds();
            this.showToast('✅ تم إضافة الإعلان', 'success');
        },

        async editAd(id) {
            const a = YR_DB.findById('ads', id);
            if (!a) return;
            const title = prompt('العنوان:', a.title) ?? a.title;
            const subtitle = prompt('النص:', a.subtitle || '') ?? a.subtitle;
            const link = prompt('الرابط:', a.link || '#') ?? a.link;
            await YR_DB.update('ads', id, { title, subtitle, link });
            this.renderAds();
            this.showToast('✅ تم التعديل', 'success');
        },

        async toggleAd(id) {
            const a = YR_DB.findById('ads', id);
            if (!a) return;
            await YR_DB.update('ads', id, { active: !a.active });
            this.renderAds();
            this.showToast(a.active ? 'تم إخفاء الإعلان' : 'تم تفعيل الإعلان', 'success');
        },

        async deleteAd(id) {
            if (!confirm('حذف هذا الإعلان؟')) return;
            await YR_DB.delete('ads', id);
            this.renderAds();
            this.showToast('تم الحذف', 'success');
        },

        // ═══ الإشعارات ═══
        notify(title, message) {
            YR_DB.add('notifications', { title, message, read: false });
            this.updateBadges();
        },

        renderNotifications() {
            const list = document.getElementById('notifList');
            const notifs = YR_DB.get('notifications');
            if (notifs.length === 0) {
                list.innerHTML = '<div class="empty-state"><i class="fas fa-bell-slash"></i><p>لا توجد إشعارات</p></div>';
                return;
            }
            // تعليم الكل كمقروء
            notifs.forEach(n => { if (!n.read) YR_DB.update('notifications', n.id, { read: true }); });
            this.updateBadges();
            
            list.innerHTML = notifs.map(n =>
                '<div style="background:var(--bg-card);border-right:4px solid ' + (n.read ? 'var(--border)' : 'var(--gold-500)') + ';padding:16px;margin-bottom:10px;border-radius:8px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:start;">' +
                '<div><strong style="color:var(--text-main);">' + this.esc(n.title) + '</strong>' +
                '<p style="color:var(--text-muted);margin:6px 0;">' + this.esc(n.message) + '</p>' +
                '<small style="color:var(--text-muted);font-size:0.8rem;">' + new Date(n.createdAt).toLocaleString('ar-YE') + '</small></div>' +
                '<button class="btn btn-sm btn-danger" onclick="YRA.deleteNotif(\'' + n.id + '\')"><i class="fas fa-times"></i></button>' +
                '</div></div>'
            ).join('');
        },

        async deleteNotif(id) {
            await YR_DB.delete('notifications', id);
            this.renderNotifications();
        },

        clearNotifications() {
            if (!confirm('مسح جميع الإشعارات؟')) return;
            YR_DB._cache.notifications = [];
            YR_DB._save('notifications');
            this.renderNotifications();
            this.updateBadges();
            this.showToast('تم مسح الإشعارات', 'success');
        },

rejectVerif(id) {
                YR_DB.update('verification_requests', id, { status: 'rejected' }).then(() => {
                    this.renderVerification();
                    this.updateBadges();
                    this.showToast('تم رفض التوثيق', 'success');
                });
            },

            renderApplications() {
                const body = document.getElementById('appsBody');
                const apps = YR_DB.get('job_applications');
                body.innerHTML = apps.map(a => {
                    const job = YR_DB.findById('jobs', a.jobId);
                    return '<tr>' +
                    '<td><strong>' + this.esc(a.name) + '</strong><br><small style="color:var(--text-muted);">' + (job ? this.esc(job.title) : '-') + '</small></td>' +
                    '<td>' + this.esc(a.phone || '-') + '</td>' +
                    '<td>' + (a.cvFileName ? '<a href="' + (a.cvUrl || '#') + '" target="_blank" style="color:var(--gold-500);"><i class="fas fa-file-pdf"></i> ' + this.esc(a.cvFileName) + '</a>' : '-') + '</td>' +
                    '<td><span class="status-badge status-' + a.status + '">' + this.statusLabel(a.status) + '</span></td>' +
                    '<td style="white-space:nowrap;">' +
                    (a.status === 'pending' ? '<button class="btn btn-sm btn-success" onclick="YRA.approveApp(\'' + a.id + '\')" title="قبول"><i class="fas fa-check"></i></button> ' +
                    '<button class="btn btn-sm btn-danger" onclick="YRA.rejectApp(\'' + a.id + '\')" title="رفض"><i class="fas fa-times"></i></button> ' : '') +
                    '<button class="btn btn-sm btn-outline" onclick="YRA.viewApp(\'' + a.id + '\')" title="عرض"><i class="fas fa-eye"></i></button>' +
                    '</td></tr>';
                }).join('');
            },

            renderReviews() {
                const body = document.getElementById('reviewsBody');
                const reviews = YR_DB.get('reviews');
                body.innerHTML = reviews.map(r =>
                    '<tr><td>' + this.esc(r.userName) + '</td>' +
                    '<td style="color:var(--gold-400);">' + '★'.repeat(r.stars) + '</td>' +
                    '<td>' + this.esc((r.comment || '').substring(0, 50)) + '</td>' +
                    '<td><button class="icon-btn delete" onclick="YRA.deleteItem(\'reviews\',\'' + r.id + '\')"><i class="fas fa-trash"></i></button></td></tr>'
                ).join('');
            },

            renderUsers() {
            const body = document.getElementById('usersBody');
            body.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">جاري التحميل...</td></tr>';
            
            (async () => {
              try {
                const module = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
                const sb = module.createClient('https://wkdqeghotlipciqiytuj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE');
                const { data: profiles, error } = await sb.from('profiles').select('id,full_name,email,role,phone,status').order('created_at', {ascending: false});
                
                if (error) throw error;
                
                const roles = { super_admin: 'إدارة عليا', admin: 'إدارة', user: 'مستخدم', company_owner: 'مالك شركة', bank_owner: 'مالك بنك' };
                const statusLabels = { ACTIVE: '✅ نشط', PENDING: '⏳ معلق', SUSPENDED: '⛔ موقوف', BLOCKED: '🚫 محظور' };
                
                if (!profiles || profiles.length === 0) {
                  body.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-muted);">لا يوجد مستخدمون</td></tr>';
                  return;
                }
                
                body.innerHTML = profiles.map(u => 
                  '<tr>' +
                  '<td><strong>' + this.esc(u.full_name || 'غير محدد') + '</strong>' + (u.phone ? '<br><small style="color:var(--text-muted);">' + u.phone + '</small>' : '') + '</td>' +
                  '<td>' + this.esc(u.email) + '</td>' +
                  '<td>' + (roles[u.role] || u.role) + '</td>' +
                  '<td>' + (statusLabels[u.status] || u.status) + '</td>' +
                  '<td>' +
                  (u.role !== 'super_admin' ? (
                    (u.status === 'PENDING' ? '<button class="icon-btn approve" onclick="YRA.approveUser(\'' + u.id + '\')" style="background:var(--green-600);color:white;padding:6px 10px;border-radius:6px;border:none;cursor:pointer;"><i class="fas fa-check"></i> قبول</button> ' : '') +
                    '<button class="icon-btn edit" onclick="YRA.editUser(\'' + u.id + '\', \'' + u.status + '\')" style="background:var(--gold-500);color:var(--navy-900);padding:6px 10px;border-radius:6px;border:none;cursor:pointer;margin:2px;"><i class="fas fa-edit"></i></button> ' +
                    '<button class="icon-btn delete" onclick="YRA.deleteUser(\'' + u.id + '\')" style="background:var(--red-600);color:white;padding:6px 10px;border-radius:6px;border:none;cursor:pointer;margin:2px;"><i class="fas fa-trash"></i></button>'
                  ) : '<span style="color:var(--text-muted);font-size:0.8rem;">حساب رئيسي</span>') +
                  '</td></tr>'
                ).join('');
              } catch (e) {
                console.error('Error loading users:', e);
                body.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--red-600);">خطأ: ' + e.message + '</td></tr>';
              }
            })();
        },

            openAddCompany() {
                const self = this;
                this.openModal(
                    '<div class="modal-head"><h3><i class="fas fa-plus"></i> إضافة شركة</h3>' +
                    '<button class="modal-close" onclick="YRA.closeModal()"><i class="fas fa-times"></i></button></div>' +
                    '<div class="modal-body"><form id="addCompanyForm">' +
                    '<div class="form-group"><label>اسم الشركة</label><input type="text" class="form-control" name="name" required></div>' +
                    '<div class="form-row">' +
                    '<div class="form-group"><label>التصنيف</label><select class="form-control" name="category" id="addCatSelect"></select></div>' +
                    '<div class="form-group"><label>المدينة</label><select class="form-control" name="city" id="addCitySelect"></select></div>' +
                    '</div>' +
                    '<div class="form-group"><label>الوصف</label><textarea class="form-control" name="description"></textarea></div>' +
                    '<div class="form-group"><label>الهاتف</label><input type="tel" class="form-control" name="phone"></div>' +
                    '<label style="display:flex;align-items:center;gap:8px;margin-bottom:16px;"><input type="checkbox" name="verified"><span>موثق ✓</span></label>' +
                    '<button type="submit" class="btn btn-gold btn-block">إضافة</button>' +
                    '</form></div>'
                );
                const catSelect = document.getElementById('addCatSelect');
                const citySelect = document.getElementById('addCitySelect');
                YR_DB.get('categories').forEach(c => catSelect.innerHTML += '<option value="' + c.id + '">' + c.name + '</option>');
                YR_DB.get('cities').forEach(c => citySelect.innerHTML += '<option value="' + c.id + '">' + c.name + '</option>');

                document.getElementById('addCompanyForm').addEventListener('submit', function(e) {
                    e.preventDefault();
                    const fd = new FormData(e.target);
                    YR_DB.add('companies', {
                        name: fd.get('name'), category: fd.get('category'), city: fd.get('city'),
                        description: fd.get('description'), phone: fd.get('phone'),
                        verified: fd.get('verified') === 'on', package: 'free'
                    }).then(() => { self.closeModal(); self.renderCompanies(); self.showToast('✅ تمت الإضافة', 'success'); });
                });
            },

            openAddBank() {
                const self = this;
                this.openModal(
                    '<div class="modal-head"><h3><i class="fas fa-plus"></i> إضافة بنك</h3>' +
                    '<button class="modal-close" onclick="YRA.closeModal()"><i class="fas fa-times"></i></button></div>' +
                    '<div class="modal-body"><form id="addBankForm">' +
                    '<div class="form-group"><label>اسم البنك</label><input type="text" class="form-control" name="name" required></div>' +
                    '<div class="form-group"><label>المدينة</label><select class="form-control" name="city" id="bankCitySelect"></select></div>' +
                    '<div class="form-group"><label>الوصف</label><textarea class="form-control" name="description"></textarea></div>' +
                    '<div class="form-group"><label>الهاتف</label><input type="tel" class="form-control" name="phone"></div>' +
                    '<button type="submit" class="btn btn-gold btn-block">إضافة</button>' +
                    '</form></div>'
                );
                const citySelect = document.getElementById('bankCitySelect');
                YR_DB.get('cities').forEach(c => citySelect.innerHTML += '<option value="' + c.id + '">' + c.name + '</option>');

                document.getElementById('addBankForm').addEventListener('submit', function(e) {
                    e.preventDefault();
                    const fd = new FormData(e.target);
                    YR_DB.add('banks', {
                        name: fd.get('name'), city: fd.get('city'),
                        description: fd.get('description'), phone: fd.get('phone'), verified: true
                    }).then(() => { self.closeModal(); self.renderBanks(); self.showToast('✅ تمت الإضافة', 'success'); });
                });
            },

            toggleVerify(id, table) {
                const item = YR_DB.findById(table, id);
                YR_DB.update(table, id, { verified: !item.verified }).then(() => {
                    if (table === 'companies') this.renderCompanies();
                    if (table === 'banks') this.renderBanks();
                    this.showToast(item.verified ? 'تم إلغاء التوثيق' : '✅ تم التوثيق', 'success');
                });
            },

            deleteItem(table, id) {
                if (!confirm('هل أنت متأكد من الحذف؟')) return;
                YR_DB.remove(table, id).then(() => {
                    this.switchTab(table === 'companies' ? 'companies' : table === 'banks' ? 'banks' : table === 'jobs' ? 'jobs' : table === 'reviews' ? 'reviews' : 'users');
                    this.showToast('تم الحذف', 'success');
                });
            },

            logout() {
                YR_DB.clearSession();
                location.href = 'index.html';
            },

            openModal(html) {
                document.getElementById('modalRoot').innerHTML = '<div class="modal active">' + html + '</div>';
                document.getElementById('overlay').classList.add('active');
            },

            closeModal() {
                document.getElementById('modalRoot').innerHTML = '';
                document.getElementById('overlay').classList.remove('active');
            },

            statusLabel(s) {
                const labels = { pending: 'معلق', approved: 'مقبول', rejected: 'مرفوض', active: 'نشط' };
                return labels[s] || s;
            },

            getCityName(cityId) {
                const city = YR_DB.findById('cities', cityId);
                return city ? city.name : '-';
            },

            esc(text) {
                if (!text) return '';
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            },

            showToast(msg, type) {
                type = type || 'info';
                let container = document.querySelector('.toast-container');
                if (!container) {
                    container = document.createElement('div');
                    container.className = 'toast-container';
                    document.body.appendChild(container);
                }
                const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
                const toast = document.createElement('div');
                toast.className = 'toast ' + type;
                toast.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '" style="color:var(--gold-400);"></i><span>' + msg + '</span>';
                container.appendChild(toast);
                setTimeout(() => toast.remove(), 4000);
            }
        };

        document.addEventListener('DOMContentLoaded', () => YRA.init());
    