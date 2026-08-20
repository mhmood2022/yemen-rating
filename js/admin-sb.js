// ═══ admin-sb.js — ربط كامل بين اللوحة القديمة و Supabase ═══
(function(){
    if (typeof window.supabase === 'undefined') return;
    var SB_URL = 'https://wkdqeghotlipciqiytuj.supabase.co';
    var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE';
    var sb = window.supabase.createClient(SB_URL, SB_KEY);
    window.yrSupabase = sb;
    var authed = false, sbUid = null;

    // ═══ شريط تشخيص مرئي ═══
    function showSBLog(msg) {
        var bar = document.getElementById('sb-debug-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'sb-debug-bar';
            bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#0f172a;color:#fbbf24;padding:8px 12px;font-size:11px;z-index:9999;border-top:2px solid #d4af37;font-family:monospace;direction:rtl;max-height:90px;overflow-y:auto;';
            document.body.appendChild(bar);
        }
        var line = document.createElement('div');
        line.textContent = '[' + new Date().toLocaleTimeString('ar-YE') + '] ' + msg;
        bar.insertBefore(line, bar.firstChild);
        while (bar.children.length > 4) bar.removeChild(bar.lastChild);
    }
    var _ol = console.log, _ow = console.warn;
    console.log = function(){ _ol.apply(console, arguments); if (arguments[0] && String(arguments[0]).indexOf('[SB]')===0) showSBLog(Array.from(arguments).join(' ')); };
    console.warn = function(){ _ow.apply(console, arguments); if (arguments[0] && String(arguments[0]).indexOf('[SB]')===0) showSBLog('⚠️ ' + Array.from(arguments).join(' ')); };

    // ═══ مساعدات المدن والتصنيفات ═══
    function waitDB(cb){ if (window.YR_DB && window.YR_DB._initialized) cb(); else setTimeout(function(){waitDB(cb)},200); }
    function cityIdToName(id){ var c=(YR_DB.get('cities')||[]).find(function(x){return x.id===id}); return c?c.name:(id||''); }
    function cityNameToId(name){ if(!name) return ''; var cs=YR_DB.get('cities'); var f=cs.find(function(x){return x.name===name}); if(f) return f.id; var id='c_sb_'+Date.now(); cs.push({id:id,name:name}); return id; }
    var TYPE_AR = {company:'شركات',bank:'بنوك',shop:'محلات',restaurant:'مطاعم',hotel:'فنادق',exchange:'صرافة',transport:'نقل',wallet:'محافظ'};
    function catIdForType(type){ var cats=YR_DB.get('categories'); var f=cats.find(function(c){return c._type===type}); if(f) return f.id; var id='cat_sb_'+type; cats.push({id:id,name:TYPE_AR[type]||type,icon:'fa-building',_type:type}); return id; }
    function splitList(v,sep){ if(Array.isArray(v)) return v; if(!v) return []; return String(v).split(sep).map(function(s){return s.trim()}).filter(Boolean); }

    // ═══ تحميل من Supabase ═══
    function q(table){ return sb.from(table).select('*').order('created_at',{ascending:false}).then(function(r){ if(r.error) throw r.error; return r.data||[]; }).catch(function(e){ console.warn('[SB] load '+table+': '+e.message); return []; }); }

    // ═══ تحويل SB → صيغة قديمة ═══
    function entToOld(e){
        var base = { id:'sb_'+e.id, _sbId:e.id, name:e.name, city:cityNameToId(e.city), description:e.description||'', phone:e.phone||'', whatsapp:e.whatsapp||'', email:e.email||'', verified:e.status==='PUBLISHED', package:e.badge||'', services:splitList(e.services,'،').join('، '), branches:splitList(e.branches,'\n').join('\n'), status:e.status, createdAt:e.created_at };
        if (e.type==='bank') return base;
        base.category = catIdForType(e.type||'company');
        return base;
    }
    function jobToOld(j){ return { id:'sb_'+j.id, _sbId:j.id, companyId:j.entity_id?('sb_'+j.entity_id):'', title:j.title, city:cityNameToId(j.city), salary:j.salary||'', type:j.type||'دوام كامل', experience:'', description:j.description||'', skills:j.requirements||[], status:j.status==='PUBLISHED'?'active':'pending', createdAt:j.created_at }; }
    function revToOld(r){ return { id:'sb_'+r.id, _sbId:r.id, entityId:r.entity_id?('sb_'+r.entity_id):'', entityType:'company', userName:r.user_name, stars:r.stars, comment:r.text||'', createdAt:r.created_at }; }
    function appToOld(a){ return { id:a.id, _sbId:a.id, jobId:a.job_id, name:a.applicant_name, phone:a.applicant_phone, email:a.applicant_email, experience:a.experience, message:a.message, status:a.status, createdAt:a.created_at }; }
    function adToOld(a){ return { id:a.id, _sbId:a.id, title:a.title, link:a.link_url, img:a.image_url, status:a.status, clicks:a.clicks||0, createdAt:a.created_at }; }

    // ═══ حقن داخل YR_DB ═══
    function mergeInto(table, sbRows){
        var local = YR_DB.get(table).filter(function(x){ return !x._sbId; });
        YR_DB._cache[table] = sbRows.concat(local);
        YR_DB._save(table);
    }
    function rerender(){ try { if (window.YRA) { if (YRA.renderDashboard) YRA.renderDashboard(); if (YRA.updateBadges) YRA.updateBadges(); } } catch(e){} }

    async function syncAll(){
        console.log('[SB] بدء المزامنة...');
        var ents = await q('entities'), jobs = await q('jobs'), apps = await q('applications'), revs = await q('reviews'), ads = await q('advertisements');
        var comps = [], banks = [];
        ents.forEach(function(e){ (e.type==='bank'?banks:comps).push(entToOld(e)); });
        mergeInto('companies', comps);
        mergeInto('banks', banks);
        mergeInto('jobs', jobs.map(jobToOld));
        mergeInto('reviews', revs.map(revToOld));
        mergeInto('job_applications', apps.map(appToOld));
        mergeInto('advertisements', ads.map(adToOld));
        YR_DB._save('cities'); YR_DB._save('categories');
        console.log('[SB] ✅ مزامنة: '+comps.length+' شركة, '+banks.length+' بنك, '+jobs.length+' وظيفة, '+apps.length+' طلب, '+revs.length+' تقييم');
        rerender();
    }

    // ═══ اعتراض الكتابة: أي حفظ في اللوحة → Supabase ═══
    function entPayload(t,r){ return { type:t==='banks'?'bank':'company', name:r.name, city:cityIdToName(r.city), address:r.address||'', phone:r.phone||'', whatsapp:r.whatsapp||'', email:r.email||'', description:r.description||'', services:splitList(r.services,'،'), branches:splitList(r.branches,'\n'), status:r.verified?'PUBLISHED':(r.status||'PENDING'), badge:r.package||null, owner_id:sbUid }; }
    async function mirrorAdd(t,r){
        if (!authed) { console.warn('[SB] ⚠️ لم يُحفظ في Supabase — اربط الحساب من الشريط البرتقالي بالأعلى'); return null; }
        try {
            if (t==='companies'||t==='banks') { var res=await sb.from('entities').insert(entPayload(t,r)).select().single(); if(res.error) throw res.error; console.log('[SB] ✅ حفظ في entities: '+r.name); return res.data.id; }
            if (t==='jobs') { var r2=await sb.from('jobs').insert({ title:r.title, city:cityIdToName(r.city), salary:r.salary, description:r.description, requirements:r.skills||[], type:r.type, status:r.status==='active'?'PUBLISHED':'PENDING', entity_id:r.companyId&&r.companyId.indexOf('sb_')===0?r.companyId.replace('sb_',''):null, owner_id:sbUid }).select().single(); if(r2.error) throw r2.error; console.log('[SB] ✅ حفظ في jobs: '+r.title); return r2.data.id; }
            if (t==='reviews') { var r3=await sb.from('reviews').insert({ user_name:r.userName, stars:r.stars, text:r.comment, status:'PUBLISHED', entity_id:r.entityId&&r.entityId.indexOf('sb_')===0?r.entityId.replace('sb_',''):null }).select().single(); if(r3.error) throw r3.error; return r3.data.id; }
            if (t==='advertisements') { var r4=await sb.from('advertisements').insert({ title:r.title, link_url:r.link, image_url:r.img, status:r.status||'PENDING' }).select().single(); if(r4.error) throw r4.error; return r4.data.id; }
        } catch(e){ console.warn('[SB] mirrorAdd '+t+': '+e.message); }
        return null;
    }
    async function mirrorUpdate(t,id,u){
        if (!authed) return;
        var map = {companies:'entities',banks:'entities',jobs:'jobs',reviews:'reviews',advertisements:'advertisements'};
        var table = map[t]; if (!table || !id || id.indexOf('sb_')!==0) return;
        var sbId = id.replace('sb_','');
        var payload = {};
        if (u.status) payload.status = (u.status==='active'||u.status==='PUBLISHED')?'PUBLISHED':u.status;
        if (u.verified!==undefined) payload.status = u.verified?'PUBLISHED':'PENDING';
        if (u.name) payload.name = u.name; if (u.title) payload.title = u.title;
        try { await sb.from(table).update(payload).eq('id',sbId); console.log('[SB] ✅ تحديث '+table); } catch(e){ console.warn('[SB] mirrorUpdate: '+e.message); }
    }
    async function mirrorRemove(t,id){
        if (!authed || !id || id.indexOf('sb_')!==0) return;
        var map = {companies:'entities',banks:'entities',jobs:'jobs',reviews:'reviews',advertisements:'advertisements'};
        var table = map[t]; if (!table) return;
        try { await sb.from(table).delete().eq('id', id.replace('sb_','')); console.log('[SB] ✅ حذف من '+table); } catch(e){ console.warn('[SB] mirrorRemove: '+e.message); }
    }
    function hookWrites(){
        var oa=YR_DB.add, ou=YR_DB.update, orm=YR_DB.remove;
        YR_DB.add = function(t,r){ return oa.call(YR_DB,t,r).then(function(res){ if(res&&res.success){ mirrorAdd(t,r).then(function(sbId){ if(sbId){ r._sbId=sbId; YR_DB._save(t); } }); } return res; }); };
        YR_DB.update = function(t,id,u){ return ou.call(YR_DB,t,id,u).then(function(res){ mirrorUpdate(t,id,u); return res; }); };
        YR_DB.remove = function(t,id){ return orm.call(YR_DB,t,id).then(function(res){ mirrorRemove(t,id); return res; }); };
        console.log('[SB] ✅ اعتراض الكتابة جاهز');
    }

    // ═══ ربط الحساب (مرة واحدة) ═══
    function showLinkBar(){
        if (document.getElementById('sb-link-bar')) return;
        var bar = document.createElement('div');
        bar.id = 'sb-link-bar';
        bar.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#7c2d12;color:#fff;padding:12px;z-index:10001;border-bottom:3px solid #fbbf24;font-family:Cairo,sans-serif;direction:rtl;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.6)';
        bar.innerHTML = '<b style="color:#fbbf24">🔗 ربط قاعدة البيانات (مرة واحدة)</b><br><input id="sb-link-email" value="mhmood7015@gmail.com" dir="ltr" style="margin:3px;padding:7px;border-radius:6px;border:1px solid #475569;background:#0f172a;color:#f8fafc;width:44%;font-size:11px"><input id="sb-link-pass" type="password" placeholder="كلمة المرور" dir="ltr" style="margin:3px;padding:7px;border-radius:6px;border:1px solid #475569;background:#0f172a;color:#f8fafc;width:26%;font-size:11px"><button id="sb-link-btn" style="margin:3px;padding:7px 14px;border-radius:6px;border:none;background:#d4af37;color:#0f172a;font-weight:bold">ربط</button>';
        document.body.appendChild(bar);
        console.log('[SB] ⚠️ اضغط الشريط البرتقالي بالأعلى وأدخل كلمة مرور Supabase');
        document.getElementById('sb-link-btn').onclick = async function(){
            var email = document.getElementById('sb-link-email').value.trim();
            var pass = document.getElementById('sb-link-pass').value;
            if (!pass) { alert('أدخل كلمة المرور'); return; }
            var res = await sb.auth.signInWithPassword({ email:email, password:pass });
            if (res.error) { alert('❌ '+res.error.message); return; }
            authed = true; sbUid = res.data.user.id;
            bar.remove();
            console.log('[SB] ✅ تم ربط الحساب: '+email);
            syncAll();
        };
    }
    async function ensureAuth(){
        try { var res = await sb.auth.getSession(); if (res.data && res.data.session) { authed = true; sbUid = res.data.session.user.id; console.log('[SB] ✅ جلسة Supabase نشطة'); return; } } catch(e){}
        showLinkBar();
    }

    // ═══ التشغيل ═══
    function init(){
        console.log('[SB] admin-sb.js جاهز');
        var s = null; try { s = JSON.parse(localStorage.getItem('yr_session')||'null'); } catch(e){}
        if (s && (s.role === 'admin' || s.role === 'super_admin')) {
            waitDB(function(){
                hookWrites();
                ensureAuth().then(function(){ setTimeout(syncAll, 800); setInterval(syncAll, 30000); });
            });
        }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
    window.yrSB = { sync: syncAll, client: sb };
})();
