
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, FileText, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SummaryTabProps {
  transcript: string;
  metadata?: {
    title?: string;
    duration?: string;
  };
}

export const SummaryTab = ({ transcript, metadata }: SummaryTabProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [preferredProvider, setPreferredProvider] = useState<string>("auto");
  const [usedProvider, setUsedProvider] = useState<string>("");
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    if (!transcript) {
      toast({
        title: "No transcript available",
        description: "Please upload content first to generate a summary.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setSummary("");
    setKeyPoints([]);

    try {
      console.log('Generating summary...');
      const response = await supabase.functions.invoke('summarize-content', {
        body: {
          transcript,
          metadata,
          preferredProvider: preferredProvider === "auto" ? null : preferredProvider
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { summary: generatedSummary, keyPoints: generatedKeyPoints, provider } = response.data;
      
      setSummary(generatedSummary);
      setKeyPoints(generatedKeyPoints);
      setUsedProvider(provider);

      toast({
        title: "Summary Generated!",
        description: `Successfully created summary using ${provider === 'gemini' ? 'Google Gemini' : 'Groq Llama'}`,
      });

    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Summary Generation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            AI Summary
          </h3>
          {metadata?.title && (
            <div className="text-sm text-slate-600 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {metadata.duration || "Unknown duration"}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              AI Provider
            </label>
            <Select value={preferredProvider} onValueChange={setPreferredProvider} disabled={isGenerating}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose AI provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (Gemini → Groq fallback)</SelectItem>
                <SelectItem value="gemini">Google Gemini only</SelectItem>
                <SelectItem value="groq">Groq Llama only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleGenerateSummary}
            disabled={!transcript || isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Summary
              </>
            )}
          </Button>
        </div>
      </Card>

      {(summary || keyPoints.length > 0) && (
        <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
          {usedProvider && (
            <div className="mb-4 text-sm text-slate-600">
              Generated using: <span className="font-medium text-blue-600">
                {usedProvider === 'gemini' ? 'Google Gemini' : 'Groq Llama'}
              </span>
            </div>
          )}
          
          {summary && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-slate-900 mb-3">Summary</h4>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed">{summary}</p>
              </div>
            </div>
          )}

          {keyPoints.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-3">Key Points</h4>
              <ul className="space-y-2">
                {keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-slate-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
