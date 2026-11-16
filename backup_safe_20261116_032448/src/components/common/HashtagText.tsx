import React from 'react';
import { Link } from 'react-router-dom';

export const HashtagText = ({ text, className = "" }: { text: string, className?: string }) => {
  if (!text) return null;
  const parts = text.split(/(#[^\s#]+)/g);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith('#') ? (
          <Link key={i} to={`/search?q=${encodeURIComponent(part)}`} className="text-[#FFC500] hover:underline" onClick={(e) => e.stopPropagation()}>
            {part}
          </Link>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </span>
  );
};
