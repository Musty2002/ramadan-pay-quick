import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Delete, Lock, Check, AlertCircle, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { saveTransactionPin } from './PinSetupDialog';

interface ForgotTransactionPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  userEmail?: string;
}

type Step = 'email' | 'code' | 'newPin' | 'confirmPin';

export function ForgotTransactionPinDialog({ 
  open, 
  onOpenChange, 
  onComplete,
  userEmail 
}: ForgotTransactionPinDialogProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(userEmail || '');
  const [code, setCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetState = () => {
    setStep('email');
    setEmail(userEmail || '');
    setCode('');
    setNewPin('');
    setConfirmPin('');
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetState();
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('send-pin-reset-code', {
        body: { email: email.trim().toLowerCase() }
      });

      if (data?.success) {
        toast.success('Verification code sent to your email');
        setStep('code');
      } else if (data?.error) {
        setError(data.error);
      } else if (invokeError) {
        throw invokeError;
      } else {
        setError('Failed to send verification code');
      }
    } catch (err: any) {
      console.error('Error sending reset code:', err);
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('verify-pin-reset-code', {
        body: { email: email.trim().toLowerCase(), code }
      });

      if (data?.success) {
        toast.success('Code verified');
        setStep('newPin');
      } else if (data?.error) {
        setError(data.error);
      } else if (invokeError) {
        throw invokeError;
      } else {
        setError('Invalid verification code');
      }
    } catch (err: any) {
      console.error('Error verifying code:', err);
      setError(err.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handlePinInput = (digit: string, isConfirm: boolean) => {
    const currentPin = isConfirm ? confirmPin : newPin;
    const setCurrentPin = isConfirm ? setConfirmPin : setNewPin;

    if (currentPin.length < 4) {
      const updated = currentPin + digit;
      setCurrentPin(updated);
      setError('');

      if (updated.length === 4) {
        if (!isConfirm) {
          setTimeout(() => setStep('confirmPin'), 200);
        } else {
          handleConfirmPin(updated);
        }
      }
    }
  };

  const handleDelete = (isConfirm: boolean) => {
    const setCurrentPin = isConfirm ? setConfirmPin : setNewPin;
    setCurrentPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleConfirmPin = async (finalPin: string) => {
    if (newPin !== finalPin) {
      setError('PINs do not match. Please try again.');
      setNewPin('');
      setConfirmPin('');
      setStep('newPin');
      return;
    }

    setLoading(true);
    try {
      await saveTransactionPin(newPin);
      toast.success('Transaction PIN reset successfully');
      onComplete();
      handleClose();
    } catch (err) {
      setError('Failed to save new PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pinDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const currentPin = step === 'confirmPin' ? confirmPin : newPin;
  const isConfirmStep = step === 'confirmPin';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {step === 'email' ? (
              <Mail className="w-8 h-8 text-primary" />
            ) : (
              <Lock className="w-8 h-8 text-primary" />
            )}
          </div>
          <DialogTitle className="text-center">
            {step === 'email' && 'Reset Transaction PIN'}
            {step === 'code' && 'Enter Verification Code'}
            {step === 'newPin' && 'Create New PIN'}
            {step === 'confirmPin' && 'Confirm New PIN'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 'email' && 'Enter your email to receive a verification code'}
            {step === 'code' && 'Enter the 6-digit code sent to your email'}
            {step === 'newPin' && 'Enter a new 4-digit transaction PIN'}
            {step === 'confirmPin' && 'Re-enter your new PIN to confirm'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 'email' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button onClick={handleSendCode} className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </div>
          )}

          {step === 'code' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verify-code">Verification Code</Label>
                <Input
                  id="verify-code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(val);
                    setError('');
                  }}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  disabled={loading}
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button onClick={handleVerifyCode} className="w-full" disabled={loading || code.length !== 6}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>

              <Button 
                variant="ghost" 
                onClick={() => setStep('email')} 
                className="w-full"
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to email
              </Button>

              <button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                Didn't receive the code? Send again
              </button>
            </div>
          )}

          {(step === 'newPin' || step === 'confirmPin') && (
            <>
              {/* PIN Display */}
              <div className="flex justify-center gap-3 mb-6">
                {[...Array(4)].map((_, i) => (
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
                    onClick={() => handlePinInput(String(digit), isConfirmStep)}
                    disabled={loading}
                    className="w-14 h-14 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-xl font-semibold text-foreground transition-all active:scale-95"
                  >
                    {digit}
                  </button>
                ))}
                
                <button
                  onClick={() => handleDelete(isConfirmStep)}
                  disabled={loading || currentPin.length === 0}
                  className="w-14 h-14 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
                >
                  <Delete className="w-5 h-5 text-foreground" />
                </button>
                
                <button
                  onClick={() => handlePinInput('0', isConfirmStep)}
                  disabled={loading}
                  className="w-14 h-14 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-xl font-semibold text-foreground transition-all active:scale-95"
                >
                  0
                </button>
                
                <button
                  onClick={() => isConfirmStep && currentPin.length === 4 && handleConfirmPin(currentPin)}
                  disabled={loading || currentPin.length !== 4}
                  className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
                  ) : (
                    <Check className="w-5 h-5 text-primary-foreground" />
                  )}
                </button>
              </div>

              {step === 'confirmPin' && (
                <button
                  onClick={() => {
                    setStep('newPin');
                    setNewPin('');
                    setConfirmPin('');
                    setError('');
                  }}
                  className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground"
                >
                  Start over
                </button>
              )}
            </>
          )}
        </div>

        <Button variant="ghost" onClick={handleClose} className="w-full">
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}