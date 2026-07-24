import React from 'react';
import { UserProfile } from '@/types/carousel';
import { ThemeConfig } from '@/lib/themes';

interface TemplateHeaderProps {
  profile: UserProfile;
  themeConfig?: ThemeConfig;
  className?: string;
}

export const TemplateHeader: React.FC<TemplateHeaderProps> = ({ profile, themeConfig, className = '' }) => {
  const nameColor = themeConfig?.text || '#0f172a';
  const handleColor = themeConfig?.textSecondary || '#64748b';

  return (
    <div className={`w-full flex items-center justify-between px-4 pt-2 pb-2 shrink-0 ${className}`}>
      <div className="flex items-center gap-2.5">
        <img
          src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
          alt={profile.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
        />
        <div className="flex flex-col justify-center text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg leading-tight tracking-tight" style={{ color: nameColor }}>
              {profile.name || 'Seu Nome'}
            </span>
            {/* Blue Verification Badge */}
            <svg className="w-4 h-4 text-blue-500 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.9-6.9 1.5 1.5-8.5 8.4z" />
            </svg>
          </div>
          {profile.handle && (
            <span className="text-xs font-medium" style={{ color: handleColor }}>
              {profile.handle.startsWith('@') ? profile.handle : `@${profile.handle}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
