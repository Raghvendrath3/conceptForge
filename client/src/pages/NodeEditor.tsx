import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Save } from 'lucide-react';
import api from '../api/axios';
import { SnippetRunner } from '../components/Snippet/SnippetRunner';
import 'katex/dist/katex.min.css';

export const NodeEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // Local state for form
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState(searchParams.get('type') || 'concept');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const { data: node, isLoading } = useQuery({
    queryKey: ['node', id],
    queryFn: async () => {
      if (id === 'new') return null;
      const res = await api.get(`/nodes/${id}`);
      return res.data;
    },
    enabled: id !== 'new'
  });

  const { data: allNodes } = useQuery({
    queryKey: ['nodes'],
    queryFn: async () => {
      const res = await api.get('/nodes');
      return res.data;
    }
  });

  useEffect(() => {
    if (node) {
      setTitle(node.title);
      setBody(node.bodyMarkdown);
      setType(node.type);
      setTags(node.tags || []);
    }
  }, [node]);

  const [parentId] = useState(searchParams.get('parentId') || '');

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (id === 'new') {
        const res = await api.post('/nodes', data);
        // If parent selected, create edge
        if (parentId) {
          await api.post('/edges', {
            // HierarchySidebar logic: e.to === child._id && e.label === 'part-of'
            // So 'to' is the Child. 'from' is the Parent.
            // Wait, let's check HierarchySidebar again.
            // "const chapters = edges.filter((e: any) => e.to === subject._id && e.label === 'part-of')"
            // This means 'to' is the Subject (Parent). So 'from' is the Chapter (Child).
            // So: Edge(from: Child, to: Parent).
            from: res.data._id,
            to: parentId,
            label: 'part-of'
          });
        }
        return res;
      } else {
        return api.put(`/nodes/${id}`, data);
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] });
      queryClient.invalidateQueries({ queryKey: ['graph'] }); // Invalidate graph for edges
      if (id === 'new') {
        navigate(`/node/${res.data._id}`);
      }
      setIsEditing(false);
    }
  });

  const handleSave = () => {
    saveMutation.mutate({ title, bodyMarkdown: body, type, tags });
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const suggestTagsMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/nodes/tags/suggest', { content: body });
      return res.data.tags;
    },
    onSuccess: (suggestedTags) => {
      const uniqueTags = [...new Set([...tags, ...suggestedTags])];
      setTags(uniqueTags);
    }
  });

  // Flashcard state
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [showFlashcardForm, setShowFlashcardForm] = useState(false);

  const createFlashcardMutation = useMutation({
    mutationFn: async (variables: any) => {
      return api.post('/flashcards/generate', {
        nodeId: id,
        question: variables?.question || question,
        answer: variables?.answer || answer,
        useAI: variables?.useAI,
        content: variables?.content
      });
    },
    onSuccess: () => {
      setQuestion('');
      setAnswer('');
      setShowFlashcardForm(false);
      alert('Flashcard created!');
    }
  });

  const handleCreateFlashcard = () => {
    if (!question || !answer) return;
    createFlashcardMutation.mutate({ question, answer });
  };

  const autoConnectMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/ai/connect', { nodeId: id });
      return res.data;
    },
    onSuccess: (data) => {
      alert(data.message);
      queryClient.invalidateQueries({ queryKey: ['graph'] });
    },
    onError: (error: any) => {
      alert('Auto-connect failed: ' + (error.response?.data?.message || error.message));
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 w-full">
            {isEditing || id === 'new' ? (
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl md:text-3xl font-bold bg-transparent border-b border-border focus:border-primary outline-none w-full"
                placeholder="Node Title"
              />
            ) : (
              <h1 className="text-2xl md:text-3xl font-bold truncate" onClick={() => setIsEditing(true)}>{title}</h1>
            )}
          </div>
          <div className="flex items-center justify-between w-full md:w-auto gap-2">
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              disabled={!isEditing && id !== 'new'}
              className="bg-card border border-border rounded px-2 py-2 text-sm flex-1 md:flex-none"
            >
              <option value="concept">Concept</option>
              <option value="note">Note</option>
              <option value="snippet">Snippet</option>
              <option value="project">Project</option>
              <option value="subject">Subject</option>
              <option value="chapter">Chapter</option>
            </select>
            <button 
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="btn-primary flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 whitespace-nowrap"
            >
              <Save size={18} />
              Save
            </button>
          </div>
        </div>

        {/* Tags Section */}
        {(isEditing || id === 'new') && (
          <div className="flex flex-wrap items-center gap-2">
            {tags.map(tag => (
              <span key={tag} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs flex items-center gap-1">
                #{tag}
                <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-destructive">×</button>
              </span>
            ))}
            <div className="flex items-center gap-2">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tag..."
                className="bg-transparent border-b border-border focus:border-primary outline-none text-sm w-24"
              />
              <button 
                onClick={() => suggestTagsMutation.mutate()}
                disabled={suggestTagsMutation.isPending || !body}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                {suggestTagsMutation.isPending ? 'Thinking...' : '✨ Suggest Tags'}
              </button>
            </div>
          </div>
        )}
        {!isEditing && id !== 'new' && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Editor / Preview */}
        <div className="flex flex-col gap-4 h-full">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-muted-foreground">Content</h2>
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className="text-xs text-primary hover:underline"
            >
              {isEditing ? 'View Preview' : 'Edit Markdown'}
            </button>
          </div>
          
          {isEditing || id === 'new' ? (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="flex-1 w-full p-4 rounded-lg border border-border bg-card resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="# Write markdown here..."
            />
          ) : (
            <div className="flex-1 w-full p-4 rounded-lg border border-border bg-card overflow-auto prose dark:prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkMath]} 
                rehypePlugins={[rehypeKatex]}
              >
                {body}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Right Panel: Snippet or Context */}
        <div className="flex flex-col gap-4 h-full">
          {type === 'snippet' ? (
            <>
              <h2 className="font-semibold text-muted-foreground">Snippet Runner</h2>
              <SnippetRunner initialCode={body.match(/```js([\s\S]*?)```/)?.[1] || ''} />
            </>
          ) : (
            <div className="flex flex-col gap-4 h-full">
              {/* Flashcard Creator */}
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-muted-foreground">Flashcards</h2>
                  <button 
                    onClick={() => setShowFlashcardForm(!showFlashcardForm)}
                    className="text-xs text-primary hover:underline"
                  >
                    {showFlashcardForm ? 'Cancel' : '+ Add New'}
                  </button>
                </div>

                {showFlashcardForm ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        if (!body) return alert('Add some content first!');
                        createFlashcardMutation.mutate({ useAI: true, content: body } as any);
                      }}
                      disabled={createFlashcardMutation.isPending}
                      className="w-full btn-secondary bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 py-2 rounded-md text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 flex items-center justify-center gap-2 mb-2"
                    >
                      {createFlashcardMutation.isPending ? 'Generating...' : '✨ Auto-Generate with AI'}
                    </button>
                    
                    <div className="relative flex items-center gap-2 my-2">
                      <div className="h-px bg-border flex-1"></div>
                      <span className="text-xs text-muted-foreground">OR MANUAL</span>
                      <div className="h-px bg-border flex-1"></div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Question</label>
                      <input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                        placeholder="What is...?"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Answer</label>
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm h-20 resize-none"
                        placeholder="It is..."
                      />
                    </div>
                    <button
                      onClick={handleCreateFlashcard}
                      disabled={createFlashcardMutation.isPending || !question || !answer}
                      className="w-full btn-primary bg-primary text-primary-foreground py-2 rounded-md text-sm hover:bg-primary/90 disabled:opacity-50"
                    >
                      {createFlashcardMutation.isPending ? 'Creating...' : 'Create Flashcard'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
                    <p>Create flashcards to reinforce your learning of this concept.</p>
                    <button 
                      onClick={() => setShowFlashcardForm(true)}
                      className="mt-2 text-primary hover:underline"
                    >
                      Create First Flashcard
                    </button>
                  </div>
                )}
              </div>

              {/* Linked Context */}
              <div className="p-4 rounded-lg border border-border bg-muted/50 flex-1 flex flex-col gap-4">
                <h2 className="font-semibold text-muted-foreground">Linked Context</h2>
                
                {/* Existing Links */}
                <div className="flex-1 overflow-y-auto space-y-2">
                  {/* We would fetch and display existing links here */}
                  <p className="text-sm text-muted-foreground italic">No linked nodes yet.</p>
                </div>

                {/* Auto-Connect Button */}
                <button
                  onClick={() => autoConnectMutation.mutate()}
                  disabled={autoConnectMutation.isPending}
                  className="w-full btn-secondary bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 py-2 rounded-md text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 flex items-center justify-center gap-2"
                >
                  {autoConnectMutation.isPending ? 'Connecting...' : '🤖 Auto-Connect Related Nodes'}
                </button>

                {/* Add Link */}
                <div className="pt-4 border-t border-border">
                  <h3 className="text-xs font-medium text-muted-foreground mb-2">Link to another node</h3>
                  <div className="flex gap-2">
                    <select 
                      className="flex-1 bg-card border border-border rounded px-2 py-1 text-sm"
                      onChange={(e) => {
                        if (e.target.value) {
                          // Create link mutation
                          api.post('/edges', {
                            from: id,
                            to: e.target.value,
                            label: 'related'
                          }).then(() => {
                            alert('Link created!');
                            queryClient.invalidateQueries({ queryKey: ['graph'] });
                          }).catch(err => {
                            alert('Failed to create link: ' + (err.response?.data?.message || err.message));
                          });
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">Select a node...</option>
                      {allNodes?.filter((n: any) => n._id !== id).map((n: any) => (
                        <option key={n._id} value={n._id}>{n.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
