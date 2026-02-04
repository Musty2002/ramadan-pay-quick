import { useCallback, useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { 
  BiometricAuth, 
  BiometryType, 
  CheckBiometryResult,
  AuthenticateOptions
} from '@aparajita/capacitor-biometric-auth';

interface BiometricState {
  isAvailable: boolean;
  biometryType: BiometryType;
  biometryTypes: BiometryType[];
  isEnabled: boolean;
  reason: string;
}

const BIOMETRIC_ENABLED_KEY = 'biometric_auth_enabled';
const BIOMETRIC_USER_KEY = 'biometric_auth_user';
const LAST_USER_EMAIL_KEY = 'last_logged_in_user';

export function useBiometricAuth() {
  const [biometricState, setBiometricState] = useState<BiometricState>({
    isAvailable: false,
    biometryType: BiometryType.none,
    biometryTypes: [],
    isEnabled: false,
    reason: ''
  });
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkBiometryAvailability();
  }, []);

  const checkBiometryAvailability = async () => {
    setIsChecking(true);
    
    if (Capacitor.getPlatform() === 'web') {
      setBiometricState(prev => ({
        ...prev,
        isAvailable: false,
        reason: 'Biometric auth is only available on native devices'
      }));
      setIsChecking(false);
      return;
    }

    try {
      // Wrap in try-catch to handle plugin unavailability
      const result: CheckBiometryResult = await BiometricAuth.checkBiometry();
      
      // Auto-enable biometric if available and not explicitly disabled
      const storedEnabled = localStorage.getItem(BIOMETRIC_ENABLED_KEY);
      const isEnabled = storedEnabled === null ? result.isAvailable : storedEnabled === 'true';
      
      // Auto-save the enabled state if it wasn't set before
      if (storedEnabled === null && result.isAvailable) {
        localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      }
      
      setBiometricState({
        isAvailable: result.isAvailable,
        biometryType: result.biometryType,
        biometryTypes: result.biometryTypes || [result.biometryType],
        isEnabled: isEnabled && result.isAvailable,
        reason: result.reason || ''
      });
    } catch (error: any) {
      console.error('Error checking biometry:', error);
      // Gracefully handle when biometric plugin isn't available
      setBiometricState(prev => ({
        ...prev,
        isAvailable: false,
        isEnabled: false,
        reason: error?.message || 'Biometric auth unavailable'
      }));
    } finally {
      setIsChecking(false);
    }
  };

  const getBiometryName = useCallback((): string => {
    switch (biometricState.biometryType) {
      case BiometryType.faceId:
        return 'Face ID';
      case BiometryType.touchId:
        return 'Touch ID';
      case BiometryType.fingerprintAuthentication:
        return 'Fingerprint';
      case BiometryType.faceAuthentication:
        return 'Face Recognition';
      case BiometryType.irisAuthentication:
        return 'Iris';
      default:
        return 'Biometric';
    }
  }, [biometricState.biometryType]);

  const authenticate = useCallback(async (reason?: string): Promise<boolean> => {
    if (!biometricState.isAvailable) {
      return false;
    }

    try {
      const options: AuthenticateOptions = {
        reason: reason || `Log in with ${getBiometryName()}`,
        cancelTitle: 'Use Password',
        allowDeviceCredential: true,
        iosFallbackTitle: 'Use Passcode',
        androidTitle: 'Biometric Login',
        androidSubtitle: 'Verify your identity',
        androidConfirmationRequired: false
      };

      await BiometricAuth.authenticate(options);
      return true;
    } catch (error: any) {
      // Don't log user cancellations as errors
      if (error?.code !== 'userCancel' && error?.code !== 'userCanceled') {
        console.log('Biometric auth failed:', error?.message);
      }
      return false;
    }
  }, [biometricState.isAvailable, getBiometryName]);

  const enableBiometricAuth = useCallback(async (userEmail: string): Promise<boolean> => {
    if (!biometricState.isAvailable) {
      return false;
    }

    // Verify identity before enabling
    const verified = await authenticate('Verify your identity to enable biometric login');
    
    if (verified) {
      localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      localStorage.setItem(BIOMETRIC_USER_KEY, userEmail);
      localStorage.setItem(LAST_USER_EMAIL_KEY, userEmail);
      setBiometricState(prev => ({ ...prev, isEnabled: true }));
      return true;
    }
    
    return false;
  }, [biometricState.isAvailable, authenticate]);

  const disableBiometricAuth = useCallback(() => {
    localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
    localStorage.removeItem(BIOMETRIC_USER_KEY);
    setBiometricState(prev => ({ ...prev, isEnabled: false }));
  }, []);

  const getBiometricUser = useCallback((): string | null => {
    return localStorage.getItem(BIOMETRIC_USER_KEY);
  }, []);

  const getLastLoggedInUser = useCallback((): string | null => {
    return localStorage.getItem(LAST_USER_EMAIL_KEY);
  }, []);

  const setLastLoggedInUser = useCallback((email: string) => {
    localStorage.setItem(LAST_USER_EMAIL_KEY, email);
    // Also set as biometric user if biometric is enabled
    if (biometricState.isEnabled) {
      localStorage.setItem(BIOMETRIC_USER_KEY, email);
    }
  }, [biometricState.isEnabled]);

  const clearLastLoggedInUser = useCallback(() => {
    localStorage.removeItem(LAST_USER_EMAIL_KEY);
    localStorage.removeItem(BIOMETRIC_USER_KEY);
  }, []);

  const authenticateAndGetUser = useCallback(async (): Promise<string | null> => {
    if (!biometricState.isEnabled) {
      return null;
    }

    const verified = await authenticate();
    
    if (verified) {
      return getBiometricUser() || getLastLoggedInUser();
    }
    
    return null;
  }, [biometricState.isEnabled, authenticate, getBiometricUser, getLastLoggedInUser]);

  return {
    isAvailable: biometricState.isAvailable,
    isEnabled: biometricState.isEnabled,
    biometryType: biometricState.biometryType,
    biometryName: getBiometryName(),
    isChecking,
    reason: biometricState.reason,
    authenticate,
    enableBiometricAuth,
    disableBiometricAuth,
    getBiometricUser,
    getLastLoggedInUser,
    setLastLoggedInUser,
    clearLastLoggedInUser,
    authenticateAndGetUser,
    checkBiometryAvailability
  };
}
