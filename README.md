# 🧠 ConceptForge

**ConceptForge** is an intelligent knowledge management system that helps you organize, connect, and explore concepts through an interactive graph-based interface. Built with modern web technologies, it combines note-taking, code execution, flashcard study, and AI-powered features to create a comprehensive learning platform.

![ConceptForge Banner](./docs/screenshots/banner.png)
*[TODO: Add banner screenshot showing the main interface]*

---

## ✨ Features

### 📝 Smart Note Management
- **Hierarchical Organization**: Structure knowledge into Subjects, Chapters, and Concepts
- **Rich Markdown Support**: Write notes with full markdown formatting and LaTeX math equations
- **Real-time Collaboration**: Socket.IO-powered live updates across devices

![Note Editor](./docs/screenshots/note-editor.png)
*[TODO: Add screenshot of the markdown editor with LaTeX rendering]*

### 🔗 Interactive Knowledge Graph
- **Visual Network**: Explore relationships between concepts with an interactive force-directed graph
- **Smart Filtering**: Filter by node type, search by content, and navigate hierarchies
- **AI Auto-Connect**: Automatically discover and suggest connections between related concepts

![Knowledge Graph](./docs/screenshots/graph-view.png)
*[TODO: Add screenshot of the graph explorer showing connected nodes]*

### 💻 Code Snippet Execution
- **Safe Sandbox**: Execute JavaScript code snippets in a secure, isolated environment
- **Syntax Highlighting**: CodeMirror integration for a professional coding experience
- **Quick Testing**: Test algorithms, try examples, and validate concepts instantly

![Code Snippet](./docs/screenshots/code-snippet.png)
*[TODO: Add screenshot of code editor with execution results]*

### 🎴 Flashcard Study System
- **Spaced Repetition**: Smart scheduling algorithm for optimal retention
- **Auto-Generation**: Transform your notes into study cards automatically
- **Progress Tracking**: Monitor your learning with detailed statistics

![Flashcard Study](./docs/screenshots/flashcards.png)
*[TODO: Add screenshot of flashcard interface]*

### 🤖 AI-Powered Features
- **Auto-Connect**: Google Gemini AI analyzes content and suggests relevant connections
- **Smart Relationships**: Automatically builds your knowledge graph based on semantic similarity
- **Intelligent Suggestions**: Get recommendations for related concepts

---

## 🎥 Demo

![Demo Video](./docs/videos/demo.gif)
*[TODO: Add demo video or GIF showing main features]*

### Quick Tour
1. **Create** - Add concepts, take notes, write code snippets
2. **Connect** - Link related ideas or let AI suggest connections
3. **Explore** - Navigate your knowledge graph visually
4. **Study** - Review with adaptive flashcards

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Graph Visualization**: react-force-graph-2d (D3.js)
- **Code Editor**: @uiw/react-codemirror
- **Markdown**: react-markdown with remark-math & rehype-katex
- **Icons**: lucide-react

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcryptjs
- **Real-time**: Socket.IO
- **AI Integration**: Google Gemini API
- **Security**: Helmet, CORS
- **Validation**: Zod

### DevOps
- **Containerization**: Docker
- **Deployment**: 
  - Frontend: Vercel
  - Backend: Render
  - Database: MongoDB Atlas
- **Version Control**: Git & GitHub

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and npm
- MongoDB (local or Atlas account)
- Google Gemini API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ConceptForge.git
   cd ConceptForge
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   ```

4. **Start development servers**
   
   Terminal 1 - Backend:
   ```bash
   cd server
   npm run dev
   ```
   
   Terminal 2 - Frontend:
   ```bash
   cd client
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Environment Variables

#### Server (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/conceptforge
JWT_SECRET=your-super-secret-key-change-this
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your-gemini-api-key-optional
NODE_ENV=development
```

#### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📦 Deployment

ConceptForge is production-ready and can be deployed for free using:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## 📖 Documentation

- **[Quick Start Guide](./QUICKSTART.md)** - Get up and running in 2 minutes
- **[Deployment Guide](./DEPLOYMENT.md)** - Deploy to production
- **[Security Guide](./SECURITY.md)** - Security features and best practices
- **[API Reference](./api_reference.md)** - Backend API documentation
- **[Seeding Guide](./SEEDING.md)** - Load demo data

---

## 🏗️ Project Structure

```
ConceptForge/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client & axios config
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   ├── store/         # Zustand state management
│   │   └── types/         # TypeScript type definitions
│   └── package.json
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/        # Database & environment config
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Auth & validation
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── sockets/       # Socket.IO handlers
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml      # Local development setup
├── render.yaml             # Render deployment config
└── README.md
```

---

## 🎯 Key Features Explained

### Hierarchical Structure
Organize knowledge in three levels:
- **Subjects** (e.g., "Computer Science")
  - **Chapters** (e.g., "Data Structures")
    - **Concepts** (e.g., "Binary Trees")

### Node Types
1. **Concept** - Standard notes with markdown
2. **Snippet** - Executable JavaScript code
3. **Subject** - Top-level organizational container
4. **Chapter** - Mid-level organizational container

### Graph Interactions
- **Zoom & Pan** - Navigate large knowledge networks
- **Click Nodes** - Open concept in editor
- **Drag & Drop** - Reposition nodes
- **Filter** - Show/hide by type or search term

---

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Bcrypt password hashing
- ✅ HTTP security headers (Helmet)
- ✅ CORS protection
- ✅ Environment variable secrets
- ✅ Input validation with Zod
- ✅ Sandboxed code execution

See [SECURITY.md](./SECURITY.md) for detailed security documentation.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 🙏 Acknowledgments

- **Google Gemini AI** - For intelligent auto-connect features
- **react-force-graph** - For beautiful graph visualizations
- **CodeMirror** - For the code editor experience
- **TailwindCSS** - For rapid UI development

---

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

## 🎨 Screenshots Gallery

### Dashboard
![Dashboard](./docs/screenshots/dashboard.png)
*[TODO: Add dashboard overview screenshot]*

### Library View
![Library](./docs/screenshots/library.png)
*[TODO: Add library view with node list]*

### Settings
![Settings](./docs/screenshots/settings.png)
*[TODO: Add settings page screenshot]*

### Mobile Responsive
![Mobile View](./docs/screenshots/mobile.png)
*[TODO: Add mobile responsive screenshot]*

---

**Built with ❤️ using React, TypeScript, and MongoDB**
