import re, shutil, time

files = ['src/pages/AccountPage.tsx', 'src/pages/CommunityFeedPage.tsx']

hashtag_func = """
  const renderHashtags = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(#[^\\s#]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <span
            key={i}
            className="text-[#FFC500] hover:underline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/search?q=${encodeURIComponent(part)}`);
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };
"""

for file in files:
    shutil.copy(file, f"{file}.bak_hashtag_{int(time.time())}")
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. إضافة دالة الهاشتاج إذا لم تكن موجودة
    if "const renderHashtags = " not in content:
        # نضع الدالة قبل الـ return الرئيسي
        content = content.replace("  return (", hashtag_func + "\n  return (", 1)

    # 2. استبدال عرض النصوص العادية بالدالة الجديدة
    # في AccountPage
    content = content.replace(">{post.text}</p>", ">{renderHashtags(post.text)}</p>")
    content = content.replace(">{post.original.text}</p>", ">{renderHashtags(post.original.text)}</p>")
    content = content.replace(">{post.quote_text}</p>", ">{renderHashtags(post.quote_text)}</p>")
    
    # في CommunityFeedPage
    content = content.replace(">{tweet.text}</p>", ">{renderHashtags(tweet.text)}</p>")
    content = content.replace(">{tweet.original.text}</p>", ">{renderHashtags(tweet.original.text)}</p>")
    content = content.replace(">{tweet.quote_text}</p>", ">{renderHashtags(tweet.quote_text)}</p>")
    
    # استبدال إضافي احتياطي (إذا كان النص داخل كلاسات معينة)
    content = re.sub(r'>\{([a-zA-Z0-9_?.]+\.text)\}<', r'>{renderHashtags(\1)}<', content)
    content = re.sub(r'>\{([a-zA-Z0-9_?.]+\.quote_text)\}<', r'>{renderHashtags(\1)}<', content)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("✅ تم تفعيل الهاشتاج (اللون الأصفر والبحث) في كل التغريدات داخل الحساب والمجتمع.")
