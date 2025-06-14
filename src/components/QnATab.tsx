
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Send, Loader2, Bot, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QnATabProps {
  transcript: string;
  metadata?: {
    title?: string;
  };
}

interface QnAItem {
  question: string;
  answer: string;
  provider: string;
  timestamp: Date;
}

export const QnATab = ({ transcript, metadata }: QnATabProps) => {
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [qnaHistory, setQnaHistory] = useState<QnAItem[]>([]);
  const [preferredProvider, setPreferredProvider] = useState<string>("auto");
  const { toast } = useToast();

  const handleAskQuestion = async () => {
    if (!transcript) {
      toast({
        title: "No transcript available",
        description: "Please upload content first to ask questions.",
        variant: "destructive",
      });
      return;
    }

    if (!question.trim()) {
      toast({
        title: "Empty question",
        description: "Please enter a question to ask.",
        variant: "destructive",
      });
      return;
    }

    setIsAsking(true);

    try {
      console.log('Asking question...');
      const response = await supabase.functions.invoke('qna-chatbot', {
        body: {
          transcript,
          question: question.trim(),
          preferredProvider: preferredProvider === "auto" ? null : preferredProvider
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { answer, provider } = response.data;
      
      const newQnAItem: QnAItem = {
        question: question.trim(),
        answer,
        provider,
        timestamp: new Date()
      };

      setQnaHistory(prev => [newQnAItem, ...prev]);
      setQuestion("");

      toast({
        title: "Question Answered!",
        description: `Answer generated using ${provider === 'gemini' ? 'Google Gemini' : 'Groq Llama'}`,
      });

    } catch (error) {
      console.error('Error asking question:', error);
      toast({
        title: "Question Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAsking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
        <div className="flex items-center mb-4">
          <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Ask Questions</h3>
        </div>

        {metadata?.title && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Asking about:</strong> {metadata.title}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              AI Provider
            </label>
            <Select value={preferredProvider} onValueChange={setPreferredProvider} disabled={isAsking}>
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

          <div className="flex space-x-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about the content..."
              onKeyPress={handleKeyPress}
              disabled={isAsking}
              className="flex-1"
            />
            <Button 
              onClick={handleAskQuestion}
              disabled={!transcript || !question.trim() || isAsking}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              {isAsking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>

      {qnaHistory.length > 0 && (
        <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">Q&A History</h4>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {qnaHistory.map((item, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 font-medium">{item.question}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-700 leading-relaxed">{item.answer}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Answered by {item.provider === 'gemini' ? 'Google Gemini' : 'Groq Llama'}
                    </p>
                  </div>
                </div>
                
                {index < qnaHistory.length - 1 && (
                  <hr className="border-slate-200" />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
