import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Plus, Lightbulb } from 'lucide-react';
import api from '../api/axios';

export const ChapterView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: chapter, isLoading: isLoadingChapter } = useQuery({
    queryKey: ['node', id],
    queryFn: async () => {
      const res = await api.get(`/nodes/${id}`);
      return res.data;
    }
  });

  // Fetch parent subject to link back
  const { data: parentEdges } = useQuery({
    queryKey: ['edges', 'parent', id],
    queryFn: async () => {
      const res = await api.get(`/edges?from=${id}&label=part-of`);
      return res.data;
    },
    enabled: !!chapter
  });

  const parentId = parentEdges?.[0]?.to;

  const { data: concepts, isLoading: isLoadingConcepts } = useQuery({
    queryKey: ['node', id, 'children'],
    queryFn: async () => {
      const res = await api.get(`/nodes/${id}/children?type=concept`);
      return res.data;
    }
  });

  if (isLoadingChapter || isLoadingConcepts) return <div>Loading chapter...</div>;
  if (!chapter) return <div>Chapter not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <Link to="/library" className="hover:text-primary">Library</Link>
          <span>/</span>
          {parentId ? (
            <Link to={`/subject/${parentId}`} className="hover:text-primary">Subject</Link>
          ) : (
            <span>Subject</span>
          )}
          <span>/</span>
          <span className="text-foreground font-medium">{chapter.title}</span>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{chapter.title}</h1>
              <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-medium uppercase tracking-wider">
                Chapter
              </span>
            </div>
            <p className="text-muted-foreground max-w-2xl">{chapter.bodyMarkdown}</p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => navigate(`/node/${id}`)}
              className="btn-secondary px-3 py-2 rounded text-sm"
            >
              Edit Chapter
            </button>
            <button 
              onClick={() => navigate(`/node/new?type=concept&parentId=${id}`)}
              className="btn-primary flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              <Plus size={18} />
              New Concept
            </button>
          </div>
        </div>
      </div>

      {/* Concepts List */}
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Lightbulb size={20} />
          Concepts
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {concepts?.map((concept: any) => (
            <Link 
              key={concept._id} 
              to={`/node/${concept._id}`}
              className="block group"
            >
              <div className="bg-card border border-border rounded-lg p-4 h-full hover:border-primary transition-colors shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{concept.title}</h3>
                  <FileText size={16} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {concept.bodyMarkdown || 'No description'}
                </p>
                {concept.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {concept.tags.map((tag: string) => (
                      <span key={tag} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}

          {concepts?.length === 0 && (
            <div className="col-span-full text-center py-12 border-2 border-dashed border-border rounded-xl">
              <p className="text-muted-foreground mb-4">No concepts yet</p>
              <button 
                onClick={() => navigate(`/node/new?type=concept&parentId=${id}`)}
                className="text-primary hover:underline"
              >
                Create First Concept
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
