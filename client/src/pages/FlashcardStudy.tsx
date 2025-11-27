import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import type { Flashcard } from '../types';
import { FlashcardCard } from '../components/Flashcard/FlashcardCard';
import { CheckCircle } from 'lucide-react';

export const FlashcardStudy: React.FC = () => {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: flashcards, isLoading } = useQuery<Flashcard[]>({
    queryKey: ['flashcards', 'due'],
    queryFn: async () => {
      const res = await api.get('/flashcards/due');
      return res.data;
    },
  });

  const rateMutation = useMutation({
    mutationFn: async ({ id, quality }: { id: string, quality: number }) => {
      return api.put(`/flashcards/${id}/progress`, { quality });
    },
    onSuccess: () => {
      setCurrentIndex(prev => prev + 1);
      queryClient.invalidateQueries({ queryKey: ['flashcards', 'due'] });
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['flashcards', 'stats'],
    queryFn: async () => {
      const res = await api.get('/flashcards/stats');
      return res.data;
    }
  });

  if (isLoading) return <div>Loading deck...</div>;

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <div className="p-6 bg-primary/10 rounded-full text-primary mb-4">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-2xl font-bold mb-2">All caught up!</h2>
        <p className="text-muted-foreground">You have no flashcards due for review right now.</p>
        {stats && (
          <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
            <span className="bg-secondary px-2 py-1 rounded">Total Deck: {stats.total}</span>
            <span className="bg-secondary px-2 py-1 rounded">Due Now: {stats.due}</span>
          </div>
        )}
      </div>
    );
  }

  if (currentIndex >= flashcards.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
        <p className="text-muted-foreground">Great job. Come back later for more reviews.</p>
        <button 
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['flashcards', 'due'] });
            setCurrentIndex(0);
          }} 
          className="mt-4 text-primary hover:underline"
        >
          Refresh Deck
        </button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="h-full flex flex-col py-8">
      <div className="mb-8 text-center space-y-2">
        <h2 className="text-xl font-semibold">Study Session</h2>
        <p className="text-sm text-muted-foreground">Card {currentIndex + 1} of {flashcards.length}</p>
        {stats && (
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <span className="bg-secondary px-2 py-1 rounded">Total Deck: {stats.total}</span>
            <span className="bg-secondary px-2 py-1 rounded">Due Now: {stats.due}</span>
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <FlashcardCard
          key={currentCard._id}
          question={currentCard.question}
          answer={currentCard.answer}
          onRate={(quality) => rateMutation.mutate({ id: currentCard._id, quality })}
        />
      </div>
    </div>
  );
};
