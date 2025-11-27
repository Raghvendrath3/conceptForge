import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { 
  LayoutDashboard, 
  Network, 
  BookOpen, 
  Settings, 
  LogOut, 
  Menu,
  Plus,
  Library
} from 'lucide-react';
import { clsx } from 'clsx';
import { HierarchySidebar } from './HierarchySidebar';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sidebarOpen, toggleSidebar, logout, user, layout, setSidebarWidth } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [isResizingSidebar, setIsResizingSidebar] = React.useState(false);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar) {
        const newWidth = Math.max(160, Math.min(480, e.clientX));
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      document.body.style.cursor = 'default';
    };

    if (isResizingSidebar) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingSidebar, setSidebarWidth]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Library, label: 'Library', path: '/library' },
    { icon: Network, label: 'Graph View', path: '/graph' },
    { icon: BookOpen, label: 'Study', path: '/study' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside 
        className={clsx(
          "hidden md:flex bg-card border-r border-border transition-all duration-75 flex-col relative",
          !sidebarOpen && "w-16"
        )}
        style={{ width: sidebarOpen ? layout.sidebarWidth : undefined }}
      >
        {/* Sidebar Resizer */}
        {sidebarOpen && (
          <div 
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 z-50"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizingSidebar(true);
              document.body.style.cursor = 'col-resize';
            }}
          />
        )}
        <div className="p-4 flex items-center justify-between border-b border-border h-16">
          {sidebarOpen && <span className="font-bold text-xl text-primary">ConceptForge</span>}
          <button onClick={toggleSidebar} className="p-1 hover:bg-accent rounded">
            <Menu size={20} />
          </button>
        </div>

        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="flex-1 overflow-hidden border-t border-border mt-2">
            <HierarchySidebar />
          </div>
        )}

        <div className="p-4 border-t border-border">
          {sidebarOpen && (
            <div className="mb-4 px-2">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-md text-destructive hover:bg-destructive/10 w-full",
              !sidebarOpen && "justify-center"
            )}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <span className="md:hidden font-bold text-primary">CF</span>
            <h1 className="text-lg font-semibold">
              {navItems.find(i => i.path === location.pathname)?.label || 'ConceptForge'}
            </h1>
          </div>
          <button 
            onClick={() => navigate('/node/new')}
            className="btn-primary flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 md:px-4 md:py-2 rounded-md hover:bg-primary/90 text-sm md:text-base"
          >
            <Plus size={18} />
            <span>New Node</span>
          </button>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-2 z-50 safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex flex-col items-center justify-center p-2 rounded-md transition-colors w-full",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center justify-center p-2 rounded-md text-muted-foreground hover:text-destructive w-full"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-medium mt-1">Logout</span>
        </button>
      </nav>
    </div>
  );
};
