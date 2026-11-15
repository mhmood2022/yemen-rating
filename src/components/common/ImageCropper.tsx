import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X } from 'lucide-react';

interface Props {
  image: string;
  aspect: number;
  onCrop: (base64: string) => void;
  onCancel: () => void;
}

export const ImageCropper = ({ image, aspect, onCrop, onCancel }: Props) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async () => {
    
    try {
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.src = image;
      await new Promise(resolve => { img.onload = resolve; });
      const ctx = canvas.getContext('2d');
      if (!ctx || !croppedAreaPixels) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
      onCrop(canvas.toDataURL('image/jpeg', 0.9));
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col" dir="rtl">
      {/* هيدر X */}
      <div className="flex items-center justify-between px-4 h-[68px] border-b border-[#2F3336] bg-black shrink-0">
        <button type="button" onClick={onCancel} className="text-white p-2 hover:bg-white/10 rounded-full transition">
          <X size={24} />
        </button>
        <span className="text-white font-bold text-[15px]">تعديل الصورة</span>
        <button 
          onClick={getCroppedImg} 
          className="text-[#FFC500] font-bold text-sm p-2 hover:bg-white/10 rounded-full transition px-4"
        >
          تطبيق
        </button>
      </div>

      {/* منطقة القص */}
      <div className="flex-1 relative bg-black min-h-0">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          style={{
            containerStyle: { background: '#000' },
          }}
        />
      </div>

      {/* شريط التحكم السفلي */}
      <div className="p-6 bg-black border-t border-[#2F3336] pb-12 shrink-0">
        <div className="flex items-center gap-3">
          {/* أيقونة التكبير الصغيرة يمين */}
          <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="range" 
            min={1} 
            max={3} 
            step={0.01} 
            value={zoom} 
            onChange={(e) => setZoom(Number(e.target.value))} 
            className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to left, #FFC500 0%, #FFC500 ${(zoom - 1) / 2 * 100}%, #333 ${(zoom - 1) / 2 * 100}%, #333 100%)`,
              border: '1px solid #444',
            }}
          />
          <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>
        <p className="text-center text-[#71767B] text-xs mt-3">اسحب الصورة للتعديل، واستخدم الشريط للتكبير</p>
      </div>
    </div>
  );
};
