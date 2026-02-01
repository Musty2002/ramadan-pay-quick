import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '@/assets/sm-data-logo.jpeg';
import { 
  Wifi, 
  Phone, 
  Zap, 
  Tv, 
  Send, 
  Gift, 
  Shield, 
  Clock, 
  Wallet,
  Star,
  ChevronRight,
  CheckCircle2,
  Users,
  Smartphone,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const services = [
  { icon: Wifi, label: 'Data Bundles', description: 'Get affordable data bundles for all networks - MTN, Airtel, Glo, 9Mobile at unbeatable prices.', color: 'bg-purple-100 text-purple-600' },
  { icon: Phone, label: 'Airtime Top-up', description: 'Instant airtime recharge for all Nigerian networks. Fast, reliable, and always available.', color: 'bg-green-100 text-green-600' },
  { icon: Zap, label: 'Electricity Bills', description: 'Pay your NEPA/electricity bills instantly. Supports all distribution companies nationwide.', color: 'bg-yellow-100 text-yellow-600' },
  { icon: Tv, label: 'TV Subscriptions', description: 'Renew your DStv, GOtv, and Startimes subscriptions with ease and get instant activation.', color: 'bg-red-100 text-red-600' },
  { icon: Send, label: 'Money Transfer', description: 'Send money to any bank account in Nigeria instantly with zero hidden charges.', color: 'bg-blue-100 text-blue-600' },
  { icon: Gift, label: 'Cashback Rewards', description: 'Earn cashback on every transaction. Refer friends and earn ₦100 per referral.', color: 'bg-pink-100 text-pink-600' },
];

const features = [
  { icon: Shield, title: 'Bank-Level Security', description: 'Your transactions are protected with 256-bit SSL encryption and advanced fraud detection systems.' },
  { icon: Clock, title: 'Instant Delivery', description: 'Get your data, airtime, and bill payments delivered within seconds, 24/7, 365 days a year.' },
  { icon: Wallet, title: 'Lowest Prices Guaranteed', description: 'We offer the most competitive rates in the market. Save up to 10% on every purchase.' },
  { icon: Gift, title: 'Rewarding Referral Program', description: 'Earn ₦100 for every friend you refer when they purchase at least 1GB of data.' },
];



const Index = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-3">
              <img src={logo} alt="SM Data App" className="w-10 h-10 lg:w-12 lg:h-12 rounded-full" />
              <span className="font-bold text-xl lg:text-2xl text-secondary">SM Data App</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <button onClick={() => scrollToSection('services')} className="text-muted-foreground hover:text-foreground transition-colors">
                Services
              </button>
              <button onClick={() => navigate('/webabout')} className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </button>
              <button onClick={() => navigate('/webpricing')} className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </button>
              <button onClick={() => navigate('/webcontact')} className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </button>
            </nav>

            {/* Login buttons removed - users should download the mobile app */}

            {/* Mobile menu button */}
            <button 
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border">
              <nav className="flex flex-col gap-4">
                <button onClick={() => scrollToSection('services')} className="text-left text-muted-foreground hover:text-foreground">
                  Services
                </button>
                <button onClick={() => navigate('/webabout')} className="text-left text-muted-foreground hover:text-foreground">
                  About
                </button>
                <button onClick={() => navigate('/webpricing')} className="text-left text-muted-foreground hover:text-foreground">
                  Pricing
                </button>
                <button onClick={() => navigate('/webcontact')} className="text-left text-muted-foreground hover:text-foreground">
                  Contact
                </button>
                {/* Mobile login buttons removed - users should download the app */}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4 fill-current" />
                Nigeria's Most Trusted Data Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Buy Data & Airtime at the <span className="text-primary">Cheapest Rates</span> in Nigeria
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                Save money on data, airtime, electricity bills, and TV subscriptions. 
                Join over 50,000 Nigerians who trust SM Data App for fast, reliable, and secure payments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6" onClick={() => scrollToSection('services')}>
                  View Services
                </Button>
              </div>
              
              {/* App Store Badges */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
                <a 
                  href="https://play.google.com/store" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-foreground text-background px-5 py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] opacity-80">GET IT ON</p>
                    <p className="text-sm font-semibold -mt-0.5">Google Play</p>
                  </div>
                </a>
                <a 
                  href="https://apps.apple.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-foreground text-background px-5 py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] opacity-80">Download on the</p>
                    <p className="text-sm font-semibold -mt-0.5">App Store</p>
                  </div>
                </a>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* iPhone-style Phone mockup */}
                <div className="relative w-72 lg:w-80 h-[580px] lg:h-[640px]">
                  {/* Phone outer frame */}
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800 rounded-[3rem] shadow-2xl" />
                  
                  {/* Phone inner bezel */}
                  <div className="absolute inset-[3px] bg-gradient-to-b from-gray-700 to-gray-800 rounded-[2.8rem]" />
                  
                  {/* Screen area */}
                  <div className="absolute inset-[12px] bg-card rounded-[2.4rem] overflow-hidden">
                    {/* Dynamic Island / Notch */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
                      <div className="w-28 h-8 bg-black rounded-full flex items-center justify-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-800 ring-1 ring-gray-700" />
                        <div className="w-2 h-2 rounded-full bg-gray-700" />
                      </div>
                    </div>
                    
                    {/* Status bar */}
                    <div className="h-12 bg-card flex items-end justify-between px-8 pb-1">
                      <span className="text-xs font-semibold text-foreground">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="flex gap-[2px]">
                          <div className="w-[3px] h-2 bg-foreground rounded-sm" />
                          <div className="w-[3px] h-3 bg-foreground rounded-sm" />
                          <div className="w-[3px] h-4 bg-foreground rounded-sm" />
                          <div className="w-[3px] h-3 bg-foreground/40 rounded-sm" />
                        </div>
                        <div className="ml-1 w-6 h-3 border border-foreground rounded-sm relative">
                          <div className="absolute inset-[2px] right-[4px] bg-green-500 rounded-sm" />
                          <div className="absolute -right-[2px] top-1/2 -translate-y-1/2 w-[2px] h-1.5 bg-foreground rounded-r-sm" />
                        </div>
                      </div>
                    </div>
                    
                    {/* App content */}
                    <div className="p-5 pt-2">
                      <div className="flex items-center gap-3 mb-5">
                        <img src={logo} alt="Logo" className="w-12 h-12 rounded-full" />
                        <div>
                          <p className="font-semibold text-foreground">SM Data App</p>
                          <p className="text-sm text-muted-foreground">Welcome back!</p>
                        </div>
                      </div>
                      <div className="gradient-primary rounded-2xl p-5 text-white mb-5">
                        <p className="text-sm opacity-80">Wallet Balance</p>
                        <p className="text-3xl font-bold">₦125,000</p>
                        <p className="text-xs opacity-70 mt-1">+₦2,500 cashback earned</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-3">Quick Services</p>
                      <div className="grid grid-cols-3 gap-3">
                        {services.slice(0, 6).map(({ icon: Icon, label, color }) => (
                          <div key={label} className="flex flex-col items-center p-2">
                            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-1.5`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] text-foreground text-center">{label.split(' ')[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Home indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/30 rounded-full" />
                  </div>
                  
                  {/* Side buttons */}
                  <div className="absolute -left-[2px] top-28 w-[3px] h-8 bg-gray-700 rounded-l-sm" />
                  <div className="absolute -left-[2px] top-44 w-[3px] h-14 bg-gray-700 rounded-l-sm" />
                  <div className="absolute -left-[2px] top-64 w-[3px] h-14 bg-gray-700 rounded-l-sm" />
                  <div className="absolute -right-[2px] top-36 w-[3px] h-20 bg-gray-700 rounded-r-sm" />
                </div>
                
                {/* Floating cards */}
                <div className="absolute -right-8 lg:-right-16 top-24 bg-card rounded-2xl p-4 shadow-xl border border-border animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">2GB Data Delivered!</p>
                      <p className="text-xs text-muted-foreground">Just now</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -left-8 lg:-left-16 bottom-40 bg-card rounded-2xl p-4 shadow-xl border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                      <Gift className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">₦100 Cashback</p>
                      <p className="text-xs text-muted-foreground">From referral</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 lg:py-28 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold mb-3">OUR SERVICES</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Everything You Need, One App</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From data bundles to bill payments, SM Data App offers all the services you need to stay connected and manage your utilities.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map(({ icon: Icon, label, description, color }) => (
              <div 
                key={label}
                className="bg-card rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-transparent hover:border-primary/20"
              >
                <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl text-foreground mb-3">{label}</h3>
                <p className="text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-primary font-semibold mb-3">WHY CHOOSE US</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Why Over 50,000 Nigerians Trust <span className="text-secondary">SM Data App</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                We've built a platform that prioritizes your security, convenience, and savings. Here's what sets us apart from the competition.
              </p>
              <div className="space-y-6">
                {features.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex gap-5">
                    <div className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center flex-shrink-0">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground mb-2">{title}</h3>
                      <p className="text-muted-foreground">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-5">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 h-48 flex flex-col justify-end">
                  <Smartphone className="w-12 h-12 text-primary mb-3" />
                  <p className="font-bold text-lg text-foreground">Easy to Use</p>
                  <p className="text-sm text-muted-foreground">Simple, intuitive interface</p>
                </div>
                <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-3xl p-8 h-64 flex flex-col justify-end">
                  <Users className="w-12 h-12 text-secondary mb-3" />
                  <p className="font-bold text-lg text-foreground">Trusted by Thousands</p>
                  <p className="text-sm text-muted-foreground">50,000+ active users</p>
                </div>
              </div>
              <div className="space-y-5 pt-10">
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-3xl p-8 h-64 flex flex-col justify-end">
                  <Wallet className="w-12 h-12 text-yellow-600 mb-3" />
                  <p className="font-bold text-lg text-foreground">Save More Money</p>
                  <p className="text-sm text-muted-foreground">Up to 10% savings</p>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-3xl p-8 h-48 flex flex-col justify-end">
                  <Clock className="w-12 h-12 text-purple-600 mb-3" />
                  <p className="font-bold text-lg text-foreground">24/7 Support</p>
                  <p className="text-sm text-muted-foreground">Always here to help</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold mb-3">HOW IT WORKS</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Get Started in 3 Simple Steps</h2>
            <p className="text-lg text-muted-foreground">It takes less than 2 minutes to start saving money</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center relative">
              <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold shadow-lg">
                1
              </div>
              <h3 className="font-bold text-xl text-foreground mb-3">Create Your Account</h3>
              <p className="text-muted-foreground">
                Sign up in seconds using your phone number or email. No complicated forms or lengthy verification.
              </p>
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
            </div>
            <div className="text-center relative">
              <div className="w-20 h-20 rounded-full gradient-accent flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold shadow-lg">
                2
              </div>
              <h3 className="font-bold text-xl text-foreground mb-3">Fund Your Wallet</h3>
              <p className="text-muted-foreground">
                Add money to your wallet instantly using bank transfer, card payment, or USSD. Multiple options available.
              </p>
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-secondary/50 to-transparent" />
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-yellow-500 flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold shadow-lg">
                3
              </div>
              <h3 className="font-bold text-xl text-foreground mb-3">Start Saving Money</h3>
              <p className="text-muted-foreground">
                Buy data, airtime, and pay bills at the lowest rates. Earn cashback on every transaction!
              </p>
            </div>
          </div>
          {/* Create account button removed - users should download the app */}
        </div>
      </section>


      {/* Pricing Preview */}
      <section id="pricing" className="py-20 lg:py-28 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold mb-3">PRICING</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Unbeatable Data Prices</h2>
            <p className="text-lg text-muted-foreground">Compare our prices and see why thousands choose SM Data App</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border text-center">
              <p className="text-sm text-muted-foreground mb-2">MTN Data</p>
              <p className="text-4xl font-bold text-foreground mb-1">&nbsp;</p>
              <p className="text-sm text-muted-foreground mb-4">for 1GB (30 days)</p>
              <p className="text-xs text-green-600 font-medium">Save up to 10%</p>
            </div>
            <div className="bg-card rounded-2xl p-8 shadow-sm border-2 border-primary text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <p className="text-sm text-muted-foreground mb-2">Airtel Data</p>
              <p className="text-4xl font-bold text-foreground mb-1">&nbsp;</p>
              <p className="text-sm text-muted-foreground mb-4">for 1GB (30 days)</p>
              <p className="text-xs text-green-600 font-medium">Save up to 12%</p>
            </div>
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border text-center">
              <p className="text-sm text-muted-foreground mb-2">Glo Data</p>
              <p className="text-4xl font-bold text-foreground mb-1">&nbsp;</p>
              <p className="text-sm text-muted-foreground mb-4">for 1GB (30 days)</p>
              <p className="text-xs text-green-600 font-medium">Save up to 15%</p>
            </div>
          </div>
          {/* View prices button removed */}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="gradient-primary rounded-3xl p-10 lg:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTItNCAxLTQgMnYyYzAgMSAyIDQgNCA0czQtMSA0LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative">
              <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                Ready to Start Saving Money?
              </h2>
              <p className="text-lg lg:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join over 50,000 Nigerians who save money every day with SM Data App. Create your free account today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-transparent border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                  onClick={() => scrollToSection('services')}
                >
                  Learn More
                </Button>
              </div>
              
              {/* App Store Badges */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a 
                  href="https://play.google.com/store" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-white text-foreground px-5 py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] opacity-70">GET IT ON</p>
                    <p className="text-sm font-semibold -mt-0.5">Google Play</p>
                  </div>
                </a>
                <a 
                  href="https://apps.apple.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-white text-foreground px-5 py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] opacity-70">Download on the</p>
                    <p className="text-sm font-semibold -mt-0.5">App Store</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <img src={logo} alt="SM Data App" className="w-12 h-12 rounded-full" />
                <span className="font-bold text-2xl">SM Data App</span>
              </div>
              <p className="opacity-70 mb-6 max-w-sm">
                Nigeria's most trusted platform for affordable data, airtime, and bill payments. Save money on every transaction.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center cursor-pointer hover:bg-background/20 transition-colors">
                  <span className="text-sm">𝕏</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center cursor-pointer hover:bg-background/20 transition-colors">
                  <span className="text-sm">in</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center cursor-pointer hover:bg-background/20 transition-colors">
                  <span className="text-sm">fb</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-5">Services</h4>
              <ul className="space-y-3 opacity-70">
                <li className="hover:opacity-100 cursor-pointer transition-opacity">Data Bundles</li>
                <li className="hover:opacity-100 cursor-pointer transition-opacity">Airtime Top-up</li>
                <li className="hover:opacity-100 cursor-pointer transition-opacity">Electricity Bills</li>
                <li className="hover:opacity-100 cursor-pointer transition-opacity">TV Subscriptions</li>
                <li className="hover:opacity-100 cursor-pointer transition-opacity">Money Transfer</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-5">Company</h4>
              <ul className="space-y-3 opacity-70">
                <li className="hover:opacity-100 cursor-pointer transition-opacity">About Us</li>
                <li className="hover:opacity-100 cursor-pointer transition-opacity">Contact</li>
                <li className="hover:opacity-100 cursor-pointer transition-opacity">Careers</li>
                <li className="hover:opacity-100 cursor-pointer transition-opacity">Blog</li>
                <li className="hover:opacity-100 cursor-pointer transition-opacity">Press</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-5">Support</h4>
              <ul className="space-y-3 opacity-70">
                <li className="hover:opacity-100 cursor-pointer transition-opacity">Help Center</li>
                <li className="hover:opacity-100 cursor-pointer transition-opacity">FAQs</li>
                <li onClick={() => navigate('/website/privacy-policy')} className="hover:opacity-100 cursor-pointer transition-opacity">Privacy Policy</li>
                <li className="hover:opacity-100 cursor-pointer transition-opacity">Terms of Service</li>
                <li className="hover:opacity-100 cursor-pointer transition-opacity">Refund Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="opacity-70 text-sm">© {new Date().getFullYear()} SM Data App. All rights reserved.</p>
            <div className="flex gap-6 text-sm opacity-70">
              <span className="hover:opacity-100 cursor-pointer">Privacy</span>
              <span className="hover:opacity-100 cursor-pointer">Terms</span>
              <span className="hover:opacity-100 cursor-pointer">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
