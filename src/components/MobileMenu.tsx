
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMenu}
        className="p-2"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-slate-200/50 shadow-lg z-50">
          <div className="flex flex-col space-y-2 p-4">
            <Link
              to="/ai-insights"
              className="text-slate-700 hover:text-blue-600 py-2 text-sm font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              AI Insights
            </Link>
            <Link
              to="/social-content"
              className="text-slate-700 hover:text-blue-600 py-2 text-sm font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Social Content
            </Link>
            <Link
              to="/about"
              className="text-slate-700 hover:text-blue-600 py-2 text-sm font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About Us
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
