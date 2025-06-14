
import { ArrowLeft, Users, Target, Zap, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b border-slate-200/50 bg-white/70 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="font-bold text-xl text-slate-900">EchoScript</span>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
            About <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">EchoScript</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Transforming the way content creators and businesses extract insights and generate 
            engaging social media content from their audio and video materials.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="p-8 mb-12 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
          <div className="flex items-center mb-6">
            <Target className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-slate-900">Our Mission</h2>
          </div>
          <p className="text-lg text-slate-700 leading-relaxed">
            At EchoScript, we believe that every piece of content holds valuable insights waiting to be discovered. 
            Our AI-powered platform empowers creators, marketers, and businesses to unlock the full potential of their 
            audio and video content by providing instant transcription, intelligent analysis, and automated content generation 
            for social media platforms.
          </p>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <Zap className="w-6 h-6 text-yellow-500 mr-3" />
              <h3 className="text-xl font-semibold text-slate-900">Instant AI Insights</h3>
            </div>
            <p className="text-slate-600">
              Get immediate summaries, key takeaways, and answers to your questions from any audio or video content. 
              Our advanced AI understands context and provides meaningful insights in seconds.
            </p>
          </Card>

          <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-green-500 mr-3" />
              <h3 className="text-xl font-semibold text-slate-900">Social Media Content</h3>
            </div>
            <p className="text-slate-600">
              Transform your long-form content into engaging social media posts across multiple platforms. 
              Choose from various writing styles to match your brand voice and audience preferences.
            </p>
          </Card>
        </div>

        {/* Values Section */}
        <Card className="p-8 mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-slate-200/50 shadow-xl">
          <div className="flex items-center mb-6">
            <Heart className="w-8 h-8 text-red-500 mr-3" />
            <h2 className="text-3xl font-bold text-slate-900">What We Value</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-semibold text-lg text-slate-900 mb-2">Innovation</h4>
              <p className="text-slate-600">
                Pushing the boundaries of AI technology to solve real-world content challenges.
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-lg text-slate-900 mb-2">Simplicity</h4>
              <p className="text-slate-600">
                Making powerful AI tools accessible and easy to use for everyone.
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-lg text-slate-900 mb-2">Quality</h4>
              <p className="text-slate-600">
                Delivering accurate, reliable, and high-quality content analysis and generation.
              </p>
            </div>
          </div>
        </Card>

        {/* Team Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Built for Creators, by Creators</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Our team consists of content creators, AI researchers, and technology enthusiasts who understand 
            the challenges of content production and the power of artificial intelligence to solve them.
          </p>
          <Link to="/">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg shadow-lg transition-all duration-200">
              Get Started with EchoScript
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
