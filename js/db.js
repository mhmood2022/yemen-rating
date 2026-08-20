/* ═══════════════════════════════════════════════════════════
   YEMEN RATING DB - قاعدة البيانات الكاملة
═══════════════════════════════════════════════════════════ */

const YR_DB = {
    _cache: {},
    _initialized: false,

    TABLES = [
        'companies', 'banks', 'jobs', 'job_applications',
        'candidate_profiles', 'reviews', 'verification_requests',
        'advertisements', 'messages', 'notifications',
        'subscriptions', 'payments', 'exchange_rates',
        'gold_prices', 'users', 'cities', 'categories'
    , 'ads', 'notifications'],

    async init() {
        if (this._initialized) return;
        this.TABLES.forEach(table => {
            try {
                const data = localStorage.getItem('yr_' + table);
                this._cache[table] = data ? JSON.parse(data) : [];
            } catch (e) { this._cache[table] = []; }
        });
        if (this._cache.companies.length === 0) this._seed();
        this._initialized = true;
    },

    _seed() {
        this._cache.cities = [
            {id:'c1',name:'صنعاء'},{id:'c2',name:'عدن'},
            {id:'c3',name:'تعز'},{id:'c4',name:'إب'},
            {id:'c5',name:'الحديدة'},{id:'c6',name:'المكلا'}
        ];

        this._cache.categories = [
            {id:'cat1',name:'تقنية',icon:'fa-laptop-code'},
            {id:'cat2',name:'مقاولات',icon:'fa-helmet-safety'},
            {id:'cat3',name:'تجارة',icon:'fa-store'},
            {id:'cat4',name:'مطاعم',icon:'fa-utensils'},
            {id:'cat5',name:'فنادق',icon:'fa-hotel'},
            {id:'cat6',name:'نقل',icon:'fa-truck-fast'}
        ];

        this._cache.companies = [
            {id:'comp1',name:'شركة التقنية اليمنية',category:'cat1',city:'c1',
             description:'شركة رائدة في البرمجيات والحلول التقنية',
             phone:'+967771234567',whatsapp:'+967771234567',
             email:'info@yementech.ye',verified:true,package:'gold',
             services:'تطوير تطبيقات، مواقع ويب، أنظمة إدارة',
             branches:'صنعاء - شارع الزبيري\nعدن - كريتر',
             createdAt:new Date().toISOString()},
            {id:'comp2',name:'مجموعة البناء الحديث',category:'cat2',city:'c2',
             description:'مقاولات عامة وبناء متكامل',
             phone:'+967772345678',verified:true,package:'silver',
             services:'بناء، ترميم، ديكورات',
             createdAt:new Date().toISOString()}
        ];

        this._cache.ads = [
            {id:'ad1',title:'عروض رمضان الكبرى',subtitle:'خصومات تصل إلى 50% على جميع الخدمات',
             image:'',link:'#',priority:1,active:true,
             createdAt:new Date().toISOString()},
            {id:'ad2',title:'سجّل شركتك الآن',subtitle:'احصل على توثيق مجاني للشركات الجديدة',
             image:'',link:'#',priority:2,active:true,
             createdAt:new Date().toISOString()}
        ];

        this._cache.notifications = [];


        this._cache.banks = [
            {id:'bank1',name:'البنك اليمني للإنشاء والتعمير',city:'c1',
             description:'بنك رائد في الخدمات المصرفية',
             phone:'+9671234567',verified:true,
             services:'حسابات، قروض، تحويلات',
             branches:'صنعاء، عدن، تعز',
             createdAt:new Date().toISOString()}
        ];

        this._cache.jobs = [
            {id:'job1',companyId:'comp1',title:'مطور Full Stack',city:'c1',
             salary:'$800-$1200',type:'دوام كامل',experience:'2-4 سنوات',
             description:'مطلوب مطور خبير في React و Node.js',
             skills:['JavaScript','React','Node.js'],status:'active',
             createdAt:new Date().toISOString()},
            {id:'job2',companyId:'comp2',title:'مهندس مدني',city:'c2',
             salary:'$600-$900',type:'دوام كامل',experience:'3-5 سنوات',
             description:'مهندس لمشاريع البناء',status:'active',
             createdAt:new Date().toISOString()}
        ];

        this._cache.reviews = [
            {id:'rev1',entityId:'comp1',entityType:'company',
             userName:'أحمد محمد',stars:5,comment:'شركة ممتازة وخدمة رائعة',
             createdAt:new Date().toISOString()},
            {id:'rev2',entityId:'comp1',entityType:'company',
             userName:'سارة علي',stars:4,comment:'جودة عالية وأسعار مناسبة',
             createdAt:new Date().toISOString()}
        ];

        this._cache.users = [
            {id:'admin1',name:'إدارة يمن ريتغ',
             email:'admin@yemenrating.ye',
             password:this.hash('admin123'),
             role:'admin',status:'active',
             createdAt:new Date().toISOString()}
        ];

        this._cache.exchange_rates = [
            {id:'r1',name:'الدولار الأمريكي',buyPrice:'535',sellPrice:'545',city:'صنعاء'},
            {id:'r2',name:'الريال السعودي',buyPrice:'141',sellPrice:'144',city:'صنعاء'}
        ];

        this._cache.gold_prices = [
            {id:'g1',name:'ذهب عيار 21',price:'45000',city:'صنعاء'},
            {id:'g2',name:'ذهب عيار 18',price:'38500',city:'صنعاء'}
        ];

        this.TABLES.forEach(t => this._save(t));
    },

    get(t){ return this._cache[t] || []; },
    findById(t,id){ return this.get(t).find(i=>i.id===id)||null; },
    where(t,f,v){ return this.get(t).filter(i=>i[f]===v); },

    async add(t,r){
        r.id = r.id || 'id_'+Date.now()+'_'+Math.random().toString(36).substr(2,5);
        r.createdAt = r.createdAt || new Date().toISOString();
        if(!this._cache[t]) this._cache[t]=[];
        this._cache[t].unshift(r);
        this._save(t);
        return {success:true,id:r.id,record:r};
    },

    async update(t,id,u){
        const items=this.get(t);
        const i=items.findIndex(x=>x.id===id);
        if(i===-1) return {success:false};
        Object.assign(items[i],u,{updatedAt:new Date().toISOString()});
        this._save(t);
        return {success:true,record:items[i]};
    },

    async remove(t,id){
        this._cache[t]=this.get(t).filter(i=>i.id!==id);
        this._save(t);
        return {success:true};
    },

    getSession(){
        try{ return JSON.parse(localStorage.getItem('yr_session')||'null'); }
        catch(e){ return null; }
    },
    setSession(u){
        localStorage.setItem('yr_session',JSON.stringify({
            userId:u.id,name:u.name,email:u.email,role:u.role
        }));
    },
    clearSession(){ localStorage.removeItem('yr_session'); },

    hash(s){
        let h=0;
        for(let i=0;i<s.length;i++){ h=((h<<5)-h)+s.charCodeAt(i); h&=h; }
        return 'h_'+Math.abs(h).toString(36);
    },

    _save(t){
        try{ localStorage.setItem('yr_'+t,JSON.stringify(this._cache[t])); }
        catch(e){ console.error(e); }
    },

    getStats(){
        return {
            companies:this._cache.companies.length,
            banks:this._cache.banks.length,
            jobs:this._cache.jobs.length,
            users:this._cache.users.length,
            reviews:this._cache.reviews.length
        };
    },

    calcRating(entityId,type){
        const revs=this.where('reviews','entityId',entityId)
            .filter(r=>r.entityType===type);
        if(!revs.length) return {avg:0,count:0};
        const sum=revs.reduce((a,r)=>a+(r.stars||0),0);
        return {avg:Math.round(sum/revs.length*10)/10,count:revs.length};
    }
};

YR_DB.init();
window.YR_DB = YR_DB;
