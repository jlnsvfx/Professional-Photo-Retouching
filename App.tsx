import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ComparisonSlider } from './components/ComparisonSlider';
import { Button } from './components/Button';
import { editImageWithGemini } from './services/geminiService';
import { AppStatus, ImageFile } from './types';
import { Wand2, RefreshCcw, ArrowLeft, Image as ImageIcon, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("Remove wrinkles from this man's face");
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = (file: ImageFile) => {
    setImageFile(file);
    setGeneratedImage(null);
    setStatus(AppStatus.READY_TO_EDIT);
    setError(null);
  };

  const handleReset = () => {
    setImageFile(null);
    setGeneratedImage(null);
    setStatus(AppStatus.IDLE);
    setError(null);
    setPrompt("Remove wrinkles from this man's face");
  };

  const handleGenerate = async () => {
    if (!imageFile) return;

    setStatus(AppStatus.PROCESSING);
    setError(null);

    try {
      const result = await editImageWithGemini(
        imageFile.base64,
        imageFile.mimeType,
        prompt
      );
      setGeneratedImage(result);
      setStatus(AppStatus.COMPLETE);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while processing the image.");
      setStatus(AppStatus.READY_TO_EDIT); // Go back to ready state so user can retry
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `retouch-ai-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
              <Wand2 className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">RetouchAI</span>
          </div>
          
          <nav className="flex gap-4">
             {status !== AppStatus.IDLE && (
               <Button 
                 variant="secondary" 
                 onClick={handleReset}
                 className="text-sm py-1.5"
                 icon={<RefreshCcw size={14} />}
               >
                 New Project
               </Button>
             )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Error Banner */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {status === AppStatus.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
             <div className="text-center mb-12 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  Professional Photo Retouching
                </h1>
                <p className="text-lg text-slate-400">
                  Instantly remove wrinkles, blemishes, or objects using advanced Gemini AI. 
                  Just upload and describe what you want to change.
                </p>
             </div>
             <ImageUploader onImageSelected={handleImageSelected} />
          </div>
        )}

        {status !== AppStatus.IDLE && imageFile && (
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Sidebar Controls */}
            <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-xl">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-indigo-400" />
                  Edit Prompt
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      What should the AI do?
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                      placeholder="e.g., Remove wrinkles from the forehead..."
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Quick Prompts</span>
                    <div className="flex flex-wrap gap-2">
                      {['Remove wrinkles', 'Remove blemishes', 'Smooth skin', 'Remove glasses', 'Make younger'].map(p => (
                        <button 
                          key={p}
                          onClick={() => setPrompt(p)}
                          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-xs text-slate-300 transition-colors"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={handleGenerate} 
                      isLoading={status === AppStatus.PROCESSING}
                      className="w-full py-3 text-lg"
                      icon={<Wand2 className="w-5 h-5" />}
                    >
                      {status === AppStatus.PROCESSING ? 'Retouching...' : 'Generate Edit'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-indigo-900/20 rounded-xl p-6 border border-indigo-500/20">
                <h3 className="text-indigo-300 font-medium mb-2 text-sm uppercase">Pro Tip</h3>
                <p className="text-indigo-100/70 text-sm">
                  Be specific about the location. Instead of "remove it", try "remove the wrinkles around the eyes".
                </p>
              </div>
            </div>

            {/* Main Preview Area */}
            <div className="lg:col-span-8 order-1 lg:order-2">
              {status === AppStatus.COMPLETE && generatedImage ? (
                <ComparisonSlider 
                  original={imageFile.preview}
                  modified={generatedImage}
                  onDownload={handleDownload}
                />
              ) : (
                <div className="relative w-full rounded-xl overflow-hidden bg-slate-800 border border-slate-700 aspect-[4/3] md:aspect-[16/9] shadow-2xl group">
                  <img 
                    src={imageFile.preview} 
                    alt="Original" 
                    className={`w-full h-full object-contain transition-opacity duration-500 ${status === AppStatus.PROCESSING ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                  />
                  
                  {status === AppStatus.PROCESSING && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                      <div className="relative w-20 h-20">
                        <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                      </div>
                      <p className="mt-6 text-xl font-medium text-white animate-pulse">
                        Working magic...
                      </p>
                      <p className="text-slate-400 text-sm mt-2">This may take a few seconds</p>
                    </div>
                  )}

                  {/* Overlay Toolbar when just viewing original */}
                  {status === AppStatus.READY_TO_EDIT && (
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium text-white border border-white/10">
                      Original Image
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
