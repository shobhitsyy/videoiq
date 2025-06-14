
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, FileText, MessageCircle } from "lucide-react";
import { ContentOutput } from "@/components/ContentOutput";
import { SummaryTab } from "@/components/SummaryTab";
import { QnATab } from "@/components/QnATab";

interface ContentTabsProps {
  platformContent: Record<string, string>;
  onContentEdit: (content: Record<string, string>) => void;
  transcript: string;
  metadata?: {
    title?: string;
    duration?: string;
  };
}

export const ContentTabs = ({ platformContent, onContentEdit, transcript, metadata }: ContentTabsProps) => {
  return (
    <Tabs defaultValue="platforms" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="platforms" className="flex items-center space-x-2">
          <Share2 className="w-4 h-4" />
          <span>Platform Content</span>
        </TabsTrigger>
        <TabsTrigger value="summary" className="flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>AI Summary</span>
        </TabsTrigger>
        <TabsTrigger value="qna" className="flex items-center space-x-2">
          <MessageCircle className="w-4 h-4" />
          <span>Q&A Chat</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="platforms">
        <ContentOutput content={platformContent} onEdit={onContentEdit} />
      </TabsContent>

      <TabsContent value="summary">
        <SummaryTab transcript={transcript} metadata={metadata} />
      </TabsContent>

      <TabsContent value="qna">
        <QnATab transcript={transcript} metadata={metadata} />
      </TabsContent>
    </Tabs>
  );
};
