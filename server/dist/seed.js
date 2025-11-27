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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("./models/User"));
const Node_1 = __importDefault(require("./models/Node"));
const Edge_1 = __importDefault(require("./models/Edge"));
dotenv_1.default.config();
const demoNodes = [
    { title: 'JavaScript Basics', type: 'concept', bodyMarkdown: '# JavaScript Basics\n\nFundamentals of JS programming.', tags: ['javascript', 'programming'] },
    { title: 'Variables', type: 'concept', bodyMarkdown: '# Variables\n\nContainers for storing data values.', tags: ['javascript', 'basics'] },
    { title: 'Functions', type: 'concept', bodyMarkdown: '# Functions\n\nReusable blocks of code.', tags: ['javascript', 'basics'] },
    { title: 'Arrays', type: 'concept', bodyMarkdown: '# Arrays\n\nOrdered collections of values.', tags: ['javascript', 'data-structures'] },
    { title: 'Objects', type: 'concept', bodyMarkdown: '# Objects\n\nKey-value pair collections.', tags: ['javascript', 'data-structures'] },
    { title: 'React Hooks', type: 'concept', bodyMarkdown: '# React Hooks\n\nModern React state management.', tags: ['react', 'frontend'] },
    { title: 'useState Example', type: 'snippet', bodyMarkdown: '```js\nconst [count, setCount] = useState(0);\n```', tags: ['react', 'hooks'] },
    { title: 'API Design', type: 'note', bodyMarkdown: '# API Design Notes\n\nRESTful principles and best practices.', tags: ['backend', 'api'] },
    { title: 'MongoDB Setup', type: 'note', bodyMarkdown: '# MongoDB Setup\n\nDatabase configuration steps.', tags: ['database', 'mongodb'] },
    { title: 'ConceptForge Project', type: 'project', bodyMarkdown: '# ConceptForge\n\nPersonal knowledge management system.', tags: ['project', 'demo'] }
];
const demoEdges = [
    { from: 0, to: 1, label: 'part-of' },
    { from: 0, to: 2, label: 'part-of' },
    { from: 0, to: 3, label: 'part-of' },
    { from: 0, to: 4, label: 'part-of' },
    { from: 1, to: 2, label: 'prerequisite' },
    { from: 2, to: 3, label: 'related' },
    { from: 3, to: 4, label: 'related' },
    { from: 5, to: 6, label: 'part-of' },
    { from: 7, to: 8, label: 'related' }
];
async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/conceptforge');
        console.log('MongoDB Connected');
        // Clear existing data
        await Node_1.default.deleteMany({});
        await Edge_1.default.deleteMany({});
        console.log('Cleared existing data');
        // Find or create demo user
        let demoUser = await User_1.default.findOne({ email: 'demo@example.com' });
        if (!demoUser) {
            const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('demo123', salt);
            demoUser = await User_1.default.create({
                email: 'demo@example.com',
                name: 'Demo User',
                passwordHash
            });
            console.log('Created demo user');
        }
        // Create nodes
        const createdNodes = [];
        for (const nodeData of demoNodes) {
            const node = await Node_1.default.create({
                ...nodeData,
                ownerId: demoUser._id
            });
            createdNodes.push(node);
        }
        console.log(`Created ${createdNodes.length} nodes`);
        // Create edges using actual node IDs
        for (const edgeData of demoEdges) {
            await Edge_1.default.create({
                from: createdNodes[edgeData.from]._id,
                to: createdNodes[edgeData.to]._id,
                label: edgeData.label,
                ownerId: demoUser._id
            });
        }
        console.log(`Created ${demoEdges.length} edges`);
        console.log('\n✅ Demo dataset seeded successfully!');
        console.log(`\nDemo credentials:\nEmail: demo@example.com\nPassword: demo123\n`);
    }
    catch (error) {
        console.error('Error seeding database:', error);
    }
    finally {
        await mongoose_1.default.connection.close();
        console.log('Database connection closed');
    }
}
// Run seeder
seedDatabase();
