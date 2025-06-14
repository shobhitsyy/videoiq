
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Edit3, Twitter, Linkedin, Instagram, FileText, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContentOutputProps {
  content: Record<string, string>;
  onEdit: (content: Record<string, string>) => void;
  transcript?: string;
  metadata?: { title?: string; duration?: string };
}

const platformConfig = {
  blog: { name: "Blog Article", icon: FileText, color: "text-green-600" },
  twitter: { name: "X Thread", icon: Twitter, color: "text-blue-600" },
  linkedin: { name: "LinkedIn Post", icon: Linkedin, color: "text-blue-700" },
  instagram: { name: "Instagram Caption", icon: Instagram, color: "text-pink-600" },
};

export const ContentOutput = ({ content, onEdit, transcript, metadata }: ContentOutputProps) => {
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const { toast } = useToast();

  const platforms = Object.keys(content);
  const hasContent = platforms.length > 0;

  const generateContent = async () => {
    if (!transcript || selectedPlatforms.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select platforms and ensure transcript is available",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await supabase.functions.invoke('generate-social-content', {
        body: {
          transcript,
          platforms: selectedPlatforms,
          metadata
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const generatedContent = response.data.content;
      onEdit(generatedContent);

      toast({
        title: "Content Generated!",
        description: "Your social media content has been generated successfully.",
      });

    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const startEdit = (platform: string) => {
    setEditingPlatform(platform);
    setEditContent(content[platform]);
  };

  const saveEdit = () => {
    if (editingPlatform) {
      onEdit({ ...content, [editingPlatform]: editContent });
      setEditingPlatform(null);
    }
  };

  const cancelEdit = () => {
    setEditingPlatform(null);
    setEditContent("");
  };

  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${platformConfig[platform as keyof typeof platformConfig].name} content copied to clipboard`,
    });
  };

  const downloadContent = () => {
    let downloadText = "Generated Content\n==================\n\n";
    
    Object.entries(content).forEach(([platform, text]) => {
      const config = platformConfig[platform as keyof typeof platformConfig];
      downloadText += `${config.name}\n${'-'.repeat(config.name.length)}\n${text}\n\n`;
    });

    const blob = new Blob([downloadText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-content.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hasContent && transcript) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Generate Social Content</h2>
            <p className="text-slate-600 mb-6">Select the platforms you want to generate content for:</p>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {Object.entries(platformConfig).map(([platform, config]) => {
                const Icon = config.icon;
                const isSelected = selectedPlatforms.includes(platform);
                
                return (
                  <Button
                    key={platform}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => togglePlatform(platform)}
                    className="flex flex-col items-center space-y-2 h-16"
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : config.color}`} />
                    <span className="text-sm">{config.name}</span>
                  </Button>
                );
              })}
            </div>

            <Button 
              onClick={generateContent} 
              disabled={isGenerating || selectedPlatforms.length === 0}
              className="flex items-center space-x-2"
            >
              <Wand2 className="w-4 h-4" />
              <span>{isGenerating ? 'Generating...' : 'Generate Content'}</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Generated Content</h2>
            <p className="text-slate-600">Review and edit your platform-specific content</p>
          </div>
          <Button onClick={downloadContent} variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Download All</span>
          </Button>
        </div>

        <Tabs defaultValue={platforms[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
            {platforms.map((platform) => {
              const config = platformConfig[platform as keyof typeof platformConfig];
              const Icon = config.icon;
              return (
                <TabsTrigger key={platform} value={platform} className="flex items-center space-x-2">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className="hidden sm:inline">{config.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {platforms.map((platform) => {
            const config = platformConfig[platform as keyof typeof platformConfig];
            const isEditing = editingPlatform === platform;

            return (
              <TabsContent key={platform} value={platform}>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                      <config.icon className={`w-5 h-5 ${config.color}`} />
                      <span>{config.name}</span>
                    </h3>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(content[platform], platform)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(platform)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[200px] font-mono text-sm"
                        placeholder="Edit your content..."
                      />
                      <div className="flex space-x-2">
                        <Button onClick={saveEdit} size="sm">Save Changes</Button>
                        <Button onClick={cancelEdit} variant="outline" size="sm">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-lg p-4 border">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                        {content[platform]}
                      </pre>
                    </div>
                  )}
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </Card>
    </div>
  );
};
