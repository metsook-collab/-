import React, { useState, useRef } from 'react';
import { Upload, Loader2, RefreshCcw } from 'lucide-react';

export default function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('이미지 크기는 5MB 이하로 업로드해주세요.');
        return;
      }
      setImageFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyzeImage = async () => {
    if (!imagePreview) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      // Extract base64 part
      const base64Data = imagePreview.split(',')[1];
      const mimeType = imageFile?.type || 'image/jpeg';

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data, mimeType })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '분석 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '서버 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg flex flex-col items-center text-editorial-ink font-sans">
      <div className="w-full max-w-[1024px] flex-1 flex flex-col border-x border-editorial-line bg-editorial-bg shadow-[0_0_50px_rgba(0,0,0,0.03)] min-h-screen relative">
        <header className="h-[70px] shrink-0 border-b border-editorial-line flex justify-between items-center px-10 sticky top-0 z-10 bg-editorial-bg/95 backdrop-blur">
          <div className="font-serif text-[20px] font-semibold uppercase">
            Personal Color <span className="font-light opacity-60">Consultancy</span>
          </div>
          <div className="text-[11px] tracking-wide uppercase text-editorial-ink/80 flex items-center gap-4">
            <span className="hidden md:inline-block">AI-Powered Analysis</span>
            {analysisResult && (
              <button 
                onClick={clearImage}
                className="px-3 py-1 border border-editorial-ink rounded-full hover:bg-black/5 transition-colors flex items-center gap-2 font-medium"
              >
                <RefreshCcw size={12} />
                <span>새로 분석하기</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 w-full flex flex-col">
        {!imagePreview ? (
          <div className="flex flex-col items-center justify-center flex-1 px-10 py-20 text-center">
            <h2 className="text-[56px] leading-[0.9] font-light font-serif mb-6">
              Discover Your <br /><span className="italic font-medium">True Colors</span>
            </h2>
            <p className="text-[18px] leading-relaxed text-[#555] font-light italic mb-10 max-w-lg">
              Upload a clear photo of your face to instantly reveal your bespoke personal color palette using our AI analyst.
            </p>
            
            <label className="w-full max-w-lg relative group cursor-pointer">
              <input 
                type="file" 
                className="hidden" 
                accept="image/jpeg,image/png,image/webp" 
                onChange={handleImageUpload}
                ref={fileInputRef}
              />
              <div className="w-full h-[240px] border border-editorial-line bg-[#FFF] flex flex-col items-center justify-center gap-4 transition-all hover:bg-black/5">
                <div className="w-12 h-12 flex items-center justify-center">
                  <Upload className="text-editorial-ink/60 group-hover:text-editorial-ink transition-colors" size={24} />
                </div>
                <div className="text-center font-serif">
                  <p className="text-editorial-ink font-semibold text-lg uppercase tracking-wide">Select Photo</p>
                  <p className="text-[#888] text-sm mt-1 font-sans italic">JPEG, PNG, WEBP (Max 5MB)</p>
                </div>
              </div>
            </label>

            <div className="mt-8 text-[11px] tracking-widest uppercase text-[#888]">
              * Use natural daylight, without heavy filters or makeup.
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {!analysisResult ? (
              <div className="flex-1 flex flex-col md:flex-row gap-10 p-10 items-center justify-center">
                <div className="relative w-[280px] h-[360px] md:h-[400px] border border-editorial-line bg-[#FFF] p-2 flex-shrink-0">
                  <img 
                    src={imagePreview} 
                    alt="Uploaded face" 
                    className={`w-full h-full object-cover grayscale-[0.2] transition-all duration-700 ${isAnalyzing ? 'blur-md opacity-50' : 'blur-0 opacity-100'}`} 
                  />
                  
                  {isAnalyzing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Loader2 className="animate-spin text-editorial-ink mb-4" size={24} />
                      <p className="font-serif italic text-sm tracking-widest text-editorial-ink uppercase">Analyzing...</p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-6 w-full max-w-sm">
                  <div className="border border-editorial-line bg-[#FFF] p-6 text-center">
                    <h3 className="font-serif text-2xl font-semibold mb-2">Ready to Decode</h3>
                    <p className="text-sm italic text-[#555] mb-6">Press 'Analyze' to allow our AI to generate your bespoke personal color profile.</p>
                    
                    {!isAnalyzing && (
                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={analyzeImage}
                          className="w-full bg-editorial-ink text-editorial-bg py-3 text-[11px] font-semibold uppercase tracking-[2px] hover:bg-black/80 transition-colors"
                        >
                          Analyze Image
                        </button>
                        <button 
                          onClick={clearImage}
                          className="w-full bg-transparent text-editorial-ink border border-editorial-line py-3 text-[11px] font-semibold uppercase tracking-[2px] hover:bg-black/5 transition-colors"
                        >
                          Change Photo
                        </button>
                      </div>
                    )}
                  </div>
                  {error && (
                    <div className="p-4 border border-[#FF6321] text-[#FF6321] text-xs uppercase tracking-wide text-center">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Hero section */}
                <section className="px-10 py-8 grid md:grid-cols-[1fr_auto] gap-10 border-b border-editorial-line border-t-0 items-center">
                  <div>
                    <div className="inline-block px-3 py-1 border border-editorial-ink rounded-full text-[11px] uppercase tracking-widest mb-4">
                      Diagnosis Result
                    </div>
                    <h1 className="font-serif text-[48px] md:text-[56px] leading-[0.9] mb-4 font-light capitalize">
                      {analysisResult.season_type.replace('톤', '')} <br className="hidden md:block"/>
                      <span className="italic font-medium">{analysisResult.sub_type}</span>
                    </h1>
                    <p className="text-[16px] leading-relaxed text-[#555] italic">
                      "{analysisResult.summary}"
                    </p>
                  </div>
                  <div className="hidden md:flex items-end justify-end gap-3">
                     <div className="w-[140px] h-[180px] bg-white border border-editorial-line p-1 relative overflow-hidden flex-shrink-0">
                       <img src={imagePreview} className="w-full h-full object-cover grayscale-[0.2]" alt="Analyzed" />
                     </div>
                     <div 
                        className="w-[140px] h-[180px] border border-editorial-line flex items-center justify-center text-center p-4"
                        style={{ backgroundColor: analysisResult.recommended_colors[0]?.hex || '#B8ABB7' }}
                     >
                        <span className="text-[11px] uppercase tracking-wider text-white mix-blend-difference font-semibold">
                          Bespoke<br/>Palette
                        </span>
                     </div>
                  </div>
                </section>

                {/* Analysis Grid */}
                <section className="grid grid-cols-2 md:grid-cols-4 bg-[#FFF] border-b border-editorial-line">
                  <div className="border-r border-editorial-line p-6 border-b md:border-b-0">
                    <div className="text-[10px] uppercase tracking-[1px] text-[#888] mb-2">Skin Tone</div>
                    <div className="text-[13px] font-semibold leading-relaxed">{analysisResult.analysis.skin_tone}</div>
                  </div>
                  <div className="border-r border-editorial-line p-6 border-b md:border-b-0">
                    <div className="text-[10px] uppercase tracking-[1px] text-[#888] mb-2">Brightness</div>
                    <div className="text-[13px] font-semibold leading-relaxed">{analysisResult.analysis.brightness}</div>
                  </div>
                  <div className="border-r border-editorial-line p-6">
                    <div className="text-[10px] uppercase tracking-[1px] text-[#888] mb-2">Saturation</div>
                    <div className="text-[13px] font-semibold leading-relaxed">{analysisResult.analysis.saturation}</div>
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] uppercase tracking-[1px] text-[#888] mb-2">Contrast</div>
                    <div className="text-[13px] font-semibold leading-relaxed">{analysisResult.analysis.contrast}</div>
                  </div>
                </section>

                {/* Colors Section */}
                <div className="flex-1 flex flex-col md:flex-row h-full">
                  <div className="flex-1 flex flex-col">
                    <div className="grid md:grid-cols-2 flex-1 border-b border-editorial-line bg-[#FFF]">
                      <div className="p-10 border-r border-editorial-line border-b md:border-b-0">
                        <div className="text-[10px] uppercase tracking-[1px] text-[#888] mb-4">Recommended Palette</div>
                        <div className="grid grid-cols-4 gap-2">
                          {analysisResult.recommended_colors.map((color: any, idx: number) => (
                            <div key={idx} className="group relative">
                              <div 
                                className="h-12 border border-editorial-line w-full transition-transform hover:scale-105"
                                style={{ backgroundColor: color.hex }}
                              />
                              <div className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono whitespace-nowrap bg-white border border-editorial-line px-1 py-0.5 z-10 pointer-events-none">
                                {color.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-10">
                        <div className="text-[10px] uppercase tracking-[1px] text-[#888] mb-4">Avoid Palette</div>
                        <div className="grid grid-cols-4 lg:grid-cols-5 gap-2">
                          {analysisResult.avoid_colors.map((color: any, idx: number) => (
                            <div key={idx} className="group relative opacity-70 hover:opacity-100 transition-opacity">
                              <div 
                                className="h-8 border border-editorial-line w-full"
                                style={{ backgroundColor: color.hex }}
                              />
                              <div className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono whitespace-nowrap bg-white border border-editorial-line px-1 py-0.5 z-10 pointer-events-none">
                                {color.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recommendations Grid */}
                    <section className="grid md:grid-cols-3 bg-editorial-bg flex-1 p-10 gap-10">
                      <div>
                        <h4 className="text-[11px] uppercase tracking-[1px] border-b border-editorial-line pb-2 mb-4 font-semibold">Makeup & Hair</h4>
                        <ul className="text-[13px] leading-[1.6] text-[#444] space-y-2">
                          <li><strong className="text-editorial-ink font-semibold">Lip:</strong> {analysisResult.makeup_recommendations.lip.join(', ')}</li>
                          <li><strong className="text-editorial-ink font-semibold">Blush:</strong> {analysisResult.makeup_recommendations.blush.join(', ')}</li>
                          <li><strong className="text-editorial-ink font-semibold">Eye:</strong> {analysisResult.makeup_recommendations.eyeshadow.join(', ')}</li>
                          <li><strong className="text-editorial-ink font-semibold">Hair:</strong> {analysisResult.hair_recommendations.join(', ')}</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-[11px] uppercase tracking-[1px] border-b border-editorial-line pb-2 mb-4 font-semibold">Fashion Styling</h4>
                        <ul className="text-[13px] leading-[1.6] text-[#444] space-y-2 list-disc list-inside marker:text-editorial-line">
                          {analysisResult.fashion_recommendations.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-[11px] uppercase tracking-[1px] border-b border-editorial-line pb-2 mb-4 font-semibold">Styling Tip</h4>
                        <p className="text-[13px] leading-[1.6] text-[#666] italic">
                          {analysisResult.style_tip}
                        </p>
                      </div>
                    </section>
                  </div>
                </div>
                
                <footer className="p-4 border-t border-editorial-line text-right text-[10px] text-[#999] italic">
                  * {analysisResult.disclaimer} {analysisResult.photo_quality_note}
                </footer>
              </div>
            )}
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
