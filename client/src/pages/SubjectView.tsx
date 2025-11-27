import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, Plus } from 'lucide-react';
import api from '../api/axios';

export const SubjectView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: subject, isLoading: isLoadingSubject } = useQuery({
    queryKey: ['node', id],
    queryFn: async () => {
      const res = await api.get(`/nodes/${id}`);
      return res.data;
    }
  });

  const { data: chapters, isLoading: isLoadingChapters } = useQuery({
    queryKey: ['node', id, 'children'],
    queryFn: async () => {
      const res = await api.get(`/nodes/${id}/children?type=chapter`);
      return res.data;
    }
  });

  if (isLoadingSubject || isLoadingChapters) return <div>Loading subject...</div>;
  if (!subject) return <div>Subject not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <Link to="/library" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-4">
          <ArrowLeft size={16} /> Back to Library
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{subject.title}</h1>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium uppercase tracking-wider">
                Subject
              </span>
            </div>
            <p className="text-muted-foreground max-w-2xl">{subject.bodyMarkdown}</p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => navigate(`/node/${id}`)}
              className="btn-secondary px-3 py-2 rounded text-sm"
            >
              Edit Subject
            </button>
            <button 
              onClick={() => navigate(`/node/new?type=chapter&parentId=${id}`)}
              className="btn-primary flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              <Plus size={18} />
              New Chapter
            </button>
          </div>
        </div>
      </div>

      {/* Chapters List */}
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen size={20} />
          Chapters
        </h2>
        
        <div className="space-y-4">
          {chapters?.map((chapter: any, index: number) => (
            <Link 
              key={chapter._id} 
              to={`/chapter/${chapter._id}`}
              className="block group"
            >
              <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 hover:border-primary transition-colors">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{chapter.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{chapter.bodyMarkdown || 'No description'}</p>
                </div>
                <div className="text-muted-foreground group-hover:text-primary">
                  <ArrowLeft size={20} className="rotate-180" />
                </div>
              </div>
            </Link>
          ))}

          {chapters?.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
              <p className="text-muted-foreground mb-4">No chapters yet</p>
              <button 
                onClick={() => navigate(`/node/new?type=chapter&parentId=${id}`)}
                className="text-primary hover:underline"
              >
                Create First Chapter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
