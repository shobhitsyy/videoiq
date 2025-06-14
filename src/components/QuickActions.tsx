
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, MessageCircle, FileText, Zap } from "lucide-react";
import { SummaryTab } from "@/components/SummaryTab";
import { QnATab } from "@/components/QnATab";
import { FileUpload } from "@/components/FileUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuickActionsProps {
  transcript: string;
  metadata?: {
    title?: string;
    duration?: string;
  };
  onReset: () => void;
}

export const QuickActions = ({ transcript, metadata, onReset }: QuickActionsProps) => {
  const [activeAction, setActiveAction] = useState<'summary' | 'qna' | 'upload' | null>(null);
  const [directTranscript, setDirectTranscript] = useState("");
  const [directMetadata, setDirectMetadata] = useState<{title?: string; duration?: string}>({});
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast } = useToast();

  // Use direct transcript if no main transcript, or main transcript if available
  const currentTranscript = transcript || directTranscript;
  const currentMetadata = transcript ? metadata : directMetadata;

  const handleDirectUpload = async (file: File | null, url: string | null) => {
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
      
      setDirectTranscript(generatedTranscript);
      setDirectMetadata(transcriptMetadata || {});
      setActiveAction(null); // Go back to main menu to show AI options

      toast({
        title: "Content Processed!",
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

  if (activeAction === 'upload') {
    return (
      <Card className="p-4 sm:p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
            Upload for AI Analysis
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveAction(null)}
          >
            Back
          </Button>
        </div>
        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-4">
            Upload your audio, video, or paste a YouTube URL to get AI insights directly
          </p>
          {isTranscribing ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <p className="mt-2 text-sm text-slate-600">Processing your content...</p>
            </div>
          ) : (
            <FileUpload 
              onFileUpload={(file) => handleDirectUpload(file, null)}
              onUrlUpload={(url) => handleDirectUpload(null, url)}
              uploadedFile={null}
              uploadedUrl={null}
            />
          )}
        </div>
      </Card>
    );
  }

  if (activeAction === 'summary') {
    return (
      <Card className="p-4 sm:p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            AI Summary
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveAction(null)}
          >
            Back
          </Button>
        </div>
        <SummaryTab transcript={currentTranscript} metadata={currentMetadata} />
      </Card>
    );
  }

  if (activeAction === 'qna') {
    return (
      <Card className="p-4 sm:p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
            AI Q&A Chat
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveAction(null)}
          >
            Back
          </Button>
        </div>
        <QnATab transcript={currentTranscript} metadata={currentMetadata} />
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-blue-600" />
          Quick AI Actions
        </h2>
      </div>
      
      {!currentTranscript ? (
        <div className="text-center">
          <p className="text-sm text-slate-600 mb-4">
            Get instant AI insights from your content without creating social media posts
          </p>
          <Button
            onClick={() => setActiveAction('upload')}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg shadow-lg transition-all duration-200"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Upload Content for AI Analysis
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={() => setActiveAction('summary')}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg shadow-lg transition-all duration-200"
            >
              <FileText className="w-5 h-5 mr-2" />
              Get AI Summary
            </Button>
            
            <Button
              onClick={() => setActiveAction('qna')}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-lg shadow-lg transition-all duration-200"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              AI Q&A Chat
            </Button>
          </div>
          
          <p className="text-sm text-slate-600 mt-3 text-center">
            Access AI features directly - no social media content creation needed
          </p>
          
          {currentTranscript && currentMetadata?.title && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Ready to analyze:</strong> {currentMetadata.title}
              </p>
            </div>
          )}
        </>
      )}
    </Card>
  );
};
