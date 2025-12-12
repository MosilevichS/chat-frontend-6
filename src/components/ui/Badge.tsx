'use client';

import * as React from 'react';

interface IBadge {
  count?: number;
  showZero?: boolean;
  maxCount?: number;
  className?: string;
  children?: React.ReactNode;
}

const Badge = ({
  count,
  showZero = false,
  maxCount = 99,
  className = '',
  children,
}: IBadge) => {
  if (count !== undefined && count === 0 && !showZero && !children) {
    return null;
  }

  const getContent = () => {
    if (children) return children;
    if (count !== undefined) {
      const displayCount = count > maxCount ? `${maxCount}+` : count;
      return `${displayCount}`;
    }
    return null;
  };

  const content = getContent();
  if (!content && !children) return null;

  const getBadgeSize = () => {
    if (count !== undefined) {
      const numStr = count.toString();
      if (numStr.length === 1) return 'single';
      return 'double';
    }
    return 'double';
  };

  const badgeSize = getBadgeSize();

  const badgeBaseStyle = 'inline-flex items-center justify-center font-medium select-none';
  
  const sizes = {
    single: 'w-[1.3125rem] h-[1.3125rem] rounded-full',
    double: 'min-w-[1.875rem] h-[1.3125rem] rounded-[0.65625rem]',
  };

  const variantStyle = 'bg-[var(--color-violet)] text-white';

  const combinedClasses = `${badgeBaseStyle} ${variantStyle} ${sizes[badgeSize]} ${className}`.trim();

  return (
    <div
      className={combinedClasses}
      style={{
        padding: '0.375rem',
        boxSizing: 'border-box',
      }}
      role="status"
      aria-live="polite"
    >
      <span className="text-[1rem] leading-none font-normal">
        {content}
      </span>
    </div>
  );
};

export default Badge;