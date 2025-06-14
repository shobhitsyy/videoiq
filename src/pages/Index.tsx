
import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { PlatformSelector } from "@/components/PlatformSelector";
import { StyleSelector } from "@/components/StyleSelector";
import { ContentOutput } from "@/components/ContentOutput";
import { ProcessingStatus } from "@/components/ProcessingStatus";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Video, FileText, Share2 } from "lucide-react";

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState("friendly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  const handleGenerate = async () => {
    if ((!uploadedFile && !uploadedUrl) || selectedPlatforms.length === 0) return;
    
    setIsProcessing(true);
    setCurrentStep(2);
    
    // Simulate processing steps
    setTimeout(() => setCurrentStep(3), 2000); // Transcription
    setTimeout(() => setCurrentStep(4), 4000); // Analysis
    setTimeout(() => {
      // Mock generated content
      const mockContent = {
        blog: "# Transforming Ideas into Action\n\nIn today's fast-paced world, the ability to convert concepts into tangible results is what separates successful individuals from dreamers...",
        twitter: "🧵 Thread: Why most people fail to turn ideas into reality (and how to be different)\n\n1/ We all have brilliant ideas, but execution is where the magic happens...",
        linkedin: "After analyzing hundreds of successful projects, I've discovered the #1 factor that determines whether an idea becomes reality: systematic execution...",
        instagram: "✨ Your ideas are worth nothing until you act on them! 💪\n\nSwipe to see my proven framework for turning ANY idea into reality 👆\n\n#entrepreneur #productivity #success"
      };
      
      const content: Record<string, string> = {};
      selectedPlatforms.forEach(platform => {
        content[platform] = mockContent[platform as keyof typeof mockContent] || "";
      });
      
      setGeneratedContent(content);
      setIsProcessing(false);
      setCurrentStep(5);
    }, 6000);
  };

  const resetProcess = () => {
    setUploadedFile(null);
    setUploadedUrl(null);
    setSelectedPlatforms([]);
    setGeneratedContent({});
    setCurrentStep(1);
    setIsProcessing(false);
  };

  const hasUpload = uploadedFile || uploadedUrl;
  const uploadName = uploadedFile ? uploadedFile.name : uploadedUrl || "content";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">ContentAI</h1>
                <p className="text-sm text-slate-600">Video to Content Converter</p>
              </div>
            </div>
            <Button variant="outline" onClick={resetProcess} className="hidden sm:flex">
              Start Over
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            {[
              { step: 1, icon: Video, label: "Upload" },
              { step: 2, icon: FileText, label: "Process" },
              { step: 3, icon: Sparkles, label: "Generate" },
              { step: 4, icon: Share2, label: "Export" }
            ].map(({ step, icon: Icon, label }) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'bg-slate-200 text-slate-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step ? 'text-blue-600' : 'text-slate-400'
                }`}>
                  {label}
                </span>
                {step < 4 && (
                  <div className={`w-8 h-0.5 mx-4 transition-colors duration-300 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {isProcessing ? (
          <ProcessingStatus currentStep={currentStep} />
        ) : currentStep === 5 ? (
          <ContentOutput content={generatedContent} onEdit={setGeneratedContent} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Input */}
            <div className="space-y-6">
              <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <Video className="w-5 h-5 mr-2 text-blue-600" />
                  Upload Your Content
                </h2>
                <FileUpload 
                  onFileUpload={setUploadedFile} 
                  onUrlUpload={setUploadedUrl}
                  uploadedFile={uploadedFile} 
                  uploadedUrl={uploadedUrl}
                />
              </Card>

              <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <Share2 className="w-5 h-5 mr-2 text-blue-600" />
                  Select Platforms
                </h2>
                <PlatformSelector 
                  selectedPlatforms={selectedPlatforms}
                  onPlatformChange={setSelectedPlatforms}
                />
              </Card>
            </div>

            {/* Right Column - Configuration */}
            <div className="space-y-6">
              <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                  Writing Style
                </h2>
                <StyleSelector selectedStyle={selectedStyle} onStyleChange={setSelectedStyle} />
              </Card>

              <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to Generate?</h3>
                  <p className="text-slate-600 mb-6">
                    Transform your {uploadName} into engaging content for {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}.
                  </p>
                  <Button 
                    onClick={handleGenerate}
                    disabled={!hasUpload || selectedPlatforms.length === 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg shadow-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Content
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
