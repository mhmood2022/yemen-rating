import shutil, time, re

file_path = 'src/pages/AccountPage.tsx'
backup_path = f"{file_path}.bak_{int(time.time())}"

# 1. أخذ نسخة احتياطية
shutil.copy(file_path, backup_path)
print(f"✅ تم أخذ نسخة احتياطية: {backup_path}")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# --- 1. إصلاح واجهة Post بإضافة الخصائص الناقصة ---
old_interface = """interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  text: string;
  image?: string;
  createdAt: string;
  createdAtDisplay?: string;
  isPinned?: boolean;
  likes: number;
  likedBy?: string[];
  replies: number;
  reposts: number;
  views: number;
}"""
new_interface = """interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorBadge?: any;
  text: string;
  image?: string;
  video?: string;
  video_url?: string;
  quote_text?: string;
  original?: any;
  isRepost?: boolean;
  createdAt: string;
  createdAtDisplay?: string;
  isPinned?: boolean;
  likes: number;
  likedBy?: string[];
  replies: number;
  reposts: number;
  views: number;
}"""
content = content.replace(old_interface, new_interface)

# --- 2. إصلاح المتغيرات المفقودة (lastScrollY, type === false) ---
if "const lastScrollY = useRef(0);" not in content:
    content = content.replace(
        "const [isScrolled, setIsScrolled] = useState(false);",
        "const [isScrolled, setIsScrolled] = useState(false);\n  const lastScrollY = useRef(0);"
    )
content = content.replace('if (!type || type === "none" || type === false) return null;', 'if (!type || type === "none") return null;')

# --- 3. إصلاح setPosts إلى setUserPosts ---
content = content.replace("setPosts((prevPosts: any[]) =>", "setUserPosts((prevPosts: any[]) =>")

# --- 4. إصلاح tweet.id إلى post.id ---
content = content.replace("tweet.id.replace('repost-', '')", "post.id.replace('repost-', '')")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم إصلاح أخطاء AccountPage.tsx بنجاح.")
