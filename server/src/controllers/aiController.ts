import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Node from '../models/Node';
import Edge from '../models/Edge';
import { findConnections } from '../services/aiService';

export const autoConnectNodes = async (req: AuthRequest, res: Response) => {
  try {
    const { nodeId } = req.body;

    if (!nodeId) {
      return res.status(400).json({ message: 'Target Node ID is required' });
    }

    // 1. Fetch Target Node
    const targetNode = await Node.findOne({ _id: nodeId, ownerId: req.user._id });
    if (!targetNode) {
      return res.status(404).json({ message: 'Node not found' });
    }

    // 2. Fetch Candidate Nodes (exclude target node)
    const candidateNodes = await Node.find({ 
      _id: { $ne: nodeId }, 
      ownerId: req.user._id 
    }).limit(20); // Limit to avoid token limits

    if (candidateNodes.length === 0) {
      return res.json({ message: 'No other nodes to connect to', connections: [] });
    }

    // 3. Call AI Service
    const suggestedConnections = await findConnections(targetNode, candidateNodes);

    // 4. Create Edges
    const newEdges = [];
    for (const conn of suggestedConnections) {
      // Check if edge already exists
      const existingEdge = await Edge.findOne({
        from: nodeId,
        to: conn.to,
        ownerId: req.user._id
      });

      if (!existingEdge) {
        const edge = await Edge.create({
          from: nodeId,
          to: conn.to,
          label: conn.label || 'related',
          ownerId: req.user._id
        });
        newEdges.push(edge);
      }
    }

    res.json({ 
      message: `Created ${newEdges.length} new connections`, 
      connections: newEdges 
    });

  } catch (error) {
    console.error('Auto-Connect Error:', error);
    res.status(500).json({ message: 'Failed to auto-connect nodes' });
  }
};
