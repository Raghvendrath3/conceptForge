import { Request, Response } from 'express';
import Edge from '../models/Edge';
import { AuthRequest } from '../middleware/authMiddleware';

export const getEdges = async (req: AuthRequest, res: Response) => {
  try {
    const { from, to, label } = req.query;
    const query: any = { ownerId: req.user._id };

    if (from) query.from = from;
    if (to) query.to = to;
    if (label) query.label = label;

    const edges = await Edge.find(query);
    res.json(edges);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createEdge = async (req: AuthRequest, res: Response) => {
  try {
    const { from, to, label } = req.body;

    const edge = await Edge.create({
      from,
      to,
      label,
      ownerId: req.user._id,
    });

    res.status(201).json(edge);
  } catch (error) {
    res.status(400).json({ message: 'Invalid edge data' });
  }
};

export const deleteEdge = async (req: AuthRequest, res: Response) => {
  try {
    const edge = await Edge.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!edge) return res.status(404).json({ message: 'Edge not found' });
    res.json({ message: 'Edge deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
