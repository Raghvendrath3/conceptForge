import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Node from './models/Node';
import Edge from './models/Edge';

dotenv.config();

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
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/conceptforge');
    console.log('MongoDB Connected');

    // Clear existing data
    await Node.deleteMany({});
    await Edge.deleteMany({});
    console.log('Cleared existing data');

    // Find or create demo user
    let demoUser = await User.findOne({ email: 'demo@example.com' });
    if (!demoUser) {
      const bcrypt = await import('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('demo123', salt);
      
      demoUser = await User.create({
        email: 'demo@example.com',
        name: 'Demo User',
        passwordHash
      });
      console.log('Created demo user');
    }

    // Create nodes
    const createdNodes = [];
    for (const nodeData of demoNodes) {
      const node = await Node.create({
        ...nodeData,
        ownerId: demoUser._id
      });
      createdNodes.push(node);
    }
    console.log(`Created ${createdNodes.length} nodes`);

    // Create edges using actual node IDs
    for (const edgeData of demoEdges) {
      await Edge.create({
        from: createdNodes[edgeData.from]._id,
        to: createdNodes[edgeData.to]._id,
        label: edgeData.label,
        ownerId: demoUser._id
      });
    }
    console.log(`Created ${demoEdges.length} edges`);

    console.log('\n✅ Demo dataset seeded successfully!');
    console.log(`\nDemo credentials:\nEmail: demo@example.com\nPassword: demo123\n`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run seeder
seedDatabase();
