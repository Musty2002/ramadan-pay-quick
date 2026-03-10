import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const KEEP_ALIVE_INTERVAL = 4 * 60 * 1000; // 4 minutes (before 5-minute timeout)

export function useKeepAlive() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const pingBackend = async () => {
      try {
        await supabase.functions.invoke('keep-alive');
        console.log('[Keep-Alive] Backend pinged successfully');
      } catch (error) {
        console.log('[Keep-Alive] Ping failed:', error);
      }
    };

    // Initial ping
    pingBackend();

    // Set up interval
    intervalRef.current = setInterval(pingBackend, KEEP_ALIVE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}
