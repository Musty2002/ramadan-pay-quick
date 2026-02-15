import { ShieldX, Mail, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BlockedUserScreenProps {
  reason?: string | null;
  onSignOut: () => void;
}

export function BlockedUserScreen({ reason, onSignOut }: BlockedUserScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-destructive">Account Suspended</CardTitle>
          <CardDescription className="text-muted-foreground">
            Your account has been suspended due to a policy violation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {reason && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm font-medium text-foreground mb-1">Reason:</p>
              <p className="text-sm text-muted-foreground">{reason}</p>
            </div>
          )}

          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              If you believe this is a mistake, please contact our support team for assistance.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = 'mailto:smdatasub.ng@gmail.com?subject=Account%20Suspension%20Appeal'}
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={onSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
