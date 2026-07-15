import React from 'react';

export interface AvatarProps {
  src?: string;
  name: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, className = '' }) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';
  return src ? (
    <img src={src} alt={name} className={`w-8 h-8 rounded-full object-cover ${className}`} />
  ) : (
    <div
      className={`w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold ${className}`}
    >
      {initials}
    </div>
  );
};
