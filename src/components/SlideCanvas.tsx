import React, { forwardRef } from 'react';
import { Slide, UserProfile } from '@/types/carousel';
import { TwitterStyleSlide } from './templates/TwitterStyleSlide';
import { ImmersiveStyleSlide } from './templates/ImmersiveStyleSlide';

interface SlideCanvasProps {
  slide: Slide;
  profile: UserProfile;
  aspectRatio?: '4:5' | '1:1';
  onImageTransform?: (imageIndex: number, transform: { scale?: number; offsetX?: number; offsetY?: number }) => void;
  onSelectImage?: (imageIndex: number) => void;
}

export const SlideCanvas = forwardRef<HTMLDivElement, SlideCanvasProps>(
  ({ slide, profile, aspectRatio = '4:5', onImageTransform, onSelectImage }, ref) => {
    const isImmersive = slide.layoutStyle === 'immersive';
    const heightClass = aspectRatio === '1:1' ? 'aspect-square' : 'aspect-[4/5]';

    return (
      <div className="w-full flex items-center justify-center p-4">
        <div
          ref={ref}
          id={`slide_canvas_${slide.id}`}
          className={`w-[440px] ${heightClass} bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 relative shrink-0 transition-all duration-300`}
        >
          {isImmersive ? (
            <ImmersiveStyleSlide slide={slide} profile={profile} onImageTransform={onImageTransform} onSelectImage={onSelectImage} />
          ) : (
            <TwitterStyleSlide slide={slide} profile={profile} onImageTransform={onImageTransform} onSelectImage={onSelectImage} />
          )}
        </div>
      </div>
    );
  }
);

SlideCanvas.displayName = 'SlideCanvas';
