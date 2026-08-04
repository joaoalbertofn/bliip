import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';

export interface InlineCanvasEditorRef {
  applyHighlight: () => void;
  applyBold: () => void;
  removeFormatting: () => void;
  focus: () => void;
}

interface InlineCanvasEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  fontSize: number;
  textAlign?: 'left' | 'center' | 'right';
  themeText: string;
  themeTextSecondary: string;
  themeMarkBg: string;
  themeMarkText: string;
  themeSpeakerBg?: string;
  themeSpeakerText?: string;
  placeholder?: string;
  className?: string;
  isSingleLine?: boolean;
}

export const InlineCanvasEditor = forwardRef<InlineCanvasEditorRef, InlineCanvasEditorProps>(
  (
    {
      value,
      onChange,
      onFocus,
      onBlur,
      fontSize,
      textAlign = 'left',
      themeText,
      themeTextSecondary,
      themeMarkBg,
      themeMarkText,
      themeSpeakerBg = '#e0e7ff',
      themeSpeakerText = '#3730a3',
      placeholder = 'Clique para editar o texto...',
      className = '',
      isSingleLine = false,
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isInternalChangeRef = useRef(false);
    const [isFocused, setIsFocused] = useState(false);

    // Sincroniza o HTML com o valor vindo do estado externo se não for edição interna
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

    // Aplica estilos visuais dinâmicos nas tags <mark> dentro do editor
    const applyMarkStyles = () => {
      if (!editorRef.current) return;
      const marks = editorRef.current.querySelectorAll('mark');
      marks.forEach((mark) => {
        mark.style.backgroundColor = themeMarkBg;
        mark.style.color = themeMarkText;
        mark.style.padding = '2px 6px';
        mark.style.borderRadius = '4px';
        mark.style.fontWeight = '700';
        mark.style.display = 'inline';
        (mark.style as any).webkitBoxDecorationBreak = 'clone';
        (mark.style as any).boxDecorationBreak = 'clone';
      });
    };

    useEffect(() => {
      applyMarkStyles();
    }, [themeMarkBg, themeMarkText, value]);

    // Remove tags <mark> sem conteúdo visível
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
      applyMarkStyles();
      isInternalChangeRef.current = true;
      let html = editorRef.current.innerHTML
        .replace(/<mark(?:\s+[^>]+)?>/gi, '<mark>')
        .replace(/["'\s]*(?:bg-[a-z0-9-]+|text-[a-z0-9-]+|px-\d+|rounded|font-[a-z]+|inline|\[box-decoration-break:clone\]|\[-webkit-box-decoration-break:clone\]|class=)+["'\s>]*/gi, '');
      onChange(html);
      setTimeout(() => {
        isInternalChangeRef.current = false;
      }, 50);
    };

    const removeFormatting = () => {
      if (!editorRef.current) return;
      const cleanText = editorRef.current.innerText || editorRef.current.textContent || '';
      editorRef.current.innerHTML = cleanText;
      onChange(cleanText);
    };

    // Métodos imperativos chamados pelos botões da Toolbar Superior do Canvas
    useImperativeHandle(ref, () => ({
      applyHighlight: () => {
        const editor = editorRef.current;
        if (!editor) return;

        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
          if (editor.querySelector('mark')) {
            removeFormatting();
          } else {
            const allText = editor.innerHTML;
            if (allText.trim()) {
              editor.innerHTML = `<mark>${allText}</mark>`;
              handleInput();
            }
          }
          return;
        }

        const range = selection.getRangeAt(0);
        if (!editor.contains(range.commonAncestorContainer)) return;

        const container = document.createElement('div');
        container.appendChild(range.cloneContents());
        let selectedContent = container.innerHTML;

        selectedContent = selectedContent.replace(/<\/?(div|p)[^>]*>/gi, '');
        const markHtml = `<mark>${selectedContent}</mark>`;
        document.execCommand('insertHTML', false, markHtml);
        handleInput();
      },

      applyBold: () => {
        const editor = editorRef.current;
        if (!editor) return;

        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
          document.execCommand('selectAll', false);
          document.execCommand('bold', false);
          handleInput();
          return;
        }

        const range = selection.getRangeAt(0);
        if (!editor.contains(range.commonAncestorContainer)) return;

        document.execCommand('bold', false);
        handleInput();
      },

      removeFormatting,

      focus: () => {
        editorRef.current?.focus();
      },
    }));

    // Trata pressionamento da tecla Enter para quebra de linha inteligente
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isSingleLine && e.key === 'Enter') {
        e.preventDefault();
        editorRef.current?.blur();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          document.execCommand('insertLineBreak');
          handleInput();
          return;
        }

        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
          range.deleteContents();
        }

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
          const br = document.createElement('br');
          range.insertNode(br);
          range.setStartAfter(br);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          handleInput();
          return;
        }

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
          const br = document.createElement('br');
          markNode.parentNode?.insertBefore(br, markNode);
          const newRange = document.createRange();
          newRange.setStart(markNode, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } else if (isAtEnd) {
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
          const extractedContent = postRange.extractContents();
          const newMark = document.createElement('mark');
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

    const alignClass =
      textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left';

    return (
      <div
        className={`relative group cursor-text transition-all duration-200 rounded-xl p-1 -m-1 ${
          isFocused
            ? 'ring-2 ring-indigo-500/80 bg-indigo-500/5 shadow-md'
            : 'hover:ring-1 hover:ring-indigo-400/40'
        } ${className}`}
      >
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className={`outline-none w-full min-h-[1em] leading-relaxed break-words ${alignClass}`}
          style={{
            fontSize: `${fontSize}px`,
            color: themeText,
            lineHeight: 1.4,
          }}
          data-placeholder={placeholder}
        />
        {isFocused && (
          <div className="absolute -top-3 right-2 bg-indigo-600 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded shadow pointer-events-none tracking-widest z-30">
            Editando Texto
          </div>
        )}
      </div>
    );
  }
);

InlineCanvasEditor.displayName = 'InlineCanvasEditor';
