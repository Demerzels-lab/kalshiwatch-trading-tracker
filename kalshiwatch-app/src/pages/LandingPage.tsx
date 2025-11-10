import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Trader {
  wallet_address: string;
  name: string;
  pseudonym: string;
  total_pnl: number;
  total_trades: number;
  profile_image: string;
}

export default function LandingPage() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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
              </>
            ) : (
              <Link 
                to="/auth" 
                className="px-6 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg font-semibold transition-colors"
              >
                Login
              </Link>
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
            Track Polymarket traders and get instant alerts
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
            href="https://t.me/kalshiwatch" 
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
    if (pnl >= 1000000) return `+$${(pnl / 1000000).toFixed(1)}M`;
    if (pnl >= 1000) return `+$${(pnl / 1000).toFixed(1)}K`;
    return `+$${pnl.toFixed(0)}`;
  };

  return (
    <div className="bg-card rounded-lg p-6 border border-muted/20 hover:border-primary/50 transition-colors">
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
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-foreground font-medium">
            {formatPnL(trader.total_pnl)}
          </span>
        </div>
        
        <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md text-sm font-semibold transition-colors">
          Watch
        </button>
      </div>
      
      <p className="text-sm text-muted-foreground mt-2">
        {trader.total_trades} trades
      </p>
    </div>
  );
}
