with open("src/pages/admin/ads/AdGeneratorStudio.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# البحث عن أول تعريف state وإضافة المتغيرين عنده
anchor = "export const AdGeneratorStudio"

if "const [isMediaUploading, setIsMediaUploading]" not in code:
    # نضعهما فور دخول المكون
    replacement = """export const AdGeneratorStudio: React.FC = () => {
  const [isMediaUploading, setIsMediaUploading] = useState<boolean>(false);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');"""
    
    # استبدال سطر الإعلان عن المكون
    import re
    code = re.sub(
        r'export const AdGeneratorStudio:\s*React\.FC\s*=\s*\(\)\s*=>\s*\{',
        replacement,
        code,
        count=1
    )
    print("✅ تم تعريف isMediaUploading و uploadStatusText في بداية المكون بنجاح.")

with open("src/pages/admin/ads/AdGeneratorStudio.tsx", "w", encoding="utf-8") as f:
    f.write(code)
