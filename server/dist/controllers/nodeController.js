"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNodeChildren = exports.suggestTags = exports.importWorkspace = exports.deleteNode = exports.updateNode = exports.getNodeById = exports.createNode = exports.getNodes = void 0;
const Node_1 = __importDefault(require("../models/Node"));
const aiService_1 = require("../services/aiService");
const getNodes = async (req, res) => {
    try {
        const { type, tags } = req.query;
        const query = { ownerId: req.user._id };
        if (type)
            query.type = type;
        if (tags)
            query.tags = { $in: tags.split(',') };
        try {
            const fs = require('fs');
            const path = require('path');
            const logPath = path.join(__dirname, '../../debug_nodes.log');
            fs.appendFileSync(logPath, `getNodes Query: ${JSON.stringify(query)}\n`);
            const nodes = await Node_1.default.find(query).sort({ updatedAt: -1 });
            fs.appendFileSync(logPath, `getNodes Result Count: ${nodes.length}\n`);
            res.json(nodes);
        }
        catch (err) {
            console.error('Logging error:', err);
            // Fallback if logging fails
            const nodes = await Node_1.default.find(query).sort({ updatedAt: -1 });
            res.json(nodes);
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getNodes = getNodes;
const createNode = async (req, res) => {
    try {
        const { title, type, bodyMarkdown, tags } = req.body;
        const node = await Node_1.default.create({
            title,
            type,
            bodyMarkdown,
            tags,
            ownerId: req.user._id,
        });
        res.status(201).json(node);
    }
    catch (error) {
        res.status(400).json({ message: 'Invalid node data' });
    }
};
exports.createNode = createNode;
const getNodeById = async (req, res) => {
    try {
        const node = await Node_1.default.findOne({ _id: req.params.id, ownerId: req.user._id });
        if (!node)
            return res.status(404).json({ message: 'Node not found' });
        res.json(node);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getNodeById = getNodeById;
const updateNode = async (req, res) => {
    try {
        const { title, bodyMarkdown, tags, type } = req.body;
        const node = await Node_1.default.findOne({ _id: req.params.id, ownerId: req.user._id });
        if (!node)
            return res.status(404).json({ message: 'Node not found' });
        node.title = title || node.title;
        node.bodyMarkdown = bodyMarkdown !== undefined ? bodyMarkdown : node.bodyMarkdown;
        node.tags = tags || node.tags;
        node.type = type || node.type;
        node.version += 1;
        await node.save();
        res.json(node);
    }
    catch (error) {
        res.status(400).json({ message: 'Update failed' });
    }
};
exports.updateNode = updateNode;
const deleteNode = async (req, res) => {
    try {
        const node = await Node_1.default.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
        if (!node)
            return res.status(404).json({ message: 'Node not found' });
        res.json({ message: 'Node deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteNode = deleteNode;
const importWorkspace = async (req, res) => {
    try {
        const { nodes } = req.body;
        if (!Array.isArray(nodes)) {
            return res.status(400).json({ message: 'Invalid data format. Expected array of nodes.' });
        }
        const createdNodes = await Promise.all(nodes.map(async (nodeData) => {
            // Create new node, ignoring _id from import to avoid conflicts
            return Node_1.default.create({
                title: nodeData.title,
                type: nodeData.type || 'concept',
                bodyMarkdown: nodeData.bodyMarkdown || '',
                tags: nodeData.tags || [],
                ownerId: req.user._id,
            });
        }));
        res.status(201).json({ message: `Successfully imported ${createdNodes.length} nodes`, count: createdNodes.length });
    }
    catch (error) {
        res.status(500).json({ message: 'Import failed', error: error.message });
    }
};
exports.importWorkspace = importWorkspace;
const suggestTags = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content)
            return res.status(400).json({ message: 'Content is required' });
        const tags = await (0, aiService_1.suggestTagsFromContent)(content);
        res.json({ tags });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.suggestTags = suggestTags;
const getNodeChildren = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;
        // Find all edges where 'to' is the parent (id) and label is 'part-of'
        // This means the 'from' node is the child
        const edges = await Promise.resolve().then(() => __importStar(require('../models/Edge'))).then(m => m.default.find({
            to: id,
            label: 'part-of',
            ownerId: req.user._id
        }));
        const childIds = edges.map(edge => edge.from);
        const query = {
            _id: { $in: childIds },
            ownerId: req.user._id
        };
        if (type) {
            query.type = type;
        }
        const children = await Node_1.default.find(query).sort({ updatedAt: -1 });
        res.json(children);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getNodeChildren = getNodeChildren;
