"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEdge = exports.createEdge = exports.getEdges = void 0;
const Edge_1 = __importDefault(require("../models/Edge"));
const getEdges = async (req, res) => {
    try {
        const { from, to, label } = req.query;
        const query = { ownerId: req.user._id };
        if (from)
            query.from = from;
        if (to)
            query.to = to;
        if (label)
            query.label = label;
        const edges = await Edge_1.default.find(query);
        res.json(edges);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getEdges = getEdges;
const createEdge = async (req, res) => {
    try {
        const { from, to, label } = req.body;
        const edge = await Edge_1.default.create({
            from,
            to,
            label,
            ownerId: req.user._id,
        });
        res.status(201).json(edge);
    }
    catch (error) {
        res.status(400).json({ message: 'Invalid edge data' });
    }
};
exports.createEdge = createEdge;
const deleteEdge = async (req, res) => {
    try {
        const edge = await Edge_1.default.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
        if (!edge)
            return res.status(404).json({ message: 'Edge not found' });
        res.json({ message: 'Edge deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteEdge = deleteEdge;
