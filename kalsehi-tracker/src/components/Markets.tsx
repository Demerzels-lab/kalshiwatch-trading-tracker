import { useEffect, useState } from 'react';
import { KalshiService } from '../lib/kalshi';
import { Market } from '../types';
import { MarketCard } from './MarketCard';
import { Search, Filter, RefreshCw, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Markets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);

  const loadMarkets = async () => {
    setLoading(true);
    setError('');
    
    try {
      // First, try to sync markets from Kalshi API
      await supabase.functions.invoke('market-sync', {
        body: { sync_all: true }
      });

      // Then load from cache
      const { data: cachedMarkets, error: cacheError } = await supabase
        .from('market_cache')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(50);

      if (cacheError) throw cacheError;

      if (cachedMarkets && cachedMarkets.length > 0) {
        const marketList = cachedMarkets.map(cm => ({
          ...cm.market_data,
          volume_24h: cm.volume_24h,
          price_change_24h: cm.price_change_24h
        }));
        setMarkets(marketList);
      } else {
        // Fallback: Load directly from Kalshi API
        const response = await KalshiService.getMarkets({ limit: 50, status: 'active' });
        if (response && response.markets) {
          setMarkets(response.markets);
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
          <h1 className="text-3xl font-bold text-white">Markets</h1>
          <p className="mt-2 text-gray-400">
            Browse dan explore semua market Kalshi
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
              disabled={loading}
              className="rounded-md bg-gray-900 p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats */}
        {!loading && markets.length > 0 && (
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Markets</p>
                  <p className="mt-1 text-2xl font-bold text-white">{markets.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Markets</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {markets.filter(m => m.status === 'active').length}
                  </p>
                </div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Filtered Results</p>
                  <p className="mt-1 text-2xl font-bold text-white">{filteredMarkets.length}</p>
                </div>
                <Filter className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </div>
        )}

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
                onViewDetails={(ticker) => {
                  const m = markets.find(mk => mk.ticker === ticker);
                  if (m) setSelectedMarket(m);
                }}
              />
            ))}
          </div>
        )}

        {/* Market Detail Modal */}
        {selectedMarket && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 p-4">
            <div className="mx-auto max-w-4xl">
              <div className="rounded-lg bg-gray-900 p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedMarket.title}
                    </h2>
                    <p className="mt-1 text-gray-400">{selectedMarket.ticker}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMarket(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
                    <p className="text-sm text-gray-400">Status</p>
                    <p className="mt-1 text-lg font-semibold text-white capitalize">
                      {selectedMarket.status}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
                    <p className="text-sm text-gray-400">Volume</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {selectedMarket.volume?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
                    <p className="text-sm text-gray-400">Yes Bid</p>
                    <p className="mt-1 text-lg font-semibold text-green-400">
                      ${((selectedMarket.yes_bid || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
                    <p className="text-sm text-gray-400">Yes Ask</p>
                    <p className="mt-1 text-lg font-semibold text-red-400">
                      ${((selectedMarket.yes_ask || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-gray-800 bg-gray-950 p-4">
                  <p className="text-sm text-gray-400">Close Time</p>
                  <p className="mt-1 text-white">
                    {new Date(selectedMarket.close_time).toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <a
                    href={`https://kalshi.com/markets/${selectedMarket.ticker}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
                  >
                    Lihat di Kalshi
                  </a>
                  <button
                    onClick={() => setSelectedMarket(null)}
                    className="flex-1 rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
