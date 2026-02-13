import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';

const emailSchema = z.string().email('Please enter a valid email address');

type Step = 'email' | 'otp' | 'password' | 'success';

export function ForgotPasswordDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error: fnError } = await supabase.functions.invoke('send-password-reset', {
        body: { email },
      });
      if (fnError) {
        toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong. Please try again.' });
      } else {
        setStep('otp');
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-password-reset', {
        body: { email, code: otp, newPassword: password },
      });

      if (fnError || data?.error) {
        const msg = data?.error || 'Something went wrong. Please try again.';
        setError(msg);
      } else {
        setStep('success');
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setEmail('');
      setOtp('');
      setPassword('');
      setConfirmPassword('');
      setStep('email');
      setError('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <button type="button" className="text-sm text-primary hover:underline font-medium">
          Forgot password?
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {step === 'success' ? (
          <div className="text-center py-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <DialogHeader>
              <DialogTitle className="text-center">Password Reset Successful</DialogTitle>
              <DialogDescription className="text-center">
                Your password has been updated. You can now log in with your new password.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={handleClose} className="mt-6 w-full">Done</Button>
          </div>
        ) : step === 'email' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" /> Reset your password
              </DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you a verification code.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendCode} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="reset-email">Email address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className={error ? 'border-destructive' : ''}
                />
                {error && <p className="text-xs text-destructive mt-1">{error}</p>}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Sending...' : 'Send code'}
                </Button>
              </div>
            </form>
          </>
        ) : step === 'otp' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" /> Enter verification code
              </DialogTitle>
              <DialogDescription>
                We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {error && <p className="text-xs text-destructive text-center">{error}</p>}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => { setStep('email'); setOtp(''); setError(''); }} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={() => { if (otp.length === 6) { setStep('password'); setError(''); } }}
                  disabled={otp.length !== 6}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
              <button
                type="button"
                onClick={handleSendCode as any}
                className="text-sm text-primary hover:underline w-full text-center"
              >
                {loading ? 'Sending...' : 'Resend code'}
              </button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" /> Set new password
              </DialogTitle>
              <DialogDescription>Enter your new password below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleVerifyAndReset} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirm-new-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-xs text-destructive mt-1">{error}</p>}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => { setStep('otp'); setError(''); }} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Updating...' : 'Reset Password'}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
