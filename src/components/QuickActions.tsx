
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, MessageCircle, FileText, Zap } from "lucide-react";
import { SummaryTab } from "@/components/SummaryTab";
import { QnATab } from "@/components/QnATab";

interface QuickActionsProps {
  transcript: string;
  metadata?: {
    title?: string;
    duration?: string;
  };
  onReset: () => void;
}

export const QuickActions = ({ transcript, metadata, onReset }: QuickActionsProps) => {
  const [activeAction, setActiveAction] = useState<'summary' | 'qna' | null>(null);

  if (activeAction === 'summary') {
    return (
      <Card className="p-4 sm:p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Quick Summary
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveAction(null)}
          >
            Back
          </Button>
        </div>
        <SummaryTab transcript={transcript} metadata={metadata} />
      </Card>
    );
  }

  if (activeAction === 'qna') {
    return (
      <Card className="p-4 sm:p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
            Quick Q&A
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveAction(null)}
          >
            Back
          </Button>
        </div>
        <QnATab transcript={transcript} metadata={metadata} />
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          onClick={() => setActiveAction('summary')}
          className="flex items-center justify-center p-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg shadow-lg transition-all duration-200"
        >
          <FileText className="w-5 h-5 mr-2" />
          Get Summary
        </Button>
        
        <Button
          onClick={() => setActiveAction('qna')}
          className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-lg shadow-lg transition-all duration-200"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Ask Questions
        </Button>
      </div>
      
      <p className="text-sm text-slate-600 mt-3 text-center">
        Access AI features directly without generating platform content
      </p>
    </Card>
  );
};
