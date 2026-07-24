import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
  icon?: React.ReactNode;
  title: string;
  badgeText?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  icon,
  title,
  badgeText,
  defaultOpen = true,
  children,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`flex flex-col bg-slate-900/90 border border-slate-800/80 rounded-2xl transition-all shadow-md ${className}`}>
      {/* Cabeçalho do Acordeão */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full p-4 flex items-center justify-between bg-slate-850/70 hover:bg-slate-800 transition text-left select-none group ${
          isOpen ? 'rounded-t-2xl' : 'rounded-2xl'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <span className="text-indigo-400 group-hover:scale-110 transition-transform shrink-0">{icon}</span>}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 truncate">{title}</span>
          {badgeText && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 shrink-0">
              {badgeText}
            </span>
          )}
        </div>

        <div className="p-1 rounded-lg bg-slate-800/60 text-slate-400 group-hover:text-white transition shrink-0 ml-2">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Conteúdo Expansível */}
      {isOpen && (
        <div className="p-4 pt-3 pb-5 border-t border-slate-800/60 flex flex-col gap-4 rounded-b-2xl animate-in fade-in duration-150">
          {children}
        </div>
      )}
    </div>
  );
};
