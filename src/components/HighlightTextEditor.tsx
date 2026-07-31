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
      let cleanVal = (value || '')
        .replace(/<mark(?:\s+[^>]+)?>/gi, '<mark>')
        .replace(/["'\s]*(?:bg-[a-z0-9-]+|text-[a-z0-9-]+|px-\d+|rounded|font-[a-z]+|inline|\[box-decoration-break:clone\]|\[-webkit-box-decoration-break:clone\]|class=)+["'\s>]*/gi, '');
      if (editorRef.current.innerHTML !== cleanVal) {
        editorRef.current.innerHTML = cleanVal;
      }
    }
  }, [value]);

  // Remove tags <mark> sem conteúdo de texto visível
  const cleanEmptyMarks = () => {
    if (!editorRef.current) return;
    const marks = editorRef.current.querySelectorAll('mark');
    marks.forEach((mark) => {
      const textContent = mark.textContent || '';
      if (!textContent.trim()) {
        while (mark.firstChild) {
          mark.parentNode?.insertBefore(mark.firstChild, mark);
        }
        mark.parentNode?.removeChild(mark);
      }
    });
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    cleanEmptyMarks();
    isInternalChangeRef.current = true;
    let html = editorRef.current.innerHTML
      .replace(/<mark(?:\s+[^>]+)?>/gi, '<mark>')
      .replace(/["'\s]*(?:bg-[a-z0-9-]+|text-[a-z0-9-]+|px-\d+|rounded|font-[a-z]+|inline|\[box-decoration-break:clone\]|\[-webkit-box-decoration-break:clone\]|class=)+["'\s>]*/gi, '');
    onChange(html);
    setTimeout(() => {
      isInternalChangeRef.current = false;
    }, 50);
  };

  // Aplica a marcação amarela (marca-texto) no texto selecionado
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
    let selectedContent = container.innerHTML;

    // Remover tags de bloco (div, p) para impedir a criação de caixas de bloco retangulares
    selectedContent = selectedContent.replace(/<\/?(div|p)[^>]*>/gi, '');

    // Inserir elemento <mark> limpo sem classes brutas
    const markHtml = `<mark>${selectedContent}</mark>`;
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

  // Trata Enter de forma inteligente com marca-texto
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        document.execCommand('insertLineBreak');
        handleInput();
        return;
      }

      const range = selection.getRangeAt(0);

      // Se houver texto selecionado, apaga antes de dar o enter
      if (!range.collapsed) {
        range.deleteContents();
      }

      // Verificar se o cursor está dentro de uma tag <mark>
      let markNode: HTMLElement | null = null;
      let curr: Node | null = range.startContainer;
      while (curr && curr !== editorRef.current) {
        if (curr.nodeType === Node.ELEMENT_NODE && (curr as HTMLElement).tagName.toLowerCase() === 'mark') {
          markNode = curr as HTMLElement;
          break;
        }
        curr = curr.parentNode;
      }

      if (!markNode) {
        // Se não está em um marca-texto, insere quebra de linha padrão
        const br = document.createElement('br');
        range.insertNode(br);
        range.setStartAfter(br);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        handleInput();
        return;
      }

      // Cursor está DENTRO do marca-texto
      const preRange = document.createRange();
      preRange.setStart(markNode, 0);
      preRange.setEnd(range.startContainer, range.startOffset);
      const textBefore = preRange.toString().replace(/\s+/g, '');

      const postRange = document.createRange();
      postRange.setStart(range.endContainer, range.endOffset);
      postRange.setEnd(markNode, markNode.childNodes.length);
      const textAfter = postRange.toString().replace(/\s+/g, '');

      const isAtStart = textBefore === '';
      const isAtEnd = textAfter === '';

      if (isAtStart) {
        // CASO 1: Enter no INÍCIO da marcação
        // Insere <br> ANTES do <mark> para descer todo o bloco sem deixar resquício no topo
        const br = document.createElement('br');
        markNode.parentNode?.insertBefore(br, markNode);

        const newRange = document.createRange();
        newRange.setStart(markNode, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else if (isAtEnd) {
        // CASO 2: Enter no FINAL da marcação
        // Insere <br> DEPOIS do <mark>
        const br = document.createElement('br');
        if (markNode.nextSibling) {
          markNode.parentNode?.insertBefore(br, markNode.nextSibling);
        } else {
          markNode.parentNode?.appendChild(br);
        }

        const newRange = document.createRange();
        if (br.nextSibling && br.nextSibling.nodeType === Node.TEXT_NODE) {
          newRange.setStart(br.nextSibling, 0);
        } else {
          newRange.setStartAfter(br);
        }
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // CASO 3: Enter no MEIO da marcação
        // Divide o <mark> em dois <mark>, mantendo destaque em ambas as partes
        const extractedContent = postRange.extractContents();

        const newMark = document.createElement('mark');
        newMark.className = markNode.className;
        newMark.appendChild(extractedContent);

        const br = document.createElement('br');

        if (markNode.nextSibling) {
          markNode.parentNode?.insertBefore(br, markNode.nextSibling);
          markNode.parentNode?.insertBefore(newMark, br.nextSibling);
        } else {
          markNode.parentNode?.appendChild(br);
          markNode.parentNode?.appendChild(newMark);
        }

        const newRange = document.createRange();
        newRange.setStart(newMark, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }

      cleanEmptyMarks();
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
          className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed overflow-y-auto transition-colors [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-slate-500 [&:empty]:before:pointer-events-none [&_mark]:bg-yellow-300 [&_mark]:text-slate-950 [&_mark]:font-medium [&_mark]:px-1.5 [&_mark]:py-0.5 [&_mark]:rounded [&_mark]:shadow-sm [&_mark]:inline [&_mark]:[box-decoration-break:clone] [&_mark]:[-webkit-box-decoration-break:clone]"
          style={{ minHeight: `${rows * 26}px`, maxHeight: '320px' }}
        />
      </div>

      <span className="text-[11px] text-slate-400 flex items-center gap-1">
        <span>💡 Selecione o texto e clique em <strong>Marca-Texto</strong> para ver o destaque amarelo em tempo real.</span>
      </span>
    </div>
  );
};
