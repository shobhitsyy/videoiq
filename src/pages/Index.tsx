import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QuickActions } from "@/components/QuickActions";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function Index() {
  const [transcript, setTranscript] = useState("");
  const [metadata, setMetadata] = useState<{title?: string; duration?: string}>({});
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
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

  const WelcomePopup = ({ onClose }: { onClose: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="max-w-md p-6 bg-white rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Welcome to EchoScript!</h2>
          <p className="text-sm text-slate-700 mb-6">
            EchoScript helps you transcribe audio and video content, then provides AI-powered
            insights and content repurposing tools.
          </p>
          <Button onClick={onClose} className="w-full">
            Get Started
          </Button>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {showWelcomePopup && (
        <WelcomePopup onClose={() => setShowWelcomePopup(false)} />
      )}

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
                <Textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full h-48 resize-none bg-slate-50 border-slate-200 text-slate-800 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
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
