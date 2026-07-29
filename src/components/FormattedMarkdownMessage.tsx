import React from 'react';

interface FormattedMarkdownMessageProps {
  content: string;
}

export const FormattedMarkdownMessage: React.FC<FormattedMarkdownMessageProps> = ({ content }) => {
  if (!content) return null;

  // Quebrar em parágrafos e linhas
  const lines = content.split('\n');

  // Helper para renderizar negrito (**texto**) e itálico (*texto*) dentro de uma linha
  const renderFormattedText = (text: string) => {
    // Split por **negrito**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        const boldContent = part.slice(2, -2);
        return (
          <strong
            key={index}
            className="font-extrabold text-indigo-200 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-500/30 font-sans"
          >
            {boldContent}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col gap-2 text-[13px] leading-relaxed text-slate-200 font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Títulos h3 ou h2 (ex: ### 🗓️ Semana 1)
        if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
          const headerText = trimmed.replace(/^#{2,3}\s*/, '');
          return (
            <h3
              key={idx}
              className="text-sm font-extrabold text-purple-300 border-b border-purple-900/50 pb-1 mt-3 mb-1 flex items-center gap-2"
            >
              {renderFormattedText(headerText)}
            </h3>
          );
        }

        // Divisores horizontais (ex: ---)
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={idx} className="border-slate-700/60 my-2" />;
        }

        // Listas com marcadores (ex: * Item ou - Item ou 1. Item)
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const listText = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 my-0.5 border-l-2 border-indigo-500/40">
              <span className="text-indigo-400 font-bold text-xs mt-0.5">•</span>
              <span className="flex-1">{renderFormattedText(listText)}</span>
            </div>
          );
        }

        // Listas numeradas (ex: 1. Item ou 2. Item)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 my-0.5 border-l-2 border-purple-500/40">
              <span className="text-purple-300 font-bold text-xs bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-500/30">
                {numMatch[1]}
              </span>
              <span className="flex-1">{renderFormattedText(numMatch[2])}</span>
            </div>
          );
        }

        // Parágrafo Normal
        return (
          <p key={idx} className="leading-relaxed">
            {renderFormattedText(line)}
          </p>
        );
      })}
    </div>
  );
};
