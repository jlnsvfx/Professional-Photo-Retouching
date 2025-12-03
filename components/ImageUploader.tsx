import React, { useCallback, useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { ImageFile } from '../types';

interface ImageUploaderProps {
  onImageSelected: (image: ImageFile) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageSelected({
        file,
        preview: result,
        base64: result,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className="w-full max-w-2xl mx-auto"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div 
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-slate-700 hover:border-indigo-500 hover:bg-slate-800/50 rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group"
      >
        <input 
          type="file" 
          ref={inputRef}
          className="hidden" 
          accept="image/*"
          onChange={handleChange}
        />
        
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-indigo-500/10">
          <Upload className="w-10 h-10 text-indigo-400 group-hover:text-indigo-500" />
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-2">
          Upload an image to start
        </h3>
        <p className="text-slate-400 mb-6 max-w-sm mx-auto">
          Drag and drop your photo here, or click to browse files. Supports JPG, PNG, WEBP.
        </p>
        
        <div className="flex justify-center gap-4 text-sm text-slate-500">
          <span className="flex items-center">
            <ImageIcon className="w-4 h-4 mr-1" />
            High Quality
          </span>
          <span className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-1 text-[10px] font-bold">✓</span>
            Secure Processing
          </span>
        </div>
      </div>
    </div>
  );
};
