import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { Button } from './Button';

interface ComparisonSliderProps {
  original: string;
  modified: string;
  onDownload: () => void;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ original, modified, onDownload }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    }
  }, []);

  const onMouseDown = () => setIsDragging(true);
  const onTouchStart = () => setIsDragging(true);
  
  const onMouseUp = () => setIsDragging(false);
  const onTouchEnd = () => setIsDragging(false);

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (isDragging) handleMove(e.touches[0].clientX);
  };

  // Global mouse up handler to stop dragging if cursor leaves container
  useEffect(() => {
    const handleGlobalUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('touchend', handleGlobalUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto animate-fade-in">
      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-xl border border-slate-700 shadow-2xl select-none cursor-ew-resize group bg-slate-900"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onMouseMove={onMouseMove}
        onTouchMove={onTouchMove}
      >
        {/* Modified Image (Background) */}
        <img 
          src={modified} 
          alt="Modified" 
          className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
        />

        {/* Original Image (Foreground, clipped) */}
        <div 
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img 
            src={original} 
            alt="Original" 
            className="absolute top-0 left-0 max-w-none h-full w-auto object-contain"
            // We need to match the size of the parent exactly. 
            // object-contain might cause issues if aspect ratios differ slightly, but assuming same image source aspect ratio.
            // A better approach for exact overlay is using background images or ensuring exact dimensions.
            // For now, let's use a simpler full-width approach for the clipped image assuming container handles constraints.
            style={{ 
               width: containerRef.current?.offsetWidth ? `${containerRef.current.offsetWidth}px` : '100%'
            }}
          />
          {/* Label for Original */}
          <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm border border-white/10">
            ORIGINAL
          </div>
        </div>
        
        {/* Label for Modified */}
        <div className="absolute bottom-4 right-4 bg-indigo-600/80 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm border border-white/10">
          EDITED
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 active:scale-95">
            <div className="flex gap-0.5">
               <div className="w-0.5 h-3 bg-slate-400"></div>
               <div className="w-0.5 h-3 bg-slate-400"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <p className="text-slate-400 text-sm">
          Drag the slider to compare the result.
        </p>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => window.open(modified, '_blank')}
            icon={<ExternalLink size={16} />}
          >
            Open Full
          </Button>
          <Button 
            onClick={onDownload} 
            icon={<Download size={16} />}
          >
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};
