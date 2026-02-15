import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sirsmarewaltd.smdatasub',
  appName: 'SM Data Sub',
  webDir: 'dist',
  // Remove server.url to run standalone from bundled assets
  // Uncomment below for live reload during development:
  // server: {
  //   url: 'https://d2cb5510-3dc0-48ea-b38d-d0717d79ec9f.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0ea5e9',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0ea5e9'
    },
    Keyboard: {
      resize: 'none',
      resizeOnFullScreen: false
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
