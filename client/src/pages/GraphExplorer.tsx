import React from 'react';
import { GraphView } from '../components/Graph/GraphView';

export const GraphExplorer: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Knowledge Graph</h2>
        <div className="flex gap-2">
          <span className="text-xs flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Concept</span>
          <span className="text-xs flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Note</span>
          <span className="text-xs flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Snippet</span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <GraphView />
      </div>
    </div>
  );
};
