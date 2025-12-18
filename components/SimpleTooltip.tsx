import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface SimpleTooltipProps {
  content: string;
}

const SimpleTooltip: React.FC<SimpleTooltipProps> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-1.5">
      <button
        type="button"
        className="text-slate-400 hover:text-teal-600 transition-colors"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        aria-label="도움말 보기"
      >
        <HelpCircle size={14} />
      </button>
      
      <div 
        className={`
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] p-2.5 
          bg-slate-800 text-white text-xs rounded-lg shadow-xl z-50 leading-relaxed text-center font-normal
          transition-all duration-200 transform origin-bottom
          ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1 pointer-events-none'}
        `}
      >
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
      </div>
    </div>
  );
};

export default SimpleTooltip;