import { useState } from "react";
import { RotateCcw, Target, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuickActions } from "@/components/QuickActions";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function Index() {
  const [transcript, setTranscript] = useState("");
  const [metadata, setMetadata] = useState<{title?: string; duration?: string}>({});
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File | null, url: string | null) => {
    if (!file && !url) return;
    
    setIsTranscribing(true);
    
    try {
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const base64 = reader.result as string;
            resolve(base64.split(',')[1]);
          };
          reader.onerror = error => reject(error);
        });
      };

      const transcribeResponse = await supabase.functions.invoke('transcribe-audio', {
        body: { 
          audioData: file ? await fileToBase64(file) : null,
          url: url 
        }
      });

      if (transcribeResponse.error) {
        throw new Error(transcribeResponse.error.message);
      }

      const { transcript: generatedTranscript, metadata: transcriptMetadata } = transcribeResponse.data;
      
      setTranscript(generatedTranscript);
      setMetadata(transcriptMetadata || {});

      toast({
        title: "Content Transcribed!",
        description: "Your content has been transcribed and is ready for AI analysis.",
      });

    } catch (error) {
      console.error('Error transcribing:', error);
      toast({
        title: "Transcription Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleStartOver = () => {
    setTranscript("");
    setMetadata({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="border-b border-slate-200/50 bg-white/70 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-slate-900">EchoScript</h1>
                <p className="text-xs text-slate-600">AI-Powered Media Intelligence Hub</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/about" 
                className="text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
              >
                About Us
              </Link>
              <Button
                onClick={handleStartOver}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Start Over
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Purpose Selection Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              What would you like to do today?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Choose your purpose to get the most relevant AI-powered tools for your content.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
            <Link to="/ai-insights">
              <Card className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300 h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Get AI Insights</h3>
                  <p className="text-slate-600">
                    Analyze your content to get summaries, key points, and ask questions to understand your material better.
                  </p>
                </div>
              </Card>
            </Link>

            <Link to="/social-content">
              <Card className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-purple-300 h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Share2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Create Social Content</h3>
                  <p className="text-slate-600">
                    Transform your content into engaging social media posts for Twitter, LinkedIn, Instagram, and blog articles.
                  </p>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: File Upload and Transcription Display */}
          <div className="flex flex-col">
            <Card className="mb-6 p-4 sm:p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Upload Media for Transcription
              </h2>
              {isTranscribing ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                  <p className="mt-2 text-sm text-slate-600">Transcribing your content...</p>
                </div>
              ) : (
                <FileUpload 
                  onFileUpload={(file) => handleFileUpload(file, null)}
                  onUrlUpload={(url) => handleFileUpload(null, url)}
                  uploadedFile={null}
                  uploadedUrl={null}
                />
              )}
            </Card>

            {transcript ? (
              <Card className="p-4 sm:p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl flex-grow">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Transcription
                </h2>
                {metadata?.title && (
                  <div className="mb-2">
                    <span className="font-semibold text-slate-700">Title:</span>{" "}
                    <span className="text-slate-600">{metadata.title}</span>
                  </div>
                )}
                {metadata?.duration && (
                  <div className="mb-2">
                    <span className="font-semibold text-slate-700">Duration:</span>{" "}
                    <span className="text-slate-600">{metadata.duration}</span>
                  </div>
                )}
                
              </Card>
            ) : null}
          </div>

          {/* Right Column: Quick Actions */}
          <div>
            <QuickActions transcript={transcript} metadata={metadata} onReset={handleStartOver} />
          </div>
        </div>
      </main>
    </div>
  );
}
