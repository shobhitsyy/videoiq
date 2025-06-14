
import { Twitter, Linkedin, Instagram, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onPlatformChange: (platforms: string[]) => void;
}

const platforms = [
  { id: "blog", name: "Blog Article", icon: FileText, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  { id: "twitter", name: "X (Twitter)", icon: Twitter, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-200" },
];

export const PlatformSelector = ({ selectedPlatforms, onPlatformChange }: PlatformSelectorProps) => {
  const togglePlatform = (platformId: string) => {
    if (selectedPlatforms.includes(platformId)) {
      onPlatformChange(selectedPlatforms.filter(p => p !== platformId));
    } else {
      onPlatformChange([...selectedPlatforms, platformId]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {platforms.map((platform) => {
        const Icon = platform.icon;
        const isSelected = selectedPlatforms.includes(platform.id);
        
        return (
          <Card
            key={platform.id}
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              isSelected
                ? `${platform.bg} ${platform.border} border-2 shadow-sm`
                : "bg-white border border-slate-200 hover:border-slate-300"
            }`}
            onClick={() => togglePlatform(platform.id)}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isSelected ? platform.bg : "bg-slate-100"
              }`}>
                <Icon className={`w-4 h-4 ${isSelected ? platform.color : "text-slate-500"}`} />
              </div>
              <span className={`font-medium ${
                isSelected ? "text-slate-900" : "text-slate-600"
              }`}>
                {platform.name}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
