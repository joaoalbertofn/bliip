import React, { useRef, useEffect } from 'react';
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
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChangeRef = useRef(false);

  // Sincronizar o valor externo de HTML com o editor quando mudar de slide ou resetar
  useEffect(() => {
    if (editorRef.current && !isInternalChangeRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current) return;
    isInternalChangeRef.current = true;
    const html = editorRef.current.innerHTML;
    onChange(html);
    setTimeout(() => {
      isInternalChangeRef.current = false;
    }, 50);
  };

  // Aplica o elemento <mark> de marca-texto amarelo visualmente na seleção
  const applyHighlight = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      alert('Selecione um trecho do texto antes de clicar em Marca-Texto!');
      return;
    }

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) {
      alert('Selecione o texto dentro do campo de edição!');
      return;
    }

    const container = document.createElement('div');
    container.appendChild(range.cloneContents());
    const selectedContent = container.innerHTML;

    // Inserir elemento <mark> estilizado sem expor tags de código brutas
    const markHtml = `<mark class="bg-yellow-300 text-slate-950 px-1 rounded font-medium">${selectedContent}</mark>`;
    document.execCommand('insertHTML', false, markHtml);
    handleInput();
  };

  // Aplica negrito visual
  const applyBold = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    document.execCommand('bold', false);
    handleInput();
  };

  // Remove todas as formatações e limpa o HTML
  const removeFormatting = () => {
    if (!editorRef.current) return;
    const cleanText = editorRef.current.innerText || editorRef.current.textContent || '';
    editorRef.current.innerHTML = cleanText;
    onChange(cleanText);
  };

  // Trata Enter como quebra de linha limpa
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      document.execCommand('insertLineBreak');
      e.preventDefault();
      handleInput();
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Mini Toolbar de Formatação Visual */}
      <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700/80 shadow-sm">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault(); // Impede a perda de seleção do cursor no editor
            applyHighlight();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-yellow-400 text-yellow-950 rounded-lg hover:bg-yellow-300 transition shadow-sm active:scale-95"
          title="Destacar trecho selecionado com Marca-Texto Amarelo"
        >
          <Highlighter className="w-3.5 h-3.5" />
          <span>Marca-Texto</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault(); // Impede a perda de seleção do cursor no editor
            applyBold();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition active:scale-95"
          title="Tornar trecho selecionado em negrito"
        >
          <Bold className="w-3.5 h-3.5" />
          <span>Negrito</span>
        </button>

        <button
          type="button"
          onClick={removeFormatting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 ml-auto transition"
          title="Remover todas as marcações e deixar apenas texto puro"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Limpar</span>
        </button>
      </div>

      {/* Editor ContentEditable WYSIWYG */}
      <div className="relative w-full">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          data-placeholder={placeholder}
          className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed overflow-y-auto transition-colors [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-slate-500 [&:empty]:before:pointer-events-none [&_mark]:bg-yellow-300 [&_mark]:text-slate-950 [&_mark]:font-medium [&_mark]:px-1.5 [&_mark]:py-0.5 [&_mark]:rounded [&_mark]:shadow-sm"
          style={{ minHeight: `${rows * 26}px`, maxHeight: '320px' }}
        />
      </div>

      <span className="text-[11px] text-slate-400 flex items-center gap-1">
        <span>💡 Selecione o texto e clique em <strong>Marca-Texto</strong> para ver o destaque amarelo em tempo real.</span>
      </span>
    </div>
  );
};
