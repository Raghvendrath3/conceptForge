import React from 'react';
import { useStore } from '../store/useStore';
import { Moon, Sun, Monitor } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../api/axios';

export const Settings: React.FC = () => {
  const { theme, setTheme, user } = useStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const response = await api.get('/nodes');
      const data = JSON.stringify({ nodes: response.data }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `conceptforge-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Export failed');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (!data.nodes || !Array.isArray(data.nodes)) {
          alert('Invalid backup file format');
          return;
        }

        await api.post('/nodes/import', { nodes: data.nodes });
        alert(`Successfully imported ${data.nodes.length} nodes!`);
        window.location.reload();
      } catch (error) {
        alert('Import failed: ' + (error as any).message);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b border-border pb-2">Appearance</h2>
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => setTheme('light')}
            className={clsx(
              "p-4 rounded-lg border flex flex-col items-center gap-2 hover:bg-accent",
              theme === 'light' ? "border-primary bg-primary/5" : "border-border"
            )}
          >
            <Sun size={24} />
            <span>Light</span>
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className={clsx(
              "p-4 rounded-lg border flex flex-col items-center gap-2 hover:bg-accent",
              theme === 'dark' ? "border-primary bg-primary/5" : "border-border"
            )}
          >
            <Moon size={24} />
            <span>Dark</span>
          </button>
          <button 
            onClick={() => setTheme('system')}
            className={clsx(
              "p-4 rounded-lg border flex flex-col items-center gap-2 hover:bg-accent",
              theme === 'system' ? "border-primary bg-primary/5" : "border-border"
            )}
          >
            <Monitor size={24} />
            <span>System</span>
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b border-border pb-2">Account</h2>
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Name</label>
              <p className="font-medium">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b border-border pb-2">Data Management</h2>
        <div className="flex gap-4">
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-card border border-border rounded hover:bg-accent flex items-center gap-2"
          >
            Export Workspace
          </button>
          <button 
            onClick={handleImportClick}
            className="px-4 py-2 bg-card border border-border rounded hover:bg-accent flex items-center gap-2"
          >
            Import Workspace
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />
        </div>
      </section>
    </div>
  );
};
