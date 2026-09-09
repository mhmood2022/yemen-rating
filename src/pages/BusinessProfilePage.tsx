import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export const BusinessProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    if (typeof window !== 'undefined' && slug) {
      window.location.replace('/bank.html?slug=' + slug);
    }
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center text-white font-['Cairo']">
      جاري تحميل صفحة المنشأة...
    </div>
  );
};
