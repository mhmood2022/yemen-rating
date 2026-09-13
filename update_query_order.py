with open("src/services/adsDatabaseService.ts", "r", encoding="utf-8") as f:
    code = f.read()

# تعديل استعلام جلب الإعلانات ليتم ترتيبها من الأحدث للأقدم دائماً
old_query = """      let query = supabase
        .from('published_ads')
        .select('*')
        .eq('status', 'active');"""

new_query = """      let query = supabase
        .from('published_ads')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });"""

if old_query in code:
    code = code.replace(old_query, new_query)
    with open("src/services/adsDatabaseService.ts", "w", encoding="utf-8") as f:
        f.write(code)
    print("✅ تم ضبط الاستعلام ليجلب أحدث الإعلانات أولاً!")
else:
    print("الاستعلام محدث بالفعل.")
