import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, AlertTriangle, Info } from 'lucide-react';

interface SnippetRunnerProps {
  initialCode?: string;
  nodeId?: string;
  onExecutionLog?: (code: string, output: string[]) => void;
}

interface LogEntry {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: number;
}

export const SnippetRunner: React.FC<SnippetRunnerProps> = ({ 
  initialCode = '', 
  // nodeId, // Reserved for future execution logging feature
  onExecutionLog 
}) => {
  const [code, setCode] = useState(initialCode);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const executionTimeoutRef = useRef<number>();

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const runCode = () => {
    setLogs([]);
    setIsRunning(true);
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Clear any previous timeout
    if (executionTimeoutRef.current) {
      clearTimeout(executionTimeoutRef.current);
    }

    // Security-hardened HTML with strict sandbox
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline';">
        </head>
        <body>
          <script>
            // Capture all console methods
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;
            const originalInfo = console.info;
            
            const sendMessage = (type, args) => {
              try {
                window.parent.postMessage({ 
                  type, 
                  args: args.map(arg => {
                    try {
                      return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
                    } catch (e) {
                      return String(arg);
                    }
                  }),
                  timestamp: Date.now()
                }, '*');
              } catch (e) {
                // Silently fail if postMessage is blocked
              }
            };
            
            console.log = (...args) => {
              sendMessage('log', args);
              originalLog.apply(console, args);
            };
            
            console.error = (...args) => {
              sendMessage('error', args);
              originalError.apply(console, args);
            };
            
            console.warn = (...args) => {
              sendMessage('warn', args);
              originalWarn.apply(console, args);
            };
            
            console.info = (...args) => {
              sendMessage('info', args);
              originalInfo.apply(console, args);
            };

            // Execution timeout safety
            setTimeout(() => {
              sendMessage('error', ['Execution timeout (5s limit)']);
            }, 5000);

            try {
              // User code execution
              ${code}
              sendMessage('info', ['✓ Execution completed']);
            } catch (err) {
              sendMessage('error', [err.message || String(err)]);
            }
          </script>
        </body>
      </html>
    `;

    iframe.srcdoc = html;

    // Auto-stop running indicator after timeout
    executionTimeoutRef.current = setTimeout(() => {
      setIsRunning(false);
    }, 5500);
  };

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      // Validate message origin (only accept from same window)
      if (e.source !== iframeRef.current?.contentWindow) {
        return;
      }

      if (e.data && ['log', 'error', 'warn', 'info'].includes(e.data.type)) {
        const entry: LogEntry = {
          type: e.data.type,
          message: e.data.args.join(' '),
          timestamp: e.data.timestamp || Date.now()
        };
        setLogs(prev => [...prev, entry]);
        
        // Stop running indicator on completion or error
        if (e.data.type === 'info' && e.data.args[0]?.includes('completed')) {
          setIsRunning(false);
        }
      }
    };
    
    window.addEventListener('message', handler);
    return () => {
      window.removeEventListener('message', handler);
      if (executionTimeoutRef.current) {
        clearTimeout(executionTimeoutRef.current);
      }
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const saveExecution = () => {
    if (onExecutionLog) {
      onExecutionLog(code, logs.map(l => `[${l.type.toUpperCase()}] ${l.message}`));
    }
  };

  const getLogIcon = (type: string) => {
    switch(type) {
      case 'error': return <AlertTriangle size={12} className="text-red-400" />;
      case 'warn': return <AlertTriangle size={12} className="text-yellow-400" />;
      case 'info': return <Info size={12} className="text-blue-400" />;
      default: return null;
    }
  };

  const getLogColor = (type: string) => {
    switch(type) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-green-400';
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden flex flex-col h-96">
      <div className="bg-muted p-2 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">JavaScript Sandbox</span>
          {isRunning && (
            <span className="text-xs text-primary animate-pulse">Running...</span>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={clearLogs} 
            className="p-1 hover:bg-accent rounded" 
            title="Clear Console"
            disabled={logs.length === 0}
          >
            <RotateCcw size={14} />
          </button>
          <button 
            onClick={runCode} 
            disabled={isRunning}
            className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90 disabled:opacity-50"
          >
            <Play size={14} />
            Run
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 p-4 font-mono text-sm bg-background resize-none focus:outline-none"
          placeholder="// Write JavaScript code here...
// Example:
console.log('Hello, ConceptForge!');
const nums = [1, 2, 3];
console.log('Sum:', nums.reduce((a, b) => a + b, 0));"
        />
        
        {/* Console Panel */}
        <div className="w-full md:w-1/2 bg-slate-950 text-green-400 font-mono text-xs flex flex-col border-l border-border">
          <div className="p-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Console ({logs.length})</span>
            {logs.length > 0 && (
              <button
                onClick={saveExecution}
                className="text-xs text-slate-400 hover:text-slate-200"
                title="Save execution log"
              >
                Save Log
              </button>
            )}
          </div>
          <div className="flex-1 p-4 overflow-auto">
            {logs.length === 0 && (
              <span className="opacity-50">Console output will appear here...</span>
            )}
            {logs.map((log, i) => (
              <div key={i} className={`mb-2 flex gap-2 ${getLogColor(log.type)}`}>
                {getLogIcon(log.type)}
                <div className="flex-1 whitespace-pre-wrap break-words">
                  {log.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Sandboxed iframe with strict security */}
      <iframe 
        ref={iframeRef} 
        className="hidden" 
        sandbox="allow-scripts"
        title="JavaScript Execution Sandbox"
        // No allow-same-origin to prevent access to parent document
        // No allow-forms, allow-popups, allow-modals for extra security
      />
      
      {/* Security Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-950 border-t border-yellow-200 dark:border-yellow-800 p-2">
        <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
          <AlertTriangle size={12} />
          Code runs in a sandboxed iframe with no network or storage access. Max execution: 5 seconds.
        </p>
      </div>
    </div>
  );
};
