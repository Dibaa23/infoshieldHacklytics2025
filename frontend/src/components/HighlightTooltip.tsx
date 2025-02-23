
import React, { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";
import { Info } from 'lucide-react';

export const HighlightTooltip = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelectedText(selection.toString());
        
        requestAnimationFrame(() => {
          if (tooltipRef.current) {
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            let x = rect.left + (rect.width / 2);
            let y = rect.top;
            
            // Ensure the tooltip doesn't go off-screen horizontally
            if (x - (tooltipRect.width / 2) < 0) {
              x = tooltipRect.width / 2;
            } else if (x + (tooltipRect.width / 2) > viewportWidth) {
              x = viewportWidth - (tooltipRect.width / 2);
            }
            
            const spaceAbove = rect.top;
            const spaceBelow = viewportHeight - rect.bottom;
            
            // Position the tooltip with more spacing from the text
            const minSpacing = 30; // Increased spacing from text
            
            if (spaceAbove > spaceBelow) {
              // Position above the text with increased spacing
              y = rect.top - minSpacing;
            } else {
              // Position below the text with increased spacing
              y = rect.bottom + minSpacing;
            }
            
            setPosition({ x, y });
          }
        });
        
        setIsVisible(true);
        setShowTooltip(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
        setShowTooltip(false);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const truncateText = (text: string, wordCount = 6) => {
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  if (!isVisible && !showTooltip) return null;

  return (
    <div
      ref={tooltipRef}
      className={cn(
        "fixed z-50",
        "animate-in fade-in zoom-in duration-200",
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {!showTooltip ? (
        <button
          onClick={() => setShowTooltip(true)}
          className="bg-red-700 rounded-full p-2 text-white hover:bg-red-800 transition-colors shadow-lg -translate-x-1/2"
        >
          <Info size={20} />
        </button>
      ) : (
        <div className={cn(
          "bg-white rounded-lg shadow-lg p-1.5",
          "border border-gray-200 w-[280px]",
          "-translate-x-1/2"
        )}>
          <div className="flex flex-col gap-1">
            <div className="bg-red-700 text-white p-1.5 -mx-1.5 -mt-1.5 rounded-t-lg">
              <p className="font-medium text-xs">{truncateText(selectedText)}</p>
            </div>

            <div className="flex items-start gap-1.5">
              <div className="flex-1 min-w-0 space-y-1.5">
                <div>
                  <p className="text-sm font-bold text-red-700">
                    False
                  </p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-3">
                    No evidence of widespread voter fraud<br />
                    has been found in multiple<br />
                    investigations.
                  </p>
                </div>

                <div>
                  <button 
                    className="bg-red-700 text-white py-1 px-2 rounded text-[10px] hover:bg-red-800 transition-colors"
                    onClick={() => setShowTooltip(false)}
                  >
                    Sources
                  </button>
                </div>
              </div>

              <div className="text-right bg-red-50 rounded-lg p-1.5">
                <p className="text-[10px] uppercase tracking-wide text-red-700 font-semibold mb-0.5">Credibility</p>
                <p className="text-5xl font-bold leading-none text-red-700">70</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
