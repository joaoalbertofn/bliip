import React from 'react';
import { Slide, UserProfile } from '@/types/carousel';
import { getSlideTheme } from '@/lib/themes';
import { getTemplateSchema } from '@/templates/schemas/templatesRegistry';
import { TemplateHeader } from './templates/TemplateHeader';
import { InteractiveImageContainer } from './InteractiveImageContainer';
import { BlockConfig } from '@/types/templateSchema';

interface DynamicSlideRendererProps {
  slide: Slide;
  profile: UserProfile;
  onImageTransform?: (imageIndex: number, transform: { scale?: number; offsetX?: number; offsetY?: number }) => void;
  onAssignMedia?: (slideId: string, imageIndex: number, url: string) => void;
}

export const DynamicSlideRenderer: React.FC<DynamicSlideRendererProps> = ({
  slide,
  profile,
  onImageTransform,
  onAssignMedia,
}) => {
  const theme = getSlideTheme(slide.theme, slide.background);
  const schema = getTemplateSchema(slide.layoutStyle || 'twitter', slide.contentType || 'text_1_image');

  const textLayer = slide.layers.text?.[0];
  const content = textLayer?.content || '';
  const quoteLayer = slide.layers.text?.find((t) => t.role === 'quote' || t.role === 'body');
  const signatureLayer = slide.layers.text?.find((t) => t.role === 'signature');

  const quoteText = quoteLayer?.content || content;
  const images = slide.layers.images || [];
  const isHorizontal = slide.imageLayout === 'horizontal';

  // Tamanho dinâmico da fonte vindo do slide (Padrão: 20px)
  const customFontSize = slide.fontSize ?? 20;

  // Processar marcações <mark> com as cores do tema ativo
  const processMarkTags = (htmlText: string) => {
    if (!htmlText) return htmlText;
    return htmlText.replace(
      /<mark class="([^"]*)">/g,
      `<mark style="background-color: ${theme.markBg}; color: ${theme.markText}; padding: 2px 6px; border-radius: 4px; font-weight: 600;">`
    );
  };

  // Formatação de parágrafos e diálogos usando customFontSize e textAlignment
  const renderFormattedText = (rawText: string) => {
    if (!rawText) {
      return (
        <span className="italic opacity-60" style={{ color: theme.textSecondary, fontSize: `${customFontSize}px` }}>
          Escreva o conteúdo do slide aqui...
        </span>
      );
    }

    const processedHtml = processMarkTags(rawText);
    const paragraphs = processedHtml.split('\n\n');
    const textAlignClass = slide.textAlignment === 'center' ? 'text-center' : slide.textAlignment === 'right' ? 'text-right' : 'text-left';

    return paragraphs.map((p, idx) => {
      const dialogueMatch = p.match(/^([A-Za-z0-9_À-ÿ\s]+):\s*([\s\S]*)/);
      if (dialogueMatch) {
        const speaker = dialogueMatch[1];
        const dialogueBody = dialogueMatch[2];
        return (
          <div key={idx} className={`mb-3 last:mb-0 ${textAlignClass}`}>
            <span
              className="font-extrabold px-2 py-0.5 rounded mr-2 inline-block"
              style={{
                backgroundColor: theme.speakerBg,
                color: theme.speakerText,
                fontSize: `${Math.max(12, Math.round(customFontSize * 0.85))}px`,
              }}
            >
              {speaker}:
            </span>
            <span
              className="leading-relaxed font-medium"
              style={{ color: theme.text, fontSize: `${customFontSize}px`, lineHeight: 1.4 }}
              dangerouslySetInnerHTML={{ __html: dialogueBody }}
            />
          </div>
        );
      }

      return (
        <p
          key={idx}
          className={`mb-3 last:mb-0 leading-relaxed font-normal ${textAlignClass}`}
          style={{ color: theme.text, fontSize: `${customFontSize}px`, lineHeight: 1.4 }}
          dangerouslySetInnerHTML={{ __html: p }}
        />
      );
    });
  };

  // Renderizador de Blocos Individuais
  const renderBlock = (block: BlockConfig, idx: number) => {
    switch (block.type) {
      case 'profile_header':
        return <TemplateHeader key={idx} profile={profile} themeConfig={theme} />;

      case 'title_text':
        // O título da notícia só deve ser exibido se o estilo visual do slide for 'news_article'
        if (slide.layoutStyle !== 'news_article') return null;

        const rawTitle = slide.title !== undefined ? slide.title : 'MAS O PROCESSO NÃO SE RESUME A CORTAR.';
        if (!rawTitle || rawTitle.trim() === '') return null;

        const titleAlignClass = slide.titleAlignment === 'center' ? 'text-center' : slide.titleAlignment === 'right' ? 'text-right' : 'text-left';

        return (
          <div key={idx} className={`shrink-0 my-0.5 w-full ${titleAlignClass}`}>
            <h2
              className="font-black uppercase tracking-tight leading-tight"
              style={{ color: theme.text, fontSize: `${Math.round(customFontSize * 1.25)}px`, lineHeight: 1.25 }}
              dangerouslySetInnerHTML={{ __html: processMarkTags(rawTitle) }}
            />
          </div>
        );

      case 'body_text':
        return (
          <div key={idx} className="shrink-0 w-full overflow-hidden">
            {renderFormattedText(content)}
          </div>
        );

      case 'quote_text':
        return (
          <div key={idx} className="my-auto max-w-lg w-full flex flex-col items-center justify-center">
            {quoteText ? (
              <p
                className="leading-relaxed font-serif text-center font-medium"
                style={{ color: theme.text, fontSize: `${Math.round(customFontSize * 1.2)}px`, lineHeight: 1.35 }}
                dangerouslySetInnerHTML={{ __html: processMarkTags(quoteText) }}
              />
            ) : (
              <p className="italic font-serif opacity-50 text-center" style={{ color: theme.textSecondary, fontSize: `${customFontSize}px` }}>
                "Digite a citação..."
              </p>
            )}
          </div>
        );

      case 'signature_text':
        return (
          <div key={idx} className="mt-auto pt-2 pb-1 w-full text-center flex justify-center items-center shrink-0">
            <span className="font-handwriting tracking-wider font-semibold italic text-2xl" style={{ color: theme.text }}>
              {signatureLayer?.content || profile.name}
            </span>
          </div>
        );

      case 'badge_icon':
        return (
          <div key={idx} className="flex flex-col items-center gap-2 shrink-0">
            <div
              className="w-16 h-16 rounded-full p-1 shadow-2xl border flex items-center justify-center"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
            >
              <img
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                alt={profile.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="text-[11px] font-bold tracking-widest uppercase opacity-80" style={{ color: theme.textSecondary }}>
              {profile.name}
            </span>
          </div>
        );

      case 'single_image':
        return (
          <InteractiveImageContainer
            key={idx}
            imageLayer={images[0]}
            imageIndex={0}
            onImageTransform={onImageTransform}
            onAssignMedia={(idx, droppedUrl) => onAssignMedia?.(slide.id, idx, droppedUrl)}
            className="flex-1 min-h-0 w-full h-full group"
            cardBg={theme.cardBg}
            borderColor={theme.borderColor}
            textSecondary={theme.textSecondary}
          />
        );

      case 'dual_image':
        const label1 = images[0]?.title !== undefined ? images[0].title : 'Antes';
        const label2 = images[1]?.title !== undefined ? images[1].title : 'Depois';

        return (
          <div
            key={idx}
            className={`flex-1 min-h-0 h-full w-full flex ${
              isHorizontal ? 'flex-row gap-2' : 'flex-col gap-2'
            }`}
          >
            <div className="flex-1 min-h-0 h-full w-full flex flex-col relative group">
              {label1 && label1.trim() !== '' && (
                <span className="text-xs font-bold mb-1 block text-left shrink-0" style={{ color: theme.text }}>
                  {label1}
                </span>
              )}
              <InteractiveImageContainer
                imageLayer={images[0]}
                imageIndex={0}
                onImageTransform={onImageTransform}
                onAssignMedia={(idx, droppedUrl) => onAssignMedia?.(slide.id, idx, droppedUrl)}
                className="flex-1 min-h-0 h-full w-full"
                fallbackText="Imagem 1"
                cardBg={theme.cardBg}
                borderColor={theme.borderColor}
                textSecondary={theme.textSecondary}
              />
            </div>

            <div className="flex-1 min-h-0 h-full w-full flex flex-col relative group">
              {label2 && label2.trim() !== '' && (
                <span className="text-xs font-bold mb-1 block text-left shrink-0" style={{ color: theme.text }}>
                  {label2}
                </span>
              )}
              <InteractiveImageContainer
                imageLayer={images[1]}
                imageIndex={1}
                onImageTransform={onImageTransform}
                onAssignMedia={(idx, droppedUrl) => onAssignMedia?.(slide.id, idx, droppedUrl)}
                className="flex-1 min-h-0 h-full w-full"
                fallbackText="Imagem 2"
                cardBg={theme.cardBg}
                borderColor={theme.borderColor}
                textSecondary={theme.textSecondary}
              />
            </div>
          </div>
        );

      case 'watermark':
        return null;

      default:
        return null;
    }
  };

  // CASO 1: Container Estilo Card Centralizado (ex: Twitter Apenas Texto)
  if (schema.container.layout === 'centered_card') {
    return (
      <div
        className="w-full h-full min-h-0 flex flex-col justify-between p-6 overflow-hidden transition-colors duration-200"
        style={{ backgroundColor: theme.bg }}
      >
        <div className="my-auto flex flex-col justify-center items-center w-full max-w-lg mx-auto py-2 gap-3 overflow-hidden">
          {schema.blocks.map((block, idx) => renderBlock(block, idx))}
        </div>
      </div>
    );
  }

  // CASO 2: Container Estilo Divisória Topo/Base (ex: Imersivo)
  if (schema.container.layout === 'split_top_bottom') {
    const topImageBlock = schema.blocks.find((b) => b.type === 'single_image' || b.type === 'dual_image');

    if (topImageBlock) {
      return (
        <div
          className="w-full h-full min-h-0 flex flex-col relative overflow-hidden transition-colors duration-200"
          style={{ backgroundColor: theme.bg }}
        >
          {/* Seção da Imagem no Topo (55% da altura) */}
          <div className="h-[55%] w-full relative bg-gray-900 overflow-hidden shrink-0 flex flex-col p-1">
            {renderBlock(topImageBlock, 0)}
          </div>

          {/* ÚNICA foto de perfil na linha de separação */}
          <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div
              className="w-16 h-16 rounded-full p-1 shadow-xl border flex items-center justify-center"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
            >
              <img
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                alt={profile.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>

          {/* Seção de Texto da Base */}
          <div
            className="flex-1 min-h-0 w-full pt-10 pb-4 px-6 flex flex-col justify-between items-center text-center overflow-hidden"
            style={{ backgroundColor: theme.bg }}
          >
            {schema.blocks.map((block, idx) => {
              if (block.type === 'single_image' || block.type === 'dual_image' || block.type === 'badge_icon') return null;
              return renderBlock(block, idx);
            })}
          </div>
        </div>
      );
    }
  }

  // CASO 3: Container Flex Padrão (Coluna Vertical)
  return (
    <div
      className={`w-full h-full min-h-0 flex flex-col overflow-hidden ${schema.container.padding || 'p-6'} ${schema.container.gap || 'gap-3'} transition-colors duration-200`}
      style={{ backgroundColor: theme.bg }}
    >
      {schema.blocks.map((block, idx) => renderBlock(block, idx))}
    </div>
  );
};
