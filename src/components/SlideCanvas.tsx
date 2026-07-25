import React, { forwardRef } from 'react';
import { Slide, UserProfile } from '@/types/carousel';
import { DynamicSlideRenderer } from './DynamicSlideRenderer';

interface SlideCanvasProps {
  slide: Slide;
  profile: UserProfile;
  aspectRatio?: '4:5' | '1:1';
  onImageTransform?: (imageIndex: number, transform: { scale?: number; offsetX?: number; offsetY?: number }) => void;
  onAssignMedia?: (slideId: string, imageIndex: number, url: string) => void;
}

export const SlideCanvas = forwardRef<HTMLDivElement, SlideCanvasProps>(
  ({ slide, profile, aspectRatio = '4:5', onImageTransform, onAssignMedia }, ref) => {
    const isSquare = aspectRatio === '1:1';
    const dimensionClasses = isSquare
      ? 'w-[460px] h-[460px] aspect-square'
      : 'w-[460px] h-[575px] aspect-[4/5]';

    return (
      <div className="w-full flex items-center justify-center p-0">
        <div
          ref={ref}
          id={`slide_canvas_${slide.id}`}
          className={`${dimensionClasses} bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 relative shrink-0 flex flex-col transition-all duration-300`}
          style={{ width: '460px', height: isSquare ? '460px' : '575px' }}
        >
          <DynamicSlideRenderer
            slide={slide}
            profile={profile}
            onImageTransform={onImageTransform}
            onAssignMedia={onAssignMedia}
          />
        </div>
      </div>
    );
  }
);

SlideCanvas.displayName = 'SlideCanvas';
