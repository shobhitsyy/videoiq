
import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { PlatformSelector } from "@/components/PlatformSelector";
import { StyleSelector } from "@/components/StyleSelector";
import { ContentOutput } from "@/components/ContentOutput";
import { ProcessingStatus } from "@/components/ProcessingStatus";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Video, FileText, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState("friendly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if ((!uploadedFile && !uploadedUrl) || selectedPlatforms.length === 0) return;
    
    setIsProcessing(true);
    setCurrentStep(2);
    
    try {
      // Step 1: Transcribe audio/video
      console.log('Starting transcription...');
      const transcribeResponse = await supabase.functions.invoke('transcribe-audio', {
        body: { 
          audioData: uploadedFile ? await fileToBase64(uploadedFile) : null,
          url: uploadedUrl 
        }
      });

      if (transcribeResponse.error) {
        throw new Error(transcribeResponse.error.message);
      }

      const { transcript } = transcribeResponse.data;
      console.log('Transcription completed');
      
      setCurrentStep(3);
      
      // Step 2: Analyze and generate content with Google Gemini
      console.log('Generating content with Google Gemini...');
      const processResponse = await supabase.functions.invoke('process-video', {
        body: {
          transcript,
          platforms: selectedPlatforms,
          style: selectedStyle
        }
      });

      if (processResponse.error) {
        // Check if it's a quota/limit error
        if (processResponse.error.message?.includes('quota') || 
            processResponse.error.message?.includes('limit')) {
          throw new Error('Google API quota exceeded. Please check your API limits at https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com');
        }
        throw new Error(processResponse.error.message);
      }

      const { content } = processResponse.data;
      console.log('Content generation completed');
      
      setCurrentStep(4);
      
      // Step 3: Finalize content (simulate brief processing)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setGeneratedContent(content);
      setCurrentStep(5);
      setIsProcessing(false);

      toast({
        title: "Content Generated!",
        description: `Successfully created content for ${selectedPlatforms.length} platform${selectedPlatforms.length !== 1 ? 's' : ''}`,
      });

    } catch (error) {
      console.error('Error generating content:', error);
      setIsProcessing(false);
      setCurrentStep(1);
      
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data:type;base64, prefix
      };
      reader.onerror = error => reject(error);
    });
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
                <h1 className="text-xl font-bold text-slate-900">EchoScript</h1>
                <p className="text-sm text-slate-600">AI-Powered Content Generator</p>
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
              { step: 2, icon: FileText, label: "Transcribe" },
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
                    disabled={!hasUpload || selectedPlatforms.length === 0 || isProcessing}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg shadow-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    {isProcessing ? 'Generating...' : 'Generate Content'}
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
