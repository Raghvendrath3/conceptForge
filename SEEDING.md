# Seeding Demo Dataset

## Prerequisites
- MongoDB running on `localhost:27017`
- Server dependencies installed (`npm install`)

## Steps

1. **Start MongoDB** (if not already running):
   ```bash
   mongod
   ```

2. **Run the seed script**:
   ```bash
   cd server
   npx ts-node src/seed.ts
   ```

3. **Login with demo credentials**:
   - Email: `demo@example.com`
   - Password: `demo123`

## What gets created

The seed script creates:
- **1 Demo User** (demo@example.com)
- **10 Demo Nodes**:
  - JavaScript Basics (concept)
  - Variables, Functions, Arrays, Objects (concepts)
  - React Hooks (concept)
  - useState Example (snippet)
  - API Design, MongoDB Setup (notes)
  - ConceptForge Project (project)
- **9 Demo Edges** connecting related nodes

## Graph Features to Test

After seeding, navigate to the Graph View to test:
1. **Search**: Type "javascript" to filter nodes
2. **Type Filter**: Click on type badges (concept, note, snippet, project)
3. **Tag Filter**: Click on tag badges (#javascript, #react, etc.)
4. **Node Click**: Click any node to open it in the Node Editor
5. **Clear Filters**: Click "Clear All" to reset filters
