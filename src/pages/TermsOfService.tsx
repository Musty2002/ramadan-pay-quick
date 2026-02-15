import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
  const navigate = useNavigate();
  const lastUpdated = 'February 15, 2026';

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center gap-4 px-4 py-4 max-w-3xl mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Terms of Service</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 pb-20">
        <div className="prose prose-sm max-w-none text-foreground">
          <p className="text-muted-foreground text-sm mb-6">Last updated: {lastUpdated}</p>

          <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
          <p className="mb-4 text-sm leading-relaxed">
            By downloading, installing, or using SM Data Sub ("App"), you agree to be bound by these Terms of Service. 
            The App is operated by Sir Smarewa Ltd (RC: 9198148). If you do not agree to these terms, do not use the App.
          </p>

          <h2 className="text-xl font-bold mb-3">2. Services Provided</h2>
          <p className="mb-2 text-sm leading-relaxed">SM Data Sub provides the following services:</p>
          <ul className="list-disc pl-5 mb-4 text-sm space-y-1">
            <li>Airtime purchase for MTN, Airtel, Glo, and 9mobile (minimum ₦100)</li>
            <li>Mobile data bundle purchase across all major Nigerian networks</li>
            <li>Electricity bill payment (prepaid and postpaid) for all Nigerian distribution companies</li>
            <li>Cable TV subscription for DSTV, GOTV, and Startimes</li>
            <li>Examination pin purchase for WAEC, NECO, and JAMB</li>
            <li>Digital wallet management with virtual bank account funding</li>
            <li>Cashback rewards on eligible purchases</li>
            <li>Referral bonus program</li>
            <li>Peer-to-peer wallet transfers</li>
          </ul>

          <h2 className="text-xl font-bold mb-3">3. Account Registration</h2>
          <p className="mb-4 text-sm leading-relaxed">
            You must register for an account to use the App. You agree to provide accurate, current, and complete 
            information during registration and to update such information to keep it accurate. You are responsible 
            for maintaining the confidentiality of your account credentials, transaction PIN, and biometric settings.
          </p>

          <h2 className="text-xl font-bold mb-3">4. Wallet and Payments</h2>
          <ul className="list-disc pl-5 mb-4 text-sm space-y-1">
            <li>Funds are added to your wallet via bank transfer to your assigned virtual account</li>
            <li>All purchases are deducted from your wallet balance</li>
            <li>Transaction amounts are final once processed</li>
            <li>Failed transactions will be automatically refunded to your wallet</li>
            <li>We reserve the right to reverse fraudulent transactions</li>
          </ul>

          <h2 className="text-xl font-bold mb-3">5. Prohibited Activities</h2>
          <ul className="list-disc pl-5 mb-4 text-sm space-y-1">
            <li>Attempting to manipulate wallet balances or exploit system vulnerabilities</li>
            <li>Using the App for money laundering or fraudulent activities</li>
            <li>Creating multiple accounts for the purpose of abusing referral bonuses</li>
            <li>Accessing the App through unauthorized means</li>
            <li>Interfering with the App's security features</li>
          </ul>

          <h2 className="text-xl font-bold mb-3">6. Account Suspension and Termination</h2>
          <p className="mb-4 text-sm leading-relaxed">
            We reserve the right to suspend or terminate your account if we detect unauthorized activity, 
            violation of these terms, or suspicious behavior. Blocked users will be notified of the reason 
            for suspension and may contact support for resolution.
          </p>

          <h2 className="text-xl font-bold mb-3">7. Limitation of Liability</h2>
          <p className="mb-4 text-sm leading-relaxed">
            SM Data Sub acts as an intermediary for service delivery. We are not liable for delays or failures 
            caused by third-party service providers (network operators, electricity companies, cable TV providers). 
            Our liability is limited to the value of the transaction in question.
          </p>

          <h2 className="text-xl font-bold mb-3">8. Contact</h2>
          <ul className="list-none mb-4 text-sm space-y-2">
            <li><strong>Company:</strong> Sir Smarewa Ltd (RC: 9198148)</li>
            <li><strong>Email:</strong> smdatasub.ng@gmail.com</li>
            <li><strong>Website:</strong> www.smdatasub.com.ng</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
