import { Request, Response } from 'express';
import Node from '../models/Node';
import { AuthRequest } from '../middleware/authMiddleware';
import { suggestTagsFromContent } from '../services/aiService';

export const getNodes = async (req: AuthRequest, res: Response) => {
  try {
    const { type, tags } = req.query;
    const query: any = { ownerId: req.user._id };

    if (type) query.type = type;
    if (tags) query.tags = { $in: (tags as string).split(',') };

    try {
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(__dirname, '../../debug_nodes.log');
      fs.appendFileSync(logPath, `getNodes Query: ${JSON.stringify(query)}\n`);
      
      const nodes = await Node.find(query).sort({ updatedAt: -1 });
      fs.appendFileSync(logPath, `getNodes Result Count: ${nodes.length}\n`);
      res.json(nodes);
    } catch (err) {
      console.error('Logging error:', err);
      // Fallback if logging fails
      const nodes = await Node.find(query).sort({ updatedAt: -1 });
      res.json(nodes);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createNode = async (req: AuthRequest, res: Response) => {
  try {
    const { title, type, bodyMarkdown, tags } = req.body;

    const node = await Node.create({
      title,
      type,
      bodyMarkdown,
      tags,
      ownerId: req.user._id,
    });

    res.status(201).json(node);
  } catch (error) {
    res.status(400).json({ message: 'Invalid node data' });
  }
};

export const getNodeById = async (req: AuthRequest, res: Response) => {
  try {
    const node = await Node.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!node) return res.status(404).json({ message: 'Node not found' });
    res.json(node);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateNode = async (req: AuthRequest, res: Response) => {
  try {
    const { title, bodyMarkdown, tags, type } = req.body;
    const node = await Node.findOne({ _id: req.params.id, ownerId: req.user._id });

    if (!node) return res.status(404).json({ message: 'Node not found' });

    node.title = title || node.title;
    node.bodyMarkdown = bodyMarkdown !== undefined ? bodyMarkdown : node.bodyMarkdown;
    node.tags = tags || node.tags;
    node.type = type || node.type;
    node.version += 1;

    await node.save();
    res.json(node);
  } catch (error) {
    res.status(400).json({ message: 'Update failed' });
  }
};

export const deleteNode = async (req: AuthRequest, res: Response) => {
  try {
    const node = await Node.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!node) return res.status(404).json({ message: 'Node not found' });
    res.json({ message: 'Node deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const importWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    const { nodes } = req.body;
    
    if (!Array.isArray(nodes)) {
      return res.status(400).json({ message: 'Invalid data format. Expected array of nodes.' });
    }

    const createdNodes = await Promise.all(nodes.map(async (nodeData: any) => {
      // Create new node, ignoring _id from import to avoid conflicts
      return Node.create({
        title: nodeData.title,
        type: nodeData.type || 'concept',
        bodyMarkdown: nodeData.bodyMarkdown || '',
        tags: nodeData.tags || [],
        ownerId: req.user._id,
      });
    }));

    res.status(201).json({ message: `Successfully imported ${createdNodes.length} nodes`, count: createdNodes.length });
  } catch (error: any) {
    res.status(500).json({ message: 'Import failed', error: error.message });
  }
};

export const suggestTags = async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const tags = await suggestTagsFromContent(content);
    res.json({ tags });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getNodeChildren = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    
    // Find all edges where 'to' is the parent (id) and label is 'part-of'
    // This means the 'from' node is the child
    const edges = await import('../models/Edge').then(m => m.default.find({ 
      to: id, 
      label: 'part-of',
      ownerId: req.user._id 
    }));

    const childIds = edges.map(edge => edge.from);

    const query: any = { 
      _id: { $in: childIds },
      ownerId: req.user._id 
    };

    if (type) {
      query.type = type;
    }

    const children = await Node.find(query).sort({ updatedAt: -1 });
    res.json(children);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
