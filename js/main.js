/* ═══════════════════════════════════════════════════════════
   YEMEN RATING - المنطق الرئيسي للصفحة الرئيسية
═══════════════════════════════════════════════════════════ */

const YR = {
    currentRating: 5,

    init() {
        YR_DB.init().then(() => {
            this.applyTheme();
            this.bindThemeToggle();
            this.bindNav();
            this.renderTicker();
            this.renderStats();
            this.renderCategories();
            this.renderFeaturedCompanies();
            this.renderJobs();
            this.renderBanks();
            this.renderLatestReviews();
            this.renderHeaderActions();
            this.bindSearch();
            this.bindBackToTop();
        });
    },

    applyTheme() {
        const theme = localStorage.getItem('yr_theme') || 'dark';
        if (theme === 'light') document.body.classList.add('light-mode');
        this.updateThemeIcon();
    },

    updateThemeIcon() {
        const btn = document.getElementById('themeToggle');
        if (!btn) return;
        btn.innerHTML = document.body.classList.contains('light-mode')
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    },

    bindThemeToggle() {
        const btn = document.getElementById('themeToggle');
        if (!btn) return;
        btn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            localStorage.setItem('yr_theme', isLight ? 'light' : 'dark');
            this.updateThemeIcon();
        });
    },

    closeNav() {
        const nav = document.getElementById('mainNav');
        const overlay = document.getElementById('overlay');
        if (nav) nav.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
    },

    openNav() {
        const nav = document.getElementById('mainNav');
        const overlay = document.getElementById('overlay');
        if (nav) nav.classList.add('open');
        if (overlay) overlay.classList.add('active');
    },

    bindNav() {
        const toggle = document.getElementById('navToggle');
        const overlay = document.getElementById('overlay');
        if (toggle) toggle.addEventListener('click', () => this.openNav());
        if (overlay) overlay.addEventListener('click', () => this.closeNav());
    },

    renderTicker() {
        const track = document.getElementById('tickerTrack');
        if (!track) return;
        const rates = YR_DB.get('exchange_rates');
        const gold = YR_DB.get('gold_prices');
        let html = '';
        rates.forEach(r => {
            html += '<span class="ticker-item"><span class="name">' + this.esc(r.name) + '</span><span class="buy">شراء: ' + this.esc(r.buyPrice || '-') + '</span><span class="sell">بيع: ' + this.esc(r.sellPrice || '-') + '</span></span>';
        });
        gold.forEach(g => {
            html += '<span class="ticker-item"><span class="name">🥇 ' + this.esc(g.name) + '</span><span class="sell">' + this.esc(g.price || '-') + '</span></span>';
        });
        track.innerHTML = html || '<span class="ticker-item"><span class="name">سيتم عرض الأسعار قريباً</span></span>';
    },

    renderStats() {
        const container = document.getElementById('heroStats');
        if (!container) return;
        const stats = YR_DB.getStats();
        container.innerHTML =
            '<div class="stat-card"><span class="num">' + (stats.companies + stats.banks) + '</span><span class="lbl">شركة وبنك</span></div>' +
            '<div class="stat-card"><span class="num">' + stats.jobs + '</span><span class="lbl">فرصة وظيفية</span></div>' +
            '<div class="stat-card"><span class="num">' + stats.reviews + '</span><span class="lbl">تقييم</span></div>' +
            '<div class="stat-card"><span class="num">' + stats.users + '</span><span class="lbl">مستخدم</span></div>';
    },

    renderCategories() {
        const grid = document.getElementById('categoriesGrid');
        if (!grid) return;
        const categories = YR_DB.get('categories');
        grid.innerHTML = categories.map(cat =>
            '<div class="category-card" onclick="YR.filterByCategory(\'' + cat.id + '\')">' +
            '<i class="fas ' + (cat.icon || 'fa-building') + '"></i>' +
            '<span>' + this.esc(cat.name) + '</span>' +
            '</div>'
        ).join('');
    },

    filterByCategory(catId) {
        window.location.href = 'companies.html?cat=' + catId;
    },

    renderFeaturedCompanies() {
        const grid = document.getElementById('featuredCompanies');
        if (!grid) return;
        const companies = YR_DB.get('companies')
            .filter(c => c.package === 'gold' || c.package === 'diamond' || c.verified)
            .slice(0, 4);

        if (companies.length === 0) {
            grid.innerHTML = '<div class="empty-state"><i class="fas fa-building"></i><p>لا توجد شركات مميزة حالياً</p></div>';
            return;
        }

        grid.innerHTML = companies.map(company => {
            const rating = YR_DB.calcRating(company.id, 'company');
            const cat = YR_DB.findById('categories', company.category);
            const icon = cat ? cat.icon : 'fa-building';
            return '<article class="entity-card" onclick="YR.openCompany(\'' + company.id + '\')">' +
                ((company.package === 'gold' || company.package === 'diamond') ? '<span class="featured-badge">⭐ مميز</span>' : '') +
                '<div class="entity-cover">' +
                (company.coverImage ? '<img src="' + company.coverImage + '">' : '<div class="placeholder-icon"><i class="fas ' + icon + '"></i></div>') +
                '</div>' +
                '<div class="entity-body">' +
                '<div class="entity-logo">' +
                (company.logo ? '<img src="' + company.logo + '">' : '<span class="logo-fallback"><i class="fas ' + icon + '"></i></span>') +
                '</div>' +
                '<h3 class="entity-name">' + this.esc(company.name) + ' ' +
                (company.verified ? '<span class="badge badge-verified"><i class="fas fa-circle-check"></i> موثق</span>' : '') +
                '</h3>' +
                '<p class="entity-desc">' + this.esc(company.description || '') + '</p>' +
                (rating.count > 0 ?
                    '<div class="rating-box">' +
                    '<span class="rating-stars">' + this.starsHtml(rating.avg) + '</span>' +
                    '<span class="rating-score">' + rating.avg + '/5</span>' +
                    '<div class="trust-bar"><div class="fill" style="width:' + ((rating.avg / 5) * 100) + '%"></div></div>' +
                    '<span class="rating-count">(' + rating.count + ')</span>' +
                    '</div>' : '') +
                '<div class="entity-meta">' +
                (company.city ? '<span><i class="fas fa-location-dot"></i>' + this.esc(this.getCityName(company.city)) + '</span>' : '') +
                '</div>' +
                '</div></article>';
        }).join('');
    },

    renderJobs() {
        const list = document.getElementById('jobsList');
        if (!list) return;
        const jobs = YR_DB.get('jobs').filter(j => j.status === 'active').slice(0, 5);

        if (jobs.length === 0) {
            list.innerHTML = '<div class="empty-state"><i class="fas fa-briefcase"></i><p>لا توجد وظائف حالياً</p></div>';
            return;
        }

        list.innerHTML = jobs.map(job => {
            const company = YR_DB.findById('companies', job.companyId);
            return '<div class="job-card" onclick="YR.openJob(\'' + job.id + '\')">' +
                '<div class="job-main">' +
                '<h3>' + this.esc(job.title) + '</h3>' +
                '<div class="job-tags">' +
                (company ? '<span><i class="fas fa-building"></i>' + this.esc(company.name) + '</span>' : '') +
                (job.city ? '<span><i class="fas fa-location-dot"></i>' + this.esc(this.getCityName(job.city)) + '</span>' : '') +
                (job.salary ? '<span class="job-salary"><i class="fas fa-money-bill-wave"></i>' + this.esc(job.salary) + '</span>' : '') +
                '</div></div>' +
                '<div class="job-actions">' +
                '<button class="btn btn-gold btn-sm"><i class="fas fa-eye"></i> التفاصيل</button>' +
                '</div></div>';
        }).join('');
    },

    renderBanks() {
        const grid = document.getElementById('banksGrid');
        if (!grid) return;
        const banks = YR_DB.get('banks');

        if (banks.length === 0) {
            grid.innerHTML = '<div class="empty-state"><i class="fas fa-landmark"></i><p>لا توجد بنوك مسجلة</p></div>';
            return;
        }

        grid.innerHTML = banks.map(bank => {
            const rating = YR_DB.calcRating(bank.id, 'bank');
            return '<div class="bank-card" onclick="YR.openBank(\'' + bank.id + '\')">' +
                '<div class="bank-logo"><i class="fas fa-landmark"></i></div>' +
                '<div class="bank-info">' +
                '<h3>' + this.esc(bank.name) + '</h3>' +
                '<p>' + (bank.verified ? '✓ موثق' : '') + ' ' + (rating.count > 0 ? '⭐ ' + rating.avg + '/5' : '') + '</p>' +
                '<p style="font-size:0.8rem;margin-top:4px;">' + this.esc((bank.description || '').substring(0, 60)) + '...</p>' +
                '</div></div>';
        }).join('');
    },

    renderLatestReviews() {
        const container = document.getElementById('latestReviews');
        if (!container) return;
        const reviews = YR_DB.get('reviews').slice(0, 3);

        if (reviews.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-star"></i><p>لا توجد تقييمات بعد - كن الأول!</p></div>';
            return;
        }

        container.innerHTML = reviews.map(review =>
            '<div class="review-card">' +
            '<div class="review-header">' +
            '<div class="review-user">' +
            '<div class="review-avatar">' + this.esc((review.userName || 'ز').charAt(0)) + '</div>' +
            '<div class="review-meta">' +
            '<span class="review-name">' + this.esc(review.userName) + '</span>' +
            '<span class="review-date">' + this.formatDate(review.createdAt) + '</span>' +
            '</div></div>' +
            '<div class="review-rating">' + this.starsHtml(review.stars) + '</div>' +
            '</div>' +
            '<p class="review-comment">' + this.esc(review.comment || '') + '</p>' +
            '</div>'
        ).join('');
    },

    openCompany(id) {
        const company = YR_DB.findById('companies', id);
        if (!company) return;
        const rating = YR_DB.calcRating(id, 'company');
        const reviews = YR_DB.where('reviews', 'entityId', id);
        const content = document.getElementById('profileContent');
        const self = this;

        let reviewsHtml = reviews.length > 0 ? reviews.map(r =>
            '<div style="padding:14px 0;border-bottom:1px solid var(--border);">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:6px;">' +
            '<strong>' + this.esc(r.userName) + '</strong>' +
            '<span class="rating-stars">' + this.starsHtml(r.stars) + '</span>' +
            '</div>' +
            '<p style="color:var(--text-muted);">' + this.esc(r.comment || '') + '</p>' +
            '</div>'
        ).join('') : '<p style="color:var(--text-muted);">لا توجد تقييمات بعد</p>';

        content.innerHTML =
            '<button class="btn btn-navy profile-close" onclick="YR.closeProfile()"><i class="fas fa-arrow-right"></i> رجوع</button>' +
            '<div class="profile-hero">' +
            '<div class="profile-logo">' +
            (company.logo ? '<img src="' + company.logo + '">' : '<i class="fas fa-building"></i>') +
            '</div>' +
            '<div class="profile-info">' +
            '<h1>' + this.esc(company.name) + ' ' +
            (company.verified ? '<span class="badge badge-verified"><i class="fas fa-circle-check"></i> موثق</span>' : '') +
            '</h1>' +
            (rating.count > 0 ?
                '<div class="rating-box">' +
                '<span class="rating-stars">' + this.starsHtml(rating.avg) + '</span>' +
                '<span class="rating-score" style="color:var(--gold-400);">' + rating.avg + '/5</span>' +
                '<span class="rating-count">(' + rating.count + ' تقييم)</span>' +
                '</div>' : '') +
            '<p class="profile-desc">' + this.esc(company.description || '') + '</p>' +
            '</div></div>' +
            '<div class="profile-grid"><div>' +
            '<div class="profile-box"><h2><i class="fas fa-concierge-bell"></i> الخدمات</h2>' +
            '<p style="color:var(--text-muted);line-height:2;">' + this.esc(company.services || 'لا توجد خدمات مسجلة') + '</p></div>' +
            (company.branches ?
                '<div class="profile-box"><h2><i class="fas fa-code-branch"></i> الفروع</h2>' +
                '<p style="color:var(--text-muted);line-height:2;white-space:pre-line;">' + this.esc(company.branches) + '</p></div>' : '') +
            '<div class="profile-box"><h2><i class="fas fa-star"></i> التقييمات (' + reviews.length + ')</h2>' +
            reviewsHtml +
            '<form id="reviewForm" style="margin-top:20px;padding-top:20px;border-top:2px solid var(--border);">' +
            '<div class="form-group"><label>تقييمك</label>' +
            '<div class="rating-stars-input" id="starsInput">' +
            [1,2,3,4,5].map(i => '<span class="rating-star" data-value="' + i + '" onclick="YR.setRating(' + i + ')">★</span>').join('') +
            '</div></div>' +
            '<div class="form-group"><label>تعليقك</label>' +
            '<textarea class="form-control" name="comment" required></textarea></div>' +
            '<button type="submit" class="btn btn-gold btn-sm">إرسال التقييم</button>' +
            '</form></div>' +
            '</div><div>' +
            '<div class="profile-box"><h2><i class="fas fa-address-card"></i> التواصل</h2>' +
            '<ul class="info-list">' +
            (company.city ? '<li><i class="fas fa-location-dot"></i><span>' + this.esc(this.getCityName(company.city)) + '</span></li>' : '') +
            (company.phone ? '<li><i class="fas fa-phone"></i><span>' + this.esc(company.phone) + '</span></li>' : '') +
            (company.email ? '<li><i class="fas fa-envelope"></i><span>' + this.esc(company.email) + '</span></li>' : '') +
            (company.website ? '<li><i class="fas fa-globe"></i><a href="' + company.website + '" target="_blank" style="color:var(--gold-400);">' + this.esc(company.website) + '</a></li>' : '') +
            '</ul>' +
            '<div class="contact-actions" style="margin-top:20px;">' +
            (company.phone ? '<a href="tel:' + company.phone + '" class="btn btn-navy btn-block"><i class="fas fa-phone"></i> اتصال</a>' : '') +
            (company.whatsapp ? '<a href="https://wa.me/' + company.whatsapp.replace(/[^0-9]/g, '') + '" target="_blank" class="btn btn-block whatsapp-btn"><i class="fab fa-whatsapp"></i> واتساب</a>' : '') +
            '</div></div></div></div>';

        document.getElementById('profilePage').classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        const form = document.getElementById('reviewForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const session = YR_DB.getSession();
                if (!session) {
                    self.showToast('سجل دخولك أولاً', 'error');
                    return;
                }
                YR_DB.add('reviews', {
                    entityId: id,
                    entityType: 'company',
                    userId: session.userId,
                    userName: session.name,
                    stars: self.currentRating || 5,
                    comment: e.target.comment.value
                }).then(() => {
                    self.showToast('⭐ شكراً لتقييمك!', 'success');
                    self.openCompany(id);
                });
            });
        }
    },

    openJob(jobId) {
        const job = YR_DB.findById('jobs', jobId);
        if (!job) return;
        const company = YR_DB.findById('companies', job.companyId);
        const content = document.getElementById('profileContent');

        content.innerHTML =
            '<button class="btn btn-navy profile-close" onclick="YR.closeProfile()"><i class="fas fa-arrow-right"></i> رجوع</button>' +
            '<div class="profile-hero">' +
            '<div class="profile-logo"><i class="fas fa-briefcase"></i></div>' +
            '<div class="profile-info">' +
            '<h1>' + this.esc(job.title) + '</h1>' +
            '<div class="profile-badges">' +
            (company ? '<span class="badge badge-premium"><i class="fas fa-building"></i> ' + this.esc(company.name) + '</span>' : '') +
            (job.type ? '<span class="badge badge-verified"><i class="fas fa-clock"></i> ' + this.esc(job.type) + '</span>' : '') +
            '</div>' +
            '<p class="profile-desc">' + this.esc(job.description || '') + '</p>' +
            '</div></div>' +
            '<div class="profile-grid"><div>' +
            '<div class="profile-box"><h2><i class="fas fa-circle-info"></i> تفاصيل الوظيفة</h2>' +
            '<ul class="info-list">' +
            (company ? '<li><i class="fas fa-building"></i><span>الشركة: ' + this.esc(company.name) + '</span></li>' : '') +
            (job.city ? '<li><i class="fas fa-location-dot"></i><span>الموقع: ' + this.esc(this.getCityName(job.city)) + '</span></li>' : '') +
            (job.salary ? '<li><i class="fas fa-money-bill-wave"></i><span>الراتب: ' + this.esc(job.salary) + '</span></li>' : '') +
            (job.experience ? '<li><i class="fas fa-star"></i><span>الخبرة: ' + this.esc(job.experience) + '</span></li>' : '') +
            '</ul></div>' +
            '<div class="profile-box"><h2><i class="fas fa-paper-plane"></i> قدّم الآن</h2>' +
            '<button class="btn btn-gold btn-block" onclick="YR.openApplyModal(\'' + job.id + '\')"><i class="fas fa-paper-plane"></i> تقديم على الوظيفة</button>' +
            '</div></div>' +
            '<div><div class="profile-box"><h2><i class="fas fa-address-card"></i> التواصل</h2>' +
            '<div class="contact-actions">' +
            (company && company.phone ? '<a href="tel:' + company.phone + '" class="btn btn-navy btn-block"><i class="fas fa-phone"></i> اتصال</a>' : '') +
            '</div></div></div></div>';

        document.getElementById('profilePage').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },

    openBank(bankId) {
        const bank = YR_DB.findById('banks', bankId);
        if (!bank) return;
        const rating = YR_DB.calcRating(bankId, 'bank');
        const content = document.getElementById('profileContent');

        content.innerHTML =
            '<button class="btn btn-navy profile-close" onclick="YR.closeProfile()"><i class="fas fa-arrow-right"></i> رجوع</button>' +
            '<div class="profile-hero">' +
            '<div class="profile-logo"><i class="fas fa-landmark"></i></div>' +
            '<div class="profile-info">' +
            '<h1>' + this.esc(bank.name) + ' ' +
            (bank.verified ? '<span class="badge badge-verified"><i class="fas fa-circle-check"></i> موثق</span>' : '') +
            '</h1>' +
            (rating.count > 0 ?
                '<div class="rating-box">' +
                '<span class="rating-stars">' + this.starsHtml(rating.avg) + '</span>' +
                '<span class="rating-score" style="color:var(--gold-400);">' + rating.avg + '/5</span>' +
                '</div>' : '') +
            '<p class="profile-desc">' + this.esc(bank.description || '') + '</p>' +
            '</div></div>' +
            '<div class="profile-grid"><div>' +
            '<div class="profile-box"><h2><i class="fas fa-concierge-bell"></i> الخدمات</h2>' +
            '<p style="color:var(--text-muted);line-height:2;">' + this.esc(bank.services || 'لا توجد خدمات') + '</p></div>' +
            (bank.branches ?
                '<div class="profile-box"><h2><i class="fas fa-code-branch"></i> الفروع</h2>' +
                '<p style="color:var(--text-muted);line-height:2;">' + this.esc(bank.branches) + '</p></div>' : '') +
            '</div><div>' +
            '<div class="profile-box"><h2><i class="fas fa-address-card"></i> التواصل</h2>' +
            '<ul class="info-list">' +
            (bank.phone ? '<li><i class="fas fa-phone"></i><span>' + this.esc(bank.phone) + '</span></li>' : '') +
            '</ul>' +
            '<div class="contact-actions" style="margin-top:20px;">' +
            (bank.phone ? '<a href="tel:' + bank.phone + '" class="btn btn-navy btn-block"><i class="fas fa-phone"></i> اتصال</a>' : '') +
            '</div></div></div></div>';

        document.getElementById('profilePage').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },

    openApplyModal(jobId) {
        this.openModal(
            '<div class="modal-head"><h3><i class="fas fa-paper-plane"></i> التقديم على الوظيفة</h3>' +
            '<button class="modal-close" onclick="YR.closeModal()"><i class="fas fa-times"></i></button></div>' +
            '<div class="modal-body"><form id="applyForm">' +
            '<div class="form-group"><label>الاسم <span class="required">*</span></label>' +
            '<input type="text" class="form-control" name="name" required></div>' +
            '<div class="form-group"><label>الهاتف <span class="required">*</span></label>' +
            '<input type="tel" class="form-control" name="phone" required></div>' +
            '<div class="form-group"><label>رسالة قصيرة</label>' +
            '<textarea class="form-control" name="message"></textarea></div>' +
            '<button type="submit" class="btn btn-gold btn-block">إرسال الطلب</button>' +
            '</form></div>'
        );

        const self = this;
        document.getElementById('applyForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const fd = new FormData(e.target);
            YR_DB.add('job_applications', {
                jobId: jobId,
                name: fd.get('name'),
                phone: fd.get('phone'),
                message: fd.get('message'),
                status: 'pending'
            }).then(() => {
                self.closeModal();
                self.showToast('✅ تم إرسال طلبك!', 'success');
            });
        });
    },

    setRating(value) {
        this.currentRating = value;
        document.querySelectorAll('.rating-star').forEach((star, i) => {
            star.classList.toggle('active', i < value);
        });
    },

    closeProfile() {
        document.getElementById('profilePage').classList.add('hidden');
        document.body.style.overflow = '';
    },

    bindSearch() {
        const btn = document.getElementById('searchBtn');
        const input = document.getElementById('globalSearch');
        if (btn) btn.addEventListener('click', () => this.doSearch());
        if (input) input.addEventListener('keyup', e => { if (e.key === 'Enter') this.doSearch(); });
    },

    doSearch() {
        const term = (document.getElementById('globalSearch').value || '').trim().toLowerCase();
        if (!term) { this.showToast('اكتب كلمة للبحث', 'error'); return; }
        window.location.href = 'companies.html?q=' + encodeURIComponent(term);
    },

    bindBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;
        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 400);
        });
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    },

    renderHeaderActions() {
        const session = YR_DB.getSession();
        const c = document.getElementById('headerActions');
        if (!c) return;
        if (session) {
            c.innerHTML =
                '<span class="user-chip" style="color:var(--gold-400);font-weight:700;"><i class="fas fa-user-circle"></i> ' + this.esc(session.name) + '</span>' +
                (session.role === 'admin' ? '<a href="admin.html" class="btn btn-gold btn-sm">الإدارة</a>' : '') +
                '<button class="btn btn-outline btn-sm" onclick="YR.logout()">خروج</button>';
        } else {
            c.innerHTML =
                '<button class="btn btn-outline btn-sm" onclick="YR.openLogin()">دخول</button>' +
                '<button class="btn btn-gold btn-sm" onclick="YR.openRegister()">حساب جديد</button>';
        }
        const navActions = document.getElementById('navMobileActions');
        if (navActions) {
            navActions.innerHTML = session
                ? '<button class="btn btn-outline" onclick="YR.logout()"><i class="fas fa-right-from-bracket"></i> خروج</button>'
                : '<button class="btn btn-outline" onclick="YR.closeNav();YR.openLogin()"><i class="fas fa-right-to-bracket"></i> دخول</button>' +
                  '<button class="btn btn-gold" onclick="YR.closeNav();YR.openRegister()"><i class="fas fa-user-plus"></i> حساب جديد</button>';
        }
    },

    openLogin() {
        const self = this;
        this.openModal(
            '<div class="modal-head"><h3><i class="fas fa-right-to-bracket"></i> دخول</h3>' +
            '<button class="modal-close" onclick="YR.closeModal()"><i class="fas fa-times"></i></button></div>' +
            '<div class="modal-body"><form id="loginForm">' +
            '<div class="form-group"><label>البريد</label>' +
            '<input type="email" class="form-control" name="email" required></div>' +
            '<div class="form-group"><label>كلمة المرور</label>' +
            '<input type="password" class="form-control" name="password" required></div>' +
            '<button type="submit" class="btn btn-gold btn-block">دخول</button>' +
            '<p style="text-align:center;margin-top:12px;color:var(--text-muted);font-size:0.85rem;">' +
            'للتجربة: admin@yemenrating.ye / admin123</p>' +
            '</form></div>'
        );

        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const users = YR_DB.get('users');
            const user = users.find(u =>
                u.email === e.target.email.value &&
                u.password === YR_DB.hash(e.target.password.value)
            );
            if (user) {
                YR_DB.setSession(user);
                self.closeModal();
                self.renderHeaderActions();
                self.showToast('مرحباً ' + user.name + '!', 'success');
                if (user.role === 'admin') setTimeout(() => location.href = 'admin.html', 800);
            } else {
                self.showToast('بيانات خاطئة', 'error');
            }
        });
    },

    openRegister() {
        const self = this;
        this.openModal(
            '<div class="modal-head"><h3><i class="fas fa-user-plus"></i> حساب جديد</h3>' +
            '<button class="modal-close" onclick="YR.closeModal()"><i class="fas fa-times"></i></button></div>' +
            '<div class="modal-body"><form id="registerForm">' +
            '<div class="form-group"><label>الاسم</label>' +
            '<input type="text" class="form-control" name="name" required></div>' +
            '<div class="form-group"><label>البريد</label>' +
            '<input type="email" class="form-control" name="email" required></div>' +
            '<div class="form-group"><label>كلمة المرور</label>' +
            '<input type="password" class="form-control" name="password" minlength="6" required></div>' +
            '<button type="submit" class="btn btn-gold btn-block">إنشاء حساب</button>' +
            '</form></div>'
        );

        document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const fd = new FormData(e.target);
            const users = YR_DB.get('users');
            if (users.find(u => u.email === fd.get('email'))) {
                self.showToast('البريد مسجل', 'error');
                return;
            }
            YR_DB.add('users', {
                name: fd.get('name'),
                email: fd.get('email'),
                password: YR_DB.hash(fd.get('password')),
                role: 'individual',
                status: 'active'
            }).then(result => {
                YR_DB.setSession(result.record);
                self.closeModal();
                self.renderHeaderActions();
                self.showToast('تم إنشاء حسابك!', 'success');
            });
        });
    },

    openAddCompany() {
        const session = YR_DB.getSession();
        if (!session) {
            this.showToast('سجل دخولك أولاً', 'error');
            this.openLogin();
            return;
        }
        this.showToast('انتقل إلى صفحة الشركات لإضافة شركتك', 'info');
        setTimeout(() => window.location.href = 'companies.html', 1000);
    },

    logout() {
        YR_DB.clearSession();
        this.renderHeaderActions();
        this.showToast('تم الخروج', 'success');
    },

    openModal(html) {
        document.getElementById('modalRoot').innerHTML = '<div class="modal active">' + html + '</div>';
        document.getElementById('overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeModal() {
        document.getElementById('modalRoot').innerHTML = '';
        document.getElementById('overlay').classList.remove('active');
        document.body.style.overflow = '';
    },

    getCityName(cityId) {
        const city = YR_DB.findById('cities', cityId);
        return city ? city.name : cityId;
    },

    starsHtml(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += (i <= Math.floor(rating)) ? '★' : ((i - 0.5 <= rating) ? '⯨' : '☆');
        }
        return html;
    },

    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('ar-YE');
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

document.addEventListener('DOMContentLoaded', () => YR.init());
