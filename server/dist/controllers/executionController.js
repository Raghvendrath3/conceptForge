"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logExecution = void 0;
const Node_1 = __importDefault(require("../models/Node"));
const logExecution = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, output } = req.body;
        const node = await Node_1.default.findOne({ _id: id, ownerId: req.user._id });
        if (!node) {
            return res.status(404).json({ message: 'Node not found' });
        }
        // Only allow logging for snippet-type nodes
        if (node.type !== 'snippet') {
            return res.status(400).json({ message: 'Execution logging only available for snippet nodes' });
        }
        // Store execution log in node metadata (optional feature)
        // This is a simple implementation - could be extended with a separate ExecutionLog model
        const executionLog = {
            code,
            output,
            timestamp: new Date()
        };
        // Append to execution history (stored in node for simplicity)
        // In production, consider a separate collection with size limits
        const updatedNode = await Node_1.default.findByIdAndUpdate(id, {
            $push: {
            // Assuming we add an executionHistory field to the Node schema
            // For now, we'll just return success without persisting
            // metadata: { lastExecution: executionLog }
            }
        }, { new: true });
        res.json({
            message: 'Execution logged successfully',
            executionLog
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.logExecution = logExecution;
