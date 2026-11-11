import os, re

f = 'src/components/feed/XActionBar.tsx'
if os.path.exists(f):
    with open(f, 'r', encoding='utf-8') as f:
        c = f.read()
    
    # تحويل زر إعادة النشر إلى رابط HTML (a) لكي لا يفتح التغريدة
    pattern = re.compile(r'<div className={`flex items-center gap-\[2px\].*?</div>', re.DOTALL)
    
    new_repost = """<a 
        href={`/post/${tweet.originalId || tweet.id.replace('repost-', '')}/engagements`}
        onClick={(e) => { e.stopPropagation(); }}
        className={`flex items-center gap-[2px] transition-colors group p-0 relative z-30 cursor-pointer ${isReposted ? 'text-[#00BA7C]' : 'hover:text-[#00BA7C]'}`}
      >
        <button
          onPointerDown={(e) => { e.stopPropagation(); }}
          onTouchStart={(e) => { e.stopPropagation(); }}
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            if(onRepost) onRepost(tweet); 
          }}
          onContextMenu={(e) => { 
            e.preventDefault(); 
            window.location.href = `/post/${tweet.originalId || tweet.id.replace('repost-', '')}/engagements`; 
          }}
          className="cursor-pointer border-0 bg-transparent p-0 flex items-center select-none"
        >
          <RepostIcon />
        </button>
        <span className="text-[10px] font-normal leading-none">
          {formatCountArabic(repostsCount)}
        </span>
      </a>"""
      
    if pattern.search(c):
        c = pattern.sub(new_repost, c)
        with open(f, 'w', encoding='utf-8') as f:
            f.write(c)
        print("✅ تم تحويل زر إعادة النشر إلى رابط HTML (a) يفتح الصفحة مباشرة.")
