import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface WatchlistItem {
  id: string;
  wallet_address: string;
  added_at: string;
  trader: {
    wallet_address: string;
    name: string;
    pseudonym: string;
    profile_image: string;
    total_pnl: number;
    monthly_pnl: number;
    total_trades: number;
    win_rate: number;
    performance_score: number;
  };
}

export default function WatchlistPage() {
  const { user, signOut } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    }
  }, [user]);

  async function fetchWatchlist() {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      // Use edge function to get watchlist with trader details
      const { data, error } = await supabase.functions.invoke('get-user-watchlist');

      if (error) throw error;

      if (data?.data) {
        setWatchlist(data.data);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveFromWatchlist(walletAddress: string) {
    try {
      const { error } = await supabase.functions.invoke('remove-from-watchlist', {
        body: { wallet_address: walletAddress }
      });

      if (error) throw error;

      // Update local state
      setWatchlist(prev => prev.filter(item => item.wallet_address !== walletAddress));
      toast.success('Trader successfully removed from watchlist!');
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast.error('Failed to remove from watchlist');
    }
  }

  const formatPnL = (pnl: number) => {
    if (!pnl) return '$0';
    if (pnl >= 1000000) return `$${(pnl / 1000000).toFixed(1)}M`;
    if (pnl >= 1000) return `$${(pnl / 1000).toFixed(1)}K`;
    return `$${pnl.toFixed(0)}`;
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border p-6 md:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl md:text-3xl font-bold text-primary">
            Kalshiwatch
          </Link>
          <div className="flex items-center gap-4">
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
            <button
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Watchlist Saya</h1>
          <p className="text-muted-foreground">
            Trader yang Anda pantau
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading watchlist...</p>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground mb-4">
              Your watchlist is empty
            </p>
            <Link 
              to="/" 
              className="inline-block bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Explore Traders
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlist.map((item) => (
              <div 
                key={item.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
              >
                <Link to={`/profile/${item.wallet_address}`}>
                  <div className="flex items-start gap-4 mb-4">
                    {item.trader.profile_image ? (
                      <img 
                        src={item.trader.profile_image} 
                        alt={item.trader.pseudonym || item.trader.name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {(item.trader.pseudonym || item.trader.name || 'T').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.trader.pseudonym || item.trader.name || 'Unknown'}</h3>
                      <p className="text-sm text-muted-foreground truncate">{item.trader.wallet_address.slice(0, 10)}...</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total PnL</span>
                      <span className={item.trader.total_pnl >= 0 ? 'text-primary' : 'text-red-500'}>
                        {formatPnL(item.trader.total_pnl)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Trades</span>
                      <span>{item.trader.total_trades}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Win Rate</span>
                      <span>{(item.trader.win_rate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </Link>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRemoveFromWatchlist(item.wallet_address)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                  <Link
                    to={`/profile/${item.wallet_address}`}
                    className="flex items-center justify-center px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
