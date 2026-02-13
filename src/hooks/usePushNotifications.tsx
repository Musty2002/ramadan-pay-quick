import { useEffect, useState, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const FCM_TOKEN_KEY = 'fcm_token';
const NOTIFICATIONS_ENABLED_KEY = 'notifications_enabled';

export function usePushNotifications() {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const initRef = useRef(false);

  // Load enabled state from storage
  useEffect(() => {
    const storedEnabled = localStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    if (storedEnabled === null) {
      localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
      setIsEnabled(true);
    } else {
      setIsEnabled(storedEnabled === 'true');
    }
  }, []);

  // Save token to database
  const saveTokenToDatabase = useCallback(async (token: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Use raw query to upsert since the types may not be updated yet
      const { error } = await supabase
        .from('push_subscriptions' as any)
        .upsert(
          {
            endpoint: token,
            user_id: user?.id || null,
            device_info: {
              platform: Capacitor.getPlatform(),
              isNative: Capacitor.isNativePlatform(),
            },
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'endpoint' }
        );

      if (error) {
        console.error('Failed to save push token to database:', error);
      } else {
        console.log('Push token saved to database');
      }
    } catch (err) {
      console.error('Error saving token to database:', err);
    }
  }, []);

  // Initialize push notifications
  const initPush = useCallback(async () => {
    // Guard against non-native platforms early
    if (!Capacitor.isNativePlatform()) {
      console.log('[PushNotifications] Not a native platform, skipping');
      return;
    }
    
    console.log('[PushNotifications] initPush called', {
      isNative: Capacitor.isNativePlatform(),
      platform: Capacitor.getPlatform(),
      initRefCurrent: initRef.current,
      isInitializing
    });
    
    if (initRef.current || isInitializing) {
      console.log('[PushNotifications] Already initialized or initializing, skipping');
      return;
    }

    initRef.current = true;
    setIsInitializing(true);

    try {
      console.log('[PushNotifications] Importing Capacitor plugins...');
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      console.log('[PushNotifications] Plugins imported successfully');

      // Create default notification channel for Android with app icon
      if (Capacitor.getPlatform() === 'android') {
        try {
          await LocalNotifications.createChannel({
            id: 'default',
            name: 'Default Notifications',
            description: 'Default notification channel',
            importance: 5,
            visibility: 1,
            sound: 'default',
            vibration: true,
          });
          console.log('[PushNotifications] Android notification channel created');
          
          // Also create a channel for push notifications with the small icon
          await LocalNotifications.createChannel({
            id: 'push_notifications',
            name: 'Push Notifications',
            description: 'Push notifications from SM Data Sub',
            importance: 5,
            visibility: 1,
            sound: 'default',
            vibration: true,
          });
        } catch (channelError) {
          console.warn('[PushNotifications] Failed to create notification channel:', channelError);
        }
      }

      // Request local notification permission
      const localPermStatus = await LocalNotifications.checkPermissions();
      if (localPermStatus.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }

      // Request push notification permission
      console.log('[PushNotifications] Checking push permissions...');
      let permStatus = await PushNotifications.checkPermissions();
      console.log('[PushNotifications] Current permission status:', permStatus);
      
      if (permStatus.receive === 'prompt') {
        console.log('[PushNotifications] Requesting push permissions...');
        permStatus = await PushNotifications.requestPermissions();
        console.log('[PushNotifications] Permission result:', permStatus);
      }

      if (permStatus.receive !== 'granted') {
        console.log('[PushNotifications] Push notification permission denied');
        setIsInitializing(false);
        return;
      }

      // Remove existing listeners
      console.log('[PushNotifications] Removing existing listeners...');
      await PushNotifications.removeAllListeners();

      // On registration success
      await PushNotifications.addListener('registration', async (token) => {
        console.log('[PushNotifications] Registration success, FCM token:', token.value);
        setPushToken(token.value);
        setIsRegistered(true);
        localStorage.setItem(FCM_TOKEN_KEY, token.value);
        
        // Save to database
        console.log('[PushNotifications] Saving token to database...');
        await saveTokenToDatabase(token.value);
        console.log('[PushNotifications] Token saved to database');
      });

      // On registration error
      await PushNotifications.addListener('registrationError', (error) => {
        console.error('[PushNotifications] Registration error:', JSON.stringify(error));
        setIsInitializing(false);
      });

      // Handle push notification received in foreground
      await PushNotifications.addListener('pushNotificationReceived', async (notification) => {
        console.log('Push received in foreground:', notification);
        
        // Show local notification
        try {
          await LocalNotifications.schedule({
            notifications: [{
              title: notification.title || 'Notification',
              body: notification.body || '',
              id: Math.floor(Math.random() * 100000),
              schedule: { at: new Date(Date.now() + 100) },
              sound: 'default',
              channelId: 'default',
              smallIcon: 'ic_stat_notification',
              largeIcon: 'ic_launcher',
              extra: notification.data,
            }],
          });
        } catch (localError) {
          console.warn('Failed to show local notification:', localError);
          toast.info(notification.title || 'New notification', {
            description: notification.body,
          });
        }
      });

      // Handle push notification action (user tapped)
      await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed:', notification);
        const data = notification.notification.data;
        if (data?.route) {
          window.location.href = data.route;
        }
      });

      // Register for push notifications
      console.log('[PushNotifications] Calling PushNotifications.register()...');
      await PushNotifications.register();
      console.log('[PushNotifications] PushNotifications.register() completed - waiting for registration callback');

    } catch (error) {
      console.error('[PushNotifications] Failed to initialize:', error);
    } finally {
      setIsInitializing(false);
    }
  }, [saveTokenToDatabase, isInitializing]);

  // Initialize on mount
  useEffect(() => {
    console.log('[PushNotifications] Mount effect running', {
      isNative: Capacitor.isNativePlatform(),
      platform: Capacitor.getPlatform(),
    });

    // Check for stored token
    const storedToken = localStorage.getItem(FCM_TOKEN_KEY);
    if (storedToken) {
      console.log('[PushNotifications] Found stored token:', storedToken.substring(0, 20) + '...');
      setPushToken(storedToken);
      setIsRegistered(true);

      // Important: ensure the token is persisted to the backend even if
      // the native registration callback doesn't fire on subsequent launches.
      (async () => {
        console.log('[PushNotifications] Syncing stored token to database...');
        await saveTokenToDatabase(storedToken);
      })();
    }

    // Only initialize on native platforms
    if (Capacitor.isNativePlatform()) {
      console.log('[PushNotifications] Initializing on native platform...');
      initPush();
    }
  }, [initPush, saveTokenToDatabase]);

  // When the user logs in/out, re-save the token so the subscription is linked
  // to the authenticated user_id (instead of staying anonymous).
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (!pushToken) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        console.log('[PushNotifications] Auth changed, re-syncing token to database...');
        saveTokenToDatabase(pushToken);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [pushToken, saveTokenToDatabase]);

  // Enable/disable notifications
  const setNotificationsEnabled = useCallback((enabled: boolean) => {
    localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled ? 'true' : 'false');
    setIsEnabled(enabled);
  }, []);

  // Re-register when user logs in
  const registerForPush = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      initRef.current = false;
      await initPush();
    }
  }, [initPush]);

  // Send local notification (for testing or in-app use)
  const sendLocalNotification = useCallback(async (options: {
    title: string;
    body: string;
    id?: number;
    schedule?: { at: Date };
    data?: Record<string, unknown>;
  }) => {
    if (!isEnabled) return;

    if (!Capacitor.isNativePlatform()) {
      toast.info(options.title, { description: options.body });
      return;
    }

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      await LocalNotifications.schedule({
        notifications: [{
          title: options.title,
          body: options.body,
          id: options.id || Math.floor(Math.random() * 100000),
          schedule: options.schedule || { at: new Date(Date.now() + 100) },
          sound: 'default',
          channelId: 'default',
          smallIcon: 'ic_stat_notification',
          largeIcon: 'ic_launcher',
          extra: options.data,
        }],
      });
    } catch (error) {
      console.error('Failed to send local notification:', error);
      toast.info(options.title, { description: options.body });
    }
  }, [isEnabled]);

  // Cancel a notification
  const cancelNotification = useCallback(async (id: number) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }, []);

  // Cancel all notifications
  const cancelAllNotifications = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }, []);

  return {
    pushToken,
    isRegistered,
    isEnabled,
    isInitializing,
    setNotificationsEnabled,
    registerForPush,
    sendLocalNotification,
    cancelNotification,
    cancelAllNotifications,
  };
}
