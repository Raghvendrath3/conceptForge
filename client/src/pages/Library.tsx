import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Book, Plus } from 'lucide-react';
import api from '../api/axios';

export const Library: React.FC = () => {
  const navigate = useNavigate();
  const { data: subjects, isLoading } = useQuery({
    queryKey: ['nodes', 'subject'],
    queryFn: async () => {
      const res = await api.get('/nodes?type=subject');
      return res.data;
    }
  });

  if (isLoading) return <div>Loading library...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Library</h1>
          <p className="text-muted-foreground">Manage your subjects and courses</p>
        </div>
        <button 
          onClick={() => navigate('/node/new?type=subject')}
          className="btn-primary flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
        >
          <Plus size={20} />
          New Subject
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects?.map((subject: any) => (
          <Link 
            key={subject._id} 
            to={`/subject/${subject._id}`}
            className="block group"
          >
            <div className="bg-card border border-border rounded-xl p-6 h-full hover:border-primary transition-colors shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary/10 text-primary rounded-lg">
                  <Book size={24} />
                </div>
                {subject.tags?.length > 0 && (
                  <span className="text-xs bg-secondary px-2 py-1 rounded-full text-secondary-foreground">
                    {subject.tags[0]}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {subject.title}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2">
                {subject.bodyMarkdown || 'No description'}
              </p>
            </div>
          </Link>
        ))}

        {subjects?.length === 0 && (
          <div className="col-span-full text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
            <Book className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No subjects yet</h3>
            <p className="text-sm text-muted-foreground/80 mb-4">Create your first subject to get started</p>
            <button 
              onClick={() => navigate('/node/new?type=subject')}
              className="text-primary hover:underline"
            >
              Create Subject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
