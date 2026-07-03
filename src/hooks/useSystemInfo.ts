import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { SystemSnapshot } from '../types';

const POLL_INTERVAL = 2000;

export function useSystemInfo() {
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const fetch = useCallback(async () => {
    try {
      const data = await invoke<SystemSnapshot>('get_system_snapshot');
      setSnapshot(data);
      setError(null);
    } catch (err) {
      setError(String(err));
    }
  }, []);

  const killProcess = useCallback(async (pid: number) => {
    try {
      await invoke('kill_process', { pid });
      fetch();
    } catch (err) {
      setError(String(err));
    }
  }, [fetch]);

  useEffect(() => {
    fetch();
    intervalRef.current = window.setInterval(fetch, POLL_INTERVAL);
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetch]);

  return { snapshot, error, killProcess };
}
