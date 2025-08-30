'use client';

import { useEffect } from 'react';

export function ClearStorage() {
  useEffect(() => {
    // Clear any potentially corrupted Zustand state
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('chipstudio-v1');
        sessionStorage.clear();
        console.log('🧹 Cleared localStorage and sessionStorage');
      } catch (error) {
        console.warn('Could not clear storage:', error);
      }
    }
  }, []);

  return null;
}
