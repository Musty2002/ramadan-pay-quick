import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

export function useLoginTracking() {
  const trackLogin = useCallback(async (userId: string) => {
    try {
      let platform: 'android' | 'ios' | 'web' = 'web';
      let deviceInfo: Record<string, unknown> = {};

      // Check if running in Capacitor (native app)
      if (Capacitor.isNativePlatform()) {
        const nativePlatform = Capacitor.getPlatform();
        platform = nativePlatform === 'ios' ? 'ios' : 'android';
        
        // Get detailed device info
        try {
          const info = await Device.getInfo();
          const deviceId = await Device.getId();
          deviceInfo = {
            model: info.model,
            manufacturer: info.manufacturer,
            osVersion: info.osVersion,
            platform: info.platform,
            isVirtual: info.isVirtual,
            deviceId: deviceId.identifier,
          };
        } catch (e) {
          console.log('Could not get device info:', e);
        }
      } else {
        // Web browser - get browser info
        const userAgent = navigator.userAgent;
        deviceInfo = {
          userAgent,
          language: navigator.language,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
        };
      }

      // Insert login session using raw insert to bypass type issues
      const { error } = await supabase
        .from('login_sessions')
        .insert({
          user_id: userId,
          platform,
          device_info: deviceInfo as Record<string, unknown>,
          user_agent: navigator.userAgent,
        } as never);

      if (error) {
        console.error('Failed to track login:', error);
      }
    } catch (e) {
      console.error('Login tracking error:', e);
    }
  }, []);

  return { trackLogin };
}
