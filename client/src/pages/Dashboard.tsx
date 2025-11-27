import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import type { Node, Flashcard } from '../types';
import { Clock, Brain, Network } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data: nodes } = useQuery<Node[]>({
    queryKey: ['nodes'],
    queryFn: async () => {
      const res = await api.get('/nodes');
      return res.data;
    },
  });

  const recentNodes = nodes?.slice(0, 5);

  const { data: dueFlashcards } = useQuery<Flashcard[]>({
    queryKey: ['flashcards', 'due'],
    queryFn: async () => {
      const res = await api.get('/flashcards/due');
      return res.data;
    },
  });

  return (
    <div className="space-y-8">
      {/* Welcome / Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Brain size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due for Study</p>
              <h3 className="text-2xl font-bold">{dueFlashcards?.length || 0} Cards</h3>
            </div>
          </div>
          {dueFlashcards && dueFlashcards.length > 0 && (
            <Link to="/study" className="mt-4 block text-sm text-primary hover:underline">
              Start Session &rarr;
            </Link>
          )}
        </div>

        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent rounded-full text-foreground">
              <Network size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Concepts</p>
              <h3 className="text-2xl font-bold">{nodes?.length || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} />
          Recent Activity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentNodes?.map((node) => (
            <Link 
              key={node._id} 
              to={`/node/${node._id}`}
              className="block p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium truncate">{node.title}</h3>
                <span className="text-xs px-2 py-1 bg-accent rounded-full">{node.type}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {node.bodyMarkdown || 'No content'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {node.tags.map(tag => (
                  <span key={tag} className="text-xs text-muted-foreground">#{tag}</span>
                ))}
              </div>
            </Link>
          ))}
          {(!recentNodes || recentNodes.length === 0) && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No recent activity. Create a new node to get started!
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
