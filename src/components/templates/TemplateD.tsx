import React from 'react';
import { Slide, UserProfile } from '@/types/carousel';

interface TemplateDProps {
  slide: Slide;
  profile: UserProfile;
}

export const TemplateD: React.FC<TemplateDProps> = ({ slide, profile }) => {
  const quoteLayer = slide.layers.text?.find((t) => t.role === 'quote' || t.role === 'body');
  const signatureLayer = slide.layers.text?.find((t) => t.role === 'signature');
  const imageLayer = slide.layers.images?.[0];

  const imageUrl = imageLayer?.source.url;
  const quoteText = quoteLayer?.content || '';
  const isLongText = quoteText.length > 140;

  return (
    <div
      className="w-full h-full flex flex-col relative overflow-hidden"
      style={{ backgroundColor: slide.background || '#ffffff' }}
    >
      {/* Top Image Section (~60% height) */}
      <div className="h-[58%] w-full relative bg-gray-900 overflow-hidden shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Foto inspiracional"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-slate-800 p-6">
            <svg className="w-16 h-16 mb-2 stroke-current opacity-60" fill="none" viewBox="0 0 24 24">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" strokeWidth="1.5" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path strokeWidth="1.5" d="m21 15-5-5L5 21" />
            </svg>
            <span className="text-sm font-medium">Upload da foto inspiracional</span>
          </div>
        )}
      </div>

      {/* Profile Badge in the exact center line between top image & bottom section */}
      <div className="absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-20 h-20 rounded-full bg-white p-1.5 shadow-xl border-2 border-gray-100 flex items-center justify-center">
          <img
            src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={profile.name}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      </div>

      {/* Bottom White Section */}
      <div className="flex-1 w-full bg-white pt-7 pb-4 px-5 flex flex-col justify-between items-center text-center">
        {/* Quote Content */}
        <div className="my-auto max-w-lg">
          {quoteText ? (
            <p
              className={`text-gray-900 leading-relaxed font-serif ${
                isLongText ? 'text-xl' : 'text-2xl font-medium'
              }`}
              dangerouslySetInnerHTML={{ __html: quoteText }}
            />
          ) : (
            <p className="text-gray-400 italic text-xl font-serif">
              "Digite aqui a citação inspiracional..."
            </p>
          )}
        </div>

        {/* Signature (ocultada se o texto for longo) */}
        {!isLongText && (
          <div className="mt-4 pt-2">
            <span className="font-handwriting text-3xl text-gray-800 tracking-wider font-semibold italic">
              {signatureLayer?.content || profile.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
