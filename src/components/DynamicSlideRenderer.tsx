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
}

export const DynamicSlideRenderer: React.FC<DynamicSlideRendererProps> = ({
  slide,
  profile,
  onImageTransform,
}) => {
  const theme = getSlideTheme(slide.theme, slide.background);
  const schema = getTemplateSchema(slide.layoutStyle || 'twitter', slide.contentType || 'text_1_image');

  const textLayer = slide.layers.text?.[0];
  const content = textLayer?.content || '';
  const quoteLayer = slide.layers.text?.find((t) => t.role === 'quote' || t.role === 'body');
  const signatureLayer = slide.layers.text?.find((t) => t.role === 'signature');

  const quoteText = quoteLayer?.content || content;
  const isLongText = quoteText.length > 140;
  const images = slide.layers.images || [];
  const isHorizontal = slide.imageLayout === 'horizontal';

  // Processar marcações <mark> com as cores do tema ativo
  const processMarkTags = (htmlText: string) => {
    if (!htmlText) return htmlText;
    return htmlText.replace(
      /<mark class="([^"]*)">/g,
      `<mark style="background-color: ${theme.markBg}; color: ${theme.markText}; padding: 2px 6px; border-radius: 4px; font-weight: 600;">`
    );
  };

  // Formatação de parágrafos e diálogos
  const renderFormattedText = (rawText: string) => {
    if (!rawText) {
      return (
        <span className="italic text-base opacity-60" style={{ color: theme.textSecondary }}>
          Escreva o conteúdo do slide aqui...
        </span>
      );
    }

    const processedHtml = processMarkTags(rawText);
    const paragraphs = processedHtml.split('\n\n');

    return paragraphs.map((p, idx) => {
      const dialogueMatch = p.match(/^([A-Za-z0-9_À-ÿ\s]+):\s*([\s\S]*)/);
      if (dialogueMatch) {
        const speaker = dialogueMatch[1];
        const dialogueBody = dialogueMatch[2];
        return (
          <div key={idx} className="mb-4 last:mb-0">
            <span
              className="font-extrabold px-2 py-0.5 rounded mr-2 inline-block text-lg"
              style={{ backgroundColor: theme.speakerBg, color: theme.speakerText }}
            >
              {speaker}:
            </span>
            <span
              className="leading-relaxed text-lg font-medium"
              style={{ color: theme.text }}
              dangerouslySetInnerHTML={{ __html: dialogueBody }}
            />
          </div>
        );
      }

      return (
        <p
          key={idx}
          className="mb-4 last:mb-0 text-lg leading-relaxed font-normal text-left"
          style={{ color: theme.text }}
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
        const titleText = slide.title || (slide.layoutStyle === 'news_article' ? 'MAS O PROCESSO NÃO SE RESUME A CORTAR.' : 'Essa é a foto mais incrível da história:');
        return (
          <div key={idx} className="shrink-0 my-1 w-full text-left">
            <h2
              className={`tracking-tight leading-tight ${
                slide.layoutStyle === 'news_article'
                  ? 'text-2xl font-black uppercase'
                  : 'text-lg font-bold'
              }`}
              style={{ color: theme.text }}
              dangerouslySetInnerHTML={{ __html: processMarkTags(titleText) }}
            />
          </div>
        );

      case 'body_text':
        return (
          <div key={idx} className="shrink-0 w-full">
            {renderFormattedText(content)}
          </div>
        );

      case 'quote_text':
        return (
          <div key={idx} className="my-auto max-w-lg w-full flex flex-col items-center justify-center">
            {quoteText ? (
              <p
                className={`leading-relaxed font-serif text-center ${isLongText ? 'text-xl' : 'text-2xl font-medium'}`}
                style={{ color: theme.text }}
                dangerouslySetInnerHTML={{ __html: processMarkTags(quoteText) }}
              />
            ) : (
              <p className="italic text-xl font-serif opacity-50 text-center" style={{ color: theme.textSecondary }}>
                "Digite a citação..."
              </p>
            )}
          </div>
        );

      case 'signature_text':
        return (
          <div key={idx} className="mt-auto pt-2 pb-1 w-full text-center flex justify-center items-center">
            <span className="font-handwriting text-3xl tracking-wider font-semibold italic" style={{ color: theme.text }}>
              {signatureLayer?.content || profile.name}
            </span>
          </div>
        );

      case 'badge_icon':
        return (
          <div key={idx} className="flex flex-col items-center gap-2">
            <div
              className="w-20 h-20 rounded-full p-1 shadow-2xl border flex items-center justify-center"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
            >
              <img
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                alt={profile.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase opacity-80" style={{ color: theme.textSecondary }}>
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
            className="flex-1 min-h-[220px] w-full group"
            cardBg={theme.cardBg}
            borderColor={theme.borderColor}
            textSecondary={theme.textSecondary}
          />
        );

      case 'dual_image':
        const captions = block.imageCaptions || [];
        return (
          <div
            key={idx}
            className={`flex-1 h-full w-full min-h-0 flex ${
              isHorizontal ? 'flex-row gap-2' : 'flex-col gap-2'
            }`}
          >
            <div className="flex-1 h-full w-full min-h-0 flex flex-col relative group">
              {captions[0] && (
                <span className="text-xs font-bold mb-1 block text-left shrink-0" style={{ color: theme.text }}>
                  {captions[0]}
                </span>
              )}
              <InteractiveImageContainer
                imageLayer={images[0]}
                imageIndex={0}
                onImageTransform={onImageTransform}
                className="flex-1 h-full w-full"
                fallbackText="Imagem 1"
                cardBg={theme.cardBg}
                borderColor={theme.borderColor}
                textSecondary={theme.textSecondary}
              />
            </div>

            <div className="flex-1 h-full w-full min-h-0 flex flex-col relative group">
              {captions[1] && (
                <span className="text-xs font-bold mb-1 block text-left shrink-0" style={{ color: theme.text }}>
                  {captions[1]}
                </span>
              )}
              <InteractiveImageContainer
                imageLayer={images[1]}
                imageIndex={1}
                onImageTransform={onImageTransform}
                className="flex-1 h-full w-full"
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
        className="w-full h-full flex flex-col justify-between p-6 transition-colors duration-200"
        style={{ backgroundColor: theme.bg }}
      >
        <div className="my-auto flex flex-col justify-center items-center w-full max-w-lg mx-auto py-4 gap-4">
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
          className="w-full h-full flex flex-col relative overflow-hidden transition-colors duration-200"
          style={{ backgroundColor: theme.bg }}
        >
          {/* Seção da Imagem no Topo (55% da altura) */}
          <div className="h-[55%] w-full relative bg-gray-900 overflow-hidden shrink-0 flex flex-col p-1">
            {renderBlock(topImageBlock, 0)}
          </div>

          {/* ÚNICA foto de perfil na linha de separação */}
          <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div
              className="w-20 h-20 rounded-full p-1.5 shadow-xl border flex items-center justify-center"
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
            className="flex-1 w-full pt-12 pb-4 px-6 flex flex-col justify-between items-center text-center overflow-hidden"
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
      className={`w-full h-full flex flex-col ${schema.container.padding || 'p-6'} ${schema.container.gap || 'gap-3'} transition-colors duration-200`}
      style={{ backgroundColor: theme.bg }}
    >
      {schema.blocks.map((block, idx) => renderBlock(block, idx))}
    </div>
  );
};
