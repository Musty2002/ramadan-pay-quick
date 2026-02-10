import { 
  Wifi, 
  Phone, 
  Zap, 
  Tv, 
  Gift,
  BookOpen,
  Coins,
  Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const services = [
  { icon: Phone, label: 'Airtime', path: '/airtime', color: 'bg-green-100 text-green-600' },
  { icon: Wifi, label: 'Data', path: '/data', color: 'bg-purple-100 text-purple-600' },
  { icon: Zap, label: 'Electricity', path: '/electricity', color: 'bg-yellow-100 text-yellow-600' },
  { icon: Tv, label: 'TV Sub', path: '/tv', color: 'bg-red-100 text-red-600' },
  { icon: BookOpen, label: 'Exam Pin', path: '/exam-pin', color: 'bg-indigo-100 text-indigo-600' },
  { icon: Coins, label: 'Cashback', path: '/cashback', color: 'bg-orange-100 text-orange-600' },
  { icon: Gift, label: 'Refer & Earn', path: '/referral', color: 'bg-pink-100 text-pink-600' },
  { icon: Trophy, label: 'Reseller Promo', path: '/reseller-promo', color: 'bg-amber-100 text-amber-600' },
];

export function ServicesGrid() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">Services</h3>
      <div className="grid grid-cols-4 md:grid-cols-4 gap-4 md:gap-6">
        {services.map(({ icon: Icon, label, path, color }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${color} flex items-center justify-center transition-transform group-hover:scale-105`}>
              <Icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-xs md:text-sm text-foreground font-medium text-center">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}