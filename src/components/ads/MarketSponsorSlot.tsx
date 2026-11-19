import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Sparkles } from 'lucide-react';
import {
  adsDatabaseService,
  ExtendedAdRecord,
} from '../../services/adsDatabaseService';
import {
  MarketSectionId,
  MAX_ACTIVE_SPONSORS_PER_SECTION,
} from '../../utils/adGeneratorEngine';

interface MarketSponsorSlotProps {
  section: MarketSectionId;
  className?: string;
}

export const MarketSponsorSlot: React.FC<MarketSponsorSlotProps> = ({
  section,
  className = '',
}) => {
  const [sponsors, setSponsors] = useState<ExtendedAdRecord[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const recordedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    setActiveIdx(0);
    adsDatabaseService
      .getEligibleAdsForSlot(
        section,
        'sponsor',
        MAX_ACTIVE_SPONSORS_PER_SECTION
      )
      .then((list) => {
        if (mounted) setSponsors(list || []);
      })
      .catch(() => {
        if (mounted) setSponsors([]);
      });
    return () => {
      mounted = false;
    };
  }, [section]);

  useEffect(() => {
    if (sponsors.length <= 1) return;
    const t = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % sponsors.length);
    }, 7500);
    return () => clearInterval(t);
  }, [sponsors.length]);

  const current = sponsors[activeIdx] || sponsors[0] || null;

  useEffect(() => {
    if (!current?.id) return;
    if (recordedIdsRef.current.has(current.id)) return;
    recordedIdsRef.current.add(current.id);
    adsDatabaseService.recordImpression(current.id);
  }, [current?.id]);

  if (!current) return null;

  const d: any = current;
  const styles = d.styles || {};
  const bgColor = styles.bgColor || d.bgColor || '#090E1A';
  const accentColor = styles.accentColor || d.accentColor || '#F5C400';
  const textColor = styles.textColor || d.textColor || '#FFFFFF';
  const btnBg = styles.btnBgColor || d.btnBgColor || '#16A34A';
  const btnTxt = styles.btnTextColor || d.btnTextColor || '#FFFFFF';
  const animEffect = styles.animationEffect || d.animationEffect || 'shimmer';
  const customHeight = Number(styles.customHeight || d.customHeight || 130);
  const mediaUrl = d.mediaUrl || d.media_url || d.image_url || '';
  const mediaType =
    d.mediaType || (String(mediaUrl).endsWith('.mp4') ? 'video' : 'image');
  const logoUrl = d.logoUrl || d.sponsor_logo || '';
  const advertiserName = d.advertiserName || d.sponsor_name || '';
  const sponsorTag = d.sponsorTag || d.sponsor_tag || 'الراعي الرسمي';
  const title = d.title || d.headline || '';
  const ctaText = d.ctaText || 'زيارة الراعي';
  const showTag = d.showTag !== false;
  const showButton = d.showButton !== false;
  const showText = d.showText !== false;
  const showAdInfo = d.showAdInfo !== false;
  const bannerHeight = Math.min(Math.max(customHeight, 88), 160);
  const targetUrl =
    d.actionType === 'whatsapp' && d.whatsappPhone
      ? `https://wa.me/${String(d.whatsappPhone).replace(/\D/g, '')}?text=${encodeURIComponent(d.whatsappMessage || '')}`
      : d.actionType === 'call' && d.callPhone
      ? `tel:${d.callPhone}`
      : d.targetUrl || d.target_url || '#';
  const isInternal = targetUrl.startsWith('/');

  const onSponsorClick = () => {
    adsDatabaseService.recordClick(current.id);
  };

  const innerContent = (
    <>
      <style>{`
        @keyframes yrSpPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }
        @keyframes yrSpGlow { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.22); } }
        @keyframes yrSpShimmer { 0% { transform: translateX(-150%) skewX(-20deg); } 100% { transform: translateX(250%) skewX(-20deg); } }
        .yr-sp-pulse { animation: yrSpPulse 5s ease-in-out infinite; }
        .yr-sp-glow { animation: yrSpGlow 4s ease-in-out infinite; }
        .yr-sp-shimmer {
          position: absolute; top: 0; bottom: 0; width: 45%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
          animation: yrSpShimmer 3.8s infinite ease-in-out;
          pointer-events: none; z-index: 5;
        }
      `}</style>
      {mediaUrl ? (
        <div className="relative w-full bg-[#0B101D] overflow-hidden" style={{ height: `${bannerHeight}px` }}>
          {mediaType === 'video' ? (
            <video
              src={mediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className={`w-full h-full object-cover ${
                animEffect === 'pulse'
                  ? 'yr-sp-pulse'
                  : animEffect === 'glow'
                  ? 'yr-sp-glow'
                  : ''
              }`}
            />
          ) : (
            <img
              src={mediaUrl}
              alt={advertiserName || 'الراعي الرسمي'}
              className={`w-full h-full object-cover ${
                animEffect === 'pulse'
                  ? 'yr-sp-pulse'
                  : animEffect === 'glow'
                  ? 'yr-sp-glow'
                  : ''
              }`}
            />
          )}
          {animEffect === 'shimmer' && <div className="yr-sp-shimmer" />}
          <div className={`absolute inset-0 flex flex-col justify-between p-2 z-10 ${showText || showButton || showTag ? 'bg-gradient-to-t from-black/80 via-black/20 to-black/40' : ''}`}>
            <div className="flex items-center justify-between gap-1.5">
              {showTag ? (
                <span
                  style={{
                    backgroundColor: `${accentColor}25`,
                    color: accentColor,
                    borderColor: `${accentColor}50`,
                  }}
                  className="px-1.5 py-0.5 border text-[9px] font-black rounded-none flex items-center gap-1 shrink-0"
                >
                  <Sparkles size={10} />
                  <span>{sponsorTag}</span>
                </span>
              ) : <span />}
              <div className="flex items-center gap-1 shrink-0">
                {showButton && (
                  <span
                    style={{ backgroundColor: btnBg, color: btnTxt }}
                    className="text-[9px] font-black px-2.5 py-0.5 rounded-none flex items-center gap-1 shadow-md"
                  >
                    <span>{ctaText}</span>
                    <ExternalLink size={9} />
                  </span>
                )}
                {showAdInfo && (
                  <>
                    <span className="text-[8px] text-zinc-300 bg-black border border-white/15 px-1.5 py-0.5 rounded-none">
                      إعلان الراعي ⓘ
                    </span>
                    <span className="text-[8px] font-black text-zinc-100 bg-white/15 border border-white/25 px-1 py-0.5 rounded-none font-sans">
                      AD
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-end justify-between gap-2">
              {showText ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt="logo"
                      style={{ borderColor: accentColor }}
                      className="w-5 h-5 rounded-full object-cover border bg-black shrink-0"
                    />
                  )}
                  <h4 className="text-white text-[11px] sm:text-xs font-bold truncate drop-shadow-md">
                    {advertiserName || title}
                  </h4>
                </div>
              ) : <span />}
              <div className="flex items-center gap-2 shrink-0">
                {showText && title && advertiserName && (
                  <p
                    style={{ color: textColor }}
                    className="text-[10px] font-bold drop-shadow-md text-left truncate max-w-[160px] sm:max-w-[260px]"
                  >
                    {title}
                  </p>
                )}
                {sponsors.length > 1 && (
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {sponsors.map((sp, idx) => (
                      <button
                        key={sp.id}
                        type="button"
                        aria-label={`راعي ${idx + 1}`}
                        onClick={() => setActiveIdx(idx)}
                        className={`h-1 rounded-none transition-all cursor-pointer ${
                          idx === activeIdx
                            ? 'w-3.5 bg-[#FFC500]'
                            : 'w-1.5 bg-white/35 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2.5 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span
              style={{ color: accentColor, borderColor: accentColor }}
              className="px-1.5 py-0.5 text-[9px] font-bold border rounded-none flex items-center gap-1 shrink-0"
            >
              <Sparkles size={9} />
              <span>{sponsorTag}</span>
            </span>
            {logoUrl && (
              <img
                src={logoUrl}
                alt="logo"
                className="w-5 h-5 rounded-full object-cover border shrink-0"
                style={{ borderColor: accentColor }}
              />
            )}
            <span className="text-white text-xs font-bold truncate">
              {advertiserName || title || 'راعي القسم'}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span
              style={{ backgroundColor: btnBg, color: btnTxt }}
              className="text-[9px] font-black px-2.5 py-0.5 rounded-none flex items-center gap-1 shadow-md"
            >
              <span>{ctaText}</span>
              <ExternalLink size={9} />
            </span>
            <span className="text-[8px] text-zinc-300 bg-black border border-white/15 px-1.5 py-0.5 rounded-none">
              إعلان الراعي ⓘ
            </span>
            <span className="text-[8px] font-black text-zinc-100 bg-white/15 border border-white/25 px-1 py-0.5 rounded-none font-sans">
              AD
            </span>
          </div>
        </div>
      )}
    </>
  );

  const boxClass =
    'block relative w-full rounded-none overflow-hidden transition-all duration-300 border-b-2 group hover:brightness-110';
  const boxStyle: React.CSSProperties = {
    backgroundColor: bgColor,
    borderColor: accentColor,
    borderRadius: '0px',
    minHeight: mediaUrl ? `${bannerHeight}px` : '52px',
  };

  if (isInternal) {
    return (
      <div dir="rtl" className={`w-full ${className}`}>
        <Link
          to={targetUrl}
          onClick={onSponsorClick}
          className={boxClass}
          style={boxStyle}
        >
          {innerContent}
        </Link>
      </div>
    );
  }

  return (
    <div dir="rtl" className={`w-full ${className}`}>
      <a
        href={targetUrl}
        target={targetUrl.startsWith('tel:') ? '_self' : '_blank'}
        rel="noopener noreferrer"
        onClick={onSponsorClick}
        className={boxClass}
        style={boxStyle}
      >
        {innerContent}
      </a>
    </div>
  );
};

export default MarketSponsorSlot;
