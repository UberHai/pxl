'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, Copy, Trash2 } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  args: any[];
}

export default function LogCapture() {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const originalConsole = useRef<any>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const startCapture = () => {
    if (isCapturing) return;

    // Store original console methods
    originalConsole.current.log = console.log;
    originalConsole.current.warn = console.warn;
    originalConsole.current.error = console.error;
    originalConsole.current.info = console.info;

    // Override console methods
          const captureLog = (level: string) => (...args: any[]) => {
      const entry: LogEntry = {
        timestamp: new Date().toLocaleTimeString(),
        level: level.toUpperCase(),
        message: args.map(arg => {
          if (typeof arg === 'object' && arg !== null) {
            // Pretty print objects, but limit depth for performance
            try {
              return JSON.stringify(arg, null, 2);
            } catch (e) {
              return '[Object (circular reference)]';
            }
          }
          return String(arg);
        }).join(' '),
        args: args
      };

      setLogs(prev => {
        const newLogs = [...prev, entry];
        // Keep only the last 1000 entries to prevent memory issues
        return newLogs.length > 1000 ? newLogs.slice(-1000) : newLogs;
      });

      // Also call original console method
      originalConsole.current[level](...args);
    };

    console.log = captureLog('log');
    console.warn = captureLog('warn');
    console.error = captureLog('error');
    console.info = captureLog('info');

    setIsCapturing(true);
    originalConsole.current.log('🔍 Log capture started');
  };

  const stopCapture = () => {
    if (!isCapturing) return;

    // Restore original console methods
    console.log = originalConsole.current.log;
    console.warn = originalConsole.current.warn;
    console.error = originalConsole.current.error;
    console.info = originalConsole.current.info;

    setIsCapturing(false);
    originalConsole.current.log('🔍 Log capture stopped');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const copyLogs = async () => {
    const filteredLogs = filterLevel === 'ALL' ? logs : logs.filter(log => log.level === filterLevel);
    const logText = filteredLogs.map(log =>
      `[${log.timestamp}] ${log.level}: ${log.message}`
    ).join('\n');

    try {
      await navigator.clipboard.writeText(logText);
      originalConsole.current.log('📋 Logs copied to clipboard');
    } catch (err) {
      // Fallback for older browsers
      if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand('copy');
        originalConsole.current.log('📋 Logs selected (press Ctrl+C to copy)');
      }
    }
  };

  const exportLogs = () => {
    const filteredLogs = filterLevel === 'ALL' ? logs : logs.filter(log => log.level === filterLevel);
    const logData = {
      timestamp: new Date().toISOString(),
      totalLogs: filteredLogs.length,
      logs: filteredLogs
    };

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    originalConsole.current.log('📄 Logs exported to JSON file');
  };

  const filteredLogs = filterLevel === 'ALL' ? logs : logs.filter(log => log.level === filterLevel);
  const formattedLogs = filteredLogs.map(log =>
    `[${log.timestamp}] ${log.level}: ${log.message}`
  ).join('\n');

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-background border shadow-lg"
        >
          📋 Logs
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 max-h-96 overflow-hidden shadow-xl">
        <div className="p-3 border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Log Capture</h3>
            <div className="flex items-center gap-1">
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="text-xs px-2 py-1 bg-background border rounded"
                title="Filter log level"
              >
                <option value="ALL">All</option>
                <option value="LOG">Log</option>
                <option value="ERROR">Error</option>
                <option value="WARN">Warn</option>
                <option value="INFO">Info</option>
              </select>
              <Button
                onClick={copyLogs}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                title="Copy logs"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                onClick={exportLogs}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                title="Export as JSON"
              >
                📄
              </Button>
              <Button
                onClick={clearLogs}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                title="Clear logs"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                title="Close"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Button
              onClick={isCapturing ? stopCapture : startCapture}
              size="sm"
              variant={isCapturing ? "destructive" : "default"}
              className="text-xs"
            >
              {isCapturing ? '🛑 Stop' : '🎬 Start'} Capture
            </Button>
                            <span className="text-xs text-muted-foreground">
                  {filteredLogs.length} / {logs.length} entries
                </span>
          </div>
        </div>

        <div className="p-3">
          <Textarea
            ref={textareaRef}
            value={formattedLogs}
            readOnly
            className="h-64 font-mono text-xs resize-none"
            placeholder="Click 'Start Capture' to begin logging..."
          />
        </div>
      </Card>
    </div>
  );
}
