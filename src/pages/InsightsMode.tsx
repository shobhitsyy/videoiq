import { useState, useEffect } from "react";
import { ArrowLeft, Upload, FileText, MessageSquare, Share2, Target } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { SummaryTab } from "@/components/SummaryTab";
import { QnATab } from "@/components/QnATab";
import { ContentTabs } from "@/components/ContentTabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const InsightsMode = () => {
  const [searchParams] = useSearchParams();
  const [purpose, setPurpose] = useState<'insights' | 'content' | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [metadata, setMetadata] = useState<{ title?: string; duration?: string } | undefined>();
  const [platformContent, setPlatformContent] = useState<Record<string, string>>({});

  // Set purpose from URL parameter
  useEffect(() => {
    const purposeParam = searchParams.get('purpose') as 'insights' | 'content' | null;
    if (purposeParam) {
      setPurpose(purposeParam);
    }
  }, [searchParams]);

  const handleFileUpload = (file: File | null) => {
    setUploadedFile(file);
    // Reset transcript when new file is uploaded
    if (file) {
      setTranscript("");
      setMetadata({ title: file.name });
    }
  };

  const handleUrlUpload = (url: string | null) => {
    setUploadedUrl(url);
    // Reset transcript when new URL is uploaded
    if (url) {
      setTranscript("");
      setMetadata({ title: url });
    }
  };

  const handleContentEdit = (content: Record<string, string>) => {
    setPlatformContent(content);
  };

  const handleStartOver = () => {
    setPurpose(null);
    setUploadedFile(null);
    setUploadedUrl(null);
    setTranscript("");
    setMetadata(undefined);
    setPlatformContent({});
  };

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            {purpose === 'insights' ? (
              <>Get <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI Insights</span></>
            ) : purpose === 'content' ? (
              <>Create <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Social Content</span></>
            ) : (
              <>AI-Powered <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Content Analysis</span></>
            )}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {purpose === 'insights' 
              ? "Upload your audio or video content and get instant AI-powered summaries and answers to your questions."
              : purpose === 'content'
              ? "Upload your content and transform it into engaging social media posts for multiple platforms."
              : "Upload your content to get started with AI analysis and content creation."
            }
          </p>
        </div>

        {/* Upload Section */}
        <Card className="p-6 mb-8 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-lg">
          <div className="flex items-center mb-4">
            <Upload className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-slate-900">Upload Content</h2>
          </div>
          <FileUpload
            onFileUpload={handleFileUpload}
            onUrlUpload={handleUrlUpload}
            uploadedFile={uploadedFile}
            uploadedUrl={uploadedUrl}
          />
        </Card>

        {/* Analysis/Content Tabs */}
        {purpose && (
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-lg">
            {purpose === 'insights' ? (
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="summary" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    AI Summary
                  </TabsTrigger>
                  <TabsTrigger value="qna" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Q&A Chat
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="summary" className="mt-6">
                  <SummaryTab transcript={transcript} metadata={metadata} />
                </TabsContent>
                <TabsContent value="qna" className="mt-6">
                  <QnATab transcript={transcript} metadata={metadata} />
                </TabsContent>
              </Tabs>
            ) : (
              <div>
                <div className="flex items-center mb-6">
                  <Share2 className="w-6 h-6 text-purple-600 mr-3" />
                  <h2 className="text-xl font-semibold text-slate-900">Social Media Content Generation</h2>
                </div>
                <ContentTabs 
                  platformContent={platformContent}
                  onContentEdit={handleContentEdit}
                  transcript={transcript} 
                  metadata={metadata} 
                />
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default InsightsMode;
