import React from 'react';

interface BliipLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textVersion?: string;
  subtitle?: string;
  className?: string;
}

export const BliipLogo: React.FC<BliipLogoProps> = ({
  size = 'md',
  showText = false,
  textVersion,
  subtitle,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-2xl',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${currentSizeClass} p-0.5 overflow-hidden shadow-xl shadow-purple-900/40 border border-amber-400/40 bg-slate-900 ring-1 ring-indigo-500/30 group-hover:border-amber-300 group-hover:ring-amber-400/50 group-hover:shadow-amber-500/30 transition-all duration-300 shrink-0 flex items-center justify-center`}>
        <img
          src="/logo.png"
          alt="Bliip Logo"
          className="w-full h-full object-cover rounded-[10px] transform group-hover:scale-105 transition duration-300"
        />
      </div>
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="font-extrabold text-white tracking-tight leading-none flex items-center gap-1.5 text-base">
            <span className="bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent font-black drop-shadow-sm">
              Bliip
            </span>
            {textVersion && (
              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded-full font-mono font-semibold">
                {textVersion}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[10px] text-slate-400 font-medium mt-1 leading-none">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
};
