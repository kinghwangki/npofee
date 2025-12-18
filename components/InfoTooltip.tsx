import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  qualifications: string[];
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ qualifications }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block ml-2">
      <button
        type="button"
        className="text-gray-400 hover:text-teal-600 transition-colors"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        <Info size={18} />
      </button>
      {isVisible && (
        <div className="absolute z-10 w-64 p-3 mt-1 text-xs text-left bg-white border border-gray-200 rounded-lg shadow-xl -left-28 sm:left-0 text-gray-700">
          <p className="font-bold mb-2 text-teal-700">자격 기준 예시:</p>
          <ul className="list-disc pl-4 space-y-1">
            {qualifications.map((q, idx) => (
              <li key={idx}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
