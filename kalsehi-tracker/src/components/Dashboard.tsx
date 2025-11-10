import { useEffect, useState } from 'react';
import { KalshiService } from '../lib/kalshi';
import { Market } from '../types';
import { MarketCard } from './MarketCard';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Dashboard() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadMarkets = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Load markets from cache first for faster display
      const { data: cachedMarkets, error: cacheError } = await supabase
        .from('market_cache')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(12);

      if (!cacheError && cachedMarkets && cachedMarkets.length > 0) {
        const marketList = cachedMarkets.map(cm => ({
          ...cm.market_data,
          volume_24h: cm.volume_24h,
          price_change_24h: cm.price_change_24h
        }));
        setMarkets(marketList);
      } else {
        // Fallback: Try to load from Kalshi API directly
        try {
          const response = await KalshiService.getMarkets({ limit: 12, status: 'active' });
          if (response && response.markets) {
            setMarkets(response.markets);
          }
        } catch (apiErr) {
          console.error('Kalshi API error:', apiErr);
        }
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to load markets');
      console.error('Error loading markets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarkets();
  }, []);

  const filteredMarkets = markets.filter(market => {
    const matchesSearch = market.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         market.ticker?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || market.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-gray-400">
            Pantau dan kelola market prediksi Kalshi Anda
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari market..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md bg-gray-900 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md bg-gray-900 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="settled">Settled</option>
            </select>

            <button
              onClick={loadMarkets}
              className="rounded-md bg-gray-900 p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-500" />
              <p className="mt-2 text-gray-400">Memuat markets...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-800 bg-red-900 bg-opacity-20 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredMarkets.length === 0 && (
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-12 text-center">
            <Filter className="mx-auto h-12 w-12 text-gray-600" />
            <h3 className="mt-4 text-lg font-medium text-white">
              Tidak ada market ditemukan
            </h3>
            <p className="mt-2 text-gray-400">
              {searchQuery || statusFilter !== 'all'
                ? 'Coba ubah filter atau pencarian Anda'
                : 'Belum ada market tersedia'}
            </p>
          </div>
        )}

        {/* Markets Grid */}
        {!loading && !error && filteredMarkets.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMarkets.map((market) => (
              <MarketCard
                key={market.ticker}
                market={market}
                onViewDetails={(ticker) => console.log('View details:', ticker)}
                onAddToWatchlist={(ticker) => console.log('Add to watchlist:', ticker)}
              />
            ))}
          </div>
        )}

        {/* Info Message */}
        {!loading && !error && markets.length > 0 && (
          <div className="mt-8 rounded-lg border border-blue-800 bg-blue-900 bg-opacity-20 p-4">
            <p className="text-sm text-blue-300">
              Menampilkan {filteredMarkets.length} dari {markets.length} markets. Data di-update otomatis setiap 5 menit.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
