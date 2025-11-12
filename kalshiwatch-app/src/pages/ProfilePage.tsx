// @ts-nocheck
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ExternalLink, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { walletAddress } = useParams<{ walletAddress: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isWatching, setIsWatching] = useState(false);
  const [watchLoading, setWatchLoading] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      fetchTraderProfile(walletAddress);
      if (user) {
        checkWatchStatus();
      }
    }
  }, [walletAddress, user]);

  async function fetchTraderProfile(wallet: string) {
    try {
      const { data, error } = await supabase.functions.invoke('get-trader-profile', {
        body: { wallet }
      });

      if (error) throw error;

      if (data?.data) {
        setProfileData(data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkWatchStatus() {
    if (!user || !walletAddress) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('check-is-watched', {
        body: { wallet_address: walletAddress }
      });

      if (error) throw error;
      setIsWatching(data?.is_watched || false);
    } catch (error) {
      console.error('Error checking watch status:', error);
    }
  }

  async function handleWatchToggle() {
    if (!user) {
      navigate('/auth');
      return;
    }

    setWatchLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      if (isWatching) {
        // Remove from watchlist
        const { error } = await supabase.functions.invoke('remove-from-watchlist', {
          body: { wallet_address: walletAddress }
        });

        if (error) throw error;
        setIsWatching(false);
        toast.success('Trader successfully removed from watchlist!');
      } else {
        // Add to watchlist
        const { error } = await supabase.functions.invoke('add-to-watchlist', {
          body: { wallet_address: walletAddress }
        });

        if (error) throw error;
        setIsWatching(true);
        toast.success('Trader successfully added to watchlist!');
      }
    } catch (error: any) {
      console.error('Error toggling watch:', error);
      toast.error('Failed to change watch status: ' + error.message);
    } finally {
      setWatchLoading(false);
    }
  }

  const formatPnL = (pnl: number) => {
    if (!pnl) return '$0';
    if (pnl >= 1000000) return `$${(pnl / 1000000).toFixed(1)}M`;
    if (pnl >= 1000) return `$${(pnl / 1000).toFixed(1)}K`;
    return `$${pnl.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading trader profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Trader Not Found</h2>
          <Link to="/" className="text-primary hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const trader = profileData.profile;

  return (
    <div className="min-h-screen">
      <header className="p-6 md:p-8 border-b border-muted/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl md:text-3xl font-bold text-primary">
            Kalshiwatch
          </Link>
          <Link 
            to="/" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        <div className="bg-card rounded-lg p-6 md:p-8 mb-8 border border-muted/20">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {trader.profile_image && (
              <img 
                src={trader.profile_image} 
                alt={trader.pseudonym || trader.name}
                className="w-20 h-20 rounded-full bg-muted"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {trader.pseudonym || trader.name}
              </h1>
              {trader.bio && <p className="text-muted-foreground">{trader.bio}</p>}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleWatchToggle}
                disabled={watchLoading}
                className={`px-6 py-3 rounded-md font-semibold transition-colors disabled:opacity-50 ${
                  isWatching 
                    ? 'bg-muted hover:bg-muted/80 text-foreground' 
                    : 'bg-primary hover:bg-primary-hover text-primary-foreground'
                }`}
              >
                {watchLoading ? 'Loading...' : isWatching ? 'Watching' : 'Watch'}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search trader by address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-muted/20 rounded-lg pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <StatCard label="Current Holdings" value={formatPnL(trader.current_holdings)} />
          <StatCard label="Biggest Win" value={formatPnL(trader.biggest_win)} />
          <StatCard label="Total Trades" value={trader.total_trades || 0} />
          <StatCard label="Joined Platform" value={trader.join_date ? new Date(trader.join_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'} />
          <StatCard label="Total PnL (All History)" value={formatPnL(trader.total_pnl)} highlight />
          <StatCard label="Monthly PnL (Past Month)" value={formatPnL(trader.monthly_pnl || 0)} highlight />
        </div>

        {/* Top Profitable Trades Section */}
        {profileData.topProfitableTrades && profileData.topProfitableTrades.length > 0 ? (
          <div className="bg-card rounded-lg p-6 md:p-8 mb-8 border border-muted/20">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Top Profitable Trades
            </h2>
            <div className="space-y-3">
              {profileData.topProfitableTrades.map((trade: any, index: number) => (
                <div 
                  key={trade.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-background rounded-lg border border-muted/20 hover:border-primary/50 transition-colors gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-muted text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        trade.outcome === 'Win' 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {trade.outcome}
                      </span>
                      {trade.confidence_level && (
                        <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
                          {trade.confidence_level} Confidence
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold mb-1 text-foreground">{trade.market}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {trade.trade_date && (
                        <span>
                          {new Date(trade.trade_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      )}
                      {trade.position_size && (
                        <>
                          <span>•</span>
                          <span>Position: {formatPnL(trade.position_size)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold text-xl ${
                      trade.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {trade.profit_loss >= 0 ? '+' : ''}{formatPnL(trade.profit_loss)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg p-6 md:p-8 mb-8 border border-muted/20">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Top Profitable Trades
            </h2>
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground">
                No trading history recorded yet
              </p>
              <p className="text-muted-foreground max-w-md mx-auto">
                This trader has no trading history data yet. Trading history will be displayed after the trader makes their first transaction.
              </p>
            </div>
          </div>
        )}

        {profileData.pnlHistory && profileData.pnlHistory.length > 0 && (
          <div className="bg-card rounded-lg p-6 md:p-8 mb-8 border border-muted/20">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              PnL History
            </h2>
            {profileData.pnlHistory.length === 1 ? (
              <div className="text-center py-12 space-y-3">
                <div className="text-4xl font-bold text-primary">
                  {formatPnL(profileData.pnlHistory[0].value)}
                </div>
                <p className="text-muted-foreground">
                  This trader just started trading. Complete history data will be available over time.
                </p>
                <p className="text-sm text-muted-foreground">
                  Total PnL saat ini: {formatPnL(trader.total_pnl)} dari {trader.total_trades} trade(s)
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
              <LineChart data={profileData.pnlHistory}>
                <XAxis 
                  dataKey="date" 
                  stroke="#A3A3A3"
                  style={{ fontSize: '14px' } as any}
                />
                <YAxis 
                  stroke="#A3A3A3"
                  style={{ fontSize: '14px' } as any}
                  tickFormatter={(value: any) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F1F1F', 
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    color: '#FFFFFF'
                  } as any}
                  formatter={(value: any) => [`$${(value / 1000).toFixed(1)}K`, 'PnL']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            )}
          </div>
        )}

        {profileData.topTrades && profileData.topTrades.length > 0 && (
          <div className="bg-card rounded-lg p-6 md:p-8 border border-muted/20">
            <h2 className="text-2xl font-bold mb-6">
              Top 10 Profitable Trades
            </h2>
            <div className="space-y-4">
              {profileData.topTrades.slice(0, 10).map((trade: any, index: number) => (
                <div 
                  key={index}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-background rounded-lg border border-muted/20 hover:border-primary/50 transition-colors gap-3"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{trade.market_title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Outcome: <span className="text-foreground">{trade.outcome}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-primary font-bold text-lg">
                      {formatPnL(trade.profit_loss)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="p-6 md:p-8 text-center border-t border-muted/20 mt-12">
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

interface StatCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

function StatCard({ label, value, highlight }: StatCardProps) {
  return (
    <div className={`bg-background rounded-lg p-4 md:p-6 border ${
      highlight ? 'border-primary/50' : 'border-muted/20'
    }`}>
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <p className={`text-xl md:text-2xl font-bold ${
        highlight ? 'text-primary' : 'text-foreground'
      }`}>
        {value}
      </p>
    </div>
  );
}
