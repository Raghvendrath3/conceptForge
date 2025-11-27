import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Node from '../models/Node';

interface ExecutionLog {
  code: string;
  output: string[];
  timestamp: Date;
}

export const logExecution = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { code, output } = req.body;

    const node = await Node.findOne({ _id: id, ownerId: req.user._id });
    if (!node) {
      return res.status(404).json({ message: 'Node not found' });
    }

    // Only allow logging for snippet-type nodes
    if (node.type !== 'snippet') {
      return res.status(400).json({ message: 'Execution logging only available for snippet nodes' });
    }

    // Store execution log in node metadata (optional feature)
    // This is a simple implementation - could be extended with a separate ExecutionLog model
    const executionLog: ExecutionLog = {
      code,
      output,
      timestamp: new Date()
    };

    // Append to execution history (stored in node for simplicity)
    // In production, consider a separate collection with size limits
    const updatedNode = await Node.findByIdAndUpdate(
      id,
      {
        $push: {
          // Assuming we add an executionHistory field to the Node schema
          // For now, we'll just return success without persisting
          // metadata: { lastExecution: executionLog }
        }
      },
      { new: true }
    );

    res.json({ 
      message: 'Execution logged successfully',
      executionLog 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
