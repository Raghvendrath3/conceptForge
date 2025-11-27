import React, { useState } from 'react';
import { clsx } from 'clsx';

interface FlashcardCardProps {
  question: string;
  answer: string;
  onRate: (quality: number) => void;
}

export const FlashcardCard: React.FC<FlashcardCardProps> = ({ question, answer, onRate }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto perspective-1000">
      <div 
        className={clsx(
          "relative w-full h-96 transition-transform duration-500 transform-style-3d cursor-pointer",
          isFlipped ? "rotate-y-180" : ""
        )}
        onClick={() => !isFlipped && setIsFlipped(true)}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-card border border-border rounded-xl shadow-lg flex items-center justify-center p-8 text-center">
          <div>
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Question</h3>
            <p className="text-2xl font-medium">{question}</p>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-card border border-border rounded-xl shadow-lg flex flex-col items-center justify-center p-8 text-center">
          <div className="flex-1 flex items-center justify-center">
            <div>
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Answer</h3>
              <p className="text-xl">{answer}</p>
            </div>
          </div>
          
          <div className="w-full grid grid-cols-4 gap-4 mt-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => onRate(0)} className="py-2 rounded bg-red-100 text-red-700 hover:bg-red-200 font-medium text-sm">Again</button>
            <button onClick={() => onRate(3)} className="py-2 rounded bg-orange-100 text-orange-700 hover:bg-orange-200 font-medium text-sm">Hard</button>
            <button onClick={() => onRate(4)} className="py-2 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium text-sm">Good</button>
            <button onClick={() => onRate(5)} className="py-2 rounded bg-green-100 text-green-700 hover:bg-green-200 font-medium text-sm">Easy</button>
          </div>
        </div>
      </div>
      
      {!isFlipped && (
        <p className="text-center mt-4 text-muted-foreground text-sm">Click card to reveal answer</p>
      )}
    </div>
  );
};
