import React from 'react';
import { Slide, UserProfile } from '@/types/carousel';

interface ImmersiveStyleSlideProps {
  slide: Slide;
  profile: UserProfile;
}

export const ImmersiveStyleSlide: React.FC<ImmersiveStyleSlideProps> = ({ slide, profile }) => {
  const quoteLayer = slide.layers.text?.find((t) => t.role === 'quote' || t.role === 'body');
  const signatureLayer = slide.layers.text?.find((t) => t.role === 'signature');
  const images = slide.layers.images || [];

  const quoteText = quoteLayer?.content || '';
  const isLongText = quoteText.length > 140;
  const isHorizontal = slide.imageLayout === 'horizontal';
  const contentType = slide.contentType || (slide.templateId === 'template_a' ? 'text_only' : slide.templateId === 'template_c' ? 'text_2_images' : 'text_1_image');

  // CASO 1: Apenas Texto no Estilo Imersivo (Círculo de Perfil + Texto + Assinatura totalmente centralizados no meio da tela)
  if (contentType === 'text_only') {
    const isDarkBg = slide.background === '#0f172a';
    const textColorClass = isDarkBg ? 'text-white' : 'text-gray-900';
    const sigColorClass = isDarkBg ? 'text-white/90' : 'text-gray-800';
    const subTextColorClass = isDarkBg ? 'text-white/80' : 'text-gray-600';

    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center text-center px-10 py-10 relative overflow-hidden"
        style={{ backgroundColor: slide.background || '#ffffff' }}
      >
        {/* Bloco Centralizado Vertical e Horizontalmente */}
        <div className="my-auto flex flex-col items-center justify-center gap-6 max-w-lg z-10 w-full">
          {/* Círculo de Perfil Badge */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-white p-1 shadow-2xl border-2 border-gray-100 flex items-center justify-center">
              <img
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                alt={profile.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className={`text-xs font-bold tracking-widest uppercase ${subTextColorClass}`}>
              {profile.name}
            </span>
          </div>

          {/* Texto Inspiracional Centralizado */}
          {quoteText ? (
            <p
              className={`leading-relaxed font-serif ${textColorClass} ${
                isLongText ? 'text-xl' : 'text-2xl font-medium'
              }`}
              dangerouslySetInnerHTML={{ __html: quoteText }}
            />
          ) : (
            <p className="text-gray-400 italic text-xl font-serif">
              "Digite a citação imersiva..."
            </p>
          )}

          {/* Assinatura Manuscrita no Rodapé */}
          {!isLongText && (
            <div className="pt-2">
              <span className={`font-handwriting text-3xl tracking-wider font-semibold italic ${sigColorClass}`}>
                {signatureLayer?.content || profile.name}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // CASO 2: Texto + 1 ou 2 Imagens no Estilo Imersivo (Foto no topo + Círculo Badge na divisória + Texto embaixo)
  return (
    <div
      className="w-full h-full flex flex-col relative overflow-hidden"
      style={{ backgroundColor: slide.background || '#ffffff' }}
    >
      {/* Top Image Section (~58% height) */}
      <div className="h-[58%] w-full relative bg-gray-900 overflow-hidden shrink-0">
        {contentType === 'text_1_image' && (
          images[0]?.source.url ? (
            <img src={images[0].source.url} alt="Foto" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-slate-800 text-sm">
              Upload de imagem
            </div>
          )
        )}

        {contentType === 'text_2_images' && (
          <div className={`w-full h-full flex ${isHorizontal ? 'flex-row' : 'flex-col'} gap-1`}>
            <div className="flex-1 h-full bg-slate-800 relative overflow-hidden">
              {images[0]?.source.url ? (
                <img src={images[0].source.url} alt="Img 1" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Foto 1</div>
              )}
            </div>
            <div className="flex-1 h-full bg-slate-800 relative overflow-hidden">
              {images[1]?.source.url ? (
                <img src={images[1].source.url} alt="Img 2" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Foto 2</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Profile Badge in the exact center line between top section & bottom section */}
      <div className="absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-20 h-20 rounded-full bg-white p-1.5 shadow-xl border-2 border-gray-100 flex items-center justify-center">
          <img
            src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
            alt={profile.name}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex-1 w-full bg-white pt-12 pb-4 px-6 flex flex-col justify-between items-center text-center">
        {/* Quote Content */}
        <div className="my-auto max-w-lg">
          {quoteText ? (
            <p
              className={`text-gray-900 leading-relaxed font-serif ${
                isLongText ? 'text-lg' : 'text-2xl font-medium'
              }`}
              dangerouslySetInnerHTML={{ __html: quoteText }}
            />
          ) : (
            <p className="text-gray-400 italic text-xl font-serif">
              "Digite o texto explicativo ou citação..."
            </p>
          )}
        </div>

        {/* Signature */}
        {!isLongText && (
          <div className="pt-1">
            <span className="font-handwriting text-3xl text-gray-800 tracking-wider font-semibold italic">
              {signatureLayer?.content || profile.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
