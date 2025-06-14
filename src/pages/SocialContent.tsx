
import { useState } from "react";
import { ArrowLeft, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { ContentOutput } from "@/components/ContentOutput";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SocialContent = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [metadata, setMetadata] = useState<{ title?: string; duration?: string } | undefined>();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [platformContent, setPlatformContent] = useState<Record<string, string>>({});

  const handleFileUpload = (file: File | null) => {
    setUploadedFile(file);
    if (file) {
      setTranscript("");
      setMetadata({ title: file.name });
      processContent(file, null);
    }
  };

  const handleUrlUpload = (url: string | null) => {
    setUploadedUrl(url);
    if (url) {
      setTranscript("");
      setMetadata({ title: url });
      processContent(null, url);
    }
  };

  const processContent = async (file: File | null, url: string | null) => {
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
        description: "Your content has been transcribed and is ready for social media content generation.",
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

  const handleContentEdit = (content: Record<string, string>) => {
    setPlatformContent(content);
  };

  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
      {/* Header */}
      <header className="border-b border-slate-200/50 bg-white/70 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-bold text-xl text-slate-900">VideoIQ</span>
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Create <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Social Content</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your content and transform it into engaging social media posts for multiple platforms.
          </p>
        </div>

        {/* Upload Section */}
        <Card className="p-6 mb-8 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-lg">
          <div className="flex items-center mb-4">
            <Share2 className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-semibold text-slate-900">Upload Content</h2>
          </div>
          {isTranscribing ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
              <p className="mt-2 text-sm text-slate-600">Transcribing your content...</p>
            </div>
          ) : (
            <FileUpload
              onFileUpload={handleFileUpload}
              onUrlUpload={handleUrlUpload}
              uploadedFile={uploadedFile}
              uploadedUrl={uploadedUrl}
            />
          )}
        </Card>

        {/* Content Generation */}
        {transcript && (
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-lg">
            <div className="flex items-center mb-6">
              <Share2 className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-slate-900">Social Media Content Generation</h2>
            </div>
            <ContentOutput 
              content={platformContent} 
              onEdit={handleContentEdit}
              transcript={transcript}
              metadata={metadata}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default SocialContent;
