import React, { useRef } from 'react';
import { Highlighter, Bold, RotateCcw } from 'lucide-react';

interface HighlightTextEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  rows?: number;
}

export const HighlightTextEditor: React.FC<HighlightTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escreva seu texto aqui...',
  rows = 4,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Aplica tag <mark> no trecho selecionado dentro da textarea
  const applyHighlight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) {
      alert('Selecione um trecho do texto antes de aplicar o marca-texto!');
      return;
    }

    const selectedText = value.substring(start, end);
    const highlightedText = `<mark class="bg-yellow-300 text-black px-1 rounded font-medium">${selectedText}</mark>`;
    const newValue = value.substring(0, start) + highlightedText + value.substring(end);

    onChange(newValue);
  };

  // Aplica <strong> no trecho selecionado
  const applyBold = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) return;

    const selectedText = value.substring(start, end);
    const boldText = `<strong>${selectedText}</strong>`;
    const newValue = value.substring(0, start) + boldText + value.substring(end);

    onChange(newValue);
  };

  // Remove todas as tags HTML
  const removeFormatting = () => {
    const cleanText = value.replace(/<[^>]*>?/gm, '');
    onChange(cleanText);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Mini Toolbar de Formatação */}
      <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700">
        <button
          type="button"
          onClick={applyHighlight}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-yellow-400 text-yellow-950 rounded hover:bg-yellow-300 transition shadow-sm"
          title="Destacar trecho selecionado com Marca-Texto Amarelo"
        >
          <Highlighter className="w-3.5 h-3.5" />
          <span>Marca-Texto</span>
        </button>

        <button
          type="button"
          onClick={applyBold}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-700 text-slate-200 rounded hover:bg-slate-600 transition"
          title="Tornar selecionado em negrito"
        >
          <Bold className="w-3.5 h-3.5" />
          <span>Negrito</span>
        </button>

        <button
          type="button"
          onClick={removeFormatting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 ml-auto transition"
          title="Remover todas as marcações HTML"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Limpar</span>
        </button>
      </div>

      {/* Textarea de Edição */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed resize-y"
      />
      <span className="text-[11px] text-slate-400">
        Dica: Selecione qualquer palavra/frase acima e clique em <strong>Marca-Texto</strong> para aplicar o efeito amarelo no slide.
      </span>
    </div>
  );
};
