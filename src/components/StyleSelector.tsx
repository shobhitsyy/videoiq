
import { Card } from "@/components/ui/card";

interface StyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
}

const styles = [
  { id: "professional", name: "Professional", description: "Formal, business-focused tone" },
  { id: "friendly", name: "Friendly", description: "Warm, conversational style" },
  { id: "witty", name: "Witty", description: "Humorous and engaging" },
  { id: "technical", name: "Technical", description: "Detailed, expert-level content" },
];

export const StyleSelector = ({ selectedStyle, onStyleChange }: StyleSelectorProps) => {
  return (
    <div className="space-y-2">
      {styles.map((style) => (
        <Card
          key={style.id}
          className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-sm ${
            selectedStyle === style.id
              ? "bg-blue-50 border-blue-200 border-2"
              : "bg-white border border-slate-200 hover:border-slate-300"
          }`}
          onClick={() => onStyleChange(style.id)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${
                selectedStyle === style.id ? "text-blue-900" : "text-slate-900"
              }`}>
                {style.name}
              </h4>
              <p className={`text-sm ${
                selectedStyle === style.id ? "text-blue-700" : "text-slate-500"
              }`}>
                {style.description}
              </p>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 transition-colors duration-200 ${
              selectedStyle === style.id
                ? "bg-blue-600 border-blue-600"
                : "border-slate-300"
            }`}>
              {selectedStyle === style.id && (
                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
