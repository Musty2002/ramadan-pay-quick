import { MobileLayout } from '@/components/layout/MobileLayout';
import { 
  Wifi, 
  Phone, 
  Zap, 
  Tv, 
  Gift,
  BookOpen,
  Coins,
  ChevronRight,
  Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const services = [
  { 
    icon: Phone, 
    label: 'Airtime', 
    description: 'Recharge your line',
    path: '/airtime', 
    color: 'bg-green-100 text-green-600' 
  },
  { 
    icon: Wifi, 
    label: 'Data', 
    description: 'Buy data bundles',
    path: '/data', 
    color: 'bg-purple-100 text-purple-600' 
  },
  { 
    icon: Zap, 
    label: 'Electricity', 
    description: 'Pay electricity bills',
    path: '/electricity', 
    color: 'bg-yellow-100 text-yellow-600' 
  },
  { 
    icon: Tv, 
    label: 'TV Subscription', 
    description: 'DSTV, GOTV, Startimes',
    path: '/tv', 
    color: 'bg-red-100 text-red-600' 
  },
  { 
    icon: BookOpen, 
    label: 'Exam Pin', 
    description: 'WAEC, NECO, JAMB pins',
    path: '/exam-pin', 
    color: 'bg-indigo-100 text-indigo-600' 
  },
  { 
    icon: Coins, 
    label: 'Cashback', 
    description: 'Earn rewards on purchases',
    path: '/cashback', 
    color: 'bg-orange-100 text-orange-600' 
  },
  { 
    icon: Gift, 
    label: 'Refer & Earn', 
    description: 'Earn ₦200 per referral',
    path: '/referral', 
    color: 'bg-pink-100 text-pink-600' 
  },
  { 
    icon: Trophy, 
    label: 'Reseller Promo', 
    description: 'Best reseller rewards',
    path: '/reseller-promo', 
    color: 'bg-amber-100 text-amber-600' 
  },
];

export default function Services() {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <div className="safe-area-top px-4 py-6">
        <h1 className="text-xl font-bold text-foreground mb-6">All Services</h1>

        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          {services.map(({ icon: Icon, label, description, path, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="w-full bg-card rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}