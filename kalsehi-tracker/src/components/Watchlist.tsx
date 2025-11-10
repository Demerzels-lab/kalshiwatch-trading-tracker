import { useState, useEffect } from 'react';
import { Market } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Star, Trash2, Plus } from 'lucide-react';

export function Watchlist() {
  const { user } = useAuth();
  const [watchlistItems, setWatchlistItems] = useState<any[]>([]);
  const [marketData, setMarketData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [addingTicker, setAddingTicker] = useState('');
  const [addingNotes, setAddingNotes] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadWatchlist();
    }
  }, [user]);

  const loadWatchlist = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch watchlist items
      const { data: items, error } = await supabase
        .from('market_watchlist')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('added_at', { ascending: false });

      if (error) throw error;

      setWatchlistItems(items || []);

      // Fetch market data for each item
      if (items && items.length > 0) {
        const tickers = items.map(item => item.market_ticker);
        const { data: markets } = await supabase
          .from('market_cache')
          .select('*')
          .in('market_ticker', tickers);

        if (markets) {
          const marketMap: Record<string, any> = {};
          markets.forEach(m => {
            marketMap[m.market_ticker] = m;
          });
          setMarketData(marketMap);
        }
      }
    } catch (error: any) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async () => {
    if (!user || !addingTicker.trim()) return;

    try {
      const { error } = await supabase
        .from('market_watchlist')
        .insert({
          user_id: user.id,
          market_ticker: addingTicker.toUpperCase(),
          notes: addingNotes,
          is_active: true
        });

      if (error) throw error;

      setAddingTicker('');
      setAddingNotes('');
      setShowAddModal(false);
      loadWatchlist();
    } catch (error: any) {
      console.error('Error adding to watchlist:', error);
      alert('Gagal menambahkan ke watchlist: ' + error.message);
    }
  };

  const removeFromWatchlist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('market_watchlist')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      loadWatchlist();
    } catch (error: any) {
      console.error('Error removing from watchlist:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <Star className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-4 text-lg font-medium text-white">
            Login Diperlukan
          </h3>
          <p className="mt-2 text-gray-400">
            Silakan login untuk menggunakan fitur watchlist
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Watchlist</h1>
            <p className="mt-2 text-gray-400">
              Pantau market favorit Anda
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Tambah Market
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Memuat watchlist...</p>
          </div>
        ) : watchlistItems.length === 0 ? (
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-12 text-center">
            <Star className="mx-auto h-12 w-12 text-gray-600" />
            <h3 className="mt-4 text-lg font-medium text-white">
              Watchlist Kosong
            </h3>
            <p className="mt-2 text-gray-400">
              Tambahkan market untuk mulai memantau
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {watchlistItems.map(item => {
              const market = marketData[item.market_ticker];
              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-gray-800 bg-gray-900 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">
                        {item.market_ticker}
                      </h3>
                      {market && (
                        <p className="mt-1 text-sm text-gray-400">
                          {market.market_data?.title || 'Loading...'}
                        </p>
                      )}
                      {item.notes && (
                        <p className="mt-2 text-sm text-gray-300">
                          Note: {item.notes}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-500">
                        Ditambahkan: {new Date(item.added_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromWatchlist(item.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="w-full max-w-md rounded-lg bg-gray-900 p-6">
              <h2 className="mb-4 text-xl font-bold text-white">
                Tambah ke Watchlist
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Market Ticker
                  </label>
                  <input
                    type="text"
                    value={addingTicker}
                    onChange={(e) => setAddingTicker(e.target.value)}
                    placeholder="Contoh: INXD-24DEC31"
                    className="mt-1 w-full rounded-md bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Catatan (opsional)
                  </label>
                  <textarea
                    value={addingNotes}
                    onChange={(e) => setAddingNotes(e.target.value)}
                    placeholder="Tambahkan catatan..."
                    className="mt-1 w-full rounded-md bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addToWatchlist}
                    className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Tambah
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setAddingTicker('');
                      setAddingNotes('');
                    }}
                    className="flex-1 rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
                  >
                    Batal
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
