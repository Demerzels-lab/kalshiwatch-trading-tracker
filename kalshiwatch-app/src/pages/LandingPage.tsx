import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, HelpCircle, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import OnboardingTour from '../components/OnboardingTour';

interface Trader {
  wallet_address: string;
  name: string;
  pseudonym: string;
  total_pnl: number;
  monthly_pnl?: number;
  total_trades: number;
  profile_image: string;
  performance_score?: number;
}

export default function LandingPage() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    fetchRecommendedTraders();
    
    // Show onboarding for first-time visitors
    const hasSeenOnboarding = localStorage.getItem('kalshiwatch_onboarding_seen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  function handleCompleteOnboarding() {
    localStorage.setItem('kalshiwatch_onboarding_seen', 'true');
    setShowOnboarding(false);
  }

  useEffect(() => {
    fetchRecommendedTraders();
  }, []);

  async function fetchRecommendedTraders() {
    try {
      const { data, error } = await supabase.functions.invoke('get-recommended-traders');
      
      if (error) throw error;
      
      if (data?.data) {
        setTraders(data.data.slice(0, 7));
      }
    } catch (error) {
      console.error('Error fetching traders:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {showOnboarding && <OnboardingTour onComplete={handleCompleteOnboarding} />}
      
      <header className="p-6 md:p-8">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              Kalshiwatch
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  to="/watchlist" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Watchlist
                </Link>
                <Link 
                  to="/alerts" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Alerts
                </Link>
                <Link 
                  to="/settings" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Settings
                </Link>
                <Link 
                  to="/how-it-works" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  How It Works
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/how-it-works" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="hidden md:inline">How It Works</span>
                </Link>
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Show tutorial"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span className="hidden md:inline">Help</span>
                </button>
                <Link 
                  to="/auth" 
                  className="px-6 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg font-semibold transition-colors"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8">
            Kalshiwatch
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 md:mb-12">
            Track Kalshi traders and get instant telegram bot alerts
          </p>
          <Link 
            to="/auth"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Get started
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="w-full max-w-6xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Recommended traders
          </h3>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg p-6 border border-muted/20 animate-pulse">
                  <div className="h-6 bg-muted/20 rounded mb-4"></div>
                  <div className="h-4 bg-muted/20 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {traders.map((trader) => (
                <TraderCard key={trader.wallet_address} trader={trader} />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="p-6 md:p-8 text-center">
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <a 
            href="https://x.com/kalshiwatch" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            X (Twitter)
          </a>
          <span>•</span>
          <a 
            href="https://t.me/kalshiwatch_bot" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Telegram
          </a>
        </div>
      </footer>
    </div>
  );
}

function TraderCard({ trader }: { trader: Trader }) {
  const formatPnL = (pnl: number) => {
    if (pnl >= 1000000) return `$${(pnl / 1000000).toFixed(2)}M`;
    if (pnl >= 1000) return `$${(pnl / 1000).toFixed(0)}K`;
    return `$${pnl.toFixed(0)}`;
  };

  const getPerformanceBadge = (score?: number) => {
    if (!score) return null;
    if (score >= 95) return { text: 'Hottest', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
    if (score >= 85) return { text: 'Consistent', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
    if (score >= 75) return { text: 'Stable', color: 'bg-green-500/10 text-green-500 border-green-500/20' };
    return { text: 'Active', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
  };

  const badge = getPerformanceBadge(trader.performance_score);

  return (
    <div className="bg-card rounded-lg p-6 border border-muted/20 hover:border-primary/50 transition-colors relative">
      {badge && (
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
          {badge.text}
        </div>
      )}
      
      <Link to={`/profile/${trader.wallet_address}`} className="block mb-4">
        <div className="flex items-center gap-3 mb-3">
          {trader.profile_image && (
            <img 
              src={trader.profile_image} 
              alt={trader.pseudonym || trader.name}
              className="w-10 h-10 rounded-full"
            />
          )}
          <h4 className="text-xl font-semibold hover:text-primary transition-colors">
            {trader.pseudonym || trader.name}
          </h4>
        </div>
      </Link>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total PnL</span>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-foreground font-bold">
              {formatPnL(trader.total_pnl)}
            </span>
          </div>
        </div>
        
        {trader.monthly_pnl !== undefined && trader.monthly_pnl > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Monthly PnL</span>
            <span className="text-primary font-semibold">
              +{formatPnL(trader.monthly_pnl)}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-muted/20">
        <p className="text-sm text-muted-foreground">
          {trader.total_trades} trades
        </p>
        
        <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md text-sm font-semibold transition-colors">
          Watch
        </button>
      </div>
    </div>
  );
}
