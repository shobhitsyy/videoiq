
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const MobileMenu = () => {
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
        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          <div className="py-2">
            <Link 
              to="/ai-insights" 
              className="block px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              onClick={() => setIsOpen(false)}
            >
              AI Insights
            </Link>
            <Link 
              to="/social-content" 
              className="block px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              onClick={() => setIsOpen(false)}
            >
              Social Content
            </Link>
            <Link 
              to="/about" 
              className="block px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
