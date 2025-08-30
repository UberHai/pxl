'use client';

import { useProjectStore } from '@/state/useProjectStore';

export function DebugPanel() {
  const store = useProjectStore();
  console.log('🔍 DEBUG PANEL - Full store object:', store);
  
  return (
    <div className="fixed top-4 right-4 bg-red-900 text-white p-4 rounded-lg max-w-md text-xs font-mono z-50 opacity-90">
      <h3 className="font-bold mb-2">🔍 DEBUG PANEL</h3>
      <div className="space-y-1">
        <div>Store exists: {store ? '✅' : '❌'}</div>
        <div>Project exists: {store?.project ? '✅' : '❌'}</div>
        <div>UI exists: {store?.ui ? '✅' : '❌'}</div>
        <div>Meta exists: {store?.project?.meta ? '✅' : '❌'}</div>
        {store?.project?.meta && (
          <div>BPM: {store.project.meta.bpm}</div>
        )}
        <div>Tracks: {store?.project?.tracks?.length || 0}</div>
      </div>
      <button 
        onClick={() => console.log('Full store state:', store)}
        className="mt-2 bg-red-700 px-2 py-1 rounded text-xs"
      >
        Log Full State
      </button>
    </div>
  );
}
