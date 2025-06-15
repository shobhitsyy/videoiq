import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Rocket, Sparkles, ShieldCheck, BarChartBig, MessageSquare, Code, LayoutDashboard } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import MobileMenu from "@/components/MobileMenu";

const Index = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast({
        title: "Success",
        description: "Video URL submitted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit video URL.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b border-slate-200/50 bg-white/70 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-bold text-xl text-slate-900">VideoIQ</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/ai-insights" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                AI Insights
              </Link>
              <Link to="/social-content" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Social Content
              </Link>
              <Link to="/about" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                About Us
              </Link>
            </nav>
            
            {/* Mobile Navigation */}
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
            Unlock the Power of Your Video Content with <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">VideoIQ</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Transform your audio and video content into actionable insights and engaging social media posts with our AI-powered platform.
          </p>
        </div>

        {/* Video URL Submission Form */}
        <Card className="p-6 mb-12 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-lg">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="videoUrl" className="text-lg font-semibold text-slate-900">
                Enter Video URL
              </label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://www.example.com/video.mp4"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
              {isLoading ? "Analyzing..." : "Analyze Video"}
            </Button>
          </form>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <Sparkles className="w-6 h-6 text-yellow-500 mr-3" />
              <h3 className="text-xl font-semibold text-slate-900">AI-Powered Insights</h3>
            </div>
            <p className="text-slate-600">
              Instantly extract key insights, summaries, and important topics from your video content using advanced AI algorithms.
            </p>
          </Card>

          <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <MessageSquare className="w-6 h-6 text-green-500 mr-3" />
              <h3 className="text-xl font-semibold text-slate-900">Social Media Content Generation</h3>
            </div>
            <p className="text-slate-600">
              Automatically generate engaging social media posts, captions, and hashtags tailored to your video content.
            </p>
          </Card>

          <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <ShieldCheck className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-xl font-semibold text-slate-900">Content Repurposing</h3>
            </div>
            <p className="text-slate-600">
              Repurpose your video content into blog posts, articles, and other formats to maximize its reach and impact.
            </p>
          </Card>

          <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <BarChartBig className="w-6 h-6 text-purple-500 mr-3" />
              <h3 className="text-xl font-semibold text-slate-900">Performance Analytics</h3>
            </div>
            <p className="text-slate-600">
              Track the performance of your video content and social media posts with detailed analytics and reporting.
            </p>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Ready to Transform Your Video Content?</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Get started with VideoIQ today and unlock the full potential of your video content.
          </p>
          <Link to="/ai-insights">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg shadow-lg transition-all duration-200">
              Explore AI Insights
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Index;
