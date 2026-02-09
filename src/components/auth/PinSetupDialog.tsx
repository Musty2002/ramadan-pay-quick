import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Delete, Lock, Check, AlertCircle } from 'lucide-react';

interface PinSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  isRequired?: boolean;
  pinLength?: number;
  title?: string;
  description?: string;
}

const PIN_HASH_KEY = 'user_pin_hash';
const TRANSACTION_PIN_HASH_KEY = 'transaction_pin_hash';

// Simple hash function for PIN (for local storage only, not for sensitive data)
// Falls back to a basic hash if crypto.subtle is unavailable (older Android WebViews)
async function hashPin(pin: string): Promise<string> {
  const saltedPin = pin + 'sm_data_salt_2024';
  
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(saltedPin);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('crypto.subtle unavailable, using fallback hash');
  }
  
  // Fallback: simple string hash for older devices without crypto.subtle
  let hash = 0;
  for (let i = 0; i < saltedPin.length; i++) {
    const char = saltedPin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'fallback_' + Math.abs(hash).toString(16).padStart(8, '0');
}

export async function verifyStoredPin(pin: string): Promise<boolean> {
  const storedHash = localStorage.getItem(PIN_HASH_KEY);
  if (!storedHash) return false;
  const inputHash = await hashPin(pin);
  return storedHash === inputHash;
}

export function isPinSetup(): boolean {
  return !!localStorage.getItem(PIN_HASH_KEY);
}

export function clearStoredPin(): void {
  localStorage.removeItem(PIN_HASH_KEY);
}

// Transaction PIN functions
export async function verifyTransactionPin(pin: string): Promise<boolean> {
  const storedHash = localStorage.getItem(TRANSACTION_PIN_HASH_KEY);
  if (!storedHash) return false;
  const inputHash = await hashPin(pin);
  return storedHash === inputHash;
}

export function isTransactionPinSetup(): boolean {
  return !!localStorage.getItem(TRANSACTION_PIN_HASH_KEY);
}

export function clearTransactionPin(): void {
  localStorage.removeItem(TRANSACTION_PIN_HASH_KEY);
}

export async function saveTransactionPin(pin: string): Promise<void> {
  const hashedPin = await hashPin(pin);
  localStorage.setItem(TRANSACTION_PIN_HASH_KEY, hashedPin);
}

export function PinSetupDialog({ 
  open, 
  onOpenChange, 
  onComplete, 
  isRequired = false,
  pinLength = 6,
  title,
  description
}: PinSetupDialogProps) {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const currentPin = step === 'create' ? pin : confirmPin;
  const setCurrentPin = step === 'create' ? setPin : setConfirmPin;

  const handlePinInput = (digit: string) => {
    if (currentPin.length < pinLength) {
      const newPin = currentPin + digit;
      setCurrentPin(newPin);
      setError('');

      // Auto-proceed when all digits entered
      if (newPin.length === pinLength) {
        if (step === 'create') {
          setTimeout(() => setStep('confirm'), 200);
        } else {
          handleConfirm(newPin);
        }
      }
    }
  };

  const handleDelete = () => {
    setCurrentPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleConfirm = async (finalConfirmPin: string) => {
    if (pin !== finalConfirmPin) {
      setError('PINs do not match. Please try again.');
      setPin('');
      setConfirmPin('');
      setStep('create');
      return;
    }

    setLoading(true);
    try {
      const hashedPin = await hashPin(pin);
      localStorage.setItem(PIN_HASH_KEY, hashedPin);
      onComplete();
      onOpenChange(false);
      resetState();
    } catch (err) {
      setError('Failed to save PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setStep('create');
    setPin('');
    setConfirmPin('');
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    if (!isRequired) {
      onOpenChange(false);
      resetState();
    }
  };

  const pinDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const displayTitle = title || (step === 'create' ? 'Create Your PIN' : 'Confirm Your PIN');
  const displayDescription = description || (step === 'create'
    ? `Enter a ${pinLength}-digit PIN to secure your app`
    : 'Re-enter your PIN to confirm');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center">
            {displayTitle}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 'create' ? displayDescription : 'Re-enter your PIN to confirm'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* PIN Display */}
          <div className="flex justify-center gap-2 mb-6">
            {[...Array(pinLength)].map((_, i) => (
              <div
                key={i}
                className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                  i < currentPin.length
                    ? 'bg-secondary border-secondary'
                    : i === currentPin.length
                    ? 'border-primary'
                    : 'border-muted bg-muted/30'
                }`}
              >
                {i < currentPin.length && (
                  <div className="w-3 h-3 rounded-full bg-foreground" />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-destructive text-sm mb-4">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3 max-w-[200px] mx-auto">
            {pinDigits.map((digit) => (
              <button
                key={digit}
                onClick={() => handlePinInput(String(digit))}
                disabled={loading}
                className="w-14 h-14 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-xl font-semibold text-foreground transition-all active:scale-95"
              >
                {digit}
              </button>
            ))}
            
            {/* Bottom row */}
            <button
              onClick={handleDelete}
              disabled={loading || currentPin.length === 0}
              className="w-14 h-14 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
            >
              <Delete className="w-5 h-5 text-foreground" />
            </button>
            
            <button
              onClick={() => handlePinInput('0')}
              disabled={loading}
              className="w-14 h-14 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-xl font-semibold text-foreground transition-all active:scale-95"
            >
              0
            </button>
            
            <button
              onClick={() => step === 'confirm' && currentPin.length === pinLength && handleConfirm(currentPin)}
              disabled={loading || currentPin.length !== pinLength}
              className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
            >
              <Check className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>

          {step === 'confirm' && (
            <button
              onClick={() => {
                setStep('create');
                setPin('');
                setConfirmPin('');
                setError('');
              }}
              className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground"
            >
              Start over
            </button>
          )}
        </div>

        {!isRequired && (
          <Button variant="ghost" onClick={handleClose} className="w-full">
            Skip for now
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Transaction PIN Setup Dialog (4-digit)
interface TransactionPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  isRequired?: boolean;
}

export function TransactionPinDialog({ 
  open, 
  onOpenChange, 
  onComplete, 
  isRequired = false 
}: TransactionPinDialogProps) {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const pinLength = 4;
  const currentPin = step === 'create' ? pin : confirmPin;
  const setCurrentPin = step === 'create' ? setPin : setConfirmPin;

  const handlePinInput = (digit: string) => {
    if (currentPin.length < pinLength) {
      const newPin = currentPin + digit;
      setCurrentPin(newPin);
      setError('');

      if (newPin.length === pinLength) {
        if (step === 'create') {
          setTimeout(() => setStep('confirm'), 200);
        } else {
          handleConfirm(newPin);
        }
      }
    }
  };

  const handleDelete = () => {
    setCurrentPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleConfirm = async (finalConfirmPin: string) => {
    if (pin !== finalConfirmPin) {
      setError('PINs do not match. Please try again.');
      setPin('');
      setConfirmPin('');
      setStep('create');
      return;
    }

    setLoading(true);
    try {
      await saveTransactionPin(pin);
      onComplete();
      onOpenChange(false);
      resetState();
    } catch (err) {
      setError('Failed to save PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setStep('create');
    setPin('');
    setConfirmPin('');
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    if (!isRequired) {
      onOpenChange(false);
      resetState();
    }
  };

  const pinDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center">
            {step === 'create' ? 'Create Transaction PIN' : 'Confirm Transaction PIN'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 'create' 
              ? 'Enter a 4-digit PIN for transactions'
              : 'Re-enter your PIN to confirm'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* PIN Display */}
          <div className="flex justify-center gap-3 mb-6">
            {[...Array(pinLength)].map((_, i) => (
              <div
                key={i}
                className={`w-12 h-14 rounded-lg border-2 flex items-center justify-center transition-all ${
                  i < currentPin.length
                    ? 'bg-secondary border-secondary'
                    : i === currentPin.length
                    ? 'border-primary'
                    : 'border-muted bg-muted/30'
                }`}
              >
                {i < currentPin.length && (
                  <div className="w-3 h-3 rounded-full bg-foreground" />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-destructive text-sm mb-4">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3 max-w-[200px] mx-auto">
            {pinDigits.map((digit) => (
              <button
                key={digit}
                onClick={() => handlePinInput(String(digit))}
                disabled={loading}
                className="w-14 h-14 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-xl font-semibold text-foreground transition-all active:scale-95"
              >
                {digit}
              </button>
            ))}
            
            <button
              onClick={handleDelete}
              disabled={loading || currentPin.length === 0}
              className="w-14 h-14 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
            >
              <Delete className="w-5 h-5 text-foreground" />
            </button>
            
            <button
              onClick={() => handlePinInput('0')}
              disabled={loading}
              className="w-14 h-14 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-xl font-semibold text-foreground transition-all active:scale-95"
            >
              0
            </button>
            
            <button
              onClick={() => step === 'confirm' && currentPin.length === pinLength && handleConfirm(currentPin)}
              disabled={loading || currentPin.length !== pinLength}
              className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
            >
              <Check className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>

          {step === 'confirm' && (
            <button
              onClick={() => {
                setStep('create');
                setPin('');
                setConfirmPin('');
                setError('');
              }}
              className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground"
            >
              Start over
            </button>
          )}
        </div>

        {!isRequired && (
          <Button variant="ghost" onClick={handleClose} className="w-full">
            Skip for now
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
