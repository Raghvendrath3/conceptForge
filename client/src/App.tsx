import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { Dashboard } from './pages/Dashboard';
import { useStore } from './store/useStore';

import { GraphExplorer } from './pages/GraphExplorer';
import { NodeEditor } from './pages/NodeEditor';
import { FlashcardStudy } from './pages/FlashcardStudy';
import { Settings } from './pages/Settings';
import { Library } from './pages/Library';
import { SubjectView } from './pages/SubjectView';
import { ChapterView } from './pages/ChapterView';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
};

function App() {
  const { theme } = useStore();

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
        <Route path="/subject/:id" element={<ProtectedRoute><SubjectView /></ProtectedRoute>} />
        <Route path="/chapter/:id" element={<ProtectedRoute><ChapterView /></ProtectedRoute>} />
        <Route path="/graph" element={<ProtectedRoute><GraphExplorer /></ProtectedRoute>} />
        <Route path="/node/:id" element={<ProtectedRoute><NodeEditor /></ProtectedRoute>} />
        <Route path="/study" element={<ProtectedRoute><FlashcardStudy /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
