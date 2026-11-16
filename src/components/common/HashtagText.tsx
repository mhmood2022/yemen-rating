import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface HashtagTextProps {
  text: string;
  className?: string;
  expandable?: boolean;
  maxLength?: number;
  maxLines?: number;
}

export const HashtagText = ({
  text,
  className = "",
  expandable = true,
  maxLength = 260,
  maxLines = 5,
}: HashtagTextProps) => {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const lines = text.split('\n');
  const needsTruncate = expandable && !expanded && (text.length > maxLength || lines.length > maxLines);

  let displayText = text;
  if (needsTruncate) {
    if (lines.length > maxLines) {
      displayText = lines.slice(0, maxLines).join('\n');
    }
    if (displayText.length > maxLength) {
      displayText = displayText.slice(0, maxLength);
    }
    displayText = displayText.replace(/[\s،.]+$/, '');
  }

  const parts = displayText.split(/(#[^\s#]+)/g);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith('#') ? (
          <Link
            key={i}
            to={`/search?q=${encodeURIComponent(part)}`}
            className="text-[#FFC500] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </Link>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
      {needsTruncate && (
        <>
          {'... '}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(true);
            }}
            className="text-[#FFC500] hover:underline font-medium inline cursor-pointer"
          >
            عرض المزيد
          </button>
        </>
      )}
    </span>
  );
};
