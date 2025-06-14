
import { RotateCcw, Target, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ReviewSection } from "@/components/ReviewSection";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="border-b border-slate-200/50 bg-white/70 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-slate-900">VideoIQ</h1>
                <p className="text-xs text-slate-600">AI powered Youtube Intelligence Hub</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/about" 
                className="text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
              >
                About Us
              </Link>
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

        {/* Additional Information Section */}
        <div className="text-center mb-12">
          <Card className="p-8 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Transform Your Media with AI
            </h3>
            <p className="text-lg text-slate-600 mb-6">
              VideoIQ makes it easy to extract valuable insights from your audio and video content. 
              Upload your media files and let our AI do the heavy lifting.
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">📹 Supported Formats</h4>
                <p className="text-slate-600 text-sm">MP4, MOV, MP3, WAV and other popular formats</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">🚀 Fast Processing</h4>
                <p className="text-slate-600 text-sm">Get transcripts and insights in minutes, not hours</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">🧠 AI-Powered</h4>
                <p className="text-slate-600 text-sm">Advanced AI for accurate transcription and analysis</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">📱 Multi-Platform</h4>
                <p className="text-slate-600 text-sm">Generate content for all major social platforms</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Reviews Section */}
        <div className="max-w-3xl mx-auto">
          <ReviewSection />
        </div>
      </main>
    </div>
  );
}
