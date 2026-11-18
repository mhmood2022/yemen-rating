import os
import shutil
import time

file_path = "src/pages/PhoneMarketPage.tsx"

# 1. أخذ نسخة احتياطية (التزاماً بالقواعد)
if os.path.exists(file_path):
    backup_path = f"{file_path}.bak_{int(time.time())}"
    shutil.copy(file_path, backup_path)
    print(f"✅ تم أخذ نسخة احتياطية: {backup_path}")

# 2. كتابة الكود الجديد
code = '''import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  ShieldCheck, 
  SlidersHorizontal, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';

// بيانات تجريبية للهواتف (سنستبدلها لاحقاً بـ Supabase)
const mockPhones = [
  {
    id: '1',
    title: 'iPhone 14 Pro Max',
    price: '850,000 ريال',
    location: 'صنعاء',
    condition: 'مستعمل - ممتاز',
    image: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    sellerName: 'متجر التقنية',
    rating: 4.8,
    isVerified: true,
  },
  {
    id: '2',
    title: 'Samsung Galaxy S23 Ultra',
    price: '600,000 ريال',
    location: 'عدن',
    condition: 'جديد',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    sellerName: 'موبايلات النور',
    rating: 4.5,
    isVerified: true,
  },
  {
    id: '3',
    title: 'Tecno Camon 20',
    price: '150,000 ريال',
    location: 'تعز',
    condition: 'مستعمل',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    sellerName: 'أحمد للأجهزة',
    rating: 4.2,
    isVerified: false,
  },
  {
    id: '4',
    title: 'Xiaomi Redmi Note 12',
    price: '180,000 ريال',
    location: 'الحديدة',
    condition: 'جديد',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    sellerName: 'متجر اليمن',
    rating: 4.9,
    isVerified: true,
  }
];

export const PhoneMarketPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('phones');

  const tabs = [
    { id: 'phones', label: '📱 الهواتف' },
    { id: 'properties', label: '🏠 العقارات' },
    { id: 'jobs', label: '💼 الوظائف' },
    { id: 'auctions', label: '🔨 المزادات' },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      
      {/* 1. شريط التبويبات (متطابق مع هوية المنصة) */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-[#2F3336]">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-bold text-[15px] whitespace-nowrap transition-colors relative ${
                activeTab === tab.id ? 'text-white' : 'text-[#71767B] hover:text-white'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFC500] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2. إعلان الراعي (Sponsor Banner) */}
      <div className="p-4 border-b border-[#2F3336]">
        <div className="relative rounded-2xl overflow-hidden border border-[#2F3336] group cursor-pointer">
          <img 
            src="https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Sponsor" 
            className="w-full h-32 object-cover opacity-60 group-hover:opacity-80 transition"
          />
          <div className="absolute inset-0 p-4 flex flex-col justify-center bg-gradient-to-l from-black/80 to-transparent">
            <span className="text-[#FFC500] text-xs font-bold mb-1 flex items-center gap-1">
              <Sparkles size={12} /> الراعي الرسمي لسوق الهواتف
            </span>
            <h3 className="text-white font-bold text-lg">أفضل العروض على الآيفون</h3>
            <p className="text-[#71767B] text-sm">خصومات حصرية من متجر التقنية</p>
          </div>
        </div>
      </div>

      {/* 3. شريط البحث والفلترة */}
      <div className="p-4 border-b border-[#2F3336] space-y-3">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71767B]" size={18} />
          <input 
            type="text" 
            placeholder="ابحث عن آيفون، سامسونج، تورا..." 
            className="w-full bg-[#16181C] border border-[#2F3336] rounded-full py-3 pr-12 pl-4 text-white placeholder-[#71767B] focus:outline-none focus:border-white transition"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <button className="flex items-center gap-1 bg-[#16181C] border border-[#2F3336] rounded-full px-4 py-2 text-sm text-white hover:border-white transition">
            <MapPin size={14} /> المحافظة <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-1 bg-[#16181C] border border-[#2F3336] rounded-full px-4 py-2 text-sm text-white hover:border-white transition">
            <SlidersHorizontal size={14} /> الحالة <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-1 bg-[#16181C] border border-[#2F3336] rounded-full px-4 py-2 text-sm text-white hover:border-white transition">
            💰 السعر <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* 4. شبكة الهواتف (Grid) */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mockPhones.map((phone) => (
          <div key={phone.id} className="bg-[#16181C] border border-[#2F3336] rounded-2xl overflow-hidden hover:border-[#FFC500] transition cursor-pointer group">
            <div className="relative h-48 overflow-hidden">
              <img src={phone.image} alt={phone.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-white">
                {phone.condition}
              </div>
            </div>
            
            <div className="p-3">
              <h3 className="font-bold text-white text-lg mb-1">{phone.title}</h3>
              <div className="text-[#FFC500] font-extrabold text-xl mb-2">{phone.price}</div>
              
              <div className="flex items-center justify-between text-[#71767B] text-sm">
                <div className="flex items-center gap-1">
                  <MapPin size={14} /> {phone.location}
                </div>
                <div className="flex items-center gap-1">
                  {phone.isVerified && <ShieldCheck size={16} className="text-[#1D9BF0]" />}
                  <span className="text-white font-medium">{phone.sellerName}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#2F3336] flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm">
                  <Star size={14} className="text-[#FFC500] fill-[#FFC500]" />
                  <span className="text-white font-bold">{phone.rating}</span>
                </div>
                <button className="bg-[#FFC500] text-black font-bold text-sm px-4 py-1.5 rounded-full hover:bg-[#e5b100] transition">
                  تواصل
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default PhoneMarketPage;
'''
with open(file_path, "w", encoding="utf-8") as f:
    f.write(code)
print(f"✅ تم تحديث الملف: {file_path}")

# 3. إضافة إخفاء شريط التمرير إلى index.css
css_file = "src/index.css"
if os.path.exists(css_file):
    with open(css_file, "a", encoding="utf-8") as f:
        f.write("\n\n/* --- إخفاء شريط التمرير في التبويبات --- */\n")
        f.write(".hide-scrollbar::-webkit-scrollbar { display: none; }\n")
        f.write(".hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }\n")
    print("✅ تم إضافة تنسيق شريط التمرير إلى index.css")

