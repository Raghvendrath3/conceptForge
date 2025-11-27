import React, { useRef, useState, useMemo } from 'react';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, X } from 'lucide-react';
import api from '../../api/axios';
import { useStore } from '../../store/useStore';
import { clsx } from 'clsx';

export const GraphView: React.FC = () => {
  const fgRef = useRef<ForceGraphMethods>();
  const navigate = useNavigate();
  const { theme, layout, setGraphHeight } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: rawData, isError, error } = useQuery({
    queryKey: ['graph'],
    queryFn: async () => {
      const [nodesRes, edgesRes] = await Promise.all([
        api.get('/nodes'),
        api.get('/edges')
      ]);
      
      return {
        nodes: nodesRes.data,
        edges: edgesRes.data
      };
    }
  });

  // Extract unique types and tags
  const { availableTypes, availableTags } = useMemo(() => {
    if (!rawData) return { availableTypes: [], availableTags: [] };
    
    const types = new Set<string>();
    const tags = new Set<string>();
    
    rawData.nodes.forEach((n: any) => {
      types.add(n.type);
      n.tags?.forEach((t: string) => tags.add(t));
    });
    
    return {
      availableTypes: Array.from(types),
      availableTags: Array.from(tags)
    };
  }, [rawData]);

  // Filtered graph data
  const graphData = useMemo(() => {
    if (!rawData) return null;
    
    let filteredNodes = rawData.nodes;
    
    // Apply search filter
    if (searchTerm) {
      filteredNodes = filteredNodes.filter((n: any) => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.bodyMarkdown?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (selectedTypes.length > 0) {
      filteredNodes = filteredNodes.filter((n: any) => selectedTypes.includes(n.type));
    }
    
    // Apply tag filter
    if (selectedTags.length > 0) {
      filteredNodes = filteredNodes.filter((n: any) => 
        n.tags?.some((t: string) => selectedTags.includes(t))
      );
    }
    
    const nodeIds = new Set(filteredNodes.map((n: any) => n._id));
    
    // Filter edges to only include those where both nodes are visible
    const filteredEdges = rawData.edges.filter((e: any) => 
      nodeIds.has(e.from) && nodeIds.has(e.to)
    );
    
    return {
      nodes: filteredNodes.map((n: any) => ({ 
        id: n._id, 
        name: n.title, 
        val: 1,
        group: n.type,
        tags: n.tags || []
      })),
      links: filteredEdges.map((e: any) => ({
        source: e.from,
        target: e.to,
        type: e.label
      }))
    };
  }, [rawData, searchTerm, selectedTypes, selectedTags]);

  const handleNodeClick = (node: any) => {
    navigate(`/node/${node.id}`);
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setSelectedTags([]);
  };

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Responsive graph sizing
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [showControls, setShowControls] = useState(true);

  // Resizing Logic
  const [isResizing, setIsResizing] = useState(false);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        // Calculate new height based on mouse position relative to container top
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const newHeight = Math.max(300, Math.min(1200, e.clientY - rect.top));
          setGraphHeight(newHeight);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setGraphHeight]);

  // Update dimensions when graphHeight changes
  React.useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    }
  }, [layout.graphHeight]);

  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    // Initial update
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="w-full flex flex-col gap-4 relative">
      {/* Mobile Toggle for Controls */}
      <button 
        onClick={() => setShowControls(!showControls)}
        className="md:hidden absolute top-2 right-2 z-10 p-2 bg-card border border-border rounded-md shadow-sm"
      >
        <Filter size={18} />
      </button>

      {/* Controls */}
      <div className={clsx(
        "bg-card rounded-lg border border-border p-4 space-y-4 transition-all duration-300",
        !showControls && "hidden md:block"
      )}>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-md border border-input bg-background"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">Type:</span>
            {availableTypes.map(type => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedTypes.includes(type)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent text-accent-foreground hover:bg-accent/80'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Tag Filter */}
          {availableTags.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Tags:</span>
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent text-accent-foreground hover:bg-accent/80'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Clear Filters */}
          {(selectedTypes.length > 0 || selectedTags.length > 0 || searchTerm) && (
            <button
              onClick={clearFilters}
              className="ml-auto px-3 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="text-xs text-muted-foreground">
          Showing {graphData?.nodes.length || 0} nodes, {graphData?.links.length || 0} edges
        </div>
        <div className="text-xs text-red-500">
          DEBUG: Raw Nodes: {rawData?.nodes?.length || 0}, Raw Edges: {rawData?.edges?.length || 0}
          {isError && <div>Error: {JSON.stringify(error)}</div>}
        </div>
      </div>

      {/* Graph */}
      <div 
        ref={containerRef} 
        className="bg-card rounded-lg border border-border overflow-hidden relative flex-shrink-0"
        style={{ height: layout.graphHeight }}
      >
        {graphData ? (
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeLabel="name"
            nodeRelSize={6}
            linkDirectionalArrowLength={3.5}
            linkDirectionalArrowRelPos={1}
            nodeColor={(node: any) => {
              switch(node.group) {
                case 'concept': return '#3b82f6';
                case 'note': return '#10b981';
                case 'snippet': return '#f59e0b';
                case 'project': return '#8b5cf6';
                case 'subject': return '#a855f7';
                case 'chapter': return '#3b82f6';
                default: return '#6366f1';
              }
            }}
            backgroundColor={isDark ? '#020817' : '#ffffff'}
            linkColor={() => isDark ? '#334155' : '#e2e8f0'}
            onNodeClick={handleNodeClick}
            cooldownTicks={100}
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = node.name;
              const fontSize = 12/globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = isDark ? '#ffffff' : '#000000';
              ctx.fillText(label, node.x, node.y + 8);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Loading Graph...
          </div>
        )}
        
        {/* Resize Handle */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-2 cursor-row-resize hover:bg-primary/50 z-10 transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
            document.body.style.cursor = 'row-resize';
          }}
        />
      </div>
    </div>
  );
};
