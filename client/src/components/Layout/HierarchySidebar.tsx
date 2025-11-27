import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronDown, FileText, Book, GraduationCap } from 'lucide-react';
import api from '../../api/axios';
import { clsx } from 'clsx';

interface TreeNodeProps {
  node: any;
  childrenNodes: any[];
  level: number;
  allEdges: any[];
  allNodes: any[];
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, childrenNodes, level, allEdges, allNodes }) => {
  const [isOpen, setIsOpen] = useState(level < 2); // Open subjects and chapters by default
  const location = useLocation();
  const isActive = location.pathname === `/node/${node._id}`;

  const hasChildren = childrenNodes.length > 0;

  const getIcon = (type: string) => {
    switch (type) {
      case 'subject': return <GraduationCap size={16} className="text-purple-500" />;
      case 'chapter': return <Book size={16} className="text-blue-500" />;
      default: return <FileText size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="select-none">
      <div 
        className={clsx(
          "flex items-center gap-1 py-1 px-2 rounded-md cursor-pointer transition-colors",
          isActive ? "bg-primary/10 text-primary" : "hover:bg-accent text-muted-foreground hover:text-foreground"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <div 
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          {hasChildren ? (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : <span className="w-[14px]" />}
        </div>
        
        <Link to={`/node/${node._id}`} className="flex items-center gap-2 flex-1 truncate">
          {getIcon(node.type)}
          <span className="truncate text-sm">{node.title}</span>
        </Link>
      </div>

      {isOpen && hasChildren && (
        <div>
          {childrenNodes.map(child => {
            // Find children of this child
            const grandChildren = allEdges
              .filter((e: any) => e.to === child._id && e.label === 'part-of')
              .map((e: any) => allNodes.find((n: any) => n._id === e.from))
              .filter(Boolean);

            return (
              <TreeNode 
                key={child._id} 
                node={child} 
                childrenNodes={grandChildren} 
                level={level + 1}
                allEdges={allEdges}
                allNodes={allNodes}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export const HierarchySidebar: React.FC = () => {
  const { data: rawData } = useQuery({
    queryKey: ['graph'], // Share query key with GraphView to share cache
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

  const tree = useMemo(() => {
    if (!rawData) return [];

    const { nodes, edges } = rawData;

    // 1. Find all Subjects
    const subjects = nodes.filter((n: any) => n.type === 'subject');

    // 2. For each subject, find Chapters (connected via 'part-of' edge where to=Subject)
    const subjectTree = subjects.map((subject: any) => {
      const chapters = edges
        .filter((e: any) => e.to === subject._id && e.label === 'part-of')
        .map((e: any) => nodes.find((n: any) => n._id === e.from))
        .filter((n: any) => n && n.type === 'chapter'); // Ensure they are chapters

      return {
        node: subject,
        children: chapters
      };
    });

    // 3. Handle Orphans (Chapters without subjects, Concepts without chapters)
    // For simplicity in V1, we might just show Subjects at root. 
    // But user might want to see everything.
    // Let's stick to the requested hierarchy: Subject -> Chapter -> Concept.
    
    return subjectTree;
  }, [rawData]);

  if (!rawData) return <div className="p-4 text-sm text-muted-foreground">Loading hierarchy...</div>;

  return (
    <div className="h-full overflow-y-auto py-2">
      <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Curriculum
      </h3>
      {tree.length === 0 ? (
        <div className="px-4 py-2 text-sm text-muted-foreground">
          No subjects found. Create a 'Subject' node to start.
        </div>
      ) : (
        tree.map((item: any) => (
          <TreeNode 
            key={item.node._id} 
            node={item.node} 
            childrenNodes={item.children} 
            level={0}
            allEdges={rawData.edges}
            allNodes={rawData.nodes}
          />
        ))
      )}
    </div>
  );
};
