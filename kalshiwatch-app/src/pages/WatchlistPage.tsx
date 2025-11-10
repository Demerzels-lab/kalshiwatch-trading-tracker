import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface WatchlistItem {
  id: string;
  trader_wallet: string;
  created_at: string;
  trader: {
    name: string;
    pseudonym: string;
    profile_image: string;
    total_pnl: number;
    total_trades: number;
    win_rate: number;
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
      
      // Get watchlist items
      const { data: watchlistData, error: watchlistError } = await supabase
        .from('watchlist')
        .select('id, trader_wallet, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (watchlistError) throw watchlistError;

      if (watchlistData && watchlistData.length > 0) {
        // Get trader details for each watchlist item
        const wallets = watchlistData.map(item => item.trader_wallet);
        const { data: tradersData, error: tradersError } = await supabase
          .from('traders')
          .select('wallet_address, name, pseudonym, profile_image, total_pnl, total_trades, win_rate')
          .in('wallet_address', wallets);

        if (tradersError) throw tradersError;

        // Merge data
        const mergedData = watchlistData.map(watchItem => ({
          ...watchItem,
          trader: tradersData?.find(t => t.wallet_address === watchItem.trader_wallet) || {
            name: 'Unknown',
            pseudonym: 'Unknown',
            profile_image: '',
            total_pnl: 0,
            total_trades: 0,
            win_rate: 0
          }
        }));

        setWatchlist(mergedData);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveFromWatchlist(watchlistId: string) {
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', watchlistId);

      if (error) throw error;

      // Update local state
      setWatchlist(prev => prev.filter(item => item.id !== watchlistId));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
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
            <p className="mt-4 text-muted-foreground">Memuat watchlist...</p>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground mb-4">
              Watchlist Anda masih kosong
            </p>
            <Link 
              to="/" 
              className="inline-block bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Jelajahi Trader
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlist.map((item) => (
              <div 
                key={item.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
              >
                <Link to={`/profile/${item.trader_wallet}`}>
                  <div className="flex items-start gap-4 mb-4">
                    {item.trader.profile_image ? (
                      <img 
                        src={item.trader.profile_image} 
                        alt={item.trader.name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {item.trader.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.trader.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{item.trader.pseudonym}</p>
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
                    onClick={() => handleRemoveFromWatchlist(item.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </button>
                  <Link
                    to={`/profile/${item.trader_wallet}`}
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
