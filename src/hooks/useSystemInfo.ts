import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { SystemSnapshot, Toast } from '../types';

let toastId = 0;

export function useSystemInfo(pollInterval = 2000) {
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const fetch = useCallback(async () => {
    try {
      const data = await invoke<SystemSnapshot>('get_system_snapshot');
      if (mountedRef.current) {
        setSnapshot(data);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(String(err));
      }
    }
  }, []);

  const killProcess = useCallback(async (pid: number) => {
    try {
      await invoke('kill_process', { pid });
      addToast(`Process ${pid} terminated`, 'success');
      fetch();
    } catch (err) {
      addToast(`Failed to kill ${pid}: ${err}`, 'error');
    }
  }, [fetch, addToast]);

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    intervalRef.current = setInterval(fetch, pollInterval);
    return () => {
      mountedRef.current = false;
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetch, pollInterval]);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { snapshot, error, toasts, killProcess, dismissToast, addToast };
}
