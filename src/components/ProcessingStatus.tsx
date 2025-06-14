
import { Loader2, FileText, Sparkles, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProcessingStatusProps {
  currentStep: number;
}

const steps = [
  { id: 2, icon: FileText, title: "Transcribing Audio", description: "Converting speech to text..." },
  { id: 3, icon: Sparkles, title: "Analyzing with Claude AI", description: "Understanding content and generating platform-specific posts..." },
  { id: 4, icon: Share2, title: "Finalizing Content", description: "Polishing and formatting for each platform..." },
];

export const ProcessingStatus = ({ currentStep }: ProcessingStatusProps) => {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">AI Processing Your Content</h2>
          <p className="text-slate-600">Claude AI is analyzing your content and creating unique posts for each platform</p>
        </div>

        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div
                key={step.id}
                className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-blue-50 border border-blue-200"
                    : isCompleted
                    ? "bg-green-50 border border-green-200"
                    : "bg-slate-50 border border-slate-200"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : isCompleted
                    ? "bg-green-600 text-white"
                    : "bg-slate-300 text-slate-500"
                }`}>
                  {isActive ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    isActive ? "text-blue-900" : isCompleted ? "text-green-900" : "text-slate-700"
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm ${
                    isActive ? "text-blue-700" : isCompleted ? "text-green-700" : "text-slate-500"
                  }`}>
                    {step.description}
                  </p>
                </div>
                {isCompleted && (
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
